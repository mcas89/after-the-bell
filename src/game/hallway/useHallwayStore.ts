import { create } from 'zustand'
import { CLUE_IDS } from '../data/clues'
import { discoverClue } from '../fragments/discoverClue'
import type { ObjectiveId } from '../data/objectives'
import type { SavedStory } from '../state/gameSaveManager'
import { saveManager } from '../state/gameSaveManager'
import { useFragmentsStore } from '../state/useFragmentsStore'
import { useGameStore } from '../state/useGameStore'
import { refreshControlLock } from '../systems/controlLock'
import { HALL_PROPS } from './hallwayLayout'

export type LabDoorPhase = 'ajar' | 'opening' | 'open'

type HallwayState = {
  enteredCorridor: boolean
  seenDoor203: boolean
  left203Area: boolean
  door203Disappeared: boolean
  noticed203: boolean
  foundSecretary: boolean
  seenMysteriousGirl: boolean
  objective: ObjectiveId | null
  line: string | null
  prompt: string | null
  girlVisible: boolean
  girlWalking: boolean
  girlZ: number
  chapterCardUntil: number
  rattleUntil: number
  labDoor: LabDoorPhase
  hydrate: (story: SavedStory) => void
  markEntered: () => void
  markSeen203: () => void
  markLeft203: () => void
  vanish203: () => void
  markNoticed203: () => void
  markSecretary: () => void
  markGirl: () => void
  setObjective: (id: ObjectiveId) => void
  speak: (line: string, ms?: number) => void
  setPrompt: (prompt: string | null) => void
  showGirl: () => void
  startGirlWalk: () => void
  hideGirl: () => void
  showChapterCard: () => void
  rattleHandle: () => void
  beginLabOpen: () => boolean
  finishLabOpen: () => void
}

let lineTimer = 0
let cardTimer = 0

export const useHallwayStore = create<HallwayState>((set, get) => ({
  enteredCorridor: false,
  seenDoor203: false,
  left203Area: false,
  door203Disappeared: false,
  noticed203: false,
  foundSecretary: false,
  seenMysteriousGirl: false,
  objective: null,
  line: null,
  prompt: null,
  girlVisible: false,
  girlWalking: false,
  girlZ: HALL_PROPS.girlStand,
  chapterCardUntil: 0,
  rattleUntil: 0,
  labDoor: 'ajar',
  hydrate: (story) => {
    const entered = Boolean(story.enteredCorridor)
    const noticed = Boolean(useFragmentsStore.getState().entries[CLUE_IDS.door203]?.discovered)
    set({
      enteredCorridor: entered,
      seenDoor203: Boolean(story.seenDoor203),
      left203Area: Boolean(story.door203Disappeared || story.seenDoor203),
      door203Disappeared: Boolean(story.door203Disappeared),
      noticed203: noticed,
      foundSecretary: Boolean(story.foundSecretary),
      seenMysteriousGirl: Boolean(story.seenMysteriousGirl),
      objective: (story.currentObjective as ObjectiveId | null) ?? (story.seenMysteriousGirl ? 'find-girl' : null),
      line: null,
      prompt: null,
      girlVisible: false,
      girlWalking: false,
      girlZ: HALL_PROPS.girlStand,
      chapterCardUntil: 0,
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
  markSeen203: () => {
    if (get().seenDoor203) return
    set({ seenDoor203: true })
    saveManager.updateStoryState({ seenDoor203: true })
  },
  markLeft203: () => {
    if (!get().seenDoor203 || get().left203Area) return
    set({ left203Area: true })
  },
  vanish203: () => {
    if (get().door203Disappeared) return
    set({ door203Disappeared: true })
    saveManager.updateStoryState({ door203Disappeared: true })
  },
  markNoticed203: () => {
    if (get().noticed203) return
    set({ noticed203: true })
  },
  markSecretary: () => {
    if (get().foundSecretary) return
    set({ foundSecretary: true })
    saveManager.updateStoryState({ foundSecretary: true })
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
  showChapterCard: () => {
    window.clearTimeout(cardTimer)
    set({ chapterCardUntil: performance.now() + 4200 })
    cardTimer = window.setTimeout(() => set({ chapterCardUntil: 0 }), 4200)
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
