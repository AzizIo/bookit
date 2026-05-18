import { useEffect, useRef, useState } from 'react'
import { useInView, motion, useMotionValue, useSpring } from 'framer-motion'

interface AnimatedCounterProps {
	target: number
	duration?: number
	suffix?: string
	prefix?: string
	className?: string
}

export default function AnimatedCounter({ target, duration = 2, suffix = '', prefix = '', className = '' }: AnimatedCounterProps) {
	const ref = useRef<HTMLSpanElement>(null)
	const isInView = useInView(ref, { once: true, margin: '-50px' })
	const motionVal = useMotionValue(0)
	const springVal = useSpring(motionVal, { duration: duration * 1000 })
	const [display, setDisplay] = useState(0)

	useEffect(() => {
		if (isInView) {
			motionVal.set(target)
		}
	}, [isInView, motionVal, target])

	useEffect(() => {
		const unsubscribe = springVal.on('change', (v) => {
			setDisplay(Math.round(v))
		})
		return unsubscribe
	}, [springVal])

	return (
		<motion.span
			ref={ref}
			className={className}
			initial={{ opacity: 0, y: 20 }}
			animate={isInView ? { opacity: 1, y: 0 } : {}}
			transition={{ duration: 0.5 }}
		>
			{prefix}{display.toLocaleString()}{suffix}
		</motion.span>
	)
}
