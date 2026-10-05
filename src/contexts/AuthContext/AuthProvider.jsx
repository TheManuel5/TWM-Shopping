import { useCallback, useMemo, useState } from 'react'
import AuthContext from './AuthContext'

const sessionKey = 'shopping-user-session'

const readStoredUser = () => {
  try {
    const storedUser = window.localStorage.getItem(sessionKey)
    return storedUser ? JSON.parse(storedUser) : null
  } catch {
    return null
  }
}

const nameFromEmail = (email = '') => {
  const emailName = email.split('@')[0].replace(/[._-]+/g, ' ').trim()

  if (!emailName) return 'Usuario Shopping'

  return emailName
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  const login = useCallback((credentials) => {
    const email = credentials.email?.trim() ?? ''
    const rut = credentials.rut?.trim() ?? ''
    const authenticatedUser = {
      name: email ? nameFromEmail(email) : 'Usuario Shopping',
      email,
      rut,
      role: 'Comprador',
    }

    window.localStorage.setItem(sessionKey, JSON.stringify(authenticatedUser))
    setUser(authenticatedUser)
  }, [])

  const logout = useCallback(() => {
    window.localStorage.removeItem(sessionKey)
    setUser(null)
  }, [])

  const contextValue = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, logout }),
    [login, logout, user],
  )

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
