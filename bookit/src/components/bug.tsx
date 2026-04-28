import { useState } from 'react'
import bug from '../assets/bug.png'
export default function Bug() {
	const [showBug, setShowBug] = useState(false)
	return (
		<>

			<div className='fixed bottom-4 right-4'>
				<img onClick={() => setShowBug(true)} className='w-15 rounded-full' src={bug} alt="Bug" />
			</div>
			{showBug && (
				<div className='fixed inset-0 bg-black/50
    flex flex-col items-center justify-center'>
					<div className='bg-[#1a1f35] p-6 rounded-lg flex flex-col  gap-4' >
						<div className='flex gap-4' >

							<div className="img"><img className='w-10 rounded-xl' src={bug} alt="" /></div>
							<div >
								<h2 className='text-white font-semibold' >Сообщить об ошибке</h2>
								<p className='text-gray-400' >Опишите проблему подробно</p>
							</div>
							<div className="close">
								<button onClick={() => setShowBug(false)} className='text-gray-400 hover:text-gray-600' >X</button>
							</div>
						</div>

						<hr className='w-full text-zinc-600' />
						<form action="">
							<div className='input flex flex-col gap-2'>
								<label className='text-gray-400' htmlFor="theme">Тема</label>
								<input className='bg-[#0f1629] rounded-lg p-2 text-white' type="text" name="theme" id="theme" placeholder='Кратко опишите проблему...' />

							</div>
							<div className="input flex flex-col gap-2 mt-4">
								<label className='text-gray-400' htmlFor="description">Описание проблемы</label>
								<textarea className='bg-[#0f1629]  rounded-lg p-2 text-white' name="description" id="description" rows={4} placeholder='Опишите проблему...' ></textarea>
							</div>
							<div className="input flex flex-col gap-2 mt-4">
								<label className='text-gray-400' htmlFor="email">Ваш email (необязательно)</label>
								<input className='bg-[#0f1629] rounded-lg p-2 text-white' type="email" name="email" id="email" placeholder='Ваш email...' />
							</div>
						</form>
						<div className='flex gap-4 justify-center' >

							<button onClick={() => setShowBug(false)} className='bg-[#3a3f5c] text-white font-semibold px-4 py-2 rounded-lg ml-2' >Отмена</button>
							<button className='bg-[#ff0000] text-white text-lg font-semibold px-4 py-2 rounded-lg' >Отправить</button>

						</div>
					</div>


				</div>
			)}
		</>
	)
}