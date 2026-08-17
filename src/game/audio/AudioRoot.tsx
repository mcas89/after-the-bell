import { useFrame } from '@react-three/fiber'
import { useLayoutEffect } from 'react'
import { useGameStore } from '../state/useGameStore'
import { preloadGameAudio, startBedMusic, tickMixer, unlockAudio } from './mixer'

export function AudioRoot() {
  const prologueDone = useGameStore((s) => s.prologueDone)
  const bootScreen = useGameStore((s) => s.bootScreen)

  useLayoutEffect(() => {
    preloadGameAudio()
    const unlock = () => {
      unlockAudio()
      if (
        useGameStore.getState().bootScreen === 'playing' &&
        useGameStore.getState().prologueDone
      ) {
        startBedMusic()
      }
    }
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  useLayoutEffect(() => {
    if (bootScreen !== 'playing' || !prologueDone) return
    startBedMusic()
  }, [bootScreen, prologueDone])

  useFrame((_, delta) => {
    tickMixer(delta)
  })

  return null
}
