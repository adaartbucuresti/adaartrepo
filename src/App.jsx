import { AnimatePresence, motion } from 'framer-motion'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import { AdminRoute } from './components/ProtectedRoute.jsx'
import SmoothScroll from './components/SmoothScroll.jsx'
import HomePage from './pages/HomePage.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import ProductDetailPage from './pages/ProductDetailPage.jsx'
import ConfiguratorPage from './pages/ConfiguratorPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import MyAccountPage from './pages/MyAccountPage.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminRequests from './pages/admin/AdminRequests.jsx'
import AdminProducts from './pages/admin/AdminProducts.jsx'
import AdminCarousel from './pages/admin/AdminCarousel.jsx'
import AdminTestimonials from './pages/admin/AdminTestimonials.jsx'

function PublicLayout() {
  const MotionDiv = motion.div
  const location = useLocation()
  return (
    <div className="min-h-dvh bg-cream text-text-dark">
      <Navbar />
      <main className="pt-28">
        <AnimatePresence mode="wait">
          <MotionDiv
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Outlet />
          </MotionDiv>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <>
      <SmoothScroll />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/produse" element={<ProductsPage />} />
          <Route path="/produs/:id" element={<ProductDetailPage />} />
          <Route path="/configurator" element={<ConfiguratorPage />} />
          <Route path="/cont" element={<MyAccountPage />} />
          <Route path="/despre" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        <Route
          path="/login"
          element={
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <AuthPage />
            </motion.div>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <AdminDashboard />
              </motion.div>
            </AdminRoute>
          }
        >
          <Route index element={<AdminRequests />} />
          <Route path="cereri" element={<AdminRequests />} />
          <Route path="produse" element={<AdminProducts />} />
          <Route path="carousel" element={<AdminCarousel />} />
          <Route path="testimoniale" element={<AdminTestimonials />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
