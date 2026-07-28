import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import 'antd/dist/reset.css';
 
// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
 
// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminMenu from './pages/admin/Menu';
import AdminOrders from './pages/admin/Orders';
import AdminTables from './pages/admin/Tables';
import AdminReservations from './pages/admin/Reservations';
import AdminInventory from './pages/admin/Inventory';
import AdminBilling from './pages/admin/Billing';
import AdminCustomers from './pages/admin/Customers';
import AdminAnalytics from './pages/admin/Analytics';
import AdminLocations from './pages/admin/Locations';
 
// Staff pages
import StaffDashboard from './pages/staff/Dashboard';
import StaffOrders from './pages/staff/Orders';
import StaffTables from './pages/staff/Tables';
import StaffKitchen from './pages/staff/Kitchen';
import StaffReservations from './pages/staff/Reservations';
import StaffInventory from './pages/staff/Inventory';
import StaffBilling from './pages/staff/Billing';
 
// Customer pages
import CustomerHome from './pages/customer/Home';
import CustomerMenu from './pages/customer/Menu';
import CustomerOrders from './pages/customer/Orders';
import CustomerReservations from './pages/customer/Reservations';
import CustomerProfile from './pages/customer/Profile';
import CustomerPayments from './pages/customer/Payments';
 
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
 
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );
 
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
 
  return children;
};
 
const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'staff') return <Navigate to="/staff/dashboard" replace />;
  return <Navigate to="/customer/home" replace />;
};
 
const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/unauthorized" element={
          <div className="flex items-center justify-center h-screen">
            <h1 className="text-2xl font-bold text-red-500">403 - Not Authorized</h1>
          </div>
        } />
 
        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/menu" element={<ProtectedRoute roles={['admin']}><AdminMenu /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute roles={['admin']}><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/tables" element={<ProtectedRoute roles={['admin']}><AdminTables /></ProtectedRoute>} />
        <Route path="/admin/reservations" element={<ProtectedRoute roles={['admin']}><AdminReservations /></ProtectedRoute>} />
        <Route path="/admin/inventory" element={<ProtectedRoute roles={['admin']}><AdminInventory /></ProtectedRoute>} />
        <Route path="/admin/billing" element={<ProtectedRoute roles={['admin']}><AdminBilling /></ProtectedRoute>} />
        <Route path="/admin/customers" element={<ProtectedRoute roles={['admin']}><AdminCustomers /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
        <Route path="/admin/locations" element={<ProtectedRoute roles={['admin']}><AdminLocations /></ProtectedRoute>} />
 
        {/* Staff routes */}
        <Route path="/staff/dashboard" element={<ProtectedRoute roles={['staff']}><StaffDashboard /></ProtectedRoute>} />
        <Route path="/staff/orders" element={<ProtectedRoute roles={['staff']}><StaffOrders /></ProtectedRoute>} />
        <Route path="/staff/tables" element={<ProtectedRoute roles={['staff']}><StaffTables /></ProtectedRoute>} />
        <Route path="/staff/kitchen" element={<ProtectedRoute roles={['staff']}><StaffKitchen /></ProtectedRoute>} />
        <Route path="/staff/reservations" element={<ProtectedRoute roles={['staff']}><StaffReservations /></ProtectedRoute>} />
        <Route path="/staff/inventory" element={<ProtectedRoute roles={['staff']}><StaffInventory /></ProtectedRoute>} />
        <Route path="/staff/billing" element={<ProtectedRoute roles={['staff']}><StaffBilling /></ProtectedRoute>} />
 
        {/* Customer routes */}
        <Route path="/customer/home" element={<ProtectedRoute roles={['customer']}><CustomerHome /></ProtectedRoute>} />
        <Route path="/customer/menu" element={<ProtectedRoute roles={['customer']}><CustomerMenu /></ProtectedRoute>} />
        <Route path="/customer/orders" element={<ProtectedRoute roles={['customer']}><CustomerOrders /></ProtectedRoute>} />
        <Route path="/customer/reservations" element={<ProtectedRoute roles={['customer']}><CustomerReservations /></ProtectedRoute>} />
        <Route path="/customer/payments" element={<ProtectedRoute roles={['customer']}><CustomerPayments /></ProtectedRoute>} />
        <Route path="/customer/profile" element={<ProtectedRoute roles={['customer']}><CustomerProfile /></ProtectedRoute>} />
 
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};
 
export default App;
