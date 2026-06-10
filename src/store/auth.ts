import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { Session, User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  initialized: boolean
  register: (email: string, password: string) => Promise<boolean>
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
  init: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: false,
  error: null,
  initialized: false,

  init: async () => {
    const { data } = await supabase.auth.getSession()
    set({ session: data.session, user: data.session?.user ?? null, initialized: true })
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null })
    })
  },

  register: async (email, password) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { set({ error: error.message, loading: false }); return false }
    // Auto-login after register
    if (data.session) {
      set({ user: data.user, session: data.session, loading: false })
      return true
    }
    // Email confirmation required
    set({ loading: false, error: 'Проверьте почту для подтверждения' })
    return false
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const msg = error.message.includes('Invalid login') ? 'Неверный логин или пароль' : error.message
      set({ error: msg, loading: false }); return false
    }
    set({ user: data.user, session: data.session, loading: false })
    return true
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },

  clearError: () => set({ error: null }),
}))
