import { useEffect, useState } from 'react'
import { refreshControlLock } from '../systems/controlLock'
import {
  consumeInstallPrompt,
  isIosDevice,
  isStandaloneApp,
  needsPwaInstall,
  peekInstallPrompt,
} from './pwa'

export function InstallGate() {
  const [blocked, setBlocked] = useState(() => needsPwaInstall())
  const [promptEvent, setPromptEvent] = useState(() => peekInstallPrompt())
  const [waitingOpen, setWaitingOpen] = useState(false)
  const ios = isIosDevice()

  useEffect(() => {
    const sync = () => {
      const next = needsPwaInstall()
      setBlocked(next)
      document.documentElement.classList.toggle('needs-pwa', next)
      refreshControlLock()
    }
    const onPrompt = () => {
      setPromptEvent(peekInstallPrompt())
    }
    const onInstalled = () => {
      setWaitingOpen(true)
      setPromptEvent(null)
      sync()
    }
    const mq = window.matchMedia('(display-mode: standalone)')
    mq.addEventListener('change', sync)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    sync()
    return () => {
      document.documentElement.classList.remove('needs-pwa')
      mq.removeEventListener('change', sync)
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (!blocked || isStandaloneApp()) return null

  return (
    <div className="pwa-gate" role="dialog" aria-label="Instalar o jogo">
      <p className="pwa-kicker">After the Bell</p>
      <p className="pwa-copy">{waitingOpen ? 'Abra pelo ícone' : 'Instale o jogo'}</p>
      <p className="pwa-hint">
        {waitingOpen
          ? 'Feche esta aba e abra After the Bell na tela inicial. A barra do navegador some.'
          : ios
            ? 'No Safari, toque em Compartilhar e depois em Adicionar à Tela de Início. Sem isso a barra de pesquisa cobre o jogo.'
            : 'Instale na tela inicial para jogar em tela cheia, sem a barra de pesquisa.'}
      </p>
      {!waitingOpen && !ios && promptEvent ? (
        <button
          className="pwa-install"
          type="button"
          onClick={async () => {
            const event = promptEvent ?? consumeInstallPrompt()
            if (!event) return
            await event.prompt()
            const choice = await event.userChoice
            if (choice.outcome === 'accepted') setWaitingOpen(true)
            consumeInstallPrompt()
            setPromptEvent(null)
          }}
        >
          Instalar
        </button>
      ) : null}
      {!waitingOpen && !ios && !promptEvent ? (
        <p className="pwa-ios-steps">Menu do Chrome → Instalar aplicativo</p>
      ) : null}
      {!waitingOpen && ios ? (
        <p className="pwa-ios-steps">
          Compartilhar
          <span aria-hidden> → </span>
          Adicionar à Tela de Início
        </p>
      ) : null}
    </div>
  )
}
