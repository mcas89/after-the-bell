import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { ROOM_SHOTS } from '../data/cameras'
import { getRoom } from '../data/rooms'
import { liveOverride } from '../prologue/timeline'
import { playerMotion } from '../player/playerMotion'
import { useMapTravelStore } from '../maps/mapTravel'
import { useGameStore } from '../state/useGameStore'
import { blendHallwayCamera, frameLivia } from './hallwayZones'
import { HALL } from '../hallway/hallwayLayout'

type Props = {
  target: RefObject<THREE.Group | null>
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
  const hallAhead = useRef(2.2)
  const hallSide = useRef(0)
  const hallDamp = useRef(2.2)

  useFrame(({ camera }, delta) => {
    const { currentRoom, cameraMode, cameraOverride: storedOverride, interactionState } = useGameStore.getState()
    const traveling = interactionState === 'map-travel' || useMapTravelStore.getState().busy
    if (lastRoom.current !== currentRoom) {
      lastRoom.current = currentRoom
      ready.current = false
      hallAhead.current = Math.cos(playerMotion.yaw) * 1.85
      hallSide.current = Math.sin(playerMotion.yaw)
    }
    const cameraOverride = liveOverride.current ?? storedOverride
    const shot = ROOM_SHOTS[currentRoom]
    const persp = camera as THREE.PerspectiveCamera
    const dt = Math.min(delta, 0.05)
    const player = target.current

    if (lastMode.current === 'cutscene' && cameraMode === 'explore') returnHold.current = 0.55
    lastMode.current = cameraMode
    if (returnHold.current > 0) returnHold.current -= dt

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
    } else if (currentRoom === 'hallway') {
      const targetAhead = Math.cos(playerMotion.yaw) * 1.85
      const targetSide = THREE.MathUtils.clamp(
        Math.sin(playerMotion.yaw) * 1.35 + (playerMotion.x / HALL.halfX) * 0.55,
        -1,
        1,
      )
      hallAhead.current = THREE.MathUtils.damp(hallAhead.current, targetAhead, 2.05, dt)
      hallSide.current = THREE.MathUtils.damp(hallSide.current, targetSide, 1.9, dt)
      const blended = blendHallwayCamera(playerMotion.z, hallAhead.current, hallSide.current)
      const framed = frameLivia(blended, playerMotion.x, playerMotion.z, hallSide.current)
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

      const doorBias = currentRoom === 'classroom1' ? THREE.MathUtils.smoothstep(px, 1.15, 3.55) : 0
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
              : currentRoom === 'hallway'
                ? hallDamp.current
                : shot.damp

    if (!ready.current || traveling || storedOverride?.snap || (cameraMode === 'cutscene' && cameraOverride?.snap)) {
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
