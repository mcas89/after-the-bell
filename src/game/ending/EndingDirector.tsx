import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useRef } from 'react'
import { silenceWorldAudio } from '../audio/mixer'
import { discoverClue } from '../fragments/discoverClue'
import { liveOverride } from '../prologue/timeline'
import { playerMotion } from '../player/playerMotion'
import { useGameStore } from '../state/useGameStore'
import { refreshControlLock } from '../systems/controlLock'
import { ENDING_END, ENDING_INPUT, endingView, sampleEnding } from './timeline'

function applyPose(time: number) {
  const pose = sampleEnding(time)
  if (time > 3.2 && time < 40) {
    const cry = time * 0.62
    pose.lookAt = [
      pose.lookAt[0] + Math.sin(cry) * 0.018,
      pose.lookAt[1] + Math.sin(cry * 0.81) * 0.01,
      pose.lookAt[2],
    ]
    pose.roll = (pose.roll ?? 0) + Math.sin(cry * 0.37) * 0.014
    pose.blur += Math.max(0, Math.sin(cry * 0.55)) * 2.4
  }

  endingView.black = pose.black
  endingView.blur = pose.blur
  endingView.clock = pose.clock
  endingView.subtitle = pose.subtitle
  endingView.card = pose.card
  endingView.active = true
  endingView.canSkip = time >= ENDING_INPUT
  liveOverride.current = pose
  return pose
}

function beginEnding() {
  const game = useGameStore.getState()
  if (game.flags.endingPlaying) return
  game.addFlag('endingPlaying')
  game.setInteractionState('ending')
  game.setCameraMode('cutscene')
  game.setLiviaVisible(false)
  playerMotion.controlLocked = true
  silenceWorldAudio()
  refreshControlLock()
  applyPose(0)
}

function finishEnding() {
  endingView.active = false
  endingView.black = 1
  endingView.blur = 0
  endingView.clock = 0
  endingView.subtitle = null
  endingView.card = 1
  endingView.canSkip = false
  liveOverride.current = null
  useGameStore.getState().addFlag('endingDone')
  useGameStore.getState().openMenu()
  refreshControlLock()
}

export function EndingDirector() {
  const elapsed = useRef(0)
  const started = useRef(false)
  const sawHer = useRef(false)
  const room = useGameStore((s) => s.currentRoom)
  const playing = useGameStore((s) => Boolean(s.flags.endingPlaying))

  useLayoutEffect(() => {
    if (room !== 'backyard') return
    if (useGameStore.getState().flags.endingDone) return
    elapsed.current = 0
    started.current = true
    sawHer.current = false
    beginEnding()
  }, [room])

  useLayoutEffect(() => {
    if (!playing) return
    const onKey = (event: KeyboardEvent) => {
      if (!endingView.canSkip) return
      if (event.code !== 'Escape' && event.code !== 'Space' && event.code !== 'Enter') return
      elapsed.current = ENDING_END
    }
    const onTap = () => {
      if (!endingView.canSkip) return
      elapsed.current = ENDING_END
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onTap)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onTap)
    }
  }, [playing])

  useFrame((_, delta) => {
    if (!started.current) return
    if (useGameStore.getState().currentRoom !== 'backyard') return
    if (useGameStore.getState().flags.endingDone) return

    elapsed.current += Math.min(delta, 0.05)
    const pose = applyPose(elapsed.current)
    if (!sawHer.current && pose.subtitle === 'Marina.') {
      sawHer.current = true
      discoverClue('clue-body', true)
    }
    if (elapsed.current >= ENDING_END) {
      started.current = false
      finishEnding()
    }
  })

  return null
}
