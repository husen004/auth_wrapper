'use client'

import React from 'react'
import { motion } from 'framer-motion'

const features = [
	{
		title: 'JWT Authentication',
		description:
			'Secure, stateless authentication using JSON Web Tokens with automatic token refresh.',
		icon: '🔐',
		color: 'from-blue-400 to-blue-600',
	},
	{
		title: 'Role-Based Access Control',
		description:
			'Granular permissions system to control user access based on roles and capabilities.',
		icon: '👥',
		color: 'from-purple-400 to-purple-600',
	},
	{
		title: 'Social Login Integration',
		description:
			'Seamless authentication with Google, GitHub, and other popular providers.',
		icon: '🌐',
		color: 'from-green-400 to-green-600',
	},
	{
		title: 'Multi-Factor Authentication',
		description:
			'Enhanced security with optional 2FA using authenticator apps or SMS verification.',
		icon: '🛡️',
		color: 'from-yellow-400 to-yellow-600',
	},
	{
		title: 'User Management',
		description:
			'Complete toolkit for user registration, profile updates, and account recovery.',
		icon: '👤',
		color: 'from-red-400 to-red-600',
	},
	{
		title: 'Audit Logging',
		description:
			'Comprehensive logging of authentication events and security-related activities.',
		icon: '📊',
		color: 'from-teal-400 to-teal-600',
	},
]

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.2,
		},
	},
}

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			type: "spring",
			stiffness: 100,
		},
	},
} as const

const FeaturePage = () => {
	return (
		<div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-20 px-4">
			{/* Hero Section */}
			<section className="text-center mb-20">
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="max-w-3xl mx-auto"
				>
					<motion.h1
						initial={{ scale: 0.9 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
						className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
					>
						Powerful Authentication Features
					</motion.h1>
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4, duration: 0.8 }}
						className="text-xl text-gray-600 mb-8"
					>
						Everything you need to build secure, scalable authentication into your
						applications
					</motion.p>
				</motion.div>
			</section>

			{/* Feature Grid */}
			<motion.section
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
			>
				{features.map((feature, index) => (
					<motion.div
						key={index}
						variants={itemVariants}
						whileHover={{
							scale: 1.05,
							boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
						}}
						className="bg-white rounded-xl overflow-hidden shadow-lg"
					>
						<div className={`h-2 bg-gradient-to-r ${feature.color}`}></div>
						<div className="p-8">
							<div className="text-4xl mb-4">{feature.icon}</div>
							<h3 className="text-xl font-semibold mb-3 text-gray-800">
								{feature.title}
							</h3>
							<p className="text-gray-600">{feature.description}</p>
						</div>
					</motion.div>
				))}
			</motion.section>

			{/* Security Highlight */}
			<motion.section
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				transition={{ duration: 1 }}
				viewport={{ once: true }}
				className="max-w-4xl mx-auto my-24 text-center"
			>
				<motion.div
					initial={{ scale: 0.9, opacity: 0 }}
					whileInView={{ scale: 1, opacity: 1 }}
					transition={{ delay: 0.2, duration: 0.8 }}
					viewport={{ once: true }}
					className="mb-10"
				>
					<div className="inline-block p-4 rounded-full bg-blue-100 mb-6">
						<div className="text-6xl">🔒</div>
					</div>
					<h2 className="text-3xl font-bold mb-4">
						Enterprise-Grade Security
					</h2>
					<p className="text-lg text-gray-600">
						Built with modern security practices to protect your users and data
					</p>
				</motion.div>

				<motion.div
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					className="grid grid-cols-2 md:grid-cols-4 gap-6"
				>
					{[
						{ icon: '🔄', text: 'Automatic Rotations' },
						{ icon: '⚡', text: 'Rate Limiting' },
						{ icon: '🚫', text: 'Brute Force Protection' },
						{ icon: '📱', text: 'Device Tracking' },
					].map((item, i) => (
						<motion.div
							key={i}
							variants={itemVariants}
							className="bg-white p-5 rounded-lg shadow-md"
						>
							<div className="text-2xl mb-2">{item.icon}</div>
							<div className="text-sm font-medium">{item.text}</div>
						</motion.div>
					))}
				</motion.div>
			</motion.section>

			{/* CTA */}
			<motion.section
				initial={{ y: 50, opacity: 0 }}
				whileInView={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.8 }}
				viewport={{ once: true }}
				className="text-center max-w-3xl mx-auto"
			>
				<h2 className="text-2xl font-bold mb-6">
					Ready to secure your application?
				</h2>
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-8 rounded-full font-medium shadow-lg"
				>
					Get Started Now
				</motion.button>
			</motion.section>
		</div>
	)
}

export default FeaturePage