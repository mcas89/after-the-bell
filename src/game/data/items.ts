export type ItemDef = {
  id: string
  title: string
  description: string
}

export const ITEM_IDS = {
  key: 'item-key',
  officeKey: 'item-key-diretoria',
  janitorKey: 'item-key-zeladoria',
  bibKey: 'item-key-bib',
  dirKey: 'item-key-dir',
  batteries: 'item-batteries',
  flashlight: 'item-flashlight',
  flashlightLit: 'item-flashlight-lit',
} as const

export const ITEMS: Record<string, ItemDef> = {
  [ITEM_IDS.key]: {
    id: ITEM_IDS.key,
    title: 'Chave da sala dos professores',
    description: 'Leve, um pouco gasta. Cabe na palma da mão.',
  },
  [ITEM_IDS.officeKey]: {
    id: ITEM_IDS.officeKey,
    title: 'Chave da sala de artes',
    description: 'Pesada e fria ao toque.',
  },
  [ITEM_IDS.janitorKey]: {
    id: ITEM_IDS.janitorKey,
    title: 'Chave da zeladoria',
    description: 'Um pouco maior. Fria.',
  },
  [ITEM_IDS.bibKey]: {
    id: ITEM_IDS.bibKey,
    title: 'Chave da biblioteca',
    description: 'Média. Um pouco fria.',
  },
  [ITEM_IDS.dirKey]: {
    id: ITEM_IDS.dirKey,
    title: 'Chave da diretoria',
    description: 'Mais pesada. Fria.',
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
  return (
    id === ITEM_IDS.key ||
    id === ITEM_IDS.officeKey ||
    id === ITEM_IDS.janitorKey ||
    id === ITEM_IDS.bibKey ||
    id === ITEM_IDS.dirKey
  )
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
