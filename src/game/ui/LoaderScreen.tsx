import { useProgress } from '@react-three/drei'

export function LoaderScreen() {
  const { active, progress } = useProgress()

  if (!active) return null

  return (
    <div className="loader-chip">
      <span>03:17</span>
      <span>{Math.round(progress)}%</span>
    </div>
  )
}
