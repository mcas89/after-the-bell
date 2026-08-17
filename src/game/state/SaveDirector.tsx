import { useEffect } from 'react'
import { saveManager } from './gameSaveManager'
import { useGameStore } from './useGameStore'

export function SaveDirector() {
  const prologueDone = useGameStore((s) => s.prologueDone)

  useEffect(() => {
    if (!prologueDone) return
    const id = window.setInterval(() => saveManager.save(), 8000)
    return () => window.clearInterval(id)
  }, [prologueDone])

  return null
}
