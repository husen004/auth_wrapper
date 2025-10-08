'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { postSchema } from '@/lib/validation'


type PostFormValues = z.infer<typeof postSchema>

export default function CreatePostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/auth/sign-in?redirect=/posts/create')
    }
  }, [router])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  })

  const onSubmit = async (data: PostFormValues) => {
    setGeneralError(null)
    setLoading(true)

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.push('/auth/sign-in?redirect=/posts/create')
        return
      }

      // Send post data to backend API
      const response = await fetch('http://localhost:8080/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('access_token')
          router.push('/auth/sign-in?redirect=/posts/create')
          return
        }
        
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to create post')
      }

      // Post created successfully, redirect to view it
      const post = await response.json()
      router.push(`/posts/${post.id}`)
    } catch (error) {
      setGeneralError(
        error instanceof Error ? error.message : 'An error occurred while creating the post'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <Link 
          href="/posts" 
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back to posts
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Create New Post</h1>

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
            onClick={() => router.push('/posts')}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  )
}