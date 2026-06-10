export const loadState = <T>(key: string, fallback: T): T => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}
export const saveState = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value))
}
