import { useEffect } from 'react'
import { getExamineEntry } from '../data/examineContent'
import { useDoorStore } from '../door/useDoorStore'
import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { useGameStore } from '../state/useGameStore'
import { useInventoryStore } from '../state/useInventoryStore'
import { useHallwayStore } from '../hallway/useHallwayStore'
import { getHallLocker, isHallLockerId, lockerPadLabel } from '../hallway/lockers'
import { useLockerPinStore } from '../hallway/useLockerPin'
import { ITEM_IDS } from '../data/items'
import { HangmanBoard } from './HangmanBoard'
import { useExamineStore } from './useExamineStore'
import { LAB_ON_PC_ID } from '../computer/computerStore'

function Sheet({ kind }: { kind: NonNullable<ReturnType<typeof getExamineEntry>>['sheet'] }) {
  if (kind === 'bloco') {
    return (
      <article className="examine-sheet is-bloco">
        <p className="sheet-mark">L + M</p>
        <p className="sheet-hand">depois de todos irem a</p>
        <p className="sheet-hand is-yell">eu nao sei esperar !!!</p>
        <p className="sheet-hand is-m">se precisar o meu e o quinto</p>
        <p className="sheet-hand is-m">codigo meu niver</p>
      </article>
    )
  }
  if (kind === 'chao') {
    return (
      <article className="examine-sheet is-torn">
        <p className="sheet-muted">Prova — Matemática</p>
        <p className="sheet-muted">2º B</p>
        <p>Exercício 3  ·  Exercício 4</p>
        <p className="sheet-mark">B</p>
        <p className="sheet-note">Corrigida. Nota B.</p>
      </article>
    )
  }
  if (kind === 'prontuario') {
    return (
      <article className="examine-sheet is-file">
        <h2>Escola Estadual Francis Milton</h2>
        <p className="sheet-kicker">2º Ano B — Registro de turma</p>
        <p>
          <strong>Lívia Ferreira</strong>
        </p>
        <p className="sheet-muted">Nº 17 · 2º B</p>
        <p className="sheet-muted">Frequência · notas · ocorrência</p>
      </article>
    )
  }
  if (kind === 'aviso') {
    return (
      <article className="examine-sheet is-file">
        <h2>Escola Estadual Francis Milton</h2>
        <p className="sheet-kicker">Aviso interno</p>
        <p>Fechamento — 22h</p>
        <p>Alarme armado. Portas trancam por fora.</p>
        <p className="sheet-muted">Não permanecer no prédio.</p>
      </article>
    )
  }
  if (kind === 'ronda') {
    return (
      <article className="examine-sheet is-file">
        <h2>Escola Estadual Francis Milton</h2>
        <p className="sheet-kicker">Ronda de fechamento — 14 de outubro</p>
        <p>Alarme 22:00</p>
        <p>Porta externa A · ok</p>
        <p>Porta externa B · ok</p>
        <p>Portaria — chaves · ok</p>
        <p className="sheet-muted">Plantão H. Costa · saída 22:04</p>
        <p className="sheet-note">levei as chaves da externa</p>
      </article>
    )
  }
  if (kind === 'mural') {
    return (
      <article className="examine-sheet is-board">
        <p className="sheet-date">Sexta-feira, 14 de outubro</p>
        <p>Aviso de prova — Matemática</p>
        <p>Horário de prova — 2º B</p>
        <p className="sheet-muted">Foto da turma. Escura demais. Não dá pra ver nenhum rosto.</p>
      </article>
    )
  }
  if (kind === 'quadro') {
    return null
  }
  if (kind === 'mochila-livia') {
    return (
      <article className="examine-sheet is-small is-keychain">
        <svg className="keychain-draw" viewBox="0 0 200 240" role="img" aria-label="Chaveiro">
          <defs>
            <radialGradient id="kc-room" cx="50%" cy="28%" r="72%">
              <stop offset="0%" stopColor="#3a342c" />
              <stop offset="100%" stopColor="#161310" />
            </radialGradient>
            <linearGradient id="kc-ring" x1="20%" y1="10%" x2="86%" y2="90%">
              <stop offset="0%" stopColor="#8a8680" />
              <stop offset="28%" stopColor="#2c2a28" />
              <stop offset="52%" stopColor="#6a6762" />
              <stop offset="78%" stopColor="#1c1b19" />
              <stop offset="100%" stopColor="#5c5852" />
            </linearGradient>
            <linearGradient id="kc-ring-hi" x1="30%" y1="0%" x2="70%" y2="100%">
              <stop offset="0%" stopColor="#c8c2b6" stopOpacity="0.55" />
              <stop offset="40%" stopColor="#c8c2b6" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="kc-tag" x1="18%" y1="8%" x2="84%" y2="96%">
              <stop offset="0%" stopColor="#6a5a3e" />
              <stop offset="35%" stopColor="#3a3224" />
              <stop offset="70%" stopColor="#2a2418" />
              <stop offset="100%" stopColor="#1a1610" />
            </linearGradient>
            <linearGradient id="kc-tag-edge" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8a7a58" />
              <stop offset="50%" stopColor="#4a4030" />
              <stop offset="100%" stopColor="#12100c" />
            </linearGradient>
            <filter id="kc-soft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.1" />
            </filter>
          </defs>
          <rect width="200" height="240" fill="url(#kc-room)" />
          <ellipse cx="100" cy="214" rx="42" ry="8" fill="#000" opacity="0.45" filter="url(#kc-soft)" />
          <ellipse cx="100" cy="52" rx="18" ry="21" fill="none" stroke="url(#kc-ring)" strokeWidth="6.2" />
          <ellipse cx="100" cy="52" rx="18" ry="21" fill="none" stroke="url(#kc-ring-hi)" strokeWidth="2" />
          <path d="M116 46c2-1 5 1 4 5" fill="none" stroke="#1a1816" strokeWidth="2.4" strokeLinecap="round" />
          <ellipse cx="100" cy="82" rx="4.2" ry="5.4" fill="none" stroke="url(#kc-ring)" strokeWidth="2.6" />
          <ellipse cx="100" cy="93" rx="3.6" ry="4.6" fill="none" stroke="url(#kc-ring)" strokeWidth="2.2" />
          <rect x="64" y="98" width="72" height="96" rx="7" fill="url(#kc-tag-edge)" />
          <rect x="67" y="101" width="66" height="90" rx="5.5" fill="url(#kc-tag)" />
          <path d="M72 106h52" stroke="#8a7a5a" strokeWidth="0.7" opacity="0.35" />
          <path d="M70 186h56" stroke="#000" strokeWidth="1.1" opacity="0.28" />
          <text
            x="100"
            y="140"
            textAnchor="middle"
            fill="#c4b48a"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="20"
            fontWeight="700"
            letterSpacing="1.6"
          >
            L.F
          </text>
          <line x1="82" y1="150" x2="118" y2="150" stroke="#7a6a48" strokeWidth="0.8" opacity="0.7" />
          <text
            x="100"
            y="176"
            textAnchor="middle"
            fill="#b8a878"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="17"
            fontWeight="700"
            letterSpacing="2.4"
          >
            2103
          </text>
        </svg>
      </article>
    )
  }
  if (kind === 'mochila-outra') {
    return (
      <article className="examine-sheet is-small">
        <p>Estojo. Carregador. Bala.</p>
        <p>Um elástico de cabelo.</p>
        <p className="sheet-muted">Aberta, como se alguém tivesse mexido nela.</p>
      </article>
    )
  }
  return null
}

function LockerInside({ name, kind }: { name: string; kind: 'livia' | 'marina' | 'other' }) {
  const hasBatteries = useInventoryStore(
    (s) => s.has(ITEM_IDS.batteries) || s.has(ITEM_IDS.flashlightLit),
  )
  return (
    <div className="locker-inside">
      {kind === 'marina' ? null : <p className="locker-inside-name">{name}</p>}
      <div className="locker-inside-box">
        {kind === 'livia' ? (
          <>
            <div className="locker-inside-shelf">
              <span className="locker-item is-book" />
              <span className="locker-item is-book is-thin" />
              <span className="locker-item is-photo" />
            </div>
            <div className="locker-inside-mid">
              <span className="locker-item is-hook" />
              <span className="locker-item is-hoodie" />
            </div>
            <div className="locker-inside-floor">
              <span className="locker-item is-scrap" aria-hidden>
                <span className="locker-scrap-num">0305-2011</span>
              </span>
            </div>
          </>
        ) : kind === 'marina' ? (
          <>
            <div className="locker-inside-shelf" />
            <div className="locker-inside-mid">
              <span className="locker-item is-hook" />
            </div>
            <div className="locker-inside-floor">
              {hasBatteries ? null : (
                <>
                  <span className="locker-item is-battery" />
                  <span className="locker-item is-battery is-plus" />
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="locker-inside-shelf" />
            <div className="locker-inside-mid">
              <span className="locker-item is-hook" />
            </div>
            <div className="locker-inside-floor" />
          </>
        )}
      </div>
    </div>
  )
}

function LockerPinPad({ lockerId }: { lockerId: string }) {
  const locker = getHallLocker(lockerId)
  const pin = useLockerPinStore((s) => s.pin)
  const shakeAt = useLockerPinStore((s) => s.shakeAt)
  const failLine = useLockerPinStore((s) => s.line)
  const opened = useLockerPinStore((s) => s.opened)
  const inputDigit = useLockerPinStore((s) => s.inputDigit)
  const deleteDigit = useLockerPinStore((s) => s.deleteDigit)
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

  useEffect(() => {
    useLockerPinStore.getState().reset(lockerId)
    return () => useLockerPinStore.getState().reset(null)
  }, [lockerId])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat) return
      if (event.key >= '0' && event.key <= '9') {
        event.preventDefault()
        inputDigit(event.key)
      }
      if (event.key === 'Backspace') {
        event.preventDefault()
        deleteDigit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [deleteDigit, inputDigit])

  if (!locker) return null
  if (opened) return <LockerInside name={locker.name} kind={locker.kind} />

  return (
    <div className="locker-pad">
      <div key={shakeAt} className={shakeAt ? 'locker-pad-body is-shake' : 'locker-pad-body'}>
        <p className="locker-pad-name">{lockerPadLabel(locker)}</p>
        {opened ? (
          <p className="locker-pad-hint">{failLine ?? 'Aberto.'}</p>
        ) : (
          <>
            <p className="locker-pad-label">Senha</p>
            <div className="locker-pad-dots">
              {Array.from({ length: 4 }, (_, i) => (
                <span key={i} className={i < pin.length ? 'locker-pad-dot is-on' : 'locker-pad-dot'} />
              ))}
            </div>
            <div className="locker-pad-keys">
              {keys.map((key) => (
                <button key={key} className="locker-pad-key" type="button" onClick={() => inputDigit(key)}>
                  {key}
                </button>
              ))}
              <span className="locker-pad-key is-ghost" />
              <button className="locker-pad-key" type="button" onClick={() => inputDigit('0')}>
                0
              </button>
              <button className="locker-pad-key is-ghost" type="button" onClick={deleteDigit}>
                Apagar
              </button>
            </div>
            {failLine ? <p className="locker-pad-fail">{failLine}</p> : <p className="locker-pad-hint">4 dígitos</p>}
          </>
        )}
      </div>
    </div>
  )
}

const CABINET_HOOKS = ['Portaria', 'Externa', 'Alunos'] as const

function FlashlightCloseup() {
  return (
    <article className="examine-sheet is-keychain">
      <svg className="keychain-draw" viewBox="0 0 220 280" role="img" aria-label="Lanterna">
        <defs>
          <radialGradient id="fl-room" cx="50%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#3a342c" />
            <stop offset="100%" stopColor="#161310" />
          </radialGradient>
          <linearGradient id="fl-body" x1="10%" y1="20%" x2="90%" y2="80%">
            <stop offset="0%" stopColor="#4a4e46" />
            <stop offset="40%" stopColor="#2a2e28" />
            <stop offset="100%" stopColor="#1a1c18" />
          </linearGradient>
          <linearGradient id="fl-head" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d0ccc0" />
            <stop offset="50%" stopColor="#8a8680" />
            <stop offset="100%" stopColor="#3a3834" />
          </linearGradient>
        </defs>
        <rect width="220" height="280" fill="url(#fl-room)" />
        <ellipse cx="110" cy="248" rx="48" ry="8" fill="#000" opacity="0.42" />
        <rect x="38" y="118" width="108" height="38" rx="8" fill="url(#fl-body)" />
        <rect x="44" y="124" width="28" height="26" rx="3" fill="#121410" />
        <rect x="48" y="128" width="8" height="18" rx="1.5" fill="#2a2c24" />
        <rect x="60" y="128" width="8" height="18" rx="1.5" fill="#2a2c24" />
        <path d="M146 112h28l18 25-18 25h-28" fill="url(#fl-head)" />
        <circle cx="186" cy="137" r="11" fill="#1a1c16" />
        <circle cx="186" cy="137" r="7" fill="#3a4030" />
        <rect x="28" y="126" width="14" height="22" rx="3" fill="#2c2a26" transform="rotate(-18 35 137)" />
        <rect x="31" y="130" width="8" height="14" rx="1.5" fill="#1a1814" transform="rotate(-18 35 137)" />
      </svg>
    </article>
  )
}

function TeachersCabinet() {
  const detailId = useExamineStore((s) => s.detailId)
  const inspectDetail = useExamineStore((s) => s.inspectDetail)
  const taken = useInventoryStore((s) => s.has(ITEM_IDS.flashlight) || s.has(ITEM_IDS.flashlightLit))

  if (detailId === 'teachers-flashlight') return <FlashlightCloseup />

  return (
    <div className="cabinet-inside">
      <div className="cabinet-inside-box">
        <div className={detailId === 'teachers-hooks' ? 'cabinet-hooks is-focus' : 'cabinet-hooks'}>
          {CABINET_HOOKS.map((label) => (
            <button
              key={label}
              className="cabinet-hook"
              type="button"
              onClick={() => inspectDetail('teachers-hooks')}
            >
              <span className="cabinet-hook-peg" />
              <span className="cabinet-hook-label">{label}</span>
            </button>
          ))}
        </div>
        <div className="cabinet-shelf">
          {taken ? null : (
            <button
              className="cabinet-flashlight"
              type="button"
              aria-label="Lanterna"
              onClick={() => inspectDetail('teachers-flashlight')}
            >
              <span className="cabinet-flash-body" />
              <span className="cabinet-flash-head" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function ExamineHud() {
  const hoveredId = useExamineStore((s) => s.hoveredId)
  const examiningId = useExamineStore((s) => s.examiningId)
  const detailId = useExamineStore((s) => s.detailId)
  const interaction = useGameStore((s) => s.interactionState)
  const prologueDone = useGameStore((s) => s.prologueDone)
  const phoneOpen = usePhoneStore((s) => isPhoneOpen(s.ui))
  const entry = examiningId ? getExamineEntry(detailId ?? examiningId) : null

  const collectibleId = entry?.collectibleId
  const collected = useInventoryStore((s) => (collectibleId ? s.has(collectibleId) : false))
  useInventoryStore((s) => s.has(ITEM_IDS.officeKey))
  useLockerPinStore((s) => s.openIds)
  const doorPhase = useDoorStore((s) => s.phase)
  const doorNear = useDoorStore((s) => s.near)
  const canOpenDoor = doorPhase === 'ajar' && doorNear && interaction === 'gameplay'
  const hallPrompt = useHallwayStore((s) => s.prompt)

  if (
    !prologueDone ||
    phoneOpen ||
    interaction === 'viewing-fragments' ||
    interaction === 'viewing-inventory' ||
    interaction === 'door-beat' ||
    interaction === 'opening-door' ||
    interaction === 'girl-glimpse' ||
    interaction === 'map-travel' ||
    interaction === 'using-computer'
  ) {
    return null
  }

  return (
    <>
      {interaction === 'examining-object' && examiningId ? (
        <>
          <div className="examine-dim" />
          {examiningId === 'quadro-negro' ? <HangmanBoard /> : null}
          {examiningId === 'teachers-cabinet' ? <TeachersCabinet /> : null}
          {entry?.sheet ? <Sheet kind={entry.sheet} /> : null}
          {isHallLockerId(examiningId) ? <LockerPinPad lockerId={examiningId} /> : null}
          {entry?.line ? (
            <p className="examine-line">
              {entry.line.split('\n').map((part) => (
                <span key={part}>
                  {part}
                  <br />
                </span>
              ))}
            </p>
          ) : null}
          <button
            className="examine-close"
            type="button"
            title="Fechar"
            aria-label="Fechar"
            onClick={() => useExamineStore.getState().stopInspect()}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              <path
                d="M6.4 6.4l11.2 11.2M17.6 6.4L6.4 17.6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <p className="prompt-hud">
            {collectibleId && !collected
              ? 'F pegar · Esc ou X fechar'
              : examiningId === 'teachers-cabinet' && !detailId
                ? 'Clique para inspecionar · Esc ou X fechar'
                : detailId
                  ? 'Esc ou X voltar'
                  : 'Esc ou X fechar'}
          </p>
        </>
      ) : null}
      {interaction === 'gameplay' && canOpenDoor ? (
        <p className="prompt-hud">E abrir</p>
      ) : interaction === 'gameplay' && hallPrompt ? (
        <p className="prompt-hud">{hallPrompt}</p>
      ) : interaction === 'gameplay' && hoveredId === LAB_ON_PC_ID ? (
        <p className="prompt-hud">Clique para usar</p>
      ) : interaction === 'gameplay' && hoveredId ? (
        <p className="prompt-hud">Clique para examinar</p>
      ) : null}
    </>
  )
}
