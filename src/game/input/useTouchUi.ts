import { useEffect, useState } from 'react'

export function readTouchUi() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(pointer: coarse)').matches) return true
  return navigator.maxTouchPoints > 0 && window.innerWidth < 820
}

export function useTouchUi() {
  const [touch, setTouch] = useState(readTouchUi)

  useEffect(() => {
    const sync = () => setTouch(readTouchUi())
    const mq = window.matchMedia('(pointer: coarse)')
    mq.addEventListener('change', sync)
    window.addEventListener('resize', sync)
    return () => {
      mq.removeEventListener('change', sync)
      window.removeEventListener('resize', sync)
    }
  }, [])

  return touch
}
