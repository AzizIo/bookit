import { useRef, useState } from 'react'

interface GlowTextProps {
	children: React.ReactNode
	className?: string
	glowColor?: string
}

export default function GlowText({ children, className = '', glowColor = '#f5a623' }: GlowTextProps) {
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
		<div
			ref={ref}
			onMouseMove={handleMouseMove}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className={`relative transition-colors duration-300 ${className}`}
			style={{
				backgroundImage: isHovered
					? `radial-gradient(250px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, currentColor 70%)`
					: 'none',
				WebkitBackgroundClip: isHovered ? 'text' : 'unset',
				WebkitTextFillColor: isHovered ? 'transparent' : 'unset',
				backgroundClip: isHovered ? 'text' : 'unset',
				display: 'inline',
			}}
		>
			{children}
		</div>
	)
}
