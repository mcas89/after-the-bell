import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { playSfx, SFX } from '../audio/mixer'
import { DOOR } from '../door/doorLayout'
import { useDoorStore } from '../door/useDoorStore'
import { HALL, HALL_DOORS, HALL_PROPS, hallwayStopZ, nearDoor } from '../hallway/hallwayLayout'
import { hasDarkHallClues } from '../hallway/darkProgress'
import { useHallwayStore } from '../hallway/useHallwayStore'
import { requestMapTravel, useMapTravelStore } from '../maps/mapTravel'
import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { playerMotion } from '../player/playerMotion'
import { useGameStore } from '../state/useGameStore'
import { ITEM_IDS } from '../data/items'
import { useInventoryStore } from '../state/useInventoryStore'
import { LOBBY_DOOR_LIST, nearLobbyDoor, nearLobbyEntrance } from './lobbyLayout'

const DARK_LINE = 'Está muito escuro. Não consigo ir pra lá.'
const COLD_LINE = 'Não consigo atravessar. Está muito escuro e gelado.'
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

function hasKey(id: string | null) {
  if (!id) return true
  return useInventoryStore.getState().has(id)
}

function hasOtherKey(needed: string | null) {
  if (!needed) return false
  const inv = useInventoryStore.getState()
  const other = needed === ITEM_IDS.key ? ITEM_IDS.officeKey : ITEM_IDS.key
  return inv.has(other) && !inv.has(needed)
}

function tryClassroomDoor(id: keyof typeof HALL_DOORS) {
  const door = HALL_DOORS[id]
  const hall = useHallwayStore.getState()
  if (door.open && door.dest) {
    playSfx(SFX.doorOpen, 0.45)
    hall.setPrompt(null)
    requestMapTravel(door.dest, 'from-hallway')
    return
  }
  if (door.key && hasKey(door.key) && door.dest) {
    playSfx(SFX.doorOpen, 0.52)
    hall.setPrompt(null)
    requestMapTravel(door.dest, 'from-hallway')
    return
  }
  hall.rattleHandle()
  hall.speak(hasOtherKey(door.key) ? 'Não é essa.' : 'Trancada.')
}

function tryLabDoor() {
  const hall = useHallwayStore.getState()
  if (hall.labDoor === 'ajar') {
    if (!hall.beginLabOpen()) return
    playSfx(SFX.doorOpen, 0.62)
    hall.setPrompt(null)
    return
  }
  if (hall.labDoor === 'open') {
    playSfx(SFX.doorOpen, 0.45)
    hall.setPrompt(null)
    requestMapTravel('room12', 'from-hallway')
  }
}

function tryLobbyDoor(px: number, pz: number) {
  const hall = useHallwayStore.getState()
  const door = LOBBY_DOOR_LIST.find((item) => nearLobbyDoor(px, pz, item, 1.5))
  if (!door) return false
  hall.rattleHandle()
  hall.speak(door.lockedLine)
  return true
}

function lobbyPrompt(x: number, z: number) {
  if (nearLobbyEntrance(x, z)) return 'E voltar'
  if (LOBBY_DOOR_LIST.some((door) => nearLobbyDoor(x, z, door))) return 'E abrir'
  return null
}

function hallwayPrompt(x: number, z: number) {
  if (nearDoor(x, z, HALL_DOORS.room11, 1.35)) return 'E voltar'
  if (nearDoor(x, z, HALL_DOORS.room12, 1.35)) {
    return useHallwayStore.getState().labDoor === 'open' ? 'E entrar' : 'E abrir'
  }
  if (nearDoor(x, z, HALL_DOORS.room13, 1.35)) return 'E abrir'
  if (nearDoor(x, z, HALL_DOORS.room14, 1.35)) return 'E abrir'
  if (hasDarkHallClues() && z > HALL_PROPS.darkFrom - 0.9) return 'E seguir'
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
          tryClassroomDoor('room11')
          return
        }
        if (nearDoor(x, z, HALL_DOORS.room12, 1.45)) {
          cool.current = 0.8
          tryLabDoor()
          return
        }
        if (nearDoor(x, z, HALL_DOORS.room13, 1.45)) {
          cool.current = 0.8
          tryClassroomDoor('room13')
          return
        }
        if (nearDoor(x, z, HALL_DOORS.room14, 1.45)) {
          cool.current = 0.8
          tryClassroomDoor('room14')
          return
        }
        if (z > HALL_PROPS.darkFrom - 0.55) {
          if (hasDarkHallClues()) {
            cool.current = 0.8
            hall.setPrompt(null)
            requestMapTravel('passage', 'from-hallway')
            return
          }
          hall.speak(hall.seenMysteriousGirl ? COLD_LINE : DARK_LINE)
          return
        }
        if (z < HALL.minZ + 1.5) {
          hall.speak('O pátio está vazio. Nenhuma luz.')
        }
        return
      }

      if (game.currentRoom === 'passage') {
        event.preventDefault()
        if (nearLobbyEntrance(x, z) && z < 1.2) {
          cool.current = 0.8
          hall.setPrompt(null)
          requestMapTravel('hallway', 'from-passage')
          return
        }
        if (tryLobbyDoor(x, z)) {
          cool.current = 0.8
        }
        return
      }

      if (game.currentRoom === 'room12' || game.currentRoom === 'teachers' || game.currentRoom === 'room14') {
        if (Math.hypot(x - (DOOR.wallX - 0.35), z - DOOR.z) > DOOR.reach) return
        event.preventDefault()
        cool.current = 0.8
        playSfx(SFX.doorOpen, 0.4)
        hall.setPrompt(null)
        const back =
          game.currentRoom === 'teachers'
            ? 'from-teachers'
            : game.currentRoom === 'room14'
              ? 'from-room14'
              : 'from-room12'
        requestMapTravel('hallway', back)
        return
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

    if (game.currentRoom === 'room12' || game.currentRoom === 'teachers' || game.currentRoom === 'room14') {
      if (x >= DOOR.wallX + 0.42 && Math.abs(z - DOOR.z) < DOOR.half - 0.08) {
        cool.current = 0.8
        hall.setPrompt(null)
        requestMapTravel(
          'hallway',
          game.currentRoom === 'teachers'
            ? 'from-teachers'
            : game.currentRoom === 'room14'
              ? 'from-room14'
              : 'from-room12',
        )
        return
      }
      hall.setPrompt(Math.hypot(x - (DOOR.wallX - 0.35), z - DOOR.z) <= 1.55 ? 'E voltar' : null)
      return
    }

    if (game.currentRoom === 'hallway') {
      if (x > HALL.halfX - 0.42 && Math.abs(z - HALL_DOORS.room11.z) < HALL.doorHalf + 0.12) {
        cool.current = 0.8
        useDoorStore.getState().setNear(false)
        hall.setPrompt(null)
        requestMapTravel('classroom1', 'from-hallway')
        return
      }
      if (x > HALL.halfX - 0.42 && Math.abs(z - HALL_DOORS.room12.z) < HALL.doorHalf + 0.12) {
        if (hall.labDoor !== 'open') return
        cool.current = 0.8
        hall.setPrompt(null)
        requestMapTravel('room12', 'from-hallway')
        return
      }
      const hallOpen = hasDarkHallClues()
      if (hallOpen && z >= HALL.maxZ - 0.55 && Math.abs(x) < 0.95) {
        cool.current = 0.8
        hall.setPrompt(null)
        requestMapTravel('passage', 'from-hallway')
        return
      }
      const stopZ = hallwayStopZ(hall.seenMysteriousGirl)
      if (
        !hallOpen &&
        z >= stopZ - 0.62 &&
        playerMotion.analog > 0.22 &&
        Math.cos(playerMotion.yaw) > 0.28 &&
        darkCool.current <= 0
      ) {
        darkCool.current = DARK_COOLDOWN
        hall.speak(hall.seenMysteriousGirl ? COLD_LINE : DARK_LINE)
      }
      hall.setPrompt(hallwayPrompt(x, z))
      return
    }

    if (game.currentRoom === 'passage') {
      if (nearLobbyEntrance(x, z) && z < 0.32) {
        cool.current = 0.8
        hall.setPrompt(null)
        requestMapTravel('hallway', 'from-passage')
        return
      }
      hall.setPrompt(lobbyPrompt(x, z))
      return
    }

    if (hall.prompt) hall.setPrompt(null)
  })

  return null
}
