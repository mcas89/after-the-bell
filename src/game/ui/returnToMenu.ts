import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { useExamineStore } from '../examine/useExamineStore'
import { saveManager } from '../state/gameSaveManager'
import { useFragmentsStore } from '../state/useFragmentsStore'
import { useGameStore } from '../state/useGameStore'
import { useInventoryStore } from '../state/useInventoryStore'
import { refreshControlLock } from '../systems/controlLock'

export function returnToMenu() {
  const game = useGameStore.getState()
  if (game.bootScreen !== 'playing') return

  if (game.interactionState === 'examining-object') {
    useExamineStore.getState().stopInspect()
  }
  useFragmentsStore.getState().closeJournal()
  useInventoryStore.getState().closeInventory()

  const phone = usePhoneStore.getState()
  if (isPhoneOpen(phone.ui)) phone.close()
  if (phone.ui === 'notification') phone.dismissNotice()

  saveManager.save()
  game.setCameraOverride(null)
  if (game.prologueDone) {
    game.setCameraMode('explore')
    game.setInteractionState('gameplay')
  }
  game.openMenu()
  refreshControlLock()
}

export function canReturnToMenu() {
  const game = useGameStore.getState()
  if (game.bootScreen !== 'playing' || !game.prologueDone) return false
  if (game.interactionState === 'door-beat' || game.interactionState === 'opening-door' || game.interactionState === 'girl-glimpse' || game.interactionState === 'map-travel') return false
  if (game.interactionState === 'examining-object') return false
  if (isPhoneOpen(usePhoneStore.getState().ui)) return false
  if (useFragmentsStore.getState().open) return false
  if (useInventoryStore.getState().open) return false
  if (usePhoneStore.getState().ui === 'notification') return false
  return true
}
