'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth' // Make sure you have this hook
import { Post } from '@/types'

// Post interface - should match your backend model


export default function PostPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
        const response = await fetch(`${apiBaseUrl}/api/posts/${params.id}`)

        if (!response.ok) {
          throw new Error(response.status === 404 ? 'Post not found' : 'Error fetching post')
        }

        const data = await response.json()
        setPost(data)

        // Check if current user is post owner
        const token = localStorage.getItem('access_token')
        if (token) {
          try {
            const userResponse = await fetch(`${apiBaseUrl}/api/auth/me`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })
            
            if (userResponse.ok) {
              const userData = await userResponse.json()
              setIsOwner(userData.id === data.user_id)
            }
          } catch (err) {
            // Silently fail, user is not authenticated or token is invalid
            console.error('Error checking post ownership:', err)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params.id])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.push('/auth/sign-in')
        return
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
      const response = await fetch(`${apiBaseUrl}/api/posts/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete post')
      }

      router.push('/posts')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete post')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 p-4 rounded-md text-red-700">
          <p className="font-medium">Error:</p>
          <p>{error || 'Post not found'}</p>
          <Link href="/posts" className="mt-4 text-blue-600 hover:text-blue-800 block">
            ← Back to all posts
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <Link 
          href="/posts" 
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back to all posts
        </Link>
      </div>
      
      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
          
          <div className="flex items-center text-gray-600 text-sm mb-6">
            <div className="flex items-center">
              <span className="font-medium">{post.username || 'Anonymous'}</span>
              <span className="mx-2">•</span>
              <time dateTime={post.created_at}>
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>
          </div>
          
          {isOwner && (
            <div className="flex gap-3 mb-6">
              <Link
                href={`/posts/${post.id}/edit`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                Edit post
              </Link>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Delete post
              </button>
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            {post.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </article>
    </div>
  )
}
