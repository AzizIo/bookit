import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import API from '../API/api'
import check from '../assets/check2.png'
import kaligoscope from '../assets/kaleidoscope.png'
import lupa from '../assets/lupa.png'
import time from '../assets/time.png'
import GlowCard from '../components/GlowCard'
export default function PayPage() {
    const { state } = useLocation()
    const navigate = useNavigate()
    const { listing, guests, hours, total, date } = state
    const [hotList, setHotList] = useState([])

    const [bookingId] = useState(() => `BK-${Math.floor(Math.random() * 900000) + 100000}`)


    useEffect(() => {
        API.get('/listings/three').then((res) => setHotList(res.data))
    }, [])

    return (
        <>
            <div className="min-h-screen bg-[#0f1629] flex items-center justify-center px-4" >
                <div className='' >
                    <div className="flex flex-col text-center" >
                        {/* Сюда вставить картинку галочки */}
                        <div className=""><img className='bg-[#f5a623]/5 rounded-full w-30 my-8 m-auto' src={check} alt="Галочка" /></div>
                        <div className="font-bold text-5xl text-white">Booking Confirmed!</div>
                        <p className="text-zinc-500 font-semibold mt-4" >Your reservation has been successfully confirmed</p>
                    </div>
                    {/* Карточка с инфой о брони */}
                    <div className="mt-8 border border-white/10 bg-white/5 rounded-2xl px-8" >
                        <div className="flex justify-between mt-4" >
                            {/* ВСЕ ИЗ ЭТОГО ПОЛУЧАТЬ С БЕКА */}
                            {/* ВРЕМЕННО ХАРДКОД */}
                            <div className="px-4 py-2" >
                                <div className="text-white font-semibold text-2xl" >{listing.title}</div>
                                <div className="text-zinc-500 my-4" >Бронирвоание #{bookingId}</div>
                                {/* Здесь сгенерировать айдишник на рандом */}
                            </div>
                            <div className="px-4 py-2 text-right">
                                {/* Получить сумму */}
                                <div className="text-[#f5a623] font-bold text-2xl">{total}</div>
                                <div className="text-zinc-500 my-4">Сумма</div>
                            </div>
                        </div>
                        <hr className="text-zinc-500 mx-4" />
                        <div className='px-4 py-2 mt-4' >
                            <div className='flex flex-col gap-8' >
                                <div className='flex gap-8' >
                                    <div ><img className='w-14 bg-[#f5a623]/5 rounded-2xl' src={lupa} alt="" /></div>
                                    <div>
                                        <p className='text-zinc-600' >Адрес</p>
                                        <div className='text-white font-semibold' >
                                            {/* Пока так потом нужно будет добавить адрес */}
                                            {listing.city}</div>
                                    </div>
                                </div>
                                <div className='flex gap-8' >
                                    <div ><img className='w-14 h-14 object-contain bg-[#f5a623]/5 rounded-2xl' src={kaligoscope} alt="" /></div>
                                    <div>
                                        <p className='text-zinc-600' >Дата</p>
                                        <div className='text-white font-semibold' >{date}</div>
                                    </div>
                                </div>
                                <div className='flex gap-8' >
                                    <div ><img className='w-14 bg-[#f5a623]/5 rounded-2xl' src={time} alt="" /></div>
                                    <div>
                                        <p className='text-zinc-600' >Время</p>
                                        <div className='text-white font-semibold' >{hours} часов</div>
                                    </div>
                                </div>
                                <div className='flex gap-8 mb-4' >
                                    <div ><img className='w-14 bg-[#f5a623]/5 rounded-2xl' src={lupa} alt="" /></div>
                                    <div>
                                        <p className='text-zinc-600' >Кол-во человек</p>
                                        <div className='text-white font-semibold' >{guests}</div>
                                    </div>
                                </div>

                            </div>
                            <hr className="border-zinc-700 -mx-11" />
                            <div className='-mx-8 px-8 py-4 my-4 bg-white/5 rounded-2xl'>
                                <div className='my-4'>
                                    <div className='text-zinc-400'>На ваш электронный адрес было отправлено электронное письмо с подтверждением платежа, содержащее все детали и инструкции по доступу</div>
                                    {/* Сюда еще картинку галочки */}
                                    <p className='text-white mt-4' >Платеж подтвержден</p>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className='flex flex-col gap-4 mt-8 md:flex-row'>
                        <button className='w-full bg-[#f5a623] text-[#0f1629] font-bold py-4 rounded-xl hover:bg-[#e09610] transition text-lg'>
                            Просмотр Моих бронирований
                        </button>
                        <button onClick={() => navigate('/')} className='w-full bg-zinc-700 text-white font-bold py-4 rounded-xl hover:bg-zinc-600 transition text-lg'>
                            На главную
                        </button>
                    </div>
                    <div className='mt-12' >
                        <div className='text-white font-bold my-8 text-3xl text-center' >Горячие предложения</div>
                        <div className="grid gap-4 justify-center sm:grid-cols-2 lg:grid-cols-3 mx-auto max-w-[1280px]">
                            {hotList.map((l: Listing, i: number) => (
                                <motion.div
                                    key={l.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.1 }}
                                >
                                    <GlowCard

                                        className="bg-[#1a2035] rounded-2xl overflow-hidden w-full shadow-xl border border-white/10 mx-auto"
                                    >
                                        {/* Картинка */}
                                        <div className="w-full h-70 overflow-hidden">
                                            <img src={l.image_url} alt="space" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
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

                                            {/* Цена + кнопка */}
                                            <div className="flex items-center justify-between mt-1">
                                                <div className="text-white text-lg font-bold">
                                                    <span className="text-[#f5a623]">₽{l.price_per_night}</span>
                                                    <span className="text-[#8b93a8] text-xs font-normal">/ночь</span>
                                                </div>

                                            </div>

                                        </div>
                                    </GlowCard>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    <div className='text-white font-bold my-8 text-3xl text-center' >Популярные брони</div>
                </div>
            </div>
        </>
    )
}