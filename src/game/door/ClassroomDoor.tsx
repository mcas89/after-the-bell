import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { Examinable } from '../examine/Examinable'
import { DOOR } from './doorLayout'
import { useDoorStore } from './useDoorStore'

const leafW = DOOR.half * 2 - 0.05
const leafH = DOOR.height - 0.05
const wood = { color: '#6a5344', roughness: 0.86, metalness: 0.04 }
const darkWood = { color: '#4e3d32', roughness: 0.9, metalness: 0.03 }
const frame = { color: '#3d332c', roughness: 0.92 }
const metal = { color: '#c4b089', roughness: 0.38, metalness: 0.55 }
const glass = {
  color: '#b7c4ce',
  roughness: 0.18,
  metalness: 0.06,
  transparent: true,
  opacity: 0.55,
  emissive: '#8a9aaa',
  emissiveIntensity: 0.08,
}

function FrameStrip({
  position,
  size,
}: {
  position: [number, number, number]
  size: [number, number, number]
}) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial {...darkWood} />
    </mesh>
  )
}

export function ClassroomDoor() {
  const hinge = useRef<THREE.Group>(null)
  const phase = useDoorStore((s) => s.phase)
  const angle = useRef<number>(
    phase === 'open' ? DOOR.open : phase === 'ajar' ? DOOR.ajar : DOOR.closed,
  )

  useFrame((_, delta) => {
    const current = useDoorStore.getState().phase
    let want = DOOR.closed as number
    if (current === 'ajar') want = DOOR.ajar
    if (current === 'opening' || current === 'open') want = DOOR.open

    if (current === 'ajar' || current === 'closed' || current === 'open') {
      angle.current = want
    } else {
      angle.current = THREE.MathUtils.damp(angle.current, want, 2.35, delta)
      if (Math.abs(angle.current - DOOR.open) < 0.03) useDoorStore.getState().finishOpen()
    }

    if (hinge.current) hinge.current.rotation.y = angle.current
  })

  const cz = DOOR.half
  const face = -0.034
  const handleZ = leafW - 0.18

  return (
    <Examinable id="porta">
      <group position={[DOOR.wallX, 0, DOOR.z]}>
        <mesh position={[0.08, leafH / 2, 0]} receiveShadow>
          <boxGeometry args={[0.12, leafH + 0.18, leafW + 0.2]} />
          <meshStandardMaterial {...frame} />
        </mesh>
        <mesh position={[0.04, leafH + 0.1, 0]} receiveShadow>
          <boxGeometry args={[0.16, 0.12, leafW + 0.24]} />
          <meshStandardMaterial {...darkWood} />
        </mesh>
        <mesh position={[0.04, leafH / 2, -DOOR.half - 0.07]} receiveShadow>
          <boxGeometry args={[0.14, leafH + 0.12, 0.12]} />
          <meshStandardMaterial {...frame} />
        </mesh>
        <mesh position={[0.04, leafH / 2, DOOR.half + 0.07]} receiveShadow>
          <boxGeometry args={[0.14, leafH + 0.12, 0.12]} />
          <meshStandardMaterial {...frame} />
        </mesh>

        <group ref={hinge} position={[0, 0, -DOOR.half]}>
          <mesh position={[0, leafH / 2, cz]} castShadow receiveShadow>
            <boxGeometry args={[0.058, leafH, leafW]} />
            <meshStandardMaterial {...wood} />
          </mesh>

          <mesh position={[face, 1.68, cz]}>
            <boxGeometry args={[0.01, 0.5, 0.68]} />
            <meshStandardMaterial {...glass} />
          </mesh>
          <FrameStrip position={[face, 1.96, cz]} size={[0.018, 0.06, 0.78]} />
          <FrameStrip position={[face, 1.4, cz]} size={[0.018, 0.06, 0.78]} />
          <FrameStrip position={[face, 1.68, cz - 0.36]} size={[0.018, 0.56, 0.06]} />
          <FrameStrip position={[face, 1.68, cz + 0.36]} size={[0.018, 0.56, 0.06]} />
          <FrameStrip position={[face, 1.68, cz]} size={[0.012, 0.5, 0.03]} />

          <mesh position={[face, 1.08, cz]} castShadow>
            <boxGeometry args={[0.016, 0.38, 0.68]} />
            <meshStandardMaterial {...darkWood} />
          </mesh>
          <mesh position={[face, 0.58, cz]} castShadow>
            <boxGeometry args={[0.016, 0.44, 0.68]} />
            <meshStandardMaterial {...darkWood} />
          </mesh>

          <mesh position={[face - 0.004, 0.12, cz]} receiveShadow>
            <boxGeometry args={[0.02, 0.2, leafW - 0.08]} />
            <meshStandardMaterial color="#3a3530" roughness={0.55} metalness={0.28} />
          </mesh>

          <mesh position={[-0.008, 1.58, 0.045]} castShadow>
            <boxGeometry args={[0.032, 0.14, 0.055]} />
            <meshStandardMaterial {...metal} />
          </mesh>
          <mesh position={[-0.008, 0.46, 0.045]} castShadow>
            <boxGeometry args={[0.032, 0.14, 0.055]} />
            <meshStandardMaterial {...metal} />
          </mesh>

          <mesh position={[face - 0.004, 1.02, handleZ]} castShadow>
            <boxGeometry args={[0.012, 0.18, 0.11]} />
            <meshStandardMaterial {...metal} />
          </mesh>
          <mesh position={[face - 0.036, 1.02, handleZ]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.026, 0.026, 0.055, 14]} />
            <meshStandardMaterial {...metal} />
          </mesh>
          <mesh position={[face - 0.07, 1.02, handleZ]} castShadow>
            <sphereGeometry args={[0.034, 14, 12]} />
            <meshStandardMaterial {...metal} />
          </mesh>
        </group>
      </group>
    </Examinable>
  )
}
