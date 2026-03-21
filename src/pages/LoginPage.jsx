import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import adminApi from '../services/adminApi';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await adminApi.post('/auth/login', { email, password });
      if (data.user.role !== 'admin') {
        throw new Error('Access denied. Admin only.');
      }
      login(data.token, data.user);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Animated background elements */}
      <div style={styles.bgAnimation}>
        <div style={styles.circle1}></div>
        <div style={styles.circle2}></div>
        <div style={styles.circle3}></div>
        <div style={styles.circle4}></div>
      </div>

      <div style={styles.card}>
        {/* Logo/Brand Section */}
        <div style={styles.brand}>
          <div style={styles.logoIcon}>📚</div>
          <h1 style={styles.logoText}>DocuSoft</h1>
          <p style={styles.tagline}>Admin Control Panel</p>
        </div>

        {/* Welcome Section */}
        <div style={styles.welcome}>
          <h2 style={styles.welcomeTitle}>Welcome Back</h2>
          <p style={styles.welcomeSubtitle}>Sign in to manage your digital store</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorAlert}>
            <span style={styles.errorIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>📧</span>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="admin@example.com"
              required
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>🔒</span>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.loginBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? (
              <span style={styles.loadingSpinner}>
                <span className="spinner-small"></span> Signing in...
              </span>
            ) : (
              <span>🔓 Sign In to Dashboard</span>
            )}
          </button>
        </form>

        {/* Footer Info */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            <span style={styles.lockIcon}>🔐</span>
            Secure admin access only
          </p>
          <p style={styles.version}>DocuSoft v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    padding: '20px',
  },
  
  // Animated background circles
  bgAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 0,
  },
  circle1: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)',
    animation: 'float 20s ease-in-out infinite',
  },
  circle2: {
    position: 'absolute',
    bottom: '-15%',
    left: '-5%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 70%)',
    animation: 'float 15s ease-in-out infinite reverse',
  },
  circle3: {
    position: 'absolute',
    top: '40%',
    left: '20%',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, rgba(255,215,0,0) 70%)',
    animation: 'pulse 8s ease-in-out infinite',
  },
  circle4: {
    position: 'absolute',
    bottom: '30%',
    right: '15%',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(120,80,200,0.25) 0%, rgba(120,80,200,0) 70%)',
    animation: 'float 12s ease-in-out infinite',
  },

  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(10px)',
    borderRadius: '32px',
    padding: '48px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    position: 'relative',
    zIndex: 10,
    animation: 'slideUp 0.5s ease-out',
    transition: 'transform 0.3s ease',
  },

  brand: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoIcon: {
    fontSize: '56px',
    marginBottom: '12px',
    display: 'inline-block',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  logoText: {
    fontSize: '32px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: '0',
    letterSpacing: '-0.5px',
  },
  tagline: {
    fontSize: '13px',
    color: '#a0aec0',
    marginTop: '8px',
    fontWeight: '500',
  },

  welcome: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  welcomeTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: '8px',
  },
  welcomeSubtitle: {
    fontSize: '14px',
    color: '#718096',
  },

  errorAlert: {
    backgroundColor: '#fff5f5',
    border: '1px solid #feb2b2',
    borderRadius: '12px',
    padding: '12px 16px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#c53030',
    fontSize: '14px',
    animation: 'shake 0.5s ease-out',
  },
  errorIcon: {
    fontSize: '18px',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4a5568',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  labelIcon: {
    fontSize: '16px',
  },
  input: {
    padding: '14px 18px',
    border: '2px solid #e2e8f0',
    borderRadius: '14px',
    fontSize: '15px',
    transition: 'all 0.3s',
    outline: 'none',
    backgroundColor: '#fafbfc',
    color: '#2d3748',
    fontWeight: '500',
  },

  loginBtn: {
    padding: '16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    marginTop: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
  },

  loadingSpinner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  footer: {
    marginTop: '32px',
    textAlign: 'center',
    paddingTop: '24px',
    borderTop: '1px solid #e2e8f0',
  },
  footerText: {
    fontSize: '12px',
    color: '#a0aec0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginBottom: '8px',
  },
  lockIcon: {
    fontSize: '12px',
  },
  version: {
    fontSize: '11px',
    color: '#cbd5e0',
  },
};

// Add animations to document
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateY(-20px) rotate(5deg);
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 0.5;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.8;
    }
  }

  @keyframes shake {
    0%, 100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-5px);
    }
    75% {
      transform: translateX(5px);
    }
  }

  .spinner-small {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    display: inline-block;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  input:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    background-color: white;
  }

  .login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }
`;
document.head.appendChild(styleSheet);

export default LoginPage;