import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Masukkan URL dan Anon Key dari Dashboard Supabase Anda
const SUPABASE_URL = 'https://foxjujfesodolmlhitik.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZveGp1amZlc29kb2xtbGhpdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1Mjk4NzcsImV4cCI6MjA3OTEwNTg3N30.C26jCrj1IuOUkghZl5yTbAISn180PG0dDHjn-b5dtDk'; 
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});