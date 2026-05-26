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
import SubmitListingPage from './pages/SubmitListingPage'
import PayPage from './pages/PayPage'

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
          <Route path="/submit" element={<SubmitListingPage />} />
          <Route path="*" element={<MainPage />} />
          <Route path="/user" element={<UserPage />} />
          <Route path='/pay' element={<PayPage/>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
