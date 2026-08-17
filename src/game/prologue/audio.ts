import {
  isAudioUnlocked,
  playSfx,
  SFX,
  startLoop,
  stopAllLoops,
  stopLoop,
} from '../audio/mixer'

let tomboPlayed = false
let povOn = false
let nextTerror = 1
let prologueEl: HTMLAudioElement | null = null
const timers: number[] = []

function later(ms: number, fn: () => void) {
  timers.push(window.setTimeout(fn, ms))
}

function clearTimers() {
  for (const id of timers) window.clearTimeout(id)
  timers.length = 0
}

export function startPrologueAudio() {
  /* sounds are driven by tickPrologueAudio after unlock */
}

function stopPrologueBed() {
  if (prologueEl) {
    prologueEl.onended = null
    prologueEl.pause()
    prologueEl = null
  }
}

function playPrologueBed() {
  if (!povOn) return
  stopPrologueBed()
  const el = new Audio(SFX.prologue)
  el.loop = false
  el.volume = 0.12
  prologueEl = el
  el.onended = () => {
    if (!povOn) return
    const first = nextTerror === 1 ? SFX.terror1 : SFX.terror2
    const second = nextTerror === 1 ? SFX.terror2 : SFX.terror1
    nextTerror = nextTerror === 1 ? 2 : 1
    later(3500, () => {
      if (!povOn) return
      playSfx(first, 0.32)
    })
    later(9000, () => {
      if (!povOn) return
      playSfx(second, 0.32)
    })
    later(15000, () => {
      if (!povOn) return
      playPrologueBed()
    })
  }
  void el.play().catch(() => {
    later(2000, playPrologueBed)
  })
}

export function tickPrologueAudio(time: number) {
  if (!isAudioUnlocked()) return

  if (!tomboPlayed && time >= 0.12 && time < 4.2) {
    tomboPlayed = true
    playSfx(SFX.fall, 1)
  }

  const firstPerson = time >= 3.6 && time < 27.4
  if (firstPerson && !povOn) {
    povOn = true
    startLoop('breath', SFX.breath, 0.5)
    playPrologueBed()
  }

  if (!firstPerson && povOn) {
    povOn = false
    stopLoop('breath')
    stopPrologueBed()
    clearTimers()
  }
}

export function stopPrologueAudio() {
  tomboPlayed = false
  povOn = false
  nextTerror = 1
  stopLoop('breath')
  stopPrologueBed()
  clearTimers()
  stopAllLoops()
}
