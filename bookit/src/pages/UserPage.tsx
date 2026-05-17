import kaleidoscope from '../assets/kaleidoscope.png'
import heart from '../assets/heart.png'
import Bug from '../components/bug.tsx'
export default function UserPage() {
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
                        <div className=" ml-4 text-4xl font-bold text-white">12</div>   
                        <p className="text-lg ml-4 mt-2 mb-4 text-gray-600">Total Bookings</p>
                    </div>
                    <div className="kv flex-1 bg-white/5 border border-gray-700 rounded-xl px-3 py-3 ">
                        {/* картинку сгенерировать потом */}
                        <div className=""><img className="  w-18 h-18 object-cover" src={kaleidoscope} alt="Kaleidoscope" /></div>
                        {/* Сделать потом апи запрос и получить цифры */}
                        <div className=" ml-4 text-4xl font-bold text-white">48</div>   
                        <p className="text-lg ml-4 mt-2 mb-4 text-gray-600">Hours Booked</p>
                    </div>
                    <div className="kv flex-1 bg-white/5 border border-gray-700 rounded-xl px-3 py-3 ">
                        <div className=""><img className="  w-18 h-18 object-cover" src={heart} alt="Heart" /></div>
                        {/* Сделать потом апи запрос и получить цифры */}
                        <div className=" ml-4 text-4xl font-bold text-white">5</div>   
                        <p className="text-lg ml-4 mt-2 mb-4 text-gray-600">Favorite Spaces</p>
                    </div>
                    <div className="kv flex-1 bg-white/5 border border-gray-700 rounded-xl px-3 py-3 ">
                        {/* картинку сгенерировать потом */}
                        <div className=""><img className="  w-18 h-18 object-cover" src={kaleidoscope} alt="Kaleidoscope" /></div>
                        {/* Сделать потом апи запрос и получить цифры */}
                        <div className=" ml-4 text-4xl font-bold text-white">4.9</div>   
                        <p className="text-lg ml-4 mt-2 mb-4 text-gray-600">Average Rating</p>
                    </div>
                    
                    


                </div>
            </div>
        </>
    )
}