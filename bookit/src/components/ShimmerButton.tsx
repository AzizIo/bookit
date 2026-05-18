import { motion } from 'framer-motion'

interface ShimmerButtonProps {
	children: React.ReactNode
	className?: string
	onClick?: () => void
}

export default function ShimmerButton({ children, className = '', onClick }: ShimmerButtonProps) {
	return (
		<motion.button
			onClick={onClick}
			whileHover={{ scale: 1.03 }}
			whileTap={{ scale: 0.97 }}
			className={`relative overflow-hidden group ${className}`}
		>
			{/* Shimmer sweep */}
			<span
				className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
				style={{
					background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
				}}
			/>
			<span className="relative z-10">{children}</span>
		</motion.button>
	)
}
