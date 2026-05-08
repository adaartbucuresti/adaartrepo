import { createClient } from '@supabase/supabase-js'

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim()
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

const isPlaceholder =
  supabaseUrl === 'your_supabase_url' ||
  supabaseAnonKey === 'your_supabase_anon_key' ||
  !supabaseUrl ||
  !supabaseAnonKey

export const isSupabaseConfigured = !isPlaceholder

const notConfiguredError = { message: 'Supabase nu este configurat (.env).' }
const notConfiguredResult = { data: null, error: notConfiguredError, count: null }
const notConfiguredPromise = Promise.resolve(notConfiguredResult)

const createNoopQuery = () => {
  const q = {
    select: () => q,
    eq: () => q,
    order: () => q,
    single: () => notConfiguredPromise,
    insert: () => notConfiguredPromise,
    update: () => q,
    delete: () => q,
    then: (resolve, reject) => notConfiguredPromise.then(resolve, reject),
  }
  return q
}

const createNoopClient = () => ({
  from: () => createNoopQuery(),
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: async () => ({ data: null, error: notConfiguredError }),
    signInWithPassword: async () => ({ data: null, error: notConfiguredError }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ data: null, error: notConfiguredError }),
  },
})

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createNoopClient()

