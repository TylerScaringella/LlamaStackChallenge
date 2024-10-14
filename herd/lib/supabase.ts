import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yzwtaaihjtgcsscoubnp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6d3RhYWloanRnY3NzY291Ym5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg5MjY2NjgsImV4cCI6MjA0NDUwMjY2OH0.qFpJY3y3hvsqHJZ2v22xBFsRxXP7pZLxSy7eGCCPR_w'

//const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})