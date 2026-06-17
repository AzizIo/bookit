import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ShimmerButton from '../components/ShimmerButton'


import { motion } from 'framer-motion'
export default function SearchBar() {

	const [searchTerm, setSearchTerm] = useState('')


	return (
		<motion.form
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.5, duration: 0.5 }}
			className='w-full mb-20'
		>
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
					<ShimmerButton className='rounded-xl px-8 py-3 text-lg border font-semibold text-black bg-[#f5a623] w-full'>Найти и забронировать</ShimmerButton>
				</div>
			</div>
		</motion.form>
	)
}
