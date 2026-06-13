import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
	owner_id: number
	status: string
}
interface Report {
	id: number
	title: string
	problem: string
	email: string
}
interface AdminUser {
	id: number
	full_name: string
	email: string
	user_role: string
	booking_history: string
	favorite_listings: string
	rating: number
	last_login: string
}

const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#f5a623] bg-white"

const ROLE_LABELS: Record<string, string> = {
	renter: 'Пользователь',
	admin: 'Администратор',
}
const ROLE_COLORS: Record<string, string> = {
	renter: 'bg-blue-100 text-blue-700',
	admin: 'bg-amber-100 text-amber-700',
}

export default function AdminPage() {
	const [activeTab, setActiveTab] = useState<'listings' | 'users' | 'reports'>('listings')
	const [pending, setPending] = useState<Listing[]>([])
	const [loading, setLoading] = useState(true)
	const [editingId, setEditingId] = useState<number | null>(null)
	const [editForm, setEditForm] = useState<Partial<Listing>>({})
	const [problems, setProblems] = useState<Report[]>([])
	const [users, setUsers] = useState<AdminUser[]>([])
	const [usersLoading, setUsersLoading] = useState(false)
	const [deletingUserId, setDeletingUserId] = useState<number | null>(null)
	const [roleChangingId, setRoleChangingId] = useState<number | null>(null)

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

	async function fetchReports() {
		try {
			const { data } = await API.get('/reports/')
			setProblems(data)
		} catch {
			setProblems([])
		}
	}

	async function fetchUsers() {
		setUsersLoading(true)
		try {
			const { data } = await API.get('/admin/users')
			setUsers(data)
		} catch {
			setUsers([])
		}
		setUsersLoading(false)
	}

	useEffect(() => {
		fetchPending()
		fetchReports()
		fetchUsers()
	}, [])

	async function handleApprove(id: number) {
		try {
			await API.put(`/admin/listings/${id}/approve`)
			setPending((prev) => prev.filter((l) => l.id !== id))
		} catch { }
	}

	async function handleReject(id: number) {
		try {
			await API.put(`/admin/listings/${id}/reject`)
			setPending((prev) => prev.filter((l) => l.id !== id))
		} catch { }
	}

	function startEdit(listing: Listing) {
		setEditingId(listing.id)
		setEditForm({
			title: listing.title, city: listing.city, category: listing.category,
			price_per_night: listing.price_per_night, max_guests: listing.max_guests,
			description: listing.description, image_url: listing.image_url, amenities: listing.amenities,
		})
	}

	async function handleSaveEdit(id: number) {
		try {
			const { data } = await API.put(`/admin/listings/${id}`, editForm)
			setPending((prev) => prev.map((l) => l.id === id ? data : l))
			setEditingId(null)
		} catch { }
	}

	async function handleDeleteReport(id: number) {
		try {
			await API.delete(`/reports/${id}`)
			setProblems((prev) => prev.filter((p) => p.id !== id))
		} catch { }
	}

	async function handleRoleChange(userId: number, newRole: string) {
		setRoleChangingId(userId)
		try {
			const { data } = await API.put(`/admin/users/${userId}/role`, { user_role: newRole })
			setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, user_role: data.user_role } : u))
		} catch { }
		setRoleChangingId(null)
	}

	async function handleDeleteUser(userId: number) {
		if (!confirm('Удалить пользователя? Все его бронирования и отзывы также будут удалены.')) return
		setDeletingUserId(userId)
		try {
			await API.delete(`/admin/users/${userId}`)
			setUsers((prev) => prev.filter((u) => u.id !== userId))
		} catch { }
		setDeletingUserId(null)
	}

	function formatDate(dateStr: string) {
		if (!dateStr) return '—'
		try {
			return new Date(dateStr).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
		} catch {
			return '—'
		}
	}

	const bookingCount = (u: AdminUser) => u.booking_history?.split(',').filter(Boolean).length || 0

	const tabs = [
		{ id: 'listings' as const, label: 'Объявления' },
		{ id: 'users' as const, label: 'Пользователи' },
		{ id: 'reports' as const, label: 'Жалобы' },
	]

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b border-gray-200 px-4 md:px-8 py-5">
				<div className="max-w-5xl mx-auto flex items-center justify-between">
					<div>
						<h1 className="text-xl font-bold text-gray-800">Панель администратора</h1>
						<p className="text-gray-400 text-xs mt-0.5 tracking-wide">bookit admin</p>
					</div>
					<button
						onClick={() => { fetchPending(); fetchUsers(); fetchReports() }}
						className="text-sm text-gray-500 hover:text-gray-700 transition flex items-center gap-1.5 border border-gray-200 px-3 py-1.5 rounded-lg"
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
						Обновить
					</button>
				</div>
			</div>

			{/* Tabs */}
			<div className="bg-white border-b border-gray-200">
				<div className="max-w-5xl mx-auto px-4 md:px-8">
					<div className="flex overflow-x-auto">
						{tabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`relative flex-shrink-0 px-5 py-3.5 text-sm font-medium transition-colors duration-200 ${activeTab === tab.id ? 'text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
							>
								{tab.label}
								{activeTab === tab.id && (
									<motion.div layoutId="admin-tab-line" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f5a623]" transition={{ duration: 0.25 }} />
								)}
							</button>
						))}
					</div>
				</div>
			</div>

			<div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
				<AnimatePresence mode="wait">

					{/* --- LISTINGS TAB --- */}
					{activeTab === 'listings' && (
						<motion.div key="listings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
							{loading ? (
								<p className="text-gray-400 text-center py-20">Загрузка...</p>
							) : pending.length === 0 ? (
								<div className="text-center py-20">
									<svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<p className="text-gray-500">Все заявки рассмотрены</p>
								</div>
							) : (
								<div className="space-y-4">
									<AnimatePresence>
										{pending.map((listing) => (
											<motion.div key={listing.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
												<div className="flex flex-col md:flex-row">
													{listing.image_url && (
														<div className="md:w-48 h-40 md:h-auto flex-shrink-0">
															<img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" />
														</div>
													)}
													<div className="flex-1 p-5">
														{editingId === listing.id ? (
															<div className="space-y-3">
																<div className="grid grid-cols-2 gap-3">
																	<div><label className="block text-xs text-gray-500 mb-1">Название</label><input className={inp} value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /></div>
																	<div><label className="block text-xs text-gray-500 mb-1">Город</label><input className={inp} value={editForm.city || ''} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} /></div>
																	<div><label className="block text-xs text-gray-500 mb-1">Категория</label>
																		<select className={inp} value={editForm.category || ''} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
																			<option value="apartment">Квартира</option>
																			<option value="house">Дом</option>
																			<option value="hotel">Отель</option>
																		</select>
																	</div>
																	<div><label className="block text-xs text-gray-500 mb-1">Цена / ночь</label><input className={inp} type="number" value={editForm.price_per_night || ''} onChange={(e) => setEditForm({ ...editForm, price_per_night: parseFloat(e.target.value) })} /></div>
																	<div><label className="block text-xs text-gray-500 mb-1">Макс. гостей</label><input className={inp} type="number" value={editForm.max_guests || ''} onChange={(e) => setEditForm({ ...editForm, max_guests: parseInt(e.target.value) })} /></div>
																	<div><label className="block text-xs text-gray-500 mb-1">Изображение</label><input className={inp} value={editForm.image_url || ''} onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })} /></div>
																</div>
																<div><label className="block text-xs text-gray-500 mb-1">Удобства</label><input className={inp} value={editForm.amenities || ''} onChange={(e) => setEditForm({ ...editForm, amenities: e.target.value })} /></div>
																<div><label className="block text-xs text-gray-500 mb-1">Описание</label><textarea className={`${inp} resize-none`} rows={2} value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} /></div>
																<div className="flex gap-2">
																	<button onClick={() => handleSaveEdit(listing.id)} className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700 transition">Сохранить</button>
																	<button onClick={() => setEditingId(null)} className="text-gray-500 text-sm px-4 py-1.5 rounded-lg hover:bg-gray-100 transition">Отмена</button>
																</div>
															</div>
														) : (
															<>
																<div className="flex items-start justify-between">
																	<div>
																		<h3 className="text-lg font-semibold text-gray-800">{listing.title}</h3>
																		<p className="text-gray-500 text-sm mt-1">{listing.city} · {listing.category}</p>
																	</div>
																	<span className="bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-0.5 rounded-full">На проверке</span>
																</div>
																{listing.description && <p className="text-gray-600 text-sm mt-3">{listing.description}</p>}
																<div className="flex items-center gap-3 mt-3">
																	<span className="text-gray-800 font-semibold">₽{listing.price_per_night}/ночь</span>
																	<span className="text-gray-400">·</span>
																	<span className="text-gray-500 text-sm">до {listing.max_guests} гостей</span>
																</div>
															</>
														)}
													</div>
												</div>
												{editingId !== listing.id && (
													<div className="border-t border-gray-100 px-5 py-3 flex flex-wrap gap-2 justify-end bg-gray-50">
														<button onClick={() => handleApprove(listing.id)} className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition flex items-center gap-1.5">
															<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
															Одобрить
														</button>
														<button onClick={() => startEdit(listing)} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition flex items-center gap-1.5">
															<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
															Редактировать
														</button>
														<button onClick={() => handleReject(listing.id)} className="bg-white border border-red-200 hover:bg-red-50 text-red-600 text-sm font-medium px-4 py-2 rounded-lg transition flex items-center gap-1.5">
															<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
															Отклонить
														</button>
													</div>
												)}
											</motion.div>
										))}
									</AnimatePresence>
								</div>
							)}
						</motion.div>
					)}

					{/* --- USERS TAB --- */}
					{activeTab === 'users' && (
						<motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
							{usersLoading ? (
								<p className="text-gray-400 text-center py-20">Загрузка...</p>
							) : users.length === 0 ? (
								<p className="text-gray-400 text-center py-20">Пользователи не найдены</p>
							) : (
								<div className="space-y-3">
									<p className="text-gray-400 text-xs mb-4">{users.length} пользователей</p>
									{users.map((u) => (
										<motion.div key={u.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-5">
											<div className="flex flex-col sm:flex-row sm:items-center gap-4">
												{/* Avatar + info */}
												<div className="flex items-center gap-3 flex-1 min-w-0">
													<div className="w-10 h-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-semibold text-sm">
														{u.full_name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'}
													</div>
													<div className="min-w-0">
														<div className="flex items-center gap-2 flex-wrap">
															<span className="font-semibold text-gray-800 text-sm truncate">{u.full_name}</span>
															<span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[u.user_role] || 'bg-gray-100 text-gray-500'}`}>
																{ROLE_LABELS[u.user_role] || u.user_role}
															</span>
														</div>
														<p className="text-gray-400 text-xs mt-0.5 truncate">{u.email}</p>
													</div>
												</div>

												{/* Stats */}
												<div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
													<div className="flex items-center gap-1">
														<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
														<span>{bookingCount(u)} бронирований</span>
													</div>
													<div className="flex items-center gap-1">
														<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
														<span>Вход: {formatDate(u.last_login)}</span>
													</div>
												</div>

												{/* Actions */}
												<div className="flex items-center gap-2 flex-shrink-0">
													<select
														value={u.user_role}
														disabled={roleChangingId === u.id}
														onChange={(e) => handleRoleChange(u.id, e.target.value)}
														className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-[#f5a623] bg-white text-gray-700 disabled:opacity-50"
													>
														<option value="renter">Пользователь</option>
														<option value="admin">Администратор</option>
													</select>
													<button
														onClick={() => handleDeleteUser(u.id)}
														disabled={deletingUserId === u.id}
														className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition disabled:opacity-40"
														title="Удалить пользователя"
													>
														{deletingUserId === u.id ? (
															<svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
														) : (
															<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
														)}
													</button>
												</div>
											</div>
										</motion.div>
									))}
								</div>
							)}
						</motion.div>
					)}

					{/* --- REPORTS TAB --- */}
					{activeTab === 'reports' && (
						<motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
							{problems.length === 0 ? (
								<div className="text-center py-20">
									<svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
									<p className="text-gray-500">Жалоб нет</p>
								</div>
							) : (
								<div className="space-y-3">
									<p className="text-gray-400 text-xs mb-4">{problems.length} жалоб</p>
									<AnimatePresence>
										{problems.map((p) => (
											<motion.div key={p.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
												<div className="flex items-start justify-between gap-4">
													<div className="flex-1 min-w-0">
														<h3 className="font-semibold text-gray-800 text-sm">Тема: {p.title}</h3>
														<p className="text-gray-600 text-sm mt-1.5">{p.problem}</p>
														{p.email && (
															<a href={`mailto:${p.email}`} className="text-blue-500 text-xs mt-2 inline-block hover:underline">{p.email}</a>
														)}
													</div>
													<button
														onClick={() => handleDeleteReport(p.id)}
														className="flex-shrink-0 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition"
													>
														<svg width="14" height="14" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M8 13.078c4.418 0 8-5 8-5s-3.582-5-8-5-8 5-8 5 3.582 5 8 5zm0-2a3 3 0 100-6 3 3 0 000 6zm0-1.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>
														Просмотрено
													</button>
												</div>
											</motion.div>
										))}
									</AnimatePresence>
								</div>
							)}
						</motion.div>
					)}

				</AnimatePresence>
			</div>
		</div>
	)
}