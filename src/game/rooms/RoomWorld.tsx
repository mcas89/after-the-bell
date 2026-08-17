import { useLayoutEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { DoorDirector } from '../door/DoorDirector'
import { HallwayDirector } from '../hallway/HallwayDirector'
import { HallwayScene } from '../hallway/HallwayScene'
import { GirlSilhouette } from '../hallway/GirlSilhouette'
import { ClassroomPlaceholder } from '../scenes/ClassroomPlaceholder'
import { useGameStore } from '../state/useGameStore'
import { SideClassroom } from './SideClassroom'
import { RoomTravel } from './RoomTravel'

function RoomFog() {
  const room = useGameStore((s) => s.currentRoom)
  const { scene, gl } = useThree()

  useLayoutEffect(() => {
    const fog = scene.fog as THREE.Fog | null
    const hallway = room === 'hallway'
    const color = hallway ? '#0b0d12' : '#0b0f15'
    scene.background = new THREE.Color(color)
    gl.setClearColor(color, 1)
    if (fog) {
      fog.color.set(color)
      fog.near = hallway ? 7.2 : 6.4
      fog.far = hallway ? 18.4 : 14.2
    }
  }, [gl, room, scene])

  return null
}

export function RoomWorld() {
  const room = useGameStore((s) => s.currentRoom)

  return (
    <>
      <RoomFog />
      {room === 'classroom1' ? (
        <>
          <ClassroomPlaceholder />
          <DoorDirector />
        </>
      ) : null}
      {room === 'hallway' ? (
        <>
          <HallwayScene />
          <GirlSilhouette />
          <HallwayDirector />
        </>
      ) : null}
      {room === 'room11' ? <SideClassroom roomId="room11" label="11" /> : null}
      {room === 'room12' ? <SideClassroom roomId="room12" label="12" /> : null}
      {room === 'room14' ? <SideClassroom roomId="room14" label="14" /> : null}
      <RoomTravel />
    </>
  )
}
