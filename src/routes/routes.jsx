import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import Settings from '../pages/Settings/Settings'
import Home from '../pages/Home/Home'
import Orders from '../pages/Orders/Orders'
import ProductsPage from '../pages/Products/ProductsPage'
import Login from '../pages/login/login'
import Register from '../pages/register/register'
import RegisterSuccess from '../pages/register/RegisterSuccess'
import UserProfile from '../pages/UserProfile/UserProfile'
import { GuestOnlyRoute, ProtectedRoute } from './RouteGuards'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-success" element={<RegisterSuccess />} />
        </Route>

        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/inicio" replace />} />
          <Route path="/inicio" element={<Home />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/perfil" element={<UserProfile />} />
            <Route path="/configuracion" element={<Settings />} />
            <Route path="/crud-1" element={<Orders />} />
            <Route path="/crud-2" element={<ProductsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/inicio" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
