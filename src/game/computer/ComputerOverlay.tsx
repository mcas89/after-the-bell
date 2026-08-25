import { useFitScale } from '../ui/useFitScale'
import {
  isComputerOpen,
  useComputerStore,
  WEB_HISTORY,
  type ComputerApp,
} from './computerStore'
import { pcCanGoBack, pcChildren, pcNode, WEB_PAGES, type PcNode } from './computerContent'

const APPS: Array<{ id: Exclude<ComputerApp, 'home'>; label: string; tone: string }> = [
  { id: 'docs', label: 'Meus documentos', tone: 'is-docs' },
  { id: 'work', label: 'Trabalhos', tone: 'is-work' },
  { id: 'photos', label: 'Fotos', tone: 'is-photos' },
  { id: 'downloads', label: 'Downloads', tone: 'is-down' },
  { id: 'notes', label: 'Bloco de notas', tone: 'is-notes' },
  { id: 'web', label: 'Internet', tone: 'is-web' },
  { id: 'clock', label: 'Relógio', tone: 'is-clock' },
  { id: 'trash', label: 'Lixeira', tone: 'is-trash' },
  { id: 'computer', label: 'Meu Computador', tone: 'is-pc' },
]

const WINDOWS: Record<Exclude<ComputerApp, 'home'>, string> = {
  docs: 'Meus documentos',
  work: 'Trabalhos',
  photos: 'Fotos',
  downloads: 'Downloads',
  notes: 'Bloco de notas',
  web: 'Internet Explorer',
  clock: 'Relógio',
  trash: 'Lixeira',
  computer: 'Meu Computador',
}

function AppGlyph({ id }: { id: Exclude<ComputerApp, 'home'> }) {
  return (
    <svg className="pc-icon-glyph" viewBox="0 0 32 32" aria-hidden>
      {id === 'docs' ? (
        <>
          <path d="M7 6h11l5 5v15H7Z" fill="#d8c48a" />
          <path d="M18 6v5h5" fill="#c4b078" />
        </>
      ) : null}
      {id === 'work' ? (
        <>
          <path d="M6 10h20v16H6Z" fill="#8a9cb0" />
          <path d="M11 10V8h10v2" fill="none" stroke="#d8e0e8" strokeWidth="1.6" />
        </>
      ) : null}
      {id === 'photos' ? (
        <>
          <rect x="6" y="9" width="20" height="14" rx="1.5" fill="#c4b080" />
          <path d="M8 20 13 14l4 4 3-2.5 4 4.5" fill="none" stroke="#5a4030" strokeWidth="1.4" />
          <circle cx="11" cy="13" r="1.4" fill="#5a4030" />
        </>
      ) : null}
      {id === 'downloads' ? (
        <>
          <path d="M8 22h16v4H8Z" fill="#4a8a62" />
          <path d="M16 6v12" stroke="#d8ece0" strokeWidth="2.2" />
          <path d="M11 14l5 6 5-6" fill="none" stroke="#d8ece0" strokeWidth="2.2" />
        </>
      ) : null}
      {id === 'notes' ? (
        <>
          <path d="M8 5h16v22H8Z" fill="#f2efe4" />
          <path d="M11 11h10M11 16h10M11 21h7" stroke="#5a5048" strokeWidth="1.4" />
        </>
      ) : null}
      {id === 'web' ? (
        <>
          <circle cx="16" cy="16" r="10" fill="#3a6a9a" />
          <path d="M6 16h20M16 6c3.2 3.4 3.2 16.6 0 20M16 6c-3.2 3.4-3.2 16.6 0 20" fill="none" stroke="#c8dcec" strokeWidth="1.3" />
        </>
      ) : null}
      {id === 'clock' ? (
        <>
          <circle cx="16" cy="16" r="10" fill="#1c2428" stroke="#c8d0d4" strokeWidth="1.4" />
          <path d="M16 9v8l5 3" fill="none" stroke="#e8ece8" strokeWidth="1.6" />
        </>
      ) : null}
      {id === 'trash' ? (
        <>
          <path d="M10 11h12l-1 15H11Z" fill="#7a848c" />
          <path d="M8 11h16M13 11V8h6v3" fill="none" stroke="#c8d0d4" strokeWidth="1.5" />
        </>
      ) : null}
      {id === 'computer' ? (
        <>
          <rect x="6" y="7" width="20" height="14" rx="1.4" fill="#6a7a84" />
          <rect x="8" y="9" width="16" height="10" fill="#1a2830" />
          <path d="M12 23h8v2h-8Z" fill="#8a949c" />
        </>
      ) : null}
    </svg>
  )
}

function FileGlyph({ kind }: { kind: PcNode['kind'] }) {
  if (kind === 'folder' || kind === 'empty') {
    return (
      <svg className="pc-file-glyph" viewBox="0 0 20 16" aria-hidden>
        <path d="M1 3h6l2 2h10v10H1Z" fill="#d4b45a" />
        <path d="M1 6h18v9H1Z" fill="#e8cc6a" />
      </svg>
    )
  }
  if (kind === 'photo') {
    return (
      <svg className="pc-file-glyph" viewBox="0 0 20 16" aria-hidden>
        <rect x="1" y="1" width="18" height="14" fill="#c4b080" />
        <path d="M3 12 7 7l3 3 2-2 4 4" fill="none" stroke="#5a4030" strokeWidth="1.2" />
      </svg>
    )
  }
  if (kind === 'broken') {
    return (
      <svg className="pc-file-glyph" viewBox="0 0 20 16" aria-hidden>
        <rect x="1" y="1" width="18" height="14" fill="#6a6864" />
        <path d="M4 4 16 12M16 4 4 12" stroke="#2a2824" strokeWidth="1.6" />
      </svg>
    )
  }
  return (
    <svg className="pc-file-glyph" viewBox="0 0 20 16" aria-hidden>
      <path d="M4 1h8l5 5v9H4Z" fill="#e8e4d8" />
      <path d="M12 1v5h5" fill="#d4d0c4" />
    </svg>
  )
}

function LoginScreen() {
  const pin = useComputerStore((s) => s.pin)
  const shakeAt = useComputerStore((s) => s.shakeAt)
  const inputDigit = useComputerStore((s) => s.inputDigit)
  const deleteDigit = useComputerStore((s) => s.deleteDigit)
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

  return (
    <div key={shakeAt} className={shakeAt ? 'pc-login is-shake' : 'pc-login'}>
      <p className="pc-login-kicker">Sessão iniciada</p>
      <div className="pc-login-user" aria-hidden />
      <p className="pc-login-name">Lívia Ferreira</p>
      <p className="pc-login-label">Senha</p>
      <div className="pc-login-slots" aria-label="Senha de 4 dígitos">
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className={i < pin.length ? 'pc-login-slot is-on' : 'pc-login-slot'}>
            {i < pin.length ? '•' : '_'}
          </span>
        ))}
      </div>
      <div className="pc-pad">
        {keys.map((key) => (
          <button key={key} className="pc-key" type="button" onClick={() => inputDigit(key)}>
            {key}
          </button>
        ))}
        <span className="pc-key is-ghost" />
        <button className="pc-key" type="button" onClick={() => inputDigit('0')}>
          0
        </button>
        <button className="pc-key is-ghost" type="button" onClick={deleteDigit}>
          Apagar
        </button>
      </div>
    </div>
  )
}

function FileList({ node }: { node: PcNode }) {
  const openNode = useComputerStore((s) => s.openNode)
  const rows = pcChildren(node.id)
  return (
    <ul className="pc-files">
      {rows.map((row) => (
        <li key={row.id}>
          <button className="pc-file" type="button" onClick={() => openNode(row.id)}>
            <FileGlyph kind={row.kind} />
            <span className="pc-file-name">{row.name}</span>
            <span className="pc-file-date">{row.date ?? ''}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

function DocView({ node }: { node: PcNode }) {
  return (
    <article className="pc-doc">
      {node.body?.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </article>
  )
}

function PhotoView({ node }: { node: PcNode }) {
  if (!node.image) return null
  return (
    <div className="pc-photo">
      <img src={node.image} alt="" />
    </div>
  )
}

function MapView() {
  return (
    <div className="pc-map" aria-label="Mapa de emergência">
      <p className="pc-map-title">Bloco B — emergência</p>
      <div className="pc-map-grid">
        <span className="is-hall">corredor</span>
        <span className="is-stair">escadas</span>
        <span className="is-exit">saída</span>
        <span className="is-floor">2º andar</span>
      </div>
    </div>
  )
}

function EmptyFolder({ node }: { node: PcNode }) {
  return (
    <div className="pc-empty-folder">
      <p className="pc-empty">Esta pasta está vazia.</p>
      {node.itemsLabel ? <p className="pc-props">{node.itemsLabel}</p> : null}
    </div>
  )
}

function BrokenFile() {
  return (
    <div className="pc-broken">
      <span className="pc-broken-icon" aria-hidden />
      <p>Arquivo danificado.</p>
    </div>
  )
}

function ExplorerBody({ node }: { node: PcNode }) {
  if (node.kind === 'folder') return <FileList node={node} />
  if (node.kind === 'empty') return <EmptyFolder node={node} />
  if (node.kind === 'doc') return <DocView node={node} />
  if (node.kind === 'photo') return <PhotoView node={node} />
  if (node.kind === 'sheet') return <MapView />
  return <BrokenFile />
}

function NotesBody() {
  const notesProps = useComputerStore((s) => s.notesProps)
  const showNotesProps = useComputerStore((s) => s.showNotesProps)
  return (
    <div className="pc-notes-app">
      <div className="pc-notes" />
      <div className="pc-notes-bar">
        <span>Última modificação: 03:09</span>
        <button className="pc-prop-btn" type="button" onClick={showNotesProps}>
          Propriedades
        </button>
      </div>
      {notesProps ? (
        <p className="pc-props">Modificado em 18/06 03:09 · 0 KB · nenhum texto</p>
      ) : null}
    </div>
  )
}

function ClockBody() {
  return (
    <div className="pc-clock-app">
      <p className="pc-clock-time">03:17:00</p>
      <p className="pc-clock-date">18 de junho</p>
    </div>
  )
}

function ComputerBody() {
  return (
    <dl className="pc-sys">
      <div>
        <dt>Nome do PC</dt>
        <dd>LAB-PC-05</dd>
      </div>
      <div>
        <dt>Usuário</dt>
        <dd>Lívia Ferreira</dd>
      </div>
      <div>
        <dt>Data</dt>
        <dd>18/06</dd>
      </div>
      <div>
        <dt>Hora</dt>
        <dd>03:17</dd>
      </div>
      <div>
        <dt>Última inicialização</dt>
        <dd>01:47</dd>
      </div>
      <div>
        <dt>Último login</dt>
        <dd>01:47 — Lívia Ferreira</dd>
      </div>
    </dl>
  )
}

function HistoryList() {
  const historyPage = useComputerStore((s) => s.historyPage)
  const selectHistory = useComputerStore((s) => s.selectHistory)
  return (
    <ul className="pc-history">
      {WEB_HISTORY.map((row) => (
        <li key={row.time} className={row.query ? undefined : 'is-cut'}>
          <button
            className={historyPage === row.time ? 'pc-history-row is-on' : 'pc-history-row'}
            type="button"
            onClick={() => selectHistory(row.time)}
          >
            <span className="pc-history-time">{row.time}</span>
            {row.query ? (
              <span className="pc-history-query">{row.query}</span>
            ) : (
              <span className="pc-history-query">
                <span className="pc-redact" aria-hidden />
                <span className="pc-history-miss">Resultado indisponível</span>
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  )
}

function WebPage() {
  const historyPage = useComputerStore((s) => s.historyPage)
  const redactHits = useComputerStore((s) => s.redactHits)
  if (!historyPage) return <p className="pc-offline">Sem conexão</p>
  const page = WEB_PAGES[historyPage]
  if (!page) {
    return (
      <div className="pc-cached">
        <p className="pc-offline">{redactHits >= 2 ? 'Não foi possível recuperar esta página.' : 'Resultado indisponível'}</p>
      </div>
    )
  }
  return (
    <article className="pc-cached">
      <p className="pc-cached-kicker">Sem conexão — cópia armazenada</p>
      <h2>{page.title}</h2>
      {page.body.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </article>
  )
}

function WebBody() {
  const historyOpen = useComputerStore((s) => s.historyOpen)
  const historyPage = useComputerStore((s) => s.historyPage)
  const toggleHistory = useComputerStore((s) => s.toggleHistory)
  const page = historyPage ? WEB_PAGES[historyPage] : null

  return (
    <div className="pc-browser">
      <div className="pc-browser-tools">
        <span className="pc-browser-nav" aria-hidden>
          ←
        </span>
        <span className="pc-browser-nav" aria-hidden>
          →
        </span>
        <span className="pc-browser-address">{page?.url ?? 'http://'}</span>
        <button
          className={historyOpen ? 'pc-history-btn is-on' : 'pc-history-btn'}
          type="button"
          onClick={toggleHistory}
        >
          Histórico
        </button>
      </div>
      <div className={historyOpen ? 'pc-browser-main has-history' : 'pc-browser-main'}>
        {historyOpen ? (
          <aside className="pc-history-pane">
            <p className="pc-web-label">Hoje</p>
            <HistoryList />
          </aside>
        ) : null}
        <div className="pc-browser-page">
          <WebPage />
        </div>
      </div>
      <div className="pc-browser-status">Não é possível exibir a página.</div>
    </div>
  )
}

function WindowBody({ app }: { app: Exclude<ComputerApp, 'home'> }) {
  const nodeId = useComputerStore((s) => s.nodeId)
  const node = pcNode(nodeId)
  if (app === 'web') return <WebBody />
  if (app === 'notes') return <NotesBody />
  if (app === 'clock') return <ClockBody />
  if (app === 'computer') return <ComputerBody />
  if (node) return <ExplorerBody node={node} />
  return <p className="pc-empty">A pasta está vazia.</p>
}

function windowTitle(app: Exclude<ComputerApp, 'home'>, nodeId: string | null) {
  const node = pcNode(nodeId)
  if (node && node.parent) return node.name
  return WINDOWS[app]
}

function DesktopScreen() {
  const app = useComputerStore((s) => s.app)
  const nodeId = useComputerStore((s) => s.nodeId)
  const openApp = useComputerStore((s) => s.openApp)
  const goHome = useComputerStore((s) => s.goHome)
  const goBack = useComputerStore((s) => s.goBack)
  const notesProps = useComputerStore((s) => s.notesProps)
  const historyPage = useComputerStore((s) => s.historyPage)
  const title = app !== 'home' ? windowTitle(app, nodeId) : null
  const canBack = Boolean(
    app !== 'home' && (pcCanGoBack(nodeId) || notesProps || historyPage),
  )

  return (
    <div className="pc-desktop">
      <div className="pc-icons">
        {APPS.map((item) => (
          <button key={item.id} className="pc-icon" type="button" onClick={() => openApp(item.id)}>
            <span className={`pc-icon-tile ${item.tone}`}>
              <AppGlyph id={item.id} />
            </span>
            <span className="pc-icon-label">{item.label}</span>
          </button>
        ))}
      </div>
      {title && app !== 'home' ? (
        <div className={app === 'web' ? 'pc-window is-browser' : 'pc-window is-explorer'}>
          <div className="pc-window-bar">
            <span>{title}</span>
            <span className="pc-window-actions">
              {canBack ? (
                <button className="pc-window-back" type="button" onClick={() => goBack()} aria-label="Voltar">
                  ←
                </button>
              ) : null}
              <button className="pc-window-close" type="button" onClick={goHome} aria-label="Fechar">
                ×
              </button>
            </span>
          </div>
          <div className={app === 'web' ? 'pc-window-body is-flush' : 'pc-window-body'}>
            <WindowBody app={app} />
          </div>
        </div>
      ) : null}
      <div className="pc-taskbar">
        <span className="pc-start">Iniciar</span>
        <span className="pc-clock">03:17</span>
      </div>
    </div>
  )
}

export function ComputerOverlay() {
  const ui = useComputerStore((s) => s.ui)
  const line = useComputerStore((s) => s.line)
  const close = useComputerStore((s) => s.close)
  const open = isComputerOpen(ui)
  const { stageRef, scale } = useFitScale(open, 46, 32)

  if (!open && !line) return null

  return (
    <>
      {open ? <div className="pc-dim" onClick={close} /> : null}
      {open ? (
        <div className="pc-stage" ref={stageRef} onClick={close}>
          <div
            className="pc-bezel"
            style={{ zoom: scale }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pc-screen">{ui === 'desktop' ? <DesktopScreen /> : <LoginScreen />}</div>
          </div>
        </div>
      ) : null}
      {line ? <p className="pc-line">{line}</p> : null}
    </>
  )
}
