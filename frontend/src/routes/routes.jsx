import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import AnalyticsReportsPage from '../pages/AnalyticsReports/AnalyticsReportsPage'
import CartPage from '../pages/Cart/CartPage'
import CatalogPage from '../pages/Catalog/CatalogPage'
import CheckoutPage from '../pages/Checkout/CheckoutPage'
import Home from '../pages/Home/Home'
import InventoryOffersPage from '../pages/InventoryOffers/InventoryOffersPage'
import Login from '../pages/Login/LoginPage'
import ManageCompaniesPage from '../pages/ManageCompanies/ManageCompaniesPage'
import ManageUsersPage from '../pages/ManageUsers/ManageUsersPage'
import MessagesPage from '../pages/Messages/MessagesPage'
import Orders from '../pages/Orders/Orders'
import OrdersReturnsPage from '../pages/OrdersReturns/OrdersReturnsPage'
import OrderTrackingPage from '../pages/OrderTracking/OrderTrackingPage'
import ProductDetailPage from '../pages/ProductDetail/ProductDetailPage'
import ProductsPage from '../pages/Products/ProductsPage'
import PublishProductPage from '../pages/PublishProduct/PublishProductPage'
import PublishServicePage from '../pages/PublishService/PublishServicePage'
import QuotesPage from '../pages/Quotes/QuotesPage'
import Register from '../pages/Register/Register'
import RegisterSuccess from '../pages/Register/RegisterSuccess'
import SellerDashboardPage from '../pages/SellerDashboard/SellerDashboardPage'
import ServiceDetailPage from '../pages/ServiceDetail/ServiceDetailPage'
import Settings from '../pages/Settings/Settings'
import ShippingRatesPage from '../pages/ShippingRates/ShippingRatesPage'
import UserProfile from '../pages/UserProfile/UserProfile'
import WishlistPage from '../pages/Wishlist/WishlistPage'
import { GuestOnlyRoute, ProtectedRoute } from './RouteGuards'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas de Autenticación (P09 y Login) */}
        <Route element={<GuestOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-success" element={<RegisterSuccess />} />
        </Route>

        {/* Layout Principal con Navbar + Mega-Menú (P02) + Sidebar Dinámico */}
        <Route element={<AppLayout />}>
          {/* Storefront Público (P01 a P07 y P23) */}
          <Route path="/" element={<Navigate to="/inicio" replace />} />
          <Route path="/inicio" element={<Home />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/producto/:id" element={<ProductDetailPage />} />
          <Route path="/servicio/:id" element={<ServiceDetailPage />} />
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/pedido/:id" element={<OrderTrackingPage />} />

          {/* Panel Mi Cuenta (Cliente P08 - P14) */}
          <Route path="/favoritos" element={<WishlistPage />} />
          <Route path="/mensajes" element={<MessagesPage />} />
          <Route path="/cotizaciones" element={<QuotesPage />} />
          <Route path="/mis-compras" element={<OrdersReturnsPage />} />

          {/* Vistas del Emprendedor / Vendedor (ACCESO DIRECTO) */}
          <Route path="/vendedor/dashboard" element={<SellerDashboardPage />} />
          <Route path="/vendedor/publicar-producto" element={<PublishProductPage />} />
          <Route path="/vendedor/publicar-servicio" element={<PublishServicePage />} />
          <Route path="/vendedor/inventario" element={<InventoryOffersPage />} />
          <Route path="/vendedor/despachos" element={<ShippingRatesPage />} />
          <Route path="/crud-2" element={<ProductsPage />} />

          {/* Rutas Protegidas y Paneles de Gestión / Administración (P15 - P22) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/perfil" element={<UserProfile />} />
            <Route path="/configuracion" element={<Settings />} />

            {/* Rutas existentes del equipo */}
            <Route path="/crud-1" element={<Orders />} />

            {/* Vistas del Administrador (P19, P20 y Módulo Analítico Etapa 11) */}
            <Route path="/admin/usuarios" element={<ManageUsersPage />} />
            <Route path="/admin/empresas" element={<ManageCompaniesPage />} />
            <Route path="/admin/reportes" element={<AnalyticsReportsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/inicio" replace />} />
      </Routes>
    </BrowserRouter>
  )
}