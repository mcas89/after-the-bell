import { playSfx, SFX } from '../audio/mixer'
import { collectPromptsFor } from '../data/examineContent'
import { ITEM_IDS } from '../data/items'
import { canOpenClassroomDoor, useDoorStore } from '../door/useDoorStore'
import { useExamineStore } from '../examine/useExamineStore'
import { hasDarkHallClues } from '../hallway/darkProgress'
import { HALL, HALL_DOORS, HALL_PROPS, nearDoor } from '../hallway/hallwayLayout'
import { isHallLockerId } from '../hallway/lockers'
import { useHallwayStore } from '../hallway/useHallwayStore'
import { requestMapTravel, useMapTravelStore } from '../maps/mapTravel'
import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { playerMotion } from '../player/playerMotion'
import { LOBBY_DOOR_LIST, nearLobbyDoor, nearLobbyEntrance } from '../rooms/lobbyLayout'
import { useGameStore } from '../state/useGameStore'
import { useInventoryStore } from '../state/useInventoryStore'
import { refreshControlLock } from '../systems/controlLock'
import { DOOR } from '../door/doorLayout'

const DARK_LINE = 'Meu corpo não quer ir.'
const COLD_LINE = 'Meu corpo não quer ir.'

export const interactGate = { cool: 0 }

export function tickInteract(dt: number) {
  if (interactGate.cool > 0) interactGate.cool -= dt
}

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
  if (inv.has(needed)) return false
  return inv.has(ITEM_IDS.key) || inv.has(ITEM_IDS.officeKey) || inv.has(ITEM_IDS.janitorKey)
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
  const game = useGameStore.getState()
  if (door.kind === 'gate') {
    hall.rattleHandle()
    if (!game.flags.patioGatePushed) {
      game.addFlag('patioGatePushed')
      hall.speak('Não abre. Tem uma escada descendo.')
    } else if (!game.flags.patioGateAgain) {
      game.addFlag('patioGateAgain')
      hall.speak('Não consigo.')
    } else {
      hall.speak('Tem alguma coisa lá embaixo...')
    }
    return true
  }
  if (door.id === 'storage') {
    if (hasKey(ITEM_IDS.janitorKey) && door.dest) {
      playSfx(SFX.doorOpen, 0.52)
      hall.setPrompt(null)
      requestMapTravel(door.dest, 'from-patio')
      return true
    }
    hall.rattleHandle()
    hall.speak(hasOtherKey(ITEM_IDS.janitorKey) ? 'Não é essa.' : door.lockedLine)
    return true
  }
  if (door.open && door.dest) {
    playSfx(SFX.doorOpen, 0.45)
    hall.setPrompt(null)
    requestMapTravel(door.dest, 'from-patio')
    return true
  }
  hall.rattleHandle()
  hall.speak(door.lockedLine)
  return true
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

export function tryInteract() {
  if (interactGate.cool > 0) return false
  if (!canAct()) return false
  const game = useGameStore.getState()
  const hall = useHallwayStore.getState()
  const x = playerMotion.x
  const z = playerMotion.z

  if (game.currentRoom === 'classroom1' && canOpenClassroomDoor()) {
    if (!useDoorStore.getState().beginOpen()) return false
    interactGate.cool = 0.8
    refreshControlLock()
    playSfx(SFX.doorOpen, 0.62)
    return true
  }

  if (game.currentRoom === 'hallway') {
    if (nearDoor(x, z, HALL_DOORS.room11, 1.45)) {
      interactGate.cool = 0.8
      useDoorStore.getState().setNear(false)
      tryClassroomDoor('room11')
      return true
    }
    if (nearDoor(x, z, HALL_DOORS.room12, 1.45)) {
      interactGate.cool = 0.8
      tryLabDoor()
      return true
    }
    if (nearDoor(x, z, HALL_DOORS.room13, 1.45)) {
      interactGate.cool = 0.8
      tryClassroomDoor('room13')
      return true
    }
    if (nearDoor(x, z, HALL_DOORS.room14, 1.45)) {
      interactGate.cool = 0.8
      tryClassroomDoor('room14')
      return true
    }
    if (z > HALL_PROPS.darkFrom - 0.55) {
      if (hasDarkHallClues()) {
        interactGate.cool = 0.8
        hall.setPrompt(null)
        requestMapTravel('passage', 'from-hallway')
        return true
      }
      hall.speak(hall.seenMysteriousGirl ? COLD_LINE : DARK_LINE)
      return true
    }
    if (z < HALL.minZ + 1.5) {
      hall.speak('O pátio está vazio. Nenhuma luz.')
      return true
    }
    return false
  }

  if (game.currentRoom === 'passage') {
    if (nearLobbyEntrance(x, z) && z < 1.2) {
      interactGate.cool = 0.8
      hall.setPrompt(null)
      requestMapTravel('hallway', 'from-passage')
      return true
    }
    if (tryLobbyDoor(x, z)) {
      interactGate.cool = 0.8
      return true
    }
    return false
  }

  if (isPatioRoom(game.currentRoom)) {
    if (Math.hypot(x - (DOOR.wallX - 0.35), z - DOOR.z) > DOOR.reach) return false
    interactGate.cool = 0.8
    playSfx(SFX.doorOpen, 0.4)
    hall.setPrompt(null)
    if (game.currentRoom === 'bathroom' && game.flags.bathWetSeen) game.addFlag('bathWetGone')
    requestMapTravel('passage', patioBack(game.currentRoom))
    return true
  }

  if (game.currentRoom === 'room12' || game.currentRoom === 'teachers' || game.currentRoom === 'room14') {
    if (Math.hypot(x - (DOOR.wallX - 0.35), z - DOOR.z) > DOOR.reach) return false
    interactGate.cool = 0.8
    playSfx(SFX.doorOpen, 0.4)
    hall.setPrompt(null)
    const back =
      game.currentRoom === 'teachers'
        ? 'from-teachers'
        : game.currentRoom === 'room14'
          ? 'from-room14'
          : 'from-room12'
    requestMapTravel('hallway', back)
    return true
  }

  return false
}

export function tryCollect(itemId?: string) {
  const game = useGameStore.getState()
  if (!game.prologueDone) return false
  if (isPhoneOpen(usePhoneStore.getState().ui)) return false
  if (game.interactionState !== 'examining-object') return false
  const examine = useExamineStore.getState()
  const inventory = useInventoryStore.getState()
  const prompts = collectPromptsFor(examine.examiningId, examine.detailId)
  const prompt = itemId ? prompts.find((entry) => entry.id === itemId) : prompts[0]
  if (!prompt || inventory.has(prompt.id)) return false
  inventory.collect(prompt.id)
  if (examine.examiningId === 'teachers-cabinet') {
    if (examine.detailId) useExamineStore.setState({ detailId: null })
    return true
  }
  if (isHallLockerId(examine.examiningId)) {
    if (examine.detailId) useExamineStore.setState({ detailId: null })
    return true
  }
  useExamineStore.getState().stopInspect()
  return true
}
