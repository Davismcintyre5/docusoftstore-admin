import React from 'react';

const AdminFooter = () => {
  return (
    <footer className="admin-footer">
      <p>&copy; {new Date().getFullYear()} DocuSoft Admin Panel. All rights reserved.</p>
    </footer>
  );
};

export default AdminFooter;