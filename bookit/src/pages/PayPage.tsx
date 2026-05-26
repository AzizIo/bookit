export default function PayPage() {
    return (
        <>
            <div className="min-h-screen bg-[#0f1629] flex items-center justify-center px-4" >
                <div>
                    <div className="flex flex-col text-center" >
                        {/* Сюда вставить картинку галочки */}
                        <div className="" ><img src="" alt="Галочка" /></div>
                        <div className="font-bold text-5xl text-white">Booking Confirmed!</div>
                        <p className="text-zinc-500 font-semibold" >Your reservation has been successfully confirmed</p>
                    </div>
                    {/* Карточка с инфой о брони */}
                    <div className="mt-4 border border-white/10 bg-white/5 rounded-2xl" >
                        <div className="flex justify-between" >
                            {/* ВСЕ ИЗ ЭТОГО ПОЛУЧАТЬ С БЕКА */}
                            {/* ВРЕМЕННО ХАРДКОД */}
                            <div className="px-4 py-2" >
                                <div className="text-white font-semibold" >Modern Co-Working Space</div>
                                <div className="text-zinc-500 my-4" >Booking #BK-619685</div>  
                                {/* Здесь сгенерировать айдишник на рандом */}
                            </div>
                            <div className="px-4 py-2 text-right">
                                {/* Получить сумму */}
                                <div className="text-[#f5a623] font-bold text-2xl">180Р</div>
                                <div className="text-zinc-500 my-4">Total amount</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}