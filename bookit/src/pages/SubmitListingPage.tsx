import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import API from '../API/api'
import { useAuth } from '../context/AuthContext'

const inp = "w-full bg-[#2a3147] border border-gray-600 rounded-xl px-4 py-3 text-sm text-[#ced0d3] outline-none focus:border-[#f5a623] transition placeholder-zinc-500"

export default function SubmitListingPage() {
	const navigate = useNavigate()
	const { user } = useAuth()
	const [form, setForm] = useState({
		title: '', city: '', category: 'apartment',
		price_per_night: '', max_guests: '2',
		description: '', image_url: '', amenities: '',
	})
	const [saving, setSaving] = useState(false)
	const [success, setSuccess] = useState(false)
	const [error, setError] = useState('')

	const set = (key: string) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
			setForm({ ...form, [key]: e.target.value })

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setSaving(true)
		setError('')
		try {
			await API.post('/listings/', {
				...form,
				price_per_night: parseFloat(form.price_per_night),
				max_guests: parseInt(form.max_guests),
			})
			setSuccess(true)
		} catch {
			setError('Ошибка отправки. Убедитесь что бэкенд запущен.')
		}
		setSaving(false)
	}

	if (!user) {
		return (
			<div className="min-h-screen bg-[#0f1629] flex items-center justify-center">
				<div className="text-center">
					<p className="text-zinc-400 text-lg">Войдите чтобы добавить объявление</p>
					<button onClick={() => navigate('/login')} className="mt-4 text-[#f5a623] hover:underline">Войти</button>
				</div>
			</div>
		)
	}

	if (success) {
		return (
			<div className="min-h-screen bg-[#0f1629] flex items-center justify-center px-4">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="text-center"
				>
					<div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
						<svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<h2 className="text-white text-2xl font-semibold mb-2">Объявление отправлено!</h2>
					<p className="text-zinc-400 mb-8">Ваше объявление отправлено на модерацию. Администратор рассмотрит его в ближайшее время.</p>
					<div className="flex gap-4 justify-center">
						<button onClick={() => { setSuccess(false); setForm({ title: '', city: '', category: 'apartment', price_per_night: '', max_guests: '2', description: '', image_url: '', amenities: '' }) }} className="border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/5 transition font-medium">
							Добавить ещё
						</button>
						<button onClick={() => navigate('/user')} className="bg-[#f5a623] text-[#0f1629] px-6 py-3 rounded-xl hover:bg-[#e09610] transition font-semibold">
							Мой профиль
						</button>
					</div>
				</motion.div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-[#0f1629] flex items-center justify-center px-4 py-10">
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="bg-[#1a2035] rounded-2xl border border-white/10 p-8 w-full max-w-xl"
			>
				<h1 className="text-white text-2xl font-bold mb-2">Разместить объявление</h1>
				<p className="text-zinc-400 text-sm mb-6">Заполните форму — после проверки администратором объявление появится на сайте</p>

				{error && (
					<div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<div>
						<label className="text-zinc-400 text-sm block mb-1">Название</label>
						<input className={inp} value={form.title} onChange={set('title')} placeholder="Уютная студия в центре" required />
					</div>

					<div className="grid grid-cols-2 gap-3">
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
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="text-zinc-400 text-sm block mb-1">Цена / ночь (€)</label>
							<input className={inp} type="number" value={form.price_per_night} onChange={set('price_per_night')} placeholder="89" required />
						</div>
						<div>
							<label className="text-zinc-400 text-sm block mb-1">Макс. гостей</label>
							<input className={inp} type="number" value={form.max_guests} onChange={set('max_guests')} />
						</div>
					</div>

					<div>
						<label className="text-zinc-400 text-sm block mb-1">Ссылка на изображение</label>
						<input className={inp} value={form.image_url} onChange={set('image_url')} placeholder="https://images.unsplash.com/..." />
					</div>

					<div>
						<label className="text-zinc-400 text-sm block mb-1">Удобства (через запятую)</label>
						<input className={inp} value={form.amenities} onChange={set('amenities')} placeholder="WiFi, Parking, Pool" />
					</div>

					<div>
						<label className="text-zinc-400 text-sm block mb-1">Описание</label>
						<textarea className={`${inp} resize-none`} rows={3} value={form.description} onChange={set('description')} placeholder="Расскажите об объекте..." />
					</div>

					<button
						type="submit"
						disabled={saving}
						className="w-full bg-[#f5a623] text-[#0f1629] font-bold py-3 rounded-xl hover:bg-[#e09610] transition active:scale-95 text-lg disabled:opacity-50 mt-2"
					>
						{saving ? 'Отправка...' : 'Отправить на модерацию'}
					</button>
				</form>
			</motion.div>
		</div>
	)
}
