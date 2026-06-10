import { create } from 'zustand'

export interface UserRecord {
  id: string
  username: string
  passwordHash: string
  createdAt: string
}

// Simple hash for password (not cryptographic, but ok for local storage)
function hashPassword(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(16)
}

const USERS_KEY = 'ft-users'
const SESSION_KEY = 'ft-session'

function loadUsers(): UserRecord[] {
  try {
    const v = localStorage.getItem(USERS_KEY)
    return v ? JSON.parse(v) : []
  } catch { return [] }
}

function saveUsers(users: UserRecord[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function loadSession(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

interface AuthStore {
  currentUserId: string | null
  currentUsername: string | null
  error: string | null
  register: (username: string, password: string) => boolean
  login: (username: string, password: string) => boolean
  logout: () => void
  clearError: () => void
}

const savedSession = loadSession()
let initialUserId: string | null = null
let initialUsername: string | null = null

if (savedSession) {
  const users = loadUsers()
  const user = users.find(u => u.id === savedSession)
  if (user) {
    initialUserId = user.id
    initialUsername = user.username
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  currentUserId: initialUserId,
  currentUsername: initialUsername,
  error: null,

  register: (username, password) => {
    const users = loadUsers()
    const trimmed = username.trim()
    if (!trimmed) {
      set({ error: 'Введите имя пользователя' })
      return false
    }
    if (password.length < 4) {
      set({ error: 'Пароль должен быть минимум 4 символа' })
      return false
    }
    if (users.find(u => u.username.toLowerCase() === trimmed.toLowerCase())) {
      set({ error: 'Такой пользователь уже существует' })
      return false
    }
    const newUser: UserRecord = {
      id: `u_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      username: trimmed,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    }
    saveUsers([...users, newUser])
    localStorage.setItem(SESSION_KEY, newUser.id)
    set({ currentUserId: newUser.id, currentUsername: newUser.username, error: null })
    return true
  },

  login: (username, password) => {
    const users = loadUsers()
    const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase())
    if (!user) {
      set({ error: 'Пользователь не найден' })
      return false
    }
    if (user.passwordHash !== hashPassword(password)) {
      set({ error: 'Неверный пароль' })
      return false
    }
    localStorage.setItem(SESSION_KEY, user.id)
    set({ currentUserId: user.id, currentUsername: user.username, error: null })
    return true
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY)
    set({ currentUserId: null, currentUsername: null, error: null })
  },

  clearError: () => set({ error: null }),
}))

// Get the user-scoped storage key
export function userKey(userId: string, key: string): string {
  return `${userId}:${key}`
}
