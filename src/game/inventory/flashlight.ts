import { playSfx, SFX } from '../audio/mixer'
import { ITEM_IDS } from '../data/items'
import { useHallwayStore } from '../hallway/useHallwayStore'
import { saveManager } from '../state/gameSaveManager'
import { useGameStore } from '../state/useGameStore'
import { useInventoryStore } from '../state/useInventoryStore'

export const FLASHLIGHT_ON = 'flashlightOn'
export const LOBBY_LIGHTS = 'lobbyLights'
export const PASSAGE_DARK_LINE = 'passageDarkLine'

export function lobbyLightsOn() {
  return Boolean(useGameStore.getState().flags[LOBBY_LIGHTS])
}

export function flashlightBeamOn() {
  return Boolean(useGameStore.getState().flags[FLASHLIGHT_ON])
}

export function lobbyCanSee() {
  return lobbyLightsOn() || flashlightBeamOn()
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
    toast: { title: 'Lanterna' },
    pulseAt: Date.now(),
  })
  inv.closeInventory()
  saveManager.save()
  useHallwayStore.getState().speak('Agora sim.')
  playSfx(SFX.clickItem, 0.48)
  return true
}

export function tryFlipLobbySwitch(want?: boolean) {
  const game = useGameStore.getState()
  const hall = useHallwayStore.getState()
  const on = want ?? !game.flags[LOBBY_LIGHTS]
  if (Boolean(game.flags[LOBBY_LIGHTS]) === on) {
    hall.speak(on ? 'Já está ligado.' : 'Já está apagado.')
    return true
  }
  useGameStore.setState({ flags: { ...game.flags, [LOBBY_LIGHTS]: on } })
  saveManager.save()
  hall.speak(on ? 'A luz voltou.' : 'Apagou.')
  playSfx(SFX.clickItem, 0.52)
  return true
}

export function speakPassageDark() {
  const game = useGameStore.getState()
  if (game.flags[PASSAGE_DARK_LINE] || game.flags[LOBBY_LIGHTS]) return
  game.addFlag(PASSAGE_DARK_LINE)
  saveManager.save()
  useHallwayStore.getState().speak('Nossa. Não consigo ver nada. Preciso ligar alguma luz.', 3400)
}
