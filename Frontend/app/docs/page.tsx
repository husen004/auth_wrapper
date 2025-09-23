'use client'

import React from 'react'
import { motion } from 'framer-motion'

const sections = [
	{
		title: 'Getting Started',
		description:
			'Learn how to set up and configure the authentication wrapper for your project in minutes.',
		icon: '🚀',
	},
	{
		title: 'API Reference',
		description:
			'Detailed documentation for all available endpoints, request/response formats, and error codes.',
		icon: '📚',
	},
	{
		title: 'Authentication Flow',
		description:
			'Understand how JWT, refresh tokens, and protected routes work together for secure access.',
		icon: '🔒',
	},
	{
		title: 'Examples',
		description:
			'Ready-to-use code snippets and integration guides for React, Next.js, and more.',
		icon: '💡',
	},
	{
		title: 'FAQ',
		description:
			'Find answers to common questions and troubleshooting tips.',
		icon: '❓',
	},
	{
		title: 'Changelog',
		description:
			'Track releases, fixes, and improvements to the auth wrapper with version notes and migration tips.',
		icon: '📝',
	},
]

const containerVariants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.18,
		},
	},
}

const cardVariants = {
	hidden: { opacity: 0, y: 40, scale: 0.95 },
	show: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { type: "spring" as const, stiffness: 80 },
	},
}

const DocsPage = () => {
	return (
		<div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-4">
			{/* Animated Hero */}
			<motion.div
				initial={{ opacity: 0, y: -30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7 }}
				className="max-w-3xl mx-auto text-center mb-16"
			>
				<motion.h1
					initial={{ scale: 0.95 }}
					animate={{ scale: 1 }}
					transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
					className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4"
				>
					Documentation
				</motion.h1>
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5, duration: 0.7 }}
					className="text-lg text-gray-600"
				>
					Everything you need to build secure, modern authentication into your
					apps.
				</motion.p>
			</motion.div>

			{/* Animated Docs Sections */}
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="show"
				className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
			>
				{sections.map((section) => (
					<motion.div
						key={section.title}
						variants={cardVariants}
						whileHover={{
							scale: 1.04,
							boxShadow: '0 8px 32px rgba(80,80,200,0.15)',
						}}
						className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center transition-all duration-200"
					>
						<motion.div
							initial={{ rotate: 0 }}
							whileHover={{ rotate: 10 }}
							transition={{ type: 'spring', stiffness: 200 }}
							className="text-5xl mb-4"
						>
							{section.icon}
						</motion.div>
						<h2 className="text-xl font-bold text-blue-700 mb-2">
							{section.title}
						</h2>
						<p className="text-gray-600">{section.description}</p>
					</motion.div>
				))}
			</motion.div>

			{/* Animated Call to Action */}
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3, duration: 0.7 }}
				viewport={{ once: true }}
				className="max-w-2xl mx-auto mt-20 text-center"
			>
				<motion.a
					href="/"
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.97 }}
					className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg transition-all duration-200"
				>
					Back to Home
				</motion.a>
			</motion.div>
		</div>
	)
}

export default DocsPage