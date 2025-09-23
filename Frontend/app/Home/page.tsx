'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface MOCKPOST {
  id: number;
  title: string;
  excerpt: string;
  author:string;
  date: string;
  likes: number;
  comments: number;
  image: string;

}

const MOCK_POSTS: MOCKPOST[] = [
  {
    id: 1,
    title: "Getting Started with Authentication",
    excerpt: "Learn how to implement secure authentication in your web applications",
    author: "Jane Smith",
    date: "2025-09-18",
    likes: 42,
    comments: 8,
    image: "https://images.unsplash.com/photo-1560732488-6b0df240254a?w=600&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "The Future of Web Development",
    excerpt: "Explore emerging trends that will shape how we build web applications",
    author: "John Doe",
    date: "2025-09-20",
    likes: 37,
    comments: 12,
    image: "https://images.unsplash.com/photo-1533922922960-9fceb9ef4733?w=600&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Mastering JWT Authentication",
    excerpt: "Deep dive into JSON Web Tokens and how to use them effectively",
    author: "Alex Johnson",
    date: "2025-09-21",
    likes: 28,
    comments: 6,
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Building Responsive UIs",
    excerpt: "Tips and tricks for creating interfaces that work on any device",
    author: "Sarah Williams",
    date: "2025-09-22",
    likes: 56,
    comments: 9,
    image: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?w=600&auto=format&fit=crop"
  }
];

const HomePage = () => {
  const [posts, setPosts] = useState<MOCKPOST[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setPosts(MOCK_POSTS);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="rounded-3xl min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Welcome to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-500">
              AuthBlog
            </span>
          </h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="max-w-2xl mx-auto text-xl text-gray-600"
          >
            Explore the latest insights on authentication, security, and web development.
          </motion.p>
        </motion.div>

        {/* Animated Blobs */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, 0],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 15,
            ease: "easeInOut" 
          }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -10, 0],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 20,
            ease: "easeInOut" 
          }}
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
      </section>

      {/* Featured Post */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        {!loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="md:flex">
              <div className="md:flex-shrink-0">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="h-64 w-full object-cover md:w-96"
                  src={posts[0]?.image || "https://images.unsplash.com/photo-1560732488-6b0df240254a?w=600&auto=format&fit=crop"}
                  alt="Featured post"
                />
              </div>
              <div className="p-8">
                <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Featured Post</div>
                <Link href={`/post/${posts[0]?.id}`} className="block mt-1">
                  <p className="text-2xl font-semibold text-gray-900">{posts[0]?.title || "Loading..."}</p>
                </Link>
                <p className="mt-2 text-gray-600">{posts[0]?.excerpt || "Loading..."}</p>
                <div className="mt-4 flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{posts[0]?.author || "Loading..."}</p>
                    <div className="flex space-x-1 text-sm text-gray-500">
                      <time dateTime={posts[0]?.date}>{posts[0]?.date || "Loading..."}</time>
                      <span aria-hidden="true">&middot;</span>
                      <span>{posts[0]?.comments || 0} comments</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </section>

      {/* Post Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Latest Posts</h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.slice(1).map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300"
              >
                <div className="overflow-hidden">
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="h-48 w-full object-cover"
                    src={post.image}
                    alt={post.title}
                  />
                </div>
                <div className="p-6">
                  <Link href={`/post/${post.id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="mt-2 text-sm text-gray-600">{post.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <span>{post.author}</span>
                      <span className="mx-1">&middot;</span>
                      <time dateTime={post.date}>{post.date}</time>
                    </div>
                    <div className="flex space-x-2">
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        className="text-red-500 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {post.likes}
                      </motion.button>
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        className="text-blue-500 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {post.comments}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for the latest posts and updates.
            </p>
            <form className="max-w-md mx-auto">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-3 w-full rounded-md focus:outline-none"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-blue-600 px-6 py-3 rounded-md font-medium"
                >
                  Subscribe
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomePage