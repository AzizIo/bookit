import { motion } from 'framer-motion'

interface AnimatedBorderProps {
	children: React.ReactNode
	className?: string
	borderRadius?: string
}

export default function AnimatedBorder({ children, className = '', borderRadius = '1rem' }: AnimatedBorderProps) {
	return (
		<div className={`relative p-[1px] ${className}`} style={{ borderRadius }}>
			{/* Rotating gradient border */}
			<motion.div
				className="absolute inset-0"
				style={{
					borderRadius,
					background: 'conic-gradient(from 0deg, #f5a623, #e84393, #6c5ce7, #00cec9, #f5a623)',
					opacity: 0.6,
				}}
				animate={{ rotate: 360 }}
				transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
			/>
			{/* Inner content */}
			<div
				className="relative z-10"
				style={{
					borderRadius,
					background: '#1a2035',
				}}
			>
				{children}
			</div>
		</div>
	)
}
