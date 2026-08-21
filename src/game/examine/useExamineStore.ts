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
  detailId: string | null
  setNearby: (ids: string[]) => void
  setHovered: (id: string | null) => void
  inspect: (id: string) => void
  inspectDetail: (id: string) => void
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
  detailId: null,
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
    set({ examiningId: id, hoveredId: null, detailId: null })
    setInteraction('examining-object')
    const fragmentId = getExamineEntry(id)?.fragmentId
    if (fragmentId) discoverClue(fragmentId)
  },
  inspectDetail: (id) => {
    if (useGameStore.getState().interactionState !== 'examining-object') return
    if (get().detailId === id) return
    set({ detailId: id })
  },
  stopInspect: () => {
    if (useGameStore.getState().interactionState !== 'examining-object') return
    if (get().detailId) {
      set({ detailId: null })
      return
    }
    const closedId = get().examiningId
    set({ examiningId: null, hoveredId: null, detailId: null })
    setInteraction('gameplay')
    useFragmentsStore.getState().flushPendingToast()
    if (closedId === 'office-window') {
      const game = useGameStore.getState()
      if (game.flags.marinaFolderSeen && !game.flags.officeWindowNote) game.addFlag('officeWindowNote')
      else if (game.flags.officeWindowNote && !game.flags.officeFallSeen) game.addFlag('officeFallSeen')
    }
  },
}))
