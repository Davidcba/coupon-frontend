import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import CouponList from './pages/CouponsList'
import CouponDetail from './pages/CouponDetail'
import CouponDetails from './pages/AdminCouponDetails'
import RedemptionHistory from './pages/RedemptionHistory'
import AdminCoupons from './pages/AdminCoupons'
import AdminBrands from './pages/AdminBrands'
import AdminDashboard from './pages/AdminDashboard'
import AdminRedemptions from './pages/AdminRedemptions'
import EditCoupon from './pages/EditCoupon'
import CouponRedemptions from './pages/CouponRedemptions'
import SearchResults from './pages/SearchResults'
import PrivateRoute from './components/PrivateRoute'
import Logout from './pages/Logout'
import AdminCreateCoupon from './pages/AdminCreateCoupon'
import AdminCouponDetails from './pages/AdminCouponDetails'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <PrivateRoute>
            <CouponList />
          </PrivateRoute>
        } />
        <Route path="/coupon/:id" element={
          <PrivateRoute>
            <CouponDetail />
          </PrivateRoute>
        } />
        <Route path="/redemptions" element={
          <PrivateRoute>
            <RedemptionHistory />
          </PrivateRoute>
        } />
        <Route path="/search" element={
          <PrivateRoute>
            <SearchResults />
          </PrivateRoute>
        } />
        <Route path="/admin/coupons" element={
          <PrivateRoute>
            <AdminCoupons />
          </PrivateRoute>
        } />
        <Route path="/admin/coupons/new" element={
        <PrivateRoute>
        <AdminCreateCoupon />
        </PrivateRoute>
} />
        <Route path="/admin/brands" element={
          <PrivateRoute>
            <AdminBrands />
          </PrivateRoute>
        } />
        <Route path="/admin/redemptions" element={
          <PrivateRoute>
            <AdminRedemptions />
          </PrivateRoute>
        } />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/coupons/:couponId" element={<AdminCouponDetails />} />
        <Route path="/admin/coupons/:id/edit" element={
          <PrivateRoute>
            <EditCoupon />
          </PrivateRoute>
        } />
        <Route path="/admin/coupons/:id/redemptions" element={
          <PrivateRoute>
            <CouponRedemptions />
          </PrivateRoute>
        } />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
