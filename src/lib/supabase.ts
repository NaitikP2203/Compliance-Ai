import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://msyrohztsiemtyqrxqhi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2j7BdqY3sE8YHC8JodQymw_LRKkI5Q5';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
