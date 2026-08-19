import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { ROOM_SHOTS } from '../data/cameras'
import { getRoom } from '../data/rooms'
import { liveOverride } from '../prologue/timeline'
import { playerMotion } from '../player/playerMotion'
import { useMapTravelStore } from '../maps/mapTravel'
import { useGameStore } from '../state/useGameStore'
import { girlMotion } from '../hallway/GirlSilhouette'
import { useHallwayStore } from '../hallway/useHallwayStore'
import { lookInput, resetLook, ensureLookReady } from '../input/lookInput'
import { readTouchUi } from '../input/useTouchUi'
import { playerOrbitShot } from './orbitShot'
import { hallwayLookAhead, hallwayWallShot, hallwayWallSide, mixHallwayShot, silhouetteLongShot } from './hallwayZones'

type Props = {
  target: RefObject<THREE.Group | null>
}

function dampAngle(current: number, target: number, lambda: number, delta: number) {
  let diff = target - current
  while (diff > Math.PI) diff -= Math.PI * 2
  while (diff < -Math.PI) diff += Math.PI * 2
  return current + diff * (1 - Math.exp(-lambda * delta))
}

export function GameCamera({ target }: Props) {
  const look = useRef(new THREE.Vector3())
  const desired = useRef(new THREE.Vector3())
  const lookDesired = useRef(new THREE.Vector3())
  const forward = useRef(new THREE.Vector3())
  const ready = useRef(false)
  const lastMode = useRef<string>('explore')
  const lastRoom = useRef<string | null>(null)
  const returnHold = useRef(0)
  const hallLead = useRef(1)
  const hallDamp = useRef(2.15)
  const hallWall = useRef<ReturnType<typeof hallwayWallSide>>(null)
  const hallWallMix = useRef(0)
  const followYaw = useRef(playerMotion.yaw)

  useFrame(({ camera }, delta) => {
    const { currentRoom, cameraMode, cameraOverride: storedOverride, interactionState } = useGameStore.getState()
    const traveling = interactionState === 'map-travel' || useMapTravelStore.getState().busy
    if (lastRoom.current !== currentRoom) {
      lastRoom.current = currentRoom
      ready.current = false
      const along = Math.cos(playerMotion.yaw)
      hallLead.current = along >= 0 ? 1 : -1
      hallWall.current = null
      hallWallMix.current = 0
      followYaw.current = playerMotion.yaw
      resetLook()
      lookInput.yaw = playerMotion.yaw
      lookInput.pitch = 0.12
    }
    const cameraOverride = liveOverride.current ?? storedOverride
    const shot = ROOM_SHOTS[currentRoom]
    const persp = camera as THREE.PerspectiveCamera
    const dt = Math.min(delta, 0.05)
    const player = target.current

    if (lastMode.current === 'cutscene' && cameraMode === 'explore') returnHold.current = 0.55
    const enteringCutscene = lastMode.current !== 'cutscene' && cameraMode === 'cutscene'
    lastMode.current = cameraMode
    if (returnHold.current > 0) returnHold.current -= dt

    const hall = currentRoom === 'hallway' ? useHallwayStore.getState() : null
    const along = Math.cos(playerMotion.yaw)
    const facingDark = along > 0.22
    const silhouette =
      hall && hall.girlVisible && !hall.seenMysteriousGirl && facingDark
    const phoneFollow =
      cameraMode !== 'examine' &&
      cameraMode !== 'cutscene' &&
      cameraMode !== 'firstPerson' &&
      !silhouette &&
      readTouchUi()
    const orbiting =
      cameraMode !== 'examine' &&
      cameraMode !== 'cutscene' &&
      cameraMode !== 'firstPerson' &&
      !silhouette &&
      !readTouchUi() &&
      lookInput.ready

    if (cameraMode === 'examine' && storedOverride) {
      desired.current.set(...storedOverride.position)
      lookDesired.current.set(...storedOverride.lookAt)
      const fovDamp = storedOverride.damp ?? 5.2
      persp.fov = THREE.MathUtils.damp(persp.fov, storedOverride.fov, fovDamp, dt)
    } else if (cameraMode === 'cutscene' && cameraOverride) {
      desired.current.set(...cameraOverride.position)
      lookDesired.current.set(...cameraOverride.lookAt)
      const fovDamp = cameraOverride.damp ?? 3.1
      persp.fov = cameraOverride.snap
        ? cameraOverride.fov
        : THREE.MathUtils.damp(persp.fov, cameraOverride.fov, fovDamp, dt)
    } else if (cameraMode === 'firstPerson' && player) {
      desired.current.set(player.position.x, player.position.y + 1.48, player.position.z)
      forward.current.set(0, 0, -1).applyEuler(player.rotation)
      lookDesired.current.copy(desired.current).add(forward.current)
      persp.fov = THREE.MathUtils.damp(persp.fov, 60, 4.2, dt)
    } else if (silhouette && hall) {
      hallWall.current = null
      hallWallMix.current = 0
      const framed = silhouetteLongShot(playerMotion.z, girlMotion.z, 30)
      hallDamp.current = framed.damp
      desired.current.set(...framed.position)
      lookDesired.current.set(...framed.lookAt)
      persp.fov = THREE.MathUtils.damp(persp.fov, framed.fov, framed.damp, dt)
    } else if (phoneFollow) {
      hallWall.current = null
      hallWallMix.current = 0
      ensureLookReady()
      const moving = playerMotion.speed > 0.14 && !lookInput.dragging
      if (moving) {
        lookInput.yaw = dampAngle(lookInput.yaw, playerMotion.yaw, 5.1, dt)
        lookInput.pitch = THREE.MathUtils.damp(lookInput.pitch, 0.12, 5.1, dt)
      }
      followYaw.current = lookInput.yaw
      const framed = playerOrbitShot(
        playerMotion.x,
        playerMotion.z,
        lookInput.yaw,
        lookInput.pitch,
        getRoom(currentRoom),
        lookInput.zoom,
      )
      hallDamp.current = lookInput.dragging ? 16 : moving ? 5.4 : 7.2
      desired.current.set(...framed.position)
      lookDesired.current.set(...framed.lookAt)
      persp.fov = THREE.MathUtils.damp(persp.fov, framed.fov, framed.damp, dt)
    } else if (orbiting) {
      hallWall.current = null
      hallWallMix.current = 0
      ensureLookReady()
      const framed = playerOrbitShot(
        playerMotion.x,
        playerMotion.z,
        lookInput.yaw,
        lookInput.pitch,
        getRoom(currentRoom),
      )
      hallDamp.current = lookInput.dragging ? 14 : framed.damp
      desired.current.set(...framed.position)
      lookDesired.current.set(...framed.lookAt)
      persp.fov = THREE.MathUtils.damp(persp.fov, framed.fov, framed.damp, dt)
    } else if (currentRoom === 'hallway') {
      const targetLead = along > 0.28 ? 1 : along < -0.28 ? -1 : hallLead.current
      hallLead.current = THREE.MathUtils.damp(hallLead.current, targetLead, 2.35, dt)
      const travel = hallwayLookAhead(playerMotion.x, playerMotion.z, hallLead.current)
      const wall = hallwayWallSide(playerMotion.x, playerMotion.yaw, hallWall.current)
      hallWall.current = wall ?? hallWall.current
      hallWallMix.current = THREE.MathUtils.damp(hallWallMix.current, wall ? 1 : 0, 2.15, dt)
      if (hallWallMix.current < 0.02) hallWall.current = wall
      const framed =
        hallWall.current && hallWallMix.current > 0.01
          ? mixHallwayShot(
              travel,
              hallwayWallShot(hallWall.current, playerMotion.z, hallLead.current),
              hallWallMix.current,
            )
          : travel
      hallDamp.current = framed.damp
      desired.current.set(...framed.position)
      lookDesired.current.set(...framed.lookAt)
      persp.fov = THREE.MathUtils.damp(persp.fov, framed.fov, framed.damp, dt)
    } else {
      const px = playerMotion.x
      const py = player?.position.y ?? 0
      const pz = playerMotion.z

      const dist = Math.hypot(px - shot.lookAt[0], pz - shot.lookAt[2])
      const corner = THREE.MathUtils.smoothstep(dist, 1.6, 4.6)
      const followX = THREE.MathUtils.lerp(shot.follow.x, 0.7, corner)
      const followZ = THREE.MathUtils.lerp(shot.follow.z, 0.28, corner)
      const lookF = THREE.MathUtils.lerp(shot.lookFollow, 0.78, corner)

      const driftX = THREE.MathUtils.clamp(
        (px - shot.lookAt[0]) * followX,
        -shot.margin.x,
        shot.margin.x,
      )
      const driftY = THREE.MathUtils.clamp(py * shot.follow.y, -shot.margin.y, shot.margin.y)
      const driftZ = THREE.MathUtils.clamp(
        (pz - shot.lookAt[2]) * followZ,
        -shot.margin.z,
        shot.margin.z,
      )
      const zoom = (pz - shot.lookAt[2]) * shot.zoomByDepth
      const pullIn = cameraMode === 'focus' ? -0.55 : 0

      const doorBias =
        currentRoom === 'classroom1' ||
        currentRoom === 'room12' ||
        currentRoom === 'teachers' ||
        currentRoom === 'room14' ||
        currentRoom === 'library' ||
        currentRoom === 'bathroom'
          ? THREE.MathUtils.smoothstep(px, 1.15, 3.55)
          : 0
      const bounds = getRoom(currentRoom).bounds

      desired.current.set(
        shot.position[0] + driftX + doorBias * 1.05,
        shot.position[1] + driftY,
        THREE.MathUtils.clamp(
          shot.position[2] + driftZ + zoom + pullIn,
          bounds.minZ + 0.8,
          bounds.maxZ - 0.18,
        ),
      )

      const lookAhead = 0

      lookDesired.current.set(
        THREE.MathUtils.lerp(shot.lookAt[0], px, THREE.MathUtils.lerp(lookF, 0.82, doorBias)),
        THREE.MathUtils.lerp(shot.lookAt[1], py + 0.95, lookF),
        THREE.MathUtils.lerp(shot.lookAt[2], pz + lookAhead, lookF),
      )

      const fov = cameraMode === 'focus' ? shot.fov - 6 : shot.fov
      persp.fov = THREE.MathUtils.damp(persp.fov, fov, shot.damp, dt)
    }

    const damp =
      cameraMode === 'examine' && storedOverride?.damp
        ? storedOverride.damp
        : cameraMode === 'cutscene' && cameraOverride?.damp
          ? cameraOverride.damp
          : cameraMode === 'firstPerson'
            ? 8
            : returnHold.current > 0
              ? 1.55
              : phoneFollow || orbiting || currentRoom === 'hallway'
                ? hallDamp.current
                : shot.damp

    if (
      !ready.current ||
      traveling ||
      storedOverride?.snap ||
      enteringCutscene ||
      (cameraMode === 'cutscene' && cameraOverride?.snap)
    ) {
      camera.position.copy(desired.current)
      look.current.copy(lookDesired.current)
      if (!traveling) ready.current = true
    } else {
      camera.position.x = THREE.MathUtils.damp(camera.position.x, desired.current.x, damp, dt)
      camera.position.y = THREE.MathUtils.damp(camera.position.y, desired.current.y, damp, dt)
      camera.position.z = THREE.MathUtils.damp(camera.position.z, desired.current.z, damp, dt)
      look.current.x = THREE.MathUtils.damp(look.current.x, lookDesired.current.x, damp, dt)
      look.current.y = THREE.MathUtils.damp(look.current.y, lookDesired.current.y, damp, dt)
      look.current.z = THREE.MathUtils.damp(look.current.z, lookDesired.current.z, damp, dt)
    }

    camera.lookAt(look.current)
    if (cameraOverride?.roll) camera.rotateZ(cameraOverride.roll)
    persp.updateProjectionMatrix()
  })

  return null
}
