import { useEffect, useRef, useState } from 'react'

/**
 * Anima un porcentaje entero hacia `target` sin retroceder nunca.
 * El objetivo lo fijan eventos reales (etapas completadas, bytes recibidos);
 * este hook solo suaviza el conteo para que avance de uno en uno.
 */
export default function useSmoothProgress(target) {
  const [value, setValue] = useState(0)
  const current = useRef(0)
  useEffect(() => {
    if (target < current.current) { current.current = target; setValue(Math.round(target)) }
    // Temporizador en vez de requestAnimationFrame: sigue avanzando aunque la pestaña esté en segundo plano.
    let last = performance.now()
    const timer = setInterval(() => {
      const now = performance.now()
      const frames = Math.max(1, Math.min(120, Math.round((now - last) / 16)))
      last = now
      for (let index = 0; index < frames && current.current < target; index += 1) {
        const distance = target - current.current
        // Más rápido cuando falta mucho o cuando ya se confirmó el 100 %.
        current.current = distance <= 0.05 ? target : Math.min(target, current.current + Math.max(0.35, distance * (target >= 100 ? 0.2 : 0.09)))
      }
      setValue(Math.round(current.current))
      if (current.current >= target) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target])
  return value
}

/** Tiempo esperado de una operación, aprendido de la ejecución anterior. */
export function expectedDuration(key, fallback) {
  try { const saved = Number(localStorage.getItem('shopping-timing:' + key)); return saved > 100 ? saved : fallback } catch { return fallback }
}
export function rememberDuration(key, milliseconds) {
  try { localStorage.setItem('shopping-timing:' + key, String(Math.round(milliseconds))) } catch { /* almacenamiento no disponible */ }
}
