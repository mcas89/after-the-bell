import { useEffect } from 'react'
import { refreshControlLock } from '../systems/controlLock'
import { PORTRAIT_QUERY, tryLockLandscape } from './landscape'

export function RotatePrompt() {
  useEffect(() => {
    const mq = window.matchMedia(PORTRAIT_QUERY)
    const sync = () => refreshControlLock()
    mq.addEventListener('change', sync)
    window.addEventListener('orientationchange', sync)
    sync()
    return () => {
      mq.removeEventListener('change', sync)
      window.removeEventListener('orientationchange', sync)
    }
  }, [])

  return (
    <div
      className="rotate-prompt"
      role="dialog"
      aria-label="Vire o celular"
      onPointerDown={() => {
        void tryLockLandscape()
      }}
    >
      <span className="rotate-phone" aria-hidden />
      <p className="rotate-copy">Vire o celular</p>
      <p className="rotate-hint">O jogo é em paisagem.</p>
    </div>
  )
}
