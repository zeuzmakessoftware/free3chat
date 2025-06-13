// types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      username?: string | null // Add username here
    } & DefaultSession['user']
    supabaseAccessToken: string
  }

  interface User extends DefaultUser {
    id: string
    username?: string | null // Add username here
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string | null
    email: string | null
  }
}