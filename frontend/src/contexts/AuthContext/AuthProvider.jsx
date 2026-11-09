import { API_MODE, apiService } from '../../services/api'
import { loadRemoteState, flushPersistence } from '../../data/localStore'
import useCollection from '../../hooks/useCollection'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { readCollection } from '../../data/localStore'
import AuthContext from './AuthContext'
const sessionKey = 'shopping-user-session'
function readSession() {
  if (API_MODE) return null
  try {
    const raw = sessionStorage.getItem(sessionKey) || localStorage.getItem(sessionKey)
    const value = raw ? JSON.parse(raw) : null
    return value?.demoVersion === 2 ? value.user : null
  } catch { return null }
}
function serverView(profile) {
  if (!profile) return null
  const selected = sessionStorage.getItem('shopping-view:' + profile.rut)
  const allowed = ['Comprador', ...(profile.role === 'Vendedor' || profile.canAdmin ? ['Vendedor'] : []), ...(profile.canAdmin ? ['Admin'] : [])]
  return { ...profile, serverRole: profile.role, role: allowed.includes(selected) ? selected : profile.role }
}
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession)
  const [selectedComuna, setSelectedComuna] = useCollection('comuna', 'Osorno')
  useEffect(() => { document.documentElement.dataset.reducedMotion = String(readCollection('preferences:' + user?.rut, {}).reducedMotion || false) }, [user?.rut])
  const login = useCallback(async (data, remember = false) => {
    if (API_MODE) { await loadRemoteState(); setUser(serverView(data)); return }
    localStorage.removeItem(sessionKey)
    sessionStorage.removeItem(sessionKey)
    const storage = remember ? localStorage : sessionStorage
    storage.setItem(sessionKey, JSON.stringify({ demoVersion: 2, user: data }))
    setUser(data)
  }, [])
  const updateProfile = useCallback((data) => {
    setUser(previous => {
      const updated = { ...previous, ...data }
      if (API_MODE) { sessionStorage.setItem('shopping-view:' + updated.rut, updated.role); return updated }
      const storage = localStorage.getItem(sessionKey) ? localStorage : sessionStorage
      storage.setItem(sessionKey, JSON.stringify({ demoVersion: 2, user: updated }))
      return updated
    })
  }, [])
  const switchRole = useCallback(role => {
    if (API_MODE && role === 'Vendedor' && !user?.canAdmin && user?.serverRole !== 'Vendedor') return
    if (role === 'Admin' && !user?.canAdmin) return
    updateProfile({ role, rol: role })
  }, [updateProfile, user])
  const setServerUser = useCallback(profile => setUser(serverView(profile)), [])
  const logout = useCallback(async () => {
    if (API_MODE) { await flushPersistence(); await apiService.logout(); await loadRemoteState() }
    localStorage.removeItem(sessionKey)
    sessionStorage.removeItem(sessionKey)
    setUser(null)
  }, [])
  const value = useMemo(() => ({ user, setServerUser, isAuthenticated: Boolean(user), login, logout, switchRole, updateProfile, selectedComuna, setSelectedComuna }), [user, setServerUser, login, logout, switchRole, updateProfile, selectedComuna, setSelectedComuna])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
