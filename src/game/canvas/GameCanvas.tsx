import { Canvas } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import type { Group } from 'three'
import { AudioRoot } from '../audio/AudioRoot'
import { Footsteps } from '../audio/Footsteps'
import { GameCamera } from '../camera/GameCamera'
import { TouchLook } from '../input/TouchLook'
import { ExamineDirector } from '../examine/ExamineDirector'
import { Player } from '../player/Player'
import { PrologueDirector } from '../prologue/PrologueDirector'
import { EndingDirector } from '../ending/EndingDirector'
import { ROOM_SHOTS } from '../data/cameras'
import { RoomWorld } from '../rooms/RoomWorld'

const CLASSROOM_SHOT = ROOM_SHOTS.classroom1

export function GameCanvas() {
  const playerRef = useRef<Group>(null)

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: CLASSROOM_SHOT.position, fov: CLASSROOM_SHOT.fov, near: 0.08, far: 90 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        background: '#0c1016',
        touchAction: 'none',
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 0.84
        gl.shadowMap.enabled = true
        gl.shadowMap.type = THREE.PCFSoftShadowMap
        gl.localClippingEnabled = true
      }}
    >
      <color attach="background" args={['#0c1016']} />
      <fog attach="fog" args={['#0b0f15', 5.6, 12.4]} />
      <AudioRoot />
      <Footsteps />
      <PrologueDirector />
      <EndingDirector />
      <ExamineDirector />
      <TouchLook />
      <RoomWorld />
      <Player groupRef={playerRef} />
      <GameCamera target={playerRef} />
    </Canvas>
  )
}
