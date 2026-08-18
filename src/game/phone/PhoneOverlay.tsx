import { isPhoneOpen, usePhoneStore } from './phoneStore'

const THREADS = [
  {
    from: 'Keyla',
    time: '00:28',
    body: 'livia fala pra minha filha atender esse telefone',
  },
  {
    from: 'Mãe',
    time: '21:45',
    body: 'boa noite filha, se comporte na casa da sua amiga',
  },
  {
    from: 'Maya',
    time: '20:22',
    body: 'vcs são lokas eu nao tenho coragem essa escola é estranha a noite !!!',
  },
  {
    from: 'Professora Lia',
    time: '19:31',
    body: 'não vi vcs saindo da escola hoje esta td bem ?',
  },
] as const

const APPS = [
  { id: 'messages', label: 'Mensagens', tone: 'is-messages', badge: 4 },
  { id: 'phone', label: 'Telefone', tone: 'is-phone' },
  { id: 'photos', label: 'Fotos', tone: 'is-photos' },
  { id: 'camera', label: 'Câmera', tone: 'is-camera' },
  { id: 'clock', label: 'Relógio', tone: 'is-clock' },
  { id: 'maps', label: 'Mapas', tone: 'is-maps' },
] as const

function AppGlyph({ id }: { id: (typeof APPS)[number]['id'] }) {
  const dark = id === 'clock'
  return (
    <svg className={dark ? 'phone-app-glyph is-dark' : 'phone-app-glyph'} viewBox="0 0 24 24" aria-hidden>
      {id === 'messages' ? (
        <path
          d="M5 6.5h14a1.5 1.5 0 0 1 1.5 1.5v7.2a1.5 1.5 0 0 1-1.5 1.5H10l-3.8 2.4V16.2H5A1.5 1.5 0 0 1 3.5 14.7V8A1.5 1.5 0 0 1 5 6.5Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      ) : null}
      {id === 'phone' ? (
        <path
          d="M7.2 3.8h2.6l1.1 3.2-1.6 1.1a12 12 0 0 0 5.6 5.6l1.1-1.6 3.2 1.1v2.6c0 .7-.6 1.4-1.4 1.5-7.2.8-13.2-5.2-12.4-12.4.1-.8.8-1.4 1.8-1.5Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      ) : null}
      {id === 'photos' ? (
        <>
          <rect x="4.2" y="7.2" width="13.2" height="10.4" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="M6.4 15.4 9.4 12l2.6 2.4 1.8-1.6 3.2 2.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="8.2" cy="10.2" r="1" fill="currentColor" />
          <path d="M8.6 5.4h9.6v9.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </>
      ) : null}
      {id === 'camera' ? (
        <>
          <rect x="3.6" y="7.4" width="16.8" height="11.2" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="12" cy="13" r="3.1" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="M8.4 7.4 9.6 5.4h4.8l1.2 2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </>
      ) : null}
      {id === 'clock' ? (
        <>
          <circle cx="12" cy="12" r="7.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="M12 8.2V12l3.1 2.1" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </>
      ) : null}
      {id === 'maps' ? (
        <>
          <path
            d="M12 20s5.4-5.1 5.4-9.2A5.4 5.4 0 0 0 12 5.4 5.4 5.4 0 0 0 6.6 10.8C6.6 14.9 12 20 12 20Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="10.8" r="1.7" fill="currentColor" />
        </>
      ) : null}
    </svg>
  )
}

function HomeGlyph() {
  return (
    <svg className="phone-home-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M4.5 11.2 12 4.6l7.5 6.6V19a1.4 1.4 0 0 1-1.4 1.4H5.9A1.4 1.4 0 0 1 4.5 19Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M10 20.2v-6h4v6" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function LockGlyph() {
  return (
    <svg className="phone-lock-icon" viewBox="0 0 24 24" aria-hidden>
      <rect
        x="5"
        y="11"
        width="14"
        height="10"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 11V8.2a4 4 0 0 1 8 0V11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  )
}

function LockedScreen() {
  const goPin = usePhoneStore((s) => s.goPin)
  const hasMessages = usePhoneStore((s) => s.triggered)

  return (
    <div className="phone-lock is-home">
      <LockGlyph />
      <p className="phone-time">03:17</p>
      <p className="phone-service">Sem serviço</p>
      {hasMessages ? (
        <button className="phone-note" type="button" onClick={goPin}>
          <span className="phone-note-top">
            <span className="phone-note-app">
              <span className="phone-note-bubble" aria-hidden />
              Mensagens
            </span>
            <span className="phone-note-when">agora</span>
          </span>
          <span className="phone-note-title">4 mensagens</span>
          <span className="phone-note-body">
            <LockGlyph />
            Desbloqueie para ver
          </span>
        </button>
      ) : null}
      <button className="phone-cta" type="button" onClick={goPin}>
        Inserir código
      </button>
    </div>
  )
}

function PinScreen() {
  const pin = usePhoneStore((s) => s.pin)
  const inputDigit = usePhoneStore((s) => s.inputDigit)
  const deleteDigit = usePhoneStore((s) => s.deleteDigit)
  const goLocked = usePhoneStore((s) => s.goLocked)
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

  return (
    <div className="phone-lock">
      <p className="phone-pin-label">Código</p>
      <div className="phone-dots">
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className={i < pin.length ? 'phone-dot is-on' : 'phone-dot'} />
        ))}
      </div>
      <div className="phone-pad">
        {keys.map((key) => (
          <button key={key} className="phone-key" type="button" onClick={() => inputDigit(key)}>
            {key}
          </button>
        ))}
        <button className="phone-key is-ghost" type="button" onClick={goLocked}>
          Voltar
        </button>
        <button className="phone-key" type="button" onClick={() => inputDigit('0')}>
          0
        </button>
        <button className="phone-key is-ghost" type="button" onClick={deleteDigit}>
          Apagar
        </button>
      </div>
    </div>
  )
}

function HomeScreen() {
  const openApp = usePhoneStore((s) => s.openApp)
  const hasMessages = usePhoneStore((s) => s.triggered)

  return (
    <div className="phone-os">
      <p className="phone-os-time">03:17</p>
      <p className="phone-os-service">Sem serviço</p>
      <div className="phone-app-grid">
        {APPS.map((app) => (
          <button
            key={app.id}
            className="phone-app"
            type="button"
            onClick={() => openApp(app.id === 'messages' ? 'messages' : 'offline')}
          >
            <span className={`phone-app-icon ${app.tone}`}>
              <AppGlyph id={app.id} />
              {hasMessages && 'badge' in app && app.badge ? (
                <span className="phone-app-badge">{app.badge}</span>
              ) : null}
            </span>
            <span className="phone-app-label">{app.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function MessagesScreen() {
  const hasMessages = usePhoneStore((s) => s.triggered)

  return (
    <div className="phone-os is-app">
      <p className="phone-app-title">Mensagens</p>
      {hasMessages ? (
        <ul className="phone-inbox">
          {THREADS.map((thread) => (
            <li key={thread.from} className="phone-thread">
              <span className="phone-thread-unread" aria-hidden />
              <span className="phone-thread-copy">
                <span className="phone-thread-top">
                  <span className="phone-thread-from">{thread.from}</span>
                  <span className="phone-thread-time">{thread.time}</span>
                </span>
                <span className="phone-thread-body">{thread.body}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="phone-inbox-empty">Nenhuma mensagem</p>
      )}
    </div>
  )
}

function OfflineScreen() {
  return (
    <div className="phone-os is-offline">
      <p className="phone-offline-kicker">Sem serviço</p>
      <p className="phone-offline-title">Fora de área</p>
    </div>
  )
}

function UnlockedScreen() {
  const app = usePhoneStore((s) => s.app)
  if (app === 'messages') return <MessagesScreen />
  if (app === 'offline') return <OfflineScreen />
  return <HomeScreen />
}

export function PhoneOverlay() {
  const ui = usePhoneStore((s) => s.ui)
  const shakeAt = usePhoneStore((s) => s.shakeAt)
  const line = usePhoneStore((s) => s.line)
  const close = usePhoneStore((s) => s.close)
  const goHome = usePhoneStore((s) => s.goHome)
  const open = isPhoneOpen(ui)
  const unlocked = ui === 'unlocked'

  if (!open && !line) return null

  return (
    <>
      {open ? <div className="phone-dim" onClick={close} /> : null}
      {open ? (
        <div className="phone-stage" onClick={close}>
          <div
            key={shakeAt}
            className={shakeAt ? 'phone-shell is-shake' : 'phone-shell'}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="phone-screen">
              <div className="phone-island" />
              <div className="phone-status">
                <span>03:17</span>
                <span>Sem sinal</span>
              </div>
              {ui === 'pin-entry' ? <PinScreen /> : unlocked ? <UnlockedScreen /> : <LockedScreen />}
              {unlocked ? (
                <button
                  className="phone-home is-btn"
                  type="button"
                  aria-label="Início"
                  onClick={goHome}
                >
                  <HomeGlyph />
                </button>
              ) : (
                <div className="phone-home">
                  <HomeGlyph />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
      {line ? <p className="phone-line">{line}</p> : null}
    </>
  )
}
