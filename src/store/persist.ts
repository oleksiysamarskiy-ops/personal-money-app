// User-scoped persistence
// All data is stored under userId:key so each user has isolated data

export const loadState = <T>(key: string, fallback: T, userId?: string): T => {
  try {
    const scopedKey = userId ? `${userId}:${key}` : key
    const v = localStorage.getItem(scopedKey)
    return v ? JSON.parse(v) : fallback
  } catch { return fallback }
}

export const saveState = (key: string, value: unknown, userId?: string) => {
  const scopedKey = userId ? `${userId}:${key}` : key
  localStorage.setItem(scopedKey, JSON.stringify(value))
}
