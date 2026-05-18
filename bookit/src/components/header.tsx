import { Link, useNavigate } from 'react-router-dom'
import avatar from '../assets/Avatar.png'
import logo from '../assets/logo.png'
import { useAuth } from '../context/AuthContext'
import Search from './search'

export default function Header() {
	const { user, logout } = useAuth()
	const navigate = useNavigate()

	function handleLogout() {
		logout()
		navigate('/')
	}

	return (
		<>
			<nav className='bg-[#0f1629]' >
				<div className="flex justify-between gap-4 mx-8 py-4 md:px-30 items-center">

					<div className="logotip flex flex-row items-center gap-2">
						<div className="img-logo w-8"><img className='rounded-xl' src={logo} alt="Logo" /></div>
						<Link to="/" className="logo text-lg font-semibold text-white hover:text-[#f5a623] transition">Bookit</Link>
					</div>

					<div className="hidden md:flex items-center gap-6">
						{user?.role === 'admin' && (
							<Link to="/admin" className="text-white hover:text-[#f5a623] transition font-medium">Админ</Link>
						)}
						<Search />
					</div>

					<div className="accoutn flex flex-row items-center gap-4">
						{user ? (
							<>
								<Link to="/user">
									<div className="acc-name text-zinc-400">{user.name}</div>
								</Link>
								<div className="acc-image bg-gray-500 rounded-full px-2 py-2 w-9 h-9"><img src={avatar} alt="Avatar" /></div>
								<button
									onClick={handleLogout}
									className="text-zinc-400 hover:text-white text-sm transition"
								>
									Выйти
								</button>
							</>
						) : (
							<Link
								to="/login"
								className="bg-[#f5a623] text-[#0f1629] font-semibold px-4 py-2 rounded-xl hover:bg-[#e09610] transition text-sm"
							>
								Войти
							</Link>
						)}
					</div>
				</div>
				<hr className='text-gray-600' />
			</nav>

		</>
	)
}
