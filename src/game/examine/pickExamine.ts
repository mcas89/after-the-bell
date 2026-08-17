import * as THREE from 'three'
import { isHallLockerId } from '../hallway/lockers'
import { getExamineRecords, visualBounds } from './examineRegistry'

const raycaster = new THREE.Raycaster()
const ndc = new THREE.Vector2()
const box = new THREE.Box3()
const center = new THREE.Vector3()
const size = new THREE.Vector3()
const hitPoint = new THREE.Vector3()
const closest = new THREE.Vector3()
const meshes: THREE.Object3D[] = []

type Hit = {
  id: string
  distance: number
  mesh: boolean
  large: boolean
}

function rayHitsSphere(origin: THREE.Vector3, dir: THREE.Vector3, at: THREE.Vector3, radius: number) {
  closest.copy(at).sub(origin)
  const t = closest.dot(dir)
  if (t < 0.05) return Infinity
  const distSq = closest.lengthSq() - t * t
  if (distSq > radius * radius) return Infinity
  return t
}

export function pickExamineId(
  clientX: number,
  clientY: number,
  camera: THREE.Camera,
  canvas: HTMLCanvasElement,
  ids: string[],
) {
  if (ids.length === 0) return null
  const rect = canvas.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return null

  ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1)
  camera.updateMatrixWorld()
  raycaster.setFromCamera(ndc, camera)

  const records = getExamineRecords().filter((record) => ids.includes(record.id))
  if (records.length === 0) return null

  const byId = new Map(records.map((record) => [record.id, record]))
  meshes.length = 0
  for (const record of records) {
    record.object.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (mesh.isMesh) meshes.push(mesh)
    })
  }

  const found: Hit[] = []
  for (const hit of raycaster.intersectObjects(meshes, false)) {
    const id = String(hit.object.userData.examineId ?? '')
    const record = byId.get(id)
    if (!record) continue
    found.push({
      id,
      distance: hit.distance,
      mesh: true,
      large: record.pick === 'large',
    })
  }

  const origin = raycaster.ray.origin
  const dir = raycaster.ray.direction
  for (const record of records) {
    if (isHallLockerId(record.id)) continue
    visualBounds(record.object, box)
    if (box.isEmpty()) continue
    box.getCenter(center)
    box.getSize(size)
    const large = record.pick === 'large'
    const pad = record.pickRadius ?? (large ? 0.08 : 0.2)
    const radius = Math.max(pad, Math.max(size.x, size.y, size.z) * (large ? 0.16 : 0.45))
    let distance = rayHitsSphere(origin, dir, center, radius)
    if (large && !Number.isFinite(distance)) {
      box.expandByScalar(0.06)
      if (raycaster.ray.intersectBox(box, hitPoint)) distance = origin.distanceTo(hitPoint)
    }
    if (!Number.isFinite(distance)) continue
    found.push({ id: record.id, distance, mesh: false, large })
  }

  if (found.length === 0) return null
  found.sort((a, b) => {
    if (a.mesh !== b.mesh) return a.mesh ? -1 : 1
    if (Math.abs(a.distance - b.distance) > 0.04) return a.distance - b.distance
    if (a.large !== b.large) return a.large ? 1 : -1
    return a.distance - b.distance
  })
  return found[0].distance < 14 ? found[0].id : null
}
