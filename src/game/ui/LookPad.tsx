import { useCallback, useEffect, useRef, useState } from 'react'
import { applyLookDelta, ensureLookReady, lookInput } from '../input/lookInput'
import { useTouchUi } from '../input/useTouchUi'
import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { useGameStore } from '../state/useGameStore'

export function LookPad() {
  const touch = useTouchUi()
  const prologueDone = useGameStore((s) => s.prologueDone)
  const interaction = useGameStore((s) => s.interactionState)
  const phoneOpen = usePhoneStore((s) => isPhoneOpen(s.ui))
  const pointerId = useRef<number | null>(null)
  const last = useRef({ x: 0, y: 0 })
  const [active, setActive] = useState(false)

  const stop = useCallback(() => {
    pointerId.current = null
    lookInput.dragging = false
    setActive(false)
  }, [])

  useEffect(() => stop, [stop])

  if (touch || !prologueDone || phoneOpen) return null
  if (
    interaction === 'using-computer' ||
    interaction === 'viewing-inventory' ||
    interaction === 'viewing-fragments' ||
    interaction === 'door-beat' ||
    interaction === 'opening-door' ||
    interaction === 'girl-glimpse' ||
    interaction === 'map-travel' ||
    interaction === 'examining-object'
  ) {
    return null
  }

  return (
    <button
      className={`look-pad${active ? ' is-active' : ''}`}
      type="button"
      title="Girar câmera"
      aria-label="Girar câmera"
      onPointerDown={(event) => {
        event.preventDefault()
        event.stopPropagation()
        event.currentTarget.setPointerCapture(event.pointerId)
        pointerId.current = event.pointerId
        last.current = { x: event.clientX, y: event.clientY }
        ensureLookReady()
        lookInput.dragging = true
        setActive(true)
      }}
      onPointerMove={(event) => {
        if (pointerId.current !== event.pointerId) return
        event.preventDefault()
        applyLookDelta(event.clientX - last.current.x, event.clientY - last.current.y)
        last.current = { x: event.clientX, y: event.clientY }
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={stop}
    >
      <svg viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="7.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M12 4.6v2.2M12 17.2v2.2M4.6 12h2.2M17.2 12h2.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="1.35" fill="currentColor" />
      </svg>
    </button>
  )
}
