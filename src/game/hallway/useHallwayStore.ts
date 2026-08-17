import { create } from 'zustand'
import { CLUE_IDS } from '../data/clues'
import type { ObjectiveId } from '../data/objectives'
import type { SavedStory } from '../state/gameSaveManager'
import { saveManager } from '../state/gameSaveManager'
import { useFragmentsStore } from '../state/useFragmentsStore'
import { useGameStore } from '../state/useGameStore'
import { playerMotion } from '../player/playerMotion'
import { HALL_PROPS } from './hallwayLayout'

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
  girlZ: number
  chapterCardUntil: number
  rattleUntil: number
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
  hideGirl: () => void
  showChapterCard: () => void
  rattleHandle: () => void
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
  girlZ: 18.5,
  chapterCardUntil: 0,
  rattleUntil: 0,
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
      objective: (story.currentObjective as ObjectiveId | null) ?? (entered ? 'explore-school' : null),
      line: null,
      prompt: null,
      girlVisible: false,
      girlZ: 18.5,
      chapterCardUntil: 0,
      rattleUntil: 0,
    })
  },
  markEntered: () => {
    if (get().enteredCorridor) return
    set({ enteredCorridor: true, objective: 'explore-school' })
    useGameStore.getState().addFlag('enteredCorridor')
    saveManager.updateStoryState({ enteredCorridor: true, currentObjective: 'explore-school' })
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
      girlZ: Math.min(HALL_PROPS.darkFrom - 2.4, Math.max(13.1, playerMotion.z + 8.6)),
    })
  },
  hideGirl: () => {
    if (!get().girlVisible) return
    set({ girlVisible: false })
  },
  showChapterCard: () => {
    window.clearTimeout(cardTimer)
    set({ chapterCardUntil: performance.now() + 4200 })
    cardTimer = window.setTimeout(() => set({ chapterCardUntil: 0 }), 4200)
  },
  rattleHandle: () => {
    set({ rattleUntil: performance.now() + 420 })
  },
}))
