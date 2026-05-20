import { useEffect, useState } from 'react'
import { DownloadCloud } from 'lucide-react'
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

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        appToast.success('Instalación iniciada')
      }
      setDeferredPrompt(null)
      return
    }
    appToast.info('En iPhone/iPad: Compartir -> Agregar a inicio')
  }

  return (
    <button
      type="button"
      onClick={() => void handleInstall()}
      className="btn-secondary h-10 px-4 group flex items-center"
      aria-label="Instalar aplicación"
    >
      <DownloadCloud size={18} className="text-primary-600 transition-transform group-hover:-translate-y-0.5" />
      <span className="hidden sm:inline ml-2 text-[10px] font-black uppercase tracking-widest leading-none">Instalar App</span>
    </button>
  )
}
