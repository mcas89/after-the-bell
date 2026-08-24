import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import * as THREE from 'three'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'
import { getLiviaRoot, subscribeLiviaRoot } from './liviaRoot'
import { playerMotion } from './playerMotion'
import { useGameStore } from '../state/useGameStore'

type Props = {
  planeZ: number
}

function syncPose(from: THREE.Object3D, to: THREE.Object3D) {
  const byName = new Map<string, THREE.Object3D>()
  from.traverse((obj) => {
    if (obj.name) byName.set(obj.name, obj)
  })
  to.traverse((obj) => {
    const src = obj.name ? byName.get(obj.name) : undefined
    if (!src) return
    obj.position.copy(src.position)
    obj.quaternion.copy(src.quaternion)
    obj.scale.copy(src.scale)
  })
}

export function LiviaReflection({ planeZ }: Props) {
  const source = useSyncExternalStore(subscribeLiviaRoot, getLiviaRoot, getLiviaRoot)
  const follow = useRef<THREE.Group>(null)
  const visible = useGameStore((s) => s.liviaVisible)

  const clone = useMemo(() => {
    if (!source) return null
    const next = SkeletonUtils.clone(source)
    next.traverse((obj) => {
      obj.frustumCulled = false
      obj.castShadow = false
      obj.receiveShadow = false
      obj.raycast = () => {}
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      const mats = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).filter(Boolean)
      mesh.material = mats.map((mat) => {
        const copy = mat.clone()
        copy.side = THREE.DoubleSide
        copy.shadowSide = THREE.DoubleSide
        copy.fog = false
        return copy
      })
    })
    return next
  }, [source])

  useLayoutEffect(() => {
    return () => {
      clone?.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (!mesh.isMesh) return
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        for (const mat of mats) mat.dispose()
      })
    }
  }, [clone])

  useFrame(() => {
    const group = follow.current
    if (!group || !source || !clone) return
    group.position.set(playerMotion.x, 0, playerMotion.z)
    group.rotation.y = playerMotion.yaw
    group.visible = visible
    syncPose(source, clone)
  }, 1)

  if (!clone) return null

  return (
    <group position={[0, 0, planeZ]}>
      <group scale={[1, 1, -1]}>
        <group position={[0, 0, -planeZ]}>
          <group ref={follow}>
            <primitive object={clone} />
          </group>
        </group>
      </group>
    </group>
  )
}
