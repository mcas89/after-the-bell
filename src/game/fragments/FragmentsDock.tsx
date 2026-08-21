import { getClueDef, resolveClue, type ClueView } from '../data/clues'
import { useFragmentsStore } from '../state/useFragmentsStore'

export function FragmentGlyph({ className = 'fragments-dock-icon' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <rect
        x="6.4"
        y="3.7"
        width="11.2"
        height="16.6"
        rx="1.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M9.15 3.7v16.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M11.5 8.3h4.4M11.5 11.35h4.4M11.5 14.4h3.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function FragmentsDock() {
  const openJournal = useFragmentsStore((s) => s.openJournal)
  const pulseAt = useFragmentsStore((s) => s.pulseAt)
  const unread = useFragmentsStore(hasUnreadFrom)

  return (
    <button
      key={pulseAt || 'idle'}
      className={pulseAt ? 'hud-icon fragments-dock is-pulse' : 'hud-icon fragments-dock'}
      type="button"
      onClick={openJournal}
      title="Pistas (J)"
    >
      <FragmentGlyph />
      {unread ? <span className="fragments-unread" /> : null}
    </button>
  )
}

function hasUnreadFrom(state: { entries: Record<string, { discovered: boolean; read: boolean }> }) {
  return Object.values(state.entries).some((entry) => entry.discovered && !entry.read)
}

export function useDiscoveredViews(): ClueView[] {
  const entries = useFragmentsStore((s) => s.entries)
  const views: ClueView[] = []
  for (const [id, progress] of Object.entries(entries)) {
    const def = getClueDef(id)
    if (!def) continue
    const view = resolveClue(def, progress)
    if (view) views.push(view)
  }
  return views.sort((a, b) => a.discoveredAt - b.discoveredAt)
}
