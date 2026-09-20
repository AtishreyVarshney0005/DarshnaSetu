import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { saveSession, signup } from '../api/client';
import '../styles/login.css';
import darshanSetuLogo from '../../assets/DarshanSetu_Logo.png';

const initialForm = {
  fullName: '',
  mobile: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false
};

const validateEmail = (email) => {
  if (!email?.trim()) return '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? '' : 'Please enter a valid email address';
};

const validateMobile = (mobile) => {
  if (!mobile?.trim()) return 'Mobile number is required';
  const cleanPhone = mobile.trim().replace(/[\s\-()]/g, '').replace(/^\+91/, '').replace(/^91(?=\d{10}$)/, '');
  return /^\d{10}$/.test(cleanPhone) ? '' : 'Please enter a valid 10-digit mobile number';
};

const validateName = (name) => {
  if (!name?.trim()) return 'Full name is required';
  return /^[A-Za-z\s]{2,}$/.test(name.trim()) ? '' : 'Please enter your full name';
};

const UserIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 12.2A4.1 4.1 0 1 0 12 4a4.1 4.1 0 0 0 0 8.2Zm0 1.55c-4.07 0-7.35 2.35-7.35 5.25 0 .77.63 1.4 1.4 1.4h11.9c.77 0 1.4-.63 1.4-1.4 0-2.9-3.28-5.25-7.35-5.25Z" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 2.75A2.75 2.75 0 0 0 4.25 5.5v13A2.75 2.75 0 0 0 7 21.25h10A2.75 2.75 0 0 0 19.75 18.5v-13A2.75 2.75 0 0 0 17 2.75H7Zm0 1.5h10c.69 0 1.25.56 1.25 1.25v13c0 .69-.56 1.25-1.25 1.25H7A1.25 1.25 0 0 1 5.75 18.5v-13c0-.69.56-1.25 1.25-1.25Zm4.25 3.25h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1 0-1.5Zm-2.5 4.5h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5Zm0 3h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5Z" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3.5 6.5A2.5 2.5 0 0 1 6 4h12a2.5 2.5 0 0 1 2.5 2.5v11A2.5 2.5 0 0 1 18 20H6a2.5 2.5 0 0 1-2.5-2.5v-11Zm2.08.5 6.42 5.16a1 1 0 0 0 1.2 0L18.42 7H5.58Zm12.92 1.4-5.77 4.64a2.5 2.5 0 0 1-3.06 0L5.5 8.9v9.6c0 .28.22.5.5.5h12c.28 0 .5-.22.5-.5V8.9Z" />
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

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.75 5.5 5.25v5.1c0 4.25 2.9 8.02 6.5 9.9 3.6-1.88 6.5-5.65 6.5-9.9v-5.1L12 2.75Zm-1.1 9.1V8.6h2.2v3.25h2.2v2.2h-6.6v-2.2h2.2Z" /></svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2.75a.75.75 0 0 1 .75.75V4h8.5v-.5a.75.75 0 0 1 1.5 0V4h1.25A2.5 2.5 0 0 1 21.5 6.5v11A2.5 2.5 0 0 1 19 20H5a2.5 2.5 0 0 1-2.5-2.5v-11A2.5 2.5 0 0 1 5 6.5h1.25v-.5A.75.75 0 0 1 7 5.25Zm12 6.5H5v7.25c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5V9.25Zm-9.5-3.5v1.5h1.5V5.75h-1.5Zm6 0v1.5h1.5V5.75h-1.5Z" /></svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.4 11.3a3.2 3.2 0 1 0-3.2-3.2 3.2 3.2 0 0 0 3.2 3.2Zm0 1.5c-2.4 0-4.7 1.6-5.3 3.7-.17.6.33 1.1.94 1.1h8.8c.61 0 1.11-.5.94-1.1-.6-2.1-2.9-3.7-5.3-3.7Zm8.1-1.5a2.9 2.9 0 1 0-2.9-2.9 2.9 2.9 0 0 0 2.9 2.9Zm0 1.5c-1.78 0-3.47 1.18-4.05 2.85-.17.5.2 1.02.74 1.02h6.62c.54 0 .91-.52.74-1.02-.58-1.67-2.27-2.85-4.05-2.85Z" /></svg>
);

const SupportIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.75a9.25 9.25 0 0 0-9.25 9.25c0 2.58 1.06 4.93 2.77 6.57.59.57 1.42.86 2.23.86h1.75v-5.75H7.5A1.75 1.75 0 0 1 5.75 12v-.25A6.5 6.5 0 0 1 12 5.25a6.5 6.5 0 0 1 6.25 6.5v.25A1.75 1.75 0 0 1 16.5 14h-1.75v5.75h1.75c.81 0 1.64-.29 2.23-.86A9.25 9.25 0 0 0 12 2.75Zm-1.75 13.5h3.5v3h-3.5v-3Zm-1.5-1.5h6.5v-1.25A1.75 1.75 0 0 0 16.5 12.5h-9A1.75 1.75 0 0 0 5.75 14.25v.5Z" /></svg>
);

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
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
      fullName: validateName(form.fullName),
      mobile: validateMobile(form.mobile),
      email: validateEmail(form.email),
      password: !form.password ? 'Password is required' : form.password.length < 8 ? 'Password must be at least 8 characters long' : '',
      confirmPassword: !form.confirmPassword ? 'Confirm password is required' : form.password !== form.confirmPassword ? 'Passwords do not match' : '',
      terms: form.terms ? '' : 'Please accept the terms and privacy policy'
    };

    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await signup({
        username: form.fullName,
        mobile: form.mobile.trim().replace(/[\s\-()]/g, '').replace(/^\+91/, '').replace(/^91(?=\d{10}$)/, ''),
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword
      });
      saveSession(response.data);
      setStatus({ type: 'success', message: 'Account created successfully. Redirecting to DarshanSetu...' });
      window.setTimeout(() => navigate('/', { replace: true }), 300);
    } catch (requestError) {
      setStatus({ type: 'error', message: requestError.message || 'Unable to create account. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const benefitItems = [
    { icon: <ShieldIcon />, title: 'Secure', text: 'Your data is safe with us' },
    { icon: <CalendarIcon />, title: 'Easy Booking', text: 'Book darshan in just a few clicks' },
    { icon: <UsersIcon />, title: 'Trusted Platform', text: 'Join thousands of devotees' },
    { icon: <SupportIcon />, title: '24/7 Support', text: 'We are here to help you' }
  ];

  return (
    <main className="auth-shell auth-shell--signup">
      <div className="auth-overlay" aria-hidden="true" />

      <section className="auth-stage auth-stage--signup" aria-labelledby="signup-title">
        <div className="auth-brand" aria-label="DarshanSetu brand">
          <BrandMark />
          <div>
            <h2>DarshanSetu</h2>
            <p>Divine Connect</p>
          </div>
        </div>

        <p className="auth-tagline">“Your Journey. Our Blessing.”</p>

        <div className="signup-layout">
          <div className="auth-card auth-card--signup">
            <div className="auth-card__header">
              <h1 id="signup-title">Create Your Account</h1>
              <p>Join DarshanSetu and book your darshan easily</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="field-group">
                <label htmlFor="fullName">Full Name</label>
                <div className={`input-shell ${errors.fullName ? 'is-invalid' : ''}`}>
                  <span className="field-icon"><UserIcon /></span>
                  <input id="fullName" name="fullName" type="text" placeholder="Enter your full name" autoComplete="name" value={form.fullName} onChange={handleChange} className="auth-input" />
                </div>
                {errors.fullName && <p className="field-error" role="alert">{errors.fullName}</p>}
              </div>

              <div className="field-group">
                <label htmlFor="signup-mobile">Mobile Number</label>
                <div className={`input-shell ${errors.mobile ? 'is-invalid' : ''}`}>
                  <span className="field-icon"><PhoneIcon /></span>
                  <input id="signup-mobile" name="mobile" type="tel" inputMode="numeric" placeholder="Enter your mobile number" autoComplete="tel" value={form.mobile} onChange={handleChange} className="auth-input" />
                </div>
                {errors.mobile && <p className="field-error" role="alert">{errors.mobile}</p>}
              </div>

              <div className="field-group">
                <label htmlFor="signup-email">Email (Optional)</label>
                <div className={`input-shell ${errors.email ? 'is-invalid' : ''}`}>
                  <span className="field-icon"><MailIcon /></span>
                  <input id="signup-email" name="email" type="email" placeholder="Enter your email" autoComplete="email" value={form.email} onChange={handleChange} className="auth-input" />
                </div>
                {errors.email && <p className="field-error" role="alert">{errors.email}</p>}
              </div>

              <div className="field-group">
                <label htmlFor="signup-password">Password</label>
                <div className={`input-shell ${errors.password ? 'is-invalid' : ''}`}>
                  <span className="field-icon"><LockIcon /></span>
                  <input id="signup-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Create a password" autoComplete="new-password" value={form.password} onChange={handleChange} className="auth-input" />
                  <button type="button" className="password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((current) => !current)}>
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.password && <p className="field-error" role="alert">{errors.password}</p>}
              </div>

              <div className="field-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className={`input-shell ${errors.confirmPassword ? 'is-invalid' : ''}`}>
                  <span className="field-icon"><LockIcon /></span>
                  <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm your password" autoComplete="new-password" value={form.confirmPassword} onChange={handleChange} className="auth-input" />
                  <button type="button" className="password-toggle" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} onClick={() => setShowConfirmPassword((current) => !current)}>
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="field-error" role="alert">{errors.confirmPassword}</p>}
              </div>

              <label className={`checkbox-row ${errors.terms ? 'is-invalid' : ''}`}>
                <input type="checkbox" name="terms" checked={form.terms} onChange={handleChange} />
                <span>
                  I agree to the <Link to="/signup">Terms &amp; Conditions</Link> and <Link to="/signup">Privacy Policy</Link>
                </span>
              </label>
              {errors.terms && <p className="field-error" role="alert">{errors.terms}</p>}

              {status.message && (
                <p className={`field-status ${status.type}`} role="status">
                  {status.message}
                </p>
              )}

              <button type="submit" className="primary-button" disabled={loading}>
                {loading ? 'Creating account...' : 'Sign Up →'}
              </button>
            </form>

            <div className="auth-divider" aria-label="Continue with alternative signup methods">
              <span>or continue with</span>
            </div>

            <div className="alt-actions">
                <button type="button" className="secondary-button">
                  Continue with OTP
              </button>
            </div>

            <p className="auth-footer">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>

          <aside className="signup-benefits" aria-label="Platform benefits">
            {benefitItems.map((item) => (
              <div className="benefit-item" key={item.title}>
                <div className="benefit-icon">{item.icon}</div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </aside>
        </div>
      </section>

      <div className="devotional-line">“|| सबका मंगल हो, सबका कल्याण हो ||”</div>
    </main>
  );
}
