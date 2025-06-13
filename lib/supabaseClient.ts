// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// Use environment variables if available, otherwise use iwantmariokart42@mailinator.com's project details
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zqyznbtoqmkwmkykqggz.supabase.co'
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxeXpuYnRvcW1rd21reWtxZ2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NzgzNTksImV4cCI6MjA2NTM1NDM1OX0.UIFcRcst4nvOYxqOe4O9T74iLsuXp_2HsULCGunm2H0'

// single export—used everywhere (server & client)
export const supabase = createClient(SUPABASE_URL, ANON_KEY)

// Types for our database tables
export type Chat = {
  id: string
  title: string
  user_id?: string
  anonymous_id?: string
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  chat_id: string
  role: 'user' | 'model'
  content: string
  created_at: string
  updated_at: string
}