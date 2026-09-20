import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import crypto from 'node:crypto';

export const generateToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || '7d'
  });
};

export const verifyToken = (token) => {
  try {
    if (!process.env.JWT_SECRET) {
      return null;
    }

    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

export const generateQRCode = async (data) => {
  try {
    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(data));
    return qrCodeImage;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw error;
  }
};

export const getIndiaDateString = (date = new Date()) => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

export const addDaysToDateString = (dateString, days) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
};

export const isDateOnlyString = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

export const generateSecureQrToken = () => crypto.randomBytes(32).toString('hex');

export const generateBookingId = () => {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const randomNum = Math.floor(Math.random() * 10000);
  return `BK-${dateStr}-${randomNum}`;
};

export const generateIncidentId = () => {
  const randomNum = Math.floor(Math.random() * 10000);
  return `INC-${randomNum}`;
};

export const errorResponse = (res, statusCode, message, error = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && error ? { error: error.message } : {})
  });
};

export const successResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const normalizeMobileNumber = (phone) => {
  const value = String(phone ?? '').trim().replace(/[\s\-()]/g, '');
  if (value.startsWith('+91')) return value.slice(3);
  if (value.startsWith('91') && value.length === 12) return value.slice(2);
  return value;
};

export const isValidIndianMobileNumber = (phone) => {
  return /^\d{10}$/.test(normalizeMobileNumber(phone));
};

export const isValidName = (name) => {

  const nameRegex = /^[a-zA-Z\s]{2,}$/;
  return nameRegex.test(name?.trim());
};

export const calculateWaitTime = (crowdLevel, capacity) => {
  const occupancyPercentage = (crowdLevel / capacity) * 100;
  if (occupancyPercentage < 50) return 15;
  if (occupancyPercentage < 70) return 30;
  if (occupancyPercentage < 85) return 45;
  return 60;
};


export const determineRiskLevel = (occupancyPercentage) => {
  if (occupancyPercentage < 50) return 'safe';
  if (occupancyPercentage < 70) return 'moderate';
  if (occupancyPercentage < 85) return 'high';
  return 'critical';
};
