import { create } from 'zustand'
import { dbGetAll, dbPut } from '@/lib/db'

interface UserRecord {
  id: string
  username: string
  passwordHash: string
  createdAt: string
}

// Simple non-cryptographic hash (fine for local-only storage)
function hashPw(pw: string): string {
  let h = 5381
  for (let i = 0; i < pw.length; i++) h = ((h << 5) + h) ^ pw.charCodeAt(i)
  return (h >>> 0).toString(16)
}

const SESSION_KEY = 'ft_session'

function saveSession(id: string) { localStorage.setItem(SESSION_KEY, id) }
function clearSession() { localStorage.removeItem(SESSION_KEY) }
function loadSession(): string | null { return localStorage.getItem(SESSION_KEY) }

interface AuthState {
  user: { id: string; username: string } | null
  initialized: boolean
  loading: boolean
  error: string | null
  init: () => Promise<void>
  register: (username: string, password: string) => Promise<boolean>
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initialized: false,
  loading: false,
  error: null,

  init: async () => {
    const sid = loadSession()
    if (sid) {
      const users = await dbGetAll<UserRecord>('users', '__auth__')
      const u = users.find(u => u.id === sid)
      if (u) {
        set({ user: { id: u.id, username: u.username }, initialized: true })
        return
      }
    }
    set({ initialized: true })
  },

  register: async (username, password) => {
    const name = username.trim()
    if (!name) { set({ error: 'Введите имя пользователя' }); return false }
    if (password.length < 4) { set({ error: 'Пароль минимум 4 символа' }); return false }
    set({ loading: true, error: null })
    const users = await dbGetAll<UserRecord>('users', '__auth__')
    if (users.find(u => u.username.toLowerCase() === name.toLowerCase())) {
      set({ error: 'Такой пользователь уже существует', loading: false }); return false
    }
    const newUser: UserRecord = {
      id: `u_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      username: name,
      passwordHash: hashPw(password),
      createdAt: new Date().toISOString(),
    }
    await dbPut('users', '__auth__', newUser)
    saveSession(newUser.id)
    set({ user: { id: newUser.id, username: newUser.username }, loading: false })
    return true
  },

  login: async (username, password) => {
    set({ loading: true, error: null })
    const users = await dbGetAll<UserRecord>('users', '__auth__')
    const u = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase())
    if (!u) { set({ error: 'Пользователь не найден', loading: false }); return false }
    if (u.passwordHash !== hashPw(password)) { set({ error: 'Неверный пароль', loading: false }); return false }
    saveSession(u.id)
    set({ user: { id: u.id, username: u.username }, loading: false })
    return true
  },

  logout: () => {
    clearSession()
    set({ user: null })
  },

  clearError: () => set({ error: null }),
}))
