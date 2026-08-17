import { useLayoutEffect, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { registerExamine, unregisterExamine } from './examineRegistry'

type Props = {
  id: string
  children: ReactNode
}

function mark(root: THREE.Object3D, id: string) {
  root.userData.examineId = id
  root.traverse((obj) => {
    obj.userData.examineId = id
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map((mat) => (mat.userData._examineClone ? mat : tagged(mat.clone())))
    } else if (mesh.material && !mesh.material.userData._examineClone) {
      mesh.material = tagged(mesh.material.clone())
    }
  })
}

function tagged(mat: THREE.Material) {
  mat.userData._examineClone = true
  return mat
}

export function Examinable({ id, children }: Props) {
  const group = useRef<THREE.Group>(null)

  useLayoutEffect(() => {
    const root = group.current
    if (!root) return
    mark(root, id)
    registerExamine(id, root)
    return () => unregisterExamine(id)
  }, [id])

  return (
    <group ref={group} userData={{ examineId: id }}>
      {children}
    </group>
  )
}
