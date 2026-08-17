export const moveInput = {
  keyX: 0,
  keyZ: 0,
  stickX: 0,
  stickZ: 0,
}

export function getMoveVector() {
  const x = clamp(moveInput.keyX + moveInput.stickX, -1, 1)
  const z = clamp(moveInput.keyZ + moveInput.stickZ, -1, 1)
  return { x, z }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
