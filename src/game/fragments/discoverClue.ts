import { getClueDef } from '../data/clues'
import { listDiscoveredClues, useFragmentsStore } from '../state/useFragmentsStore'

export function discoverClue(id: string, silent = false) {
  return useFragmentsStore.getState().discover(id, silent)
}

export function updateClue(
  id: string,
  patch: { title?: string; description?: string; stage?: number },
) {
  return useFragmentsStore.getState().update(id, patch)
}

export function getDiscoveredClues() {
  return listDiscoveredClues()
}

export function isClueDiscovered(id: string) {
  return Boolean(useFragmentsStore.getState().entries[id]?.discovered)
}

export function getClue(id: string) {
  const def = getClueDef(id)
  const progress = useFragmentsStore.getState().entries[id]
  if (!def || !progress) return null
  return { def, progress }
}

if (import.meta.env.DEV) {
  const dev = window as Window & {
    discoverClue?: typeof discoverClue
    updateClue?: typeof updateClue
  }
  dev.discoverClue = discoverClue
  dev.updateClue = updateClue
}
