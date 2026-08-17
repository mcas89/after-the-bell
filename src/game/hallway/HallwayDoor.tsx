import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { HALL } from './hallwayLayout'
import { woodDoorTexture } from './hallTextures'
import { useHallwayStore } from './useHallwayStore'

const metal = { color: '#d2c09a', roughness: 0.32, metalness: 0.62 }
const darkWood = { color: '#4a3a30', roughness: 0.88, metalness: 0.04 }
const frame = { color: '#3a322c', roughness: 0.92 }
const glass = {
  color: '#c5d4de',
  roughness: 0.16,
  metalness: 0.08,
  transparent: true,
  opacity: 0.58,
  emissive: '#9ab4c4',
  emissiveIntensity: 0.16,
}

function plateTexture(label: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = '#e4d6b8'
  ctx.fillRect(0, 0, 256, 128)
  ctx.strokeStyle = '#5a4a38'
  ctx.lineWidth = 10
  ctx.strokeRect(8, 8, 240, 112)
  ctx.fillStyle = '#2a2420'
  ctx.font = 'bold 78px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, 128, 70)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function DoorHandle({ rattles, hall }: { rattles: boolean; hall: number }) {
  const ref = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!ref.current) return
    if (!rattles) {
      ref.current.rotation.x = 0
      return
    }
    const left = useHallwayStore.getState().rattleUntil - performance.now()
    ref.current.rotation.x = left > 0 ? Math.sin(left * 0.06) * 0.62 : 0
  })

  return (
    <group ref={ref} position={[hall * 0.07, 1.02, 0.32]}>
      <mesh>
        <boxGeometry args={[0.016, 0.2, 0.12]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      <mesh position={[hall * 0.045, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.028, 0.028, 0.055, 14]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      <mesh position={[hall * 0.082, 0, 0]}>
        <sphereGeometry args={[0.036, 14, 12]} />
        <meshStandardMaterial {...metal} />
      </mesh>
    </group>
  )
}

export function HallwayDoor({
  x,
  z,
  inward,
  label,
  rattles = false,
  open = false,
}: {
  x: number
  z: number
  inward: 1 | -1
  label: string
  rattles?: boolean
  open?: boolean
}) {
  const plate = useMemo(() => (label ? plateTexture(label) : null), [label])
  const wood = useMemo(() => woodDoorTexture(), [])
  const hall = inward
  const faceY = hall > 0 ? -Math.PI / 2 : Math.PI / 2
  const leafW = HALL.doorHalf * 2 - 0.05
  const leafH = HALL.doorH - 0.04
  const leafX = hall * 0.11
  const face = hall * 0.152
  const hingeZ = HALL.doorHalf

  useEffect(() => {
    return () => {
      plate?.dispose()
      wood?.dispose()
    }
  }, [plate, wood])

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0.1, leafH / 2, 0]} receiveShadow>
        <boxGeometry args={[0.16, leafH + 0.16, leafW + 0.22]} />
        <meshStandardMaterial {...frame} />
      </mesh>
      <mesh position={[0, HALL.doorH + 0.08, 0]} receiveShadow>
        <boxGeometry args={[0.2, 0.16, leafW + 0.28]} />
        <meshStandardMaterial {...darkWood} />
      </mesh>
      <mesh position={[0, leafH / 2, -HALL.doorHalf - 0.06]} receiveShadow>
        <boxGeometry args={[0.18, leafH + 0.12, 0.12]} />
        <meshStandardMaterial {...frame} />
      </mesh>
      <mesh position={[0, leafH / 2, HALL.doorHalf + 0.06]} receiveShadow>
        <boxGeometry args={[0.18, leafH + 0.12, 0.12]} />
        <meshStandardMaterial {...frame} />
      </mesh>

      {open ? (
        <mesh position={[0.46, 1.1, 0]} receiveShadow>
          <boxGeometry args={[0.72, 2.18, leafW - 0.04]} />
          <meshStandardMaterial color="#070605" roughness={1} />
        </mesh>
      ) : null}

      <group position={[0, 0, -HALL.doorHalf]} rotation={[0, open ? hall * 1.72 : 0, 0]}>
        <mesh position={[leafX, leafH / 2, hingeZ]} castShadow receiveShadow>
          <boxGeometry args={[0.08, leafH, leafW]} />
          <meshStandardMaterial color="#8a6f58" map={wood} roughness={0.78} metalness={0.04} />
        </mesh>

        <mesh position={[face, 1.7, hingeZ]}>
          <boxGeometry args={[0.012, 0.56, 0.7]} />
          <meshStandardMaterial {...glass} />
        </mesh>
        <mesh position={[face, 2.0, hingeZ]}>
          <boxGeometry args={[0.022, 0.07, 0.8]} />
          <meshStandardMaterial {...darkWood} />
        </mesh>
        <mesh position={[face, 1.4, hingeZ]}>
          <boxGeometry args={[0.022, 0.07, 0.8]} />
          <meshStandardMaterial {...darkWood} />
        </mesh>
        <mesh position={[face, 1.7, hingeZ - 0.37]}>
          <boxGeometry args={[0.022, 0.62, 0.07]} />
          <meshStandardMaterial {...darkWood} />
        </mesh>
        <mesh position={[face, 1.7, hingeZ + 0.37]}>
          <boxGeometry args={[0.022, 0.62, 0.07]} />
          <meshStandardMaterial {...darkWood} />
        </mesh>
        <mesh position={[face, 1.7, hingeZ]}>
          <boxGeometry args={[0.016, 0.56, 0.034]} />
          <meshStandardMaterial {...darkWood} />
        </mesh>

        <mesh position={[face, 1.08, hingeZ]} castShadow>
          <boxGeometry args={[0.02, 0.4, 0.72]} />
          <meshStandardMaterial color="#6e5646" map={wood} roughness={0.82} />
        </mesh>
        <mesh position={[face, 0.58, hingeZ]} castShadow>
          <boxGeometry args={[0.02, 0.46, 0.72]} />
          <meshStandardMaterial color="#6e5646" map={wood} roughness={0.82} />
        </mesh>
        <mesh position={[face, 0.12, hingeZ]} receiveShadow>
          <boxGeometry args={[0.024, 0.22, leafW - 0.06]} />
          <meshStandardMaterial color="#3e3a36" roughness={0.48} metalness={0.32} />
        </mesh>

        <mesh position={[leafX + hall * 0.01, 1.62, 0.045]} castShadow>
          <boxGeometry args={[0.04, 0.16, 0.06]} />
          <meshStandardMaterial {...metal} />
        </mesh>
        <mesh position={[leafX + hall * 0.01, 0.48, 0.045]} castShadow>
          <boxGeometry args={[0.04, 0.16, 0.06]} />
          <meshStandardMaterial {...metal} />
        </mesh>

        <group position={[0, 0, hingeZ]}>
          <DoorHandle rattles={rattles && !open} hall={hall} />
        </group>
      </group>
      <pointLight position={[hall * 0.28, 1.45, 0]} color="#e8d2b0" intensity={open ? 0.42 : 0.28} distance={2.6} decay={2} />

      {plate ? (
        <group position={[hall * 0.08, HALL.doorH + 0.28, 0]}>
          <mesh>
            <boxGeometry args={[0.045, 0.18, 0.38]} />
            <meshStandardMaterial color="#dccbb0" roughness={0.62} />
          </mesh>
          <mesh position={[hall * 0.024, 0, 0]} rotation={[0, faceY, 0]}>
            <planeGeometry args={[0.34, 0.15]} />
            <meshStandardMaterial map={plate} roughness={0.55} />
          </mesh>
        </group>
      ) : null}
    </group>
  )
}
