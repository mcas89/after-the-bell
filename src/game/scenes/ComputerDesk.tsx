import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Examinable } from '../examine/Examinable'

const box = new THREE.Box3()
const size = new THREE.Vector3()
const center = new THREE.Vector3()
const TARGET_H = 1.28

type Props = {
  id: string
  position: [number, number, number]
  rotationY: number
  on?: boolean
}

function tintDesk(scene: THREE.Object3D, on: boolean, screenMats: THREE.MeshStandardMaterial[]) {
  scene.traverse((obj) => {
    obj.castShadow = true
    obj.receiveShadow = true
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    const next = list.map((mat) => {
      const std = mat.clone() as THREE.MeshStandardMaterial
      std.userData._examineClone = true
      if (std.name === 'mat21') {
        if (on) {
          std.color.set('#c5eaf4')
          std.emissive.set('#8fd4e6')
          std.emissiveIntensity = 0.95
          std.roughness = 0.22
          screenMats.push(std)
        } else {
          std.color.set('#0b0d12')
          std.emissive.set('#000000')
          std.emissiveIntensity = 0
          std.roughness = 0.42
        }
      }
      if (std.name === 'mat3') {
        if (on) {
          std.emissive.set('#81dfeb')
          std.emissiveIntensity = 1.35
        } else {
          std.color.set('#1a1c1e')
          std.emissive.set('#000000')
          std.emissiveIntensity = 0
        }
      }
      return std
    })
    mesh.material = Array.isArray(mesh.material) ? next : next[0]
  })
}

function OnGlow({ mats }: { mats: THREE.MeshStandardMaterial[] }) {
  const light = useRef<THREE.PointLight>(null)

  useFrame(({ clock }) => {
    const pulse = 0.78 + Math.sin(clock.elapsedTime * 2.05) * 0.22
    if (light.current) light.current.intensity = pulse
    for (const mat of mats) mat.emissiveIntensity = 0.72 + pulse * 0.4
  })

  return (
    <pointLight
      ref={light}
      position={[0, 1.04, 0.22]}
      color="#9ad4e6"
      intensity={0.85}
      distance={3.6}
      decay={2}
    />
  )
}

export function ComputerDesk({ id, position, rotationY, on = false }: Props) {
  const gltf = useGLTF('/mesa_computador.glb')
  const { scene, mats } = useMemo(() => {
    const screenMats: THREE.MeshStandardMaterial[] = []
    const cloned = gltf.scene.clone(true)
    tintDesk(cloned, on, screenMats)
    return { scene: cloned, mats: screenMats }
  }, [gltf, on])

  const fit = useMemo(() => {
    box.setFromObject(gltf.scene)
    box.getSize(size)
    box.getCenter(center)
    const scale = TARGET_H / Math.max(size.y, 0.001)
    return {
      scale,
      offset: new THREE.Vector3(-center.x, -box.min.y, -center.z),
    }
  }, [gltf.scene])

  return (
    <Examinable id={id}>
      <group position={position} rotation={[0, rotationY, 0]}>
        <group scale={fit.scale}>
          <primitive object={scene} position={fit.offset} />
        </group>
        {on ? <OnGlow mats={mats} /> : null}
      </group>
    </Examinable>
  )
}

useGLTF.preload('/mesa_computador.glb')
