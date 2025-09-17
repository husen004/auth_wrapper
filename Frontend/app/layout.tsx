import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React, { ReactNode } from "react";
import Navbar from "../components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Auth Wrapper",
  description: "A simple authentication wrapper example using Next.js and NextAuth.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex flex-col bg-slate-50">
          <Navbar />
          <main className="min-h-[100vh] flex-1 container mx-auto px-4 py-8">{children}</main>
          <footer className="bg-white border-t py-4 text-center text-gray-500">
            © {new Date().getFullYear()} Auth Wrapper. All rights reserved.
          </footer>
        </div>
      </body>
    </html>
  );
}
