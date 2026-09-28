import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { saveSession, signup } from '../api/client';
import '../styles/login.css';
import darshanSetuLogo from '../../assets/DarshanSetu_Logo.png';

const initialForm = { name: '', mobile: '', email: '', password: '', confirmPassword: '' };

const normalizeMobile = (mobile) => mobile.trim().replace(/[\s\-()]/g, '').replace(/^\+91/, '').replace(/^91(?=\d{10}$)/, '');

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    if (status.message) setStatus({ type: '', message: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const mobile = normalizeMobile(form.mobile);
    const nextErrors = {
      name: form.name.trim().length >= 2 ? '' : 'Please enter your name',
      mobile: /^\d{10}$/.test(mobile) ? '' : 'Enter a valid 10-digit mobile number',
      password: form.password.length >= 8 ? '' : 'Password must be at least 8 characters',
      confirmPassword: form.password === form.confirmPassword ? '' : 'Passwords do not match'
    };

    setErrors(nextErrors);
    setStatus({ type: '', message: '' });
    if (Object.values(nextErrors).some(Boolean)) return;

    setLoading(true);
    try {
      const response = await signup({
        username: form.name.trim(),
        mobile,
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword
      });
      saveSession(response.data);
      setStatus({ type: 'success', message: 'Account created. Opening your booking page...' });
      window.setTimeout(() => navigate('/booking', { replace: true }), 300);
    } catch (requestError) {
      setStatus({ type: 'error', message: requestError.message || 'Unable to create your account' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell auth-shell--signup">
      <div className="auth-overlay" aria-hidden="true" />
      <section className="auth-stage auth-stage--signup" aria-labelledby="signup-title">
        <div className="auth-brand" aria-label="DarshanSetu brand">
          <img className="auth-logo" src={darshanSetuLogo} alt="DarshanSetu" />
          <div>
            <h2>DarshanSetu</h2>
            <p>Divine Connect</p>
          </div>
        </div>

        <p className="auth-tagline">Begin your journey with us</p>

        <div className="auth-card auth-card--signup">
          <div className="auth-card__header">
            <h1 id="signup-title">Create your account</h1>
            <p>Book your darshan with a few details</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <label htmlFor="signup-name">Full name</label>
              <div className={`input-shell ${errors.name ? 'is-invalid' : ''}`}>
                <input id="signup-name" name="name" type="text" autoComplete="name" placeholder="Enter your full name" value={form.name} onChange={handleChange} className="auth-input" />
              </div>
              {errors.name && <p className="field-error" role="alert">{errors.name}</p>}
            </div>

            <div className="field-group">
              <label htmlFor="signup-mobile">Mobile number</label>
              <div className={`input-shell ${errors.mobile ? 'is-invalid' : ''}`}>
                <input id="signup-mobile" name="mobile" type="tel" inputMode="numeric" autoComplete="tel" placeholder="10-digit mobile number" value={form.mobile} onChange={handleChange} className="auth-input" />
              </div>
              {errors.mobile && <p className="field-error" role="alert">{errors.mobile}</p>}
            </div>

            <div className="field-group">
              <label htmlFor="signup-email">Email <span className="optional">Optional</span></label>
              <div className="input-shell">
                <input id="signup-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} className="auth-input" />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="signup-password">Password</label>
              <div className={`input-shell ${errors.password ? 'is-invalid' : ''}`}>
                <input id="signup-password" name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" value={form.password} onChange={handleChange} className="auth-input" />
              </div>
              {errors.password && <p className="field-error" role="alert">{errors.password}</p>}
            </div>

            <div className="field-group">
              <label htmlFor="signup-confirm-password">Confirm password</label>
              <div className={`input-shell ${errors.confirmPassword ? 'is-invalid' : ''}`}>
                <input id="signup-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" placeholder="Re-enter your password" value={form.confirmPassword} onChange={handleChange} className="auth-input" />
              </div>
              {errors.confirmPassword && <p className="field-error" role="alert">{errors.confirmPassword}</p>}
            </div>

            {status.message && <p className={`field-status ${status.type}`} role="status">{status.message}</p>}

            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>

          <p className="auth-footer">Already registered? <Link to="/login">Log in</Link></p>
        </div>
      </section>
      <div className="devotional-line">“|| सबका मंगल हो, सबका कल्याण हो ||”</div>
    </main>
  );
}