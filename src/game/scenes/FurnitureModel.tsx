import { useGLTF } from '@react-three/drei'
import { useLayoutEffect, useMemo } from 'react'
import * as THREE from 'three'
import { setFurnitureFootprint } from '../data/furniture'

type Props = {
  url: string
  position: [number, number, number]
  rotationY?: number
  targetHeight?: number
  targetWidth?: number
  kind?: 'desk' | 'teacher'
  anchor?: 'floor' | 'center'
  pickable?: boolean
  hideMaterials?: readonly string[]
  hideNodes?: readonly string[]
}

const fits = new Map<
  string,
  { scale: number; offset: THREE.Vector3; width: number; depth: number }
>()
const box = new THREE.Box3()
const size = new THREE.Vector3()
const center = new THREE.Vector3()

function measure(
  scene: THREE.Object3D,
  targetHeight: number | undefined,
  targetWidth: number | undefined,
  url: string,
  anchor: 'floor' | 'center',
) {
  const key = `${url}:${anchor}:${targetHeight ?? 0}:${targetWidth ?? 0}`
  const cached = fits.get(key)
  if (cached) return cached

  box.setFromObject(scene)
  box.getSize(size)
  box.getCenter(center)
  const hScale = targetHeight ? targetHeight / Math.max(size.y, 0.001) : Number.POSITIVE_INFINITY
  const wScale = targetWidth ? targetWidth / Math.max(size.x, 0.001) : Number.POSITIVE_INFINITY
  const scale = Number.isFinite(Math.min(hScale, wScale)) ? Math.min(hScale, wScale) : 1
  const offsetY = anchor === 'floor' ? -box.min.y : -center.y
  const fit = {
    scale,
    offset: new THREE.Vector3(-center.x, offsetY, -center.z),
    width: size.x * scale,
    depth: size.z * scale,
  }
  fits.set(key, fit)
  return fit
}

export function FurnitureModel({
  url,
  position,
  rotationY = 0,
  targetHeight,
  targetWidth,
  kind,
  anchor = 'floor',
  pickable = true,
  hideMaterials,
  hideNodes,
}: Props) {
  const gltf = useGLTF(url)
  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true)
    cloned.traverse((obj) => {
      obj.castShadow = true
      obj.receiveShadow = true
      if (!pickable) obj.raycast = () => {}
      if (hideNodes?.some((name) => obj.name === name)) obj.visible = false
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh || !hideMaterials?.length) return
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      if (mats.some((mat) => hideMaterials.includes(mat.name))) mesh.visible = false
    })
    return cloned
  }, [gltf, hideMaterials, hideNodes, pickable])

  const fit = useMemo(
    () => measure(gltf.scene, targetHeight, targetWidth, url, anchor),
    [gltf.scene, targetHeight, targetWidth, url, anchor],
  )

  useLayoutEffect(() => {
    if (kind) setFurnitureFootprint(kind, fit.width, fit.depth)
  }, [fit, kind])

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <group scale={fit.scale}>
        <primitive object={scene} position={fit.offset} />
      </group>
    </group>
  )
}

useGLTF.preload('/carteira_escola.glb')
useGLTF.preload('/mesa_professor.glb')
useGLTF.preload('/janela.glb')
useGLTF.preload('/mochila_aberta.glb')
useGLTF.preload('/mochila_fechada.glb')
useGLTF.preload('/refrigerante1.glb')
useGLTF.preload('/refrigerante2.glb')
useGLTF.preload('/prontuarios.glb')
useGLTF.preload('/livros_pilhado.glb')
useGLTF.preload('/bloco_folhas.glb')
useGLTF.preload('/armario_fechado.glb')
useGLTF.preload('/armario_aberto.glb')
useGLTF.preload('/canetas.glb')
useGLTF.preload('/folhas%20jogadas.glb')
useGLTF.preload('/chave.glb')
useGLTF.preload('/mesa_computador.glb')
useGLTF.preload('/sofa.glb')
useGLTF.preload('/poltrona.glb')
useGLTF.preload('/mesa_cadeira.glb')
useGLTF.preload('/quadro_pintura.glb')
useGLTF.preload('/quadro_pintura2.glb')
useGLTF.preload('/estatua_patio_cima.glb')
useGLTF.preload('/canteiro.glb')
useGLTF.preload('/portao_saida.glb')
useGLTF.preload('/escada_saida.glb')
useGLTF.preload('/mesa_diretora.glb')
useGLTF.preload('/pia.glb')
useGLTF.preload('/privada.glb')
useGLTF.preload('/banco_patio.glb')
useGLTF.preload('/lixeira.glb')
useGLTF.preload('/extintor.glb')
useGLTF.preload('/estante_livros1.glb')
useGLTF.preload('/estante_livros2.glb')
useGLTF.preload('/livro_aberto.glb')
useGLTF.preload('/pilha_livros1.glb')
useGLTF.preload('/cadeira_madeira.glb')
useGLTF.preload('/mesa_madeiracomgavetas.glb')
useGLTF.preload('/espelho.glb')
useGLTF.preload('/vassoura.glb')
useGLTF.preload('/produtos_limpeza.glb')
useGLTF.preload('/aspirador.glb')
useGLTF.preload('/armario_arquivos.glb')
useGLTF.preload('/pasta_arquivos.glb')
useGLTF.preload('/armario_esqueleto.glb')
useGLTF.preload('/esqueleto.glb')
