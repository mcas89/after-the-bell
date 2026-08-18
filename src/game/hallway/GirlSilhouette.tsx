import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { compileClip, sampleBlendedPose, type PoseClipJson } from '../player/poseClip'
import { useVrm } from '../player/useVrm'
import { HALL_PROPS } from './hallwayLayout'
import { useHallwayStore } from './useHallwayStore'

const WALK_SPEED = 0.52
const STRIDE = 0.92
const IDLE_RATE = 0.72
const BLEND = 3.4

export const girlMotion: { z: number } = {
  z: HALL_PROPS.girlStand,
}

function readClip(data: unknown): PoseClipJson {
  return (typeof data === 'string' ? JSON.parse(data) : data) as PoseClipJson
}

function paintShadow(root: THREE.Object3D) {
  if (root.userData.silhouetted) return
  root.userData.silhouetted = true
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.material = new THREE.MeshLambertMaterial({
      color: '#000000',
      emissive: '#000000',
      fog: true,
      transparent: true,
      opacity: 0.82,
    })
    mesh.castShadow = false
    mesh.receiveShadow = false
    mesh.frustumCulled = false
  })
}

function MarinaShade() {
  const startZ = useHallwayStore((s) => s.girlZ)
  const walking = useHallwayStore((s) => s.girlWalking)
  const vrm = useVrm('/characters/Livia.vrm?silhouette=1')
  const idleJson = useLoader(
    THREE.FileLoader,
    '/animation/vida_completo.json',
    (loader) => {
      loader.setResponseType('json')
    },
  ) as unknown as PoseClipJson
  const walkJson = useLoader(
    THREE.FileLoader,
    '/animation/andar.json',
    (loader) => {
      loader.setResponseType('json')
    },
  ) as unknown as PoseClipJson
  const idleClip = useMemo(() => compileClip(readClip(idleJson)), [idleJson])
  const walkClip = useMemo(() => compileClip(readClip(walkJson)), [walkJson])
  const group = useRef<THREE.Group>(null)
  const idleTime = useRef(0)
  const walkTime = useRef(0)
  const walkWeight = useRef(0)
  const z = useRef(startZ)

  useLayoutEffect(() => {
    paintShadow(vrm.scene)
    z.current = startZ
    girlMotion.z = startZ
    if (group.current) group.current.position.z = startZ
  }, [startZ, vrm])

  useFrame((_, delta) => {
    const want = walking ? 1 : 0
    walkWeight.current = THREE.MathUtils.damp(walkWeight.current, want, BLEND, delta)
    idleTime.current += delta * IDLE_RATE
    walkTime.current += delta * (walkClip.duration * (Math.max(WALK_SPEED, 0.12) / STRIDE))

    const pose = sampleBlendedPose(
      idleClip,
      walkClip,
      idleTime.current,
      walkTime.current,
      walkWeight.current,
    )
    vrm.humanoid.resetNormalizedPose()
    vrm.humanoid.setNormalizedPose(pose)
    vrm.update(delta)

    if (walking) {
      z.current += WALK_SPEED * delta
      if (z.current > HALL_PROPS.darkFrom + 0.9) z.current = HALL_PROPS.darkFrom + 0.9
    }
    girlMotion.z = z.current
    if (group.current) group.current.position.z = z.current
  })

  return (
    <group ref={group} position={[0.05, 0, startZ]} rotation={[0, 0, 0]}>
      <group scale={[1.045, 1.02, 1.045]} position={[0, 0, 0.03]}>
        <primitive object={vrm.scene} />
      </group>
      <mesh position={[0, 0.92, 0.06]} renderOrder={1}>
        <planeGeometry args={[0.82, 1.78]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.22} depthWrite={false} fog side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0.08, 1.45, 1.25]} color="#8aa3bb" intensity={2.1} distance={3.8} decay={2} />
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
