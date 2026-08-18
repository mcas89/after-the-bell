import { useFragmentsStore } from '../state/useFragmentsStore'

export const HALL_PASSAGE_FRAGMENTS = 10

export function discoveredFragmentCount(
  entries = useFragmentsStore.getState().entries,
) {
  let n = 0
  for (const progress of Object.values(entries)) {
    if (progress.discovered) n += 1
  }
  return n
}

export function hasDarkHallClues(
  entries = useFragmentsStore.getState().entries,
) {
  return discoveredFragmentCount(entries) >= HALL_PASSAGE_FRAGMENTS
}
