import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export type DbTable = 'incomes' | 'expenses' | 'savings' | 'investments' | 'debts' | 'subscriptions' | 'user_settings'

export async function dbLoad<T>(table: DbTable, userId: string): Promise<T[]> {
  const { data, error } = await supabase.from(table).select('*').eq('user_id', userId)
  if (error) { console.error(`[db] load ${table}:`, error.message); return [] }
  return (data || []) as T[]
}

export async function dbInsert<T extends { id: string }>(table: DbTable, userId: string, item: T): Promise<void> {
  const { error } = await supabase.from(table).insert({ ...item, user_id: userId })
  if (error) console.error(`[db] insert ${table}:`, error.message)
}

export async function dbUpdate<T extends { id: string }>(table: DbTable, userId: string, item: T): Promise<void> {
  const { error } = await supabase.from(table).update({ ...item, user_id: userId }).eq('id', item.id).eq('user_id', userId)
  if (error) console.error(`[db] update ${table}:`, error.message)
}

export async function dbDelete(table: DbTable, userId: string, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', userId)
  if (error) console.error(`[db] delete ${table}:`, error.message)
}

export async function dbUpsert<T>(table: DbTable, userId: string, item: T): Promise<void> {
  const { error } = await supabase.from(table).upsert({ ...item, user_id: userId })
  if (error) console.error(`[db] upsert ${table}:`, error.message)
}
