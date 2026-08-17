import { create } from 'zustand'
import { playPinFail } from '../phone/phoneAudio'
import { getHallLocker } from './lockers'

const PIN_LEN = 4
let lineTimer = 0

type LockerPinState = {
  lockerId: string | null
  pin: string
  line: string | null
  shakeAt: number
  opened: boolean
  openIds: string[]
  isOpen: (id: string | null | undefined) => boolean
  reset: (lockerId?: string | null) => void
  inputDigit: (digit: string) => void
  deleteDigit: () => void
  tryUnlock: () => void
}

export const useLockerPinStore = create<LockerPinState>((set, get) => ({
  lockerId: null,
  pin: '',
  line: null,
  shakeAt: 0,
  opened: false,
  openIds: [],
  isOpen: (id) => Boolean(id && get().openIds.includes(id)),
  reset: (lockerId = null) => {
    window.clearTimeout(lineTimer)
    const already = Boolean(lockerId && get().openIds.includes(lockerId))
    set({ lockerId, pin: '', line: already ? 'Aberto.' : null, opened: already })
  },
  inputDigit: (digit) => {
    if (!/^\d$/.test(digit)) return
    if (get().opened) return
    const next = (get().pin + digit).slice(0, PIN_LEN)
    set({ pin: next, line: null })
    if (next.length >= PIN_LEN) window.setTimeout(() => get().tryUnlock(), 80)
  },
  deleteDigit: () => {
    if (get().opened) return
    set({ pin: get().pin.slice(0, -1) })
  },
  tryUnlock: () => {
    const locker = getHallLocker(get().lockerId)
    if (locker?.pin && get().pin === locker.pin) {
      window.clearTimeout(lineTimer)
      const id = locker.id
      const openIds = get().openIds.includes(id) ? get().openIds : [...get().openIds, id]
      set({ opened: true, line: 'Abriu.', openIds })
      return
    }
    playPinFail()
    const line = locker?.kind === 'livia' ? 'Eu não lembro da senha...' : 'Não abre.'
    window.clearTimeout(lineTimer)
    set({ pin: '', shakeAt: Date.now(), line })
    lineTimer = window.setTimeout(() => set({ line: null }), 2400)
  },
}))
