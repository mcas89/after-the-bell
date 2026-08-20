import { useSyncExternalStore } from 'react'
import { canOpenClassroomDoor, useDoorStore } from '../door/useDoorStore'
import { tryInteract } from '../input/actions'
import { lookInput, subscribePhoneFollow, togglePhoneFollow } from '../input/lookInput'
import { useTouchUi } from '../input/useTouchUi'
import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { useGameStore } from '../state/useGameStore'
import { useHallwayStore } from '../hallway/useHallwayStore'
import { Joystick } from '../ui/Joystick'

export function TouchControls() {
  const touch = useTouchUi()
  const follow = useSyncExternalStore(subscribePhoneFollow, () => lookInput.follow, () => false)
  const prologueDone = useGameStore((s) => s.prologueDone)
  const interaction = useGameStore((s) => s.interactionState)
  const phoneOpen = usePhoneStore((s) => isPhoneOpen(s.ui))
  const hallPrompt = useHallwayStore((s) => s.prompt)
  const doorPhase = useDoorStore((s) => s.phase)
  const doorNear = useDoorStore((s) => s.near)
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
    interaction === 'map-travel' ||
    interaction === 'examining-object'
  ) {
    return null
  }

  const walking = interaction === 'gameplay'

  return (
    <div className="touch-hud">
      {walking ? <Joystick /> : null}
      {walking ? (
        <button
          className={follow ? 'touch-btn is-cam is-on' : 'touch-btn is-cam'}
          type="button"
          title={follow ? 'Câmera da sala' : 'Câmera na Lívia'}
          aria-label={follow ? 'Câmera da sala' : 'Câmera na Lívia'}
          onPointerDown={(event) => {
            event.preventDefault()
            event.stopPropagation()
            togglePhoneFollow()
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden>
            <path
              d="M4.6 8.2h3.1l1.1-1.7h6.4l1.1 1.7h3.1v9.4H4.6V8.2z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12.4" r="2.7" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
      ) : null}
      {walking && act ? (
        <button className="touch-btn is-act" type="button" onPointerDown={(event) => {
          event.preventDefault()
          event.stopPropagation()
          tryInteract()
        }}>
          {act}
        </button>
      ) : null}
    </div>
  )
}
