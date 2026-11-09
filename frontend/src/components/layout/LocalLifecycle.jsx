import { API_MODE } from '../../services/api'
import { useEffect } from 'react'
import { getCatalog } from '../../data/catalog'
import { refreshQuotes } from '../../data/commerce'
import { readCollection, writeCollection } from '../../data/localStore'

export default function LocalLifecycle() {
  useEffect(() => {
    if (API_MODE) return
    const refresh = () => {
      const current = readCollection('quotes', [])
      const updated = refreshQuotes(current, getCatalog())
      if (JSON.stringify(current) !== JSON.stringify(updated)) writeCollection('quotes', updated)
    }
    refresh()
    const timer = setInterval(refresh, 60000)
    window.addEventListener('focus', refresh)
    return () => { clearInterval(timer); window.removeEventListener('focus', refresh) }
  }, [])
  return null
}
