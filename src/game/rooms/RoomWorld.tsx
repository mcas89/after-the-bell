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
import { BathroomRoom } from './BathroomRoom'
import { LibraryRoom } from './LibraryRoom'
import { OfficeRoom } from './OfficeRoom'
import { PassageRoom } from './PassageRoom'
import { SideClassroom } from './SideClassroom'
import { StorageRoom } from './StorageRoom'
import { TeachersRoom } from './TeachersRoom'
import { RoomTravel } from './RoomTravel'
import { hasDarkHallClues } from '../hallway/darkProgress'
import { LOBBY_LIGHTS } from '../inventory/flashlight'
import { FlashlightBeam } from '../inventory/FlashlightBeam'
import { useFragmentsStore } from '../state/useFragmentsStore'

function RoomFog() {
  const room = useGameStore((s) => s.currentRoom)
  const hallOpen = useFragmentsStore((s) => hasDarkHallClues(s.entries))
  const patioLit = useGameStore((s) => Boolean(s.flags[LOBBY_LIGHTS]))
  const { scene, gl } = useThree()

  useLayoutEffect(() => {
    const fog = scene.fog as THREE.Fog | null
    const hallway = room === 'hallway'
    const patio = room === 'passage' || room === 'library' || room === 'bathroom' || room === 'storage' || room === 'office'
    const color =
      hallway || (room === 'passage' && patioLit)
        ? '#0a1018'
        : room === 'passage'
          ? '#05070b'
          : patio
            ? '#0a1018'
            : '#0b0f15'
    scene.background = new THREE.Color(color)
    gl.setClearColor(color, 1)
    if (fog) {
      fog.color.set(color)
      fog.near = hallway && hallOpen ? 10 : hallway ? 7.2 : room === 'passage' && patioLit ? 7.4 : room === 'passage' ? 2.2 : room === 'library' || room === 'bathroom' || room === 'storage' || room === 'office' ? 4.2 : 6.4
      fog.far = hallway && hallOpen ? 26 : hallway ? 18.4 : room === 'passage' && patioLit ? 20 : room === 'passage' ? 8.2 : room === 'library' || room === 'bathroom' || room === 'storage' || room === 'office' ? 11 : 14.2
    }
  }, [gl, hallOpen, patioLit, room, scene])

  return null
}

export function RoomWorld() {
  const room = useGameStore((s) => s.currentRoom)

  return (
    <>
      <RoomFog />
      <FlashlightBeam />
      <WindowTerror />
      {room === 'classroom1' ? (
        <>
          <ClassroomPlaceholder />
          <DoorDirector />
        </>
      ) : null}
      <GirlSilhouette />
      {room === 'hallway' ? (
        <>
          <HallwayScene />
          <HallwayDirector />
        </>
      ) : null}
      {room === 'room12' ? <SideClassroom /> : null}
      {room === 'room14' ? <ArtsRoom /> : null}
      {room === 'teachers' ? <TeachersRoom /> : null}
      {room === 'passage' ? <PassageRoom /> : null}
      {room === 'library' ? <LibraryRoom /> : null}
      {room === 'bathroom' ? <BathroomRoom /> : null}
      {room === 'storage' ? <StorageRoom /> : null}
      {room === 'office' ? <OfficeRoom /> : null}
      <RoomTravel />
    </>
  )
}
