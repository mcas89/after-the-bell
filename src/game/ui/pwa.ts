type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
  })
}

export function peekInstallPrompt() {
  return deferredPrompt
}

export function consumeInstallPrompt() {
  const event = deferredPrompt
  deferredPrompt = null
  return event
}

export function isStandaloneApp() {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return (
    nav.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches
  )
}

export function isPhoneBrowser() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: coarse) and (hover: none)').matches
}

export function needsPwaInstall() {
  if (typeof window === 'undefined') return false
  if (import.meta.env.DEV) return false
  return isPhoneBrowser() && !isStandaloneApp()
}

export function isIosDevice() {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}
