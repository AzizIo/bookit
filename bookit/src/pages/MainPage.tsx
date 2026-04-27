import { useEffect, useState } from 'react'
import API from '../API/api'
export default function MainPage() {
	interface Listing {
		id: number
		title: string
		city: string
		category: string
		price_per_night: number
		max_guests: number
		description: string
		amenities: string
		image_url: string
	}
	const [searchTerm, setSearchTerm] = useState('')
	const [AllListings, setAllListings] = useState<Listing[]>([])
	useEffect(() => {
		API.get('/listings/three').then((res) => setAllListings(res.data))
	}, [])
	return (
		<>
			<div className="main bg-[#0f1629] min-h-screen">
				{/* Заголовок */}
				<section>
					{/* Текст для mobile */}
					<div className="h1 text-white md:hidden text-5xl font-bold text-center pt-40">
						<p>Book <br /> anything.<br /> <span className='text-[#f5a623]' >Instantly.</span> </p>
					</div>
					{/* Текст для desktop */}
					<div className="h1 text-white tracking-wide  font-jakarta font-bold text-7xl hidden md:block text-center pt-40">
						<p>Book anything.<br /> <span className='text-[#f5a623]' >Instantly.</span> </p>
					</div>
					<div className="about mx-4 my-8">
						<p className='text-zinc-400 text-center font-jakarta' >Find and reserve workspaces, meeting <br /> rooms, and services in seconds. Professional spaces when you need them.</p>
					</div>
				</section>
				{/* Секция поиска */}
				<form className='w-full'>
					<div className="bg-white/5 mx-4 md:mx-auto border border-gray-700 rounded-xl px-3 py-3 md:px-4 md:py-4 flex flex-col gap-4 items-center max-w-3xl">
						<div className="flex flex-col md:flex-row gap-3 w-full justify-between items-center">
							<div className="search flex w-full md:w-auto">
								<input type="text" onChange={e => setSearchTerm(e.target.value)}
									value={searchTerm}
									placeholder='Location' required className='rounded-xl px-4 py-3 border border-gray-600 font-semibold text-[#ced0d3] bg-[#2a3147] w-full md:w-60 h-16' />
							</div>
							<div className="date flex w-full md:w-auto">
								<input type="date" className='rounded-xl px-4 py-3 border border-gray-600 font-semibold text-[#ced0d3] bg-[#2a3147] w-full md:w-60 h-16' />
							</div>
							<div className="sel flex w-full md:w-auto">
								<select className='rounded-xl px-4 py-3 border border-gray-600 font-semibold text-[#ced0d3] bg-[#2a3147] w-full md:w-60 h-16' name="" id="">
									<option value="">Categories</option>
									<option value="1">1</option>
									<option value="2">2</option>
									<option value="3">3</option>
								</select>
							</div>
						</div>
						<div className="buttin flex justify-center w-full">
							<button className='rounded-xl px-8 py-3 text-lg border font-semibold text-black bg-[#f5a623] w-full'>Find & Book</button>
						</div>
					</div>
				</form>


				{/* Секция предложений */}
				<div className="min-h-screen bg-[#0f1629] px-4 py-25 lg:px-8 lg:py-30">
					<div className="max-w-5xl py-8 mx-auto text-center mb-5 lg:mb-6">
						<h1 className='text-white font-semibold text-5xl'>Featured Spaces</h1>
						<p className='text-zinc-400 mt-4'>Handpicked spaces for your next meeting or project</p>
					</div>
					<div className="grid gap-4 justify-center sm:grid-cols-2 lg:grid-cols-3 mx-auto max-w-[1280px]">
						{AllListings.map((l: Listing) => (
							<div key={l.id} className="bg-[#1a2035] rounded-2xl overflow-hidden w-full max-w-[420px] shadow-xl border border-white/10 mx-auto">
								{/* Картинка */}
								<div className="w-full h-70 overflow-hidden">
									<img src={l.image_url} alt="space" className="w-full h-full object-cover" />
								</div>
								{/* Контент */}
								<div className="p-4 py-4 flex flex-col gap-2">
									{/* Название */}
									<h2 className="text-white text-base font-semibold leading-tight">
										{l.title}
									</h2>
									{/* Локация */}
									<div className="flex items-center gap-1 text-[#8b93a8] text-xs">
										<span>📍</span>
										<span>{l.city}</span>
									</div>

									{/* Категория */}
									<div className="flex items-center gap-1 text-xds">
										<span className="text-[#f5a623]">🏷️</span>
										<span className="text-[#f5a623] font-semibold">{l.category}</span>
									</div>

									{/* Удобства */}
									<div className="flex items-center gap-2 flex-wrap mt-1">
										{l.amenities.split(',').map((item, index) => (
											<div
												key={index}
												className="flex items-center gap-1 text-[#8b93a8] text-xs
      border border-white/10 rounded-lg px-2 py-1 bg-white/5"
											>
												<span>{item.trim()}</span>
											</div>
										))}
									</div>

									{/* Разделитель */}
									<hr className="border-white/10 mt-1" />

									{/* Цена + кнопка */}
									<div className="flex items-center justify-between mt-1">
										<div className="text-white text-lg font-bold">
											<span className="text-[#f5a623]">€{l.price_per_night}</span>
											<span className="text-[#8b93a8] text-xs font-normal">/night</span>
										</div>
										<button className="bg-[#f5a623] text-[#0f1629] text-sm font-bold
        px-4 py-2 rounded-xl hover:bg-[#e09610] transition active:scale-95">
											Book now
										</button>
									</div>

								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</>
	)
}