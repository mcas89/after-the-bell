import { ITEM_IDS } from '../data/items'
import { FLASHLIGHT_ON, toggleFlashlight } from './flashlight'
import { useGameStore } from '../state/useGameStore'
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

export function FlashlightGlyph({ className = 'inventory-item-icon', lit = false }: { className?: string; lit?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <rect x="3.4" y="9.2" width="10.2" height="5.6" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13.6 8.6h3.2L19.6 12l-2.8 3.4H13.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      {lit ? (
        <path d="M20.2 12h2.4M20 9.4l1.7-1.1M20 14.6l1.7 1.1" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      ) : (
        <path d="M5.4 10.4v3.2M7.6 10.4v3.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
      )}
    </svg>
  )
}

export function BatteryGlyph({ className = 'inventory-item-icon' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <rect x="3.2" y="8.4" width="7.2" height="3.4" rx="0.7" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="13.4" y="12.2" width="7.2" height="3.4" rx="0.7" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.4 10.1h1.1M20.6 13.9h1.1" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
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

export function FlashlightDock() {
  const has = useInventoryStore((s) => s.has(ITEM_IDS.flashlightLit))
  const on = useGameStore((s) => Boolean(s.flags[FLASHLIGHT_ON]))
  if (!has) return null

  return (
    <button
      className={on ? 'hud-icon flashlight-dock is-on' : 'hud-icon flashlight-dock'}
      type="button"
      onClick={toggleFlashlight}
      title="Lanterna (L)"
    >
      <FlashlightGlyph lit={on} />
    </button>
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
