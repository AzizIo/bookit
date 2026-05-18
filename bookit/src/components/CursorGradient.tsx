import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface CursorGradientProps {
	color1?: string
	color2?: string
	size?: number
}

export default function CursorGradient({ color1 = '#f5a623', color2 = '#e84393', size = 500 }: CursorGradientProps) {
	const [visible, setVisible] = useState(false)
	const mouseX = useMotionValue(-500)
	const mouseY = useMotionValue(-500)

	const springX = useSpring(mouseX, { damping: 25, stiffness: 150 })
	const springY = useSpring(mouseY, { damping: 25, stiffness: 150 })

	useEffect(() => {
		function handleMove(e: MouseEvent) {
			mouseX.set(e.clientX - size / 2)
			mouseY.set(e.clientY - size / 2)
			if (!visible) setVisible(true)
		}
		function handleLeave() {
			setVisible(false)
		}
		window.addEventListener('mousemove', handleMove)
		document.addEventListener('mouseleave', handleLeave)
		return () => {
			window.removeEventListener('mousemove', handleMove)
			document.removeEventListener('mouseleave', handleLeave)
		}
	}, [mouseX, mouseY, size, visible])

	return (
		<motion.div
			className="pointer-events-none fixed inset-0 z-0"
			style={{ opacity: visible ? 1 : 0 }}
		>
			<motion.div
				style={{
					position: 'fixed',
					left: springX,
					top: springY,
					width: size,
					height: size,
					borderRadius: '50%',
					background: `radial-gradient(circle, ${color1}12 0%, ${color2}08 40%, transparent 70%)`,
					filter: 'blur(40px)',
					pointerEvents: 'none',
				}}
			/>
		</motion.div>
	)
}
