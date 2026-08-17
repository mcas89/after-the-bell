import * as THREE from 'three'
import type { CameraOverride } from '../data/cameras'
import { getRoom } from '../data/rooms'
import { HALL } from '../hallway/hallwayLayout'
import { isHallLockerId } from '../hallway/lockers'
import { useGameStore } from '../state/useGameStore'
import { visualBounds, type ExamineRecord } from './examineRegistry'

const size = new THREE.Vector3()
const center = new THREE.Vector3()
const from = new THREE.Vector3()
const dir = new THREE.Vector3()
const pos = new THREE.Vector3()
const look = new THREE.Vector3()
const box = new THREE.Box3()

const LOCKER_LOOK_X = -HALL.halfX + 0.22

function lockerFrontShot(record: ExamineRecord): CameraOverride {
  record.object.updateWorldMatrix(true, false)
  record.object.getWorldPosition(center)
  const z = center.z
  return {
    position: [1.58, 1.72, z],
    lookAt: [LOCKER_LOOK_X, 1.12, z],
    fov: 48,
    damp: 3.2,
  }
}

export function computeInspectShot(
  record: ExamineRecord,
  camera: THREE.Camera,
): CameraOverride {
  if (isHallLockerId(record.id)) return lockerFrontShot(record)

  visualBounds(record.object, box)
  if (box.isEmpty()) {
    record.object.getWorldPosition(center)
    size.set(0.35, 0.35, 0.35)
  } else {
    box.getCenter(center)
    box.getSize(size)
  }

  if (record.examineTargetOffset) {
    center.x += record.examineTargetOffset[0]
    center.y += record.examineTargetOffset[1]
    center.z += record.examineTargetOffset[2]
  }

  const radius = Math.max(0.08, size.length() * 0.5)
  const dist = record.examineDistance ?? THREE.MathUtils.clamp(radius * 1.85, 0.36, 2.1)

  if (record.examineFacing) {
    dir.set(...record.examineFacing)
    if (dir.lengthSq() < 0.0001) dir.set(0, 0, 1)
    dir.normalize()
    pos.copy(center).addScaledVector(dir, dist)
  } else {
    from.copy(camera.position)
    dir.copy(center).sub(from)
    if (dir.lengthSq() < 0.0001) dir.set(0, 0.15, 1)
    dir.normalize()
    pos.copy(center).addScaledVector(dir, -dist)
  }

  if (record.examineOffset) {
    pos.x += record.examineOffset[0]
    pos.y += record.examineOffset[1]
    pos.z += record.examineOffset[2]
  }

  const room = getRoom(useGameStore.getState().currentRoom)
  const pad = 0.28
  pos.y = THREE.MathUtils.clamp(pos.y, 0.32, room.size.height - 0.28)
  pos.x = THREE.MathUtils.clamp(pos.x, room.bounds.minX + pad, room.bounds.maxX - pad)
  pos.z = THREE.MathUtils.clamp(pos.z, room.bounds.minZ + pad, room.bounds.maxZ - pad)

  look.copy(center)
  look.y = THREE.MathUtils.clamp(look.y, 0.12, room.size.height - 0.2)

  return {
    position: [pos.x, pos.y, pos.z],
    lookAt: [look.x, look.y, look.z],
    fov: record.fov ?? THREE.MathUtils.clamp(38 - radius * 4, 28, 44),
    damp: 5.1,
  }
}
