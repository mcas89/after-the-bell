import { useCallback, useRef, useState } from 'react'
import { moveInput } from '../input/moveInput'

const RADIUS = 52
const DEADZONE = 0.12

export function Joystick() {
  const origin = useRef({ x: 0, y: 0 })
  const pointerId = useRef<number | null>(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const [active, setActive] = useState(false)

  const apply = useCallback((clientX: number, clientY: number) => {
    const dx = clientX - origin.current.x
    const dy = clientY - origin.current.y
    const len = Math.hypot(dx, dy)
    const clamped = len > RADIUS ? RADIUS : len
    const nx = len > 0.0001 ? (dx / len) * clamped : 0
    const ny = len > 0.0001 ? (dy / len) * clamped : 0
    const x = nx / RADIUS
    const z = ny / RADIUS
    const mag = Math.hypot(x, z)

    if (mag < DEADZONE) {
      moveInput.stickX = 0
      moveInput.stickZ = 0
    } else {
      const scaled = (mag - DEADZONE) / (1 - DEADZONE)
      moveInput.stickX = (x / mag) * scaled
      moveInput.stickZ = (z / mag) * scaled
    }
    setKnob({ x: nx, y: ny })
  }, [])

  const stop = useCallback(() => {
    pointerId.current = null
    moveInput.stickX = 0
    moveInput.stickZ = 0
    setKnob({ x: 0, y: 0 })
    setActive(false)
  }, [])

  return (
    <div
      className={`joystick${active ? ' is-active' : ''}`}
      onPointerDown={(event) => {
        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)
        pointerId.current = event.pointerId
        const rect = event.currentTarget.getBoundingClientRect()
        origin.current = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        }
        setActive(true)
        apply(event.clientX, event.clientY)
      }}
      onPointerMove={(event) => {
        if (pointerId.current !== event.pointerId) return
        apply(event.clientX, event.clientY)
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
    >
      <div
        className="joystick-knob"
        style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
      />
    </div>
  )
}
