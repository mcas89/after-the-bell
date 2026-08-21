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
  const paused = useGameStore((s) => s.paused)
  const phoneOpen = usePhoneStore((s) => isPhoneOpen(s.ui))
  const hallPrompt = useHallwayStore((s) => s.prompt)
  const doorPhase = useDoorStore((s) => s.phase)
  const doorNear = useDoorStore((s) => s.near)
  const act = hallPrompt
    ? hallPrompt.replace(/^E /, '')
    : doorPhase === 'ajar' && doorNear && canOpenClassroomDoor()
      ? 'abrir'
      : null

  if (!touch || !prologueDone || phoneOpen || paused) return null
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
          title={follow ? 'Câmera da sala' : 'Seguir Lívia'}
          aria-label={follow ? 'Câmera da sala' : 'Seguir Lívia'}
          onPointerDown={(event) => {
            event.preventDefault()
            event.stopPropagation()
            togglePhoneFollow()
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="8.6" r="2.15" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M8.15 16.7c.65-2.15 1.95-3.25 3.85-3.25s3.2 1.1 3.85 3.25"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M4.7 10.4a7.4 7.4 0 0 1 5.15-5.55"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.45"
              strokeLinecap="round"
            />
            <path
              d="M8.7 4.55 9.05 6.8 6.85 6.15"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.45"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19.3 13.6a7.4 7.4 0 0 1-5.15 5.55"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.45"
              strokeLinecap="round"
            />
            <path
              d="M15.3 19.45 14.95 17.2 17.15 17.85"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.45"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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
