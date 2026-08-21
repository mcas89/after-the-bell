import { GameCanvas } from './game/canvas/GameCanvas'
import { Hud } from './game/ui/Hud'
import { InstallGate } from './game/ui/InstallGate'
import { LoaderScreen } from './game/ui/LoaderScreen'
import { MenuScreen } from './game/ui/MenuScreen'
import { RotatePrompt } from './game/ui/RotatePrompt'
import { UpdateScreen } from './game/ui/UpdateScreen'

export default function App() {
  return (
    <>
      <GameCanvas />
      <LoaderScreen />
      <Hud />
      <MenuScreen />
      <RotatePrompt />
      <InstallGate />
      <UpdateScreen />
    </>
  )
}
