// auth.ts
import type { NextAuthOptions } from 'next-auth'
import NextAuth from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from './supabaseClient'

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  }),

  providers: [
    CredentialsProvider({
      name: 'Rumer',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[Auth][authorize] Credentials received:', credentials)
        const { email, password } = credentials!

        if (!email || !password) {
          console.error('[Auth][authorize] Missing email or password')
          throw new Error('Email and password are required')
        }

        const { data: user, error } = await supabase
          .from('users')
          .select('id, email, username, hashed_password')
          .eq('email', email)
          .single()

        if (error) {
          console.error('[Auth][authorize] Supabase error:', error)
          throw new Error('Error retrieving user')
        }

        if (!user) {
          console.error('[Auth][authorize] No user found with email:', email)
          throw new Error('No matching user found')
        }

        console.log('[Auth][authorize] User found, validating password')
        const isValid = await bcrypt.compare(password, user.hashed_password)
        if (!isValid) {
          console.error('[Auth][authorize] Invalid password for user:', email)
          throw new Error('Invalid password')
        }

        console.log('[Auth][authorize] Authentication successful, returning user:', { id: user.id, email: user.email, username: user.username });
        return { id: user.id, email: user.email, username: user.username || '' }
      },
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async jwt({ token, user }) {
      console.log('[Auth][jwt] Processing JWT, user:', user, 'current token:', token);
      if (user) {
        token.id = user.id;
        token.email = user.email!;
        // Make username optional
        token.username = user.username || '';
      }
      console.log('[Auth][jwt] Returning token:', token);
      return token;
    },

    async session({ session, token }) {
      console.log('[Auth][session] Creating session from token:', token);
      session.user = {
        id: token.id as string,
        email: token.email as string,
        // Add username to the session user object, with fallback
        username: (token.username as string) || ''
      }
      
      try {
        if (!process.env.SUPABASE_JWT_SECRET) {
          console.error('[Auth][session] SUPABASE_JWT_SECRET is not defined');
        }
        
        session.supabaseAccessToken = jwt.sign(
          { sub: token.id, email: token.email },
          process.env.SUPABASE_JWT_SECRET!,
          { expiresIn: '1h' }
        )
        console.log('[Auth][session] Session created successfully:', session);
      } catch (error) {
        console.error('[Auth][session] Error creating JWT:', error);
      }
      
      return session
    },
  },

  // Use the standard environment variable name expected by NextAuth
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)