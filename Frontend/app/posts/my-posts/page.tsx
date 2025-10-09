'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Post } from '@/types'

export default function MyPostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMyPosts = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.push('/auth/sign-in?redirect=/posts/my-posts')
        return
      }

      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
        const response = await fetch(`${apiBaseUrl}/api/posts/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('access_token')
            router.push('/auth/sign-in?redirect=/posts/my-posts')
            return
          }
          throw new Error('Failed to fetch your posts')
        }

        const data = await response.json()
        setPosts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchMyPosts()
  }, [router])

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
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete post')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="bg-red-50 p-4 rounded-md text-red-700">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Posts</h1>
        <div className="space-x-4">
          <Link
            href="/posts"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            All Posts
          </Link>
          <Link
            href="/posts/create"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-150 ease-in-out"
          >
            Create New Post
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg mb-4">You haven&apos;t created any posts yet</p>
          <Link
            href="/posts/create"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Create your first post!
          </Link>
        </div>
      ) : (
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
              </div>

              <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
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
      )}
    </div>
  )
}
