import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

// Layout Components
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

// Components
import LoadingSpinner from './components/common/LoadingSpinner';

const ProtectedRoute = () => {
  const { admin, loading } = useAdminAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (!admin) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <AdminHeader />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
      <AdminFooter />
    </div>
  );
};

const AppContent = () => {
  const { loading } = useAdminAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
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

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AdminAuthProvider>
        <ThemeProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <AppContent />
        </ThemeProvider>
      </AdminAuthProvider>
    </Router>
  );
}

export default App;