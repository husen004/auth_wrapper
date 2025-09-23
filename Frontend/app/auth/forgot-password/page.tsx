'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod'

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

const ForgotPasswordPage = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Partial<Record<keyof ForgotPasswordValues, string>>>({})
  const [loading, setLoading] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setGeneralError(null)

    try {
      // Validate email with Zod
      forgotPasswordSchema.parse({ email })
      
      // Show loading state
      setLoading(true)

      // Call password reset API
      try {
        const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        })

        if (!response.ok) {
          const contentType = response.headers.get('content-type')
          let errorMessage
          
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json()
            errorMessage = errorData.message || 'Failed to send password reset email'
          } else {
            errorMessage = await response.text()
          }
          throw new Error(errorMessage)
        }

        // Show success message
        setSuccess(true)
      } catch (error) {
        console.error('Password reset error:', error)
        if (error instanceof Error) {
          setGeneralError(error.message)
        } else {
          setGeneralError('An unexpected error occurred')
        }
      } finally {
        setLoading(false)
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Set form validation errors
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path[0] as keyof ForgotPasswordValues] = err.message
          }
        })
        setErrors(fieldErrors)
      } else if (error instanceof Error) {
        setGeneralError(error.message)
      }
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>
        
        {success ? (
          <div className="bg-green-50 p-4 rounded-md mb-6">
            <p className="text-green-700 text-center">
              If an account exists with this email, we&#39;ve sent password reset instructions.
            </p>
          </div>
        ) : (
          <>
            {generalError && (
              <div className="bg-red-50 p-4 rounded-md mb-6">
                <p className="text-red-700 text-center">{generalError}</p>
              </div>
            )}
            
            <p className="text-gray-600 mb-6 text-center">
              Enter your email and we&#39;ll send you instructions to reset your password.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-600 text-white p-2 rounded-md font-medium ${
                  loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
        
        <div className="mt-6 text-center">
          <Link href="/auth/sign-in" className="text-blue-600 hover:text-blue-500">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage