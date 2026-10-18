import { useCallback, useMemo, useState } from 'react'
import AuthContext from './AuthContext'

const sessionKey = 'shopping-user-session'

// Función para leer la sesión guardada al recargar la página
const readStoredUser = () => {
  try {
    const stored = window.localStorage.getItem(sessionKey)
    if (!stored) return null
    const parsed = JSON.parse(stored)
    // El backend nos manda { token, user: {...} }. Extraemos directamente el user real.
    return parsed.user ? parsed.user : parsed
  } catch {
    return null
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)
  const [selectedComuna, setSelectedComuna] = useState('Osorno')

  const login = useCallback((userData) => {
    // Recibimos exactamente lo que responde .NET (run, nombre, apellido, rol)
    // LoginPage ya guardó el token en el localStorage, aquí solo actualizamos la interfaz
    setUser(userData)
  }, [])

  const switchRole = useCallback((newRole) => {
    setUser((prev) => {
      if (!prev) return null
      // Soportamos tanto la key antigua 'role' como la nueva 'rol' de tu BD
      const updated = { ...prev, rol: newRole, role: newRole }
      
      // Actualizamos el usuario en el localStorage sin borrar el token
      const stored = JSON.parse(window.localStorage.getItem(sessionKey) || '{}')
      window.localStorage.setItem(sessionKey, JSON.stringify({ ...stored, user: updated }))
      
      return updated
    })
  }, [])

  const updateProfile = useCallback((partialData) => {
    setUser((prev) => {
      if (!prev) return null
      const updated = { ...prev, ...partialData }
      
      const stored = JSON.parse(window.localStorage.getItem(sessionKey) || '{}')
      window.localStorage.setItem(sessionKey, JSON.stringify({ ...stored, user: updated }))
      
      return updated
    })
  }, [])

  const logout = useCallback(() => {
    window.localStorage.removeItem(sessionKey)
    setUser(null)
  }, [])

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      switchRole,
      updateProfile,
      selectedComuna,
      setSelectedComuna,
    }),
    [login, logout, switchRole, updateProfile, user, selectedComuna],
  )

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}