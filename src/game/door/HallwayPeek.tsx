import { DOOR } from './doorLayout'

const voidMat = { color: '#000000' }

export function HallwayPeek() {
  const start = DOOR.wallX + 0.06
  const len = 2.85
  const mid = start + len / 2
  const span = DOOR.half * 2 + 0.22

  return (
    <group>
      <mesh position={[mid, 1.1, DOOR.z]}>
        <boxGeometry args={[len, 2.22, span - 0.08]} />
        <meshBasicMaterial {...voidMat} />
      </mesh>
      <mesh position={[start + 0.04, 1.1, DOOR.z]}>
        <boxGeometry args={[0.1, 2.22, span - 0.1]} />
        <meshBasicMaterial {...voidMat} />
      </mesh>
      <mesh position={[mid, 0.01, DOOR.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[len, span]} />
        <meshBasicMaterial {...voidMat} />
      </mesh>
      <mesh position={[mid, 2.22, DOOR.z]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[len, span]} />
        <meshBasicMaterial {...voidMat} />
      </mesh>
      <mesh position={[mid, 1.1, DOOR.z - span / 2]} >
        <boxGeometry args={[len, 2.22, 0.08]} />
        <meshBasicMaterial {...voidMat} />
      </mesh>
      <mesh position={[mid, 1.1, DOOR.z + span / 2]}>
        <boxGeometry args={[len, 2.22, 0.08]} />
        <meshBasicMaterial {...voidMat} />
      </mesh>
      <mesh position={[start + len, 1.1, DOOR.z]}>
        <boxGeometry args={[0.16, 2.22, span]} />
        <meshBasicMaterial {...voidMat} />
      </mesh>
    </group>
  )
}
