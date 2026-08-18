import { isComputerOpen, useComputerStore, WEB_HISTORY, type ComputerApp } from './computerStore'

const APPS: Array<{ id: Exclude<ComputerApp, 'home'>; label: string; tone: string }> = [
  { id: 'docs', label: 'Meus documentos', tone: 'is-docs' },
  { id: 'work', label: 'Trabalhos', tone: 'is-work' },
  { id: 'notes', label: 'Bloco de notas', tone: 'is-notes' },
  { id: 'web', label: 'Internet', tone: 'is-web' },
  { id: 'trash', label: 'Lixeira', tone: 'is-trash' },
]

const WINDOWS: Record<Exclude<ComputerApp, 'home'>, string> = {
  docs: 'Meus documentos',
  work: 'Trabalhos',
  notes: 'Bloco de notas',
  web: 'Internet Explorer',
  trash: 'Lixeira',
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
      {id === 'trash' ? (
        <>
          <path d="M10 11h12l-1 15H11Z" fill="#7a848c" />
          <path d="M8 11h16M13 11V8h6v3" fill="none" stroke="#c8d0d4" strokeWidth="1.5" />
        </>
      ) : null}
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
      <p className="pc-login-name">Lívia</p>
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

function FolderBody({ text }: { text: string }) {
  return <p className="pc-empty">{text}</p>
}

function NotesBody() {
  return <div className="pc-notes" />
}

function HistoryList() {
  return (
    <ul className="pc-history">
      {WEB_HISTORY.map((row) => (
        <li key={row.time} className={row.query ? undefined : 'is-cut'}>
          <span className="pc-history-time">{row.time}</span>
          {row.query ? (
            <span className="pc-history-query">{row.query}</span>
          ) : (
            <span className="pc-history-query">
              <span className="pc-redact" aria-hidden />
              <span className="pc-history-miss">Resultado indisponível</span>
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

function WebBody() {
  const historyOpen = useComputerStore((s) => s.historyOpen)
  const toggleHistory = useComputerStore((s) => s.toggleHistory)

  return (
    <div className="pc-browser">
      <div className="pc-browser-tools">
        <span className="pc-browser-nav" aria-hidden>
          ←
        </span>
        <span className="pc-browser-nav" aria-hidden>
          →
        </span>
        <span className="pc-browser-address">http://</span>
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
          <p className="pc-offline">Sem conexão</p>
        </div>
      </div>
      <div className="pc-browser-status">Não é possível exibir a página.</div>
    </div>
  )
}

function WindowBody({ app }: { app: Exclude<ComputerApp, 'home'> }) {
  if (app === 'web') return <WebBody />
  if (app === 'notes') return <NotesBody />
  if (app === 'docs') return <FolderBody text="A pasta está vazia." />
  if (app === 'work') return <FolderBody text="Nenhum arquivo." />
  return <FolderBody text="A lixeira está vazia." />
}

function DesktopScreen() {
  const app = useComputerStore((s) => s.app)
  const openApp = useComputerStore((s) => s.openApp)
  const goHome = useComputerStore((s) => s.goHome)
  const title = app !== 'home' ? WINDOWS[app] : null

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
        <div className={app === 'web' ? 'pc-window is-browser' : 'pc-window'}>
          <div className="pc-window-bar">
            <span>{title}</span>
            <button className="pc-window-close" type="button" onClick={goHome} aria-label="Fechar">
              ×
            </button>
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

  if (!open && !line) return null

  return (
    <>
      {open ? <div className="pc-dim" onClick={close} /> : null}
      {open ? (
        <div className="pc-stage" onClick={close}>
          <div className="pc-bezel" onClick={(event) => event.stopPropagation()}>
            <div className="pc-screen">{ui === 'desktop' ? <DesktopScreen /> : <LoginScreen />}</div>
          </div>
        </div>
      ) : null}
      {line ? <p className="pc-line">{line}</p> : null}
    </>
  )
}
