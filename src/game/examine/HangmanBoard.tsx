import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ITEM_IDS } from '../data/items'
import { useInventoryStore } from '../state/useInventoryStore'

const WORD = 'FRIENDS'
const GIVEN = WORD.split('').map((letter) => letter === 'I' || letter === 'E' || letter === 'D')

function emptyGuess(solved: boolean) {
  return WORD.split('').map((letter, index) => (solved || GIVEN[index] ? letter : ''))
}

export function HangmanBoard() {
  const hasKey = useInventoryStore((s) => s.has(ITEM_IDS.officeKey))
  const [guess, setGuess] = useState(() => emptyGuess(hasKey))
  const [focus, setFocus] = useState(0)
  const [shakeAt, setShakeAt] = useState(0)
  const [solved, setSolved] = useState(hasKey)
  const [justWon, setJustWon] = useState(false)
  const [fail, setFail] = useState<string | null>(null)
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
    if (slots.join('') === WORD) {
      setSolved(true)
      setJustWon(true)
      setGuess(WORD.split(''))
      setFail(null)
      useInventoryStore.getState().collect(ITEM_IDS.officeKey)
      return
    }
    if (!slots.every(Boolean)) return
    setShakeAt(Date.now())
    setFail('Não é isso.')
    setGuess(emptyGuess(false))
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
      while (next >= 0 && next < WORD.length && GIVEN[next]) next += dir
      if (next >= 0 && next < WORD.length) {
        inputs.current[next]?.focus()
        setFocus(next)
      }
    }
  }

  return (
    <div className="hangman-pad">
      <div key={shakeAt} className={shakeAt ? 'hangman-body is-shake' : 'hangman-body'}>
        <div className="hangman-slots">
          {WORD.split('').map((_, index) => (
            <input
              key={index}
              ref={(node) => {
                inputs.current[index] = node
              }}
              className={GIVEN[index] ? 'hangman-slot is-given' : 'hangman-slot'}
              value={guess[index]}
              maxLength={1}
              disabled={solved || GIVEN[index]}
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
        {solved ? (
          <p className="hangman-ok">
            {justWon
              ? 'Ganhei uma chave nova. Foi para o inventário.'
              : 'A chave já está no inventário.'}
          </p>
        ) : fail ? (
          <p className="hangman-fail">{fail}</p>
        ) : (
          <p className="hangman-hint">{focus >= 0 ? 'Complete as letras que faltam.' : ''}</p>
        )}
      </div>
    </div>
  )
}
