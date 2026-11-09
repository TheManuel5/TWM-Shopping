import { useCallback, useSyncExternalStore } from 'react'
import { readCollection, subscribe, writeCollection } from '../data/localStore'

export default function useCollection(key, initial = []) {
  const value = useSyncExternalStore(subscribe, () => readCollection(key, initial))
  const setValue = useCallback(next => writeCollection(key, next, initial), [key, initial])
  return [value, setValue]
}
