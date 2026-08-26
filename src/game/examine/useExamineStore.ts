import { create } from 'zustand'
import { getExaminePages, type ExamineEntry } from '../data/examineContent'
import { discoverClue } from '../fragments/discoverClue'
import type { InteractionState } from '../state/useGameStore'
import { useGameStore } from '../state/useGameStore'
import { useFragmentsStore } from '../state/useFragmentsStore'
import { refreshControlLock } from '../systems/controlLock'

type ExamineState = {
  nearbyIds: string[]
  hoveredId: string | null
  examiningId: string | null
  detailId: string | null
  pageIndex: number
  setNearby: (ids: string[]) => void
  setHovered: (id: string | null) => void
  inspect: (id: string) => void
  inspectDetail: (id: string) => void
  shiftPage: (delta: number) => void
  stopInspect: () => void
}

function setInteraction(interactionState: InteractionState) {
  useGameStore.getState().setInteractionState(interactionState)
  refreshControlLock()
}

function applyPage(entry: ExamineEntry | undefined) {
  if (!entry) return
  if (entry.fragmentId) discoverClue(entry.fragmentId)
  if (entry.flag) useGameStore.getState().addFlag(entry.flag)
}

export const useExamineStore = create<ExamineState>((set, get) => ({
  nearbyIds: [],
  hoveredId: null,
  examiningId: null,
  detailId: null,
  pageIndex: 0,
  setNearby: (nearbyIds) => {
    const same =
      nearbyIds.length === get().nearbyIds.length &&
      nearbyIds.every((id, i) => id === get().nearbyIds[i])
    if (!same) set({ nearbyIds })
  },
  setHovered: (hoveredId) => {
    if (get().hoveredId === hoveredId) return
    set({ hoveredId })
  },
  inspect: (id) => {
    if (useGameStore.getState().interactionState !== 'gameplay') return
    set({ examiningId: id, hoveredId: null, detailId: null, pageIndex: 0 })
    setInteraction('examining-object')
    applyPage(getExaminePages(id)[0])
  },
  inspectDetail: (id) => {
    if (useGameStore.getState().interactionState !== 'examining-object') return
    if (get().detailId === id) return
    set({ detailId: id })
  },
  shiftPage: (delta) => {
    const id = get().examiningId
    if (!id || useGameStore.getState().interactionState !== 'examining-object') return
    const pages = getExaminePages(id)
    if (pages.length < 2) return
    const next = Math.max(0, Math.min(pages.length - 1, get().pageIndex + delta))
    if (next === get().pageIndex) return
    set({ pageIndex: next })
    applyPage(pages[next])
  },
  stopInspect: () => {
    if (useGameStore.getState().interactionState !== 'examining-object') return
    if (get().detailId) {
      set({ detailId: null })
      return
    }
    const closedId = get().examiningId
    set({ examiningId: null, hoveredId: null, detailId: null, pageIndex: 0 })
    setInteraction('gameplay')
    useFragmentsStore.getState().flushPendingToast()
    if (closedId === 'lib-drawer') useGameStore.getState().addFlag('libDrawerSeen')
  },
}))
