import { canCombineFlashlight, getItemDef, isKeyItem, ITEM_IDS } from '../data/items'
import { useInventoryStore } from '../state/useInventoryStore'
import { BatteryGlyph, FlashlightGlyph, KeyGlyph } from './InventoryDock'
import { combineFlashlight } from './flashlight'

function ItemGlyph({ id, className }: { id: string; className?: string }) {
  if (isKeyItem(id)) return <KeyGlyph className={className} />
  if (id === ITEM_IDS.batteries) return <BatteryGlyph className={className} />
  if (id === ITEM_IDS.flashlight) return <FlashlightGlyph className={className} />
  if (id === ITEM_IDS.flashlightLit) return <FlashlightGlyph className={className} lit />
  return null
}

export function InventoryOverlay() {
  const open = useInventoryStore((s) => s.open)
  const items = useInventoryStore((s) => s.items)
  const selectedId = useInventoryStore((s) => s.selectedId)
  const select = useInventoryStore((s) => s.select)
  const closeInventory = useInventoryStore((s) => s.closeInventory)
  const selected = selectedId ? getItemDef(selectedId) : null
  const canJoin = canCombineFlashlight(items)

  if (!open) return null

  return (
    <>
      <div className="inventory-dim" onClick={closeInventory} />
      <div className="inventory-stage" onClick={closeInventory}>
        <section className="inventory-panel" onClick={(event) => event.stopPropagation()}>
          <header className="inventory-head">
            <p>Inventário</p>
            <button className="inventory-close" type="button" onClick={closeInventory}>
              Esc
            </button>
          </header>
          {items.length === 0 ? (
            <p className="inventory-empty">Nada aqui.</p>
          ) : (
            <div className="inventory-body">
              <ul className="inventory-list">
                {items.map((id) => {
                  const item = getItemDef(id)
                  if (!item) return null
                  return (
                    <li key={id}>
                      <button
                        className={id === selectedId ? 'inventory-item is-selected' : 'inventory-item'}
                        type="button"
                        onClick={() => select(id)}
                      >
                        <ItemGlyph id={item.id} />
                        <strong>{item.title}</strong>
                      </button>
                    </li>
                  )
                })}
              </ul>
              <article className="inventory-detail">
                {selected ? (
                  <>
                    <ItemGlyph id={selected.id} className="inventory-detail-icon" />
                    <h2>{selected.title}</h2>
                    <p>{selected.description}</p>
                    {canJoin &&
                    (selected.id === ITEM_IDS.batteries || selected.id === ITEM_IDS.flashlight) ? (
                      <button className="inventory-join" type="button" onClick={combineFlashlight}>
                        Juntar
                      </button>
                    ) : null}
                  </>
                ) : (
                  <p className="inventory-hint">Escolha um objeto.</p>
                )}
              </article>
            </div>
          )}
        </section>
      </div>
    </>
  )
}

export function InventoryToast() {
  const toast = useInventoryStore((s) => s.toast)
  if (!toast) return null
  return (
    <aside className="inventory-toast">
      <span>Item guardado</span>
      <strong>{toast.title}</strong>
    </aside>
  )
}
