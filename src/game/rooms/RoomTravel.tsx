import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { DOOR, roomWallDoor } from '../door/doorLayout'
import { useDoorStore } from '../door/useDoorStore'
import { HALL, HALL_DOORS, HALL_PROPS, hallwayStopZ, nearDoor } from '../hallway/hallwayLayout'
import { hasDarkHallClues } from '../hallway/darkProgress'
import { useHallwayStore } from '../hallway/useHallwayStore'
import { interactGate, tickInteract, tryInteract } from '../input/actions'
import { requestMapTravel, useMapTravelStore } from '../maps/mapTravel'
import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { playerMotion } from '../player/playerMotion'
import { useGameStore } from '../state/useGameStore'
import { ITEM_IDS } from '../data/items'
import type { RoomId } from '../data/rooms'
import { useInventoryStore } from '../state/useInventoryStore'
import { LOBBY_DOOR_LIST, inLobbyDoorway, nearLobbyDoor, nearLobbyEntrance } from './lobbyLayout'
import { canDescendPatio } from './patioProgress'
import { isSkeletonScare } from './skeletonCabinet'

const DARK_LINE = 'Meu corpo não quer ir.'
const COLD_LINE = 'Meu corpo não quer ir.'
const DARK_COOLDOWN = 5

function canAct() {
  const game = useGameStore.getState()
  return (
    game.prologueDone &&
    game.interactionState === 'gameplay' &&
    !isPhoneOpen(usePhoneStore.getState().ui) &&
    !useMapTravelStore.getState().busy &&
    !isSkeletonScare()
  )
}

function lobbyPrompt(x: number, z: number) {
  if (nearLobbyEntrance(x, z)) return 'E voltar'
  const door = LOBBY_DOOR_LIST.find((item) => nearLobbyDoor(x, z, item))
  if (!door) return null
  if (door.kind === 'gate') return canDescendPatio() ? 'E descer' : 'E empurrar'
  const inv = useInventoryStore.getState()
  if (
    door.open ||
    (door.id === 'storage' && inv.has(ITEM_IDS.janitorKey)) ||
    (door.id === 'library' && inv.has(ITEM_IDS.bibKey)) ||
    (door.id === 'office' && inv.has(ITEM_IDS.dirKey))
  ) {
    return 'E entrar'
  }
  return 'E abrir'
}

function isPatioRoom(room: string) {
  return room === 'library' || room === 'bathroom' || room === 'storage' || room === 'office'
}

function patioBack(room: string) {
  if (room === 'library') return 'from-library'
  if (room === 'bathroom') return 'from-bathroom'
  if (room === 'storage') return 'from-storage'
  return 'from-office'
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
  const darkCool = useRef(0)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.code !== 'KeyE') return
      if (!canAct()) return
      event.preventDefault()
      tryInteract()
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useFrame((_, delta) => {
    tickInteract(delta)
    if (darkCool.current > 0) darkCool.current -= delta
    const game = useGameStore.getState()
    const hall = useHallwayStore.getState()
    if (!canAct() || interactGate.cool > 0) {
      if (hall.prompt) hall.setPrompt(null)
      return
    }

    const x = playerMotion.x
    const z = playerMotion.z

    if (game.currentRoom === 'classroom1' && useDoorStore.getState().phase === 'open') {
      if (x >= DOOR.wallX + 0.42 && Math.abs(z - DOOR.z) < DOOR.half - 0.08) {
        interactGate.cool = 0.8
        useDoorStore.getState().setNear(false)
        hall.setPrompt(null)
        requestMapTravel('hallway', 'from-classroom')
        return
      }
    }

    if (isPatioRoom(game.currentRoom)) {
      const door = roomWallDoor(game.currentRoom as RoomId)
      if (x >= door.wallX + 0.42 && Math.abs(z - door.z) < door.half - 0.08) {
        interactGate.cool = 0.8
        hall.setPrompt(null)
        if (game.currentRoom === 'bathroom' && game.flags.bathWetSeen) game.addFlag('bathWetGone')
        requestMapTravel('passage', patioBack(game.currentRoom))
        return
      }
      hall.setPrompt(Math.hypot(x - (door.wallX - 0.35), z - door.z) <= 1.55 ? 'E voltar' : null)
      return
    }

    if (game.currentRoom === 'room12' || game.currentRoom === 'teachers' || game.currentRoom === 'room14') {
      if (x >= DOOR.wallX + 0.42 && Math.abs(z - DOOR.z) < DOOR.half - 0.08) {
        interactGate.cool = 0.8
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
        interactGate.cool = 0.8
        useDoorStore.getState().setNear(false)
        hall.setPrompt(null)
        requestMapTravel('classroom1', 'from-hallway')
        return
      }
      if (x > HALL.halfX - 0.42 && Math.abs(z - HALL_DOORS.room12.z) < HALL.doorHalf + 0.12) {
        if (hall.labDoor !== 'open') return
        interactGate.cool = 0.8
        hall.setPrompt(null)
        requestMapTravel('room12', 'from-hallway')
        return
      }
      const hallOpen = hasDarkHallClues()
      if (hallOpen && z >= HALL.maxZ - 0.55 && Math.abs(x) < 0.95) {
        interactGate.cool = 0.8
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
        interactGate.cool = 0.8
        hall.setPrompt(null)
        requestMapTravel('hallway', 'from-passage')
        return
      }
      const openDoor = LOBBY_DOOR_LIST.find((door) => door.open && door.dest && inLobbyDoorway(x, z, door))
      if (openDoor?.dest) {
        interactGate.cool = 0.8
        hall.setPrompt(null)
        requestMapTravel(openDoor.dest, 'from-patio')
        return
      }
      hall.setPrompt(lobbyPrompt(x, z))
      return
    }

    if (game.currentRoom === 'backyard') {
      hall.setPrompt(z > 1.42 ? 'E voltar' : null)
      return
    }

    if (hall.prompt) hall.setPrompt(null)
  })

  return null
}
