# Code Changes Reference

Quick reference showing all key code modifications made to the authentication system.

---

## 1. Backend - Updated Login Endpoint

### Location: `backend/controllers/authController.js`

```javascript
// NEW UNIFIED LOGIN/SIGNUP FUNCTION
export const login = async (req, res) => {
  try {
    const { name, phone } = req.body;

    // Validation
    if (!name?.trim() || !phone?.trim()) {
      return errorResponse(res, 400, 'Name and mobile number are required');
    }

    if (!isValidName(name.trim())) {
      return errorResponse(res, 400, 'Full name should contain at least 2 characters and only letters');
    }

    if (!isValidIndianMobileNumber(phone)) {
      return errorResponse(res, 400, 'Please enter a valid 10-digit Indian mobile number (starting with 6-9)');
    }

    const connection = await pool.getConnection();
    const cleanPhone = phone.trim().replace(/[\s\-]/g, '');

    // Check if user exists by phone (not email!)
    const [existingUsers] = await connection.query('SELECT * FROM users WHERE phone = ?', [cleanPhone]);
    
    let user;
    if (existingUsers.length > 0) {
      // EXISTING USER - LOGIN
      user = existingUsers[0];
    } else {
      // NEW USER - CREATE ACCOUNT
      const [result] = await connection.query(
        'INSERT INTO users (name, phone, role) VALUES (?, ?, ?)',
        [name.trim(), cleanPhone, 'user']
      );

      user = {
        id: result.insertId,
        name: name.trim(),
        phone: cleanPhone,
        role: 'user'
      };
    }

    await connection.release();

    // Generate token with name, phone, role (not email)
    const token = generateToken({
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role
    });

    return successResponse(res, 200, 'Login successful', {
      userId: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      token
    });
  } catch (error) {
    return errorResponse(res, 500, 'Login failed', error);
  }
};
```

---

## 2. Backend - New Validation Functions

### Location: `backend/utils/helpers.js`

```javascript
// Validate Indian Mobile Number (10 digits, starts with 6-9)
export const isValidIndianMobileNumber = (phone) => {
  // Remove any whitespace or hyphens
  const cleanPhone = phone?.replace(/[\s\-]/g, '') || '';
  // Check if it's exactly 10 digits starting with 6-9
  return /^[6-9]\d{9}$/.test(cleanPhone);
};

// Validate Full Name (2+ characters, only letters and spaces)
export const isValidName = (name) => {
  // Name should be at least 2 characters, contain only letters and spaces
  const nameRegex = /^[a-zA-Z\s]{2,}$/;
  return nameRegex.test(name?.trim());
};
```

---

## 3. Database Schema Update

### Location: `backend/database/schema.sql`

```sql
-- BEFORE
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('user', 'admin', 'staff') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- AFTER
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,           -- Now optional (NULL allowed)
  password VARCHAR(255),                -- Now optional (NULL allowed)
  phone VARCHAR(20) UNIQUE NOT NULL,   -- Now required and unique
  role ENUM('user', 'admin', 'staff') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 4. Frontend - Login Component

### Location: `frontend/src/pages/Login.jsx`

```javascript
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { login } from '../api/client';
import '../styles/login.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Validate full name (at least 2 characters, only letters and spaces)
  const validateName = (name) => {
    if (!name?.trim()) {
      return 'Full name is required';
    }
    if (!/^[a-zA-Z\s]{2,}$/.test(name.trim())) {
      return 'Full name should contain at least 2 characters and only letters';
    }
    return '';
  };

  // Validate Indian mobile number (10 digits, starts with 6-9)
  const validatePhone = (phone) => {
    if (!phone?.trim()) {
      return 'Mobile number is required';
    }
    const cleanPhone = phone.replace(/[\s\-]/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return 'Please enter a valid 10-digit Indian mobile number (starting with 6-9)';
    }
    return '';
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: '' }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setGeneralError('');

    // Validate both fields
    const nameError = validateName(form.name);
    const phoneError = validatePhone(form.phone);

    if (nameError || phoneError) {
      setErrors({
        ...(nameError && { name: nameError }),
        ...(phoneError && { phone: phoneError })
      });
      return;
    }

    setLoading(true);

    try {
      const cleanPhone = form.phone.replace(/[\s\-]/g, '');
      const response = await login(form.name.trim(), cleanPhone);
      localStorage.setItem('darshansetu_token', response.data.token);
      localStorage.setItem('darshansetu_user', JSON.stringify(response.data));
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (requestError) {
      setGeneralError(requestError.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <p className="login-eyebrow">DarshanSetu</p>
        <h1 id="login-title">Sign in</h1>
        <p className="login-copy">Access bookings, alerts, and temple operations.</p>
        <form onSubmit={handleSubmit} noValidate>
          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              className={errors.name ? 'input-error' : ''}
              required
            />
            {errors.name && (
              <p className="login-error" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div className="form-group">
            <label htmlFor="phone">Mobile Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Enter 10-digit mobile number"
              autoComplete="tel"
              value={form.phone}
              onChange={handleChange}
              className={errors.phone ? 'input-error' : ''}
              required
            />
            {errors.phone && (
              <p className="login-error" role="alert">
                {errors.phone}
              </p>
            )}
          </div>

          {/* General Error */}
          {generalError && (
            <p className="login-error" role="alert">
              {generalError}
            </p>
          )}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
}
```

---

## 5. Frontend - API Client Update

### Location: `frontend/src/api/client.js`

```javascript
// BEFORE
export const login = (email, password) => request('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

// AFTER
export const login = (name, phone) => request('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ name, phone })
});
```

---

## 6. Frontend - Enhanced Styling

### Location: `frontend/src/styles/login.css`

```css
/* Form group wrapper for organizing fields */
.form-group {
  display: grid;
  gap: 8px;
}

/* Input field error state */
.login-card input.input-error {
  border-color: #b3261e;
  background-color: #fce8e6;
}

/* Enhanced focus state for inputs */
.login-card input:focus {
  outline: none;
  border-color: #8d0710;
  box-shadow: 0 0 0 2px rgba(141, 7, 16, 0.1);
}

/* Error message styling */
.login-error {
  margin: 4px 0 0;
  color: #b3261e;
  font-size: 0.875rem;
}
```

---

## 7. Backend - Routes Update

### Location: `backend/routes/authRoutes.js`

```javascript
// BEFORE
router.post('/signup', authController.signup);        // ❌ REMOVED
router.post('/login', authController.login);
router.post('/change-password', authController.changePassword);  // ❌ REMOVED

// AFTER
router.post('/login', authController.login);          // ✅ Single endpoint for login/signup
```

---

## Summary of Removed Code

### Functions Removed
```javascript
// ❌ REMOVED from authController.js
export const signup = async (req, res) => {
  // Old email/password signup logic
};

export const changePassword = async (req, res) => {
  // Old password change logic
};
```

### Imports No Longer Needed
```javascript
// ❌ Removed from authController.js imports
import { hashPassword, comparePassword } from '../utils/helpers.js';

// These functions are still in helpers.js but not used in auth anymore
```

---

## API Request/Response Examples

### Login Request (Name & Phone)
```json
POST /api/auth/login
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "9876543210"
}
```

### Success Response (New User Created)
```json
200 OK
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": 1,
    "name": "John Doe",
    "phone": "9876543210",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Success Response (Existing User Logged In)
```json
200 OK
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": 1,
    "name": "John Doe",
    "phone": "9876543210",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Error Response (Invalid Phone)
```json
400 Bad Request
{
  "success": false,
  "message": "Please enter a valid 10-digit Indian mobile number (starting with 6-9)"
}
```

---

## Validation Logic Comparison

```javascript
// ============================================
// FIELD: Full Name
// ============================================

PATTERN: /^[a-zA-Z\s]{2,}$/

Valid Examples:
  ✓ "John Doe"
  ✓ "Jane Smith"
  ✓ "Raj Kumar Singh"
  ✓ "A B C" (initials with spaces)

Invalid Examples:
  ✗ "J" (too short)
  ✗ "John123" (contains numbers)
  ✗ "John@Doe" (contains special char)
  ✗ "JohnDoe" (no error, this is valid)

// ============================================
// FIELD: Mobile Number
// ============================================

PATTERN: /^[6-9]\d{9}$/

Valid Examples:
  ✓ "9876543210"
  ✓ "6123456789"
  ✓ "7934567890"
  ✓ "8765432109"

Invalid Examples:
  ✗ "1234567890" (starts with 1)
  ✗ "0987654321" (starts with 0)
  ✗ "987654321" (only 9 digits)
  ✗ "98765432101" (11 digits)
```

---

This completes the authentication system overhaul! All files have been updated and validated.
