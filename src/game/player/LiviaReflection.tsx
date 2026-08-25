import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useSyncExternalStore } from 'react'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'
import { getLiviaRoot, subscribeLiviaRoot } from './liviaRoot'
import { playerMotion } from './playerMotion'
import { useGameStore } from '../state/useGameStore'

type Props = {
  planeZ: number
}

function syncPose(from: import('three').Object3D, to: import('three').Object3D) {
  const byName = new Map<string, import('three').Object3D>()
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
  const follow = useRef<import('three').Group>(null)
  const visible = useGameStore((s) => s.liviaVisible)

  const clone = useMemo(() => {
    if (!source) return null
    const next = SkeletonUtils.clone(source)
    next.traverse((obj) => {
      obj.frustumCulled = false
      obj.castShadow = false
      obj.receiveShadow = false
      obj.raycast = () => {}
    })
    return next
  }, [source])

  useFrame(() => {
    const group = follow.current
    if (!group || !source || !clone) return
    group.position.set(playerMotion.x, 0, 2 * planeZ - playerMotion.z)
    group.rotation.y = Math.PI - playerMotion.yaw
    group.visible = visible
    syncPose(source, clone)
  })

  if (!clone) return null

  return (
    <group ref={follow}>
      <primitive object={clone} />
    </group>
  )
}
