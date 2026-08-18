import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { duckMusic, holdAmbient, playLoudSfx, playSfx, SFX } from '../audio/mixer'
import { roomPulse } from '../atmosphere/roomPulse'
import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { playerMotion } from '../player/playerMotion'
import { saveManager } from '../state/gameSaveManager'
import { useGameStore } from '../state/useGameStore'
import { refreshControlLock } from '../systems/controlLock'
import { hasRequiredDoorClues } from './doorProgress'
import { DOOR, doorDistance } from './doorLayout'
import { canOpenClassroomDoor, useDoorStore } from './useDoorStore'

const SCARE_AT = 0.78
const FLICKER_AT = 1.28
const AJAR_AT = 1.52
const LINE_AT = 2.05
const RELEASE_AT = 5.35

function randomDelay() {
  return 1.7 + Math.random() * 0.9
}

function yawToDoor() {
  return Math.atan2(DOOR.wallX - 0.15 - playerMotion.x, DOOR.z - playerMotion.z)
}

function doorShot() {
  return {
    position: [DOOR.wallX - 2.28, 1.56, DOOR.z + 0.82] as [number, number, number],
    lookAt: [DOOR.wallX - 0.02, 1.52, DOOR.z] as [number, number, number],
    fov: 34,
    damp: 8,
    snap: true as const,
  }
}

export function DoorDirector() {
  const wait = useRef(-1)
  const boot = useRef(1.4)
  const running = useRef(false)
  const elapsed = useRef(0)
  const ajar = useRef(false)
  const spoken = useRef(false)
  const scared = useRef(false)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.code !== 'KeyE') return
      const game = useGameStore.getState()
      if (!game.prologueDone || game.interactionState !== 'gameplay') return
      if (isPhoneOpen(usePhoneStore.getState().ui)) return
      if (!canOpenClassroomDoor()) return
      event.preventDefault()
      if (!useDoorStore.getState().beginOpen()) return
      refreshControlLock()
      playSfx(SFX.doorOpen, 0.62)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useFrame((_, delta) => {
    const game = useGameStore.getState()
    if (game.currentRoom !== 'classroom1') return
    const door = useDoorStore.getState()
    door.setNear(doorDistance(playerMotion.x, playerMotion.z) <= DOOR.reach)

    if (running.current) {
      elapsed.current += delta
      runDoorBeat(elapsed.current, game, ajar, spoken, scared, running)
      return
    }

    roomPulse.dim = 0

    if (boot.current > 0) {
      boot.current -= delta
      return
    }

    if (door.eventTriggered) {
      if (door.phase === 'closed') door.snapAjar()
      wait.current = -1
      return
    }
    if (!game.prologueDone || !hasRequiredDoorClues()) {
      wait.current = -1
      return
    }
    if (game.interactionState !== 'gameplay' || isPhoneOpen(usePhoneStore.getState().ui)) {
      wait.current = -1
      return
    }

    if (wait.current < 0) wait.current = randomDelay()
    wait.current -= delta
    if (wait.current > 0) return

    wait.current = -1
    startDoorBeat()
    running.current = true
    elapsed.current = 0
    ajar.current = false
    spoken.current = false
    scared.current = false
  })

  return null
}

function startDoorBeat() {
  const game = useGameStore.getState()
  const door = useDoorStore.getState()
  roomPulse.dim = 0
  holdAmbient(7800)
  duckMusic(0.08, 5600)
  playLoudSfx(SFX.knock, 2.8)
  playerMotion.faceYaw = yawToDoor()
  door.markEventTriggered()
  game.setInteractionState('door-beat')
  game.setCameraMode('cutscene')
  game.setCameraOverride(doorShot())
  refreshControlLock()
}

function flickerAmount(t: number) {
  if (t < FLICKER_AT) return 0
  const u = t - FLICKER_AT
  if (u < 0.06) return 1
  if (u < 0.12) return 0.2
  if (u < 0.34) return 1
  if (u < 0.62) return Math.max(0, 1 - (u - 0.34) / 0.28)
  return 0
}

function runDoorBeat(
  t: number,
  game: ReturnType<typeof useGameStore.getState>,
  ajar: { current: boolean },
  spoken: { current: boolean },
  scared: { current: boolean },
  running: { current: boolean },
) {
  const door = useDoorStore.getState()
  roomPulse.dim = flickerAmount(t)

  if (t >= SCARE_AT && !scared.current) {
    scared.current = true
    playerMotion.flinch = 1
    playSfx(SFX.scare, 0.92)
  }

  if (t >= AJAR_AT && !ajar.current) {
    ajar.current = true
    door.snapAjar()
  }

  if (t >= LINE_AT && !spoken.current) {
    spoken.current = true
    door.speak('Quem está aí?', 2800)
  }

  if (t < RELEASE_AT) return

  roomPulse.dim = 0
  playerMotion.faceYaw = null
  playerMotion.flinch = 0
  game.setCameraMode('explore')
  game.setCameraOverride(null)
  if (game.interactionState === 'door-beat') game.setInteractionState('gameplay')
  refreshControlLock()
  saveManager.save()
  running.current = false
}
