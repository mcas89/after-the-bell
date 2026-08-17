import { playerMotion } from '../player/playerMotion'
import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { useGameStore } from '../state/useGameStore'

export function refreshControlLock() {
  const game = useGameStore.getState()
  const phoneOpen = isPhoneOpen(usePhoneStore.getState().ui)
  playerMotion.controlLocked =
    game.bootScreen === 'menu' ||
    !game.prologueDone ||
    phoneOpen ||
    game.interactionState !== 'gameplay'
}
