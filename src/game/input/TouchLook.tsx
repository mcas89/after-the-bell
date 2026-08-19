import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { useGameStore } from '../state/useGameStore'
import { lookInput, setZoom } from './lookInput'
import { readTouchUi } from './useTouchUi'

function canZoom() {
  if (!readTouchUi()) return false
  const game = useGameStore.getState()
  if (!game.prologueDone || game.interactionState !== 'gameplay') return false
  if (isPhoneOpen(usePhoneStore.getState().ui)) return false
  return true
}

function distBetween(
  a: { x: number; y: number },
  b: { x: number; y: number },
) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function TouchLook() {
  const { gl } = useThree()

  useEffect(() => {
    const el = gl.domElement
    const points = new Map<number, { x: number; y: number }>()
    let pinchStart = 0
    let pinchZoom = lookInput.zoom

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return
      if (!canZoom()) return
      points.set(event.pointerId, { x: event.clientX, y: event.clientY })
      if (points.size === 1) lookInput.consumed = false
      if (points.size === 2) {
        const pair = [...points.values()]
        pinchStart = distBetween(pair[0], pair[1])
        pinchZoom = lookInput.zoom
        lookInput.consumed = true
        lookInput.dragging = true
      }
    }

    const onMove = (event: PointerEvent) => {
      if (!points.has(event.pointerId)) return
      points.set(event.pointerId, { x: event.clientX, y: event.clientY })
      if (points.size !== 2 || pinchStart < 8) return
      if (!canZoom()) return
      const pair = [...points.values()]
      const next = distBetween(pair[0], pair[1])
      event.preventDefault()
      setZoom(pinchZoom * (pinchStart / Math.max(12, next)))
    }

    const onUp = (event: PointerEvent) => {
      if (!points.has(event.pointerId)) return
      points.delete(event.pointerId)
      if (points.size < 2) {
        lookInput.dragging = false
        pinchStart = 0
      }
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
    }
  }, [gl])

  return null
}
