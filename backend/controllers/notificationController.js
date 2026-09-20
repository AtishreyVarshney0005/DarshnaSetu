import pool from '../config/database.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, offset = 0, read_status } = req.query;
    const parsedLimit = Number.parseInt(limit, 10);
    const parsedOffset = Number.parseInt(offset, 10);

    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100 || !Number.isInteger(parsedOffset) || parsedOffset < 0) {
      return errorResponse(res, 400, 'Limit must be 1-100 and offset must be zero or greater');
    }

    const connection = await pool.getConnection();

    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [userId];

    if (read_status !== undefined) {
      query += ` AND read_status = ?`;
      params.push(read_status === 'true');
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parsedLimit, parsedOffset);

    const [notifications] = await connection.query(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?';
    const countParams = [userId];

    if (read_status !== undefined) {
      countQuery += ` AND read_status = ?`;
      countParams.push(read_status === 'true');
    }

    const [countResult] = await connection.query(countQuery, countParams);

    await connection.release();

    return successResponse(res, 200, 'Notifications retrieved', {
      total: countResult[0].total,
      notifications
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to get notifications', error);
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const connection = await pool.getConnection();

    const [result] = await connection.query(
      'UPDATE notifications SET read_status = TRUE WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );

    if (result.affectedRows === 0) {
      await connection.release();
      return errorResponse(res, 404, 'Notification not found');
    }

    await connection.release();

    return successResponse(res, 200, 'Notification marked as read');
  } catch (error) {
    return errorResponse(res, 500, 'Failed to mark notification', error);
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await pool.getConnection();

    await connection.query(
      'UPDATE notifications SET read_status = TRUE WHERE user_id = ? AND read_status = FALSE',
      [userId]
    );

    await connection.release();

    return successResponse(res, 200, 'All notifications marked as read');
  } catch (error) {
    return errorResponse(res, 500, 'Failed to mark notifications', error);
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const connection = await pool.getConnection();

    const [result] = await connection.query(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );

    if (result.affectedRows === 0) {
      await connection.release();
      return errorResponse(res, 404, 'Notification not found');
    }

    await connection.release();

    return successResponse(res, 200, 'Notification deleted');
  } catch (error) {
    return errorResponse(res, 500, 'Failed to delete notification', error);
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await pool.getConnection();

    const [result] = await connection.query(
      'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND read_status = FALSE',
      [userId]
    );

    await connection.release();

    return successResponse(res, 200, 'Unread count retrieved', {
      unread_count: result[0].unread_count
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to get unread count', error);
  }
};

export const markAsUnread = async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE notifications SET read_status = FALSE WHERE id = ? AND user_id = ?', [req.params.notificationId, req.user.id]);
    if (!result.affectedRows) return errorResponse(res, 404, 'Notification not found');
    return successResponse(res, 200, 'Notification marked as unread');
  } catch (error) { return errorResponse(res, 500, 'Failed to mark notification', error); }
};