import { useLayoutEffect, useRef, useState } from 'react'

export function useFitScale(active: boolean, designWRem: number, designHRem: number) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    if (!active) return
    const stage = stageRef.current
    if (!stage) return

    const apply = () => {
      const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
      const next = Math.min(1, stage.clientWidth / (designWRem * rem), stage.clientHeight / (designHRem * rem))
      setScale(Math.max(0.38, next))
    }

    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(stage)
    window.addEventListener('orientationchange', apply)
    return () => {
      observer.disconnect()
      window.removeEventListener('orientationchange', apply)
    }
  }, [active, designHRem, designWRem])

  return { stageRef, scale }
}
