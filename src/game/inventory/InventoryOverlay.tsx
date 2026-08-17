import { getItemDef, isKeyItem } from '../data/items'
import { useInventoryStore } from '../state/useInventoryStore'
import { KeyGlyph } from './InventoryDock'

export function InventoryOverlay() {
  const open = useInventoryStore((s) => s.open)
  const items = useInventoryStore((s) => s.items)
  const selectedId = useInventoryStore((s) => s.selectedId)
  const select = useInventoryStore((s) => s.select)
  const closeInventory = useInventoryStore((s) => s.closeInventory)
  const selected = selectedId ? getItemDef(selectedId) : null

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
                        {isKeyItem(item.id) ? <KeyGlyph /> : null}
                        <strong>{item.title}</strong>
                      </button>
                    </li>
                  )
                })}
              </ul>
              <article className="inventory-detail">
                {selected ? (
                  <>
                    {isKeyItem(selected.id) ? (
                      <KeyGlyph className="inventory-detail-icon" />
                    ) : null}
                    <h2>{selected.title}</h2>
                    <p>{selected.description}</p>
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
