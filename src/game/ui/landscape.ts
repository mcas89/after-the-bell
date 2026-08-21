export const PORTRAIT_QUERY = '(orientation: portrait) and (pointer: coarse)'

export function isCoarsePortrait() {
  if (typeof window === 'undefined') return false
  return window.matchMedia(PORTRAIT_QUERY).matches
}

export async function tryLockLandscape() {
  const orientation = screen.orientation as { lock?: (mode: string) => Promise<void> } | undefined
  try {
    await orientation?.lock?.('landscape')
  } catch {
    /* browser may refuse without fullscreen / PWA */
  }
}
