import React from 'react';

const AdminFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6">
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>&copy; {year} DocuSoft Admin Panel. All rights reserved.</p>
        <p className="text-xs mt-1">Developed by Davix HDM</p>
      </div>
    </footer>
  );
};

export default AdminFooter;