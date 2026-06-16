import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../API/api'
import Bug from '../components/bug'
import GlowCard from '../components/GlowCard'
import { useAuth } from '../context/AuthContext'


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
	average_rating?: number
	reviews_count?: number
}

interface Review {
	id: number
	listing_id: number
	user_id: number | null
	rating: number
	comment: string
	user_name?: string
	created_at?: string
	date?: string
}

const amenityData: Record<string, { icon: string; label: string }> = {
	WiFi: { icon: '📶', label: 'Высокоскоростной WiFi' },
	Projector: { icon: '🖥️', label: 'Проектор 4K' },
	Coffee: { icon: '☕', label: 'Кофе и чай' },
	Whiteboard: { icon: '📋', label: 'Маркерная доска' },
	Parking: { icon: '🅿️', label: 'Парковка' },
	Kitchen: { icon: '🍳', label: 'Кухня' },
	Pool: { icon: '🏊', label: 'Бассейн' },
}

const fadeUp = {
	hidden: { opacity: 0, y: 30 },
	visible: (i: number) => ({
		opacity: 1,
		y: 0,
		transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
	}),
}

export default function ListingPage() {
	const { id } = useParams()
	const navigate = useNavigate()
	const { user } = useAuth()
	const [checkIn, setCheckIn] = useState('');
	const [checkOut, setCheckOut] = useState('');
	const [listing, setListing] = useState<Listing | null>(null)
	const [loading, setLoading] = useState(true)
	const [reviews, setReviews] = useState<Review[]>([])
	const [avgRating, setAvgRating] = useState<number | null>(null)
	const [reviewsCount, setReviewsCount] = useState<number | null>(null)
	const [selectedImage, setSelectedImage] = useState(0)
	const [guests, setGuests] = useState(1)
	const [editing, setEditing] = useState(false)
	const [date, setDate] = useState('')
	const [editForm, setEditForm] = useState({
		title: '', city: '', category: '', price_per_night: '',
		max_guests: '', description: '', image_url: '', amenities: '',
	})
	const [saving, setSaving] = useState(false)
	const [isFavorite, setIsFavorite] = useState(false)
	const [listingtime, setListingTime] = useState(0)
	// проверяем при загрузке
	useEffect(() => {
		async function checkFavorite() {
			if (!listing) return
			const { data: freshUser } = await API.get('/auth/me')
			const favs = freshUser.favorite_listings?.split(',') || []
			setIsFavorite(favs.includes(String(listing.id)))
		}
		checkFavorite()
	}, [listing])


	async function toggleFavorite() {
		if (!user) return navigate('/login')
		const { data } = await API.post(`/users/favorites/${listing!.id}`)
		setIsFavorite(data.added)
	}
	async function bookingRequest(listingId) {
		const nights = Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000);
		const nightLabel = nights === 1 ? 'ночь' : nights < 5 ? 'ночи' : 'ночей';
		try {

			await API.post(`/bookings/${listingId}`)
			navigate('/pay', {
				state: {
					listing,
					guests,
					date,
					hours: listingtime,
					total: listing.price_per_night * nights,
					checkIn,
					checkOut


				}
			})
		} catch (error) {
			console.error(error)
		}
	}
	useEffect(() => {
		API.get(`/listings/${id}`)
			.then((res) => {
				setListing(res.data)
				setAvgRating(res.data.average_rating ?? res.data.average_rating)
				setReviewsCount(res.data.reviews_count ?? res.data.reviews_count)
				setEditForm({
					title: res.data.title,
					city: res.data.city,
					category: res.data.category,
					price_per_night: String(res.data.price_per_night),
					max_guests: String(res.data.max_guests),
					description: res.data.description,
					image_url: res.data.image_url,
					amenities: res.data.amenities,
				})
			})
			.catch(() => navigate('/booking'))
			.finally(() => setLoading(false))
	}, [id, navigate])

	useEffect(() => {
		async function fetchReviews() {
			if (!id) return
			try {
				const r = await API.get(`/reviews/${id}`)
				const fetchedReviews = Array.isArray(r.data) ? r.data : []
				setReviews(fetchedReviews)
				setReviewsCount(fetchedReviews.length)
			} catch (e) {
				// fallback: ignore
			}
		}
		fetchReviews()
	}, [id])

	useEffect(() => {
		async function fetchRating() {
			if (!id) return
			try {
				const r = await API.get(`/listings/${id}/rating`)
				if (r?.data) {
					setAvgRating(r.data.average_rating ?? r.data.average ?? null)
					setReviewsCount(r.data.reviews_count ?? r.data.count ?? reviewsCount)
				}
			} catch (e) {
				// ignore
			}
		}
		fetchRating()
	}, [id])

	async function handleSave() {
		if (!listing) return
		setSaving(true)
		try {
			const res = await API.put(`/listings/${listing.id}`, {
				...editForm,
				price_per_night: parseFloat(editForm.price_per_night),
				max_guests: parseInt(editForm.max_guests),
			})
			setListing(res.data)
			setEditing(false)
		} catch { /* ignore */ }
		setSaving(false)
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-[#0f1629] flex items-center justify-center">
				<motion.div
					animate={{ rotate: 360 }}
					transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
					className="w-10 h-10 border-3 border-[#f5a623] border-t-transparent rounded-full"
				/>
			</div>
		)
	}

	if (!listing) return null

	const images = listing.image_url
		? [listing.image_url, listing.image_url, listing.image_url, listing.image_url]
		: []
	const amenities = listing.amenities.split(',').map((a) => a.trim()).filter(Boolean)
	const isAdmin = user?.role === 'admin'

	const setEdit = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
		setEditForm({ ...editForm, [key]: e.target.value })

	const inp = "w-full bg-[#2a3147] border border-gray-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#f5a623]"

	return (
		<div className="min-h-screen bg-[#0f1629]">
			<div className="max-w-6xl mx-auto px-4 py-8 md:px-8">
				{/* Back button */}
				<motion.button
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					onClick={() => navigate('/booking')}
					className="flex items-center gap-2 text-zinc-400 hover:text-white transition mb-6"
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
					</svg>
					Назад к бронированию
				</motion.button>

				{/* Title + admin edit */}
				<div className="flex items-start justify-between mb-2">
					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-white text-3xl md:text-4xl font-bold"
					>
						{listing.title}
					</motion.h1>
					{isAdmin && !editing && (
						<motion.button
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
							onClick={() => setEditing(true)}
							className="bg-[#f5a623] text-[#0f1629] p-2 rounded-xl hover:bg-[#e09610] transition"
							title="Редактировать"
						>
							<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
							</svg>
						</motion.button>
					)}
				</div>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.1 }}
					className="flex items-center gap-4 mb-8"
				>
					<div className="flex items-center gap-1">
						<span className="text-yellow-400">★</span>
						<span className="text-white font-semibold">{((avgRating ?? listing.average_rating) ?? 0).toFixed(1)}</span>
						<span className="text-zinc-400 text-sm">({(reviewsCount ?? listing.reviews_count ?? reviews.length) || 0} отзывов)</span>
					</div>
					<span className="text-zinc-500">•</span>
					<span className="text-zinc-400 text-sm">📍 {listing.city}</span>
				</motion.div>

				{/* Edit form overlay */}
				<AnimatePresence>
					{editing && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0 }}
							className="bg-[#1a2035] rounded-2xl border border-white/10 p-6 mb-8 overflow-hidden"
						>
							<h2 className="text-white text-lg font-semibold mb-4">Редактирование</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="text-zinc-400 text-sm block mb-1">Название</label>
									<input className={inp} value={editForm.title} onChange={setEdit('title')} />
								</div>
								<div>
									<label className="text-zinc-400 text-sm block mb-1">Город</label>
									<input className={inp} value={editForm.city} onChange={setEdit('city')} />
								</div>
								<div>
									<label className="text-zinc-400 text-sm block mb-1">Категория</label>
									<select className={inp} value={editForm.category} onChange={setEdit('category')}>
										<option value="apartment">Квартира</option>
										<option value="house">Дом</option>
										<option value="hotel">Отель</option>
									</select>
								</div>
								<div>
									<label className="text-zinc-400 text-sm block mb-1">Цена / ночь (€)</label>
									<input className={inp} type="number" value={editForm.price_per_night} onChange={setEdit('price_per_night')} />
								</div>
								<div>
									<label className="text-zinc-400 text-sm block mb-1">Макс. гостей</label>
									<input className={inp} type="number" value={editForm.max_guests} onChange={setEdit('max_guests')} />
								</div>
								<div>
									<label className="text-zinc-400 text-sm block mb-1">Ссылка на изображение</label>
									<input className={inp} value={editForm.image_url} onChange={setEdit('image_url')} />
								</div>
								<div>
									<label className="text-zinc-400 text-sm block mb-1">Удобства (через запятую)</label>
									<input className={inp} value={editForm.amenities} onChange={setEdit('amenities')} />
								</div>
								<div className="md:col-span-2">
									<label className="text-zinc-400 text-sm block mb-1">Описание</label>
									<textarea className={`${inp} resize-none`} rows={3} value={editForm.description} onChange={setEdit('description')} />
								</div>
							</div>
							<div className="flex gap-3 mt-4">
								<button
									onClick={handleSave}
									disabled={saving}
									className="bg-[#f5a623] text-[#0f1629] font-semibold px-6 py-2 rounded-xl hover:bg-[#e09610] transition disabled:opacity-50"
								>
									{saving ? 'Сохранение...' : 'Сохранить'}
								</button>
								<button
									onClick={() => setEditing(false)}
									className="border border-white/20 text-white px-6 py-2 rounded-xl hover:bg-white/5 transition"
								>
									Отмена
								</button>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Main content grid */}
				<div className="flex flex-col lg:flex-row gap-8">
					{/* Left column */}
					<div className="flex-1">
						{/* Image gallery */}
						{images.length > 0 && (
							<motion.div
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.5 }}
							>
								<div className="w-full h-[400px] rounded-2xl overflow-hidden mb-3">
									<AnimatePresence mode="wait">
										<motion.img
											key={selectedImage}
											src={images[selectedImage]}
											alt={listing.title}
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											transition={{ duration: 0.3 }}
											className="w-full h-full object-cover"
										/>
									</AnimatePresence>
								</div>
								<div className="flex gap-3">
									{images.map((img, i) => (
										<motion.button
											key={i}
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											onClick={() => setSelectedImage(i)}
											className={`w-24 h-20 rounded-xl overflow-hidden border-2 transition ${selectedImage === i ? 'border-[#f5a623]' : 'border-transparent opacity-60 hover:opacity-100'}`}
										>
											<img src={img} alt="" className="w-full h-full object-cover" />
										</motion.button>
									))}
								</div>
							</motion.div>
						)}

						{/* About section */}
						<motion.div
							custom={0}
							variants={fadeUp}
							initial="hidden"
							animate="visible"
							className="mt-10"
						>
							<h2 className="text-white text-2xl font-bold mb-4">Об этом пространстве</h2>
							<p className="text-zinc-400 leading-relaxed">
								{listing.description || 'Прекрасно спроектированное современное рабочее пространство. Идеально подходит для командных встреч, презентаций или сосредоточенной работы. Пространство оснащено панорамными окнами, эргономичной мебелью и всеми удобствами для продуктивного дня.'}
							</p>
						</motion.div>

						{/* Amenities */}
						{amenities.length > 0 && (
							<motion.div
								custom={1}
								variants={fadeUp}
								initial="hidden"
								animate="visible"
								className="mt-10"
							>
								<h2 className="text-white text-2xl font-bold mb-4">Удобства</h2>
								<div className="grid grid-cols-2 gap-4">
									{amenities.map((a, i) => {
										const data = amenityData[a] || { icon: '✨', label: a }
										return (
											<motion.div
												key={a}
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: 0.3 + i * 0.08 }}
												className="flex items-center gap-3 bg-[#1a2035] border border-white/10 rounded-xl px-4 py-3"
											>
												<span className="text-[#f5a623] text-xl">{data.icon}</span>
												<span className="text-zinc-300 text-sm">{data.label}</span>
											</motion.div>
										)
									})}
								</div>
							</motion.div>
						)}

						{/* Divider */}
						<hr className="border-white/10 my-10" />

						{/* Reviews */}
						<motion.div
							custom={2}
							variants={fadeUp}
							initial="hidden"
							animate="visible"
						>
							<h2 className="text-white text-2xl font-bold mb-2">Отзывы</h2>
							<div className="flex items-center gap-2 mb-6">
								<span className="text-yellow-400 text-xl">★</span>
								<span className="text-white text-2xl font-bold">{((avgRating ?? listing.average_rating) ?? 0).toFixed(1)}</span>
								<span className="text-zinc-400 text-sm">На основе {(reviewsCount ?? listing.reviews_count ?? reviews.length) || 0} отзывов</span>
							</div>
							<div className="flex flex-col gap-4">
								{reviews.map((review: any, i: number) => {
									const name = review.name || review.user_name || (review.user && review.user.full_name) || 'Пользователь'
									const date = review.date || review.created_at || review.created || ''
									const rating = review.rating ?? review.stars ?? 5
									const text = review.text || review.comment || review.body || ''
									return (
										<motion.div
											key={i}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.5 + i * 0.15 }}
										>
											<GlowCard className="bg-[#1a2035] border border-white/10 rounded-2xl p-5">
												<div className="flex items-center justify-between mb-3">
													<div>
														<p className="text-white font-semibold text-sm">{name}</p>
														<p className="text-zinc-500 text-xs">{date}</p>
													</div>
													<div className="flex gap-0.5">
														{[...Array(Math.max(0, Math.min(5, rating)))].map((_, j) => (
															<span key={j} className="text-yellow-400 text-sm">★</span>
														))}
													</div>
												</div>
												<p className="text-zinc-400 text-sm">{text}</p>
											</GlowCard>
										</motion.div>
									)
								})}
							</div>
						</motion.div>
					</div>

					{/* Right sidebar — Booking card */}
					{/* Right sidebar — Booking card */}
					<motion.div
						initial={{ opacity: 0, x: 30 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.2, duration: 0.5 }}
						className="w-full lg:w-96 shrink-0"
					>
						<div className="bg-[#1a2035] border border-white/10 rounded-2xl p-6 sticky top-8">
							<div className="mb-6">
								<span className="text-[#f5a623] text-3xl font-bold">₽{listing.price_per_night}</span>
								<span className="text-zinc-400 text-sm"> / ночь</span>
							</div>

							{/* Check-in / Check-out */}
							<div className="mb-4 grid grid-cols-2 gap-3">
								<div>
									<label className="text-white text-sm font-semibold block mb-2">Заезд</label>
									<div className="relative">
										<span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">📅</span>
										<input
											type="date"
											value={checkIn}
											min={new Date().toISOString().split('T')[0]}
											onChange={(e) => {
												setCheckIn(e.target.value);
												if (checkOut && e.target.value >= checkOut) setCheckOut('');
											}}
											className="w-full bg-[#2a3147] border border-gray-600 rounded-xl pl-10 pr-2 py-3 text-[#ced0d3] text-sm focus:border-[#f5a623] focus:outline-none transition"
										/>
									</div>
								</div>
								<div>
									<label className="text-white text-sm font-semibold block mb-2">Выезд</label>
									<div className="relative">
										<span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">📅</span>
										<input
											type="date"
											value={checkOut}
											min={checkIn
												? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0]
												: new Date().toISOString().split('T')[0]
											}
											onChange={(e) => setCheckOut(e.target.value)}
											disabled={!checkIn}
											className="w-full bg-[#2a3147] border border-gray-600 rounded-xl pl-10 pr-2 py-3 text-[#ced0d3] text-sm focus:border-[#f5a623] focus:outline-none transition disabled:opacity-40 disabled:cursor-not-allowed"
										/>
									</div>
								</div>
							</div>

							{/* Guests */}
							<div className="mb-6">
								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.97 }}
									onClick={toggleFavorite}
									className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold tracking-wide uppercase transition-all duration-300 mb-4 ${isFavorite
										? 'bg-[#f5a623]/10 border-[#f5a623]/40 text-[#f5a623]'
										: 'bg-transparent border-white/15 text-zinc-300 hover:border-white/30 hover:text-white'
										}`}
								>
									<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
										fill={isFavorite ? '#f5a623' : 'none'}
										stroke={isFavorite ? '#f5a623' : 'currentColor'}
										strokeWidth={1.5}
									>
										<path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
									</svg>
									{isFavorite ? 'В избранном' : 'В избранное'}
								</motion.button>

								<label className="text-white text-sm font-semibold block mb-2">Гости</label>
								<div className="flex items-center gap-4">
									<motion.button
										whileTap={{ scale: 0.9 }}
										onClick={() => setGuests(Math.max(1, guests - 1))}
										className="w-10 h-10 rounded-xl bg-[#2a3147] border border-gray-600 text-white flex items-center justify-center hover:border-[#f5a623] transition text-lg"
									>
										−
									</motion.button>
									<span className="text-white text-lg font-semibold flex-1 text-center">{guests}</span>
									<motion.button
										whileTap={{ scale: 0.9 }}
										onClick={() => setGuests(Math.min(listing.max_guests, guests + 1))}
										className="w-10 h-10 rounded-xl bg-[#2a3147] border border-gray-600 text-white flex items-center justify-center hover:border-[#f5a623] transition text-lg"
									>
										+
									</motion.button>
								</div>
								<p className="text-zinc-500 text-xs mt-1">Максимум: {listing.max_guests} чел.</p>
							</div>

							{/* Total */}
							<div className="mb-4 bg-[#313648] border border-white/4 rounded-xl py-4 px-4">
								{checkIn && checkOut ? (() => {
									const nights = Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000);
									const nightLabel = nights === 1 ? 'ночь' : nights < 5 ? 'ночи' : 'ночей';
									return (
										<div>
											<div className="text-zinc-500 text-sm">₽{listing.price_per_night} × {nights} {nightLabel}</div>
											<hr className="border-zinc-600 my-4" />
											<div className="flex items-center justify-between">
												<div className="font-bold text-white">Итого</div>
												<div className="text-[#f5a623] text-2xl font-bold">{listing.price_per_night * nights}₽</div>
											</div>
										</div>
									);
								})() : (
									<div className="text-zinc-500 text-sm">Выберите даты, чтобы увидеть сумму</div>
								)}
							</div>

							{/* Confirm button */}
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={() => bookingRequest(listing.id)}
								className="w-full bg-[#f5a623] text-[#0f1629] font-bold py-3.5 rounded-xl hover:bg-[#e09610] transition text-lg"
							>
								Подтвердить бронирование
							</motion.button>

							{/* Host info */}
							<div className="mt-6 pt-6 border-t border-white/10">
								<h3 className="text-white font-semibold mb-3">Хозяин</h3>
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-full bg-[#2a3d55] flex items-center justify-center">
										<svg className="w-5 h-5 text-[#f5a623]" fill="currentColor" viewBox="0 0 24 24">
											<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
										</svg>
									</div>
									<div>
										<p className="text-white text-sm font-semibold">Сергей Волков</p>
										<p className="text-zinc-500 text-xs">На платформе с 2023 • ★ Суперхозяин</p>
									</div>
								</div>
								<p className="text-zinc-500 text-xs mt-2">Проверенный хозяин с отличными отзывами и быстрым временем ответа.</p>
								<button className="w-full mt-3 border border-white/20 text-white py-2 rounded-xl text-sm hover:bg-white/5 transition">
									Связаться с хозяином
								</button>
							</div>
						</div>
					</motion.div>
				</div>
			</div>
			<Bug />
		</div>
	)
}
