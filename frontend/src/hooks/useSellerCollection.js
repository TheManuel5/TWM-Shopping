import { useCallback, useMemo } from 'react'
import useCollection from './useCollection'
import useAuth from '../contexts/AuthContext/useAuth'
import { API_MODE } from '../services/api'
export default function useSellerCollection(key, initial = []) {
  const { user } = useAuth()
  const [all, setAll] = useCollection(key, initial)
  const visible = useMemo(() => !API_MODE || user?.canAdmin ? all : all.filter(row => row.ownerRut === user?.rut), [all, user])
  const setVisible = useCallback(next => setAll(current => {
    const mine = !API_MODE || user?.canAdmin ? current : current.filter(row => row.ownerRut === user?.rut)
    const updated = typeof next === 'function' ? next(mine) : next
    return !API_MODE || user?.canAdmin ? updated : [...current.filter(row => row.ownerRut !== user?.rut), ...updated.map(row => ({ ...row, ownerRut: user.rut }))]
  }), [setAll, user])
  return [visible, setVisible]
}
