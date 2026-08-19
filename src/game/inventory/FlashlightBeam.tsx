import { useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ITEM_IDS } from '../data/items'
import { playerMotion } from '../player/playerMotion'
import { useGameStore } from '../state/useGameStore'
import { useInventoryStore } from '../state/useInventoryStore'
import { FLASHLIGHT_ON } from './flashlight'

export function FlashlightBeam() {
  const on = useGameStore((s) => Boolean(s.flags[FLASHLIGHT_ON]))
  const has = useInventoryStore((s) => s.has(ITEM_IDS.flashlightLit))
  const light = useRef<THREE.SpotLight>(null)
  const fill = useRef<THREE.PointLight>(null)
  const target = useRef<THREE.Object3D>(null)

  useLayoutEffect(() => {
    if (light.current && target.current) light.current.target = target.current
  }, [on, has])

  useFrame(() => {
    if (!has || !on) return
    const yaw = playerMotion.yaw
    const fx = Math.sin(yaw)
    const fz = Math.cos(yaw)
    const x = playerMotion.x
    const z = playerMotion.z
    const ox = playerMotion.flashReady ? playerMotion.flashX : x + fx * 0.22
    const oy = playerMotion.flashReady ? playerMotion.flashY : 1.34
    const oz = playerMotion.flashReady ? playerMotion.flashZ : z + fz * 0.18
    if (light.current) {
      light.current.position.set(ox, oy, oz)
    }
    if (fill.current) {
      fill.current.position.set(ox, oy, oz)
    }
    if (target.current) {
      target.current.position.set(x + fx * 4.2, 0.92, z + fz * 4.2)
      target.current.updateMatrixWorld()
    }
    light.current?.target.updateMatrixWorld()
  })

  if (!has || !on) return null

  return (
    <>
      <spotLight
        ref={light}
        intensity={28}
        angle={0.4}
        penumbra={0.58}
        distance={9.2}
        decay={1.8}
        color="#f2e4bc"
      />
      <pointLight ref={fill} intensity={1.15} distance={2.6} decay={2} color="#efe6d0" />
      <object3D ref={target} />
    </>
  )
}
