import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';

// Layout
import AdminHeader from './components/layout/AdminHeader';
import AdminSidebar from './components/layout/AdminSidebar';
import AdminFooter from './components/layout/AdminFooter';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CategoriesPage from './pages/CategoriesPage';
import DocumentsPage from './pages/DocumentsPage';
import SoftwarePage from './pages/SoftwarePage';
import PaymentsPage from './pages/PaymentsPage';
import OrdersPage from './pages/OrdersPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';

// Loading component
const LoadingSpinner = () => (
  <div style={styles.loadingContainer}>
    <div className="spinner"></div>
    <p style={styles.loadingText}>Loading Admin Panel...</p>
  </div>
);

// Protected Route Component
const ProtectedRoute = () => {
  const { admin, loading } = useAdminAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!admin) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

// Main App Content
const AppContent = () => {
  const { loading } = useAdminAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route
          path="/"
          element={
            <div className="app">
              <AdminHeader />
              <div className="main-container">
                <AdminSidebar />
                <main className="content-area">
                  <Outlet />
                </main>
              </div>
              <AdminFooter />
            </div>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="software" element={<SoftwarePage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <AdminAuthProvider>
        <AppContent />
      </AdminAuthProvider>
    </Router>
  );
}

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  loadingText: {
    marginTop: '16px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
  },
};

export default App;