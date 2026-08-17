import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { lightMul } from '../atmosphere/roomPulse'
import { DOOR } from './doorLayout'
import { useDoorStore } from './useDoorStore'

export function HallwayPeek() {
  const start = DOOR.wallX + 0.08
  const len = 2.7
  const mid = start + len / 2
  const light = useRef<THREE.PointLight>(null)

  useFrame(() => {
    const phase = useDoorStore.getState().phase
    const base = phase === 'closed' ? 0 : phase === 'ajar' ? 0.1 : 0.16
    if (light.current) light.current.intensity = base * lightMul()
  })

  return (
    <group>
      <mesh position={[mid, 0.01, DOOR.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[len, DOOR.half * 2 + 0.2]} />
        <meshStandardMaterial color="#1c1814" roughness={0.96} />
      </mesh>
      <mesh position={[mid, 1.52, DOOR.z - DOOR.half - 0.08]} receiveShadow>
        <boxGeometry args={[len, 3.05, 0.12]} />
        <meshStandardMaterial color="#2a2622" roughness={0.94} />
      </mesh>
      <mesh position={[mid, 1.52, DOOR.z + DOOR.half + 0.08]} receiveShadow>
        <boxGeometry args={[len, 3.05, 0.12]} />
        <meshStandardMaterial color="#2a2622" roughness={0.94} />
      </mesh>
      <mesh position={[start + len, 1.52, DOOR.z]} receiveShadow>
        <boxGeometry args={[0.12, 3.05, DOOR.half * 2 + 0.28]} />
        <meshStandardMaterial color="#12100e" roughness={1} />
      </mesh>
      <mesh position={[mid, 3.02, DOOR.z]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[len, DOOR.half * 2 + 0.28]} />
        <meshStandardMaterial color="#141210" roughness={1} />
      </mesh>
      <pointLight
        ref={light}
        position={[start + 0.55, 1.35, DOOR.z]}
        color="#b7c9a4"
        intensity={0}
        distance={2.8}
        decay={2}
      />
    </group>
  )
}
