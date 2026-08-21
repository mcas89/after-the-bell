import { create } from 'zustand'
import { saveManager } from '../state/gameSaveManager'
import { useGameStore } from '../state/useGameStore'
import { playSfx, SFX, stopSfxSlice } from '../audio/mixer'
import { playPinFail } from './phoneAudio'
import { isThreadLocked, phoneCall, phonePhoto, phoneThread, type PhoneApp } from './phoneContent'

export type { PhoneApp } from './phoneContent'

export type PhoneUi = 'hidden' | 'notification' | 'locked' | 'pin-entry' | 'unlocked'

const PIN_LEN = 4
const PHONE_PIN = '0305'
let lineTimer = 0

type PhoneState = {
  ui: PhoneUi
  app: PhoneApp
  viewId: string | null
  armed: boolean
  triggered: boolean
  pin: string
  line: string | null
  shakeAt: number
  heard: Record<string, boolean>
  trigger: () => void
  ensureReady: () => void
  open: () => void
  close: () => void
  dismissNotice: () => void
  goPin: () => void
  goLocked: () => void
  goHome: () => void
  goBack: () => boolean
  openApp: (app: Exclude<PhoneApp, 'home'>) => void
  openView: (id: string) => void
  inputDigit: (digit: string) => void
  deleteDigit: () => void
  tryUnlock: () => void
}

function speak(set: (partial: Partial<PhoneState>) => void, line: string, ms = 2800) {
  window.clearTimeout(lineTimer)
  set({ line })
  lineTimer = window.setTimeout(() => set({ line: null }), ms)
}

function hear(
  get: () => PhoneState,
  set: (partial: Partial<PhoneState>) => void,
  key: string,
  line: string,
  ms?: number,
) {
  if (get().heard[key]) return
  set({ heard: { ...get().heard, [key]: true } })
  speak(set, line, ms)
}

export function isPhoneOpen(ui: PhoneUi) {
  return ui === 'locked' || ui === 'pin-entry' || ui === 'unlocked'
}

export const usePhoneStore = create<PhoneState>((set, get) => ({
  ui: 'hidden',
  app: 'home',
  viewId: null,
  armed: false,
  triggered: false,
  pin: '',
  line: null,
  shakeAt: 0,
  heard: {},
  trigger: () => {
    if (get().triggered) return
    playSfx(SFX.phoneNotify, 0.72)
    const keepOpen = isPhoneOpen(get().ui)
    set({ triggered: true, armed: true, ui: keepOpen ? get().ui : 'notification' })
    speak(set, 'Meu celular... preciso falar com alguém!', 4200)
    saveManager.save()
    if (keepOpen) return
    window.setTimeout(() => {
      if (get().ui === 'notification') get().dismissNotice()
    }, 6500)
  },
  ensureReady: () => {
    if (get().armed) return
    set({ armed: true })
  },
  open: () => {
    const { armed, ui } = get()
    if (!armed || isPhoneOpen(ui)) return
    if (useGameStore.getState().interactionState !== 'gameplay') return
    stopSfxSlice()
    const unlocked = useGameStore.getState().phoneUnlocked
    set({ ui: unlocked ? 'unlocked' : 'locked', pin: '', app: 'home', viewId: null })
    saveManager.updateStoryState({ phone0317Seen: true })
  },
  close: () => {
    if (!isPhoneOpen(get().ui)) return
    set({ ui: 'hidden', pin: '', app: 'home', viewId: null })
  },
  dismissNotice: () => {
    if (get().ui !== 'notification') return
    stopSfxSlice()
    set({ ui: 'hidden' })
  },
  goPin: () => {
    if (get().ui !== 'locked') return
    set({ ui: 'pin-entry', pin: '' })
  },
  goLocked: () => {
    if (get().ui !== 'pin-entry') return
    set({ ui: 'locked', pin: '' })
  },
  goHome: () => {
    if (get().ui !== 'unlocked') return
    set({ app: 'home', viewId: null })
  },
  goBack: () => {
    if (get().ui !== 'unlocked') return false
    if (get().viewId) {
      set({ viewId: null })
      return true
    }
    if (get().app !== 'home') {
      set({ app: 'home' })
      return true
    }
    return false
  },
  openApp: (app) => {
    if (get().ui !== 'unlocked') return
    set({ app, viewId: null })
    if (app === 'clock') hear(get, set, 'clock', 'Seis da manhã...?')
    if (app === 'notes') hear(get, set, 'notes', 'Eu estava preparando alguma coisa.')
    if (app === 'maps') hear(get, set, 'maps', 'Eu estava tentando ir pra casa.')
    if (app === 'camera') hear(get, set, 'camera', 'Não abre.')
    if (app === 'recorder') hear(get, set, 'recorder', 'Arquivo danificado.')
  },
  openView: (id) => {
    if (get().ui !== 'unlocked') return
    const thread = phoneThread(id)
    if (thread && isThreadLocked(thread)) {
      hear(get, set, 'm-locked', 'A conversa não carrega.')
      return
    }
    if (thread?.line) hear(get, set, thread.id, thread.line)
    const photo = phonePhoto(id)
    if (photo) hear(get, set, photo.id, photo.line)
    const call = phoneCall(id)
    if (call?.line) hear(get, set, call.id, call.line)
    if (thread || photo) set({ viewId: id })
    if (call?.line) return
  },
  inputDigit: (digit) => {
    if (get().ui !== 'pin-entry') return
    if (!/^\d$/.test(digit)) return
    const next = (get().pin + digit).slice(0, PIN_LEN)
    set({ pin: next })
    if (next.length >= PIN_LEN) window.setTimeout(() => get().tryUnlock(), 90)
  },
  deleteDigit: () => {
    if (get().ui !== 'pin-entry') return
    set({ pin: get().pin.slice(0, -1) })
  },
  tryUnlock: () => {
    if (get().ui !== 'pin-entry') return
    if (get().pin === PHONE_PIN) {
      window.clearTimeout(lineTimer)
      useGameStore.getState().unlockPhone()
      set({ ui: 'unlocked', pin: '', line: null, app: 'home', viewId: null })
      saveManager.save()
      return
    }
    playPinFail()
    speak(set, 'Eu não lembro da senha...')
    set({ pin: '', shakeAt: Date.now() })
  },
}))
