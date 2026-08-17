import { useEffect } from 'react'
import { useGameStore } from '../state/useGameStore'
import { canReturnToMenu, returnToMenu } from './returnToMenu'

export function MenuButton() {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.code !== 'Escape') return
      if (useGameStore.getState().interactionState === 'examining-object') return
      if (!canReturnToMenu()) return
      event.preventDefault()
      returnToMenu()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <button className="hud-icon hud-menu" type="button" onClick={returnToMenu} title="Menu (Esc)">
      <svg viewBox="0 0 24 24" aria-hidden>
        <path
          d="M5 7h14M5 12h14M5 17h14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </button>
  )
}
