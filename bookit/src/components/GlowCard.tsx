import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface GlowCardProps {
	children: React.ReactNode
	className?: string
	onClick?: () => void
	glowColor?: string
}

export default function GlowCard({ children, className = '', onClick, glowColor = '#f5a623' }: GlowCardProps) {
	const ref = useRef<HTMLDivElement>(null)
	const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
	const [isHovered, setIsHovered] = useState(false)

	function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
		if (!ref.current) return
		const rect = ref.current.getBoundingClientRect()
		setMousePos({
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		})
	}

	return (
		<motion.div
			ref={ref}
			onMouseMove={handleMouseMove}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={onClick}
			whileHover={{ y: -6, transition: { duration: 0.2 } }}
			className={`relative overflow-hidden ${className}`}
			style={{ cursor: onClick ? 'pointer' : 'default' }}
		>
			{/* Cursor glow */}
			<div
				className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
				style={{
					opacity: isHovered ? 1 : 0,
					background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}15, transparent 60%)`,
				}}
			/>
			{/* Border glow */}
			<div
				className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] transition-opacity duration-300"
				style={{
					opacity: isHovered ? 1 : 0,
					background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}40, transparent 60%)`,
					mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
					maskComposite: 'exclude',
					WebkitMaskComposite: 'xor',
					padding: '1px',
				}}
			/>
			<div className="relative z-10">{children}</div>
		</motion.div>
	)
}
