import { playerMotion } from '../player/playerMotion'

export const PITCH_MIN = -0.42
export const PITCH_MAX = 0.78
export const ZOOM_MIN = 1.55
export const ZOOM_MAX = 4.15
export const ZOOM_DEFAULT = 2.45

export const lookInput = {
  yaw: 0,
  pitch: 0.12,
  zoom: ZOOM_DEFAULT,
  dragging: false,
  consumed: false,
  ready: false,
  pointerId: null as number | null,
  lastX: 0,
  lastY: 0,
  startX: 0,
  startY: 0,
}

export function resetLook() {
  lookInput.dragging = false
  lookInput.consumed = false
  lookInput.ready = false
  lookInput.pointerId = null
}

export function ensureLookReady() {
  if (lookInput.ready) return
  lookInput.yaw = playerMotion.yaw
  lookInput.pitch = 0.12
  lookInput.ready = true
}

export function applyLookDelta(dx: number, dy: number, yawSens = 0.0058, pitchSens = 0.0038) {
  lookInput.yaw -= dx * yawSens
  lookInput.pitch = Math.min(PITCH_MAX, Math.max(PITCH_MIN, lookInput.pitch + dy * pitchSens))
  lookInput.ready = true
}

export function applyZoom(delta: number) {
  lookInput.zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, lookInput.zoom + delta))
}

export function setZoom(value: number) {
  lookInput.zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value))
}

export function scaleZoom(scale: number) {
  setZoom(lookInput.zoom * scale)
}
