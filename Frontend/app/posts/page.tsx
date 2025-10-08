import Link from 'next/link'
import PostsList from '@/components/PostList'

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

      <PostsList />

      
    </div>
  )
}
