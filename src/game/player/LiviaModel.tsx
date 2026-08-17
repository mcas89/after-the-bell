import { useFrame, useLoader } from '@react-three/fiber'
import { VRMHumanBoneName } from '@pixiv/three-vrm'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { compileClip, nudgeBone, sampleBlendedPose, type PoseClipJson } from './poseClip'
import { playerMotion } from './playerMotion'
import { useGameStore } from '../state/useGameStore'
import { useVrm } from './useVrm'

function readClip(data: unknown): PoseClipJson {
  return (typeof data === 'string' ? JSON.parse(data) : data) as PoseClipJson
}

const WALK_SPEED = 1.52
const STRIDE = 0.92
const BLEND_IN = 4.6
const BLEND_OUT = 3.2
const IDLE_RATE = 1.22

export function LiviaModel() {
  const vrm = useVrm('/characters/Livia.vrm')
  const idleJson = useLoader(
    THREE.FileLoader,
    '/animation/vida_completo.json',
    (loader) => {
      loader.setResponseType('json')
    },
  ) as unknown as PoseClipJson
  const walkJson = useLoader(
    THREE.FileLoader,
    '/animation/andar.json',
    (loader) => {
      loader.setResponseType('json')
    },
  ) as unknown as PoseClipJson

  const idleClip = useMemo(() => compileClip(readClip(idleJson)), [idleJson])
  const walkClip = useMemo(() => compileClip(readClip(walkJson)), [walkJson])
  const idleTime = useRef(0)
  const walkTime = useRef(0)
  const walkWeight = useRef(0)
  const leanFwd = useRef(0)
  const leanSide = useRef(0)
  const lookYaw = useRef(0)

  useLayoutEffect(() => {
    vrm.scene.visible = useGameStore.getState().liviaVisible
  }, [vrm])

  useFrame((_, delta) => {
    const speedNorm = THREE.MathUtils.clamp(playerMotion.speed / WALK_SPEED, 0, 1)
    const target = THREE.MathUtils.smoothstep(speedNorm, 0.03, 0.52)
    const blendLambda = target > walkWeight.current ? BLEND_IN : BLEND_OUT
    walkWeight.current = THREE.MathUtils.damp(walkWeight.current, target, blendLambda, delta)

    idleTime.current += delta * IDLE_RATE
    const walkRate = walkClip.duration * (Math.max(playerMotion.speed, 0.12) / STRIDE)
    walkTime.current += delta * (walkWeight.current > 0.02 ? walkRate : 0.85)
    playerMotion.walkWeight = walkWeight.current
    playerMotion.walkCycle = walkClip.duration > 0 ? (walkTime.current % walkClip.duration) / walkClip.duration : 0

    const pose = sampleBlendedPose(
      idleClip,
      walkClip,
      idleTime.current,
      walkTime.current,
      walkWeight.current,
    )

    const fwdTarget =
      speedNorm * 0.055 + THREE.MathUtils.clamp(playerMotion.accel * 0.035, -0.04, 0.08)
    const sideTarget = THREE.MathUtils.clamp(-playerMotion.turnRate * 0.11, -0.1, 0.1)
    const lookTarget = THREE.MathUtils.clamp(playerMotion.turnRate * 0.22, -0.28, 0.28)
    leanFwd.current = THREE.MathUtils.damp(leanFwd.current, fwdTarget, 5.5, delta)
    leanSide.current = THREE.MathUtils.damp(leanSide.current, sideTarget, 4.8, delta)
    lookYaw.current = THREE.MathUtils.damp(lookYaw.current, lookTarget, 3.4, delta)

    nudgeBone(pose, VRMHumanBoneName.Spine, leanFwd.current, 0, leanSide.current)
    nudgeBone(pose, VRMHumanBoneName.Chest, leanFwd.current * 0.45, 0, leanSide.current * 0.4)
    nudgeBone(
      pose,
      VRMHumanBoneName.Head,
      -leanFwd.current * 0.4,
      lookYaw.current,
      -leanSide.current * 0.25,
    )

    vrm.humanoid.resetNormalizedPose()
    vrm.humanoid.setNormalizedPose(pose)
    vrm.scene.visible = useGameStore.getState().liviaVisible
    vrm.update(delta)
  })

  return <primitive object={vrm.scene} />
}
