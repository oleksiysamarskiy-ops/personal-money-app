// Factory to create user-scoped zustand stores
// When userId changes, stores are re-initialized with that user's data

import { create } from 'zustand'
import { loadState, saveState } from './persist'

type StoreCreator<T> = (
  set: (fn: (s: T) => T) => void,
  userId: string
) => T

// Map of userId -> store instance
const storeRegistry = new Map<string, unknown>()

export function createUserStore<T extends object>(
  key: string,
  defaultState: Omit<T, 'userId'>,
  creator: (helpers: {
    get: () => T,
    key: string,
    userId: string,
    load: <V>(k: string, fallback: V) => V,
    save: (k: string, val: unknown) => void
  }) => T
) {
  // Returns a hook-factory: call with userId to get the store hook
  return function useStore(userId: string): T {
    const registryKey = `${userId}:${key}`
    
    if (!storeRegistry.has(registryKey)) {
      const store = create<T>((set, get) => {
        const helpers = {
          get,
          key,
          userId,
          load: <V>(k: string, fallback: V) => loadState(k, fallback, userId),
          save: (k: string, val: unknown) => saveState(k, val, userId),
        }
        return creator(helpers)
      })
      storeRegistry.set(registryKey, store)
    }
    
    return (storeRegistry.get(registryKey) as ReturnType<typeof create<T>>)()
  }
}
