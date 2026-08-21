import { useEffect, useRef, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'

export function UpdateScreen() {
  const [updating, setUpdating] = useState(false)
  const reloading = useRef(false)
  const stopChecks = useRef<(() => void) | null>(null)

  useEffect(() => {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        setUpdating(true)
        window.setTimeout(() => updateSW(true), 480)
      },
      onRegisteredSW(_url, registration) {
        if (!registration) return
        const check = () => {
          void registration.update()
        }
        const id = window.setInterval(check, 20000)
        const onVisible = () => {
          if (document.visibilityState === 'visible') check()
        }
        window.addEventListener('focus', check)
        document.addEventListener('visibilitychange', onVisible)
        check()
        stopChecks.current = () => {
          window.clearInterval(id)
          window.removeEventListener('focus', check)
          document.removeEventListener('visibilitychange', onVisible)
        }
      },
    })

    const onControllerChange = () => {
      if (reloading.current) return
      reloading.current = true
      setUpdating(true)
      window.location.reload()
    }
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
    }
    return () => {
      stopChecks.current?.()
      navigator.serviceWorker?.removeEventListener('controllerchange', onControllerChange)
    }
  }, [])

  if (!updating) return null

  return (
    <div className="pwa-update" role="status" aria-live="polite">
      <p className="pwa-copy">Atualizando</p>
      <p className="pwa-hint">Uma versão nova acabou de chegar.</p>
    </div>
  )
}
