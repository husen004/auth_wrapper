import React from "react";
import Link from "next/link";

const Navbar: React.FC = () => (
  <nav className="w-full bg-white shadow sticky top-0 z-50">
    <div className="container mx-auto flex items-center justify-between py-3 px-4">
      <Link href="/" className="font-bold text-blue-600 text-xl">Auth Wrapper</Link>
      <div className="flex gap-6">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <Link href="/features" className="hover:text-blue-600">Features</Link>
        <Link href="/docs" className="hover:text-blue-600">Docs</Link>
      </div>
      <div className="flex gap-2">
        <Link href="/login" className="px-4 py-2 rounded border border-blue-600 text-blue-600 hover:bg-blue-50">Login</Link>
        <Link href="/register" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Register</Link>
      </div>
    </div>
  </nav>
);

export default Navbar;