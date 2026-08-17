import { Box3, Mesh, Object3D, Vector3 } from 'three'
import { EXAMINE_ITEMS, type ExamineTuning } from '../data/examine'
import { isHallLockerId } from '../hallway/lockers'

export type ExamineRecord = ExamineTuning & {
  id: string
  object: Object3D
}

const records = new Map<string, ExamineRecord>()
const worldPos = new Vector3()
const size = new Vector3()
const meshBox = new Box3()

export function registerExamine(id: string, object: Object3D) {
  const tuning = EXAMINE_ITEMS[id]
  if (!tuning) return
  records.set(id, { id, object, ...tuning })
}

export function unregisterExamine(id: string) {
  records.delete(id)
}

export function getExamineRecord(id: string) {
  return records.get(id) ?? null
}

export function getExamineRecords() {
  return [...records.values()]
}

export function visualBounds(object: Object3D, target: Box3) {
  target.makeEmpty()
  object.updateWorldMatrix(true, true)
  object.traverse((obj) => {
    const mesh = obj as Mesh
    if (!mesh.isMesh || !mesh.geometry) return
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox()
    if (!mesh.geometry.boundingBox) return
    meshBox.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld)
    target.union(meshBox)
  })
  if (target.isEmpty()) target.setFromObject(object)
  return target
}

export function getNearbyExamineIds(x: number, z: number) {
  const nearby: string[] = []
  const bounds = new Box3()
  for (const item of records.values()) {
    if (isHallLockerId(item.id)) {
      item.object.getWorldPosition(worldPos)
      if (Math.hypot(worldPos.x - x, worldPos.z - z) <= item.radius) nearby.push(item.id)
      continue
    }
    visualBounds(item.object, bounds)
    if (bounds.isEmpty()) continue
    bounds.getCenter(worldPos)
    bounds.getSize(size)
    const reach = item.radius + Math.max(size.x, size.z, 0.35) * 0.45
    if (Math.hypot(worldPos.x - x, worldPos.z - z) <= reach) nearby.push(item.id)
  }
  return nearby
}
