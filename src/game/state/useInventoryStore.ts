import { create } from 'zustand'
import { getItemDef } from '../data/items'
import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { refreshControlLock } from '../systems/controlLock'
import { saveManager } from './gameSaveManager'
import { useGameStore } from './useGameStore'

export type InventoryToast = {
  title: string
}

type InventoryState = {
  items: string[]
  open: boolean
  selectedId: string | null
  toast: InventoryToast | null
  pulseAt: number
  collect: (id: string) => boolean
  has: (id: string) => boolean
  select: (id: string | null) => void
  openInventory: () => void
  closeInventory: () => void
  toggleInventory: () => void
}

let toastTimer = 0
let pulseTimer = 0

function setInventoryOpen(open: boolean) {
  useGameStore.getState().setInteractionState(open ? 'viewing-inventory' : 'gameplay')
  refreshControlLock()
}

function showToast(set: (partial: Partial<InventoryState>) => void, toast: InventoryToast) {
  window.clearTimeout(toastTimer)
  set({ toast, pulseAt: Date.now() })
  toastTimer = window.setTimeout(() => set({ toast: null }), 2600)
  window.clearTimeout(pulseTimer)
  pulseTimer = window.setTimeout(() => set({ pulseAt: 0 }), 1600)
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  open: false,
  selectedId: null,
  toast: null,
  pulseAt: 0,
  collect: (id) => {
    const def = getItemDef(id)
    if (!def || get().items.includes(id)) return false
    set({ items: [...get().items, id] })
    saveManager.checkpoint(`Item · ${def.title}`)
    showToast(set, { title: def.title })
    return true
  },
  has: (id) => get().items.includes(id),
  select: (selectedId) => set({ selectedId }),
  openInventory: () => {
    const game = useGameStore.getState()
    if (!game.prologueDone || game.interactionState !== 'gameplay') return
    if (isPhoneOpen(usePhoneStore.getState().ui)) return
    if (get().items.length === 0 || get().open) return
    set({ open: true, selectedId: get().items[0] ?? null })
    setInventoryOpen(true)
  },
  closeInventory: () => {
    if (!get().open) return
    set({ open: false, selectedId: null })
    setInventoryOpen(false)
  },
  toggleInventory: () => {
    if (get().open) get().closeInventory()
    else get().openInventory()
  },
}))

export function isInventoryOpen() {
  return useInventoryStore.getState().open
}
