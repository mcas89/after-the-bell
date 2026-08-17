import * as THREE from 'three'

const hoverColor = new THREE.Color('#b7a78c')
const nearColor = new THREE.Color('#4a433a')

type Mode = 'off' | 'near' | 'hover' | 'focus'

function eachMaterial(root: THREE.Object3D, fn: (mat: THREE.MeshStandardMaterial) => void) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const mat of list) {
      if (mat && 'emissive' in mat) fn(mat as THREE.MeshStandardMaterial)
    }
  })
}

export function setExamineHighlight(root: THREE.Object3D, mode: Mode) {
  eachMaterial(root, (mat) => {
    if (!mat.userData._examineEm) {
      mat.userData._examineEm = mat.emissive.clone()
      mat.userData._examineEmInt = mat.emissiveIntensity ?? 1
    }
    const base = mat.userData._examineEm as THREE.Color
    const baseInt = mat.userData._examineEmInt as number
    if (mode === 'off') {
      mat.emissive.copy(base)
      mat.emissiveIntensity = baseInt
      return
    }
    if (mode === 'near') {
      mat.emissive.copy(base).lerp(nearColor, 0.28)
      mat.emissiveIntensity = Math.max(baseInt, 0.18)
      return
    }
    if (mode === 'focus') {
      mat.emissive.copy(base).lerp(hoverColor, 0.22)
      mat.emissiveIntensity = Math.max(baseInt, 0.2)
      return
    }
    mat.emissive.copy(base).lerp(hoverColor, 0.5)
    mat.emissiveIntensity = Math.max(baseInt, 0.38)
  })
}
