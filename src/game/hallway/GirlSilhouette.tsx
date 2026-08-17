import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { compileClip, sampleBlendedPose, type PoseClipJson } from '../player/poseClip'
import { useVrm } from '../player/useVrm'
import { useHallwayStore } from './useHallwayStore'

const WALK_SPEED = 0.34
const STRIDE = 0.92

function readClip(data: unknown): PoseClipJson {
  return (typeof data === 'string' ? JSON.parse(data) : data) as PoseClipJson
}

function paintBlack(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.material = new THREE.MeshBasicMaterial({ color: '#050508', fog: true })
    mesh.castShadow = false
    mesh.receiveShadow = false
  })
}

function MarinaShade() {
  const startZ = useHallwayStore((s) => s.girlZ)
  const vrm = useVrm('/characters/Livia.vrm?silhouette=1')
  const walkJson = useLoader(
    THREE.FileLoader,
    '/animation/andar.json',
    (loader) => {
      loader.setResponseType('json')
    },
  ) as unknown as PoseClipJson
  const walkClip = useMemo(() => compileClip(readClip(walkJson)), [walkJson])
  const group = useRef<THREE.Group>(null)
  const walkTime = useRef(0)
  const z = useRef(startZ)

  useLayoutEffect(() => {
    paintBlack(vrm.scene)
    z.current = startZ
    if (group.current) group.current.position.z = startZ
  }, [startZ, vrm])

  useFrame((_, delta) => {
    walkTime.current += delta * (walkClip.duration * (WALK_SPEED / STRIDE))
    const pose = sampleBlendedPose(walkClip, walkClip, walkTime.current, walkTime.current, 1)
    vrm.humanoid.resetNormalizedPose()
    vrm.humanoid.setNormalizedPose(pose)
    vrm.update(delta)

    z.current += WALK_SPEED * delta
    if (group.current) group.current.position.z = z.current
  })

  return (
    <group ref={group} position={[0.04, 0, startZ]} rotation={[0, 0, 0]}>
      <primitive object={vrm.scene} />
    </group>
  )
}

export function GirlSilhouette() {
  const visible = useHallwayStore((s) => s.girlVisible)
  if (!visible) return null

  return (
    <Suspense fallback={null}>
      <MarinaShade />
    </Suspense>
  )
}
