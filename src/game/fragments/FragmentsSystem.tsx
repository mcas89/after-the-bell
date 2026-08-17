import { useEffect } from 'react'
import { InventoryDock } from '../inventory/InventoryDock'
import { PhoneDock, PhoneNotice } from '../phone/PhoneNotice'
import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { useGameStore } from '../state/useGameStore'
import { useFragmentsStore } from '../state/useFragmentsStore'
import { isInventoryOpen, useInventoryStore } from '../state/useInventoryStore'
import { refreshControlLock } from '../systems/controlLock'
import { FragmentsDock } from './FragmentsDock'
import { FragmentToast, FragmentsOverlay } from './FragmentsOverlay'
import './discoverClue'
import './fragments.css'

export function FragmentsSystem() {
  const open = useFragmentsStore((s) => s.open)
  const prologueDone = useGameStore((s) => s.prologueDone)
  const interaction = useGameStore((s) => s.interactionState)
  const phoneUi = usePhoneStore((s) => s.ui)
  const inventoryOpen = useInventoryStore((s) => s.open)

  useEffect(() => {
    refreshControlLock()
  }, [open, prologueDone, interaction])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat) return
      const game = useGameStore.getState()
      if (!game.prologueDone) return
      if (isPhoneOpen(usePhoneStore.getState().ui)) return
      if (isInventoryOpen()) return

      const fragments = useFragmentsStore.getState()

      if (event.code === 'KeyJ') {
        if (game.interactionState === 'examining-object') return
        if (game.interactionState === 'door-beat' || game.interactionState === 'opening-door' || game.interactionState === 'girl-glimpse' || game.interactionState === 'map-travel') return
        event.preventDefault()
        fragments.toggleJournal()
        return
      }

      if (event.code === 'Escape' && fragments.open) {
        event.preventDefault()
        fragments.closeJournal()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!prologueDone) return <FragmentToast />

  const showDock = !open && !inventoryOpen && !isPhoneOpen(phoneUi)

  return (
    <>
      {showDock ? (
        <div className="hud-tools">
          <div className="hud-tools-icons">
            <PhoneDock />
            <FragmentsDock />
            <InventoryDock />
          </div>
          <PhoneNotice />
        </div>
      ) : null}
      <FragmentsOverlay />
      <FragmentToast />
    </>
  )
}
