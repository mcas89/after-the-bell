import { create } from 'zustand'
import { CLUE_IDS } from '../data/clues'
import { discoverClue } from '../fragments/discoverClue'
import { saveManager } from '../state/gameSaveManager'
import { useGameStore } from '../state/useGameStore'
import { refreshControlLock } from '../systems/controlLock'
import { playPinFail } from '../phone/phoneAudio'
import { APP_ROOT, pcNode, type ComputerApp } from './computerContent'

export type { ComputerApp } from './computerContent'

export const LAB_ON_PC_ID = 'lab-pc-5'
export const COMPUTER_PIN = '2107'

export const WEB_HISTORY = [
  { time: '01:52', query: 'quanto falta pra amanhecer' },
  { time: '02:16', query: 'porta de emergência escola alarme' },
  { time: '02:34', query: 'como abrir porta trancada por dentro' },
  { time: '02:51', query: 'saída escola segundo andar' },
  { time: '03:05', query: null },
] as const

export type ComputerUi = 'hidden' | 'login' | 'desktop'

const PIN_LEN = 4
let lineTimer = 0
let historyTimer = 0

type ComputerState = {
  ui: ComputerUi
  app: ComputerApp
  nodeId: string | null
  pin: string
  line: string | null
  shakeAt: number
  unlocked: boolean
  historySeen: boolean
  historyOpen: boolean
  historyPage: string | null
  redactHits: number
  heard: Record<string, boolean>
  notesProps: boolean
  hydrate: (unlocked: boolean) => void
  open: () => void
  close: () => void
  openApp: (app: Exclude<ComputerApp, 'home'>) => void
  openNode: (id: string) => void
  goBack: () => boolean
  goHome: () => void
  toggleHistory: () => void
  closeHistory: () => void
  selectHistory: (time: string) => void
  clearHistoryPage: () => void
  showNotesProps: () => void
  say: (line: string, ms?: number) => void
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

function hear(
  get: () => ComputerState,
  set: (partial: Partial<ComputerState>) => void,
  key: string,
  line: string,
  ms?: number,
) {
  if (get().heard[key]) return
  set({ heard: { ...get().heard, [key]: true } })
  speak(set, line, ms)
}

export function isComputerOpen(ui: ComputerUi) {
  return ui === 'login' || ui === 'desktop'
}

export const useComputerStore = create<ComputerState>((set, get) => ({
  ui: 'hidden',
  app: 'home',
  nodeId: null,
  pin: '',
  line: null,
  shakeAt: 0,
  unlocked: false,
  historySeen: false,
  historyOpen: false,
  historyPage: null,
  redactHits: 0,
  heard: {},
  notesProps: false,
  hydrate: (unlocked) => {
    window.clearTimeout(lineTimer)
    window.clearTimeout(historyTimer)
    set({
      ui: 'hidden',
      app: 'home',
      nodeId: null,
      pin: '',
      line: null,
      shakeAt: 0,
      unlocked,
      historySeen: Boolean(useGameStore.getState().flags.computerHistorySeen),
      historyOpen: false,
      historyPage: null,
      redactHits: 0,
      heard: {},
      notesProps: false,
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
      nodeId: null,
      historyOpen: false,
      historyPage: null,
      notesProps: false,
    })
    if (!unlocked) hear(get, set, 'login', 'Minha senha é o niver dela !!!')
  },
  close: () => {
    if (!isComputerOpen(get().ui)) return
    window.clearTimeout(lineTimer)
    set({
      ui: 'hidden',
      pin: '',
      app: 'home',
      nodeId: null,
      line: null,
      historyOpen: false,
      historyPage: null,
      notesProps: false,
    })
    useGameStore.getState().setInteractionState('gameplay')
    refreshControlLock()
  },
  openApp: (app) => {
    if (get().ui !== 'desktop') return
    set({
      app,
      nodeId: APP_ROOT[app] ?? null,
      historyOpen: false,
      historyPage: null,
      notesProps: false,
    })
    if (app === 'clock') {
      const flags = useGameStore.getState().flags
      const otherSeen =
        Boolean(flags.clock0317Seen) || Boolean(flags.hallClock0317Seen) || Boolean(flags.phone0317Seen)
      hear(get, set, 'clock', otherSeen ? 'É a mesma hora.' : 'Ainda 03:17.')
      if (!flags.computerClock0317Seen) useGameStore.getState().addFlag('computerClock0317Seen')
    }
    if (app === 'notes') hear(get, set, 'notes', 'Vazio.')
  },
  openNode: (id) => {
    if (get().ui !== 'desktop') return
    const node = pcNode(id)
    if (!node) return
    set({ nodeId: id, notesProps: false })
    if (node.id === 'docs-pessoal') {
      if (!get().heard.pessoal) hear(get, set, 'pessoal', 'Vazia...?')
      else hear(get, set, 'pessoal-2', 'Diz que tem dois arquivos aqui.')
      return
    }
    if (node.line) hear(get, set, node.id, node.line)
  },
  goBack: () => {
    if (get().ui !== 'desktop') return false
    if (get().app === 'web' && get().historyPage) {
      set({ historyPage: null })
      return true
    }
    if (get().notesProps) {
      set({ notesProps: false })
      return true
    }
    const node = pcNode(get().nodeId)
    if (node?.parent) {
      set({ nodeId: node.parent })
      return true
    }
    return false
  },
  goHome: () => {
    if (get().ui !== 'desktop') return
    set({ app: 'home', nodeId: null, historyOpen: false, historyPage: null, notesProps: false })
  },
  toggleHistory: () => {
    if (get().ui !== 'desktop' || get().app !== 'web') return
    const next = !get().historyOpen
    set({ historyOpen: next, historyPage: next ? get().historyPage : null })
  },
  closeHistory: () => {
    if (!get().historyOpen) return
    set({ historyOpen: false })
  },
  selectHistory: (time) => {
    if (get().ui !== 'desktop' || get().app !== 'web') return
    set({ historyOpen: true, historyPage: time })
    if (time === '02:51') get().readHistory()
    if (time !== '03:05') return
    const hits = get().redactHits + 1
    set({ redactHits: hits })
    if (hits >= 2) hear(get, set, 'redact', 'O que eu procurei aqui?')
  },
  clearHistoryPage: () => {
    if (!get().historyPage) return
    set({ historyPage: null })
  },
  showNotesProps: () => {
    if (get().app !== 'notes') return
    set({ notesProps: true })
    hear(get, set, 'notes-props', '03:09... mas não tem nada escrito.')
  },
  say: (line, ms) => speak(set, line, ms),
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
      set({ ui: 'desktop', unlocked: true, pin: '', line: null, app: 'home', nodeId: null })
      saveManager.checkpoint('Computador')
      return
    }
    playPinFail()
    speak(set, get().pin === '0305' ? 'Não é o meu niver.' : 'Eu não lembro da senha...')
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
