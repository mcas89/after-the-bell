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
import { FLASHLIGHT_ON, LOBBY_LIGHTS } from '../inventory/flashlight'
import { FlashlightBeam } from '../inventory/FlashlightBeam'
import { useFragmentsStore } from '../state/useFragmentsStore'

function RoomFog() {
  const room = useGameStore((s) => s.currentRoom)
  const hallOpen = useFragmentsStore((s) => hasDarkHallClues(s.entries))
  const patioLit = useGameStore((s) => Boolean(s.flags[LOBBY_LIGHTS]))
  const flashOn = useGameStore((s) => Boolean(s.flags[FLASHLIGHT_ON]))
  const { scene, gl } = useThree()

  useLayoutEffect(() => {
    const fog = scene.fog as THREE.Fog | null
    const hallway = room === 'hallway'
    const switched = room === 'passage' || room === 'storage'
    const patio = room === 'library' || room === 'bathroom' || room === 'office'
    const stairs = room === 'backyard'
    const beam = switched && !patioLit && flashOn
    const color =
      switched && patioLit
        ? '#121820'
        : hallway
          ? '#0a1018'
          : switched
            ? '#05070b'
            : patio
              ? '#0a1018'
              : stairs
                ? '#05070b'
                : '#0b0f15'
    scene.background = new THREE.Color(color)
    gl.setClearColor(color, 1)
    gl.toneMappingExposure = switched && patioLit ? 0.94 : 0.84
    if (fog) {
      fog.color.set(color)
      fog.near =
        hallway && hallOpen
          ? 10
          : hallway
            ? 7.2
            : switched && patioLit
              ? 10
              : beam
                ? 4.2
                : switched
                  ? 2.2
                  : patio
                    ? 4.2
                    : stairs
                      ? 2.4
                      : 6.4
      fog.far =
        hallway && hallOpen
          ? 26
          : hallway
            ? 18.4
            : switched && patioLit
              ? 28
              : beam
                ? 16
                : switched
                  ? 8.2
                  : patio
                    ? 11
                    : stairs
                      ? 8.4
                      : 14.2
    }
  }, [flashOn, gl, hallOpen, patioLit, room, scene])

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
