import { useEffect, useState } from 'react'

import { appToast } from '@/lib/toast'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function InstallPromptButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase()
    setIsIos(/iphone|ipad|ipod/.test(ua))

    const onBeforeInstallPrompt = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent
      installEvent.preventDefault()
      setDeferredPrompt(installEvent)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    }
  }, [])

  if (!deferredPrompt && !isIos) return null

  return (
    <button
      type="button"
      onClick={async () => {
        if (deferredPrompt) {
          await deferredPrompt.prompt()
          const choice = await deferredPrompt.userChoice
          if (choice.outcome === 'accepted') {
            appToast.success('Instalación iniciada')
          }
          setDeferredPrompt(null)
          return
        }
        appToast.info('En iPhone/iPad: Compartir -> Agregar a pantalla de inicio')
      }}
      className="btn-soft w-full sm:w-auto"
    >
      Instalar app
    </button>
  )
}

