import { useEffect } from 'react'
import { saveManager } from '../state/gameSaveManager'
import { useGameStore } from '../state/useGameStore'
import { refreshControlLock } from '../systems/controlLock'
import { canReturnToMenu, returnToMenu } from './returnToMenu'
import { SaveHistoryPanel } from './SaveHistory'

function setPaused(paused: boolean) {
  useGameStore.getState().setPaused(paused)
  refreshControlLock()
}

function openPause() {
  if (useGameStore.getState().paused) return
  if (!canReturnToMenu()) return
  saveManager.save()
  setPaused(true)
}

function closePause() {
  if (!useGameStore.getState().paused) return
  setPaused(false)
}

export function MenuButton() {
  const paused = useGameStore((s) => s.paused)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.code !== 'Escape') return
      if (useGameStore.getState().interactionState === 'examining-object') return
      if (useGameStore.getState().paused) {
        event.preventDefault()
        closePause()
        return
      }
      if (!canReturnToMenu()) return
      event.preventDefault()
      openPause()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <button
        className="hud-icon hud-menu"
        type="button"
        onClick={() => (paused ? closePause() : openPause())}
        title="Menu (Esc)"
      >
        <svg viewBox="0 0 24 24" aria-hidden>
          {paused ? (
            <path
              d="M7.2 7.2 16.8 16.8M16.8 7.2 7.2 16.8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M5 7h14M5 12h14M5 17h14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>
      {paused ? (
        <div className="pause-overlay" role="dialog" aria-label="Menu">
          <div className="pause-card">
            <p className="pause-kicker">Pausa</p>
            <button className="pause-btn" type="button" onClick={closePause}>
              Continuar
            </button>
            <SaveHistoryPanel />
            <button
              className="pause-btn is-ghost"
              type="button"
              onClick={() => {
                closePause()
                returnToMenu()
              }}
            >
              Sair para o menu
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
