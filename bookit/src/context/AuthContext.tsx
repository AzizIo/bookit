import { createContext, useContext, useEffect, useState } from 'react'

export interface User {
	email: string
	name: string
	role: 'admin' | 'user'
}

interface AuthContextType {
	user: User | null
	login: (email: string, password: string) => string | null
	register: (name: string, email: string, password: string) => string | null
	logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const ADMIN_EMAIL = 'admin@bookit.com'
const ADMIN_PASSWORD = 'admin123'

function getUsers(): { email: string; name: string; password: string; role: 'admin' | 'user' }[] {
	const raw = localStorage.getItem('bookit_users')
	if (!raw) return []
	return JSON.parse(raw)
}

function saveUsers(users: { email: string; name: string; password: string; role: 'admin' | 'user' }[]) {
	localStorage.setItem('bookit_users', JSON.stringify(users))
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)

	useEffect(() => {
		const saved = localStorage.getItem('bookit_user')
		if (saved) setUser(JSON.parse(saved))
	}, [])

	function login(email: string, password: string): string | null {
		if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
			const u: User = { email, name: 'Admin', role: 'admin' }
			setUser(u)
			localStorage.setItem('bookit_user', JSON.stringify(u))
			return null
		}

		const users = getUsers()
		const found = users.find((u) => u.email === email && u.password === password)
		if (!found) return 'Неверный email или пароль'

		const u: User = { email: found.email, name: found.name, role: found.role }
		setUser(u)
		localStorage.setItem('bookit_user', JSON.stringify(u))
		return null
	}

	function register(name: string, email: string, password: string): string | null {
		if (email === ADMIN_EMAIL) return 'Этот email уже занят'

		const users = getUsers()
		if (users.some((u) => u.email === email)) return 'Этот email уже занят'

		users.push({ email, name, password, role: 'user' })
		saveUsers(users)

		const u: User = { email, name, role: 'user' }
		setUser(u)
		localStorage.setItem('bookit_user', JSON.stringify(u))
		return null
	}

	function logout() {
		setUser(null)
		localStorage.removeItem('bookit_user')
	}

	return (
		<AuthContext.Provider value={{ user, login, register, logout }}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used within AuthProvider')
	return ctx
}
