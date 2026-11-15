import { useState } from 'react'

/**
 * Muestra una lista por bloques. Devuelve los elementos visibles y las propiedades
 * para <ShowMore />. Al cambiar `resetKey` (filtros, búsqueda) vuelve al primer bloque.
 */
export default function useBlocks(list, step = 20, resetKey = '') {
  const [state, setState] = useState({ key: resetKey, count: step })
  const count = state.key === resetKey ? state.count : step
  return { visible: list.slice(0, count), shown: Math.min(count, list.length), total: list.length, step, onMore: () => setState({ key: resetKey, count: count + step }) }
}
