import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import CouponList from './pages/CouponsList'
import CouponDetail from './pages/CouponDetail'
import RedemptionHistory from './pages/RedemptionHistory'
import PrivateRoute from './components/PrivateRoute'
import Logout from './pages/Logout'

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
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
