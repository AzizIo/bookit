import { motion } from 'framer-motion'

interface TextRevealProps {
	text: string
	className?: string
	delay?: number
}

export default function TextReveal({ text, className = '', delay = 0 }: TextRevealProps) {
	const words = text.split(' ')

	return (
		<span className={className}>
			{words.map((word, i) => (
				<span key={i} className="inline-block overflow-hidden mr-[0.25em]">
					<motion.span
						className="inline-block"
						initial={{ y: '100%', opacity: 0 }}
						whileInView={{ y: 0, opacity: 1 }}
						viewport={{ once: true }}
						transition={{
							duration: 0.5,
							delay: delay + i * 0.08,
							ease: [0.33, 1, 0.68, 1],
						}}
					>
						{word}
					</motion.span>
				</span>
			))}
		</span>
	)
}
