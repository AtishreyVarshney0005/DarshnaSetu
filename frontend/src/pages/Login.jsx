import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, saveSession } from '../api/client';
import '../styles/login.css';
import darshanSetuLogo from '../../assets/DarshanSetu_Logo.png';

const initialForm = { mobile: '9876543210', password: 'password123' };

const validateMobile = (mobile) => {
  if (!mobile?.trim()) return 'Mobile number is required';
  const cleanPhone = mobile.trim().replace(/[\s\-()]/g, '').replace(/^\+91/, '').replace(/^91(?=\d{10}$)/, '');
  return /^\d{10}$/.test(cleanPhone) ? '' : 'Please enter a valid 10-digit mobile number';
};

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 2.75A2.75 2.75 0 0 0 4.25 5.5v13A2.75 2.75 0 0 0 7 21.25h10A2.75 2.75 0 0 0 19.75 18.5v-13A2.75 2.75 0 0 0 17 2.75H7Zm0 1.5h10c.69 0 1.25.56 1.25 1.25v13c0 .69-.56 1.25-1.25 1.25H7A1.25 1.25 0 0 1 5.75 18.5v-13c0-.69.56-1.25 1.25-1.25Zm4.25 3.25h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1 0-1.5Zm-2.5 4.5h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5Zm0 3h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5Z" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2.75A4.75 4.75 0 0 0 7.25 7.5V9h-.75A2.5 2.5 0 0 0 4 11.5v7A2.5 2.5 0 0 0 6.5 21h11A2.5 2.5 0 0 0 20 18.5v-7A2.5 2.5 0 0 0 17.5 9h-.75V7.5A4.75 4.75 0 0 0 12 2.75Zm-3.25 6.75V7.5a3.25 3.25 0 1 1 6.5 0v2h-6.5Zm6.5 1.5H8.75v6h6.5v-6Z" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 5C7.11 5 2.95 8.06 1 12c1.95 3.94 6.11 7 11 7s9.05-3.06 11-7c-1.95-3.94-6.11-7-11-7Zm0 1.5c3.53 0 6.7 2.3 8.36 5.5-1.66 3.2-4.83 5.5-8.36 5.5S5.3 15.2 3.64 12c1.66-3.2 4.83-5.5 8.36-5.5Zm0 2.25A3.25 3.25 0 1 1 8.75 12 3.25 3.25 0 0 1 12 8.75Zm0 1.5A1.75 1.75 0 1 0 13.75 12 1.75 1.75 0 0 0 12 10.25Z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l2.4 2.4A12.57 12.57 0 0 0 1 12c1.95 3.94 6.11 7 11 7 2.1 0 4.04-.46 5.75-1.3l2.36 2.36a.75.75 0 0 0 1.06-1.06L3.28 2.22ZM12 7.5c2.13 0 3.9 1.77 3.9 3.9a3.84 3.84 0 0 1-.58 1.96l-2.86-2.86A1.75 1.75 0 0 0 12 10.25a1.75 1.75 0 0 0-1.12.38L8.9 8.35A3.9 3.9 0 0 1 12 7.5Zm0 10.5c-3.53 0-6.7-2.3-8.36-5.5.76-1.46 1.9-2.73 3.28-3.63l-1.78-1.78A11.04 11.04 0 0 0 2.31 12c1.67 3.2 4.84 5.5 9.69 5.5 1.9 0 3.66-.36 5.18-.99L16 17.2A9.63 9.63 0 0 1 12 18Zm7.67-10.28-1.56 1.56A8.57 8.57 0 0 1 20 12c-1.66 3.2-4.83 5.5-8.36 5.5a8.92 8.92 0 0 1-2.57-.38l-1.38 1.39A10.86 10.86 0 0 0 12 19c4.89 0 9.05-3.06 11-7a12.57 12.57 0 0 0-3.33-5.28Z" />
  </svg>
);

const BrandMark = () => (
  <img className="auth-logo" src={darshanSetuLogo} alt="DarshanSetu" />
);

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: '' }));
    }
    if (status.message) {
      setStatus({ type: '', message: '' });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setStatus({ type: '', message: '' });

    const nextErrors = {
      mobile: validateMobile(form.mobile),
      password: form.password ? '' : 'Password is required'
    };

    if (nextErrors.mobile || nextErrors.password) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);

    try {
      const normalizedMobile = form.mobile.trim().replace(/[\s\-()]/g, '').replace(/^\+91/, '').replace(/^91(?=\d{10}$)/, '');
      const response = await login(normalizedMobile, form.password);
      saveSession(response.data);
      setStatus({ type: 'success', message: 'Login successful. Redirecting to DarshanSetu...' });
      window.setTimeout(() => navigate('/admin/dashboard', { replace: true }), 300);
    } catch (requestError) {
      setStatus({ type: 'error', message: requestError.message || 'Invalid mobile number or password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell auth-shell--login">
      <div className="auth-overlay" aria-hidden="true" />

      <section className="auth-stage" aria-labelledby="login-title">
        <div className="auth-brand" aria-label="DarshanSetu brand">
          <BrandMark />
          <div>
            <h2>DarshanSetu</h2>
            <p>Divine Connect</p>
          </div>
        </div>

        <p className="auth-tagline">“Your Journey. Our Blessing.”</p>

        <div className="auth-card">
          <div className="auth-card__header">
            <h1 id="login-title">Welcome Back!</h1>
            <p>Login to continue your divine journey</p>
          </div>

          <p className="login-credentials" role="note">
            Demo login: <strong>9876543210</strong> &middot; Password: <strong>password123</strong>
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <label htmlFor="login-mobile">Mobile Number</label>
              <div className={`input-shell ${errors.mobile ? 'is-invalid' : ''}`}>
                <span className="field-icon"><PhoneIcon /></span>
                <input
                  id="login-mobile"
                  name="mobile"
                  type="tel"
                  inputMode="numeric"
                  placeholder="Enter your mobile number"
                  autoComplete="tel"
                  value={form.mobile}
                  onChange={handleChange}
                  className="auth-input"
                />
              </div>
              {errors.mobile && <p className="field-error" role="alert">{errors.mobile}</p>}
            </div>

            <div className="field-group">
              <div className="label-row">
                <label htmlFor="login-password">Password</label>
              </div>
              <div className={`input-shell ${errors.password ? 'is-invalid' : ''}`}>
                <span className="field-icon"><LockIcon /></span>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  className="auth-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && <p className="field-error" role="alert">{errors.password}</p>}
            </div>

            {status.message && (
              <p className={`field-status ${status.type}`} role="status">
                {status.message}
              </p>
            )}

            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Login →'}
            </button>
          </form>
        </div>

        <div className="auth-features" aria-label="DarshanSetu benefits">
          <div className="auth-feature"><span aria-hidden="true">✦</span><div><strong>Secure &amp; Safe</strong><small>Your data is protected</small></div></div>
          <div className="auth-feature"><span aria-hidden="true">♧</span><div><strong>Trusted by Devotees</strong><small>Thousands of happy devotees</small></div></div>
          <div className="auth-feature"><span aria-hidden="true">◷</span><div><strong>Save Time</strong><small>Book darshan in advance</small></div></div>
          <div className="auth-feature"><span aria-hidden="true">ॐ</span><div><strong>Divine Experience</strong><small>A seamless spiritual journey</small></div></div>
        </div>
      </section>

      <div className="devotional-line">“|| सबका मंगल हो, सबका कल्याण हो ||”</div>
    </main>
  );
}
