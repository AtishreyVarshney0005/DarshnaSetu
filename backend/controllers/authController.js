import pool from '../config/database.js';
import { generateToken, successResponse, errorResponse, isValidName, isValidIndianMobileNumber, normalizeMobileNumber, isValidEmail, hashPassword, comparePassword } from '../utils/helpers.js';

export const signup = async (req, res) => {
  try {
    const { username, mobile, email, password, confirmPassword } = req.body;
    const cleanUsername = username?.trim();
    const cleanPhone = normalizeMobileNumber(mobile);
    const cleanEmail = email?.trim().toLowerCase() || null;

    if (!cleanUsername || !cleanPhone || !password || !confirmPassword) {
      return errorResponse(res, 400, 'Name, mobile, and password fields are required');
    }

    if (!isValidName(cleanUsername)) {
      return errorResponse(res, 400, 'Username should contain at least 2 letters and only spaces');
    }

    if (!isValidIndianMobileNumber(cleanPhone)) {
      return errorResponse(res, 400, 'Please enter a valid 10-digit Indian mobile number');
    }

    if (cleanEmail && !isValidEmail(cleanEmail)) {
      return errorResponse(res, 400, 'Please enter a valid email address');
    }

    if (password.length < 8) {
      return errorResponse(res, 400, 'Password must be at least 8 characters long');
    }

    if (password !== confirmPassword) {
      return errorResponse(res, 400, 'Passwords do not match');
    }

    const connection = await pool.getConnection();
    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE email = ? OR phone = ? LIMIT 1',
      [cleanEmail, cleanPhone]
    );

    if (existingUsers.length > 0) {
      await connection.release();
      return errorResponse(res, 409, 'An account with this email or mobile number already exists');
    }

    const hashedPassword = await hashPassword(password);
    const [result] = await connection.query(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [cleanUsername, cleanEmail, cleanPhone, hashedPassword, 'user']
    );

    const user = {
      id: result.insertId,
      name: cleanUsername,
      email: cleanEmail,
      phone: cleanPhone,
      role: 'user'
    };

    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    });

    await connection.release();

    return successResponse(res, 201, 'Account created successfully', {
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token
    });
  } catch (error) {
    return errorResponse(res, 500, 'Something went wrong while creating your account', error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, mobile, password } = req.body;
    const cleanEmail = email?.trim().toLowerCase();
    const cleanPhone = normalizeMobileNumber(mobile);

    if ((!cleanEmail && !cleanPhone) || !password) {
      return errorResponse(res, 400, 'Mobile or email and password are required');
    }

    if (cleanEmail && !isValidEmail(cleanEmail)) {
      return errorResponse(res, 400, 'Please enter a valid email address');
    }
    if (!cleanEmail && !isValidIndianMobileNumber(cleanPhone)) {
      return errorResponse(res, 400, 'Please enter a valid 10-digit Indian mobile number');
    }

    const connection = await pool.getConnection();
    const [users] = await connection.query(
      cleanEmail ? 'SELECT * FROM users WHERE email = ? LIMIT 1' : 'SELECT * FROM users WHERE phone = ? LIMIT 1',
      [cleanEmail || cleanPhone]
    );
    await connection.release();

    if (users.length === 0) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    const user = users[0];

    if (!user?.password || typeof user.password !== 'string' || user.password.trim() === '') {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    let passwordMatches = false;
    try {
      passwordMatches = await comparePassword(password, user.password);
    } catch (error) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    if (!passwordMatches) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    });

    return successResponse(res, 200, 'Login successful', {
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token
    });
  } catch (error) {
    return errorResponse(res, 500, 'Something went wrong. Please try again.', error);
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [users] = await connection.query('SELECT id, name, phone, role FROM users WHERE id = ?', [req.user.id]);
    
    await connection.release();

    if (users.length === 0) {
      return errorResponse(res, 404, 'User not found');
    }

    return successResponse(res, 200, 'User data retrieved', users[0]);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to retrieve user', error);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const connection = await pool.getConnection();

    if (name && !isValidName(name.trim())) {
      await connection.release();
      return errorResponse(res, 400, 'Full name should contain at least 2 characters and only letters');
    }

    await connection.query(
      'UPDATE users SET name = ? WHERE id = ?',
      [name?.trim() || '', req.user.id]
    );

    const [users] = await connection.query('SELECT id, name, phone, role FROM users WHERE id = ?', [req.user.id]);
    
    await connection.release();

    return successResponse(res, 200, 'Profile updated successfully', users[0]);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to update profile', error);
  }
};
