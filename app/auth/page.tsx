'use client'

import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

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
          headers: {
            'Content-Type': 'application/json',
          },
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

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", color: "#333" }}>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
      <form onSubmit={handleSubmit}>
        {isSignUp && (
          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="fullName" style={{ display: "block", marginBottom: "5px", color: "#555" }}>Full Name:</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required={isSignUp}
              style={{ width: "100%", padding: "10px", boxSizing: "border-box", border: "1px solid #ddd", borderRadius: "4px" }}
              placeholder="John Doe"
            />
          </div>
        )}
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: "5px", color: "#555" }}>Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", boxSizing: "border-box", border: "1px solid #ddd", borderRadius: "4px" }}
            placeholder="you@example.com"
          />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="password" style={{ display: "block", marginBottom: "5px", color: "#555" }}>Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", boxSizing: "border-box", border: "1px solid #ddd", borderRadius: "4px" }}
            placeholder="••••••••"
          />
        </div>
        {error && <p style={{ color: "red", textAlign: "center", marginBottom: "15px" }}>{error}</p>}
        <button 
          type="submit" 
          disabled={isLoading} 
          style={{ 
            width: "100%", 
            padding: "12px", 
            backgroundColor: isLoading ? "#aaa" : "#0070f3", 
            color: "white", 
            border: "none", 
            borderRadius: "4px", 
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: "16px"
          }}
        >
          {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </button>
      </form>
      <button 
        onClick={() => {
          setIsSignUp(!isSignUp);
          setError(null);
        }} 
        style={{ 
          marginTop: "15px", 
          background: "none", 
          border: "none", 
          color: "#0070f3", 
          cursor: "pointer", 
          textDecoration: "underline",
          display: "block",
          width: "100%",
          textAlign: "center"
        }}
      >
        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
      </button>
    </div>
  )
}

export default AuthPage