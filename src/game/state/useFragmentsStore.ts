import { create } from 'zustand'
import {
  DEDUCTIONS,
  getClueDef,
  resolveClue,
  type ClueProgress,
  type ClueView,
} from '../data/clues'
import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { refreshControlLock } from '../systems/controlLock'
import { saveManager } from './gameSaveManager'
import { useGameStore } from './useGameStore'

export type FragmentToast = {
  title: string
}

type FragmentsState = {
  open: boolean
  selectedId: string | null
  entries: Record<string, ClueProgress>
  toast: FragmentToast | null
  pulseAt: number
  pendingToast: FragmentToast | null
  discover: (id: string, silent?: boolean) => boolean
  update: (id: string, patch: { title?: string; description?: string; stage?: number }) => boolean
  markRead: (id: string) => void
  select: (id: string | null) => void
  openJournal: () => void
  closeJournal: () => void
  toggleJournal: () => void
  clearToast: () => void
  flushPendingToast: () => void
}

let toastTimer = 0
let pulseTimer = 0

function syncCollected(entries: Record<string, ClueProgress>) {
  useGameStore.setState({
    collectedClues: Object.entries(entries)
      .filter(([, progress]) => progress.discovered)
      .map(([id]) => id),
  })
}

function setJournalOpen(open: boolean) {
  useGameStore.getState().setInteractionState(open ? 'viewing-fragments' : 'gameplay')
  refreshControlLock()
}

function showToast(set: (partial: Partial<FragmentsState>) => void, toast: FragmentToast) {
  window.clearTimeout(toastTimer)
  set({ toast, pulseAt: Date.now() })
  toastTimer = window.setTimeout(() => set({ toast: null }), 2600)
  window.clearTimeout(pulseTimer)
  pulseTimer = window.setTimeout(() => set({ pulseAt: 0 }), 1600)
}

export const useFragmentsStore = create<FragmentsState>((set, get) => ({
  open: false,
  selectedId: null,
  entries: {},
  toast: null,
  pulseAt: 0,
  pendingToast: null,
  discover: (id, silent = false) => {
    const def = getClueDef(id)
    if (!def) return false
    if (def.kind !== 'fragment' && def.kind !== 'deduction') return false

    const current = get().entries[id]
    if (current?.discovered) return false

    const entries = {
      ...get().entries,
      [id]: {
        discovered: true,
        read: false,
        discoveredAt: Date.now(),
        stage: 0,
      },
    }
    const view = resolveClue(def, entries[id])
    set({ entries })
    syncCollected(entries)
    saveManager.updateClues()
    if (view && !silent) {
      if (useGameStore.getState().interactionState === 'examining-object') {
        set({ pendingToast: { title: view.title } })
      } else {
        showToast(set, { title: view.title })
      }
    }
    if (def.kind === 'fragment') {
      for (const deduction of DEDUCTIONS) {
        if (get().entries[deduction.id]?.discovered) continue
        const needs = deduction.requires ?? []
        if (needs.length === 0) continue
        if (!needs.every((need) => get().entries[need]?.discovered)) continue
        get().discover(deduction.id, silent)
      }
    }
    return true
  },
  update: (id, patch) => {
    const def = getClueDef(id)
    const current = get().entries[id]
    if (!def || !current?.discovered) return false

    const stage =
      patch.stage == null ? current.stage : Math.max(0, Math.min(patch.stage, def.stages.length - 1))
    const entries = {
      ...get().entries,
      [id]: {
        ...current,
        stage,
        title: patch.title ?? current.title,
        description: patch.description ?? current.description,
        read: false,
      },
    }
    set({ entries })
    syncCollected(entries)
    saveManager.updateClues()
    return true
  },
  markRead: (id) => {
    const current = get().entries[id]
    if (!current?.discovered || current.read) return
    const entries = { ...get().entries, [id]: { ...current, read: true } }
    set({ entries })
    saveManager.updateClues()
  },
  select: (selectedId) => {
    if (selectedId) get().markRead(selectedId)
    set({ selectedId })
  },
  openJournal: () => {
    const game = useGameStore.getState()
    if (!game.prologueDone || game.interactionState !== 'gameplay') return
    if (isPhoneOpen(usePhoneStore.getState().ui)) return
    if (get().open) return
    set({ open: true })
    setJournalOpen(true)
  },
  closeJournal: () => {
    if (!get().open) return
    set({ open: false, selectedId: null })
    setJournalOpen(false)
  },
  toggleJournal: () => {
    if (get().open) get().closeJournal()
    else get().openJournal()
  },
  clearToast: () => {
    window.clearTimeout(toastTimer)
    set({ toast: null, pendingToast: null })
  },
  flushPendingToast: () => {
    const pending = get().pendingToast
    if (!pending) return
    set({ pendingToast: null })
    showToast(set, pending)
  },
}))

export function listDiscoveredClues(): ClueView[] {
  const { entries } = useFragmentsStore.getState()
  const views: ClueView[] = []
  for (const [id, progress] of Object.entries(entries)) {
    const def = getClueDef(id)
    if (!def) continue
    const view = resolveClue(def, progress)
    if (view) views.push(view)
  }
  return views.sort((a, b) => a.discoveredAt - b.discoveredAt)
}

export function hasUnreadFragments() {
  return Object.values(useFragmentsStore.getState().entries).some(
    (entry) => entry.discovered && !entry.read,
  )
}

export function isFragmentsOpen() {
  return useFragmentsStore.getState().open
}
