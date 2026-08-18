import { create } from 'zustand'
import { saveManager } from '../state/gameSaveManager'
import { useGameStore } from '../state/useGameStore'
import { playSfx, SFX, stopSfxSlice } from '../audio/mixer'
import { playPinFail } from './phoneAudio'

export type PhoneUi = 'hidden' | 'notification' | 'locked' | 'pin-entry' | 'unlocked'
export type PhoneApp = 'home' | 'messages' | 'offline'

const PIN_LEN = 4
const PHONE_PIN = '0305'
let lineTimer = 0

type PhoneState = {
  ui: PhoneUi
  app: PhoneApp
  armed: boolean
  triggered: boolean
  pin: string
  line: string | null
  shakeAt: number
  trigger: () => void
  ensureReady: () => void
  open: () => void
  close: () => void
  dismissNotice: () => void
  goPin: () => void
  goLocked: () => void
  goHome: () => void
  openApp: (app: Exclude<PhoneApp, 'home'>) => void
  inputDigit: (digit: string) => void
  deleteDigit: () => void
  tryUnlock: () => void
}

function speak(set: (partial: Partial<PhoneState>) => void, line: string, ms = 2800) {
  window.clearTimeout(lineTimer)
  set({ line })
  lineTimer = window.setTimeout(() => set({ line: null }), ms)
}

export function isPhoneOpen(ui: PhoneUi) {
  return ui === 'locked' || ui === 'pin-entry' || ui === 'unlocked'
}

export const usePhoneStore = create<PhoneState>((set, get) => ({
  ui: 'hidden',
  app: 'home',
  armed: false,
  triggered: false,
  pin: '',
  line: null,
  shakeAt: 0,
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
    set({ ui: unlocked ? 'unlocked' : 'locked', pin: '', app: 'home' })
    saveManager.updateStoryState({ phone0317Seen: true })
  },
  close: () => {
    if (!isPhoneOpen(get().ui)) return
    set({ ui: 'hidden', pin: '', app: 'home' })
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
    set({ app: 'home' })
  },
  openApp: (app) => {
    if (get().ui !== 'unlocked') return
    set({ app })
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
      set({ ui: 'unlocked', pin: '', line: null, app: 'home' })
      saveManager.save()
      return
    }
    playPinFail()
    speak(set, 'Eu não lembro da senha...')
    set({ pin: '', shakeAt: Date.now() })
  },
}))
