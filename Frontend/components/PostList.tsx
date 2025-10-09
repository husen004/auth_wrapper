'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Post } from '@/types'

interface PostListProps {
  endpoint?: string // Custom endpoint (default: /api/posts)
  emptyMessage?: string // Custom message when no posts
  showActions?: boolean // Show edit/delete buttons
  onDeleteSuccess?: () => void // Callback after successful deletion
}

export default function PostList({
  endpoint = '/api/posts',
  emptyMessage = 'No posts available',
  showActions = false,
  onDeleteSuccess,
}: PostListProps) {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('access_token')
        
        const headers: HeadersInit = {
          'Content-Type': 'application/json',   
        }
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
        
        const response = await fetch(`http://localhost:3000/api/posts`, { headers })

        if (!response.ok) {
          throw new Error(
            `Failed to fetch posts: ${response.status} ${response.statusText}`
          )
        }

        const data = await response.json()
        setPosts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [endpoint])

  const handleDeletePost = async (postId: number) => {
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
      const response = await fetch(`${apiBaseUrl}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete post')
      }

      // Remove the deleted post from the state
      setPosts(posts.filter(post => post.id !== postId))
      
      // Call the success callback if provided
      if (onDeleteSuccess) {
        onDeleteSuccess()
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete post')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700">
        <p className="font-medium">Error:</p>
        <p>{error}</p>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <p className="text-gray-500 text-lg mb-4">{emptyMessage}</p>
        <Link
          href="/posts/create"
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          Create a post
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-xl font-semibold text-gray-900">
              <Link
                href={`/posts/${post.id}`}
                className="hover:text-blue-600 transition-colors"
              >
                {post.title}
              </Link>
            </h2>
            {showActions && (
              <div className="flex space-x-2">
                <Link
                  href={`/posts/${post.id}/edit`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>

          <div className="flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{post.username || 'Anonymous'}</span>
              <span>•</span>
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>

            <Link
              href={`/posts/${post.id}`}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Read more →
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
