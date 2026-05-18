import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [error, setError] = useState('')
	const { register } = useAuth()
	const navigate = useNavigate()

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (password !== confirmPassword) {
			setError('Пароли не совпадают')
			return
		}
		if (password.length < 6) {
			setError('Пароль должен быть не менее 6 символов')
			return
		}
		const err = register(name, email, password)
		if (err) {
			setError(err)
		} else {
			navigate('/')
		}
	}

	return (
		<div className="min-h-screen bg-[#0f1629] flex items-center justify-center px-4">
			<motion.div
				initial={{ opacity: 0, y: 30, scale: 0.95 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.5 }}
				className="bg-[#1a2035] rounded-2xl border border-white/10 p-8 w-full max-w-md"
			>
				<h1 className="text-white text-2xl font-bold text-center mb-8">Регистрация</h1>

				{error && (
					<div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="flex flex-col gap-5">
					<div>
						<label className="text-white text-sm font-semibold block mb-2">Имя</label>
						<div className="relative">
							<span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">👤</span>
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Ваше имя"
								required
								className="w-full bg-[#2a3147] border border-gray-600 rounded-xl pl-11 pr-4 py-3 text-[#ced0d3] text-sm placeholder-zinc-500 focus:border-[#f5a623] focus:outline-none transition"
							/>
						</div>
					</div>

					<div>
						<label className="text-white text-sm font-semibold block mb-2">Email</label>
						<div className="relative">
							<span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">✉</span>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="your@email.com"
								required
								className="w-full bg-[#2a3147] border border-gray-600 rounded-xl pl-11 pr-4 py-3 text-[#ced0d3] text-sm placeholder-zinc-500 focus:border-[#f5a623] focus:outline-none transition"
							/>
						</div>
					</div>

					<div>
						<label className="text-white text-sm font-semibold block mb-2">Пароль</label>
						<div className="relative">
							<span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">🔒</span>
							<input
								type={showPassword ? 'text' : 'password'}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Минимум 6 символов"
								required
								className="w-full bg-[#2a3147] border border-gray-600 rounded-xl pl-11 pr-12 py-3 text-[#ced0d3] text-sm placeholder-zinc-500 focus:border-[#f5a623] focus:outline-none transition"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
							>
								{showPassword ? '🙈' : '👁'}
							</button>
						</div>
					</div>

					<div>
						<label className="text-white text-sm font-semibold block mb-2">Подтвердите пароль</label>
						<div className="relative">
							<span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">🔒</span>
							<input
								type={showPassword ? 'text' : 'password'}
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="Повторите пароль"
								required
								className="w-full bg-[#2a3147] border border-gray-600 rounded-xl pl-11 pr-4 py-3 text-[#ced0d3] text-sm placeholder-zinc-500 focus:border-[#f5a623] focus:outline-none transition"
							/>
						</div>
					</div>

					<button
						type="submit"
						className="w-full bg-[#f5a623] text-[#0f1629] font-bold py-3 rounded-xl hover:bg-[#e09610] transition active:scale-95 text-lg"
					>
						Зарегистрироваться
					</button>
				</form>

				<div className="flex items-center gap-4 my-6">
					<hr className="flex-1 border-white/10" />
					<span className="text-zinc-500 text-sm">или</span>
					<hr className="flex-1 border-white/10" />
				</div>

				<button className="w-full bg-[#2a3147] border border-gray-600 text-white font-semibold py-3 rounded-xl hover:bg-[#354060] transition flex items-center justify-center gap-3">
					<svg className="w-5 h-5" viewBox="0 0 24 24">
						<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
						<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
						<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
						<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
					</svg>
					Войти через Google
				</button>

				<p className="text-center text-zinc-400 text-sm mt-6">
					Уже есть аккаунт?{' '}
					<Link to="/login" className="text-[#f5a623] font-semibold hover:underline">
						Войти
					</Link>
				</p>
			</motion.div>
		</div>
	)
}
