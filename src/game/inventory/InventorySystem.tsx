import { useEffect } from 'react'
import { tryCollect } from '../input/actions'
import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { isSkeletonScare } from '../rooms/skeletonCabinet'
import { useGameStore } from '../state/useGameStore'
import { useInventoryStore } from '../state/useInventoryStore'
import { refreshControlLock } from '../systems/controlLock'
import { InventoryOverlay, InventoryToast } from './InventoryOverlay'
import { toggleFlashlight } from './flashlight'
import './collectItem'
import './inventory.css'

export function InventorySystem() {
  const open = useInventoryStore((s) => s.open)
  const prologueDone = useGameStore((s) => s.prologueDone)
  const interaction = useGameStore((s) => s.interactionState)
  const paused = useGameStore((s) => s.paused)

  useEffect(() => {
    refreshControlLock()
  }, [open, prologueDone, interaction, paused])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat) return
      const game = useGameStore.getState()
      if (!game.prologueDone || game.paused) return
      if (isPhoneOpen(usePhoneStore.getState().ui)) return
      if (game.interactionState === 'viewing-fragments') return
      if (isSkeletonScare()) return

      const inventory = useInventoryStore.getState()

      if (event.code === 'KeyF') {
        event.preventDefault()
        tryCollect()
        return
      }

      if (event.code === 'KeyL') {
        if (game.interactionState !== 'gameplay' && game.interactionState !== 'viewing-inventory') return
        event.preventDefault()
        toggleFlashlight()
        return
      }

      if (event.code === 'KeyI') {
        if (game.interactionState === 'examining-object') return
        if (game.interactionState === 'door-beat' || game.interactionState === 'opening-door' || game.interactionState === 'girl-glimpse' || game.interactionState === 'map-travel' || game.interactionState === 'using-computer' || game.interactionState === 'ending') return
        if (inventory.items.length === 0) return
        event.preventDefault()
        inventory.toggleInventory()
        return
      }

      if (event.code === 'Escape' && inventory.open) {
        event.preventDefault()
        inventory.closeInventory()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!prologueDone) return <InventoryToast />

  return (
    <>
      <InventoryOverlay />
      <InventoryToast />
    </>
  )
}
