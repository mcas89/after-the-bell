import { useFrame, useLoader } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import { compileClip, sampleBlendedPose, type PoseClipJson } from './poseClip'
import { useVrm } from './useVrm'

function readClip(data: unknown): PoseClipJson {
  return (typeof data === 'string' ? JSON.parse(data) : data) as PoseClipJson
}

export function MarinaFallen() {
  const vrm = useVrm('/characters/marina.vrm')
  const poseJson = useLoader(
    THREE.FileLoader,
    '/animation/marina_caida.json',
    (loader) => {
      loader.setResponseType('json')
    },
  ) as unknown as PoseClipJson
  const clip = useMemo(() => compileClip(readClip(poseJson)), [poseJson])

  useFrame((_, delta) => {
    const pose = sampleBlendedPose(clip, clip, 0, 0, 0)
    vrm.humanoid.resetNormalizedPose()
    vrm.humanoid.setNormalizedPose(pose)
    vrm.update(delta)
  })

  return <primitive object={vrm.scene} />
}
