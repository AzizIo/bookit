import { useState } from 'react'
export default function Header() {

	const [searchTerm, setSearchTerm] = useState('')
	const [Object, setObject] = useState('')
	const Search = Object.search(searchTerm)
	return (
		<>
			<div className="main bg-[#0f1629] h-screen">
				{/* Заголовок */}
				<section>
					{/* Текст для mobile */}
					<div className="h1 text-white md:hidden text-5xl font-bold text-center pt-40">
						<p>Book <br /> anything.<br /> <span className='text-[#f5a623]' >Instantly.</span> </p>
					</div>
					{/* Текст для desktop */}
					<div className="h1 text-white hidden md:block text-5xl font-bold text-center pt-40">
						<p>Book anything.<br /> <span className='text-[#f5a623]' >Instantly.</span> </p>
					</div>
					<div className="about mx-4 my-4">
						<p className='text-zinc-400 text-center' >Find and reserve workspaces, meeting <br /> rooms, and services in seconds. Professional spaces when you need them.</p>
					</div>
				</section>
				{/* Секция поиска */}
				<form className=''>
					<div className="bg-white/5 mx-4 rounded-xl px-4 py-2 flex flex-col md:flex-row gap-4">

						<div className="search flex mt-2">
							<input type="text" onChange={e => setSearchTerm(e.target.value)}
								value={searchTerm}
								placeholder='Location' required className='rounded-xl px-4 py-2 border-1  border-gray-600 font-semibold text-[#ced0d3] bg-[#2a3147] max-w-md w-120 h-14' />
						</div>
						<div className="date flex">
							<input type="date" className='rounded-xl px-4 py-2 border-1  border-gray-600 font-semibold text-[#ced0d3] bg-[#2a3147] max-w-md w-120 h-14' />
						</div>
						<div className="sel flex ">
							<select className='rounded-xl px-4 py-2 border-1  border-gray-600 font-semibold text-[#ced0d3] bg-[#2a3147] max-w-md w-120 h-14' name="" id="">Cotegories
								<option value="">1</option>
								<option value="">2</option>
								<option value="">3</option>
							</select>
						</div>
						<div className="buttin flex">
							<button className='rounded-xl mb-2 px-4 py-2 border-1 font-semibold text-black bg-[#f5a623] max-w-md w-120 h-14'>Fing & Book</button>
						</div>
					</div>
				</form>
			</div>
		</>
	)
}