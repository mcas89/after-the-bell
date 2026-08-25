import { CLUE_IDS } from '../data/clues'
import { useFragmentsStore } from '../state/useFragmentsStore'
import { useGameStore } from '../state/useGameStore'

export function canDescendPatio() {
  if (useGameStore.getState().flags.officeFallSeen) return true
  return Boolean(useFragmentsStore.getState().entries[CLUE_IDS.fall]?.discovered)
}
