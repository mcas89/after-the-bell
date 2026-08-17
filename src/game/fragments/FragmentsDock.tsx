import { getClueDef, resolveClue, type ClueView } from '../data/clues'
import { useFragmentsStore } from '../state/useFragmentsStore'

export function FragmentGlyph({ className = 'fragments-dock-icon' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 3.2 19.4 12 12 20.8 4.6 12 12 3.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 3.2 9.4 12.4 12 20.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.7"
      />
      <path
        d="M9.4 12.4 H19.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        opacity="0.55"
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
      title="Fragmentos (J)"
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
