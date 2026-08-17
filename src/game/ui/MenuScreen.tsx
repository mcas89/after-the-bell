import { useEffect } from 'react'
import {
  startMenuMusic,
  stopMenuMusic,
  unlockAudio,
  startBedMusic,
} from '../audio/mixer'
import { saveManager } from '../state/gameSaveManager'
import { useGameStore } from '../state/useGameStore'
import { refreshControlLock } from '../systems/controlLock'
import menuArt from '../../../menu.png'

export function MenuScreen() {
  const boot = useGameStore((s) => s.bootScreen)
  const canContinue = boot === 'menu' && saveManager.hasStoredGame()
  useEffect(() => {
    if (boot !== 'menu') return
    startMenuMusic()
    return () => stopMenuMusic()
  }, [boot])

  if (boot !== 'menu') return null

  const wake = () => {
    unlockAudio()
    startMenuMusic()
  }

  const startNew = () => {
    wake()
    saveManager.clear()
    saveManager.applyEmpty()
    stopMenuMusic()
    useGameStore.getState().enterGame()
    refreshControlLock()
  }

  const continueGame = () => {
    if (!canContinue) return
    wake()
    saveManager.applyLoaded()
    stopMenuMusic()
    useGameStore.getState().enterGame()
    refreshControlLock()
    if (useGameStore.getState().prologueDone) startBedMusic()
  }

  return (
    <div className="menu-screen" onPointerDown={wake}>
      <img className="menu-art" src={menuArt} alt="" />
      <div className="menu-shade" />
      <nav className="menu-actions" aria-label="Menu">
        <button className="menu-btn" type="button" onClick={startNew}>
          Novo jogo
        </button>
        <button className="menu-btn" type="button" onClick={continueGame} disabled={!canContinue}>
          Continuar
        </button>
      </nav>
    </div>
  )
}
