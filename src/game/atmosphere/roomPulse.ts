export const roomPulse = {
  dim: 0,
}

export function lightMul() {
  return 0.04 + 0.96 * (1 - roomPulse.dim)
}
