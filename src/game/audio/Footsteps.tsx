import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { playerMotion } from '../player/playerMotion'
import { useGameStore } from '../state/useGameStore'
import { playFootstep } from './mixer'

const CONTACTS = [0.1, 0.6]
const MIN_SPEED = 0.18
const MIN_WEIGHT = 0.38

export function Footsteps() {
  const last = useRef(0)

  useFrame(() => {
    const game = useGameStore.getState()
    if (!game.prologueDone) return
    if (game.interactionState !== 'gameplay') return
    if (game.cameraMode === 'cutscene' || game.cameraMode === 'examine') return
    if (isPhoneOpen(usePhoneStore.getState().ui)) return
    if (playerMotion.controlLocked) return
    if (playerMotion.speed < MIN_SPEED || playerMotion.walkWeight < MIN_WEIGHT) {
      last.current = playerMotion.walkCycle
      return
    }

    const phase = playerMotion.walkCycle
    const prev = last.current
    for (const hit of CONTACTS) {
      if (prev < hit && phase >= hit) void playFootstep()
      if (prev > phase && (prev < hit || phase >= hit)) void playFootstep()
    }
    last.current = phase
  })

  return null
}
