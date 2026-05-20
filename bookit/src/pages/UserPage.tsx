import kaleidoscope from '../assets/kaleidoscope.png'
import heart from '../assets/heart.png'
import Bug from '../components/bug.tsx'
import { useState, useEffect } from 'react'
import API from '../API/api.ts'
import { useAuth } from '../context/AuthContext.tsx'
import GlowCard from '../components/GlowCard.tsx'
import { useNavigate } from 'react-router-dom'


export default function UserPage() {
    const { user, setUser } = useAuth()
    const [favorites, setFavorites] = useState<Listing[]>([])
    const [activeTab, setActiveTab] = useState('upcoming')

    const navigate = useNavigate()
    const [userData, setUserData] = useState(null)
    const [userEmail, setUserEmail] = useState('')
    const [userName, setUserName] = useState('')
    async function handleUpdate() {
        try {
            const res = await API.put('/users/me', { full_name: userName, email: userEmail })
            const updatedUser: User = {
                ...user!,
                full_name: res.data.full_name,
                email: res.data.email,
            }
            localStorage.setItem('user', JSON.stringify(updatedUser))
            setUser(updatedUser)
            setUserName(updatedUser.full_name)
            setUserEmail(updatedUser.email)
            alert('Сохранено!')
        } catch (e: any) {
            alert(e.response?.data?.detail || 'Ошибка')
        }
    }
    useEffect(() => {
        async function fetchUser() {
            const { data } = await API.get('/auth/me')
            setUserData(data)
            setUserEmail(data.email)
            setUserName(data.full_name)
        }
        fetchUser()
    }, []) // [] означает — выполнить один раз при загрузке страницы

    useEffect(() => {
        async function fetchFavorites() {
            const { data: freshUser } = await API.get('/auth/me')  // свежие данные с БД
            if (!freshUser?.favorite_listings) return

            const ids = freshUser.favorite_listings.split(',').filter(Boolean).map(Number)
            const results = await Promise.all(ids.map(id => API.get(`/listings/${id}`)))
            setFavorites(results.map(res => res.data))
        }
        fetchFavorites()
    }, [])

    return (
        <>
            <div className="min-h-screen bg-[#0f1629] ">
                <Bug />


                <div className="di">
                    <div className="text-5xl tracking-wide text-white font-semibold pt-12 mx-6">My Dashboard</div>
                    <p className="text-lg text-gray-600 py-2 mx-6">Manage your bookings and preferences</p>
                </div>
                <div className="di m-4 flex flex-col gap-6 md:flex-row md:gap-8 md:mx-6 md:max-w-8xl">
                    <div className="kv flex-1 bg-white/5 border border-gray-700 rounded-xl px-3 py-3 ">
                        <div className=""><img className="  w-18 h-18 object-cover" src={kaleidoscope} alt="Kaleidoscope" /></div>
                        {/* Сделать потом апи запрос и получить цифры */}
                        <div className=" ml-4 text-4xl font-bold text-white">{userData?.total_bookings || 0}</div>
                        <p className="text-lg ml-4 mt-2 mb-4 text-gray-600">Total Bookings</p>
                    </div>
                    <div className="kv flex-1 bg-white/5 border border-gray-700 rounded-xl px-3 py-3 ">
                        {/* картинку сгенерировать потом */}
                        <div className=""><img className="  w-18 h-18 object-cover" src={kaleidoscope} alt="Kaleidoscope" /></div>
                        {/* Сделать потом апи запрос и получить цифры */}
                        <div className=" ml-4 text-4xl font-bold text-white">{userData?.total_hours_booked || 0}</div>
                        <p className="text-lg ml-4 mt-2 mb-4 text-gray-600">Hours Booked</p>
                    </div>
                    <div className="kv flex-1 bg-white/5 border border-gray-700 rounded-xl px-3 py-3 ">
                        <div className=""><img className="  w-18 h-18 object-cover" src={heart} alt="Heart" /></div>
                        {/* Сделать потом апи запрос и получить цифры */}
                        <div className=" ml-4 text-4xl font-bold text-white">{userData?.favorite_listings?.length || 0}</div>
                        <p className="text-lg ml-4 mt-2 mb-4 text-gray-600">Favorite Spaces</p>
                    </div>
                    <div className="kv flex-1 bg-white/5 border border-gray-700 rounded-xl px-3 py-3 ">
                        {/* картинку сгенерировать потом */}
                        <div className=""><img className="  w-18 h-18 object-cover" src={kaleidoscope} alt="Kaleidoscope" /></div>
                        {/* Сделать потом апи запрос и получить цифры */}
                        <div className=" ml-4 text-4xl font-bold text-white">{userData?.rating?.toFixed(1) || 0}</div>
                        <p className="text-lg ml-4 mt-2 mb-4 text-gray-600">Average Rating</p>
                    </div>
                </div>
                <div className="div md:flex ">

                    <div className="swaper mx-4 mt-12  md:max-w-60 md:mt-12 md:ml-6 bg-white/5 border border-gray-700 rounded-xl px-3 py-3 ">
                        <div className="buttons flex flex-col  text-left md:flex-col ">
                            {/* /* Кнопки для переключения между разделами */}
                            {/* иконки потом сделать нормально */}
                            <button
                                className={`w-full rounded-2xl border border-transparent px-4 py-3 text-left text-lg font-semibold text-white hover:bg-white/10 md:w-auto ${activeTab === 'upcoming' ? 'bg-[#f5a623] text-black' : ''}`}
                                onClick={() => setActiveTab('upcoming')}
                            >
                                📅 Upcoming
                            </button>
                            <button
                                className={`w-full rounded-2xl border border-transparent px-4 py-3 text-left text-lg font-semibold text-white hover:bg-white/10 md:w-auto ${activeTab === 'past' ? 'bg-[#f5a623] text-black' : ''}`}
                                onClick={() => setActiveTab('past')}
                            >
                                ⏳ Past
                            </button>
                            <button
                                className={`w-full rounded-2xl border border-transparent px-4 py-3 text-left text-lg font-semibold text-white hover:bg-white/10 md:w-auto ${activeTab === 'favorite' ? 'bg-[#f5a623] text-black' : ''}`}
                                onClick={() => setActiveTab('favorite')}
                            >
                                ⭐ Favorite
                                {/* нужно будет сделать это в отдельную таблицу */}
                            </button>
                            <button
                                className={`w-full rounded-2xl border border-transparent px-4 py-3 text-left text-lg font-semibold text-white hover:bg-white/10 md:w-auto ${activeTab === 'travel' ? 'bg-[#f5a623] text-black' : ''}`}
                                onClick={() => setActiveTab('travel')}
                            >
                                🗺️ Travel Map
                            </button>
                            <button
                                className={`w-full rounded-2xl border border-transparent px-4 py-3 text-left text-lg font-semibold text-white hover:bg-white/10 md:w-auto ${activeTab === 'settings' ? 'bg-[#f5a623] text-black' : ''}`}
                                onClick={() => setActiveTab('settings')}
                            >
                                ⚙️ Settings
                            </button>
                        </div>
                    </div>
                    <div className="content mt-6">
                        {/* Здесь будет отображаться контент в зависимости от выбранного раздела */}
                        {activeTab === 'upcoming' && <div className="text-white text-lg">Your upcoming bookings will appear here.</div>}
                        {activeTab === 'past' && <div className="text-white text-lg">Your past bookings will appear here.</div>}
                        {activeTab === 'favorite' && (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {favorites.length === 0
                                    ? <p className="text-zinc-400">Нет избранных мест</p>
                                    : favorites.map((l) => (
                                        <GlowCard
                                            key={l.id}
                                            onClick={() => navigate(`/listing/${l.id}`)}
                                            className="bg-[#1a2035] rounded-2xl overflow-hidden border border-white/10 cursor-pointer"
                                        >
                                            <div className="w-full h-48 overflow-hidden">
                                                <img src={l.image_url} alt={l.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                            </div>
                                            <div className="p-4 flex flex-col gap-2">
                                                <h2 className="text-white text-base font-semibold">{l.title}</h2>
                                                <div className="flex items-center gap-1 text-[#8b93a8] text-xs">
                                                    <span>📍</span>
                                                    <span>{l.city}</span>
                                                </div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {l.amenities.split(',').map((item, i) => (
                                                        <span key={i} className="text-[#8b93a8] text-xs border border-white/10 rounded-lg px-2 py-1 bg-white/5">
                                                            {item.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                                <hr className="border-white/10 mt-1" />
                                                <div className="flex items-center justify-between mt-1">
                                                    <div>
                                                        <span className="text-[#f5a623] text-lg font-bold">€{l.price_per_night}</span>
                                                        <span className="text-[#8b93a8] text-xs">/ночь</span>
                                                    </div>
                                                    <button className="bg-[#f5a623] text-[#0f1629] text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#e09610] transition active:scale-95">
                                                        Забронировать
                                                    </button>
                                                </div>
                                            </div>
                                        </GlowCard>
                                    ))
                                }
                            </div>
                        )}
                        {activeTab === 'travel' && <div className="text-white text-lg">Your travel map will appear here.</div>}
                        {activeTab === 'settings' && <div className="text-white text-lg">
                            <div className='font-bold m-8 text-2xl'>Settings</div>
                            <div className=' bg-white/5 m-8 border border-gray-700 rounded-xl px-3 py-3 md: min-w-220' >
                                <div className='p-4 font-semibold' >Profile information</div>
                                <form onSubmit={(e) => { e.preventDefault(); handleUpdate() }} className='flex flex-col gap-4'>
                                    <div className='flex flex-col px-4'>
                                        <label className='px-4 mt-4 block' htmlFor="fullName">Full Name</label>
                                        <input className='rounded-xl mt-2 px-2 py-2 border border-gray-600 font-semibold text-[#ced0d3] bg-[#2a3147] w-full' value={userName} onChange={(e) => setUserName(e.target.value)} type="text" id="fullName" />
                                    </div>
                                    <div className='flex flex-col px-4 pb-8'>
                                        <label htmlFor="email" className='px-4 mt-4 block'>Email</label>
                                        <input className='rounded-xl mt-2 px-2 py-2 border border-gray-600 font-semibold text-[#ced0d3] bg-[#2a3147] w-full' value={userEmail} onChange={(e) => setUserEmail(e.target.value)} type="email" id="email" />
                                    </div>
                                    <div className='mx-6'>
                                        <button type="submit" className='bg-[#f5a623] text-[#0f1629] text-xl font-bold px-8 py-4 rounded-xl hover:bg-[#e09610] transition active:scale-95'>
                                            Сохранить
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>}
                    </div>
                </div>
            </div>
        </>
    )
}