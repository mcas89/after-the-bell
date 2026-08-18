import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { playSfx, SFX } from '../audio/mixer'
import { CLASSROOM_1, type RoomId } from '../data/rooms'
import { HALL, HALL_PROPS } from '../hallway/hallwayLayout'
import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { playerMotion } from '../player/playerMotion'
import { useGameStore } from '../state/useGameStore'

const ENTER = 1.68
const LEAVE = 2.22

const WINDOWS: Partial<Record<RoomId, Array<[number, number]>>> = {
  classroom1: [-1.85, 0, 1.85].map((z) => [-CLASSROOM_1.size.width / 2 + 0.02, z]),
  hallway: [
    [0, HALL_PROPS.windowZ],
    ...HALL_PROPS.sideWindows.map((z): [number, number] => [-HALL.halfX, z]),
  ],
}

function nearestWindow(room: RoomId, x: number, z: number) {
  const list = WINDOWS[room]
  if (!list) return Infinity
  let best = Infinity
  for (const [wx, wz] of list) {
    const d = Math.hypot(x - wx, z - wz)
    if (d < best) best = d
  }
  return best
}

export function WindowTerror() {
  const inside = useRef(false)

  useFrame(() => {
    const game = useGameStore.getState()
    if (!game.prologueDone || game.interactionState !== 'gameplay' || isPhoneOpen(usePhoneStore.getState().ui)) {
      inside.current = false
      return
    }

    const dist = nearestWindow(game.currentRoom, playerMotion.x, playerMotion.z)
    if (!inside.current && dist <= ENTER) {
      inside.current = true
      playSfx(SFX.terror2, 0.46)
      return
    }
    if (inside.current && dist > LEAVE) inside.current = false
  })

  return null
}
