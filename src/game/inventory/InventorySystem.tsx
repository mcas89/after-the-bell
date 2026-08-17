import { useEffect } from 'react'
import { getExamineEntry } from '../data/examineContent'
import { useExamineStore } from '../examine/useExamineStore'
import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { useGameStore } from '../state/useGameStore'
import { useInventoryStore } from '../state/useInventoryStore'
import { refreshControlLock } from '../systems/controlLock'
import { InventoryOverlay, InventoryToast } from './InventoryOverlay'
import './collectItem'
import './inventory.css'

export function InventorySystem() {
  const open = useInventoryStore((s) => s.open)
  const prologueDone = useGameStore((s) => s.prologueDone)
  const interaction = useGameStore((s) => s.interactionState)

  useEffect(() => {
    refreshControlLock()
  }, [open, prologueDone, interaction])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat) return
      const game = useGameStore.getState()
      if (!game.prologueDone) return
      if (isPhoneOpen(usePhoneStore.getState().ui)) return
      if (game.interactionState === 'viewing-fragments') return

      const inventory = useInventoryStore.getState()

      if (event.code === 'KeyF') {
        if (game.interactionState !== 'examining-object') return
        const examiningId = useExamineStore.getState().examiningId
        const collectibleId = examiningId ? getExamineEntry(examiningId)?.collectibleId : undefined
        if (!collectibleId || inventory.has(collectibleId)) return
        event.preventDefault()
        inventory.collect(collectibleId)
        useExamineStore.getState().stopInspect()
        return
      }

      if (event.code === 'KeyI') {
        if (game.interactionState === 'examining-object') return
        if (game.interactionState === 'door-beat' || game.interactionState === 'opening-door' || game.interactionState === 'girl-glimpse' || game.interactionState === 'map-travel') return
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
