import { canOpenClassroomDoor, useDoorStore } from '../door/useDoorStore'
import { tryInteract } from '../input/actions'
import { useTouchUi } from '../input/useTouchUi'
import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { useGameStore } from '../state/useGameStore'
import { useHallwayStore } from '../hallway/useHallwayStore'
import { Joystick } from '../ui/Joystick'

export function TouchControls() {
  const touch = useTouchUi()
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
