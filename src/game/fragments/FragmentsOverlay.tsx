import { useFragmentsStore } from '../state/useFragmentsStore'
import { useDiscoveredViews } from './FragmentsDock'

export function FragmentsOverlay() {
  const open = useFragmentsStore((s) => s.open)
  const selectedId = useFragmentsStore((s) => s.selectedId)
  const select = useFragmentsStore((s) => s.select)
  const closeJournal = useFragmentsStore((s) => s.closeJournal)
  const views = useDiscoveredViews()
  const selected = views.find((item) => item.id === selectedId) ?? null

  if (!open) return null

  return (
    <>
      <div className="fragments-dim" onClick={closeJournal} />
      <div className="fragments-stage" onClick={closeJournal}>
        <section className="fragments-panel" onClick={(event) => event.stopPropagation()}>
          <header className="fragments-head">
            <p>Fragmentos</p>
            <button className="fragments-close" type="button" onClick={closeJournal}>
              Esc
            </button>
          </header>
          {views.length === 0 ? (
            <p className="fragments-empty">Ainda não há nada aqui.</p>
          ) : (
            <div className="fragments-body">
              <ul className="fragments-list">
                {views.map((item) => (
                  <li key={item.id}>
                    <button
                      className={
                        item.id === selectedId
                          ? 'fragments-item is-selected'
                          : item.read
                            ? 'fragments-item'
                            : 'fragments-item is-unread'
                      }
                      type="button"
                      onClick={() => select(item.id)}
                    >
                      <strong>{item.title}</strong>
                      {!item.read ? <span className="fragments-item-dot" /> : null}
                    </button>
                  </li>
                ))}
              </ul>
              <article className="fragments-detail">
                {selected ? (
                  <>
                    <h2>{selected.title}</h2>
                    <p>{selected.description}</p>
                  </>
                ) : (
                  <p className="fragments-hint">Escolha um fragmento para ler.</p>
                )}
              </article>
            </div>
          )}
        </section>
      </div>
    </>
  )
}

export function FragmentToast() {
  const toast = useFragmentsStore((s) => s.toast)
  if (!toast) return null
  return (
    <aside className="fragment-toast">
      <span>Fragmento registrado</span>
      <strong>{toast.title}</strong>
    </aside>
  )
}
