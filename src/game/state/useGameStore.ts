import { create } from 'zustand'
import type { CameraMode, CameraOverride } from '../data/cameras'
import type { RoomId } from '../data/rooms'
import { saveManager } from './gameSaveManager'

export type InteractionState =
  | 'gameplay'
  | 'examining-object'
  | 'viewing-fragments'
  | 'viewing-inventory'
  | 'door-beat'
  | 'opening-door'
  | 'girl-glimpse'
  | 'map-travel'

type GameState = {
  currentRoom: RoomId
  entryPoint: string | null
  flags: Record<string, boolean>
  collectedClues: string[]
  phoneUnlocked: boolean
  cameraMode: CameraMode
  cameraOverride: CameraOverride | null
  interactionState: InteractionState
  liviaVisible: boolean
  prologueDone: boolean
  bootScreen: 'menu' | 'playing'
  setRoom: (room: RoomId, entryPoint?: string | null) => void
  addFlag: (flag: string) => void
  collectClue: (id: string) => void
  unlockPhone: () => void
  setCameraMode: (mode: CameraMode) => void
  setCameraOverride: (override: CameraOverride | null) => void
  setInteractionState: (state: InteractionState) => void
  setLiviaVisible: (visible: boolean) => void
  finishPrologue: () => void
  enterGame: () => void
  openMenu: () => void
}

export const useGameStore = create<GameState>((set) => ({
  currentRoom: 'classroom1',
  entryPoint: null,
  flags: {},
  collectedClues: [],
  phoneUnlocked: false,
  cameraMode: 'cutscene',
  cameraOverride: null,
  interactionState: 'gameplay',
  liviaVisible: false,
  prologueDone: false,
  bootScreen: 'menu',
  setRoom: (currentRoom, entryPoint = null) => {
    set({ currentRoom, entryPoint, cameraMode: 'explore', cameraOverride: null })
    saveManager.save()
  },
  addFlag: (flag) =>
    set((state) => ({ flags: { ...state.flags, [flag]: true } })),
  collectClue: (id) =>
    set((state) =>
      state.collectedClues.includes(id)
        ? state
        : { collectedClues: [...state.collectedClues, id] },
    ),
  unlockPhone: () => set({ phoneUnlocked: true }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  setCameraOverride: (cameraOverride) => set({ cameraOverride }),
  setInteractionState: (interactionState) => set({ interactionState }),
  setLiviaVisible: (liviaVisible) => set({ liviaVisible }),
  finishPrologue: () =>
    set({
      prologueDone: true,
      liviaVisible: true,
      cameraMode: 'explore',
      cameraOverride: null,
      interactionState: 'gameplay',
    }),
  enterGame: () => set({ bootScreen: 'playing' }),
  openMenu: () => set({ bootScreen: 'menu' }),
}))
