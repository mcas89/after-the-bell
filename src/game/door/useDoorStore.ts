import { create } from 'zustand'
import type { SavedStory } from '../state/gameSaveManager'
import { saveManager } from '../state/gameSaveManager'
import { useGameStore } from '../state/useGameStore'
import { refreshControlLock } from '../systems/controlLock'

export type DoorPhase = 'closed' | 'ajar' | 'opening' | 'open'

type DoorState = {
  phase: DoorPhase
  eventTriggered: boolean
  near: boolean
  line: string | null
  hydrate: (story: SavedStory) => void
  markEventTriggered: () => void
  snapAjar: () => void
  speak: (line: string, ms?: number) => void
  setNear: (near: boolean) => void
  beginOpen: () => boolean
  finishOpen: () => void
}

let lineTimer = 0

export const useDoorStore = create<DoorState>((set, get) => ({
  phase: 'closed',
  eventTriggered: false,
  near: false,
  line: null,
  hydrate: (story) => {
    const opened = story.classroomDoorOpened || story.doorOpened
    const triggered = story.doorEventTriggered || opened
    set({
      eventTriggered: triggered,
      phase: opened ? 'open' : triggered ? 'ajar' : 'closed',
      line: null,
    })
  },
  markEventTriggered: () => {
    if (get().eventTriggered) return
    set({ eventTriggered: true })
    useGameStore.getState().addFlag('doorEventTriggered')
    saveManager.updateStoryState({ doorEventTriggered: true })
  },
  snapAjar: () => {
    if (get().phase !== 'closed') return
    set({ phase: 'ajar' })
  },
  setNear: (near) => {
    if (get().near === near) return
    set({ near })
  },
  speak: (line, ms = 2800) => {
    window.clearTimeout(lineTimer)
    set({ line })
    lineTimer = window.setTimeout(() => set({ line: null }), ms)
  },
  beginOpen: () => {
    if (get().phase !== 'ajar') return false
    set({ phase: 'opening' })
    useGameStore.getState().setInteractionState('opening-door')
    return true
  },
  finishOpen: () => {
    if (get().phase === 'open') return
    set({ phase: 'open' })
    useGameStore.getState().addFlag('doorOpened')
    useGameStore.getState().setInteractionState('gameplay')
    saveManager.updateStoryState({ classroomDoorOpened: true, doorOpened: true })
    refreshControlLock()
  },
}))

export function canOpenClassroomDoor() {
  const game = useGameStore.getState()
  if (!game.prologueDone || game.interactionState !== 'gameplay') return false
  const door = useDoorStore.getState()
  return door.phase === 'ajar' && door.near
}
