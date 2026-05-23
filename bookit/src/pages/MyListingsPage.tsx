import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import API from '../API/api'
import { useAuth } from '../context/AuthContext'
import GlowCard from '../components/GlowCard'

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
	owner_id: number
}

const inp = "w-full bg-[#2a3147] border border-gray-600 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#f5a623] transition"

export default function MyListingsPage() {
	const navigate = useNavigate()
	const { user } = useAuth()
	const [listings, setListings] = useState<Listing[]>([])
	const [loading, setLoading] = useState(true)
	const [showForm, setShowForm] = useState(false)
	const [form, setForm] = useState({
		title: '', city: '', category: 'apartment',
		price_per_night: '', max_guests: '2',
		description: '', image_url: '', amenities: '',
	})
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState('')

	useEffect(() => {
		API.get('/listings/my/')
			.then((res) => setListings(res.data))
			.catch(() => setListings([]))
			.finally(() => setLoading(false))
	}, [])

	const set = (key: string) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
			setForm({ ...form, [key]: e.target.value })

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setSaving(true)
		setError('')
		try {
			const res = await API.post('/listings/', {
				...form,
				price_per_night: parseFloat(form.price_per_night),
				max_guests: parseInt(form.max_guests),
			})
			setListings((prev) => [res.data, ...prev])
			setForm({ title: '', city: '', category: 'apartment', price_per_night: '', max_guests: '2', description: '', image_url: '', amenities: '' })
			setShowForm(false)
		} catch {
			setError('Ошибка добавления. Убедитесь что бэкенд запущен.')
		}
		setSaving(false)
	}

	async function handleDelete(id: number) {
		try {
			await API.delete(`/listings/${id}`)
			setListings((prev) => prev.filter((l) => l.id !== id))
		} catch {
			// ignore
		}
	}

	if (!user) {
		return (
			<div className="min-h-screen bg-[#0f1629] flex items-center justify-center">
				<div className="text-center">
					<p className="text-zinc-400 text-lg">Войдите чтобы продолжить</p>
					<button
						onClick={() => navigate('/login')}
						className="mt-4 text-[#f5a623] hover:underline"
					>
						На главную
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-[#0f1629]">
			<div className="max-w-5xl mx-auto px-6 py-10 md:px-12">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-white text-3xl font-bold">Мои объявления</h1>
						<p className="text-zinc-400 text-sm mt-1">{listings.length} объявлений</p>
					</div>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => setShowForm(!showForm)}
						className="bg-[#f5a623] text-[#0f1629] font-semibold px-6 py-3 rounded-xl hover:bg-[#e09610] transition flex items-center gap-2"
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
						</svg>
						Добавить
					</motion.button>
				</div>

				{/* Add form */}
				<AnimatePresence>
					{showForm && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0 }}
							className="overflow-hidden mb-8"
						>
							<form onSubmit={handleSubmit} className="bg-[#1a2035] border border-white/10 rounded-2xl p-6">
								<h2 className="text-white text-lg font-semibold mb-4">Новое объявление</h2>
								{error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4 text-red-400 text-sm">{error}</div>}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="text-zinc-400 text-sm block mb-1">Название</label>
										<input className={inp} value={form.title} onChange={set('title')} placeholder="Уютная студия в центре" required />
									</div>
									<div>
										<label className="text-zinc-400 text-sm block mb-1">Город</label>
										<input className={inp} value={form.city} onChange={set('city')} placeholder="Москва" required />
									</div>
									<div>
										<label className="text-zinc-400 text-sm block mb-1">Категория</label>
										<select className={inp} value={form.category} onChange={set('category')}>
											<option value="apartment">Квартира</option>
											<option value="house">Дом</option>
											<option value="hotel">Отель</option>
										</select>
									</div>
									<div>
										<label className="text-zinc-400 text-sm block mb-1">Цена / ночь (€)</label>
										<input className={inp} type="number" value={form.price_per_night} onChange={set('price_per_night')} placeholder="89" required />
									</div>
									<div>
										<label className="text-zinc-400 text-sm block mb-1">Макс. гостей</label>
										<input className={inp} type="number" value={form.max_guests} onChange={set('max_guests')} />
									</div>
									<div>
										<label className="text-zinc-400 text-sm block mb-1">Ссылка на изображение</label>
										<input className={inp} value={form.image_url} onChange={set('image_url')} placeholder="https://images.unsplash.com/..." />
									</div>
									<div>
										<label className="text-zinc-400 text-sm block mb-1">Удобства (через запятую)</label>
										<input className={inp} value={form.amenities} onChange={set('amenities')} placeholder="WiFi, Parking, Pool" />
									</div>
									<div className="md:col-span-2">
										<label className="text-zinc-400 text-sm block mb-1">Описание</label>
										<textarea className={`${inp} resize-none`} rows={3} value={form.description} onChange={set('description')} placeholder="Описание объекта..." />
									</div>
								</div>
								<div className="flex gap-3 mt-4">
									<button
										type="submit"
										disabled={saving}
										className="bg-[#f5a623] text-[#0f1629] font-semibold px-6 py-2 rounded-xl hover:bg-[#e09610] transition disabled:opacity-50"
									>
										{saving ? 'Добавление...' : 'Добавить'}
									</button>
									<button
										type="button"
										onClick={() => setShowForm(false)}
										className="border border-white/20 text-white px-6 py-2 rounded-xl hover:bg-white/5 transition"
									>
										Отмена
									</button>
								</div>
							</form>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Listings */}
				{loading ? (
					<div className="text-zinc-400 text-center py-20">Загрузка...</div>
				) : listings.length === 0 ? (
					<div className="text-center py-20">
						<p className="text-zinc-500 text-lg">У вас пока нет объявлений</p>
						<p className="text-zinc-600 text-sm mt-2">Нажмите "Добавить" чтобы создать первое</p>
					</div>
				) : (
					<div className="grid gap-6 sm:grid-cols-2">
						{listings.map((l, i) => (
							<motion.div
								key={l.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: i * 0.08 }}
							>
								<GlowCard
									onClick={() => navigate(`/listing/${l.id}`)}
									className="bg-[#1a2035] rounded-2xl overflow-hidden border border-white/10 relative group"
								>
									{/* Delete button */}
									<motion.button
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.9 }}
										onClick={(e) => { e.stopPropagation(); handleDelete(l.id) }}
										className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
										title="Удалить"
									>
										<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
											<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
										</svg>
									</motion.button>
									{l.image_url && (
										<div className="w-full h-48 overflow-hidden">
											<img src={l.image_url} alt={l.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
										</div>
									)}
									<div className="p-5 flex flex-col gap-2">
										<h3 className="text-white text-lg font-semibold">{l.title}</h3>
										<div className="flex items-center gap-1 text-zinc-400 text-sm">
											<span>📍 {l.city}</span>
										</div>
										<div className="flex items-center gap-2 text-sm">
											<span className="text-[#f5a623] font-semibold">{l.category}</span>
										</div>
										<hr className="border-white/10 mt-2" />
										<div className="flex items-center justify-between mt-1">
											<div className="text-white text-lg font-bold">
												<span className="text-[#f5a623]">€{l.price_per_night}</span>
												<span className="text-zinc-400 text-xs font-normal">/ночь</span>
											</div>
											<button
												onClick={(e) => { e.stopPropagation(); navigate(`/listing/${l.id}`) }}
												className="text-zinc-400 text-sm hover:text-white transition"
											>
												Редактировать →
											</button>
										</div>
									</div>
								</GlowCard>
							</motion.div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
