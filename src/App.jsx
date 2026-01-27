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
import Login from './pages/Login';
import { setCredentials, logout, selectIsAuthenticated } from './store/slices/authSlice';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    // Check for stored token on app initialization
    const token = localStorage.getItem('token');

    if (token) {
      dispatch(setCredentials({ token, user: null }));
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
              <Route path="/applications" element={<Applications />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/activity-logs" element={<ActivityLogs />} />
              <Route path="/complaints" element={<Complaints />} />
              <Route path="/complaints/:id" element={<ComplaintDetails />} />
              <Route path="/payment-requests" element={<PaymentRequests />} />
              <Route path="/users" element={<Users />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </Router>
    </ThemeProvider>
  );
}

export default App;
