import { useLoader } from '@react-three/fiber'
import { VRMLoaderPlugin, VRMUtils, type VRM } from '@pixiv/three-vrm'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const prepared = new WeakSet<VRM>()
const box = new THREE.Box3()
const size = new THREE.Vector3()

function prepareVrm(vrm: VRM) {
  if (prepared.has(vrm)) return
  prepared.add(vrm)

  try {
    VRMUtils.removeUnnecessaryVertices(vrm.scene)
    VRMUtils.combineSkeletons(vrm.scene)
    VRMUtils.rotateVRM0(vrm)
  } catch {
    VRMUtils.rotateVRM0(vrm)
  }

  vrm.scene.scale.set(1, 1, 1)
  box.setFromObject(vrm.scene)
  box.getSize(size)
  if (size.y > 0.01) {
    vrm.scene.scale.setScalar(1.32 / size.y)
  }

  vrm.scene.traverse((obj) => {
    obj.frustumCulled = false
    obj.castShadow = true
    obj.receiveShadow = true
  })
}

export function useVrm(url: string): VRM {
  const gltf = useLoader(GLTFLoader, url, (loader) => {
    loader.register((parser) => new VRMLoaderPlugin(parser))
  })

  const vrm = gltf.userData.vrm as VRM
  if (!vrm) {
    throw new Error(`VRM não encontrado em ${url}`)
  }

  prepareVrm(vrm)
  return vrm
}
