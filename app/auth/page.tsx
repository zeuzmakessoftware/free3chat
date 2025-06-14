'use client'

import { useState, FormEvent, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [theme, setTheme] = useState('light')
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const darkPref = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
    if (saved) {
      setTheme(saved);
    } else if (darkPref) {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    if (isSignUp) {
      if (!fullName.trim()) {
        setError('Full name is required for sign up.')
        setIsLoading(false)
        return
      }
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, fullName }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Something went wrong during sign up.')
        }

        const signInResponse = await signIn('credentials', {
          redirect: false,
          email,
          password,
        })

        if (signInResponse?.error) {
          setError(`Sign up successful, but auto sign-in failed: ${signInResponse.error}`)
        } else if (signInResponse?.ok) {
          router.push('/')
        } else {
           setError('Sign up successful. Please sign in.');
           setIsSignUp(false);
        }
      } catch (err: unknown) {
        setError((err as Error).message)
      }
    } else {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError(result.error === "CredentialsSignin" ? "Invalid email or password." : result.error)
      } else if (result?.ok) {
        router.push('/')
      }
    }
    setIsLoading(false)
  }

  const inputClasses = `w-full appearance-none rounded-md border px-3 py-2.5 shadow-sm focus:outline-none focus:ring-2 ${
    theme === 'dark' 
    ? 'border-white/20 bg-white/5 placeholder-gray-500 focus:ring-pink-400' 
    : 'border-pink-300/50 bg-white/50 placeholder-gray-400 focus:ring-pink-500'
  }`;

  return (
    <div className={`flex min-h-screen w-full items-center justify-center px-4 ${theme === 'dark' ? 'bg-[#1C151A]' : 'bg-[#F2E1F4]'}`}>
      <div className={`w-full max-w-md rounded-xl p-8 shadow-2xl ${theme === 'dark' ? 'bg-[#211C26] border border-white/10' : 'bg-[#FBF5FA] border border-pink-300/20'}`}>
        <div>
          <h2 className={`text-center !text-4xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {isSignUp ? 'Create a New Account' : 'Welcome Back'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {isSignUp && (
            <div>
              <label htmlFor="fullName" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required={isSignUp}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className={inputClasses}
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClasses}
              />
            </div>
          </div>
          
          {error && <p className="text-center text-sm text-red-500">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex w-full justify-center rounded-md px-3 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                theme === 'dark'
                  ? 'bg-pink-600 hover:bg-pink-700 focus-visible:outline-pink-500'
                  : 'bg-pink-500 hover:bg-pink-600 focus-visible:outline-pink-600'
              }`}
            >
              {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className={`font-medium underline hover:text-opacity-80 transition-colors ${
              theme === 'dark' ? 'text-pink-400' : 'text-pink-600'
            }`}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthPage