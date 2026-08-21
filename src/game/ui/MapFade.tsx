import { useEffect } from 'react'
import { stepMapTravel, useMapTravelStore } from '../maps/mapTravel'

export function MapFade() {
  const fade = useMapTravelStore((s) => s.fade)
  const busy = useMapTravelStore((s) => s.busy)
  const card = useMapTravelStore((s) => s.card)

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

  const showCard = Boolean(card) && fade > 0.78

  return (
    <>
      <div
        className={`map-fade${busy || fade > 0.01 ? ' active' : ''}`}
        style={{ opacity: fade }}
      />
      {showCard && card ? (
        <div className="chapter-card is-fade">
          {card.kicker ? <p className="chapter-kicker">{card.kicker}</p> : null}
          <h2>{card.title}</h2>
        </div>
      ) : null}
    </>
  )
}
