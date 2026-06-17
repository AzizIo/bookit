import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Header from './components/header'
import { AuthProvider } from './context/AuthContext'
import MainPage from './pages/MainPage'

// MainPage грузим сразу — это главная точка входа для большинства пользователей.
// Остальные страницы — лениво, отдельными чанками: они подгрузятся
// только в момент, когда пользователь реально перейдёт на этот маршрут.
const AdminPage = lazy(() => import('./pages/AdminPage'))
const BookingPage = lazy(() => import('./pages/BookingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const UserPage = lazy(() => import('./pages/UserPage'))
const ListingPage = lazy(() => import('./pages/ListingPage'))
const SubmitListingPage = lazy(() => import('./pages/SubmitListingPage'))
const PayPage = lazy(() => import('./pages/PayPage'))

function PageFallback() {
  return (
    <div className="min-h-screen bg-[#12192c] flex items-center justify-center">
      <div className="text-zinc-400">Загрузка...</div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/listing/:id" element={<ListingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/submit" element={<SubmitListingPage />} />
            <Route path="*" element={<MainPage />} />
            <Route path="/user" element={<UserPage />} />
            <Route path='/pay' element={<PayPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App