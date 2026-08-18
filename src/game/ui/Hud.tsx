import { ExamineHud } from '../examine/ExamineHud'
import { useExamineStore } from '../examine/useExamineStore'
import { FragmentsSystem } from '../fragments/FragmentsSystem'
import { useDoorStore } from '../door/useDoorStore'
import { useKeyboard } from '../input/useKeyboard'
import { InventorySystem } from '../inventory/InventorySystem'
import { PhoneSystem } from '../phone/PhoneSystem'
import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { PrologueOverlay } from '../prologue/PrologueOverlay'
import { SaveDirector } from '../state/SaveDirector'
import { useGameStore } from '../state/useGameStore'
import { MenuButton } from './MenuButton'
import { DebugResetSave } from './DebugResetSave'
import { ChapterHud } from './ChapterHud'
import { MapFade } from './MapFade'
import { useHallwayStore } from '../hallway/useHallwayStore'
import { ComputerSystem } from '../computer/ComputerSystem'

export function Hud() {
  useKeyboard()
  const bootScreen = useGameStore((s) => s.bootScreen)
  const prologueDone = useGameStore((s) => s.prologueDone)
  const interaction = useGameStore((s) => s.interactionState)
  const phoneUi = usePhoneStore((s) => s.ui)
  const hovered = useExamineStore((s) => s.hoveredId)
  const doorLine = useDoorStore((s) => s.line)
  const doorNear = useDoorStore((s) => s.near)
  const doorPhase = useDoorStore((s) => s.phase)
  const hallLine = useHallwayStore((s) => s.line)
  const hallPrompt = useHallwayStore((s) => s.prompt)
  const showHint =
    bootScreen === 'playing' &&
    prologueDone &&
    !isPhoneOpen(phoneUi) &&
    interaction === 'gameplay' &&
    !hovered &&
    !hallPrompt &&
    !hallLine &&
    !(doorPhase === 'ajar' && doorNear)

  if (bootScreen === 'menu') return null

  return (
    <div className="overlay">
      <div className="vignette" />
      <PrologueOverlay />
      {prologueDone ? <MenuButton /> : null}
      <PhoneSystem />
      <ComputerSystem />
      <FragmentsSystem />
      <InventorySystem />
      <ExamineHud />
      <ChapterHud />
      {doorLine && !hallLine ? <p className="spoken-line">{doorLine}</p> : null}
      <SaveDirector />
      <DebugResetSave />
      {showHint ? <p className="hud">WASD para andar</p> : null}
      <MapFade />
    </div>
  )
}
