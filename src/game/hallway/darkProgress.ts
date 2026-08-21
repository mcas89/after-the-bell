import { getClueDef } from '../data/clues'
import { useFragmentsStore } from '../state/useFragmentsStore'

export const HALL_PASSAGE_FRAGMENTS = 10

export function discoveredFragmentCount(
  entries = useFragmentsStore.getState().entries,
) {
  let n = 0
  for (const [id, progress] of Object.entries(entries)) {
    if (!progress.discovered) continue
    const kind = getClueDef(id)?.kind
    if (kind !== 'fragment' && kind !== 'deduction') continue
    n += 1
  }
  return n
}

export function hasDarkHallClues(
  entries = useFragmentsStore.getState().entries,
) {
  return discoveredFragmentCount(entries) >= HALL_PASSAGE_FRAGMENTS
}
