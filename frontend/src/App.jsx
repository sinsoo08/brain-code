import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainPage         from './pages/MainPage'
import LoginPage        from './pages/LoginPage'
import SignupPage       from './pages/SignupPage'
import KidInfoPage      from './pages/KidInfoPage'
import AvatarPage       from './pages/AvatarPage'
import ProfilePage      from './pages/ProfilePage'
import DashboardPage    from './pages/DashboardPage'
import OAuth2RedirectPage from './pages/OAuth2RedirectPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<MainPage />} />
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/signup"         element={<SignupPage />} />
        <Route path="/kid"            element={<KidInfoPage />} />
        <Route path="/avatar"         element={<AvatarPage />} />
        <Route path="/profile"        element={<ProfilePage />} />
        <Route path="/dashboard"      element={<DashboardPage />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />
        <Route path="*"               element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
