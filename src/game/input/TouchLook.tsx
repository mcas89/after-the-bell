import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { useGameStore } from '../state/useGameStore'
import { applyLookDelta, ensureLookReady, lookInput } from './lookInput'
import { readTouchUi } from './useTouchUi'

const DRAG = 12

function canLook() {
  if (!readTouchUi()) return false
  const game = useGameStore.getState()
  if (!game.prologueDone || game.interactionState !== 'gameplay') return false
  if (isPhoneOpen(usePhoneStore.getState().ui)) return false
  return true
}

export function TouchLook() {
  const { gl } = useThree()

  useEffect(() => {
    const el = gl.domElement

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return
      if (lookInput.pointerId !== null) return
      if (!canLook()) return
      ensureLookReady()
      lookInput.pointerId = event.pointerId
      lookInput.dragging = false
      lookInput.consumed = false
      lookInput.startX = event.clientX
      lookInput.startY = event.clientY
      lookInput.lastX = event.clientX
      lookInput.lastY = event.clientY
    }

    const onMove = (event: PointerEvent) => {
      if (lookInput.pointerId !== event.pointerId) return
      if (!canLook()) return
      const dx = event.clientX - lookInput.lastX
      const dy = event.clientY - lookInput.lastY
      lookInput.lastX = event.clientX
      lookInput.lastY = event.clientY
      const travel = Math.hypot(event.clientX - lookInput.startX, event.clientY - lookInput.startY)
      if (!lookInput.dragging && travel < DRAG) return
      if (!lookInput.dragging) {
        lookInput.dragging = true
        lookInput.consumed = true
        try {
          el.setPointerCapture(event.pointerId)
        } catch {
          /* already captured or unsupported */
        }
      }
      event.preventDefault()
      applyLookDelta(dx, dy)
    }

    const onUp = (event: PointerEvent) => {
      if (lookInput.pointerId !== event.pointerId) return
      lookInput.pointerId = null
      lookInput.dragging = false
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('lostpointercapture', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('lostpointercapture', onUp)
    }
  }, [gl])

  return null
}
