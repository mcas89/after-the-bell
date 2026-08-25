import { playSfx, SFX } from '../audio/mixer'
import { ITEM_IDS } from '../data/items'
import { useHallwayStore } from '../hallway/useHallwayStore'
import { saveManager } from '../state/gameSaveManager'
import { useGameStore } from '../state/useGameStore'
import { useInventoryStore } from '../state/useInventoryStore'

export const FLASHLIGHT_ON = 'flashlightOn'
export const PASSAGE_DARK_LINE = 'passageDarkLine'

export function flashlightBeamOn() {
  return Boolean(useGameStore.getState().flags[FLASHLIGHT_ON])
}

export function lobbyCanSee() {
  return flashlightBeamOn()
}

export function toggleFlashlight() {
  const inv = useInventoryStore.getState()
  if (!inv.has(ITEM_IDS.flashlightLit)) return
  const game = useGameStore.getState()
  if (game.interactionState !== 'gameplay' && game.interactionState !== 'viewing-inventory') return
  const on = !game.flags[FLASHLIGHT_ON]
  useGameStore.setState({ flags: { ...game.flags, [FLASHLIGHT_ON]: on } })
  saveManager.save()
  playSfx(SFX.clickItem, 0.4)
}

export function combineFlashlight() {
  const inv = useInventoryStore.getState()
  if (!inv.has(ITEM_IDS.batteries) || !inv.has(ITEM_IDS.flashlight)) return false
  const items = inv.items.filter((id) => id !== ITEM_IDS.batteries && id !== ITEM_IDS.flashlight)
  items.push(ITEM_IDS.flashlightLit)
  useInventoryStore.setState({
    items,
    selectedId: ITEM_IDS.flashlightLit,
    pulseAt: Date.now(),
  })
  inv.closeInventory()
  saveManager.checkpoint('Item · Lanterna')
  useHallwayStore.getState().speak('Agora sim.')
  playSfx(SFX.clickItem, 0.48)
  return true
}

export function speakPassageDark() {
  const game = useGameStore.getState()
  if (game.flags[PASSAGE_DARK_LINE]) return
  game.addFlag(PASSAGE_DARK_LINE)
  saveManager.save()
  useHallwayStore.getState().speak('Nossa. Não consigo ver nada. Preciso da lanterna.', 3400)
}
