import { useRef } from 'react'
import { collectPromptFor } from '../data/examineContent'
import { canOpenClassroomDoor, useDoorStore } from '../door/useDoorStore'
import { useExamineStore } from '../examine/useExamineStore'
import { tryCollect, tryInteract } from '../input/actions'
import { applyZoom } from '../input/lookInput'
import { useTouchUi } from '../input/useTouchUi'
import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { useGameStore } from '../state/useGameStore'
import { useInventoryStore } from '../state/useInventoryStore'
import { useHallwayStore } from '../hallway/useHallwayStore'
import { Joystick } from '../ui/Joystick'

function ZoomButtons() {
  const hold = useRef(0)

  const start = (delta: number) => {
    window.clearInterval(hold.current)
    applyZoom(delta)
    hold.current = window.setInterval(() => applyZoom(delta * 0.55), 50)
  }

  const stop = () => {
    window.clearInterval(hold.current)
    hold.current = 0
  }

  return (
    <div className="touch-zoom">
      <button
        className="touch-zoom-btn"
        type="button"
        aria-label="Aproximar"
        onPointerDown={(event) => {
          event.preventDefault()
          event.stopPropagation()
          event.currentTarget.setPointerCapture(event.pointerId)
          start(-0.22)
        }}
        onPointerUp={stop}
        onPointerCancel={stop}
        onLostPointerCapture={stop}
      >
        +
      </button>
      <button
        className="touch-zoom-btn"
        type="button"
        aria-label="Afastar"
        onPointerDown={(event) => {
          event.preventDefault()
          event.stopPropagation()
          event.currentTarget.setPointerCapture(event.pointerId)
          start(0.22)
        }}
        onPointerUp={stop}
        onPointerCancel={stop}
        onLostPointerCapture={stop}
      >
        −
      </button>
    </div>
  )
}

export function TouchControls() {
  const touch = useTouchUi()
  const prologueDone = useGameStore((s) => s.prologueDone)
  const interaction = useGameStore((s) => s.interactionState)
  const phoneOpen = usePhoneStore((s) => isPhoneOpen(s.ui))
  const hallPrompt = useHallwayStore((s) => s.prompt)
  const doorPhase = useDoorStore((s) => s.phase)
  const doorNear = useDoorStore((s) => s.near)
  const examiningId = useExamineStore((s) => s.examiningId)
  const detailId = useExamineStore((s) => s.detailId)
  useInventoryStore((s) => s.items)
  const collect = collectPromptFor(examiningId, detailId)
  const act = hallPrompt
    ? hallPrompt.replace(/^E /, '')
    : doorPhase === 'ajar' && doorNear && canOpenClassroomDoor()
      ? 'abrir'
      : null

  if (!touch || !prologueDone || phoneOpen) return null
  if (
    interaction === 'using-computer' ||
    interaction === 'viewing-inventory' ||
    interaction === 'viewing-fragments' ||
    interaction === 'door-beat' ||
    interaction === 'opening-door' ||
    interaction === 'girl-glimpse' ||
    interaction === 'map-travel'
  ) {
    return null
  }

  const walking = interaction === 'gameplay'
  const examining = interaction === 'examining-object'

  return (
    <div className="touch-hud">
      {walking ? <Joystick /> : null}
      {walking ? <ZoomButtons /> : null}
      {walking && act ? (
        <button className="touch-btn is-act" type="button" onPointerDown={(event) => {
          event.preventDefault()
          event.stopPropagation()
          tryInteract()
        }}>
          {act}
        </button>
      ) : null}
      {examining && collect ? (
        <button className="touch-btn is-take" type="button" onPointerDown={(event) => {
          event.preventDefault()
          event.stopPropagation()
          tryCollect()
        }}>
          pegar
        </button>
      ) : null}
    </div>
  )
}
