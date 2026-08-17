import { useInventoryStore } from '../state/useInventoryStore'

export function collectItem(id: string) {
  return useInventoryStore.getState().collect(id)
}

export function hasItem(id: string) {
  return useInventoryStore.getState().has(id)
}

if (import.meta.env.DEV) {
  window.collectItem = collectItem
}
