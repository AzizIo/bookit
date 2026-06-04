import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import API from '../API/api'
import { div } from 'framer-motion/client'

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
	status: string
}
interface Report {
    id: number
    title: string
    porblem: string  // опечатка из БД
    email: string
}
const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#f5a623] bg-white"

export default function AdminPage() {
	const [pending, setPending] = useState<Listing[]>([])
	const [loading, setLoading] = useState(true)
	const [editingId, setEditingId] = useState<number | null>(null)
	const [editForm, setEditForm] = useState<Partial<Listing>>({})
	const [problems, setProblems] = useState([])

	async function fetchPending() {
		setLoading(true)
		try {
			const { data } = await API.get('/admin/pending')
			setPending(data)
		} catch {
			setPending([])
		}
		setLoading(false)
	}
	async function fetchProblem() {
		try {
			const { data } = await API.get("/reports/")
			setProblems(data)
		}
		catch {
			setProblems([])
		}

	}

	useEffect(() => { fetchPending(), fetchProblem() }, [])

	async function handleApprove(id: number) {
		try {
			await API.put(`/admin/listings/${id}/approve`)
			setPending((prev) => prev.filter((l) => l.id !== id))
		} catch {
			// ignore
		}
	}

	async function handleReject(id: number) {
		try {
			await API.put(`/admin/listings/${id}/reject`)
			setPending((prev) => prev.filter((l) => l.id !== id))
		} catch {
			// ignore
		}
	}

	function startEdit(listing: Listing) {
		setEditingId(listing.id)
		setEditForm({
			title: listing.title,
			city: listing.city,
			category: listing.category,
			price_per_night: listing.price_per_night,
			max_guests: listing.max_guests,
			description: listing.description,
			image_url: listing.image_url,
			amenities: listing.amenities,
		})
	}

	async function handleSaveEdit(id: number) {
		try {
			const { data } = await API.put(`/admin/listings/${id}`, editForm)
			setPending((prev) => prev.map((l) => l.id === id ? data : l))
			setEditingId(null)
		} catch {
			// ignore
		}
	}

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="max-w-4xl mx-auto">
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-2xl font-bold text-gray-800">Модерация объявлений</h1>
						<p className="text-gray-500 text-sm mt-1">{pending.length} заявок на проверке</p>
					</div>
					<button
						onClick={fetchPending}
						className="text-sm text-gray-500 hover:text-gray-700 transition flex items-center gap-1"
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
						Обновить
					</button>
				</div>

				{loading ? (
					<p className="text-gray-400 text-center py-20">Загрузка...</p>
				) : pending.length === 0 ? (
					<div className="text-center py-20">
						<svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<p className="text-gray-500 text-lg">Все заявки рассмотрены</p>
						<p className="text-gray-400 text-sm mt-1">Новые заявки появятся когда пользователи отправят объявления</p>
					</div>
				) : (
					<div className="space-y-4">
						<AnimatePresence>
							{pending.map((listing) => (
								<motion.div
									key={listing.id}
									layout
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, x: -100 }}
									className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
								>
									<div className="flex flex-col md:flex-row">
										{/* Image */}
										{listing.image_url && (
											<div className="md:w-48 h-40 md:h-auto flex-shrink-0">
												<img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" />
											</div>
										)}

										{/* Content */}
										<div className="flex-1 p-5">
											{editingId === listing.id ? (
												<div className="space-y-3">
													<div className="grid grid-cols-2 gap-3">
														<div>
															<label className="block text-xs text-gray-500 mb-1">Название</label>
															<input className={inp} value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
														</div>
														<div>
															<label className="block text-xs text-gray-500 mb-1">Город</label>
															<input className={inp} value={editForm.city || ''} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
														</div>
														<div>
															<label className="block text-xs text-gray-500 mb-1">Категория</label>
															<select className={inp} value={editForm.category || ''} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
																<option value="apartment">Квартира</option>
																<option value="house">Дом</option>
																<option value="hotel">Отель</option>
															</select>
														</div>
														<div>
															<label className="block text-xs text-gray-500 mb-1">Цена / ночь (€)</label>
															<input className={inp} type="number" value={editForm.price_per_night || ''} onChange={(e) => setEditForm({ ...editForm, price_per_night: parseFloat(e.target.value) })} />
														</div>
														<div>
															<label className="block text-xs text-gray-500 mb-1">Макс. гостей</label>
															<input className={inp} type="number" value={editForm.max_guests || ''} onChange={(e) => setEditForm({ ...editForm, max_guests: parseInt(e.target.value) })} />
														</div>
														<div>
															<label className="block text-xs text-gray-500 mb-1">Изображение</label>
															<input className={inp} value={editForm.image_url || ''} onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })} />
														</div>
													</div>
													<div>
														<label className="block text-xs text-gray-500 mb-1">Удобства</label>
														<input className={inp} value={editForm.amenities || ''} onChange={(e) => setEditForm({ ...editForm, amenities: e.target.value })} />
													</div>
													<div>
														<label className="block text-xs text-gray-500 mb-1">Описание</label>
														<textarea className={`${inp} resize-none`} rows={2} value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
													</div>
													<div className="flex gap-2">
														<button onClick={() => handleSaveEdit(listing.id)} className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700 transition">
															Сохранить
														</button>
														<button onClick={() => setEditingId(null)} className="text-gray-500 text-sm px-4 py-1.5 rounded-lg hover:bg-gray-100 transition">
															Отмена
														</button>
													</div>
												</div>
											) : (
												<>
													<div className="flex items-start justify-between">
														<div>
															<h3 className="text-lg font-semibold text-gray-800">{listing.title}</h3>
															<p className="text-gray-500 text-sm mt-1">{listing.city} · {listing.category}</p>
														</div>
														<span className="bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
															На проверке
														</span>
													</div>
													{listing.description && (
														<p className="text-gray-600 text-sm mt-3">{listing.description}</p>
													)}
													<div className="flex items-center gap-3 mt-3">
														<span className="text-gray-800 font-semibold">€{listing.price_per_night}/ночь</span>
														<span className="text-gray-400">·</span>
														<span className="text-gray-500 text-sm">до {listing.max_guests} гостей</span>
													</div>
													{listing.amenities && (
														<div className="flex flex-wrap gap-1.5 mt-3">
															{listing.amenities.split(',').map((a, i) => (
																<span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
																	{a.trim()}
																</span>
															))}
														</div>
													)}
												</>
											)}
										</div>
									</div>

									{/* Actions */}
									{editingId !== listing.id && (
										<div className="border-t border-gray-100 px-5 py-3 flex gap-2 justify-end bg-gray-50">
											<button
												onClick={() => handleApprove(listing.id)}
												className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition flex items-center gap-1.5"
											>
												<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
													<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
												</svg>
												Одобрить
											</button>
											<button
												onClick={() => startEdit(listing)}
												className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-5 py-2 rounded-lg transition flex items-center gap-1.5"
											>
												<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
													<path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
												</svg>
												Редактировать
											</button>
											<button
												onClick={() => handleReject(listing.id)}
												className="bg-white border border-red-200 hover:bg-red-50 text-red-600 text-sm font-medium px-5 py-2 rounded-lg transition flex items-center gap-1.5"
											>
												<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
													<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
												</svg>
												Отклонить
											</button>
										</div>
									)}
								</motion.div>
							))}
							<div>
								{problems.map((p: Report) => (
									<div key={p.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4 p-5">
										<h3 className="text-lg font-semibold text-gray-800">{p.title}</h3>
										<p className="text-gray-600 text-sm mt-2">{p.problem}</p>
										{p.email && (
											<a href={`mailto:${p.email}`} className="text-blue-600 text-sm mt-3 inline-block">
												Ответить: {p.email}
											</a>
										)}
									</div>
								))}
							</div>
						</AnimatePresence>
					</div>
				)}
			</div>
		</div>
	)
}
