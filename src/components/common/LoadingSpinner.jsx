import React from 'react';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
      <div className="spinner"></div>
      <p style={{ marginTop: '16px', color: '#718096' }}>{text}</p>
    </div>
  );
};

export default LoadingSpinner;