import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { ITEM_IDS } from '../data/items'
import { CLASSROOM_1 } from '../data/rooms'
import { saveManager } from '../state/gameSaveManager'
import { useGameStore } from '../state/useGameStore'
import { useInventoryStore } from '../state/useInventoryStore'
import { getHangmanChalkTexture } from './paperTextures'

export const HANGMAN_FLAGS = {
  amizade: 'hangmanAmizade',
  friends: 'hangmanFriends',
} as const

export type HangmanWord = 'AMIZADE' | 'FRIENDS'

const GIVEN = [false, false, true, false, false, true, false] as const
const GIVEN_LETTERS = ['', '', 'I', '', '', 'D', ''] as const
const ANSWERS: HangmanWord[] = ['AMIZADE', 'FRIENDS']

export function getHangmanSolved(): HangmanWord | null {
  const flags = useGameStore.getState().flags
  if (flags[HANGMAN_FLAGS.friends]) return 'FRIENDS'
  if (flags[HANGMAN_FLAGS.amizade]) return 'AMIZADE'
  return null
}

function emptyGuess(solved: HangmanWord | null) {
  return solved ? solved.split('') : [...GIVEN_LETTERS]
}

function winLine(word: HangmanWord, justWon: boolean) {
  if (!justWon) return 'A chave já está no inventário.'
  if (word === 'FRIENDS') return 'Ganhei uma chave nova. A luz acendeu um pouco.'
  return 'Ganhei uma chave nova. Foi para o inventário.'
}

export function HangmanChalk() {
  const friends = useGameStore((s) => Boolean(s.flags[HANGMAN_FLAGS.friends]))
  const amizade = useGameStore((s) => Boolean(s.flags[HANGMAN_FLAGS.amizade]))
  const word: HangmanWord | null = friends ? 'FRIENDS' : amizade ? 'AMIZADE' : null
  const map = useMemo(() => getHangmanChalkTexture(word), [word])
  const z = -CLASSROOM_1.size.depth / 2 + 0.085

  return (
    <mesh position={[0.22, 0.94, z]} renderOrder={3}>
      <planeGeometry args={[2.28, 0.34]} />
      <meshStandardMaterial
        map={map}
        transparent
        roughness={1}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-2}
        polygonOffsetUnits={-2}
      />
    </mesh>
  )
}

export function HangmanBoard() {
  const hasKey = useInventoryStore((s) => s.has(ITEM_IDS.officeKey))
  const solvedWord = useGameStore((s) => {
    if (s.flags[HANGMAN_FLAGS.friends]) return 'FRIENDS' as HangmanWord
    if (s.flags[HANGMAN_FLAGS.amizade]) return 'AMIZADE' as HangmanWord
    return null
  })
  const solved = Boolean(solvedWord) || hasKey
  const [guess, setGuess] = useState(() => emptyGuess(getHangmanSolved()))
  const [focus, setFocus] = useState(0)
  const [shakeAt, setShakeAt] = useState(0)
  const [justWon, setJustWon] = useState(false)
  const [wonWord, setWonWord] = useState<HangmanWord | null>(() => getHangmanSolved())
  const [fail, setFail] = useState<string | null>(null)
  const justWonRef = useRef(false)
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    const first = GIVEN.findIndex((given) => !given)
    inputs.current[first]?.focus()
    setFocus(first)
  }, [shakeAt])

  const fill = (index: number, raw: string) => {
    if (solved || GIVEN[index]) return
    const letter = raw.replace(/[^a-zA-Z]/g, '').slice(-1).toUpperCase()
    const next = [...guess]
    next[index] = letter
    setGuess(next)
    setFail(null)
    if (letter) {
      const ahead = next.findIndex((slot, i) => i > index && !GIVEN[i] && !slot)
      if (ahead >= 0) {
        inputs.current[ahead]?.focus()
        setFocus(ahead)
      }
    }
    if (next.every(Boolean)) window.setTimeout(() => check(next), 40)
  }

  const check = (slots: string[]) => {
    if (solved) return
    const word = slots.join('')
    const match = ANSWERS.find((answer) => answer === word)
    if (match) {
      const flag = match === 'FRIENDS' ? HANGMAN_FLAGS.friends : HANGMAN_FLAGS.amizade
      justWonRef.current = true
      setWonWord(match)
      setJustWon(true)
      setGuess(match.split(''))
      setFail(null)
      useGameStore.getState().addFlag(flag)
      useInventoryStore.getState().collect(ITEM_IDS.officeKey)
      saveManager.save()
      return
    }
    if (!slots.every(Boolean)) return
    setShakeAt(Date.now())
    setFail('Não é isso.')
    setGuess(emptyGuess(null))
  }

  const onKey = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !guess[index]) {
      event.preventDefault()
      let prev = index - 1
      while (prev >= 0 && GIVEN[prev]) prev -= 1
      if (prev >= 0) {
        const next = [...guess]
        next[prev] = ''
        setGuess(next)
        inputs.current[prev]?.focus()
        setFocus(prev)
      }
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      check(guess)
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      const dir = event.key === 'ArrowLeft' ? -1 : 1
      let next = index + dir
      while (next >= 0 && next < GIVEN.length && GIVEN[next]) next += dir
      if (next >= 0 && next < GIVEN.length) {
        inputs.current[next]?.focus()
        setFocus(next)
      }
    }
  }

  const shown = wonWord ?? solvedWord
  const locked = solved || Boolean(shown)

  return (
    <div className="hangman-pad">
      <div key={shakeAt} className={shakeAt ? 'hangman-body is-shake' : 'hangman-body'}>
        <div className="hangman-slots">
          {GIVEN_LETTERS.map((_, index) => (
            <input
              key={index}
              ref={(node) => {
                inputs.current[index] = node
              }}
              className={GIVEN[index] ? 'hangman-slot is-given' : 'hangman-slot'}
              value={guess[index]}
              maxLength={1}
              disabled={locked || GIVEN[index]}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-label={`Letra ${index + 1}`}
              onFocus={() => setFocus(index)}
              onChange={(event) => fill(index, event.target.value)}
              onKeyDown={(event) => onKey(index, event)}
            />
          ))}
        </div>
        {shown ? (
          <p className="hangman-ok">{winLine(shown, justWon || justWonRef.current)}</p>
        ) : fail ? (
          <p className="hangman-fail">{fail}</p>
        ) : (
          <p className="hangman-hint">{focus >= 0 ? 'Complete as letras que faltam.' : ''}</p>
        )}
      </div>
    </div>
  )
}
