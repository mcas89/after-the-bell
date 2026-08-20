import { Canvas, useThree } from '@react-three/fiber'
import { Suspense, useLayoutEffect } from 'react'
import { create } from 'zustand'
import { duckMusic, holdAmbient, playSfx, SFX } from '../audio/mixer'
import { useExamineStore } from '../examine/useExamineStore'
import { useHallwayStore } from '../hallway/useHallwayStore'
import { FurnitureModel } from '../scenes/FurnitureModel'
import { playerMotion } from '../player/playerMotion'
import { saveManager } from '../state/gameSaveManager'
import { useGameStore } from '../state/useGameStore'

export const ZEL_SKELETON_OPEN = 'zelSkeletonOpen'
export const ZEL_SKELETON_AIM = { x: 0.72, z: -3.2 }

const NEED_PULLS = 6
const LINES = ['Não sai.', 'Trava.', 'Não sai.', 'Quase.', 'Vai.']

let pulls = 0
let scareTimer = 0

export const useSkeletonScareStore = create<{ active: boolean }>(() => ({ active: false }))

export function isSkeletonScare() {
  return useSkeletonScareStore.getState().active
}

export function resetSkeletonCabinet() {
  pulls = 0
  playerMotion.forcePulse = 0
  if (playerMotion.forceFacing) {
    playerMotion.faceYaw = null
    playerMotion.forceFacing = false
  }
  window.clearTimeout(scareTimer)
  useSkeletonScareStore.setState({ active: false })
}

export function tryForceSkeletonCabinet() {
  const game = useGameStore.getState()
  if (game.flags[ZEL_SKELETON_OPEN]) return false
  if (game.interactionState !== 'examining-object') return false
  if (useExamineStore.getState().examiningId !== 'zel-skeleton') return false

  pulls += 1
  playerMotion.forcePulse = 1
  const hall = useHallwayStore.getState()
  hall.rattleHandle()
  playSfx(SFX.clickItem, 0.46)

  if (pulls < NEED_PULLS) {
    hall.speak(LINES[(pulls - 1) % LINES.length])
    return true
  }

  game.addFlag(ZEL_SKELETON_OPEN)
  saveManager.save()
  useExamineStore.getState().stopInspect()
  holdAmbient(2600)
  duckMusic(0.08, 2400)
  playSfx(SFX.scareMoment, 0.96)
  useSkeletonScareStore.setState({ active: true })
  playerMotion.controlLocked = true
  window.clearTimeout(scareTimer)
  scareTimer = window.setTimeout(() => {
    useSkeletonScareStore.setState({ active: false })
    playerMotion.controlLocked = false
  }, 2400)
  return true
}

function ScareHeadCam() {
  const { camera } = useThree()
  useLayoutEffect(() => {
    camera.position.set(0.48, 2.12, 0.02)
    camera.lookAt(0, 2.02, 0)
    camera.updateProjectionMatrix()
  }, [camera])
  return null
}

export function SkeletonScareOverlay() {
  const on = useSkeletonScareStore((s) => s.active)
  if (!on) return null
  return (
    <div className="skeleton-scare">
      <Canvas
        camera={{ position: [0.48, 2.12, 0.02], fov: 28, near: 0.04, far: 8 }}
        gl={{ antialias: true, alpha: false }}
        style={{ width: '100%', height: '100%' }}
      >
        <ScareHeadCam />
        <color attach="background" args={['#070504']} />
        <ambientLight intensity={0.42} color="#c8b8a8" />
        <directionalLight position={[1.2, 3.2, 0.4]} intensity={1.55} color="#efe2d0" />
        <pointLight position={[0.35, 2.35, 0.4]} intensity={3.8} distance={4} decay={1.6} color="#f0d8c0" />
        <Suspense fallback={null}>
          <FurnitureModel
            url="/esqueleto.glb"
            position={[0, 0, 0]}
            rotationY={Math.PI / 2}
            targetHeight={2.35}
            pickable={false}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
