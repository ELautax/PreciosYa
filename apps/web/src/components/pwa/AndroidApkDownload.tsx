import { Download } from 'lucide-react'

const APK_URL = '/preciosya.apk'

export function AndroidApkDownload() {
  return (
    <section
      id="descargar-apk"
      className="mt-8 w-full rounded-2xl border border-border bg-surface-soft/60 p-6 text-left shadow-sm"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-600/10 text-primary-600">
          <Download size={22} strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary-600">
              Android
            </p>
            <h3 className="mt-1 text-base font-black text-text-main tracking-tight">
              Descargá la app en APK
            </h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-text-subtle">
              Instalá PreciosYa como app nativa en tu celular. Abrí el archivo, permití
              «Instalar apps desconocidas» si Android lo pide, y listo.
            </p>
          </div>
          <a
            href={APK_URL}
            download="PreciosYa.apk"
            className="btn-primary inline-flex h-12 items-center justify-center px-6 text-sm"
          >
            <Download size={18} className="mr-2" />
            Descargar APK (Android)
          </a>
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-subtle">
            iPhone: usá «Agregar a pantalla de inicio» desde Safari en esta misma web.
          </p>
        </div>
      </div>
    </section>
  )
}
