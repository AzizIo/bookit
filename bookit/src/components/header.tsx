import avatar from '../assets/avatar.png'
import logo from '../assets/logo.png'
import Search from './search'
export default function Header() {
	return (
		<>
			<nav className='bg-[#0f1629]' >
				<div className="flex justify-between  gap-4 mx-8 py-4 md:px-30">

					<div className="logotip flex flex-row items-center gap-2">
						<div className="img-logo w-8"><img className='rounded-xl' src={logo} alt="Logo" /></div>
						<div className="logo text-lg font-semibold text-white">Bookit</div>
					</div>
					<div className="hidden md:block">
						<Search />
					</div>
					<div className="accoutn  flex flex-row items-center gap-4">
						<div className="acc-name text-zinc-400" >Azizbek</div>
						<div className="acc-image bg-gray-500 rounded-full px-2 py-2 w-9 h-9"><img src={avatar} alt="Avatar" /></div>
					</div>
				</div>
				<hr className='text-gray-600' />
			</nav>

		</>
	)
}