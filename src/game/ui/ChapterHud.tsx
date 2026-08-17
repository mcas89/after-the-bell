import { OBJECTIVES } from '../data/objectives'
import { useHallwayStore } from '../hallway/useHallwayStore'

export function ChapterHud() {
  const cardUntil = useHallwayStore((s) => s.chapterCardUntil)
  const objective = useHallwayStore((s) => s.objective)
  const line = useHallwayStore((s) => s.line)
  const showCard = cardUntil > 0
  const objectiveDef = objective ? OBJECTIVES[objective] : null

  return (
    <>
      {showCard ? (
        <div className="chapter-card">
          <p className="chapter-kicker">Capítulo 1</p>
          <h2>O Corredor</h2>
        </div>
      ) : null}
      {objectiveDef && !showCard ? (
        <p className="objective-chip">{objectiveDef.title}</p>
      ) : null}
      {line ? <p className="spoken-line">{line}</p> : null}
    </>
  )
}
