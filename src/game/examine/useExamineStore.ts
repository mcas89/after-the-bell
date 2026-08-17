import { create } from 'zustand'
import { getExamineEntry } from '../data/examineContent'
import { discoverClue } from '../fragments/discoverClue'
import type { InteractionState } from '../state/useGameStore'
import { useGameStore } from '../state/useGameStore'
import { useFragmentsStore } from '../state/useFragmentsStore'
import { refreshControlLock } from '../systems/controlLock'

type ExamineState = {
  nearbyIds: string[]
  hoveredId: string | null
  examiningId: string | null
  setNearby: (ids: string[]) => void
  setHovered: (id: string | null) => void
  inspect: (id: string) => void
  stopInspect: () => void
}

function setInteraction(interactionState: InteractionState) {
  useGameStore.getState().setInteractionState(interactionState)
  refreshControlLock()
}

export const useExamineStore = create<ExamineState>((set, get) => ({
  nearbyIds: [],
  hoveredId: null,
  examiningId: null,
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
    set({ examiningId: id, hoveredId: null })
    setInteraction('examining-object')
    const fragmentId = getExamineEntry(id)?.fragmentId
    if (fragmentId) discoverClue(fragmentId)
  },
  stopInspect: () => {
    if (useGameStore.getState().interactionState !== 'examining-object') return
    set({ examiningId: null, hoveredId: null })
    setInteraction('gameplay')
    useFragmentsStore.getState().flushPendingToast()
  },
}))
