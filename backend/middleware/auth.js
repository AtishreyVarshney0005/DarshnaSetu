import { verifyToken, errorResponse } from '../utils/helpers.js';

export const verifyAuth = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    const [scheme, token] = authorization?.split(' ') || [];
    
    if (scheme !== 'Bearer' || !token) {
      return errorResponse(res, 401, 'No token provided');
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return errorResponse(res, 401, 'Invalid or expired token');
    }

    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, 401, 'Authentication failed', error);
  }
};

export const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Admin access required');
  }
  next();
};

export const verifyStaff = (req, res, next) => {
  if (req.user.role !== 'staff' && req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Staff access required');
  }
  next();
};

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  return errorResponse(res, 500, 'Internal server error', err);
};
