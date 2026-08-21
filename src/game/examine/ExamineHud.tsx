import { useEffect, type ReactNode } from 'react'
import { useFitScale } from '../ui/useFitScale'
import { collectPromptFor, collectPromptsFor, EXAMINE_IMG, getExamineEntry } from '../data/examineContent'
import { useDoorStore } from '../door/useDoorStore'
import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { useGameStore } from '../state/useGameStore'
import { useInventoryStore } from '../state/useInventoryStore'
import { useHallwayStore } from '../hallway/useHallwayStore'
import { getHallLocker, isHallLockerId, lockerPadLabel } from '../hallway/lockers'
import { useLockerPinStore } from '../hallway/useLockerPin'
import { ITEM_IDS } from '../data/items'
import { tryCollect } from '../input/actions'
import { LOBBY_LIGHTS, tryFlipLobbySwitch } from '../inventory/flashlight'
import { tryForceSkeletonCabinet, ZEL_SKELETON_OPEN } from '../rooms/skeletonCabinet'
import { HangmanBoard } from './HangmanBoard'
import { useExamineStore } from './useExamineStore'
import { LAB_ON_PC_ID } from '../computer/computerStore'
import { useTouchUi } from '../input/useTouchUi'

function Sheet({ kind }: { kind: NonNullable<ReturnType<typeof getExamineEntry>>['sheet'] }) {
  if (kind === 'bloco') {
    return (
      <article className="examine-sheet is-bloco">
        <p className="sheet-mark">L + M</p>
        <p className="sheet-hand">depois de todos irem a</p>
        <p className="sheet-hand is-yell">eu nao sei esperar !!!</p>
        <p className="sheet-hand is-m">o meu armário é o quinto</p>
        <p className="sheet-hand is-m">código: meu niver</p>
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
        <p className="sheet-muted">Nascimento: 03/05</p>
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
  if (kind === 'pasta') {
    return (
      <article className="examine-sheet is-file">
        <h2>Escola Estadual Francis Milton</h2>
        <p className="sheet-kicker">2º Ano B — Pasta do aluno</p>
        <p>
          <strong>Marina Alves</strong>
        </p>
        <p className="sheet-muted">Nascimento: 21/07</p>
        <p className="sheet-muted">Nº 5 · 2º B</p>
        <p className="sheet-muted">Frequência · notas · ocorrência</p>
        <p className="sheet-note">A gente ria tanto.</p>
      </article>
    )
  }
  if (kind === 'manutencao') {
    return (
      <article className="examine-sheet is-file">
        <h2>Escola Estadual Francis Milton</h2>
        <p className="sheet-kicker">Manutenção — Diretoria</p>
        <p>Janela do fundo — 2º pavimento</p>
        <p>Grade removida.</p>
        <p className="sheet-muted">Não recolocar até nova ordem.</p>
      </article>
    )
  }
  if (kind === 'quadro') {
    return null
  }
  return null
}

function ExaminePhoto({ src, children }: { src: string; children?: ReactNode }) {
  return (
    <div className="examine-photo-wrap">
      <img className="examine-photo" src={src} alt="" />
      {children}
    </div>
  )
}

function PhotoSpot({
  id,
  label,
  box,
  taken,
}: {
  id: string
  label: string
  box: string
  taken?: boolean
}) {
  const detailId = useExamineStore((s) => s.detailId)
  if (taken) return null
  return (
    <button
      className={detailId === id ? `examine-hotspot is-focus ${box}` : `examine-hotspot ${box}`}
      type="button"
      aria-label={label}
      onClick={() => useExamineStore.getState().inspectDetail(id)}
    />
  )
}

function LockerInside({ name }: { name: string }) {
  return (
    <div className="locker-inside">
      <p className="locker-inside-name">{name}</p>
      <div className="locker-inside-box">
        <div className="locker-inside-shelf" />
        <div className="locker-inside-mid">
          <span className="locker-item is-hook" />
        </div>
        <div className="locker-inside-floor" />
      </div>
    </div>
  )
}

function LockerOpened({ lockerId }: { lockerId: string }) {
  const locker = getHallLocker(lockerId)
  const detailId = useExamineStore((s) => s.detailId)
  const hasCells = useInventoryStore((s) => s.has(ITEM_IDS.batteries) || s.has(ITEM_IDS.flashlightLit))
  const hasJanitorKey = useInventoryStore((s) => s.has(ITEM_IDS.janitorKey))

  if (!locker) return null
  if (detailId === 'locker-photo') return <ExaminePhoto src={EXAMINE_IMG.fotoVerso} />
  if (locker.kind === 'livia') {
    return (
      <ExaminePhoto src={EXAMINE_IMG.armario4}>
        <PhotoSpot id="locker-photo" label="Foto" box="is-locker-photo" />
      </ExaminePhoto>
    )
  }
  if (locker.kind === 'marina') {
    if (hasCells) return null
    return (
      <ExaminePhoto src={EXAMINE_IMG.armario5}>
        <PhotoSpot id="locker-batteries" label="Pilhas" box="is-locker-batteries" taken={hasCells} />
      </ExaminePhoto>
    )
  }
  if (locker.kind === 'janitor') {
    if (hasJanitorKey) return null
    return (
      <ExaminePhoto src={EXAMINE_IMG.ultimoArmario}>
        <PhotoSpot id="locker-janitor-key" label="Chave" box="is-locker-janitor-key" taken={hasJanitorKey} />
      </ExaminePhoto>
    )
  }
  return <LockerInside name={locker.name} />
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
  const { stageRef, scale } = useFitScale(true, 17.5, 19)

  useEffect(() => {
    const store = useLockerPinStore.getState()
    store.reset(lockerId)
    const current = getHallLocker(lockerId)
    if (current?.kind === 'janitor') store.openNow(current.id)
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
  if (locker.kind === 'janitor' || opened) return <LockerOpened lockerId={lockerId} />

  return (
    <div className="locker-pad" ref={stageRef}>
      <div
        key={shakeAt}
        className={shakeAt ? 'locker-pad-body is-shake' : 'locker-pad-body'}
        style={{ zoom: scale }}
      >
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

function TeachersCabinet() {
  const hasFlash = useInventoryStore((s) => s.has(ITEM_IDS.flashlight) || s.has(ITEM_IDS.flashlightLit))
  const hasKey = useInventoryStore((s) => s.has(ITEM_IDS.officeKey))
  if (hasFlash && hasKey) return null

  return (
    <ExaminePhoto src={EXAMINE_IMG.professores}>
      <PhotoSpot id="teachers-key" label="Chave" box="is-teachers-key" taken={hasKey} />
      <PhotoSpot id="teachers-flashlight" label="Lanterna" box="is-teachers-flash" taken={hasFlash} />
    </ExaminePhoto>
  )
}

function promptLine(
  examiningId: string,
  detailId: string | null,
  prompt: ReturnType<typeof collectPromptFor>,
  touch: boolean,
) {
  if (touch) {
    const locker = getHallLocker(examiningId)
    if (locker?.kind === 'livia' && useLockerPinStore.getState().isOpen(locker.id) && !detailId) {
      return 'Toque na foto'
    }
    return null
  }
  if (prompt) return `F pegar ${prompt.label} · Esc ou X fechar`
  if (examiningId === 'zel-skeleton' && !useGameStore.getState().flags[ZEL_SKELETON_OPEN]) {
    return 'F forçar · Esc ou X fechar'
  }
  if (examiningId === 'teachers-cabinet' && !detailId) {
    return 'Clique na chave ou na lanterna · Esc ou X fechar'
  }
  const locker = getHallLocker(examiningId)
  if (locker?.kind === 'livia' && useLockerPinStore.getState().isOpen(locker.id) && !detailId) {
    return 'Clique na foto · Esc ou X fechar'
  }
  if (detailId) return 'Esc ou X voltar'
  return 'Esc ou X fechar'
}

export function ExamineHud() {
  const touch = useTouchUi()
  const hoveredId = useExamineStore((s) => s.hoveredId)
  const examiningId = useExamineStore((s) => s.examiningId)
  const detailId = useExamineStore((s) => s.detailId)
  const interaction = useGameStore((s) => s.interactionState)
  const prologueDone = useGameStore((s) => s.prologueDone)
  const phoneOpen = usePhoneStore((s) => isPhoneOpen(s.ui))
  const entry = examiningId ? getExamineEntry(detailId ?? examiningId) : null
  const prompt = collectPromptFor(examiningId, detailId)
  const takes = collectPromptsFor(examiningId, detailId)

  useInventoryStore((s) => s.items)
  useLockerPinStore((s) => s.openIds)
  useGameStore((s) => s.flags)
  const lightsOn = useGameStore((s) => Boolean(s.flags[LOBBY_LIGHTS]))
  const skeletonOpen = useGameStore((s) => Boolean(s.flags[ZEL_SKELETON_OPEN]))
  const doorPhase = useDoorStore((s) => s.phase)
  const doorNear = useDoorStore((s) => s.near)
  const canOpenDoor = doorPhase === 'ajar' && doorNear && interaction === 'gameplay'
  const hallPrompt = useHallwayStore((s) => s.prompt)
  const showEntryImage =
    Boolean(entry?.image) &&
    examiningId !== 'teachers-cabinet' &&
    !isHallLockerId(examiningId ?? '')
  const inspectHint =
    interaction === 'examining-object' && examiningId
      ? promptLine(examiningId, detailId, prompt, touch)
      : null

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
          {examiningId === 'lobby-switch' || examiningId === 'zel-skeleton' || examiningId === 'zel-locker'
            ? null
            : <div className="examine-dim" />}
          {examiningId === 'quadro-negro' ? <HangmanBoard /> : null}
          {examiningId === 'teachers-cabinet' ? <TeachersCabinet /> : null}
          {showEntryImage && entry?.image ? <ExaminePhoto src={entry.image} /> : null}
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
          {inspectHint ? <p className="prompt-hud">{inspectHint}</p> : null}
          {examiningId === 'lobby-switch' ? (
            <div className="examine-takes">
              <button
                className="examine-take"
                type="button"
                disabled={lightsOn}
                onPointerDown={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  tryFlipLobbySwitch(true)
                }}
              >
                ligar luzes
              </button>
              <button
                className="examine-take"
                type="button"
                disabled={!lightsOn}
                onPointerDown={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  tryFlipLobbySwitch(false)
                }}
              >
                desligar luzes
              </button>
            </div>
          ) : examiningId === 'zel-skeleton' && !skeletonOpen ? (
            <div className="examine-takes">
              <button
                className="examine-take"
                type="button"
                onPointerDown={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  tryForceSkeletonCabinet()
                }}
              >
                forçar
              </button>
            </div>
          ) : takes.length ? (
            <div className="examine-takes">
              {takes.map((take) => (
                <button
                  key={take.id}
                  className="examine-take"
                  type="button"
                  onPointerDown={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    tryCollect(take.id)
                  }}
                >
                  coletar {take.label}
                </button>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
      {touch ? null : interaction === 'gameplay' && canOpenDoor ? (
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
