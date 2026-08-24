import { isComputerOpen, useComputerStore } from '../computer/computerStore'
import { OBJECTIVES } from '../data/objectives'
import { roomLabel } from '../data/rooms'
import { useHallwayStore } from '../hallway/useHallwayStore'
import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { useFragmentsStore } from '../state/useFragmentsStore'
import { useGameStore } from '../state/useGameStore'

export function ChapterHud() {
  const room = useGameStore((s) => s.currentRoom)
  const boot = useGameStore((s) => s.bootScreen)
  const prologueDone = useGameStore((s) => s.prologueDone)
  const paused = useGameStore((s) => s.paused)
  const interaction = useGameStore((s) => s.interactionState)
  const phoneUi = usePhoneStore((s) => s.ui)
  const computerUi = useComputerStore((s) => s.ui)
  const fragmentsOpen = useFragmentsStore((s) => s.open)
  const objective = useHallwayStore((s) => s.objective)
  const line = useHallwayStore((s) => s.line)
  const objectiveDef = objective ? OBJECTIVES[objective] : null
  const overlayOpen =
    paused ||
    isPhoneOpen(phoneUi) ||
    isComputerOpen(computerUi) ||
    fragmentsOpen ||
    interaction === 'viewing-inventory' ||
    interaction === 'viewing-fragments' ||
    interaction === 'ending'
  const showLocation = boot === 'playing' && prologueDone && !overlayOpen

  return (
    <>
      {showLocation ? (
        <div className="location-card">
          <h2>{roomLabel(room)}</h2>
        </div>
      ) : null}
      {objectiveDef && showLocation ? (
        <p className="objective-chip">{objectiveDef.title}</p>
      ) : null}
      {line ? <p className="spoken-line">{line}</p> : null}
    </>
  )
}
