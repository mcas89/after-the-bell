import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { playSfx, SFX } from '../audio/mixer'
import { DOOR } from '../door/doorLayout'
import { useDoorStore } from '../door/useDoorStore'
import { HALL, HALL_DOORS, HALL_PROPS, nearDoor } from '../hallway/hallwayLayout'
import { useHallwayStore } from '../hallway/useHallwayStore'
import { requestMapTravel, useMapTravelStore } from '../maps/mapTravel'
import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { playerMotion } from '../player/playerMotion'
import { getRoom } from '../data/rooms'
import { useGameStore } from '../state/useGameStore'

const SIDE_ROOMS: Array<{
  room: 'room12' | 'room14'
  door: { x: number; z: number }
  back: string
}> = [
  { room: 'room12', door: HALL_DOORS.room12, back: 'from-room12' },
  { room: 'room14', door: HALL_DOORS.room14, back: 'from-room14' },
]

const DARK_LINE = 'Está muito escuro. Não consigo ir pra lá.'
const DARK_COOLDOWN = 5

function canAct() {
  const game = useGameStore.getState()
  return (
    game.prologueDone &&
    game.interactionState === 'gameplay' &&
    !isPhoneOpen(usePhoneStore.getState().ui) &&
    !useMapTravelStore.getState().busy
  )
}

function hallwayPrompt(x: number, z: number) {
  if (nearDoor(x, z, HALL_DOORS.room11, 1.35)) return 'E voltar'
  if (nearDoor(x, z, HALL_DOORS.room12, 1.35)) return 'E entrar'
  if (nearDoor(x, z, HALL_DOORS.room13, 1.35)) return 'E abrir'
  if (nearDoor(x, z, HALL_DOORS.room14, 1.35)) return 'E entrar'
  if (z < HALL.minZ + 1.45) return 'E olhar'
  return null
}

export function RoomTravel() {
  const cool = useRef(0)
  const darkCool = useRef(0)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.code !== 'KeyE') return
      if (!canAct() || cool.current > 0) return
      const game = useGameStore.getState()
      const hall = useHallwayStore.getState()
      const x = playerMotion.x
      const z = playerMotion.z

      if (game.currentRoom === 'hallway') {
        event.preventDefault()
        if (nearDoor(x, z, HALL_DOORS.room11, 1.45)) {
          cool.current = 0.8
          useDoorStore.getState().setNear(false)
          playSfx(SFX.doorOpen, 0.35)
          hall.setPrompt(null)
          requestMapTravel('classroom1', 'from-hallway')
          return
        }
        for (const side of SIDE_ROOMS) {
          if (!nearDoor(x, z, side.door, 1.45)) continue
          cool.current = 0.8
          playSfx(SFX.doorOpen, 0.5)
          hall.setPrompt(null)
          requestMapTravel(side.room, 'from-hallway')
          return
        }
        if (nearDoor(x, z, HALL_DOORS.room13, 1.45)) {
          hall.rattleHandle()
          hall.speak('Trancada.')
          return
        }
        if (z > HALL_PROPS.darkFrom - 0.55) {
          hall.speak(DARK_LINE)
          return
        }
        if (z < HALL.minZ + 1.5) {
          hall.speak('O pátio está vazio. Nenhuma luz.')
        }
        return
      }

      if (game.currentRoom === 'room12' || game.currentRoom === 'room14') {
        const def = getRoom(game.currentRoom)
        if (z < def.bounds.maxZ - 0.55) return
        event.preventDefault()
        const side = SIDE_ROOMS.find((item) => item.room === game.currentRoom)
        if (!side) return
        cool.current = 0.8
        playSfx(SFX.doorOpen, 0.4)
        hall.setPrompt(null)
        requestMapTravel('hallway', side.back)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useFrame((_, delta) => {
    if (cool.current > 0) cool.current -= delta
    if (darkCool.current > 0) darkCool.current -= delta
    const game = useGameStore.getState()
    const hall = useHallwayStore.getState()
    if (!canAct() || cool.current > 0) {
      if (hall.prompt) hall.setPrompt(null)
      return
    }

    const x = playerMotion.x
    const z = playerMotion.z

    if (game.currentRoom === 'classroom1' && useDoorStore.getState().phase === 'open') {
      if (x >= DOOR.wallX + 0.42 && Math.abs(z - DOOR.z) < DOOR.half - 0.08) {
        cool.current = 0.8
        useDoorStore.getState().setNear(false)
        hall.setPrompt(null)
        requestMapTravel('hallway', 'from-classroom')
        return
      }
    }

    if (game.currentRoom === 'hallway') {
      if (x > HALL.halfX - 0.42 && Math.abs(z - HALL_DOORS.room11.z) < HALL.doorHalf + 0.12) {
        cool.current = 0.8
        useDoorStore.getState().setNear(false)
        hall.setPrompt(null)
        requestMapTravel('classroom1', 'from-hallway')
        return
      }
      if (
        z >= HALL_PROPS.darkFrom - 0.52 &&
        playerMotion.analog > 0.22 &&
        Math.cos(playerMotion.yaw) > 0.28 &&
        darkCool.current <= 0
      ) {
        darkCool.current = DARK_COOLDOWN
        hall.speak(DARK_LINE)
      }
      hall.setPrompt(hallwayPrompt(x, z))
      return
    }

    if (game.currentRoom === 'room12' || game.currentRoom === 'room14') {
      const def = getRoom(game.currentRoom)
      if (z > def.bounds.maxZ - 0.28) {
        cool.current = 0.8
        const side = SIDE_ROOMS.find((item) => item.room === game.currentRoom)
        hall.setPrompt(null)
        if (side) requestMapTravel('hallway', side.back)
        return
      }
      hall.setPrompt(z > def.bounds.maxZ - 0.7 ? 'E voltar' : null)
      return
    }

    if (hall.prompt) hall.setPrompt(null)
  })

  return null
}
