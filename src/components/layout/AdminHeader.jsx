import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, LogOut, User, Settings, Clock, Calendar, MessageCircle, RefreshCw } from 'lucide-react';
import adminApi from '../../services/adminApi';

const AdminHeader = () => {
  const { admin, logout } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Date and Time State
  const [currentDateTime, setCurrentDateTime] = useState({
    time: '',
    date: '',
    period: ''
  });
  
  // Stats State
  const [stats, setStats] = useState({
    documents: { total: 0, free: 0, paid: 0, external: 0, uploaded: 0, downloads: 0 },
    software: { total: 0, free: 0, paid: 0, external: 0, uploaded: 0, downloads: 0 },
    categories: { total: 0 },
    orders: { total: 0, completed: 0, pending: 0 },
    users: { total: 0, active: 0, admins: 0 },
    payments: { pending: 0, completed: 0, total: 0 }
  });
  
  const [messageIndex, setMessageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch all stats from API
  const fetchAllStats = async () => {
    try {
      setLoading(true);
      
      // Fetch documents
      const docsRes = await adminApi.get('/documents');
      const documents = docsRes.data;
      const docsTotal = documents.length;
      const docsFree = documents.filter(d => d.isFree === true).length;
      const docsPaid = docsTotal - docsFree;
      const docsExternal = documents.filter(d => d.fileUrl && !d.fileInfo).length;
      const docsUploaded = documents.filter(d => d.fileInfo && d.fileInfo.absolutePath).length;
      const docsDownloads = documents.reduce((sum, d) => sum + (d.downloadCount || 0), 0);
      
      // Fetch software
      const softRes = await adminApi.get('/software');
      const software = softRes.data;
      const softTotal = software.length;
      const softFree = software.filter(s => s.isFree === true).length;
      const softPaid = softTotal - softFree;
      const softExternal = software.filter(s => s.fileUrl && !s.fileInfo).length;
      const softUploaded = software.filter(s => s.fileInfo && s.fileInfo.absolutePath).length;
      const softDownloads = software.reduce((sum, s) => sum + (s.downloadCount || 0), 0);
      
      // Fetch categories
      const catsRes = await adminApi.get('/categories');
      const categoriesTotal = catsRes.data.length;
      
      // Fetch orders
      const ordersRes = await adminApi.get('/orders/all');
      const orders = ordersRes.data;
      const ordersTotal = orders.length;
      const ordersCompleted = orders.filter(o => o.status === 'completed').length;
      const ordersPending = orders.filter(o => o.status === 'pending').length;
      
      // Fetch users
      const usersRes = await adminApi.get('/admin/users');
      const users = usersRes.data;
      const usersTotal = users.length;
      const usersActive = users.filter(u => u.isActive === true).length;
      const usersAdmins = users.filter(u => u.role === 'admin').length;
      
      // Fetch pending payments
      const paymentsRes = await adminApi.get('/admin/pending-payments');
      const pendingPayments = paymentsRes.data.length;
      
      setStats({
        documents: { total: docsTotal, free: docsFree, paid: docsPaid, external: docsExternal, uploaded: docsUploaded, downloads: docsDownloads },
        software: { total: softTotal, free: softFree, paid: softPaid, external: softExternal, uploaded: softUploaded, downloads: softDownloads },
        categories: { total: categoriesTotal },
        orders: { total: ordersTotal, completed: ordersCompleted, pending: ordersPending },
        users: { total: usersTotal, active: usersActive, admins: usersAdmins },
        payments: { pending: pendingPayments, completed: ordersCompleted, total: ordersTotal + pendingPayments }
      });
      
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    fetchAllStats();
    const interval = setInterval(fetchAllStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update date and time every second
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes}:${seconds} ${period}`;
      
      const dateString = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      setCurrentDateTime({
        time: timeString,
        date: dateString,
        period: period
      });
    };
    
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic messages based on real stats
  const getMessages = () => {
    return [
      { text: `📄 Documents: ${stats.documents.total} total | ${stats.documents.free} free | ${stats.documents.paid} paid | ${stats.documents.external} external | ${stats.documents.uploaded} uploaded | ${stats.documents.downloads.toLocaleString()} downloads`, type: "docs" },
      { text: `💻 Software: ${stats.software.total} total | ${stats.software.free} free | ${stats.software.paid} paid | ${stats.software.external} external | ${stats.software.uploaded} uploaded | ${stats.software.downloads.toLocaleString()} downloads`, type: "software" },
      { text: `📁 Categories: ${stats.categories.total} categories available for organizing content`, type: "categories" },
      { text: `🛒 Orders: ${stats.orders.total} total | ${stats.orders.completed} completed | ${stats.orders.pending} pending`, type: "orders" },
      { text: `👥 Users: ${stats.users.total} total | ${stats.users.active} active | ${stats.users.admins} admins`, type: "users" },
      { text: `💰 Payments: ${stats.payments.pending} pending verification | ${stats.payments.completed} completed`, type: "payments" },
      { text: `📊 Total Revenue: ${(stats.orders.completed * 500).toLocaleString()} KES (estimated)`, type: "revenue" },
      { text: `📈 Store Performance: ${stats.documents.downloads + stats.software.downloads} total downloads across all items`, type: "performance" },
    ];
  };

  const messages = getMessages();
  const currentMessage = messages[messageIndex]?.text || messages[0]?.text || "Loading stats...";
  const currentMessageType = messages[messageIndex]?.type || "info";

  // Rotate messages every 5 seconds
  useEffect(() => {
    if (messages.length === 0) return;
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 5000);
    return () => clearInterval(messageInterval);
  }, [stats]); // Re-run when stats update

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRefresh = () => {
    fetchAllStats();
  };

  // Get message style based on type
  const getMessageStyle = () => {
    if (currentMessageType === 'docs') return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
    if (currentMessageType === 'software') return 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400';
    if (currentMessageType === 'categories') return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400';
    if (currentMessageType === 'orders') return 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400';
    if (currentMessageType === 'users') return 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400';
    if (currentMessageType === 'payments') return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400';
    if (currentMessageType === 'revenue') return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400';
    if (currentMessageType === 'performance') return 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400';
    return 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400';
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
      <div className="px-4 md:px-6 py-3">
        {/* Top Row - Logo and User */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-2xl">📚</div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">DocuSoft Admin</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Control Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Refresh stats"
              title="Refresh statistics"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            {/* Date and Time Display */}
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                <Calendar size={14} />
                <span className="text-xs font-medium">{currentDateTime.date}</span>
              </div>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                <Clock size={14} />
                <span className="text-xs font-mono font-medium">{currentDateTime.time}</span>
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 md:gap-3 p-1.5 md:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm">
                  {admin?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{admin?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{admin?.email || 'admin@docusoft.com'}</p>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 animate-fade-in">
                  <button
                    onClick={() => { setShowDropdown(false); navigate('/profile'); }}
                    className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <User size={14} /> Profile
                  </button>
                  <button
                    onClick={() => { setShowDropdown(false); navigate('/settings'); }}
                    className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Settings size={14} /> Settings
                  </button>
                  <hr className="my-1 border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row - Dynamic Stats Message Bar */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-500 ${getMessageStyle()}`}>
            <MessageCircle size={16} className="flex-shrink-0" />
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="spinner w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs md:text-sm font-medium">Loading stats...</p>
              </div>
            ) : (
              <p className="text-xs md:text-sm font-medium truncate animate-fade-in">
                {currentMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;