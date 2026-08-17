import { useProgress } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useRef } from 'react'
import { playerMotion } from '../player/playerMotion'
import { saveManager } from '../state/gameSaveManager'
import { useGameStore } from '../state/useGameStore'
import { isAudioUnlocked } from '../audio/mixer'
import { startPrologueAudio, stopPrologueAudio, tickPrologueAudio } from './audio'
import { liveOverride, PROLOGUE_END, prologueView, samplePrologue } from './timeline'

function applyPose(time: number) {
  const pose = samplePrologue(time)

  if (time < 26) {
    const wobble = time * 0.55
    pose.lookAt = [
      pose.lookAt[0] + Math.sin(wobble) * 0.028,
      pose.lookAt[1] + Math.sin(wobble * 0.73) * 0.012,
      pose.lookAt[2],
    ]
    pose.roll = (pose.roll ?? 0) + Math.sin(wobble * 0.41) * 0.012
  }

  prologueView.black = pose.black
  prologueView.blur = pose.blur
  prologueView.clock = pose.clock
  prologueView.subtitle = pose.subtitle
  prologueView.active = time < PROLOGUE_END
  liveOverride.current = pose

  const store = useGameStore.getState()
  if (store.liviaVisible !== pose.liviaVisible) store.setLiviaVisible(pose.liviaVisible)
  return pose
}

function endPrologue() {
  playerMotion.controlLocked = false
  prologueView.active = false
  prologueView.black = 0
  prologueView.blur = 0
  prologueView.clock = 0
  prologueView.subtitle = null
  liveOverride.current = null
  stopPrologueAudio()
  useGameStore.getState().finishPrologue()
  saveManager.save()
}

export function PrologueDirector() {
  const elapsed = useRef(0)
  const settled = useRef(false)
  const idleFrames = useRef(0)
  const audioOn = useRef(false)
  const bootScreen = useGameStore((s) => s.bootScreen)
  const prologueDone = useGameStore((s) => s.prologueDone)

  useLayoutEffect(() => {
    if (useGameStore.getState().prologueDone) {
      playerMotion.controlLocked = false
      prologueView.active = false
      prologueView.black = 0
      prologueView.blur = 0
      prologueView.clock = 0
      prologueView.subtitle = null
      liveOverride.current = null
      return
    }

    playerMotion.controlLocked = true
    useGameStore.getState().setLiviaVisible(false)
    useGameStore.getState().setCameraMode('cutscene')
    applyPose(0)

    const skip = (event: KeyboardEvent) => {
      if (event.code !== 'Escape') return
      if (useGameStore.getState().bootScreen === 'menu') return
      if (useGameStore.getState().prologueDone) return
      elapsed.current = PROLOGUE_END
    }
    window.addEventListener('keydown', skip)
    return () => {
      window.removeEventListener('keydown', skip)
      stopPrologueAudio()
    }
  }, [])

  useLayoutEffect(() => {
    if (bootScreen !== 'playing' || prologueDone) return
    elapsed.current = 0
    settled.current = false
    idleFrames.current = 0
    audioOn.current = false
    stopPrologueAudio()
    playerMotion.controlLocked = true
    useGameStore.getState().setLiviaVisible(false)
    useGameStore.getState().setCameraMode('cutscene')
    applyPose(0)
  }, [bootScreen, prologueDone])

  useFrame((_, delta) => {
    if (useGameStore.getState().bootScreen === 'menu') return
    if (useGameStore.getState().prologueDone) return

    if (elapsed.current >= PROLOGUE_END) {
      endPrologue()
      return
    }

    if (!settled.current) {
      applyPose(0)
      if (useProgress.getState().active) {
        idleFrames.current = 0
        return
      }
      idleFrames.current += 1
      if (idleFrames.current < 10) return
      settled.current = true
    }

    if (!audioOn.current) {
      audioOn.current = true
      startPrologueAudio()
    }

    if (!isAudioUnlocked()) {
      applyPose(Math.min(elapsed.current, 0.7))
      return
    }

    elapsed.current += Math.min(delta, 0.05)
    tickPrologueAudio(elapsed.current)
    applyPose(elapsed.current)

    if (elapsed.current >= PROLOGUE_END) endPrologue()
  })

  return null
}
