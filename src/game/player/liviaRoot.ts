import type { Object3D } from 'three'

let root: Object3D | null = null
const listeners = new Set<() => void>()

export function setLiviaRoot(next: Object3D | null) {
  root = next
  listeners.forEach((fn) => fn())
}

export function getLiviaRoot() {
  return root
}

export function subscribeLiviaRoot(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
