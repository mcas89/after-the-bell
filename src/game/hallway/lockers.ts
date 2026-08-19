import { HALL, HALL_PROPS } from './hallwayLayout'

export type HallLocker = {
  id: `hall-locker-${number}`
  name: string
  fullName: string
  kind: 'livia' | 'marina' | 'other'
  pin?: string
}

export const HALL_LOCKERS: HallLocker[] = [
  { id: 'hall-locker-0', name: 'Manuela', fullName: 'Manuela Ribeiro', kind: 'other' },
  { id: 'hall-locker-1', name: 'Melissa', fullName: 'Melissa Costa', kind: 'other' },
  { id: 'hall-locker-2', name: 'Mirela', fullName: 'Mirela Nunes', kind: 'other' },
  { id: 'hall-locker-3', name: 'Lívia', fullName: 'Lívia Ferreira', kind: 'livia', pin: '0305' },
  { id: 'hall-locker-4', name: 'Marina', fullName: 'Marina Alves', kind: 'marina', pin: '2107' },
  { id: 'hall-locker-5', name: 'Milena', fullName: 'Milena Mendes', kind: 'other' },
  { id: 'hall-locker-6', name: 'Marcela', fullName: 'Marcela Rocha', kind: 'other' },
  { id: 'hall-locker-7', name: 'Maitê', fullName: 'Maitê Pinto', kind: 'other' },
  { id: 'hall-locker-8', name: 'Mayara', fullName: 'Mayara Souza', kind: 'other' },
  { id: 'hall-locker-9', name: 'Mônica', fullName: 'Mônica Lima', kind: 'other' },
]

export function isHallLockerId(id: string | null | undefined): id is HallLocker['id'] {
  return Boolean(id && HALL_LOCKERS.some((locker) => locker.id === id))
}

export function getHallLocker(id: string | null | undefined) {
  if (!id) return null
  return HALL_LOCKERS.find((locker) => locker.id === id) ?? null
}

export function hallLockerNumber(id: string | null | undefined) {
  if (!id) return null
  const index = HALL_LOCKERS.findIndex((locker) => locker.id === id)
  return index >= 0 ? index + 1 : null
}

export function lockerPlateName(locker: HallLocker) {
  if (locker.kind === 'marina') return ''
  return locker.name
}

export function lockerPadLabel(locker: HallLocker) {
  const number = hallLockerNumber(locker.id)
  if (locker.kind === 'marina') return number ? `Armário ${number}` : 'Armário'
  return number ? `${number} · ${locker.fullName}` : locker.fullName
}

export function hallwayLockerZs() {
  const [a, b] = HALL_PROPS.sideWindows
  const pad = HALL_PROPS.sideWindowHalf + 0.38
  const start = a + pad
  const end = b - pad
  const count = HALL_LOCKERS.length
  const pitch = (end - start) / Math.max(1, count - 1)
  return Array.from({ length: count }, (_, i) => start + i * pitch)
}

export const LOCKER_WALL_X = -HALL.halfX
