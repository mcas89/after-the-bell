export type ItemDef = {
  id: string
  title: string
  description: string
}

export const ITEM_IDS = {
  key: 'item-key',
  officeKey: 'item-key-diretoria',
  janitorKey: 'item-key-zeladoria',
  batteries: 'item-batteries',
  flashlight: 'item-flashlight',
  flashlightLit: 'item-flashlight-lit',
} as const

export const ITEMS: Record<string, ItemDef> = {
  [ITEM_IDS.key]: {
    id: ITEM_IDS.key,
    title: 'Chave pequena',
    description: 'Leve, um pouco gasta. Cabe na palma da mão.',
  },
  [ITEM_IDS.officeKey]: {
    id: ITEM_IDS.officeKey,
    title: 'Chave grande',
    description: 'Pesada e fria ao toque.',
  },
  [ITEM_IDS.janitorKey]: {
    id: ITEM_IDS.janitorKey,
    title: 'Chave gasta',
    description: 'Um pouco maior. Fria.',
  },
  [ITEM_IDS.batteries]: {
    id: ITEM_IDS.batteries,
    title: 'Duas pilhas',
    description: 'Pequenas. Ainda têm carga.',
  },
  [ITEM_IDS.flashlight]: {
    id: ITEM_IDS.flashlight,
    title: 'Lanterna',
    description: 'Pesada. Morta.',
  },
  [ITEM_IDS.flashlightLit]: {
    id: ITEM_IDS.flashlightLit,
    title: 'Lanterna',
    description: 'Pesada. Agora acende.',
  },
}

export function isKeyItem(id: string) {
  return id === ITEM_IDS.key || id === ITEM_IDS.officeKey || id === ITEM_IDS.janitorKey
}

export function getItemDef(id: string) {
  return ITEMS[id] ?? null
}

export function hasWorkingFlashlight(items: string[]) {
  return items.includes(ITEM_IDS.flashlightLit)
}

export function canCombineFlashlight(items: string[]) {
  return items.includes(ITEM_IDS.batteries) && items.includes(ITEM_IDS.flashlight)
}
