/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface Window {
  discoverClue?: (id: string) => boolean
  updateClue?: (
    id: string,
    patch: { title?: string; description?: string; stage?: number },
  ) => boolean
  collectItem?: (id: string) => boolean
  resetSave?: () => void
}
