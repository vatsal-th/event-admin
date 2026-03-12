import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from './theme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import PaymentRequests from './pages/PaymentRequests';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Employees from './pages/Employees';
import ActivityLogs from './pages/ActivityLogs';
import Complaints from './pages/Complaints';
import ComplaintDetails from './pages/ComplaintDetails';
import TrainingApps from './pages/TrainingApps';
import TrainingVideos from './pages/TrainingVideos';
import CountryManagement from './pages/CountryManagement';
import CategoryManagement from './pages/CategoryManagement';
import AppManagement from './pages/AppManagement';
import BankDetails from './pages/BankDetails';
import WithdrawalHistory from './pages/WithdrawalHistory';
import AdminWallet from './pages/AdminWallet';
import SalaryManagement from './pages/SalaryManagement';
import TopupSettings from './pages/TopupSettings';
import TopupManager from './pages/TopupManager';
import RechargeRequests from './pages/RechargeRequests';
import RechargeHistory from './pages/RechargeHistory';
import NotificationManagement from './pages/NotificationManagement';
import Login from './pages/Login';
import { setCredentials, logout, selectIsAuthenticated, selectUser } from './store/slices/authSlice';
import './App.css';
import AccessDenied from './components/AccessDenied';

const ProtectedRoute = ({ children, permission, permissions }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (user?.role?.toLowerCase() === 'admin') {
    return children;
  }

  if (permissions) {
    const hasAny = permissions.some(p => user?.permissions?.includes(p));
    if (!hasAny) return <AccessDenied message="You don't have permission to access this section." />;
  }

  if (permission && !user?.permissions?.includes(permission)) {
    return <AccessDenied message="You don't have permission to access this page." />;
  }

  return children;
};

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  useEffect(() => {
    // Check for stored token and user on app initialization
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch(setCredentials({ token, user }));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
  }, [dispatch]);

  const handleLogin = () => {
    // This is now handled by Redux, but keeping for compatibility
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {isAuthenticated ? (
          <Layout onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route 
                path="/applications" 
                element={
                  <ProtectedRoute permissions={['hosting_approval', 'event_approval', 'agency_approval', 'influencer_approval']}>
                    <Applications />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/topup-manager" 
                element={
                  <ProtectedRoute permission="topup_approval">
                    <TopupManager />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/employees" 
                element={
                  <ProtectedRoute permission="manage_users">
                    <Employees />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/activity-logs" 
                element={
                  <ProtectedRoute permission="view_reports">
                    <ActivityLogs />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/complaints" 
                element={
                  <ProtectedRoute permission="complaints_manage">
                    <Complaints />
                  </ProtectedRoute>
                } 
              />
              <Route path="/complaints/:id" element={<ComplaintDetails />} />
              <Route 
                path="/admin/training-apps" 
                element={
                  <ProtectedRoute permission="training_manage">
                    <TrainingApps />
                  </ProtectedRoute>
                } 
              />
              <Route path="/admin/training-apps/:appId/videos" element={<TrainingVideos />} />
              
              <Route 
                path="/admin/countries" 
                element={
                  <ProtectedRoute permission="content_manage">
                    <CountryManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/categories" 
                element={
                  <ProtectedRoute permission="content_manage">
                    <CategoryManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/apps" 
                element={
                  <ProtectedRoute permission="content_manage">
                    <AppManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/topup-settings" 
                element={
                  <ProtectedRoute permission="content_manage">
                    <TopupSettings />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/bank-details" 
                element={
                  <ProtectedRoute permission="bank_manage">
                    <BankDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/payment-requests" 
                element={
                  <ProtectedRoute permission="withdrawal_manage">
                    <PaymentRequests />
                  </ProtectedRoute>
                } 
              />
              <Route path="/payment-requests/history" element={<WithdrawalHistory />} />
              <Route 
                path="/admin/wallet" 
                element={
                  <ProtectedRoute>
                    <AdminWallet />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/recharge-requests" 
                element={
                  <ProtectedRoute permission="recharge_approval">
                    <RechargeRequests />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/recharge-history" 
                element={
                  <ProtectedRoute permission="recharge_approval">
                    <RechargeHistory />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/salary-management" 
                element={
                  <ProtectedRoute>
                    <SalaryManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/users" 
                element={
                  <ProtectedRoute>
                    <Users />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <NotificationManagement />
                  </ProtectedRoute>
                } 
              />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        ) : (
          <Login onLogin={() => {}} />
        )}
      </Router>
    </ThemeProvider>
  );
}

export default App;
