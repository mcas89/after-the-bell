import { useFrame, useLoader } from '@react-three/fiber'
import { VRMHumanBoneName } from '@pixiv/three-vrm'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { compileClip, mixBoneEuler, nudgeBone, sampleBlendedPose, type PoseClipJson } from './poseClip'
import { playerMotion } from './playerMotion'
import { useGameStore } from '../state/useGameStore'
import { useExamineStore } from '../examine/useExamineStore'
import { useVrm } from './useVrm'
import { ITEM_IDS } from '../data/items'
import { FLASHLIGHT_ON } from '../inventory/flashlight'
import { useInventoryStore } from '../state/useInventoryStore'
import { HeldFlashlight } from './HeldFlashlight'
import { ZEL_SKELETON_AIM, ZEL_SKELETON_OPEN } from '../rooms/skeletonCabinet'

function readClip(data: unknown): PoseClipJson {
  return (typeof data === 'string' ? JSON.parse(data) : data) as PoseClipJson
}

const WALK_SPEED = 1.52
const STRIDE = 0.92
const BLEND_IN = 4.6
const BLEND_OUT = 3.2
const IDLE_RATE = 1.22
const HOLD_BLEND = 6.2

const FLASH_HOLD = {
  shoulder: { x: 0, y: 0, z: 0.0524 },
  upper: { x: -0.384, y: 0, z: 1.309 },
  lower: { x: -0.0873, y: 1.5708, z: 0.2967 },
}

const FORCE_HOLD = {
  leftShoulder: { x: 0.12, y: 0.04, z: -0.1 },
  rightShoulder: { x: 0.12, y: -0.04, z: 0.1 },
  leftUpper: { x: -0.92, y: 0.28, z: -1.02 },
  rightUpper: { x: -0.92, y: -0.28, z: 1.02 },
  leftLower: { x: -0.18, y: -1.18, z: 0.16 },
  rightLower: { x: -0.18, y: 1.18, z: -0.16 },
  leftHand: { x: 0.22, y: 0.08, z: 0.05 },
  rightHand: { x: 0.22, y: -0.08, z: -0.05 },
}

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
  const holdFlash = useRef(0)
  const holdForce = useRef(0)
  const forceTime = useRef(0)
  const wasForcing = useRef(false)

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

    const torchOn =
      Boolean(useGameStore.getState().flags[FLASHLIGHT_ON]) &&
      useInventoryStore.getState().has(ITEM_IDS.flashlightLit)
    const forcingCabinet =
      useExamineStore.getState().examiningId === 'zel-skeleton' &&
      !useGameStore.getState().flags[ZEL_SKELETON_OPEN]
    holdFlash.current = THREE.MathUtils.damp(holdFlash.current, torchOn && !forcingCabinet ? 1 : 0, HOLD_BLEND, delta)
    holdForce.current = THREE.MathUtils.damp(holdForce.current, forcingCabinet ? 1 : 0, 7.4, delta)
    playerMotion.forcePulse = Math.max(0, playerMotion.forcePulse - delta * 3.2)

    if (forcingCabinet) {
      wasForcing.current = true
      playerMotion.forceFacing = true
      playerMotion.faceYaw = Math.atan2(
        ZEL_SKELETON_AIM.x - playerMotion.x,
        ZEL_SKELETON_AIM.z - playerMotion.z,
      )
    } else if (wasForcing.current) {
      wasForcing.current = false
      if (playerMotion.forceFacing) {
        playerMotion.faceYaw = null
        playerMotion.forceFacing = false
      }
    }

    if (holdFlash.current > 0.01) {
      const w = holdFlash.current
      mixBoneEuler(
        pose,
        VRMHumanBoneName.RightShoulder,
        FLASH_HOLD.shoulder.x,
        FLASH_HOLD.shoulder.y,
        FLASH_HOLD.shoulder.z,
        w,
      )
      mixBoneEuler(
        pose,
        VRMHumanBoneName.RightUpperArm,
        FLASH_HOLD.upper.x,
        FLASH_HOLD.upper.y,
        FLASH_HOLD.upper.z,
        w,
      )
      mixBoneEuler(
        pose,
        VRMHumanBoneName.RightLowerArm,
        FLASH_HOLD.lower.x,
        FLASH_HOLD.lower.y,
        FLASH_HOLD.lower.z,
        w,
      )
    }

    if (holdForce.current > 0.01) {
      const w = holdForce.current
      const pulse = playerMotion.forcePulse
      forceTime.current += delta * (2.2 + pulse * 4.5)
      const strain = Math.sin(forceTime.current * 8.4)
      const shove = pulse * 0.34 + strain * 0.05 * w
      mixBoneEuler(
        pose,
        VRMHumanBoneName.LeftShoulder,
        FORCE_HOLD.leftShoulder.x + shove * 0.08,
        FORCE_HOLD.leftShoulder.y,
        FORCE_HOLD.leftShoulder.z,
        w,
      )
      mixBoneEuler(
        pose,
        VRMHumanBoneName.RightShoulder,
        FORCE_HOLD.rightShoulder.x + shove * 0.08,
        FORCE_HOLD.rightShoulder.y,
        FORCE_HOLD.rightShoulder.z,
        w,
      )
      mixBoneEuler(
        pose,
        VRMHumanBoneName.LeftUpperArm,
        FORCE_HOLD.leftUpper.x - shove * 0.22,
        FORCE_HOLD.leftUpper.y + strain * 0.04,
        FORCE_HOLD.leftUpper.z,
        w,
      )
      mixBoneEuler(
        pose,
        VRMHumanBoneName.RightUpperArm,
        FORCE_HOLD.rightUpper.x - shove * 0.22,
        FORCE_HOLD.rightUpper.y - strain * 0.04,
        FORCE_HOLD.rightUpper.z,
        w,
      )
      mixBoneEuler(
        pose,
        VRMHumanBoneName.LeftLowerArm,
        FORCE_HOLD.leftLower.x,
        FORCE_HOLD.leftLower.y + shove * 0.16,
        FORCE_HOLD.leftLower.z,
        w,
      )
      mixBoneEuler(
        pose,
        VRMHumanBoneName.RightLowerArm,
        FORCE_HOLD.rightLower.x,
        FORCE_HOLD.rightLower.y - shove * 0.16,
        FORCE_HOLD.rightLower.z,
        w,
      )
      mixBoneEuler(
        pose,
        VRMHumanBoneName.LeftHand,
        FORCE_HOLD.leftHand.x,
        FORCE_HOLD.leftHand.y,
        FORCE_HOLD.leftHand.z,
        w,
      )
      mixBoneEuler(
        pose,
        VRMHumanBoneName.RightHand,
        FORCE_HOLD.rightHand.x,
        FORCE_HOLD.rightHand.y,
        FORCE_HOLD.rightHand.z,
        w,
      )
      nudgeBone(pose, VRMHumanBoneName.Hips, 0.04 * w + 0.06 * pulse, strain * 0.012 * w, 0)
      nudgeBone(pose, VRMHumanBoneName.Spine, 0.14 * w + 0.18 * pulse, strain * 0.03 * w, 0)
      nudgeBone(pose, VRMHumanBoneName.Chest, 0.1 * w + 0.12 * pulse, strain * 0.02 * w, 0)
      nudgeBone(pose, VRMHumanBoneName.Head, 0.16 * w - 0.05 * pulse, 0, strain * 0.04 * w)
    }

    const fwdTarget =
      speedNorm * 0.055 + THREE.MathUtils.clamp(playerMotion.accel * 0.035, -0.04, 0.08)
    const sideTarget = THREE.MathUtils.clamp(-playerMotion.turnRate * 0.11, -0.1, 0.1)
    const lookTarget = THREE.MathUtils.clamp(playerMotion.turnRate * 0.22, -0.28, 0.28)
    leanFwd.current = THREE.MathUtils.damp(leanFwd.current, fwdTarget, 5.5, delta)
    leanSide.current = THREE.MathUtils.damp(leanSide.current, sideTarget, 4.8, delta)
    lookYaw.current = THREE.MathUtils.damp(lookYaw.current, lookTarget, 3.4, delta)

    const flinch = playerMotion.flinch
    if (flinch > 0.01) {
      playerMotion.flinch = Math.max(0, flinch - delta * 1.85)
    }
    nudgeBone(pose, VRMHumanBoneName.Hips, -0.06 * flinch, 0, 0)
    nudgeBone(pose, VRMHumanBoneName.Spine, leanFwd.current - 0.14 * flinch, 0, leanSide.current)
    nudgeBone(pose, VRMHumanBoneName.Chest, leanFwd.current * 0.45 - 0.08 * flinch, 0, leanSide.current * 0.4)
    nudgeBone(
      pose,
      VRMHumanBoneName.Head,
      -leanFwd.current * 0.4 - 0.28 * flinch,
      lookYaw.current,
      -leanSide.current * 0.25 + 0.1 * flinch,
    )

    vrm.humanoid.resetNormalizedPose()
    vrm.humanoid.setNormalizedPose(pose)
    vrm.scene.visible = useGameStore.getState().liviaVisible
    vrm.update(delta)
  })

  return (
    <>
      <primitive object={vrm.scene} />
      <HeldFlashlight vrm={vrm} />
    </>
  )
}
