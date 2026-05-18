import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import API from '../API/api'
import { useAuth } from '../context/AuthContext'
import GlowCard from '../components/GlowCard'
import CursorGradient from '../components/CursorGradient'

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

const amenityIcons: Record<string, string> = {
	WiFi: '📶',
	Projector: '🖥️',
	Coffee: '☕',
	Whiteboard: '📋',
	Parking: '🅿️',
	Kitchen: '🍳',
	Pool: '🏊',
}

export default function BookingPage() {
	const navigate = useNavigate()
	const { user } = useAuth()
	const [listings, setListings] = useState<Listing[]>([])
	const [priceRange, setPriceRange] = useState(10000)
	const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
	const [loading, setLoading] = useState(true)
	const isAdmin = user?.role === 'admin'

	useEffect(() => {
		API.get('/listings/')
			.then((res) => setListings(res.data))
			.catch(() => setListings([]))
			.finally(() => setLoading(false))
	}, [])

	const allAmenities = Array.from(
		new Set(listings.flatMap((l) => l.amenities.split(',').map((a) => a.trim()).filter(Boolean)))
	)

	const maxPrice = listings.length > 0 ? Math.max(...listings.map((l) => l.price_per_night)) : 10000

	function toggleAmenity(amenity: string) {
		setSelectedAmenities((prev) =>
			prev.includes(amenity)
				? prev.filter((a) => a !== amenity)
				: [...prev, amenity]
		)
	}

	function resetFilters() {
		setPriceRange(maxPrice)
		setSelectedAmenities([])
		setSearchTerm('')
	}

	const filtered = listings.filter((l) => {
		if (l.price_per_night > priceRange) return false
		if (searchTerm && !l.title.toLowerCase().includes(searchTerm.toLowerCase()) && !l.city.toLowerCase().includes(searchTerm.toLowerCase())) return false
		if (selectedAmenities.length > 0) {
			const listingAmenities = l.amenities.split(',').map((a) => a.trim().toLowerCase())
			if (!selectedAmenities.every((a) => listingAmenities.includes(a.toLowerCase()))) return false
		}
		return true
	})

	return (
		<div className="min-h-screen bg-[#0f1629] relative">
			<CursorGradient />
			{/* Page header */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="px-6 pt-8 pb-4 md:px-12"
			>
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-white text-3xl font-bold">Бронирование</h1>
						<p className="text-zinc-400 text-sm mt-1">{filtered.length} найдено</p>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={() => setViewMode('list')}
							className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-[#f5a623] text-[#0f1629]' : 'bg-[#1a2035] text-zinc-400 border border-white/10'}`}
						>
							<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
							</svg>
						</button>
						<button
							onClick={() => setViewMode('map')}
							className={`p-2 rounded-lg transition ${viewMode === 'map' ? 'bg-[#f5a623] text-[#0f1629]' : 'bg-[#1a2035] text-zinc-400 border border-white/10'}`}
						>
							<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
							</svg>
						</button>
					</div>
				</div>
			</motion.div>

			{/* Main content */}
			<div className="flex flex-col md:flex-row gap-6 px-6 pb-12 md:px-12">
				{/* Filters sidebar */}
				<motion.div
					initial={{ opacity: 0, x: -30 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="w-full md:w-72 shrink-0"
				>
					<div className="bg-[#1a2035] rounded-2xl border border-white/10 p-6">
						<div className="flex items-center gap-2 mb-6">
							<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#f5a623]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
							</svg>
							<h2 className="text-white text-lg font-semibold">Фильтры</h2>
						</div>

						{/* Search */}
						<div className="mb-6">
							<label className="text-white text-sm font-semibold block mb-3">Поиск</label>
							<input
								type="text"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="Название или город..."
								className="w-full bg-[#2a3147] border border-gray-600 rounded-xl px-4 py-3 text-[#ced0d3] text-sm placeholder-zinc-500 focus:border-[#f5a623] focus:outline-none transition"
							/>
						</div>

						{/* Price Range */}
						<div className="mb-6">
							<label className="text-white text-sm font-semibold block mb-3">Цена</label>
							<input
								type="range"
								min={0}
								max={maxPrice}
								value={priceRange}
								onChange={(e) => setPriceRange(Number(e.target.value))}
								className="w-full accent-[#f5a623]"
							/>
							<div className="flex justify-between text-zinc-400 text-xs mt-1">
								<span>€0</span>
								<span>€{priceRange}/ночь</span>
							</div>
						</div>

						{/* Amenities */}
						{allAmenities.length > 0 && (
							<div className="mb-6">
								<label className="text-white text-sm font-semibold block mb-3">Удобства</label>
								<div className="flex flex-col gap-3">
									{allAmenities.map((amenity) => (
										<label key={amenity} className="flex items-center gap-3 cursor-pointer">
											<input
												type="checkbox"
												checked={selectedAmenities.includes(amenity)}
												onChange={() => toggleAmenity(amenity)}
												className="w-4 h-4 rounded border-gray-600 bg-[#2a3147] accent-[#f5a623]"
											/>
											<span className="text-zinc-300 text-sm">{amenity}</span>
										</label>
									))}
								</div>
							</div>
						)}

						{/* Reset */}
						<button
							onClick={resetFilters}
							className="w-full border border-white/20 text-white rounded-xl py-3 text-sm font-semibold hover:bg-white/5 transition"
						>
							Сбросить фильтры
						</button>
					</div>
				</motion.div>

				{/* Cards */}
				<div className="flex-1">
					{loading ? (
						<div className="text-zinc-400 text-center py-20">Загрузка...</div>
					) : filtered.length === 0 ? (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="text-zinc-400 text-center py-20"
						>
							Ничего не найдено
						</motion.div>
					) : (
						<div className="grid gap-6 sm:grid-cols-2">
							{filtered.map((l, i) => (
								<motion.div
									key={l.id}
									initial={{ opacity: 0, y: 30 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.4, delay: i * 0.08 }}
								>
								<GlowCard
									onClick={() => navigate(`/listing/${l.id}`)}
									className="bg-[#1a2035] rounded-2xl overflow-hidden border border-white/10 relative group"
								>
									{/* Admin pencil */}
									{isAdmin && (
										<motion.button
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											whileHover={{ scale: 1.15 }}
											whileTap={{ scale: 0.9 }}
											onClick={(e) => {
												e.stopPropagation()
												navigate(`/listing/${l.id}`)
											}}
											className="absolute top-3 right-3 z-10 bg-[#f5a623] text-[#0f1629] p-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
											title="Редактировать"
										>
											<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
											</svg>
										</motion.button>
									)}
									{l.image_url && (
										<div className="w-full h-52 overflow-hidden">
											<img src={l.image_url} alt={l.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
										</div>
									)}
									<div className="p-5 flex flex-col gap-2">
										<h3 className="text-white text-lg font-semibold">{l.title}</h3>
										<div className="flex items-center gap-1 text-zinc-400 text-sm">
											<span>📍</span>
											<span>{l.city}</span>
										</div>
										<div className="flex items-center gap-2 text-sm">
											<span className="text-[#f5a623]">🏷️</span>
											<span className="text-[#f5a623] font-semibold">{l.category}</span>
										</div>
										{l.amenities && (
											<div className="flex items-center gap-2 flex-wrap mt-1">
												{l.amenities.split(',').map((a) => {
													const trimmed = a.trim()
													return (
														<span
															key={trimmed}
															className="flex items-center gap-1 text-zinc-300 text-xs border border-white/10 rounded-lg px-2 py-1 bg-white/5"
														>
															{amenityIcons[trimmed] || ''} {trimmed}
														</span>
													)
												})}
											</div>
										)}
										<hr className="border-white/10 mt-2" />
										<div className="flex items-center justify-between mt-1">
											<div className="text-white text-lg font-bold">
												<span className="text-[#f5a623]">€{l.price_per_night}</span>
												<span className="text-zinc-400 text-xs font-normal">/ночь</span>
											</div>
											<motion.button
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
												className="bg-[#f5a623] text-[#0f1629] text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#e09610] transition active:scale-95"
											>
												Забронировать
											</motion.button>
										</div>
									</div>
								</GlowCard>
								</motion.div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
