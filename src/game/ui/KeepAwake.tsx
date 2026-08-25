import { useEffect } from 'react'

export function KeepAwake() {
  useEffect(() => {
    const nav = navigator as Navigator & {
      wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> }
    }
    let lock: { release: () => Promise<void> } | null = null
    let stopped = false

    const grab = async () => {
      if (stopped || document.visibilityState !== 'visible') return
      if (!nav.wakeLock) return
      try {
        lock = await nav.wakeLock.request('screen')
      } catch {
        lock = null
      }
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') void grab()
    }

    void grab()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    window.addEventListener('pointerdown', grab, { once: true })

    return () => {
      stopped = true
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
      window.removeEventListener('pointerdown', grab)
      void lock?.release()
    }
  }, [])

  return null
}
