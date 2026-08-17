export const SFX = {
  emergencyFail: '/sons/eletricidade_falando.mp3',
  knock: '/sons/efects_toctoc.mp3',
  doorOpen: '/sons/efects_porta_open.mp3',
  footsteps: '/sons/efect_passos.mp3',
  fall: '/sons/tombo_marina.mp3',
  music: '/sons/music_fundo.mp3',
  breath: '/sons/suspiro_respiracao.mp3',
  terror1: '/sons/som_terror1.mp3',
  terror2: '/sons/som_terror2.mp3',
  prologue: '/sons/som_prologo.mp3',
  clickItem: '/sons/click_itens.mp3',
  scareMoment: '/sons/susto_moments.mp3',
  scare: '/sons/susto_sons.mp3',
  menu: '/sons/music_menu.mp3',
  phoneNotify: '/sons/notificação_celular.mp3',
} as const

export const audioLevels = {
  musicVolume: 0.16,
  sfxVolume: 1,
}

const clips = new Map<string, HTMLAudioElement>()
const lastPlay = new Map<string, number>()
const loops = new Map<string, HTMLAudioElement>()
const queued: Array<() => void> = []

let music: HTMLAudioElement | null = null
let musicTarget = audioLevels.musicVolume
let musicCurrent = 0
let duckUntil = 0
let ambientHoldUntil = 0
let unlocked = false
let wantMusic = false
let zap: HTMLAudioElement | null = null
let zapBusy = false
let boostCtx: AudioContext | null = null

function clip(url: string) {
  let el = clips.get(url)
  if (!el) {
    el = new Audio(url)
    el.preload = 'auto'
    clips.set(url, el)
  }
  return el
}

export function preloadGameAudio() {
  for (const url of Object.values(SFX)) clip(url)
}

export function isAudioUnlocked() {
  return unlocked
}

export function unlockAudio() {
  if (unlocked) {
    if (wantMusic) startBedMusic()
    return
  }

  const Ctx =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (Ctx) {
    if (!boostCtx || boostCtx.state === 'closed') boostCtx = new Ctx()
    void boostCtx.resume()
    const buffer = boostCtx.createBuffer(1, 1, 22050)
    const src = boostCtx.createBufferSource()
    src.buffer = buffer
    src.connect(boostCtx.destination)
    src.start(0)
  }

  unlocked = true
  preloadGameAudio()
  for (const el of clips.values()) {
    const prev = el.volume
    el.volume = 0
    void el.play().then(() => {
      el.pause()
      el.currentTime = 0
      el.volume = prev || 1
    }).catch(() => {
      el.volume = prev || 1
    })
  }
  const pending = queued.splice(0)
  for (const fn of pending) fn()
  if (wantMusic) startBedMusic()
}

export function startLoop(id: string, url: string, volume = 0.4) {
  if (!unlocked) {
    queued.push(() => startLoop(id, url, volume))
    return
  }
  const current = loops.get(id)
  if (current && !current.paused) return
  stopLoop(id)
  const el = new Audio(url)
  el.loop = true
  el.preload = 'auto'
  el.volume = Math.max(0, Math.min(1, volume * audioLevels.sfxVolume))
  loops.set(id, el)
  void el.play().catch(() => {})
}

export function stopLoop(id: string) {
  const el = loops.get(id)
  if (!el) return
  el.pause()
  el.removeAttribute('src')
  loops.delete(id)
}

export function stopAllLoops() {
  for (const id of [...loops.keys()]) stopLoop(id)
}

export function holdAmbient(ms: number) {
  ambientHoldUntil = Math.max(ambientHoldUntil, performance.now() + ms)
}

export function isAmbientHeld() {
  return performance.now() < ambientHoldUntil
}

export function duckMusic(factor = 0.42, holdMs = 2000) {
  duckUntil = Math.max(duckUntil, performance.now() + holdMs)
  musicTarget = audioLevels.musicVolume * factor
}

export function playSfx(url: string, volume = 0.42, cooldownMs = 0) {
  if (!unlocked) {
    queued.push(() => playSfx(url, volume, cooldownMs))
    return
  }
  const now = performance.now()
  if (cooldownMs > 0 && now - (lastPlay.get(url) ?? 0) < cooldownMs) return
  lastPlay.set(url, now)
  const el = new Audio(url)
  el.volume = Math.max(0, Math.min(1, volume * audioLevels.sfxVolume))
  void el.play().catch(() => {
    lastPlay.delete(url)
  })
}

let sliced: HTMLAudioElement | null = null
let sliceTimer = 0

export function stopSfxSlice() {
  window.clearTimeout(sliceTimer)
  if (!sliced) return
  sliced.pause()
  sliced.currentTime = 0
  sliced = null
}

export function playSfxFor(url: string, volume = 0.5, durationMs = 2000) {
  if (!unlocked) {
    queued.push(() => playSfxFor(url, volume, durationMs))
    return
  }
  stopSfxSlice()
  const el = new Audio(encodeURI(url))
  el.preload = 'auto'
  el.volume = Math.max(0, Math.min(1, volume * audioLevels.sfxVolume))
  sliced = el
  void el.play().then(() => {
    sliceTimer = window.setTimeout(() => {
      if (sliced !== el) return
      el.pause()
      el.currentTime = 0
      sliced = null
    }, durationMs)
  }).catch(() => {
    if (sliced === el) sliced = null
  })
}

export function playSfxBuffer(url: string, volume = 0.45) {
  playSfx(url, volume)
}

export function playAt(url: string, _position: [number, number, number], volume = 0.7) {
  playSfx(url, volume)
}

function getBoostCtx() {
  const Ctx =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return null
  if (!boostCtx || boostCtx.state === 'closed') boostCtx = new Ctx()
  if (boostCtx.state === 'suspended') void boostCtx.resume()
  return boostCtx
}

export function playLoudSfx(url: string, gain = 2.6) {
  if (!unlocked) {
    queued.push(() => playLoudSfx(url, gain))
    return
  }
  const ac = getBoostCtx()
  const el = new Audio(url)
  el.preload = 'auto'
  if (!ac) {
    el.volume = 1
    void el.play().catch(() => {})
    return
  }
  const src = ac.createMediaElementSource(el)
  const amp = ac.createGain()
  amp.gain.value = Math.max(0.2, gain)
  src.connect(amp)
  amp.connect(ac.destination)
  void el.play().catch(() => {})
}

export function playFootstep() {
  playSfx(SFX.footsteps, 0.32, 220)
}

export function playElectricityBurst() {
  if (!unlocked || zapBusy || isAmbientHeld()) return
  zapBusy = true
  if (!zap) {
    zap = new Audio(SFX.emergencyFail)
    zap.preload = 'auto'
    zap.loop = false
  }
  zap.pause()
  zap.currentTime = 0
  zap.volume = 0.16
  void zap.play().catch(() => {
    zapBusy = false
  })
  const playFor = 2200 + Math.random() * 1400
  const gap = 5000 + Math.random() * 3500
  window.setTimeout(() => {
    zap?.pause()
    if (zap) zap.currentTime = 0
    window.setTimeout(() => {
      zapBusy = false
    }, gap)
  }, playFor)
}

export function startBedMusic() {
  wantMusic = true
  if (!unlocked) return
  stopLoop('menu')
  if (!music) {
    music = clip(SFX.music)
    music.loop = true
  }
  music.volume = musicCurrent
  if (music.paused) void music.play().catch(() => {})
  musicTarget = audioLevels.musicVolume
}

export function startMenuMusic() {
  wantMusic = false
  if (music) {
    music.pause()
  }
  startLoop('menu', SFX.menu, 0.36)
}

export function stopMenuMusic() {
  stopLoop('menu')
}

export function tickMixer(delta: number) {
  if (!music) return
  if (performance.now() >= duckUntil) musicTarget = audioLevels.musicVolume
  const lambda = 2.6
  musicCurrent += (musicTarget - musicCurrent) * (1 - Math.exp(-lambda * delta))
  music.volume = Math.max(0, Math.min(1, musicCurrent))
}

export function attachAudioListener(_camera?: unknown, _scene?: unknown) {
  preloadGameAudio()
}

export function detachAudioListener(_camera?: unknown) {
  /* HTMLAudio does not use a Three listener */
}
