import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import API from '../API/api'
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

const fakeReviews = [
	{ name: 'Алексей Петров', date: 'Март 2026', rating: 5, text: 'Отличное пространство со всем необходимым. Локация идеальная, а хозяин очень отзывчивый.' },
	{ name: 'Мария Иванова', date: 'Февраль 2026', rating: 5, text: 'Мы провели здесь встречу с клиентами и все были впечатлены. Обязательно забронирую снова!' },
	{ name: 'Дмитрий Козлов', date: 'Январь 2026', rating: 4, text: 'Уютное и современное место. Идеально подходит для работы и переговоров.' },
]

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
	const [listing, setListing] = useState<Listing | null>(null)
	const [loading, setLoading] = useState(true)
	const [selectedImage, setSelectedImage] = useState(0)
	const [guests, setGuests] = useState(1)
	const [editing, setEditing] = useState(false)
	const [editForm, setEditForm] = useState({
		title: '', city: '', category: '', price_per_night: '',
		max_guests: '', description: '', image_url: '', amenities: '',
	})
	const [saving, setSaving] = useState(false)

	useEffect(() => {
		API.get(`/listings/${id}`)
			.then((res) => {
				setListing(res.data)
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
						<span className="text-white font-semibold">4.9</span>
						<span className="text-zinc-400 text-sm">(124 отзыва)</span>
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
								<span className="text-white text-2xl font-bold">4.9</span>
								<span className="text-zinc-400 text-sm">На основе 124 отзывов</span>
							</div>
							<div className="flex flex-col gap-4">
								{fakeReviews.map((review, i) => (
									<motion.div
										key={i}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.5 + i * 0.15 }}
										className="bg-[#1a2035] border border-white/10 rounded-2xl p-5"
									>
										<div className="flex items-center justify-between mb-3">
											<div>
												<p className="text-white font-semibold text-sm">{review.name}</p>
												<p className="text-zinc-500 text-xs">{review.date}</p>
											</div>
											<div className="flex gap-0.5">
												{[...Array(review.rating)].map((_, j) => (
													<span key={j} className="text-yellow-400 text-sm">★</span>
												))}
											</div>
										</div>
										<p className="text-zinc-400 text-sm">{review.text}</p>
									</motion.div>
								))}
							</div>
						</motion.div>
					</div>

					{/* Right sidebar — Booking card */}
					<motion.div
						initial={{ opacity: 0, x: 30 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.2, duration: 0.5 }}
						className="w-full lg:w-96 shrink-0"
					>
						<div className="bg-[#1a2035] border border-white/10 rounded-2xl p-6 sticky top-8">
							<div className="mb-6">
								<span className="text-[#f5a623] text-3xl font-bold">€{listing.price_per_night}</span>
								<span className="text-zinc-400 text-sm"> /ночь</span>
							</div>

							{/* Date */}
							<div className="mb-4">
								<label className="text-white text-sm font-semibold block mb-2">Дата</label>
								<div className="relative">
									<span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">📅</span>
									<input
										type="date"
										className="w-full bg-[#2a3147] border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-[#ced0d3] text-sm focus:border-[#f5a623] focus:outline-none transition"
									/>
								</div>
							</div>

							{/* Time */}
							<div className="mb-4">
								<label className="text-white text-sm font-semibold block mb-2">Время</label>
								<select className="w-full bg-[#2a3147] border border-gray-600 rounded-xl px-4 py-3 text-[#ced0d3] text-sm focus:border-[#f5a623] focus:outline-none transition">
									<option value="">Выберите время</option>
									<option value="09:00">09:00</option>
									<option value="10:00">10:00</option>
									<option value="11:00">11:00</option>
									<option value="12:00">12:00</option>
									<option value="13:00">13:00</option>
									<option value="14:00">14:00</option>
									<option value="15:00">15:00</option>
									<option value="16:00">16:00</option>
									<option value="17:00">17:00</option>
									<option value="18:00">18:00</option>
								</select>
							</div>

							{/* Guests */}
							<div className="mb-6">
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

							{/* Confirm button */}
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
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
		</div>
	)
}
