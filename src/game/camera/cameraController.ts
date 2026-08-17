import type { CameraOverride } from '../data/cameras'
import { useGameStore } from '../state/useGameStore'
import { refreshControlLock } from '../systems/controlLock'

export const cameraController = {
  playCinematic(override: CameraOverride) {
    const game = useGameStore.getState()
    game.setCameraMode('cutscene')
    game.setCameraOverride(override)
    refreshControlLock()
  },
  restoreGameplayCamera() {
    const game = useGameStore.getState()
    game.setCameraMode('explore')
    game.setCameraOverride(null)
    if (game.interactionState === 'girl-glimpse') game.setInteractionState('gameplay')
    refreshControlLock()
  },
}
