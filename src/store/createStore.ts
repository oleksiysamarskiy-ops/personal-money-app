import { create, StoreApi, UseBoundStore } from 'zustand'

// Properly typed store factory — avoids the ReturnType<typeof create<S>> issue
export function makeStore<T extends object>(
  init: (set: (fn: (s: T) => Partial<T>) => void) => T
): (userId: string) => UseBoundStore<StoreApi<T>> {
  const map = new Map<string, UseBoundStore<StoreApi<T>>>()

  return (userId: string): UseBoundStore<StoreApi<T>> => {
    if (!map.has(userId)) {
      const store = create<T>((zustandSet) => {
        const set = (fn: (s: T) => Partial<T>) =>
          zustandSet((s: T): T => ({ ...s, ...fn(s) }))
        return init(set)
      })
      map.set(userId, store)
    }
    return map.get(userId) as UseBoundStore<StoreApi<T>>
  }
}
