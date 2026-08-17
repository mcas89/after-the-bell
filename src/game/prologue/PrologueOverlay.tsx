import { useEffect, useRef } from 'react'
import { useGameStore } from '../state/useGameStore'
import { prologueView } from './timeline'

export function PrologueOverlay() {
  const blackRef = useRef<HTMLDivElement>(null)
  const blurRef = useRef<HTMLDivElement>(null)
  const clockRef = useRef<HTMLParagraphElement>(null)
  const lineRef = useRef<HTMLParagraphElement>(null)
  const done = useGameStore((s) => s.prologueDone)

  useEffect(() => {
    if (done) return
    let id = 0
    const loop = () => {
      if (blackRef.current) blackRef.current.style.opacity = String(prologueView.black)
      if (clockRef.current) clockRef.current.style.opacity = String(prologueView.clock)
      if (blurRef.current) {
        const blur = `blur(${prologueView.blur}px)`
        blurRef.current.style.backdropFilter = blur
        blurRef.current.style.setProperty('-webkit-backdrop-filter', blur)
        blurRef.current.style.opacity = prologueView.blur > 0.05 ? '1' : '0'
      }
      if (lineRef.current) {
        lineRef.current.textContent = prologueView.subtitle ?? ''
        lineRef.current.style.opacity = prologueView.subtitle ? '1' : '0'
      }
      id = requestAnimationFrame(loop)
    }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [done])

  if (done) return null

  return (
    <div className="prologue-layer">
      <div ref={blurRef} className="prologue-blur" />
      <div ref={blackRef} className="prologue-black" />
      <p ref={clockRef} className="prologue-clock">
        03:17
      </p>
      <p ref={lineRef} className="prologue-line" />
    </div>
  )
}
