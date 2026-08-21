import type { ClueProgress } from '../data/clues'
import type { RoomId } from '../data/rooms'
import { migrateRoomId, roomLabel } from '../data/rooms'

export const SAVE_KEY = 'after-the-bell-save-v1'
export const HISTORY_KEY = 'after-the-bell-history-v2'
export const RESUME_KEY = 'after-the-bell-resume'
export const SAVE_VERSION = 1
const HISTORY_MAX = 12

export type SavedStory = {
  prologueIntroCompleted: boolean
  phoneIntroduced: boolean
  phone0317Seen: boolean
  doorEventTriggered: boolean
  doorOpened: boolean
  classroomDoorOpened: boolean
  enteredCorridor: boolean
  seenDoor203: boolean
  door203Disappeared: boolean
  foundSecretary: boolean
  seenMysteriousGirl: boolean
  currentObjective: string | null
  entryPoint: string | null
}

export type GameSave = {
  version: typeof SAVE_VERSION
  scene: RoomId
  player: {
    position: { x: number; y: number; z: number }
    rotation: number
    walked: number
  }
  story: SavedStory
  phone: {
    unlocked: boolean
    time: '03:17'
  }
  clues: {
    discovered: string[]
    read: string[]
    progress: Record<string, ClueProgress>
  }
  inventory: {
    items: string[]
  }
  flags: Record<string, boolean>
  updatedAt: number
}

export type SaveEntry = {
  id: string
  label: string
  save: GameSave
}

type Bindings = {
  collect: () => GameSave
  apply: (save: GameSave) => void
  writeStory: (patch: Partial<SavedStory>) => void
}

const emptyStory = (): SavedStory => ({
  prologueIntroCompleted: false,
  phoneIntroduced: false,
  phone0317Seen: false,
  doorEventTriggered: false,
  doorOpened: false,
  classroomDoorOpened: false,
  enteredCorridor: false,
  seenDoor203: false,
  door203Disappeared: false,
  foundSecretary: false,
  seenMysteriousGirl: false,
  currentObjective: null,
  entryPoint: null,
})

export function emptySave(): GameSave {
  return {
    version: SAVE_VERSION,
    scene: 'classroom1',
    player: {
      position: { x: 0, y: 0, z: 1.55 },
      rotation: Math.PI,
      walked: 0,
    },
    story: emptyStory(),
    phone: { unlocked: false, time: '03:17' },
    clues: { discovered: [], read: [], progress: {} },
    inventory: { items: [] },
    flags: {},
    updatedAt: 0,
  }
}

let bindings: Bindings | null = null
let lastSavedAt = { x: 0, z: 1.55 }
let positionTimer = 0

function logSaveError(error: unknown) {
  if (import.meta.env.DEV) console.error('[save] save inválido, começando um jogo novo.', error)
}

function isRoomId(value: string): value is RoomId {
  return (
    value === 'classroom1' ||
    value === 'hallway' ||
    value === 'room11' ||
    value === 'room12' ||
    value === 'room14' ||
    value === 'room201' ||
    value === 'room202' ||
    value === 'classroom2' ||
    value === 'bathroom' ||
    value === 'office' ||
    value === 'teachers' ||
    value === 'storage' ||
    value === 'backyard' ||
    value === 'passage'
  )
}

function isGameSave(value: unknown): value is GameSave {
  if (!value || typeof value !== 'object') return false
  const save = value as Partial<GameSave>
  const player = save.player
  const story = save.story
  const clues = save.clues
  return (
    save.version === SAVE_VERSION &&
    typeof save.scene === 'string' &&
    isRoomId(save.scene) &&
    typeof player?.position?.x === 'number' &&
    typeof player?.position?.z === 'number' &&
    typeof player?.rotation === 'number' &&
    typeof story?.prologueIntroCompleted === 'boolean' &&
    Boolean(save.phone) &&
    Array.isArray(clues?.discovered) &&
    Array.isArray(clues?.read)
  )
}

function readStorage(): GameSave | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isGameSave(parsed)) {
      logSaveError(parsed)
      return null
    }
    return {
      ...emptySave(),
      ...parsed,
      scene: migrateRoomId(parsed.scene),
      player: {
        position: {
          x: parsed.player.position.x,
          y: parsed.player.position.y ?? 0,
          z: parsed.player.position.z,
        },
        rotation: parsed.player.rotation,
        walked: parsed.player.walked ?? 0,
      },
      story: {
        ...emptyStory(),
        ...parsed.story,
        classroomDoorOpened: Boolean(
          parsed.story?.classroomDoorOpened || parsed.story?.doorOpened,
        ),
        doorOpened: Boolean(parsed.story?.classroomDoorOpened || parsed.story?.doorOpened),
        entryPoint: parsed.story?.entryPoint ?? null,
      },
      phone: { unlocked: Boolean(parsed.phone?.unlocked), time: '03:17' },
      clues: {
        discovered: parsed.clues.discovered,
        read: parsed.clues.read,
        progress: parsed.clues.progress ?? {},
      },
      inventory: { items: parsed.inventory?.items ?? [] },
      flags: parsed.flags ?? {},
      updatedAt: parsed.updatedAt ?? 0,
    }
  } catch (error) {
    logSaveError(error)
    return null
  }
}

function writeStorage(save: GameSave) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save))
    lastSavedAt = { x: save.player.position.x, z: save.player.position.z }
  } catch (error) {
    if (import.meta.env.DEV) console.error('[save] não foi possível gravar.', error)
  }
}

export function describeSave(save: GameSave) {
  const room = roomLabel(save.scene)
  if (save.scene === 'hallway' && !save.story.seenMysteriousGirl) return `${room} · fundo escuro`
  if (save.scene === 'hallway' && save.story.seenMysteriousGirl) return `${room} · depois da garota`
  return room
}

function fingerprint(save: GameSave) {
  const flags = Object.keys(save.flags)
    .filter((key) => save.flags[key] && !key.startsWith('visited-'))
    .sort()
    .join(',')
  return [
    save.scene,
    save.story.seenMysteriousGirl ? '1' : '0',
    save.story.enteredCorridor ? '1' : '0',
    save.story.classroomDoorOpened ? '1' : '0',
    save.inventory.items.slice().sort().join(','),
    save.clues.discovered.slice().sort().join(','),
    flags,
  ].join('|')
}

function cloneSave(save: GameSave): GameSave {
  return JSON.parse(JSON.stringify(save)) as GameSave
}

function isSaveEntry(value: unknown): value is SaveEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Partial<SaveEntry>
  return typeof entry.id === 'string' && typeof entry.label === 'string' && isGameSave(entry.save)
}

function readHistory(): SaveEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isSaveEntry).map((entry) => ({
      ...entry,
      save: {
        ...emptySave(),
        ...entry.save,
        scene: migrateRoomId(entry.save.scene),
      },
    }))
  } catch (error) {
    if (import.meta.env.DEV) console.error('[save] histórico inválido.', error)
    return []
  }
}

function writeHistory(entries: SaveEntry[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, HISTORY_MAX)))
  } catch (error) {
    if (import.meta.env.DEV) console.error('[save] não foi possível gravar o histórico.', error)
  }
}

function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch (error) {
    if (import.meta.env.DEV) console.error('[save] não foi possível apagar o histórico.', error)
  }
}

function pushHistory(save: GameSave, label: string) {
  if (!save.story.prologueIntroCompleted) return
  const list = readHistory()
  const next = cloneSave(save)
  if (list[0] && list[0].label === label && fingerprint(list[0].save) === fingerprint(next)) {
    list[0] = { ...list[0], save: next }
    writeHistory(list)
    return
  }
  writeHistory([
    {
      id: `${next.updatedAt}-${Math.random().toString(36).slice(2, 7)}`,
      label,
      save: next,
    },
    ...list,
  ])
}

function markResume() {
  try {
    sessionStorage.setItem(RESUME_KEY, '1')
  } catch {
    /* ignore */
  }
}

function collectOrEmpty() {
  return bindings?.collect() ?? emptySave()
}

export const saveManager = {
  bind(next: Bindings) {
    bindings = next
  },

  load(): GameSave | null {
    return readStorage()
  },

  save() {
    const save = collectOrEmpty()
    if (!save.story.prologueIntroCompleted) return
    writeStorage({ ...save, updatedAt: Date.now() })
  },

  checkpoint(label: string) {
    const save = collectOrEmpty()
    if (!save.story.prologueIntroCompleted) return
    const next = { ...save, updatedAt: Date.now() }
    writeStorage(next)
    pushHistory(next, label)
  },

  listHistory(): SaveEntry[] {
    const list = readHistory()
    const current = readStorage()
    if (list.length > 0 || !current?.story.prologueIntroCompleted) return list
    return [
      {
        id: 'current',
        label: describeSave(current),
        save: current,
      },
    ]
  },

  restore(id: string) {
    const entry = saveManager.listHistory().find((item) => item.id === id)
    if (!entry) return
    markResume()
    writeStorage(entry.save)
    window.location.reload()
  },

  shouldResume() {
    try {
      return sessionStorage.getItem(RESUME_KEY) === '1'
    } catch {
      return false
    }
  },

  consumeResume() {
    try {
      sessionStorage.removeItem(RESUME_KEY)
    } catch {
      /* ignore */
    }
  },

  reset() {
    try {
      localStorage.removeItem(SAVE_KEY)
    } catch (error) {
      if (import.meta.env.DEV) console.error('[save] não foi possível apagar.', error)
    }
    clearHistory()
    window.location.reload()
  },

  clear() {
    try {
      localStorage.removeItem(SAVE_KEY)
    } catch (error) {
      if (import.meta.env.DEV) console.error('[save] não foi possível apagar.', error)
    }
    clearHistory()
  },

  hasStoredGame() {
    const save = readStorage()
    return Boolean(save?.story.prologueIntroCompleted)
  },

  applyLoaded() {
    const save = readStorage()
    if (!save || !bindings) return false
    bindings.apply(save)
    lastSavedAt = { x: save.player.position.x, z: save.player.position.z }
    return true
  },

  applyEmpty() {
    if (!bindings) return
    bindings.apply(emptySave())
    lastSavedAt = { x: 0, z: 1.55 }
  },

  updatePlayerPosition() {
    const save = collectOrEmpty()
    if (!save.story.prologueIntroCompleted) return
    const dx = save.player.position.x - lastSavedAt.x
    const dz = save.player.position.z - lastSavedAt.z
    if (dx * dx + dz * dz < 0.12) return
    window.clearTimeout(positionTimer)
    positionTimer = window.setTimeout(() => saveManager.save(), 2200)
  },

  updateStoryState(patch: Partial<SavedStory>) {
    bindings?.writeStory(patch)
    saveManager.save()
  },

  updateClues() {
    saveManager.save()
  },
}

export { lastSavedAt }
