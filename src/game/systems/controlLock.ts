import { playerMotion } from '../player/playerMotion'
import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { isSkeletonScare } from '../rooms/skeletonCabinet'
import { useGameStore } from '../state/useGameStore'
import { isCoarsePortrait } from '../ui/landscape'

export function refreshControlLock() {
  const game = useGameStore.getState()
  const phoneOpen = isPhoneOpen(usePhoneStore.getState().ui)
  playerMotion.controlLocked =
    game.bootScreen === 'menu' ||
    game.paused ||
    !game.prologueDone ||
    phoneOpen ||
    game.interactionState !== 'gameplay' ||
    isSkeletonScare() ||
    (game.bootScreen === 'playing' && isCoarsePortrait())
}
