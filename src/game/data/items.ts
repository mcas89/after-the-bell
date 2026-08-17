export type ItemDef = {
  id: string
  title: string
  description: string
}

export const ITEM_IDS = {
  key: 'item-key',
  officeKey: 'item-key-diretoria',
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
}

export function isKeyItem(id: string) {
  return id === ITEM_IDS.key || id === ITEM_IDS.officeKey
}

export function getItemDef(id: string) {
  return ITEMS[id] ?? null
}
