import { useInventoryStore } from '../state/useInventoryStore'

export function KeyGlyph({ className = 'inventory-item-icon' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <circle
        cx="8.2"
        cy="12"
        r="3.15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M11.2 12h9.1v2.15h-2.05V12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M16.35 12v2.15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export function InventoryGlyph({ className = 'inventory-dock-icon' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M7.2 8.2h9.6l.9 11.2H6.3L7.2 8.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9 8.2V6.6a3 3 0 0 1 6 0v1.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function InventoryDock() {
  const items = useInventoryStore((s) => s.items)
  const pulseAt = useInventoryStore((s) => s.pulseAt)
  const openInventory = useInventoryStore((s) => s.openInventory)

  return (
    <button
      key={pulseAt || 'idle'}
      className={pulseAt ? 'hud-icon inventory-dock is-pulse' : 'hud-icon inventory-dock'}
      type="button"
      onClick={openInventory}
      title="Inventário (I)"
    >
      <InventoryGlyph />
      {items.length > 0 ? <span className="inventory-count">{items.length}</span> : null}
    </button>
  )
}
