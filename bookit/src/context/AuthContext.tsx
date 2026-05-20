import { createContext, useContext, useEffect, useState } from 'react'
import API from '../API/api'

const ADMIN_EMAIL = 'admin@bookit.com'

export interface User {
  id: number
  email: string
  full_name: string
  role: 'admin' | 'user'
}


interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<string | null>
  register: (name: string, email: string, password: string) => Promise<string | null>
  logout: () => void
  setUser: (user: User) => void
}


const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  async function register(name: string, email: string, password: string): Promise<string | null> {
    try {
      await API.post('/auth/register', { full_name: name, email, password })
      return await login(email, password)
    } catch (e: any) {
      return e.response?.data?.detail || 'Ошибка регистрации'
    }
  }

  async function login(email: string, password: string): Promise<string | null> {
    try {
      const form = new FormData()
      form.append('username', email)
      form.append('password', password)

      const { data } = await API.post('/auth/login', form)
      const { access_token } = data

      const { data: userData } = await API.get('/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      })

      // хардкод роли
      userData.role = userData.email === ADMIN_EMAIL ? 'admin' : 'user'

      setToken(access_token)
      setUser(userData)
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))
      return null
    } catch (e: any) {
      return e.response?.data?.detail || 'Неверный email или пароль'
    }
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}