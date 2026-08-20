import type { ClueProgress } from '../data/clues'
import { CLASSROOM_1, getRoom, migrateRoomId } from '../data/rooms'
import { playerMotion } from '../player/playerMotion'
import { usePhoneStore } from '../phone/phoneStore'
import { refreshControlLock } from '../systems/controlLock'
import { emptySave, saveManager, type GameSave, type SavedStory } from './gameSaveManager'
import { useFragmentsStore } from './useFragmentsStore'
import { useInventoryStore } from './useInventoryStore'
import { clampWithDoor } from '../door/doorLayout'
import { useDoorStore } from '../door/useDoorStore'
import { useHallwayStore } from '../hallway/useHallwayStore'
import { useComputerStore } from '../computer/computerStore'
import { useGameStore } from './useGameStore'
import { resetSkeletonCabinet } from '../rooms/skeletonCabinet'

function progressFromLists(save: GameSave): Record<string, ClueProgress> {
  if (save.clues.progress && Object.keys(save.clues.progress).length > 0) {
    return save.clues.progress
  }
  const entries: Record<string, ClueProgress> = {}
  for (const id of save.clues.discovered) {
    entries[id] = {
      discovered: true,
      read: save.clues.read.includes(id),
      discoveredAt: save.updatedAt || Date.now(),
      stage: 0,
    }
  }
  return entries
}

function collectGameSave(): GameSave {
  const game = useGameStore.getState()
  const phone = usePhoneStore.getState()
  const fragments = useFragmentsStore.getState()
  const hallway = useHallwayStore.getState()
  const discovered: string[] = []
  const read: string[] = []
  for (const [id, progress] of Object.entries(fragments.entries)) {
    if (!progress.discovered) continue
    discovered.push(id)
    if (progress.read) read.push(id)
  }

  return {
    version: 1,
    scene: game.currentRoom,
    player: {
      position: { x: playerMotion.x, y: 0, z: playerMotion.z },
      rotation: playerMotion.yaw,
      walked: playerMotion.distanceWalked,
    },
    story: {
      prologueIntroCompleted: game.prologueDone,
      phoneIntroduced: phone.triggered,
      phone0317Seen: Boolean(game.flags.phone0317Seen),
      doorEventTriggered:
        useDoorStore.getState().eventTriggered || Boolean(game.flags.doorEventTriggered),
      doorOpened: useDoorStore.getState().phase === 'open' || Boolean(game.flags.doorOpened),
      classroomDoorOpened:
        useDoorStore.getState().phase === 'open' || Boolean(game.flags.classroomDoorOpened),
      enteredCorridor: hallway.enteredCorridor,
      seenDoor203: hallway.seenDoor203,
      door203Disappeared: hallway.door203Disappeared,
      foundSecretary: hallway.foundSecretary,
      seenMysteriousGirl: hallway.seenMysteriousGirl,
      currentObjective: hallway.objective,
      entryPoint: game.entryPoint,
    },
    phone: {
      unlocked: game.phoneUnlocked,
      time: '03:17',
    },
    clues: {
      discovered,
      read,
      progress: fragments.entries,
    },
    inventory: {
      items: useInventoryStore.getState().items,
    },
    flags: game.flags,
    updatedAt: Date.now(),
  }
}

function writeStory(patch: Partial<SavedStory>) {
  const flags = { ...useGameStore.getState().flags }
  if (patch.phone0317Seen) flags.phone0317Seen = true
  if (patch.doorEventTriggered) flags.doorEventTriggered = true
  if (patch.doorOpened || patch.classroomDoorOpened) {
    flags.doorOpened = true
    flags.classroomDoorOpened = true
  }
  useGameStore.setState({ flags })
  if (patch.phoneIntroduced) {
    usePhoneStore.setState({ triggered: true, armed: true })
  }
}

function applyGameSave(save: GameSave) {
  const entries = progressFromLists(save)
  const prologueDone = save.story.prologueIntroCompleted
  const doorOpen = save.story.classroomDoorOpened || save.story.doorOpened
  const roomId = migrateRoomId(save.scene || CLASSROOM_1.id)
  const bounds = getRoom(roomId).bounds
  const placed =
    roomId === 'classroom1' || roomId === 'room12' || roomId === 'teachers' || roomId === 'room14'
      ? clampWithDoor(
          save.player.position.x,
          save.player.position.z,
          roomId === 'room12' || roomId === 'teachers' || roomId === 'room14' || doorOpen,
        )
      : {
          x: Math.min(bounds.maxX, Math.max(bounds.minX, save.player.position.x)),
          z: Math.min(bounds.maxZ, Math.max(bounds.minZ, save.player.position.z)),
        }

  playerMotion.x = placed.x
  playerMotion.z = placed.z
  playerMotion.yaw = save.player.rotation
  playerMotion.faceYaw = null
  playerMotion.flinch = 0
  playerMotion.forcePulse = 0
  playerMotion.forceFacing = false
  playerMotion.distanceWalked = save.story.phoneIntroduced
    ? Math.max(save.player.walked ?? 0, 99)
    : (save.player.walked ?? 0)
  playerMotion.controlLocked = !prologueDone

  useGameStore.setState({
    currentRoom: roomId,
    entryPoint: save.story.entryPoint ?? null,
    flags: {
      ...save.flags,
      phone0317Seen: save.story.phone0317Seen,
      doorEventTriggered: save.story.doorEventTriggered,
      doorOpened: save.story.classroomDoorOpened || save.story.doorOpened,
      classroomDoorOpened: save.story.classroomDoorOpened || save.story.doorOpened,
    },
    collectedClues: save.clues.discovered,
    phoneUnlocked: save.phone.unlocked,
    cameraMode: prologueDone ? 'explore' : 'cutscene',
    cameraOverride: null,
    interactionState: 'gameplay',
    liviaVisible: prologueDone,
    prologueDone,
  })

  usePhoneStore.setState({
    ui: 'hidden',
    app: 'home',
    viewId: null,
    armed: prologueDone,
    triggered: save.story.phoneIntroduced,
    pin: '',
    line: null,
    shakeAt: 0,
    heard: {},
  })

  useFragmentsStore.setState({
    open: false,
    selectedId: null,
    entries,
    toast: null,
    pendingToast: null,
    pulseAt: 0,
  })

  useInventoryStore.setState({
    open: false,
    selectedId: null,
    items: save.inventory?.items ?? [],
    toast: null,
    pulseAt: 0,
  })

  useDoorStore.getState().hydrate(save.story)
  useHallwayStore.getState().hydrate(save.story)
  useComputerStore.getState().hydrate(Boolean(save.flags.computerUnlocked))
  resetSkeletonCabinet()

  refreshControlLock()
}

let listenersBound = false

export function hydrateFromSave() {
  saveManager.bind({
    collect: collectGameSave,
    apply: applyGameSave,
    writeStory,
  })

  if (import.meta.env.DEV) {
    window.resetSave = () => saveManager.reset()
  }

  if (!listenersBound) {
    listenersBound = true
    window.addEventListener('beforeunload', () => saveManager.save())
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) saveManager.save()
    })
  }

  if (saveManager.shouldResume()) {
    saveManager.consumeResume()
    if (saveManager.applyLoaded()) {
      useGameStore.getState().enterGame()
    }
  }
}

export { emptySave }
