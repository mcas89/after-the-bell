import { createPortal, useFrame } from '@react-three/fiber'
import { VRMHumanBoneName, type VRM } from '@pixiv/three-vrm'
import { useRef } from 'react'
import * as THREE from 'three'
import { ITEM_IDS } from '../data/items'
import { FLASHLIGHT_ON } from '../inventory/flashlight'
import { useGameStore } from '../state/useGameStore'
import { useInventoryStore } from '../state/useInventoryStore'
import { playerMotion } from './playerMotion'

const _world = new THREE.Vector3()

type Props = {
  vrm: VRM
}

export function HeldFlashlight({ vrm }: Props) {
  const on = useGameStore((s) => Boolean(s.flags[FLASHLIGHT_ON]))
  const has = useInventoryStore((s) => s.has(ITEM_IDS.flashlightLit))
  const lens = useRef<THREE.Mesh>(null)
  const showing = has && on
  const hand = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightHand)

  useFrame(() => {
    if (!showing || !lens.current) {
      playerMotion.flashReady = false
      return
    }
    lens.current.getWorldPosition(_world)
    playerMotion.flashX = _world.x
    playerMotion.flashY = _world.y
    playerMotion.flashZ = _world.z
    playerMotion.flashReady = true
  })

  if (!hand) return null

  return createPortal(
    <group position={[-0.01, 0.042, -0.04]} rotation={[1.12, 0.18, 1.48]} visible={showing}>
      <mesh position={[0, 0.01, 0]} castShadow>
        <cylinderGeometry args={[0.014, 0.016, 0.11, 10]} />
        <meshStandardMaterial color="#2a2c30" metalness={0.55} roughness={0.38} />
      </mesh>
      <mesh position={[0, 0.072, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.018, 0.034, 12]} />
        <meshStandardMaterial color="#3a3d42" metalness={0.48} roughness={0.32} />
      </mesh>
      <mesh ref={lens} position={[0, 0.09, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.016, 12]} />
        <meshStandardMaterial
          color="#f6e7b0"
          emissive="#f0d889"
          emissiveIntensity={showing ? 2.4 : 0}
        />
      </mesh>
    </group>,
    hand,
  )
}
