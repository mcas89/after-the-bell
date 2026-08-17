import * as THREE from 'three'
import { getWrittenTexture } from './paperTextures'

const PAPER_DESK: [number, number] = [-0.95, -0.25]
const DESK_TOP = 0.86
const TEACHER_TOP = 0.76

function Overlay({
  position,
  rotation,
  size,
  kind,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
  size: [number, number]
  kind: 'bloco' | 'chao' | 'prontuario'
}) {
  return (
    <mesh position={position} rotation={rotation} renderOrder={2}>
      <planeGeometry args={size} />
      <meshStandardMaterial
        map={getWrittenTexture(kind)}
        roughness={0.88}
        side={THREE.DoubleSide}
        polygonOffset
        polygonOffsetFactor={-2}
        polygonOffsetUnits={-2}
      />
    </mesh>
  )
}

export function WrittenSurfaces() {
  return (
    <group>
      <Overlay
        kind="bloco"
        position={[PAPER_DESK[0] + 0.02, DESK_TOP - 0.145, PAPER_DESK[1] - 0.16]}
        rotation={[-Math.PI / 2, 0, Math.PI - 0.12]}
        size={[0.2, 0.28]}
      />
      <Overlay
        kind="chao"
        position={[0.34, 0.012, 0.92]}
        rotation={[-Math.PI / 2, 0, 0.55]}
        size={[0.46, 0.34]}
      />
      <Overlay
        kind="prontuario"
        position={[-0.22, TEACHER_TOP + 0.03, -2.48]}
        rotation={[-Math.PI / 2, 0, 0.18]}
        size={[0.28, 0.36]}
      />
    </group>
  )
}
