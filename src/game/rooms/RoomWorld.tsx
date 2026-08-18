import { useLayoutEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { DoorDirector } from '../door/DoorDirector'
import { HallwayDirector } from '../hallway/HallwayDirector'
import { HallwayScene } from '../hallway/HallwayScene'
import { GirlSilhouette } from '../hallway/GirlSilhouette'
import { ClassroomPlaceholder } from '../scenes/ClassroomPlaceholder'
import { WindowTerror } from '../atmosphere/WindowTerror'
import { useGameStore } from '../state/useGameStore'
import { ArtsRoom } from './ArtsRoom'
import { PassageRoom } from './PassageRoom'
import { SideClassroom } from './SideClassroom'
import { TeachersRoom } from './TeachersRoom'
import { RoomTravel } from './RoomTravel'
import { hasDarkHallClues } from '../hallway/darkProgress'
import { useFragmentsStore } from '../state/useFragmentsStore'

function RoomFog() {
  const room = useGameStore((s) => s.currentRoom)
  const hallOpen = useFragmentsStore((s) => hasDarkHallClues(s.entries))
  const { scene, gl } = useThree()

  useLayoutEffect(() => {
    const fog = scene.fog as THREE.Fog | null
    const hallway = room === 'hallway'
    const passage = room === 'passage'
    const color = hallway || passage ? '#0b0d12' : '#0b0f15'
    scene.background = new THREE.Color(color)
    gl.setClearColor(color, 1)
    if (fog) {
      fog.color.set(color)
      fog.near = hallway && hallOpen ? 10 : hallway ? 7.2 : passage ? 8.2 : 6.4
      fog.far = hallway && hallOpen ? 26 : hallway ? 18.4 : passage ? 22 : 14.2
    }
  }, [gl, hallOpen, room, scene])

  return null
}

export function RoomWorld() {
  const room = useGameStore((s) => s.currentRoom)

  return (
    <>
      <RoomFog />
      <WindowTerror />
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
      {room === 'room12' ? <SideClassroom /> : null}
      {room === 'room14' ? <ArtsRoom /> : null}
      {room === 'teachers' ? <TeachersRoom /> : null}
      {room === 'passage' ? <PassageRoom /> : null}
      <RoomTravel />
    </>
  )
}
