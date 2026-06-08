import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import API from '../API/api'
import check from '../assets/check2.png'
import kaligoscope from '../assets/kaleidoscope.png'
import lupa from '../assets/lupa.png'
import time from '../assets/time.png'
import GlowCard from '../components/GlowCard'
import Bug from '../components/bug'

// ─── Confetti ────────────────────────────────────────────────────────────────
const COLORS = ['#f5a623', '#ff6b6b', '#4ecdc4', '#a8e6cf', '#ffd93d', '#c77dff', '#74b9ff', '#fd79a8']

function useConfetti() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animFrameRef = useRef<number>(0)
    const isRunning = useRef(false)

    const launch = useCallback(() => {
        if (isRunning.current) return
        isRunning.current = true
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const particles: any[] = []
        const count = 120
        for (let i = 0; i < count; i++) {
            const side = i < count / 2 ? 'left' : 'right'
            particles.push({
                x: side === 'left' ? -10 : window.innerWidth + 10,
                y: window.innerHeight * (0.2 + Math.random() * 0.4),
                vx: side === 'left' ? 6 + Math.random() * 8 : -(6 + Math.random() * 8),
                vy: -(4 + Math.random() * 8),
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                shape: (['rect', 'circle', 'triangle'] as const)[Math.floor(Math.random() * 3)],
                size: 6 + Math.random() * 10,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 8,
                opacity: 1,
            })
        }

        const ctx = canvas.getContext('2d')!
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            let alive = false
            for (const p of particles) {
                if (p.opacity <= 0) continue
                alive = true
                p.vy += 0.25
                p.vx *= 0.99
                p.x += p.vx
                p.y += p.vy
                p.rotation += p.rotationSpeed
                if (p.y > canvas.height * 0.7) p.opacity -= 0.015
                p.opacity = Math.max(0, p.opacity)

                ctx.save()
                ctx.globalAlpha = p.opacity
                ctx.translate(p.x, p.y)
                ctx.rotate((p.rotation * Math.PI) / 180)
                ctx.fillStyle = p.color
                if (p.shape === 'rect') {
                    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
                } else if (p.shape === 'circle') {
                    ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill()
                } else {
                    ctx.beginPath(); ctx.moveTo(0, -p.size / 2)
                    ctx.lineTo(p.size / 2, p.size / 2); ctx.lineTo(-p.size / 2, p.size / 2)
                    ctx.closePath(); ctx.fill()
                }
                ctx.restore()
            }
            if (alive) { animFrameRef.current = requestAnimationFrame(draw) }
            else { isRunning.current = false; ctx.clearRect(0, 0, canvas.width, canvas.height) }
        }
        animFrameRef.current = requestAnimationFrame(draw)
    }, [])

    useEffect(() => () => cancelAnimationFrame(animFrameRef.current), [])
    return { canvasRef, launch }
}

export default function PayPage() {
    const { state } = useLocation()
    const navigate = useNavigate()
    const { listing, guests, hours, total, date } = state
    const [hotList, setHotList] = useState([])
    const [popularListings, setPopularListings] = useState([])
    const [listingRating, setListingRating] = useState<{ average_rating: number; reviews_count: number } | null>(null)
    const [bookingId] = useState(() => `BK-${Math.floor(Math.random() * 900000) + 100000}`)
    const { canvasRef, launch } = useConfetti()

    useEffect(() => {
        API.get('/listings/three').then((res) => setHotList(res.data))
        API.get("/listing/popular").then((res1) => setPopularListings(res1.data))
        API.get(`/listings/${listing.id}/rating`).then((res) => setListingRating(res.data)).catch(() => {})
        const t = setTimeout(launch, 400)
        return () => clearTimeout(t)
    }, [listing.id, launch])

    return (
        <>
            {/* Confetti canvas */}
            <canvas ref={canvasRef} className="fixed inset-0 z-50 pointer-events-none" style={{ width: '100vw', height: '100vh' }} />

            <div className="min-h-screen bg-[#0f1629] flex items-center justify-center px-4">
                <div className=''>
                    <div className="flex flex-col text-center">
                        <div className=""><img className='bg-[#f5a623]/5 rounded-full w-30 my-8 m-auto' src={check} alt="Галочка" /></div>
                        <div className="font-bold text-5xl text-white">Booking Confirmed!</div>
                        <p className="text-zinc-500 font-semibold mt-4">Your reservation has been successfully confirmed</p>
                    </div>
                    <div className="mt-8 border border-white/10 bg-white/5 rounded-2xl px-8">
                        <div className="flex justify-between mt-4">
                            <div className="px-4 py-2">
                                <div className="text-white font-semibold text-2xl">{listing.title}</div>
                        <div className="flex items-center gap-2 mt-2 text-sm text-[#f5a623]">
                            <span>★</span>
                            <span>{listingRating ? listingRating.average_rating.toFixed(1) : '—'}</span>
                            <span className="text-white/60">({listingRating ? listingRating.reviews_count : 0} отзывов)</span>
                        </div>
                        <div className="text-zinc-500 my-4">Бронирвоание #{bookingId}</div>
                    </div>
                            <div className="px-4 py-2 text-right">
                                <div className="text-[#f5a623] font-bold text-2xl">{total}</div>
                                <div className="text-zinc-500 my-4">Сумма</div>
                            </div>
                        </div>
                        <hr className="text-zinc-500 mx-4" />
                        <div className='px-4 py-2 mt-4'>
                            <div className='flex flex-col gap-8'>
                                <div className='flex gap-8'>
                                    <div><img className='w-14 bg-[#f5a623]/5 rounded-2xl' src={lupa} alt="" /></div>
                                    <div>
                                        <p className='text-zinc-600'>Адрес</p>
                                        <div className='text-white font-semibold'>{listing.city}</div>
                                    </div>
                                </div>
                                <div className='flex gap-8'>
                                    <div><img className='w-14 h-14 object-contain bg-[#f5a623]/5 rounded-2xl' src={kaligoscope} alt="" /></div>
                                    <div>
                                        <p className='text-zinc-600'>Дата</p>
                                        <div className='text-white font-semibold'>{date}</div>
                                    </div>
                                </div>
                                <div className='flex gap-8'>
                                    <div><img className='w-14 bg-[#f5a623]/5 rounded-2xl' src={time} alt="" /></div>
                                    <div>
                                        <p className='text-zinc-600'>Время</p>
                                        <div className='text-white font-semibold'>{hours} часов</div>
                                    </div>
                                </div>
                                <div className='flex gap-8 mb-4'>
                                    <div><img className='w-14 bg-[#f5a623]/5 rounded-2xl' src={lupa} alt="" /></div>
                                    <div>
                                        <p className='text-zinc-600'>Кол-во человек</p>
                                        <div className='text-white font-semibold'>{guests}</div>
                                    </div>
                                </div>
                            </div>
                            <hr className="border-zinc-700 -mx-11" />
                            <div className='-mx-8 px-8 py-4 my-4 bg-white/5 rounded-2xl'>
                                <div className='my-4'>
                                    <div className='text-zinc-400'>На ваш электронный адрес было отправлено электронное письмо с подтверждением платежа, содержащее все детали и инструкции по доступу</div>
                                    {/* Пульсирующий индикатор */}
                                    <div className='flex items-center gap-2 mt-4'>
                                        <span className='relative flex h-2.5 w-2.5'>
                                            <motion.span
                                                className='absolute inline-flex h-full w-full rounded-full bg-green-400'
                                                animate={{ scale: [1, 2], opacity: [0.7, 0] }}
                                                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                                            />
                                            <span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400' />
                                        </span>
                                        <p className='text-white'>Платеж подтвержден</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-col gap-4 mt-8 md:flex-row'>
                        <button onClick={() => navigate('/user')} className='w-full bg-[#f5a623] text-[#0f1629] font-bold py-4 rounded-xl hover:bg-[#e09610] transition text-lg'>
                            Просмотр Моих бронирований
                        </button>
                        <button onClick={() => navigate('/')} className='w-full bg-zinc-700 text-white font-bold py-4 rounded-xl hover:bg-zinc-600 transition text-lg'>
                            На главную
                        </button>
                    </div>
                    <div className='mt-12'>
                        <div className='text-white font-bold my-8 text-3xl text-center'>Горячие предложения</div>
                        <div className="grid gap-4 justify-center sm:grid-cols-2 lg:grid-cols-3 mx-auto max-w-[1280px]">
                            {hotList.map((l: Listing, i: number) => (
                                <motion.div
                                    key={l.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.1 }}
                                >
                                    <GlowCard className="bg-[#1a2035] rounded-2xl overflow-hidden w-full shadow-xl border border-white/10 mx-auto">
                                        <div className="w-full h-70 overflow-hidden">
                                            <img src={l.image_url} alt="space" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                        </div>
                                        <div className="p-4 py-4 flex flex-col gap-2">
                                            <h2 className="text-white text-base font-semibold leading-tight">{l.title}</h2>
                                            <div className="flex items-center gap-1 text-[#8b93a8] text-xs">
                                                <span>📍</span>
                                                <span>{l.city}</span>
                                            </div>
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

                    {/* Популярные брони */}
                    <div className='text-white font-bold my-8 text-3xl text-center'>
                        Популярные брони
                    </div>
                    <div className="space-y-3 mb-12">
                        {popularListings.map((l: any, index: number) => (
                            <motion.div
                                key={l.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                            >
                                <div className="bg-white/5 rounded-2xl flex items-center px-6 py-4 gap-4">
                                    <span className="text-white/40 font-bold text-xl w-8 shrink-0">
                                        #{index + 1}
                                    </span>
                                    <img
                                        src={l.image_url}
                                        alt={l.title}
                                        className="w-20 h-20 rounded-xl object-cover shrink-0"
                                    />
                                    <div className="flex flex-col gap-1 flex-1">
                                        <span className="text-white font-semibold text-lg">{l.title}</span>
                                        <span className="text-white/50 text-sm flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {l.city}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <span className="text-white font-bold text-lg flex items-center gap-1">
                                            <span className="text-yellow-400">★</span>
                                            {l.average_rating ? l.average_rating.toFixed(1) : "—"}
                                        </span>
                                        <span className="text-white/50 text-sm">{l.booking_count} броней</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
            <Bug />
        </>
    )
}