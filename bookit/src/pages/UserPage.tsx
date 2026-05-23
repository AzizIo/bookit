import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import API from '../API/api'
import { useAuth } from '../context/AuthContext'
import type { User } from '../context/AuthContext'
import GlowCard from '../components/GlowCard'
import Bug from '../components/bug'

interface Listing {
	id: number
	title: string
	city: string
	category: string
	price_per_night: number
	max_guests: number
	description: string
	image_url: string
	amenities: string
	status: string
}

interface UserData {
	id: number
	full_name: string
	email: string
	booking_history: string
	total_hours_booked: number
	favorite_listings: string
	rating: number
}

export default function UserPage() {
	const { user, setUser, logout } = useAuth()
	const navigate = useNavigate()
	const [favorites, setFavorites] = useState<Listing[]>([])
	const [myListings, setMyListings] = useState<Listing[]>([])
	const [activeTab, setActiveTab] = useState('bookings')
	const [userData, setUserData] = useState<UserData | null>(null)
	const [userEmail, setUserEmail] = useState('')
	const [userName, setUserName] = useState('')
	const [saving, setSaving] = useState(false)
	const [saveMsg, setSaveMsg] = useState('')

	const tabs = [
		{ id: 'bookings', label: 'БРОНИРОВАНИЯ' },
		{ id: 'my-listings', label: 'МОИ ОБЪЯВЛЕНИЯ' },
		{ id: 'favorite', label: 'ИЗБРАННОЕ' },
		{ id: 'settings', label: 'НАСТРОЙКИ' },
	]

	async function handleUpdate() {
		setSaving(true)
		setSaveMsg('')
		try {
			const res = await API.put('/users/me', { full_name: userName, email: userEmail })
			const updatedUser: User = {
				...user!,
				full_name: res.data.full_name,
				email: res.data.email,
			}
			setUser(updatedUser)
			setSaveMsg('Сохранено')
		} catch (e: unknown) {
			const err = e as { response?: { data?: { detail?: string } } }
			setSaveMsg(err.response?.data?.detail || 'Ошибка')
		} finally {
			setSaving(false)
			setTimeout(() => setSaveMsg(''), 3000)
		}
	}

	useEffect(() => {
		async function fetchUser() {
			try {
				const { data } = await API.get('/auth/me')
				setUserData(data)
				setUserEmail(data.email)
				setUserName(data.full_name)
			} catch {
				// ignore
			}
		}
		fetchUser()
	}, [])

	useEffect(() => {
		async function fetchFavorites() {
			try {
				const { data: freshUser } = await API.get('/auth/me')
				if (!freshUser?.favorite_listings) return
				const ids = freshUser.favorite_listings.split(',').filter(Boolean).map(Number)
				const results = await Promise.all(ids.map((id: number) => API.get(`/listings/${id}`)))
				setFavorites(results.map((res) => res.data))
			} catch {
				// ignore
			}
		}
		fetchFavorites()
	}, [])

	useEffect(() => {
		API.get('/listings/my/')
			.then((res) => setMyListings(res.data))
			.catch(() => {})
	}, [])

	const initials = user?.full_name
		? user.full_name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
		: '?'

	const bookingCount = userData?.booking_history?.split(',').filter(Boolean).length || 0
	const favoriteCount = userData?.favorite_listings?.split(',').filter(Boolean).length || 0

	return (
		<>
			<Bug />
			<div className="min-h-screen bg-[#0f1629]">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.8 }}
					className="border-b border-white/5"
				>
					<div className="max-w-4xl mx-auto px-6 py-16 md:px-12">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-6">
								<div className="w-16 h-16 rounded-full bg-[#1a2035] border border-[#f5a623]/30 flex items-center justify-center text-[#f5a623] text-lg font-light tracking-widest">
									{initials}
								</div>
								<div>
									<h1 className="text-white text-2xl font-light tracking-wide uppercase">
										{user?.full_name || 'Пользователь'}
									</h1>
									<p className="text-zinc-500 text-sm tracking-wider mt-1">{user?.email}</p>
								</div>
							</div>
							<button
								onClick={() => { logout(); navigate('/') }}
								className="text-zinc-500 text-xs tracking-widest uppercase hover:text-white transition-colors duration-300"
							>
								Выйти
							</button>
						</div>

						{/* Stats row */}
						<div className="flex gap-12 mt-12">
							{[
								{ value: bookingCount, label: 'БРОНИРОВАНИЙ' },
								{ value: myListings.length, label: 'ОБЪЯВЛЕНИЙ' },
								{ value: favoriteCount, label: 'ИЗБРАННЫХ' },
								{ value: userData?.rating?.toFixed(1) || '0.0', label: 'РЕЙТИНГ' },
							].map((stat, i) => (
								<motion.div
									key={i}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
								>
									<div className="text-white text-2xl font-light">{stat.value}</div>
									<div className="text-zinc-600 text-[10px] tracking-[0.2em] mt-1">{stat.label}</div>
								</motion.div>
							))}
						</div>
					</div>
				</motion.div>

				{/* Tabs */}
				<div className="border-b border-white/5">
					<div className="max-w-4xl mx-auto px-6 md:px-12">
						<div className="flex gap-0">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`relative px-6 py-4 text-[11px] tracking-[0.2em] transition-colors duration-300 ${
										activeTab === tab.id
											? 'text-white'
											: 'text-zinc-600 hover:text-zinc-400'
									}`}
								>
									{tab.label}
									{activeTab === tab.id && (
										<motion.div
											layoutId="tab-underline"
											className="absolute bottom-0 left-0 right-0 h-px bg-[#f5a623]"
											transition={{ duration: 0.3 }}
										/>
									)}
								</button>
							))}
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="max-w-4xl mx-auto px-6 md:px-12 py-12">
					<AnimatePresence mode="wait">
						{activeTab === 'bookings' && (
							<motion.div
								key="bookings"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3 }}
							>
								<div className="py-20 text-center">
									<p className="text-zinc-600 text-sm tracking-wider uppercase">Нет активных бронирований</p>
									<button
										onClick={() => navigate('/booking')}
										className="mt-8 text-[11px] tracking-[0.2em] uppercase text-[#0f1629] bg-[#f5a623] px-8 py-3 rounded-xl hover:bg-[#e09610] transition-all duration-300 font-semibold"
									>
										Найти пространство
									</button>
								</div>
							</motion.div>
						)}

						{activeTab === 'favorite' && (
							<motion.div
								key="favorite"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3 }}
							>
								{favorites.length === 0 ? (
									<div className="py-20 text-center">
										<p className="text-zinc-600 text-sm tracking-wider uppercase">Нет избранных мест</p>
										<button
											onClick={() => navigate('/booking')}
											className="mt-8 text-[11px] tracking-[0.2em] uppercase text-[#0f1629] bg-[#f5a623] px-8 py-3 rounded-xl hover:bg-[#e09610] transition-all duration-300 font-semibold"
										>
											Найти пространство
										</button>
									</div>
								) : (
									<div className="grid gap-6 sm:grid-cols-2">
										{favorites.map((l, i) => (
											<motion.div
												key={l.id}
												initial={{ opacity: 0, y: 15 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: i * 0.08, duration: 0.4 }}
											>
												<GlowCard
													onClick={() => navigate(`/listing/${l.id}`)}
													className="bg-[#1a2035] rounded-xl overflow-hidden border border-white/5 cursor-pointer"
												>
													{l.image_url && (
														<div className="w-full h-44 overflow-hidden">
															<img src={l.image_url} alt={l.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
														</div>
													)}
													<div className="p-5">
														<h3 className="text-white text-sm font-semibold">{l.title}</h3>
														<p className="text-zinc-500 text-xs mt-2">{l.city}</p>
														<div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
															<span className="text-[#f5a623] font-bold">€{l.price_per_night}<span className="text-zinc-600 text-xs font-normal ml-1">/ ночь</span></span>
														</div>
													</div>
												</GlowCard>
											</motion.div>
										))}
									</div>
								)}
							</motion.div>
						)}

						{activeTab === 'my-listings' && (
							<motion.div
								key="my-listings"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3 }}
							>
								{myListings.length === 0 ? (
									<div className="py-20 text-center">
										<p className="text-zinc-600 text-sm tracking-wider uppercase">У вас пока нет объявлений</p>
										<button
											onClick={() => navigate('/submit')}
											className="mt-8 text-[11px] tracking-[0.2em] uppercase text-[#0f1629] bg-[#f5a623] px-8 py-3 rounded-xl hover:bg-[#e09610] transition-all duration-300 font-semibold"
										>
											Разместить объявление
										</button>
									</div>
								) : (
									<>
										<div className="flex justify-end mb-4">
											<button
												onClick={() => navigate('/submit')}
												className="text-[11px] tracking-[0.15em] uppercase text-[#f5a623] border border-[#f5a623]/30 px-4 py-2 rounded-lg hover:bg-[#f5a623]/10 transition"
											>
												+ Добавить ещё
											</button>
										</div>
										<div className="grid gap-6 sm:grid-cols-2">
											{myListings.map((l, i) => (
												<motion.div
													key={l.id}
													initial={{ opacity: 0, y: 15 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ delay: i * 0.08 }}
												>
													<GlowCard
														onClick={() => l.status === 'approved' ? navigate(`/listing/${l.id}`) : undefined}
														className={`bg-[#1a2035] rounded-xl overflow-hidden border border-white/5 ${l.status === 'approved' ? 'cursor-pointer' : 'opacity-80'}`}
													>
														{l.image_url && (
															<div className="w-full h-44 overflow-hidden relative">
																<img src={l.image_url} alt={l.title} className="w-full h-full object-cover" />
																<span className={`absolute top-3 right-3 text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full font-medium ${
																	l.status === 'approved' ? 'bg-green-500/90 text-white' :
																	l.status === 'pending' ? 'bg-amber-500/90 text-white' :
																	'bg-red-500/90 text-white'
																}`}>
																	{l.status === 'approved' ? 'Активно' : l.status === 'pending' ? 'На проверке' : 'Отклонено'}
																</span>
															</div>
														)}
														<div className="p-5">
															<h3 className="text-white text-sm font-semibold">{l.title}</h3>
															<p className="text-zinc-500 text-xs mt-2">{l.city}</p>
															<div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
																<span className="text-[#f5a623] font-bold">€{l.price_per_night}<span className="text-zinc-600 text-xs font-normal ml-1">/ ночь</span></span>
															</div>
														</div>
													</GlowCard>
												</motion.div>
											))}
										</div>
									</>
								)}
							</motion.div>
						)}

						{activeTab === 'settings' && (
							<motion.div
								key="settings"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3 }}
							>
								<div className="max-w-md">
									<h2 className="text-zinc-500 text-[10px] tracking-[0.2em] uppercase mb-8">Информация профиля</h2>
									<form onSubmit={(e) => { e.preventDefault(); handleUpdate() }} className="flex flex-col gap-6">
										<div>
											<label className="text-zinc-500 text-[10px] tracking-[0.2em] uppercase block mb-3" htmlFor="fullName">Имя</label>
											<input
												className="w-full bg-transparent border-b border-white/10 text-white text-sm tracking-wide py-3 outline-none focus:border-[#f5a623] transition-colors duration-300 placeholder:text-zinc-700"
												value={userName}
												onChange={(e) => setUserName(e.target.value)}
												type="text"
												id="fullName"
												placeholder="Ваше имя"
											/>
										</div>
										<div>
											<label className="text-zinc-500 text-[10px] tracking-[0.2em] uppercase block mb-3" htmlFor="email">Email</label>
											<input
												className="w-full bg-transparent border-b border-white/10 text-white text-sm tracking-wide py-3 outline-none focus:border-[#f5a623] transition-colors duration-300 placeholder:text-zinc-700"
												value={userEmail}
												onChange={(e) => setUserEmail(e.target.value)}
												type="email"
												id="email"
												placeholder="your@email.com"
											/>
										</div>
										<div className="flex items-center gap-4 mt-4">
											<button
												type="submit"
												disabled={saving}
												className="text-[11px] tracking-[0.2em] uppercase text-[#0f1629] bg-[#f5a623] px-8 py-3 rounded-xl hover:bg-[#e09610] transition-all duration-300 font-semibold disabled:opacity-30"
											>
												{saving ? 'Сохранение...' : 'Сохранить'}
											</button>
											{saveMsg && (
												<motion.span
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													className={`text-xs tracking-wider ${saveMsg === 'Сохранено' ? 'text-green-400' : 'text-red-400'}`}
												>
													{saveMsg}
												</motion.span>
											)}
										</div>
									</form>
								</div>

								<div className="mt-16 pt-12 border-t border-white/5">
									<h2 className="text-zinc-500 text-[10px] tracking-[0.2em] uppercase mb-6">Аккаунт</h2>
									<button
										onClick={() => { logout(); navigate('/') }}
										className="text-[11px] tracking-[0.2em] uppercase text-zinc-500 border border-white/10 px-8 py-3 rounded-xl hover:border-red-500/30 hover:text-red-400 transition-all duration-300"
									>
										Выйти из аккаунта
									</button>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</>
	)
}
