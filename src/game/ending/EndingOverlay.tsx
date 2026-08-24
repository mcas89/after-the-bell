import { useEffect, useRef } from 'react'
import { useGameStore } from '../state/useGameStore'
import { endingView } from './timeline'

export function EndingOverlay() {
  const blackRef = useRef<HTMLDivElement>(null)
  const blurRef = useRef<HTMLDivElement>(null)
  const clockRef = useRef<HTMLParagraphElement>(null)
  const lineRef = useRef<HTMLParagraphElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const playing = useGameStore((s) => Boolean(s.flags.endingPlaying))

  useEffect(() => {
    if (!playing) return
    let id = 0
    const loop = () => {
      if (blackRef.current) blackRef.current.style.opacity = String(endingView.black)
      if (clockRef.current) clockRef.current.style.opacity = String(endingView.clock)
      if (blurRef.current) {
        const blur = `blur(${endingView.blur}px)`
        blurRef.current.style.backdropFilter = blur
        blurRef.current.style.setProperty('-webkit-backdrop-filter', blur)
        blurRef.current.style.opacity = endingView.blur > 0.05 ? '1' : '0'
      }
      if (lineRef.current) {
        lineRef.current.textContent = endingView.subtitle ?? ''
        lineRef.current.style.opacity = endingView.subtitle ? '1' : '0'
      }
      if (cardRef.current) cardRef.current.style.opacity = String(endingView.card)
      id = requestAnimationFrame(loop)
    }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [playing])

  if (!playing) return null

  return (
    <div className="prologue-layer ending-layer">
      <div ref={blurRef} className="prologue-blur" />
      <div ref={blackRef} className="prologue-black" />
      <p ref={clockRef} className="prologue-clock">
        03:17
      </p>
      <p ref={lineRef} className="prologue-line ending-line" />
      <div ref={cardRef} className="ending-card">
        <p className="ending-kicker">After the Bell</p>
        <h1>Fim.</h1>
        <p className="ending-next">Continua.</p>
      </div>
    </div>
  )
}
