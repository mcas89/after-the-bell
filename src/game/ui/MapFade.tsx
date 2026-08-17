import { useEffect } from 'react'
import { stepMapTravel, useMapTravelStore } from '../maps/mapTravel'

export function MapFade() {
  const fade = useMapTravelStore((s) => s.fade)
  const busy = useMapTravelStore((s) => s.busy)

  useEffect(() => {
    if (!busy) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      stepMapTravel(dt)
      if (useMapTravelStore.getState().phase !== 'idle') {
        raf = requestAnimationFrame(tick)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(raf)
  }, [busy])

  return (
    <div
      className={`map-fade${busy || fade > 0.01 ? ' active' : ''}`}
      style={{ opacity: fade }}
    />
  )
}
