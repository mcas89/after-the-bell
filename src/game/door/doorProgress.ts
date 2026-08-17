import { CLUES } from '../data/clues'
import { useFragmentsStore } from '../state/useFragmentsStore'

export const CLASSROOM_FRAGMENT_IDS = CLUES.filter(
  (clue) => clue.kind === 'fragment' && clue.chapter === 'classroom1',
).map((clue) => clue.id)

export const DOOR_REQUIRED_COUNT = 5

export function classroomFragmentCount() {
  const { entries } = useFragmentsStore.getState()
  return CLASSROOM_FRAGMENT_IDS.filter((id) => entries[id]?.discovered).length
}

export function hasRequiredDoorClues() {
  return classroomFragmentCount() >= DOOR_REQUIRED_COUNT
}
