import { create } from 'zustand'
import { CLUE_IDS } from '../data/clues'
import { discoverClue } from '../fragments/discoverClue'
import type { ObjectiveId } from '../data/objectives'
import type { SavedStory } from '../state/gameSaveManager'
import { saveManager } from '../state/gameSaveManager'
import { useGameStore } from '../state/useGameStore'
import { refreshControlLock } from '../systems/controlLock'
import { HALL_PROPS } from './hallwayLayout'

export type LabDoorPhase = 'ajar' | 'opening' | 'open'

type HallwayState = {
  enteredCorridor: boolean
  seenMysteriousGirl: boolean
  objective: ObjectiveId | null
  line: string | null
  prompt: string | null
  girlVisible: boolean
  girlWalking: boolean
  girlZ: number
  rattleUntil: number
  labDoor: LabDoorPhase
  hydrate: (story: SavedStory) => void
  markEntered: () => void
  markGirl: () => void
  setObjective: (id: ObjectiveId) => void
  speak: (line: string, ms?: number) => void
  setPrompt: (prompt: string | null) => void
  showGirl: () => void
  startGirlWalk: () => void
  hideGirl: () => void
  rattleHandle: () => void
  beginLabOpen: () => boolean
  finishLabOpen: () => void
}

let lineTimer = 0

export const useHallwayStore = create<HallwayState>((set, get) => ({
  enteredCorridor: false,
  seenMysteriousGirl: false,
  objective: null,
  line: null,
  prompt: null,
  girlVisible: false,
  girlWalking: false,
  girlZ: HALL_PROPS.girlStand,
  rattleUntil: 0,
  labDoor: 'ajar',
  hydrate: (story) => {
    const entered = Boolean(story.enteredCorridor)
    set({
      enteredCorridor: entered,
      seenMysteriousGirl: Boolean(story.seenMysteriousGirl),
      objective: (story.currentObjective as ObjectiveId | null) ?? (story.seenMysteriousGirl ? 'find-girl' : null),
      line: null,
      prompt: null,
      girlVisible: false,
      girlWalking: false,
      girlZ: HALL_PROPS.girlStand,
      rattleUntil: 0,
      labDoor: useGameStore.getState().flags.labDoorOpened ? 'open' : 'ajar',
    })
    if (story.seenMysteriousGirl) discoverClue(CLUE_IDS.mysteriousGirl, true)
  },
  markEntered: () => {
    if (get().enteredCorridor) return
    set({ enteredCorridor: true })
    useGameStore.getState().addFlag('enteredCorridor')
    saveManager.updateStoryState({ enteredCorridor: true })
  },
  markGirl: () => {
    if (get().seenMysteriousGirl) return
    set({ seenMysteriousGirl: true, objective: 'find-girl' })
    discoverClue(CLUE_IDS.mysteriousGirl)
    saveManager.updateStoryState({
      seenMysteriousGirl: true,
      currentObjective: 'find-girl',
    })
  },
  setObjective: (objective) => {
    set({ objective })
    saveManager.updateStoryState({ currentObjective: objective })
  },
  speak: (line, ms = 2800) => {
    window.clearTimeout(lineTimer)
    set({ line })
    lineTimer = window.setTimeout(() => set({ line: null }), ms)
  },
  setPrompt: (prompt) => {
    if (get().prompt === prompt) return
    set({ prompt })
  },
  showGirl: () => {
    if (get().girlVisible) return
    set({
      girlVisible: true,
      girlWalking: false,
      girlZ: HALL_PROPS.girlStand,
    })
  },
  startGirlWalk: () => {
    if (!get().girlVisible || get().girlWalking) return
    set({ girlWalking: true })
  },
  hideGirl: () => {
    if (!get().girlVisible) return
    set({ girlVisible: false, girlWalking: false })
  },
  rattleHandle: () => {
    set({ rattleUntil: performance.now() + 420 })
  },
  beginLabOpen: () => {
    if (get().labDoor !== 'ajar') return false
    set({ labDoor: 'opening' })
    useGameStore.getState().setInteractionState('opening-door')
    refreshControlLock()
    return true
  },
  finishLabOpen: () => {
    if (get().labDoor === 'open') return
    set({ labDoor: 'open' })
    useGameStore.getState().addFlag('labDoorOpened')
    useGameStore.getState().setInteractionState('gameplay')
    refreshControlLock()
  },
}))
