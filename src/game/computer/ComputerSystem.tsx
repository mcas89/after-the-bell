import { useEffect } from 'react'
import { useGameStore } from '../state/useGameStore'
import { refreshControlLock } from '../systems/controlLock'
import { ComputerOverlay } from './ComputerOverlay'
import { isComputerOpen, useComputerStore } from './computerStore'
import './computer.css'

export function ComputerSystem() {
  const ui = useComputerStore((s) => s.ui)
  const prologueDone = useGameStore((s) => s.prologueDone)
  const interaction = useGameStore((s) => s.interactionState)

  useEffect(() => {
    refreshControlLock()
  }, [ui, prologueDone, interaction])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat) return
      const computer = useComputerStore.getState()
      if (!isComputerOpen(computer.ui)) return

      if (event.code === 'Escape' || event.code === 'KeyX') {
        event.preventDefault()
        event.stopImmediatePropagation()
        if (computer.ui === 'desktop' && computer.goBack()) {
          return
        }
        if (computer.ui === 'desktop' && computer.app === 'web' && computer.historyOpen) {
          computer.closeHistory()
          return
        }
        if (computer.ui === 'desktop' && computer.app !== 'home') {
          computer.goHome()
          return
        }
        computer.close()
        return
      }

      if (computer.ui !== 'login') return
      if (event.key >= '0' && event.key <= '9') {
        event.preventDefault()
        computer.inputDigit(event.key)
      }
      if (event.key === 'Backspace') {
        event.preventDefault()
        computer.deleteDigit()
      }
      if (event.key === 'Enter' && computer.pin.length > 0) computer.tryUnlock()
    }

    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [])

  if (!prologueDone) return null

  return <ComputerOverlay />
}
