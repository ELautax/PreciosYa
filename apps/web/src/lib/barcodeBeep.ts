/**
 * Beep corto tipo pistola de código de barras (Web Audio API, sin archivo).
 * Debe llamarse tras un gesto del usuario (abrir el escáner) para que el navegador permita audio.
 */
export function playBarcodeBeep(): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return

    const ctx = new AudioCtx()
    void ctx.resume()

    const now = ctx.currentTime
    // Dos tonos cortos (estilo retail scanner)
    playTone(ctx, now, 1800, 0.07)
    playTone(ctx, now + 0.09, 2200, 0.08)

    window.setTimeout(() => {
      void ctx.close()
    }, 400)
  } catch {
    /* audio opcional: no bloquear el scan */
  }
}

function playTone(ctx: AudioContext, startAt: number, freqHz: number, durationSec: number): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'square'
  osc.frequency.value = freqHz
  gain.gain.setValueAtTime(0.0001, startAt)
  gain.gain.exponentialRampToValueAtTime(0.18, startAt + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + durationSec)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(startAt)
  osc.stop(startAt + durationSec + 0.02)
}
