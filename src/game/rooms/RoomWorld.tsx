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
import { BackyardRoom } from './BackyardRoom'
import { BathroomRoom } from './BathroomRoom'
import { LibraryRoom } from './LibraryRoom'
import { OfficeRoom } from './OfficeRoom'
import { PassageRoom } from './PassageRoom'
import { SideClassroom } from './SideClassroom'
import { StorageRoom } from './StorageRoom'
import { TeachersRoom } from './TeachersRoom'
import { RoomTravel } from './RoomTravel'
import { hasDarkHallClues } from '../hallway/darkProgress'
import { FLASHLIGHT_ON } from '../inventory/flashlight'
import { FlashlightBeam } from '../inventory/FlashlightBeam'
import { useFragmentsStore } from '../state/useFragmentsStore'

function RoomFog() {
  const room = useGameStore((s) => s.currentRoom)
  const hallOpen = useFragmentsStore((s) => hasDarkHallClues(s.entries))
  const flashOn = useGameStore((s) => Boolean(s.flags[FLASHLIGHT_ON]))
  const { scene, gl } = useThree()

  useLayoutEffect(() => {
    const fog = scene.fog as THREE.Fog | null
    const hallway = room === 'hallway'
    const patioWing =
      room === 'passage' || room === 'storage' || room === 'library' || room === 'bathroom' || room === 'office'
    const outside = room === 'backyard'
    const beam = patioWing && flashOn
    const color = hallway ? '#0a1018' : patioWing ? '#05070b' : outside ? '#070b12' : '#0b0f15'
    scene.background = new THREE.Color(color)
    gl.setClearColor(color, 1)
    gl.toneMappingExposure = outside ? 0.72 : 0.84
    if (fog) {
      fog.color.set(color)
      fog.near = hallway && hallOpen ? 10 : hallway ? 7.2 : beam ? 4.2 : patioWing ? 2.2 : outside ? 8 : 6.4
      fog.far = hallway && hallOpen ? 26 : hallway ? 18.4 : beam ? 16 : patioWing ? 8.2 : outside ? 36 : 14.2
    }
  }, [flashOn, gl, hallOpen, room, scene])

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
      {room === 'backyard' ? <BackyardRoom /> : null}
      <RoomTravel />
    </>
  )
}
