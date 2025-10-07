'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Post {
  id: number
  title: string
  content: string
  user_id: number
  username?: string
  created_at: string
}

export default function PostsPage() {
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">All Posts</h1>
        <Link
          href="/posts/create"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-150 ease-in-out"
        >
          Create New Post
        </Link>
      </div>

      
    </div>
  )
}
