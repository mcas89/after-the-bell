import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import App from './App'
import { hydrateFromSave } from './game/state/saveBindings'
import './index.css'

hydrateFromSave()

const el = document.getElementById('root')
if (!el) throw new Error('root')

const existing = (globalThis as { __atbRoot?: Root }).__atbRoot
const root = existing ?? createRoot(el)
;(globalThis as { __atbRoot?: Root }).__atbRoot = root

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
