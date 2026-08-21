import { useEffect } from 'react'
import { playerMotion } from '../player/playerMotion'
import { useGameStore } from '../state/useGameStore'
import { refreshControlLock } from '../systems/controlLock'
import { PhoneOverlay } from './PhoneOverlay'
import { isPhoneOpen, usePhoneStore } from './phoneStore'
import './phone.css'

const WALK_TRIGGER = 2.8

export function PhoneSystem() {
  const ui = usePhoneStore((s) => s.ui)
  const prologueDone = useGameStore((s) => s.prologueDone)
  const interaction = useGameStore((s) => s.interactionState)
  const paused = useGameStore((s) => s.paused)

  useEffect(() => {
    let id = 0
    const loop = () => {
      const ready = useGameStore.getState().prologueDone
      const phone = usePhoneStore.getState()
      if (ready) phone.ensureReady()
      if (ready && !phone.triggered && playerMotion.distanceWalked >= WALK_TRIGGER) {
        phone.trigger()
      }
      id = requestAnimationFrame(loop)
    }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    refreshControlLock()
  }, [ui, prologueDone, interaction, paused])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat) return
      const game = useGameStore.getState()
      if (!game.prologueDone || game.paused) return

      const phone = usePhoneStore.getState()
      const { ui } = phone

      if (event.code === 'Escape') {
        if (isPhoneOpen(ui)) {
          event.preventDefault()
          if (phone.goBack()) return
          phone.close()
        } else if (ui === 'notification' && game.interactionState === 'gameplay') {
          event.preventDefault()
          phone.dismissNotice()
        }
        return
      }

      if (ui !== 'pin-entry') return
      if (event.key >= '0' && event.key <= '9') phone.inputDigit(event.key)
      if (event.key === 'Backspace') phone.deleteDigit()
      if (event.key === 'Enter' && phone.pin.length > 0) phone.tryUnlock()
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!prologueDone) return null

  return <PhoneOverlay />
}
