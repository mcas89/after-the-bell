import { useEffect, useState } from 'react'
import { saveManager, type SaveEntry } from '../state/gameSaveManager'
import { useGameStore } from '../state/useGameStore'

function ago(at: number) {
  const sec = Math.max(0, Math.round((Date.now() - at) / 1000))
  if (sec < 40) return 'agora'
  if (sec < 90) return '1 min'
  if (sec < 3600) return `${Math.round(sec / 60)} min`
  return `${Math.round(sec / 3600)} h`
}

export function SaveHistory() {
  const prologueDone = useGameStore((s) => s.prologueDone)
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState<SaveEntry[]>([])

  const refresh = () => setEntries(saveManager.listHistory())

  useEffect(() => {
    if (!open) return
    refresh()
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open])

  if (!prologueDone) return null

  return (
    <>
      <button
        className="debug-reset"
        type="button"
        onClick={() => {
          if (open) {
            setOpen(false)
            return
          }
          refresh()
          setOpen(true)
        }}
      >
        Save
      </button>
      {open ? (
        <div className="save-panel" role="dialog" aria-label="Saves recentes">
          <p className="save-panel-kicker">Voltar a um ponto</p>
          {entries.length === 0 ? (
            <p className="save-panel-empty">Nenhum ponto ainda.</p>
          ) : (
            <ul className="save-list">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <button type="button" className="save-item" onClick={() => saveManager.restore(entry.id)}>
                    <span className="save-item-title">{entry.label}</span>
                    <span className="save-item-time">{ago(entry.save.updatedAt)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button className="save-wipe" type="button" onClick={() => saveManager.reset()}>
            Começar do zero
          </button>
        </div>
      ) : null}
    </>
  )
}
