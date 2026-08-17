import { useEffect } from 'react'
import { moveInput } from './moveInput'

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

function syncFromKeys(keys: Record<string, boolean>) {
  moveInput.keyX = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0)
  moveInput.keyZ =
    (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0)
}

export function useKeyboard() {
  useEffect(() => {
    const keys: Record<string, boolean> = {}

    const onDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return
      keys[event.code] = true
      syncFromKeys(keys)
    }
    const onUp = (event: KeyboardEvent) => {
      keys[event.code] = false
      syncFromKeys(keys)
    }
    const clear = () => {
      for (const code of Object.keys(keys)) keys[code] = false
      moveInput.keyX = 0
      moveInput.keyZ = 0
    }

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    window.addEventListener('blur', clear)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      window.removeEventListener('blur', clear)
      clear()
    }
  }, [])
}
