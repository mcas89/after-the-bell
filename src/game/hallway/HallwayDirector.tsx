import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { duckMusic, holdAmbient, playSfx, SFX } from '../audio/mixer'
import { cameraController } from '../camera/cameraController'
import { CLUE_IDS } from '../data/clues'
import { updateClue } from '../fragments/discoverClue'
import { useExamineStore } from '../examine/useExamineStore'
import { playerMotion } from '../player/playerMotion'
import { useFragmentsStore } from '../state/useFragmentsStore'
import { useGameStore } from '../state/useGameStore'
import { HALL_PROPS } from './hallwayLayout'
import { useHallwayStore } from './useHallwayStore'

const WALK_BEFORE_SCARE = 2.35
const SONS_DELAY = 850
const SCARE_HOLD = 4000

function clockUpdated() {
  return (useFragmentsStore.getState().entries[CLUE_IDS.time0317]?.stage ?? 0) >= 1
}

function girlShot(playerZ: number) {
  const lookZ = Math.min(playerZ + 11.4, HALL_PROPS.darkFrom - 0.55)
  return {
    position: [0.18, 1.6, playerZ + 0.28] as [number, number, number],
    lookAt: [0.04, 1.16, lookZ] as [number, number, number],
    fov: 30,
    damp: 2.7,
  }
}

let scareTimers: number[] = []

function clearScareTimers() {
  for (const id of scareTimers) window.clearTimeout(id)
  scareTimers = []
}

export function beginGirlScare() {
  const hall = useHallwayStore.getState()
  if (hall.seenMysteriousGirl || hall.girlVisible) return

  hall.showGirl()
  hall.speak('Quem é aquela...?', 2600)
  holdAmbient(5200)
  duckMusic(0.08, 4600)
  playSfx(SFX.scareMoment, 0.94)
  useGameStore.getState().setInteractionState('girl-glimpse')
  cameraController.playCinematic(girlShot(playerMotion.z))

  scareTimers.push(
    window.setTimeout(() => {
      playSfx(SFX.scare, 0.9)
    }, SONS_DELAY),
  )
  scareTimers.push(
    window.setTimeout(() => {
      hall.markGirl()
      endGirlScare()
    }, SCARE_HOLD),
  )
}

export function endGirlScare() {
  clearScareTimers()
  useHallwayStore.getState().hideGirl()
  cameraController.restoreGameplayCamera()
}

export function HallwayDirector() {
  const primed = useRef(false)
  const originWalk = useRef(0)
  const clockHandled = useRef(false)

  useFrame(() => {
    const game = useGameStore.getState()
    const hall = useHallwayStore.getState()

    if (game.currentRoom !== 'hallway') {
      primed.current = false
      if (hall.girlVisible || game.interactionState === 'girl-glimpse') endGirlScare()
      return
    }

    if (!hall.enteredCorridor) {
      hall.markEntered()
      hall.showChapterCard()
      originWalk.current = playerMotion.distanceWalked
      primed.current = true
    } else if (!primed.current) {
      originWalk.current = playerMotion.distanceWalked
      primed.current = true
    }

    if (game.interactionState !== 'gameplay' && game.interactionState !== 'girl-glimpse') return

    const examining = useExamineStore.getState().examiningId
    if (
      primed.current &&
      !hall.seenMysteriousGirl &&
      !hall.girlVisible &&
      game.interactionState === 'gameplay' &&
      !examining &&
      hall.chapterCardUntil <= performance.now() &&
      playerMotion.distanceWalked - originWalk.current >= WALK_BEFORE_SCARE
    ) {
      beginGirlScare()
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
