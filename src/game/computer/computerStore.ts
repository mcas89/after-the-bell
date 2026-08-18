import { create } from 'zustand'
import { CLUE_IDS } from '../data/clues'
import { discoverClue } from '../fragments/discoverClue'
import { saveManager } from '../state/gameSaveManager'
import { useGameStore } from '../state/useGameStore'
import { refreshControlLock } from '../systems/controlLock'
import { playPinFail } from '../phone/phoneAudio'

export const LAB_ON_PC_ID = 'lab-pc-5'
export const COMPUTER_PIN = '2011'

export const WEB_HISTORY = [
  { time: '01:52', query: 'quanto falta pra amanhecer' },
  { time: '02:16', query: 'porta de emergência escola alarme' },
  { time: '02:34', query: 'como abrir porta trancada por dentro' },
  { time: '02:51', query: 'saída escola segundo andar' },
  { time: '03:05', query: null },
] as const

export type ComputerUi = 'hidden' | 'login' | 'desktop'
export type ComputerApp = 'home' | 'docs' | 'web' | 'trash' | 'notes' | 'work'

const PIN_LEN = 4
let lineTimer = 0
let historyTimer = 0

type ComputerState = {
  ui: ComputerUi
  app: ComputerApp
  pin: string
  line: string | null
  shakeAt: number
  unlocked: boolean
  historySeen: boolean
  historyOpen: boolean
  hydrate: (unlocked: boolean) => void
  open: () => void
  close: () => void
  openApp: (app: Exclude<ComputerApp, 'home'>) => void
  goHome: () => void
  toggleHistory: () => void
  closeHistory: () => void
  inputDigit: (digit: string) => void
  deleteDigit: () => void
  tryUnlock: () => void
  readHistory: () => void
}

function speak(set: (partial: Partial<ComputerState>) => void, line: string, ms = 3800) {
  window.clearTimeout(lineTimer)
  set({ line })
  lineTimer = window.setTimeout(() => set({ line: null }), ms)
}

export function isComputerOpen(ui: ComputerUi) {
  return ui === 'login' || ui === 'desktop'
}

export const useComputerStore = create<ComputerState>((set, get) => ({
  ui: 'hidden',
  app: 'home',
  pin: '',
  line: null,
  shakeAt: 0,
  unlocked: false,
  historySeen: false,
  historyOpen: false,
  hydrate: (unlocked) => {
    window.clearTimeout(lineTimer)
    window.clearTimeout(historyTimer)
    set({
      ui: 'hidden',
      app: 'home',
      pin: '',
      line: null,
      shakeAt: 0,
      unlocked,
      historySeen: Boolean(useGameStore.getState().flags.computerHistorySeen),
      historyOpen: false,
    })
  },
  open: () => {
    const game = useGameStore.getState()
    if (!game.prologueDone || game.interactionState !== 'gameplay') return
    if (isComputerOpen(get().ui)) return
    const unlocked = get().unlocked || Boolean(game.flags.computerUnlocked)
    game.setInteractionState('using-computer')
    refreshControlLock()
    set({
      ui: unlocked ? 'desktop' : 'login',
      unlocked,
      pin: '',
      app: 'home',
      historyOpen: false,
    })
    if (!unlocked) speak(set, 'Está com meu login, mas qual é a minha senha? Eu não lembro.')
  },
  close: () => {
    if (!isComputerOpen(get().ui)) return
    window.clearTimeout(lineTimer)
    set({ ui: 'hidden', pin: '', app: 'home', line: null, historyOpen: false })
    useGameStore.getState().setInteractionState('gameplay')
    refreshControlLock()
  },
  openApp: (app) => {
    if (get().ui !== 'desktop') return
    set({ app, historyOpen: false })
  },
  goHome: () => {
    if (get().ui !== 'desktop') return
    set({ app: 'home', historyOpen: false })
  },
  toggleHistory: () => {
    if (get().ui !== 'desktop' || get().app !== 'web') return
    const next = !get().historyOpen
    set({ historyOpen: next })
    if (next) get().readHistory()
  },
  closeHistory: () => {
    if (!get().historyOpen) return
    set({ historyOpen: false })
  },
  inputDigit: (digit) => {
    if (get().ui !== 'login') return
    if (!/^\d$/.test(digit)) return
    const next = (get().pin + digit).slice(0, PIN_LEN)
    set({ pin: next, line: get().line })
    if (next.length >= PIN_LEN) window.setTimeout(() => get().tryUnlock(), 90)
  },
  deleteDigit: () => {
    if (get().ui !== 'login') return
    set({ pin: get().pin.slice(0, -1) })
  },
  tryUnlock: () => {
    if (get().ui !== 'login') return
    if (get().pin === COMPUTER_PIN) {
      window.clearTimeout(lineTimer)
      useGameStore.getState().addFlag('computerUnlocked')
      set({ ui: 'desktop', unlocked: true, pin: '', line: null, app: 'home' })
      saveManager.save()
      return
    }
    playPinFail()
    speak(set, 'Eu não lembro da senha...')
    set({ pin: '', shakeAt: Date.now() })
  },
  readHistory: () => {
    if (get().historySeen) return
    set({ historySeen: true })
    useGameStore.getState().addFlag('computerHistorySeen')
    discoverClue(CLUE_IDS.howToLeave)
    saveManager.save()
    window.clearTimeout(historyTimer)
    historyTimer = window.setTimeout(() => {
      speak(set, 'A gente tava tentando sair. Só isso.', 4400)
    }, 3200)
  },
}))
