import { useState } from 'react'
import API from '../API/api'

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

export default function AdminPage() {
	const [listings, setListings] = useState<Listing[]>([])
	const [form, setForm] = useState({
		title: '', city: '', category: 'apartment',
		price_per_night: '', max_guests: '2',
		description: '', image_url: '', amenities: '',
	})

	const set = (key: keyof typeof form) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
			setForm({ ...form, [key]: e.target.value })

	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	async function handleSubmit() {
		setError('')
		setSuccess('')
		try {
			const res = await API.post('/listings/', {
				...form,
				price_per_night: parseFloat(form.price_per_night),
				max_guests: parseInt(form.max_guests),
			})
			setListings((prev) => [res.data, ...prev])
			setForm({ title: '', city: '', category: 'apartment', price_per_night: '', max_guests: '2', description: '', image_url: '', amenities: '' })
			setSuccess('Место добавлено!')
		} catch {
			setError('Ошибка: убедитесь что бэкенд запущен (python main.py на порту 8000)')
		}
	}

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="max-w-lg mx-auto">
				<h1 className="text-2xl font-bold text-gray-800 mb-6">Добавить место</h1>

					{error && <div className="bg-red-100 border border-red-300 rounded-xl px-4 py-3 mb-4 text-red-700 text-sm">{error}</div>}
				{success && <div className="bg-green-100 border border-green-300 rounded-xl px-4 py-3 mb-4 text-green-700 text-sm">{success}</div>}

			<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
					<div>
						<label className="block text-sm text-gray-600 mb-1">Название</label>
						<input className={inp} value={form.title} onChange={set('title')} placeholder="Уютная студия в центре" />
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-sm text-gray-600 mb-1">Город</label>
							<input className={inp} value={form.city} onChange={set('city')} placeholder="Москва" />
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">Категория</label>
							<select className={inp} value={form.category} onChange={set('category')}>
								<option value="apartment">Квартира</option>
								<option value="house">Дом</option>
								<option value="hotel">Отель</option>
							</select>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-sm text-gray-600 mb-1">Цена / ночь (€)</label>
							<input className={inp} type="number" value={form.price_per_night} onChange={set('price_per_night')} placeholder="89" />
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">Макс. гостей</label>
							<input className={inp} type="number" value={form.max_guests} onChange={set('max_guests')} placeholder="2" />
						</div>
					</div>

					{/* Новые поля */}
					<div>
						<label className="block text-sm text-gray-600 mb-1">Ссылка на изображение</label>
						<input className={inp} value={form.image_url} onChange={set('image_url')} placeholder="https://images.unsplash.com/..." />
					</div>

					<div>
						<label className="block text-sm text-gray-600 mb-1">Удобства (через запятую)</label>
						<input className={inp} value={form.amenities} onChange={set('amenities')} placeholder="WiFi, Parking, Pool" />
					</div>

					<div>
						<label className="block text-sm text-gray-600 mb-1">Описание</label>
						<textarea className={`${inp} resize-none`} rows={3} value={form.description} onChange={set('description')} placeholder="Коротко об объекте..." />
					</div>

					<button
						onClick={handleSubmit}
						className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg py-2.5 transition-colors"
					>
						Добавить
					</button>
				</div>

				{listings.length > 0 && (
					<div className="mt-6 space-y-2">
						{listings.map((l) => (
							<div key={l.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex justify-between items-center gap-3">
								{l.image_url && <img src={l.image_url} className="w-12 h-12 rounded-lg object-cover" />}
								<div className="flex-1">
									<p className="text-sm font-medium text-gray-800">{l.title}</p>
									<p className="text-xs text-gray-400">{l.city} · {l.amenities}</p>
								</div>
								<span className="text-sm font-semibold text-gray-700">€{l.price_per_night}</span>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"