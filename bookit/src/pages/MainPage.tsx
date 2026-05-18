import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../API/api'
import checkmark from '../assets/checkmark.png'
import lupa from '../assets/lupa.png'
import time from '../assets/time.png'
import Bug from '../components/bug'
export default function MainPage() {
	const navigate = useNavigate()
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
			<div className="main bg-[#12192c] min-h-screen">
				{/* Заголовок */}
				<section className='' >
					{/* Текст для mobile */}
					<div className="h1 text-white md:hidden text-5xl font-bold text-center pt-40">
						<p>Бронируй <br /> что угодно.<br /> <span className='text-[#f5a623]' >Мгновенно.</span> </p>
					</div>
					{/* Текст для desktop */}
					<div className="h1 text-white tracking-wide  font-jakarta font-bold text-7xl hidden md:block text-center pt-40">
						<p>Бронируй что угодно.<br /> <span className='text-[#f5a623]' >Мгновенно.</span> </p>
					</div>
					<div className="about mx-4 my-8">
						<p className='text-zinc-400 text-center font-jakarta' >Находите и бронируйте рабочие пространства, <br /> переговорные и услуги за секунды. Профессиональные пространства, когда они вам нужны.</p>
					</div>
				</section>
				{/* Секция поиска */}
				<form className='w-full mb-20'>
					<div className="bg-white/5 mx-4 md:mx-auto border border-gray-700 rounded-xl px-3 py-3 md:px-4 md:py-4 flex flex-col gap-4 items-center max-w-3xl">
						<div className="flex flex-col md:flex-row gap-3 w-full justify-between items-center">
							<div className="search flex w-full md:w-auto">
								<input type="text" onChange={e => setSearchTerm(e.target.value)}
									value={searchTerm}
									placeholder='Местоположение' required className='rounded-xl px-4 py-3 border border-gray-600 font-semibold text-[#ced0d3] bg-[#2a3147] w-full md:w-60 h-16' />
							</div>
							<div className="date flex w-full md:w-auto">
								<input type="date" className='rounded-xl px-4 py-3 border border-gray-600 font-semibold text-[#ced0d3] bg-[#2a3147] w-full md:w-60 h-16' />
							</div>
							<div className="sel flex w-full md:w-auto">
								<select className='rounded-xl px-4 py-3 border border-gray-600 font-semibold text-[#ced0d3] bg-[#2a3147] w-full md:w-60 h-16' name="" id="">
									<option value="">Категории</option>
									<option value="1">1</option>
									<option value="2">2</option>
									<option value="3">3</option>
								</select>
							</div>
						</div>
						<div className="buttin flex justify-center  w-full">
							<button className='rounded-xl px-8 py-3 text-lg border font-semibold text-black bg-[#f5a623] w-full'>Найти и забронировать</button>
						</div>
					</div>
				</form>


				{/* Секция предложений */}
				<div className="min-h-screen bg-[#0f1629] px-4 py-25 lg:px-8 lg:py-30">
					<div className="max-w-5xl py-8 mx-auto text-center mb-5 lg:mb-6">
						<h1 className='text-white font-semibold text-5xl'>Лучшие места</h1>
						<p className='text-zinc-400 mt-4'>Подобранные пространства для вашей следующей встречи или проекта</p>
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
											<span className="text-[#8b93a8] text-xs font-normal">/ночь</span>
										</div>
										<button className="bg-[#f5a623] text-[#0f1629] text-sm font-bold
        px-4 py-2 rounded-xl hover:bg-[#e09610] transition active:scale-95">
											Забронировать
										</button>
									</div>

								</div>
							</div>
						))}
					</div>
				</div>
				<section>
					<div className="content flex mt-20 text-white flex-col text-center">
						<h1 className='text-4xl font-semibold' >Как это работает</h1>
						<p className='text-zinc-500 mt-4' >Забронируйте идеальное пространство в три простых шага</p>
					</div>
					<div className="steps flex flex-col md:flex-row gap-8 justify-center items-center max-w-5xl mx-auto mt-10">
						<div className="step flex flex-col items-center gap-4 mt-10">
							<div className="icon"><img className='w-18 bg-amber-300/5 rounded-2xl' src={lupa} alt="Search" /></div>
							<h2 className='text-xl text-white font-semibold'>1. Поиск</h2>
							<p className='flex text-center mx-4 text-zinc-400'>Просматривайте сотни проверенных пространств, подобранных под ваши нужды и местоположение</p>
						</div>
						<div className="step flex flex-col items-center gap-4 mt-10">
							<div className="icon"><img className='w-18 bg-amber-300/5 rounded-2xl' src={checkmark} alt="Search" /></div>
							<h2 className='text-xl text-white font-semibold'>2. Выбор</h2>
							<p className='flex text-center mx-4 text-zinc-400'>Сравнивайте удобства, цены и доступность, чтобы найти идеальное рабочее пространство</p>
						</div>
						<div className="step flex flex-col items-center gap-4 mt-10">
							<div className="icon"><img className='w-18 bg-amber-300/5 rounded-2xl' src={time} alt="Search" /></div>
							<h2 className='text-xl text-white font-semibold'>3. Бронирование</h2>
							<p className='flex text-center mx-4 text-zinc-400'>Мгновенное подтверждение и удобная регистрация. Начните работать сразу</p>
						</div>
					</div>
				</section>
				{/* Сюда загружать отзывы */}
				<section className='mt-30' >
					<div className=''>
						<div className='content flex text-white flex-col text-center' >
							<h1 className='text-4xl font-semibold' >Отзывы пользователей</h1>
							<p className='text-zinc-500 mt-4' >Нам доверяют профессионалы из разных отраслей</p>
						</div>
						{/* Заглушка, просто для вида */}
						<div className="flex  justify-center my-10 ">

							<div className="bg-[#1a2332] rounded-2xl  p-6 max-w-sm shadow-lg">
								<div className="flex gap-1 mb-4">
									{[...Array(5)].map((_, i) => (
										<span key={i} className="text-yellow-400 text-xl">★</span>
									))}
								</div>

								<p className="text-white text-base leading-relaxed mb-6">
									С BookIt найти идеальное пространство для встреч стало невероятно просто. Процесс бронирования был безупречным!
								</p>

								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-full bg-[#2a3d55] flex items-center justify-center flex-shrink-0">
										<svg className="w-5 h-5 text-[#4a90b8]" fill="currentColor" viewBox="0 0 24 24">
											<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
										</svg>
									</div>
									<div>
										<p className="text-white font-semibold text-sm">Sarah Chen</p>
										<p className="text-gray-400 text-xs">Менеджер продуктов</p>
									</div>
								</div>
							</div>
							);

						</div>
					</div>
				</section>
				<footer className='bg-[#242328] pt-4'>

					<div className='content flex text-white flex-col mt-20 text-center' >
						<h1 className='text-4xl font-semibold mx-10' >Готовы найти идеальное пространство?</h1>
						<p className='text-zinc-500 mt-4 mx-20' >Присоединяйтесь к тысячам профессионалов, которые доверяют BookIt</p>
					</div>
					<div className="start-bth mx-auto flex justify-center py-10">
						<button
							onClick={() => navigate('/booking')}
							className="bg-amber-500 hover:bg-amber-600 text-black font-semibold py-4 px-8 rounded-xl text-lg transition active:scale-95 shadow-md shadow-amber-400/50"
						>
							Начать бронирование
						</button>
					</div>
				</footer>

			</div>
			<div className=''>
				<Bug />
			</div>
		</>
	)
}