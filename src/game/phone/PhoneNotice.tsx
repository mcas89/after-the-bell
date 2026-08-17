import { isPhoneOpen, usePhoneStore } from './phoneStore'

export function PhoneGlyph({ className = 'phone-notice-icon' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <rect
        x="7"
        y="2.5"
        width="10"
        height="19"
        rx="2.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="18.2" r="0.85" fill="currentColor" />
    </svg>
  )
}

export function PhoneDock() {
  const ui = usePhoneStore((s) => s.ui)
  const armed = usePhoneStore((s) => s.armed)
  const open = usePhoneStore((s) => s.open)

  if (!armed || isPhoneOpen(ui)) return null

  return (
    <button
      className={ui === 'notification' ? 'hud-icon phone-dock is-pulse' : 'hud-icon phone-dock'}
      type="button"
      onClick={open}
      title="Abrir celular"
    >
      <PhoneGlyph className="phone-dock-icon" />
    </button>
  )
}

export function PhoneNotice() {
  const ui = usePhoneStore((s) => s.ui)
  const open = usePhoneStore((s) => s.open)

  if (ui !== 'notification') return null

  return (
    <button className="phone-notice" type="button" onClick={open}>
      <PhoneGlyph />
      <span className="phone-notice-copy">
        <span className="phone-notice-title">Celular vibrando</span>
        <span className="phone-notice-action">Clique para ver</span>
      </span>
    </button>
  )
}
