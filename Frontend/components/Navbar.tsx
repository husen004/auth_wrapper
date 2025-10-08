'use client'

import React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <nav className="w-full bg-white shadow sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <Link href="/" className="font-bold text-blue-600 text-xl">Auth Wrapper</Link>
        <div className="flex gap-6">
          <Link href="/content/home" className="hover:text-blue-600">Home</Link>
          <Link href="/content/features" className="hover:text-blue-600">Features</Link>
          <Link href="/content/docs" className="hover:text-blue-600">Docs</Link>
          <Link href="/posts" className="hover:text-blue-600">Posts</Link>
        </div>
        {isAuthenticated ? (
          <div className="flex gap-2">
            <Link href="/user/profile" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Profile</Link>
            <Link href="/posts/my-posts" className="px-4 py-2 rounded border border-blue-600 text-blue-600 hover:bg-blue-50">My Posts</Link>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link href="/auth/sign-in" className="px-4 py-2 rounded border border-blue-600 text-blue-600 hover:bg-blue-50">Login</Link>
            <Link href="/auth/sign-up" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;