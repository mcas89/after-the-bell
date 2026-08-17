let ctx: AudioContext | null = null

function audio() {
  const AudioCtx =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return null
  if (!ctx || ctx.state === 'closed') ctx = new AudioCtx()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function buzz(when: number, duration: number, freq: number, gain: number) {
  const ac = audio()
  if (!ac) return
  const osc = ac.createOscillator()
  const amp = ac.createGain()
  const filter = ac.createBiquadFilter()
  osc.type = 'square'
  osc.frequency.value = freq
  filter.type = 'lowpass'
  filter.frequency.value = 420
  amp.gain.setValueAtTime(0.0001, when)
  amp.gain.exponentialRampToValueAtTime(gain, when + 0.012)
  amp.gain.exponentialRampToValueAtTime(0.0001, when + duration)
  osc.connect(filter)
  filter.connect(amp)
  amp.connect(ac.destination)
  osc.start(when)
  osc.stop(when + duration + 0.02)
}

export function playPhoneVibrate() {
  const ac = audio()
  if (!ac) return
  const t = ac.currentTime + 0.02
  const pattern = [0, 0.16, 0.34, 0.5, 0.86, 1.02]
  for (const offset of pattern) buzz(t + offset, 0.11, 168, 0.07)
}

export function playPinFail() {
  const ac = audio()
  if (!ac) return
  const t = ac.currentTime + 0.01
  buzz(t, 0.09, 140, 0.05)
  buzz(t + 0.12, 0.16, 92, 0.06)
}
