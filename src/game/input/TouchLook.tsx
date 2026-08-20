import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { useGameStore } from '../state/useGameStore'
import { applyLookDelta, ensureLookReady, lookInput, scaleZoom } from './lookInput'
import { readTouchUi } from './useTouchUi'

const DRAG = 10

function canTouchLook() {
  if (!readTouchUi()) return false
  if (!lookInput.follow) return false
  const game = useGameStore.getState()
  if (!game.prologueDone || game.interactionState !== 'gameplay') return false
  if (isPhoneOpen(usePhoneStore.getState().ui)) return false
  return true
}

function distBetween(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function midpoint(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

export function TouchLook() {
  const { gl } = useThree()

  useEffect(() => {
    const el = gl.domElement
    const points = new Map<number, { x: number; y: number }>()
    let lastPinch = 0
    let lastMid = { x: 0, y: 0 }
    let lookId: number | null = null
    let lastLook = { x: 0, y: 0 }
    let lookStart = { x: 0, y: 0 }

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return
      if (!canTouchLook()) return
      points.set(event.pointerId, { x: event.clientX, y: event.clientY })
      if (points.size === 1) {
        ensureLookReady()
        lookId = event.pointerId
        lookStart = { x: event.clientX, y: event.clientY }
        lastLook = lookStart
        lookInput.consumed = false
        lookInput.dragging = false
      }
      if (points.size === 2) {
        ensureLookReady()
        const pair = [...points.values()]
        lastPinch = distBetween(pair[0], pair[1])
        lastMid = midpoint(pair[0], pair[1])
        lookId = null
        lookInput.consumed = true
        lookInput.dragging = true
        event.preventDefault()
      }
    }

    const onMove = (event: PointerEvent) => {
      if (!points.has(event.pointerId)) return
      if (!canTouchLook()) return
      points.set(event.pointerId, { x: event.clientX, y: event.clientY })

      if (points.size >= 2) {
        const pair = [...points.values()]
        const next = distBetween(pair[0], pair[1])
        const mid = midpoint(pair[0], pair[1])
        event.preventDefault()
        lookInput.dragging = true
        lookInput.consumed = true
        if (lastPinch > 10 && next > 10) scaleZoom(next / lastPinch)
        applyLookDelta(mid.x - lastMid.x, mid.y - lastMid.y, 0.0048, 0.0052)
        lastPinch = next
        lastMid = mid
        return
      }

      if (lookId !== event.pointerId) return
      const travel = Math.hypot(event.clientX - lookStart.x, event.clientY - lookStart.y)
      if (!lookInput.dragging && travel < DRAG) {
        lastLook = { x: event.clientX, y: event.clientY }
        return
      }
      if (!lookInput.dragging) {
        lookInput.dragging = true
        lookInput.consumed = true
      }
      event.preventDefault()
      applyLookDelta(event.clientX - lastLook.x, event.clientY - lastLook.y, 0.0058, 0.0064)
      lastLook = { x: event.clientX, y: event.clientY }
    }

    const onUp = (event: PointerEvent) => {
      if (!points.has(event.pointerId)) return
      points.delete(event.pointerId)
      if (lookId === event.pointerId) lookId = null
      if (points.size === 1) {
        const [id, pos] = [...points.entries()][0]
        lookId = id
        lookStart = pos
        lastLook = pos
        lastPinch = 0
      }
      if (points.size < 2) {
        lookInput.dragging = points.size === 1 ? lookInput.dragging : false
        lastPinch = 0
      }
      if (points.size === 0) lookInput.dragging = false
    }

    const blockGesture = (event: Event) => event.preventDefault()
    const onTouchMove = (event: TouchEvent) => {
      if (!canTouchLook()) return
      if (event.touches.length >= 2) event.preventDefault()
    }

    el.addEventListener('pointerdown', onDown, { passive: false })
    el.addEventListener('pointermove', onMove, { passive: false })
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('gesturestart', blockGesture)
    el.addEventListener('gesturechange', blockGesture)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('gesturestart', blockGesture)
      el.removeEventListener('gesturechange', blockGesture)
    }
  }, [gl])

  return null
}
