import { saveManager } from '../state/gameSaveManager'

export function DebugResetSave() {
  if (!import.meta.env.DEV) return null

  return (
    <button className="debug-reset" type="button" onClick={() => saveManager.reset()}>
      Resetar save
    </button>
  )
}
