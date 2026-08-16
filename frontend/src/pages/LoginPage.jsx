import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, LogIn, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/common/PasswordInput';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '696140172263-gpc7on1j38tq428dokrffka3cqi5ooua.apps.googleusercontent.com';

const GSI_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, googleLogin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect based on role
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'ORGANIZER') {
        navigate('/organizer/dashboard', { replace: true });
      } else {
        navigate('/attendee/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const redirectByRole = (role, fallbackPath) => {
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
    } else if (role === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    } else if (role === 'ORGANIZER') {
      navigate('/organizer/dashboard', { replace: true });
    } else {
      navigate(fallbackPath || '/attendee/dashboard', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    // Client-side validation
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login({ email: email.trim(), password });
      redirectByRole(res.user?.role);
    } catch (err) {
      console.error('Login error:', err);
      // Generic error message - do not reveal whether email or password was wrong
      setError(err?.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCredentialResponse = useCallback(
    async (response) => {
      if (!response?.credential) {
        setError('Google authentication failed.');
        return;
      }

      setIsSubmitting(true);
      setError('');
      setInfoMessage('');

      try {
        const res = await googleLogin(response.credential);
        redirectByRole(res.user?.role);
      } catch (err) {
        console.error('Google login error:', err);
        setError(err?.response?.data?.message || 'Google authentication failed.');
      } finally {
        setIsSubmitting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [googleLogin, location.state?.from]
  );

  const credentialCallbackRef = useRef(handleCredentialResponse);
  useEffect(() => {
    credentialCallbackRef.current = handleCredentialResponse;
  }, [handleCredentialResponse]);

  // Load Google Identity Services and initialize
  useEffect(() => {
    const initGsi = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => credentialCallbackRef.current(response),
      });
    };

    if (window.google?.accounts?.id) {
      initGsi();
      return undefined;
    }

    const script = document.createElement('script');
    script.src = GSI_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.id = 'gsi-client-script';
    script.onload = initGsi;
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById('gsi-client-script');
      if (el) el.remove();
    };
  }, []);

  const handleGoogleLogin = () => {
    setError('');
    setInfoMessage('');
    if (!window.google?.accounts?.id) {
      setError('Google sign-in could not be loaded. Please try again.');
      return;
    }
    window.google.accounts.id.prompt();
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your EventHub account</p>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="auth-info-banner" role="status">
            <Info size={18} />
            <span>{infoMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Email Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon-left" />
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                disabled={isSubmitting}
                className="form-input"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <PasswordInput
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary auth-submit-btn"
          >
            <LogIn size={18} />
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* OR Divider */}
        <div className="auth-divider">
          <span>OR</span>
        </div>

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="btn btn-secondary google-btn"
          aria-label="Continue with Google"
        >
          <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="auth-footer-link">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;