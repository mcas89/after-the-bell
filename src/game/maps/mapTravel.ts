import { create } from 'zustand'
import type { RoomId } from '../data/rooms'
import { getRoom } from '../data/rooms'
import { playerMotion } from '../player/playerMotion'
import { saveManager } from '../state/gameSaveManager'
import { useGameStore } from '../state/useGameStore'
import { refreshControlLock } from '../systems/controlLock'
import { getSpawn, type SpawnPose } from './spawns'

export type { SpawnPose }

let pendingSpawn: SpawnPose | null = null

export function takePendingSpawn() {
  const spawn = pendingSpawn
  pendingSpawn = null
  return spawn
}

export function peekPendingSpawn() {
  return pendingSpawn
}

export function applyRoomLoad(room: RoomId, spawn: SpawnPose, entryPoint: string) {
  pendingSpawn = spawn
  playerMotion.x = spawn.x
  playerMotion.z = spawn.z
  playerMotion.yaw = spawn.yaw
  playerMotion.speed = 0
  const def = getRoom(room)
  if (playerMotion.x < def.bounds.minX || playerMotion.x > def.bounds.maxX) {
    playerMotion.x = spawn.x
  }
  useGameStore.getState().setRoom(room, entryPoint)
  refreshControlLock()
}

type Phase = 'idle' | 'out' | 'hold' | 'in'

type TravelState = {
  fade: number
  busy: boolean
  phase: Phase
  hold: number
  pending: { room: RoomId; entryPoint: string } | null
}

export const useMapTravelStore = create<TravelState>(() => ({
  fade: 0,
  busy: false,
  phase: 'idle',
  hold: 0,
  pending: null,
}))

const FADE_OUT = 0.32
const HOLD = 0.16
const FADE_IN = 0.44

export function requestMapTravel(room: RoomId, entryPoint: string) {
  const travel = useMapTravelStore.getState()
  const game = useGameStore.getState()
  if (travel.busy) return
  if (game.currentRoom === room && game.entryPoint === entryPoint) return
  saveManager.save()
  game.setInteractionState('map-travel')
  refreshControlLock()
  useMapTravelStore.setState({
    busy: true,
    phase: 'out',
    hold: HOLD,
    pending: { room, entryPoint },
  })
}

export function stepMapTravel(dt: number) {
  const travel = useMapTravelStore.getState()
  if (travel.phase === 'idle') return

  if (travel.phase === 'out') {
    const fade = Math.min(1, travel.fade + dt / FADE_OUT)
    if (fade < 1) {
      useMapTravelStore.setState({ fade })
      return
    }
    const pending = travel.pending
    if (pending) {
      applyRoomLoad(pending.room, getSpawn(pending.room, pending.entryPoint), pending.entryPoint)
      saveManager.save()
    }
    useMapTravelStore.setState({ fade: 1, phase: 'hold', hold: HOLD, pending: null })
    return
  }

  if (travel.phase === 'hold') {
    const hold = travel.hold - dt
    if (hold > 0) {
      useMapTravelStore.setState({ hold })
      return
    }
    useMapTravelStore.setState({ phase: 'in', hold: 0 })
    return
  }

  const fade = Math.max(0, travel.fade - dt / FADE_IN)
  if (fade > 0) {
    useMapTravelStore.setState({ fade })
    return
  }

  useMapTravelStore.setState({ fade: 0, busy: false, phase: 'idle', pending: null })
  const game = useGameStore.getState()
  if (game.interactionState === 'map-travel') game.setInteractionState('gameplay')
  refreshControlLock()
}
