import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderTree, 
  FileText, 
  Monitor, 
  CreditCard, 
  ShoppingCart, 
  Users, 
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCog,
  Package,
  TrendingUp
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useTheme } from '../../context/ThemeContext';

const AdminSidebar = () => {
  const { admin, logout } = useAdminAuth();
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', collapsed);
  }, [collapsed]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/categories', label: 'Categories', icon: FolderTree },
    { path: '/documents', label: 'Documents', icon: FileText },
    { path: '/software', label: 'Software', icon: Monitor },
    { path: '/payments', label: 'Payments', icon: CreditCard },
    { path: '/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/users', label: 'Users', icon: Users },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const toggleCollapse = () => setCollapsed(!collapsed);
  const toggleMobile = () => setMobileOpen(!mobileOpen);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleMobile}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary-600 text-white shadow-lg"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen 
          bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900
          dark:from-gray-950 dark:via-gray-900 dark:to-gray-950
          transition-all duration-300 z-40
          flex flex-col
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!collapsed && (
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📚</span>
                <h2 className="text-lg font-bold text-white">DocuSoft</h2>
              </div>
              <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* User Profile Summary */}
        {!collapsed && (
          <div className="mx-3 mt-4 p-3 bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
                {admin?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{admin?.name || 'Admin'}</p>
                <p className="text-xs text-gray-400 truncate">{admin?.email || 'admin@docusoft.com'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation - WITH SCROLL */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path !== '/' && location.pathname.startsWith(item.path));
              
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }
                      ${collapsed ? 'justify-center' : ''}
                    `}
                    title={collapsed ? item.label : ''}
                  >
                    <Icon size={20} />
                    {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                    {isActive && !collapsed && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer with Logout */}
        <div className="p-3 border-t border-gray-700">
          {!collapsed ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-red-600/20 hover:text-red-400 transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex justify-center py-2.5 rounded-lg text-gray-400 hover:bg-red-600/20 hover:text-red-400 transition-all duration-200"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          )}
          {!collapsed && (
            <div className="mt-3 pt-3 text-center border-t border-gray-700">
              <p className="text-xs text-gray-500">v2.0.0</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;