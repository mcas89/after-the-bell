import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { duckMusic, holdAmbient, playSfx, SFX } from '../audio/mixer'
import { cameraController } from '../camera/cameraController'
import { CLUE_IDS } from '../data/clues'
import { useExamineStore } from '../examine/useExamineStore'
import { updateClue } from '../fragments/discoverClue'
import { playerMotion } from '../player/playerMotion'
import { useFragmentsStore } from '../state/useFragmentsStore'
import { saveManager } from '../state/gameSaveManager'
import { useGameStore } from '../state/useGameStore'
import { useHallwayStore } from './useHallwayStore'

function clockUpdated() {
  return (useFragmentsStore.getState().entries[CLUE_IDS.time0317]?.stage ?? 0) >= 1
}

function facingTheGirl() {
  return Math.cos(playerMotion.yaw) > 0.42
}

let scareTimers: number[] = []
let scareStarting = false

function clearScareTimers() {
  for (const id of scareTimers) window.clearTimeout(id)
  scareTimers = []
}

export function beginGirlScare() {
  const hall = useHallwayStore.getState()
  if (hall.seenMysteriousGirl || scareStarting) return
  if (useGameStore.getState().interactionState === 'girl-glimpse') return
  saveManager.checkpoint('Antes da silhueta')
  scareStarting = true

  holdAmbient(12800)
  duckMusic(0.08, 11600)
  playSfx(SFX.scareMoment, 0.96)
  if (!hall.girlVisible) hall.showGirl()

  playerMotion.faceYaw = 0
  useGameStore.getState().setInteractionState('girl-glimpse')

  scareTimers.push(
    window.setTimeout(() => {
      useHallwayStore.getState().speak('Hei, espera!', 2100)
    }, 400),
  )
  scareTimers.push(
    window.setTimeout(() => {
      useHallwayStore.getState().speak('Quem é você?', 2200)
    }, 2600),
  )
  scareTimers.push(
    window.setTimeout(() => {
      useHallwayStore.getState().startGirlWalk()
    }, 3200),
  )
  scareTimers.push(
    window.setTimeout(() => {
      useHallwayStore.getState().speak('Não vai!!', 2300)
    }, 6200),
  )
  scareTimers.push(
    window.setTimeout(() => {
      useHallwayStore.getState().hideGirl()
    }, 10800),
  )
  scareTimers.push(
    window.setTimeout(() => {
      endGirlScare()
    }, 11800),
  )
}

export function endGirlScare() {
  clearScareTimers()
  scareStarting = false
  playerMotion.faceYaw = null
  const hall = useHallwayStore.getState()
  hall.hideGirl()
  if (!hall.seenMysteriousGirl) hall.markGirl()
  cameraController.restoreGameplayCamera()
}

export function HallwayDirector() {
  const primed = useRef(false)
  const originAt = useRef(0)
  const facingFor = useRef(0)
  const clockHandled = useRef(false)

  useFrame((_, delta) => {
    const game = useGameStore.getState()
    const hall = useHallwayStore.getState()

    if (game.currentRoom !== 'hallway') {
      primed.current = false
      facingFor.current = 0
      if (game.interactionState === 'girl-glimpse') endGirlScare()
      else if (hall.girlVisible) hall.hideGirl()
      return
    }

    if (!hall.enteredCorridor) hall.markEntered()

    if (!hall.seenMysteriousGirl && !hall.girlVisible && game.interactionState !== 'girl-glimpse') {
      hall.showGirl()
    }

    if (!primed.current) {
      originAt.current = performance.now()
      primed.current = true
    }

    if (game.interactionState !== 'gameplay' && game.interactionState !== 'girl-glimpse') return

    const examining = useExamineStore.getState().examiningId
    const canScare =
      primed.current &&
      !hall.seenMysteriousGirl &&
      game.interactionState === 'gameplay' &&
      !examining &&
      performance.now() - originAt.current > 500

    if (canScare && facingTheGirl()) {
      facingFor.current += delta
      if (facingFor.current > 0.7) beginGirlScare()
    } else if (game.interactionState === 'gameplay') {
      facingFor.current = 0
    }

    if (examining === 'hall-clock' && !clockHandled.current && !clockUpdated()) {
      clockHandled.current = true
      const progress = useFragmentsStore.getState().entries[CLUE_IDS.time0317]
      if (progress?.discovered && (progress.stage ?? 0) < 1) {
        updateClue(CLUE_IDS.time0317, {
          stage: 1,
          description: 'Não é só o relógio da sala. O corredor também está parado em 03:17.',
        })
      }
    }
  })

  return null
}
