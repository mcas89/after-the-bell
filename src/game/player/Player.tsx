import { useFrame, useThree } from '@react-three/fiber'
import { Suspense, useLayoutEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { CLASSROOM_1, getRoom } from '../data/rooms'
import { hallwayStopZ } from '../hallway/hallwayLayout'
import { useHallwayStore } from '../hallway/useHallwayStore'
import { getMoveVector } from '../input/moveInput'
import { moveWithCollision, PLAYER_RADIUS } from '../systems/collision'
import { clampWithDoor } from '../door/doorLayout'
import { useDoorStore } from '../door/useDoorStore'
import { takePendingSpawn } from '../rooms/travel'
import { saveManager } from '../state/gameSaveManager'
import { useGameStore } from '../state/useGameStore'
import { LiviaModel } from './LiviaModel'
import { playerMotion } from './playerMotion'

const WALK_SPEED = 1.52
const ACCEL = 5.4
const BRAKE = 7.2
const TURN_SPEED = 5.1
const STICK_SMOOTH = 8.5
const MODEL_YAW = 0
const MOVE_EPS = 0.04

type Props = {
  groupRef: RefObject<THREE.Group | null>
}

function dampAngle(current: number, target: number, lambda: number, delta: number) {
  let diff = target - current
  while (diff > Math.PI) diff -= Math.PI * 2
  while (diff < -Math.PI) diff += Math.PI * 2
  return current + diff * (1 - Math.exp(-lambda * delta))
}

export function Player({ groupRef }: Props) {
  const { camera } = useThree()
  const room = useGameStore((s) => s.currentRoom)
  const dir = useRef(new THREE.Vector3())
  const vel = useRef(new THREE.Vector3())
  const camFwd = useRef(new THREE.Vector3())
  const camRight = useRef(new THREE.Vector3())
  const stickSmooth = useRef({ x: 0, z: 0 })
  const yaw = useRef(playerMotion.yaw)
  const lastSpeed = useRef(0)

  useLayoutEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(playerMotion.x, CLASSROOM_1.spawn[1], playerMotion.z)
      groupRef.current.rotation.y = playerMotion.yaw
      yaw.current = playerMotion.yaw
    }
  }, [groupRef, room])

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return

    camFwd.current.set(0, 0, -1).applyQuaternion(camera.quaternion)
    camFwd.current.y = 0
    if (camFwd.current.lengthSq() < 0.0001) camFwd.current.set(0, 0, -1)
    camFwd.current.normalize()
    camRight.current.set(-camFwd.current.z, 0, camFwd.current.x)

    const stick = getMoveVector()
    const locked = playerMotion.controlLocked
    stickSmooth.current.x = THREE.MathUtils.damp(
      stickSmooth.current.x,
      locked ? 0 : stick.x,
      STICK_SMOOTH,
      delta,
    )
    stickSmooth.current.z = THREE.MathUtils.damp(
      stickSmooth.current.z,
      locked ? 0 : stick.z,
      STICK_SMOOTH,
      delta,
    )

    dir.current
      .copy(camRight.current)
      .multiplyScalar(stickSmooth.current.x)
      .addScaledVector(camFwd.current, -stickSmooth.current.z)

    const analog = Math.min(1, dir.current.length())
    if (analog > 0.001) dir.current.multiplyScalar(1 / analog)

    const targetSpeed = analog > MOVE_EPS ? analog * WALK_SPEED : 0
    const wantX = dir.current.x * targetSpeed
    const wantZ = dir.current.z * targetSpeed
    const speedingUp = targetSpeed * targetSpeed > vel.current.lengthSq()
    const moveLambda = speedingUp ? ACCEL : BRAKE
    vel.current.x = THREE.MathUtils.damp(vel.current.x, wantX, moveLambda, delta)
    vel.current.z = THREE.MathUtils.damp(vel.current.z, wantZ, moveLambda, delta)

    const prevYaw = yaw.current
    const prevX = group.position.x
    const prevZ = group.position.z
    const room = useGameStore.getState().currentRoom
    const spawn = takePendingSpawn()
    if (spawn) {
      group.position.x = spawn.x
      group.position.z = spawn.z
      yaw.current = spawn.yaw
      group.rotation.y = spawn.yaw
      vel.current.set(0, 0, 0)
    }

    if (vel.current.lengthSq() > 0.00012) {
      const next = moveWithCollision(
        group.position.x,
        group.position.z,
        vel.current.x * delta,
        vel.current.z * delta,
      )
      group.position.x = next.x
      group.position.z = next.z

      if (room === 'classroom1' || room === 'room12' || room === 'teachers' || room === 'room14') {
        const clamped = clampWithDoor(
          group.position.x,
          group.position.z,
          room === 'classroom1' ? useDoorStore.getState().phase === 'open' : true,
        )
        group.position.x = clamped.x
        group.position.z = clamped.z
      } else {
        const { minX, maxX, minZ, maxZ } = getRoom(room).bounds
        const pad = PLAYER_RADIUS
        const stopZ = room === 'hallway' ? hallwayStopZ(useHallwayStore.getState().seenMysteriousGirl) : maxZ
        group.position.x = Math.min(maxX - pad, Math.max(minX + pad, group.position.x))
        group.position.z = Math.min(stopZ - pad, Math.max(minZ + pad, group.position.z))
      }

      const dt = Math.max(delta, 1e-5)
      vel.current.x = (group.position.x - prevX) / dt
      vel.current.z = (group.position.z - prevZ) / dt

    }

    if (playerMotion.faceYaw != null) {
      yaw.current = dampAngle(yaw.current, playerMotion.faceYaw, 7.6, delta)
      group.rotation.y = yaw.current
    } else if (analog > MOVE_EPS && vel.current.lengthSq() > 0.00012) {
      yaw.current = dampAngle(
        yaw.current,
        Math.atan2(dir.current.x, dir.current.z) + MODEL_YAW,
        TURN_SPEED,
        delta,
      )
      group.rotation.y = yaw.current
    }

    let dYaw = yaw.current - prevYaw
    while (dYaw > Math.PI) dYaw -= Math.PI * 2
    while (dYaw < -Math.PI) dYaw += Math.PI * 2
    const speed = Math.hypot(vel.current.x, vel.current.z)
    playerMotion.speed = speed
    playerMotion.analog = analog
    playerMotion.accel = (speed - lastSpeed.current) / Math.max(delta, 1e-5)
    playerMotion.turnRate = dYaw / Math.max(delta, 1e-5)
    playerMotion.x = group.position.x
    playerMotion.z = group.position.z
    playerMotion.yaw = yaw.current
    if (!locked && speed > 0.08) {
      playerMotion.distanceWalked += speed * delta
      saveManager.updatePlayerPosition()
    }
    lastSpeed.current = speed
  })

  return (
    <group ref={groupRef}>
      <Suspense fallback={null}>
        <LiviaModel />
      </Suspense>
    </group>
  )
}
