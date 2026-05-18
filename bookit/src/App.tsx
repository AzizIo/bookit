import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Header from './components/header'
import { AuthProvider } from './context/AuthContext'
import AdminPage from './pages/AdminPage'
import BookingPage from './pages/BookingPage'
import LoginPage from './pages/LoginPage'
import MainPage from './pages/MainPage'
import RegisterPage from './pages/RegisterPage'
import UserPage from './pages/UserPage'
import ListingPage from './pages/ListingPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/listing/:id" element={<ListingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<MainPage />} />
          <Route path="/user" element={<UserPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
