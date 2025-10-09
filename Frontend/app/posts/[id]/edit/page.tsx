'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'

// Define the post schema for form validation
const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  content: z.string().min(1, 'Content is required'),
})

type PostFormValues = z.infer<typeof postSchema>

interface Post {
  id: number
  title: string
  content: string
  user_id: number
  username?: string
  created_at: string
}

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  })

  useEffect(() => {
    const fetchPost = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.push(`/auth/sign-in?redirect=/posts/${params.id}/edit`)
        return
      }

      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
        const response = await fetch(`${apiBaseUrl}/api/posts/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          if (response.status === 401) {
            router.push(`/auth/sign-in?redirect=/posts/${params.id}/edit`)
            return
          }
          if (response.status === 404) {
            throw new Error('Post not found')
          }
          throw new Error('Failed to fetch post')
        }

        const data = await response.json()
        setPost(data)
        
        // Set form values from post
        reset({
          title: data.title,
          content: data.content,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params.id, router, reset])

  const onSubmit = async (data: PostFormValues) => {
    setGeneralError(null)
    setSubmitting(true)

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.push(`/auth/sign-in?redirect=/posts/${params.id}/edit`)
        return
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
      const response = await fetch(`${apiBaseUrl}/api/posts/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push(`/auth/sign-in?redirect=/posts/${params.id}/edit`)
          return
        }
        if (response.status === 403) {
          throw new Error('You can only edit your own posts')
        }
        
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to update post')
      }

      // Post updated successfully, redirect to view it
      router.push(`/posts/${params.id}`)
    } catch (error) {
      setGeneralError(
        error instanceof Error ? error.message : 'An error occurred while updating the post'
      )
    } finally {
      setSubmitting(false)
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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <Link 
          href={`/posts/${params.id}`} 
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back to post
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Edit Post</h1>

      {generalError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{generalError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="title"
            {...register('title')}
            className={`w-full px-3 py-2 border ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Post title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            id="content"
            {...register('content')}
            rows={10}
            className={`w-full px-3 py-2 border ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Write your post content here..."
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push(`/posts/${params.id}`)}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Update Post'}
          </button>
        </div>
      </form>
    </div>
  )
}
