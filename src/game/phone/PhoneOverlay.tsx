import { isPhoneOpen, usePhoneStore, type PhoneApp } from './phoneStore'
import {
  PHONE_CALLS,
  PHONE_PHOTOS,
  PHONE_THREADS,
  phonePhoto,
  phoneThread,
} from './phoneContent'

const APPS: Array<{ id: Exclude<PhoneApp, 'home'>; label: string; tone: string; badge?: number }> = [
  { id: 'messages', label: 'Mensagens', tone: 'is-messages', badge: 5 },
  { id: 'calls', label: 'Telefone', tone: 'is-phone' },
  { id: 'photos', label: 'Fotos', tone: 'is-photos' },
  { id: 'notes', label: 'Notas', tone: 'is-notes' },
  { id: 'clock', label: 'Relógio', tone: 'is-clock' },
  { id: 'maps', label: 'Mapas', tone: 'is-maps' },
  { id: 'camera', label: 'Câmera', tone: 'is-camera' },
  { id: 'recorder', label: 'Gravador', tone: 'is-recorder' },
]

function AppGlyph({ id }: { id: Exclude<PhoneApp, 'home'> }) {
  const dark = id === 'clock' || id === 'notes'
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
      {id === 'calls' ? (
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
      {id === 'notes' ? (
        <>
          <rect x="6" y="4.2" width="12" height="16" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="M8.4 8.4h7.2M8.4 12h7.2M8.4 15.6h5" fill="none" stroke="currentColor" strokeWidth="1.5" />
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
      {id === 'camera' ? (
        <>
          <rect x="3.6" y="7.4" width="16.8" height="11.2" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="12" cy="13" r="3.1" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="M8.4 7.4 9.6 5.4h4.8l1.2 2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </>
      ) : null}
      {id === 'recorder' ? (
        <>
          <rect x="8.2" y="4.4" width="7.6" height="12.4" rx="3.8" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="M7 14.2a5 5 0 0 0 10 0M12 19.2v1.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
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
      <rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 11V8.2a4 4 0 0 1 8 0V11" fill="none" stroke="currentColor" strokeWidth="1.7" />
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
      <p className="phone-date">Sábado, 15 de outubro</p>
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
          <button key={app.id} className="phone-app" type="button" onClick={() => openApp(app.id)}>
            <span className={`phone-app-icon ${app.tone}`}>
              <AppGlyph id={app.id} />
              {hasMessages && app.badge ? <span className="phone-app-badge">{app.badge}</span> : null}
            </span>
            <span className="phone-app-label">{app.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function ThreadView({ id }: { id: string }) {
  const thread = phoneThread(id)
  if (!thread) return null
  return (
    <div className="phone-os is-app">
      <p className="phone-app-title">{thread.from}</p>
      <ul className="phone-chat">
        {thread.messages.map((msg, index) => (
          <li key={`${msg.time}-${index}`} className={msg.who === 'me' ? 'is-me' : 'is-them'}>
            <span>{msg.text}</span>
            <em>{msg.time}</em>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MessagesScreen() {
  const hasMessages = usePhoneStore((s) => s.triggered)
  const viewId = usePhoneStore((s) => s.viewId)
  const openView = usePhoneStore((s) => s.openView)
  if (viewId && phoneThread(viewId)) return <ThreadView id={viewId} />

  return (
    <div className="phone-os is-app">
      <p className="phone-app-title">Mensagens</p>
      {hasMessages ? (
        <ul className="phone-inbox">
          {PHONE_THREADS.map((thread) => (
            <li key={thread.id}>
              <button
                className={thread.locked ? 'phone-thread is-locked' : 'phone-thread'}
                type="button"
                onClick={() => openView(thread.id)}
              >
                {thread.locked ? <span className="phone-thread-lock" aria-hidden /> : <span className="phone-thread-unread" aria-hidden />}
                <span className="phone-thread-copy">
                  <span className="phone-thread-top">
                    <span className="phone-thread-from">{thread.locked ? 'Conversa' : thread.from}</span>
                    <span className="phone-thread-time">{thread.time}</span>
                  </span>
                  <span className="phone-thread-body">{thread.preview}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="phone-inbox-empty">Nenhuma mensagem</p>
      )}
    </div>
  )
}

function CallsScreen() {
  const openView = usePhoneStore((s) => s.openView)
  return (
    <div className="phone-os is-app">
      <p className="phone-app-title">Recentes</p>
      <ul className="phone-inbox">
        {PHONE_CALLS.map((call) => (
          <li key={call.id}>
            <button className="phone-thread" type="button" onClick={() => openView(call.id)}>
              <span className={call.kind === 'in' ? 'phone-call-kind is-in' : 'phone-call-kind'}>
                {call.kind === 'in' ? '↙' : '↗'}
              </span>
              <span className="phone-thread-copy">
                <span className="phone-thread-top">
                  <span className="phone-thread-from">{call.name}</span>
                  <span className="phone-thread-time">{call.time}</span>
                </span>
                <span className="phone-thread-body">
                  {call.result}
                  {call.duration ? ` · ${call.duration}` : ''}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PhotoView({ id }: { id: string }) {
  const photo = phonePhoto(id)
  if (!photo) return null
  if (photo.broken) {
    return (
      <div className="phone-os is-app">
        <p className="phone-app-title">{photo.time}</p>
        <div className="phone-photo-broken">
          <p>Não foi possível carregar esta foto.</p>
        </div>
      </div>
    )
  }
  return (
    <div className="phone-os is-app">
      <p className="phone-app-title">{photo.time}</p>
      <div className={photo.smear ? 'phone-photo is-smear' : 'phone-photo'}>
        {photo.image ? <img src={photo.image} alt="" /> : null}
      </div>
    </div>
  )
}

function PhotosScreen() {
  const viewId = usePhoneStore((s) => s.viewId)
  const openView = usePhoneStore((s) => s.openView)
  if (viewId && phonePhoto(viewId)) return <PhotoView id={viewId} />
  return (
    <div className="phone-os is-app">
      <p className="phone-app-title">Fotos</p>
      <ul className="phone-photos">
        {PHONE_PHOTOS.map((photo) => (
          <li key={photo.id}>
            <button className="phone-photo-tile" type="button" onClick={() => openView(photo.id)}>
              {photo.broken ? (
                <span className="phone-photo-gap" />
              ) : (
                <img src={photo.image} alt="" className={photo.smear ? 'is-smear' : undefined} />
              )}
              <span>{photo.time}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function NotesScreen() {
  return (
    <div className="phone-os is-app">
      <p className="phone-app-title">sexta</p>
      <ul className="phone-note-list">
        <li>carregador</li>
        <li>moletom</li>
        <li>refri</li>
        <li>salgadinho</li>
        <li>bala</li>
      </ul>
    </div>
  )
}

function ClockScreen() {
  return (
    <div className="phone-os is-app">
      <p className="phone-clock-big">03:17:00</p>
      <p className="phone-clock-sub">Sábado, 15 de outubro</p>
      <div className="phone-alarm">
        <span>06:00</span>
        <strong>levantar</strong>
        <em>Ativado</em>
      </div>
    </div>
  )
}

function MapsScreen() {
  return (
    <div className="phone-os is-app">
      <p className="phone-app-title">Mapas</p>
      <p className="phone-maps-off">Sem sinal · localização indisponível</p>
      <ul className="phone-maps-hist">
        <li>
          <span>Casa</span>
          <em>salvo</em>
        </li>
        <li>
          <span>Escola Estadual Francis Milton</span>
          <em>salvo</em>
        </li>
        <li>
          <span>Casa</span>
          <em>02:52 · rota indisponível</em>
        </li>
      </ul>
    </div>
  )
}

function BlockedScreen({ title, text }: { title: string; text: string }) {
  return (
    <div className="phone-os is-offline">
      <p className="phone-offline-kicker">{title}</p>
      <p className="phone-offline-title">{text}</p>
    </div>
  )
}

function UnlockedScreen() {
  const app = usePhoneStore((s) => s.app)
  if (app === 'messages') return <MessagesScreen />
  if (app === 'calls') return <CallsScreen />
  if (app === 'photos') return <PhotosScreen />
  if (app === 'notes') return <NotesScreen />
  if (app === 'clock') return <ClockScreen />
  if (app === 'maps') return <MapsScreen />
  if (app === 'camera') return <BlockedScreen title="Câmera" text="Não foi possível abrir." />
  if (app === 'recorder') return <BlockedScreen title="Gravador" text="1 arquivo danificado." />
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
                <button className="phone-home is-btn" type="button" aria-label="Início" onClick={goHome}>
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
