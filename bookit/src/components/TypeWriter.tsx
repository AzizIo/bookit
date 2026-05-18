import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface TypeWriterProps {
	text: string
	className?: string
	speed?: number
	delay?: number
	cursor?: boolean
}

export default function TypeWriter({ text, className = '', speed = 50, delay = 0, cursor = true }: TypeWriterProps) {
	const [displayed, setDisplayed] = useState('')
	const [started, setStarted] = useState(false)

	useEffect(() => {
		const timeout = setTimeout(() => setStarted(true), delay)
		return () => clearTimeout(timeout)
	}, [delay])

	useEffect(() => {
		if (!started) return
		if (displayed.length >= text.length) return
		const timeout = setTimeout(() => {
			setDisplayed(text.slice(0, displayed.length + 1))
		}, speed)
		return () => clearTimeout(timeout)
	}, [displayed, started, text, speed])

	return (
		<span className={className}>
			{displayed}
			{cursor && displayed.length < text.length && (
				<motion.span
					animate={{ opacity: [1, 0] }}
					transition={{ repeat: Infinity, duration: 0.6 }}
					className="inline-block ml-0.5"
				>
					|
				</motion.span>
			)}
		</span>
	)
}
