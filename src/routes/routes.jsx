import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import CrudOnePlaceholder from '../pages/CrudOnePlaceholder/CrudOnePlaceholder'
import CrudTwoPlaceholder from '../pages/CrudTwoPlaceholder/CrudTwoPlaceholder'
import Home from '../pages/Home/Home'
import Login from '../pages/login'
import UserProfile from '../pages/UserProfile/UserProfile'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/inicio" replace />} />
          <Route path="/inicio" element={<Home />} />
          <Route path="/perfil" element={<UserProfile />} />
          <Route path="/crud-1" element={<CrudOnePlaceholder />} />
          <Route path="/crud-2" element={<CrudTwoPlaceholder />} />
        </Route>

        <Route path="*" element={<Navigate to="/inicio" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
