export const loadState = <T>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key)
    if (!value) return fallback
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export const saveState = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value))
}
