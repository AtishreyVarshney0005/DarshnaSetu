import pool from '../config/database.js';
import { successResponse, errorResponse, generateIncidentId, determineRiskLevel } from '../utils/helpers.js';

export const getCrowdStatus = async (req, res) => {
  try {
    const { templeId } = req.params;
    const connection = await pool.getConnection();

    const [crowdData] = await connection.query(
      `SELECT 
        SUM(number_of_visitors) as estimated_crowd,
        COUNT(*) as total_bookings
       FROM bookings 
       WHERE temple_id = ? AND booking_date = CURDATE() AND booking_status IN ('confirmed', 'completed')`,
      [templeId]
    );

    const [temples] = await connection.query('SELECT capacity FROM temples WHERE id = ?', [templeId]);
    
    if (temples.length === 0) {
      await connection.release();
      return errorResponse(res, 404, 'Temple not found');
    }

    const capacity = temples[0].capacity;
    const estimatedCrowd = crowdData[0].estimated_crowd || 0;
    const occupancyPercentage = (estimatedCrowd / capacity) * 100;
    const riskLevel = determineRiskLevel(occupancyPercentage);

    const [gateData] = await connection.query(
      'SELECT id, name, capacity, current_crowd FROM gates WHERE temple_id = ?',
      [templeId]
    );

    const gatesInfo = gateData.map(gate => ({
      ...gate,
      occupancyPercentage: ((gate.current_crowd / gate.capacity) * 100).toFixed(2),
      riskLevel: determineRiskLevel((gate.current_crowd / gate.capacity) * 100)
    }));

    await connection.release();

    return successResponse(res, 200, 'Crowd status retrieved', {
      temple_id: templeId,
      estimated_crowd: estimatedCrowd,
      capacity,
      occupancy_percentage: occupancyPercentage.toFixed(2),
      risk_level: riskLevel,
      gates: gatesInfo
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to get crowd status', error);
  }
};

export const getCrowdAnalytics = async (req, res) => {
  try {
    const { templeId, startDate, endDate } = req.query;

    if (!templeId) {
      return errorResponse(res, 400, 'Temple ID is required');
    }

    const connection = await pool.getConnection();

    let query = `SELECT * FROM crowd_analytics WHERE temple_id = ?`;
    const params = [templeId];

    if (startDate) {
      query += ` AND date >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND date <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY date DESC, hour ASC`;

    const [analytics] = await connection.query(query, params);
    await connection.release();

    return successResponse(res, 200, 'Crowd analytics retrieved', analytics);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to get analytics', error);
  }
};

export const getBookingAnalytics = async (req, res) => {
  try {
    const { templeId, startDate, endDate } = req.query;

    if (!templeId) {
      return errorResponse(res, 400, 'Temple ID is required');
    }

    const connection = await pool.getConnection();

    let query = `SELECT COUNT(*) as total_bookings, SUM(number_of_visitors) as total_visitors FROM bookings WHERE temple_id = ?`;
    let params = [templeId];

    if (startDate) {
      query += ` AND booking_date >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND booking_date <= ?`;
      params.push(endDate);
    }

    const [totalData] = await connection.query(query, params);

    const [statusData] = await connection.query(
      `SELECT booking_status, COUNT(*) as count FROM bookings WHERE temple_id = ? ${startDate ? 'AND booking_date >= ?' : ''} ${endDate ? 'AND booking_date <= ?' : ''} GROUP BY booking_status`,
      params
    );

    const [trendData] = await connection.query(
      `SELECT booking_date, COUNT(*) as bookings, SUM(number_of_visitors) as visitors FROM bookings WHERE temple_id = ? ${startDate ? 'AND booking_date >= ?' : ''} ${endDate ? 'AND booking_date <= ?' : ''} GROUP BY booking_date ORDER BY booking_date DESC`,
      params
    );

    await connection.release();

    return successResponse(res, 200, 'Booking analytics retrieved', {
      total: totalData[0],
      byStatus: statusData,
      trend: trendData
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to get booking analytics', error);
  }
};

export const createEmergencyAlert = async (req, res) => {
  try {
    const { templeId, alertType, location, description, priority } = req.body;

    if (!templeId || !alertType || !location) {
      return errorResponse(res, 400, 'Missing required fields');
    }

    const connection = await pool.getConnection();

    const incidentId = generateIncidentId();

    const [result] = await connection.query(
      `INSERT INTO emergency_alerts (incident_id, temple_id, alert_type, location, description, priority, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [incidentId, templeId, alertType, location, description || null, priority || 'medium', 'active']
    );

    await connection.query(
      `INSERT INTO notifications (user_id, title, message, notification_type) 
       SELECT DISTINCT u.id, ?, ?, 'alert'
       FROM bookings b 
       JOIN users u ON b.user_id = u.id 
       WHERE b.temple_id = ? AND b.booking_date = CURDATE() AND b.booking_status IN ('confirmed', 'completed')`,
      [`Emergency Alert: ${alertType}`, `${description || 'An emergency situation has been reported'}`, templeId]
    );

    await connection.release();

    return successResponse(res, 201, 'Emergency alert created', {
      incident_id: incidentId,
      alert_type: alertType,
      location,
      status: 'active'
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to create emergency alert', error);
  }
};

export const getActiveEmergencies = async (req, res) => {
  try {
    const { templeId } = req.params;
    const connection = await pool.getConnection();

    const [emergencies] = await connection.query(
      `SELECT * FROM emergency_alerts
       WHERE temple_id = ?
       ORDER BY created_at DESC`,
      [templeId]
    );

    await connection.release();

    return successResponse(res, 200, 'Active emergencies retrieved', emergencies);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to get emergencies', error);
  }
};

export const updateEmergencyStatus = async (req, res) => {
  try {
    const { incidentId } = req.params;
    const { status, assignedStaff } = req.body;

    const allowedStatuses = ['active', 'assigned', 'responding', 'resolved'];
    if (!allowedStatuses.includes(status)) {
      return errorResponse(res, 400, 'Invalid emergency status');
    }

    const connection = await pool.getConnection();

    const [result] = await connection.query(
      'UPDATE emergency_alerts SET status = ?, assigned_staff = ? WHERE incident_id = ?',
      [status, assignedStaff || null, incidentId]
    );

    if (result.affectedRows === 0) {
      await connection.release();
      return errorResponse(res, 404, 'Emergency incident not found');
    }

    await connection.release();

    return successResponse(res, 200, 'Emergency status updated');
  } catch (error) {
    return errorResponse(res, 500, 'Failed to update emergency status', error);
  }
};

const staffRoles = ['Security', 'Medical', 'Administration', 'Crowd Control', 'Parking', 'Queue Management', 'Support'];
const staffStatuses = ['Active', 'Available', 'On Break', 'Emergency Deployment', 'Off Duty'];
const staffZones = ['Gate 1', 'Gate 2', 'Gate 3', 'Main Entrance', 'Queue Zone A', 'Queue Zone B', 'Queue Zone C', 'Parking A', 'Parking B', 'Temple Courtyard'];
const deploymentAssignments = ['Regular Duty', 'Crowd Control', 'Gate Security', 'Medical Support', 'Emergency Response', 'Parking Management', 'Queue Management'];
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const staffSelect = `SELECT sp.id, sp.staff_id, u.id AS user_id, u.name, u.email, u.phone AS contact,
  sp.staff_role AS role, sp.assigned_zone AS assigned_zone, sp.shift_start, sp.shift_end, sp.status,
  sp.assignment, sp.priority, sp.deployment_notes, sp.current_location, sp.emergency_contact,
  sp.joining_date, sp.last_deployment, sp.created_at, sp.updated_at
  FROM staff_profiles sp JOIN users u ON u.id = sp.user_id`;

export const getStaff = async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(Number.parseInt(req.query.pageSize, 10) || 10, 1), 50);
    const search = String(req.query.search || '').trim();
    const role = String(req.query.role || '');
    const status = String(req.query.status || '');
    const params = [1];
    const conditions = ['sp.temple_id = ?'];
    if (search) { conditions.push('(sp.staff_id LIKE ? OR u.name LIKE ? OR sp.staff_role LIKE ? OR sp.assigned_zone LIKE ? OR u.phone LIKE ? OR sp.status LIKE ?)'); params.push(...Array(6).fill(`%${search}%`)); }
    if (staffRoles.includes(role)) { conditions.push('sp.staff_role = ?'); params.push(role); }
    if (staffStatuses.includes(status)) { conditions.push('sp.status = ?'); params.push(status); }
    const where = conditions.join(' AND ');
    const connection = await pool.getConnection();
    const [[{ total }]] = await connection.query(`SELECT COUNT(*) AS total FROM staff_profiles sp JOIN users u ON u.id = sp.user_id WHERE ${where}`, params);
    const [items] = await connection.query(`${staffSelect} WHERE ${where} ORDER BY sp.staff_id ASC LIMIT ? OFFSET ?`, [...params, pageSize, (page - 1) * pageSize]);
    await connection.release();
    return successResponse(res, 200, 'Staff retrieved', { items, total: Number(total), page, pageSize });
  } catch (error) { return errorResponse(res, 500, 'Failed to get staff', error); }
};

export const getStaffStats = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [[stats]] = await connection.query(`SELECT COUNT(*) AS totalStaff,
      SUM(status IN ('Active', 'Emergency Deployment')) AS activeStaff,
      SUM(staff_role = 'Security') AS securityPersonnel,
      SUM(status = 'Available') AS availableStaff,
      SUM(status = 'On Break') AS onBreak,
      SUM(status = 'Emergency Deployment') AS emergencyDeployment
      FROM staff_profiles WHERE temple_id = ?`, [1]);
    await connection.release();
    return successResponse(res, 200, 'Staff statistics retrieved', Object.fromEntries(Object.entries(stats).map(([key, value]) => [key, Number(value || 0)])));
  } catch (error) { return errorResponse(res, 500, 'Failed to get staff statistics', error); }
};

export const getStaffById = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [items] = await connection.query(`${staffSelect} WHERE sp.staff_id = ? AND sp.temple_id = ?`, [req.params.staffId, 1]);
    await connection.release();
    if (!items.length) return errorResponse(res, 404, 'Staff member not found');
    return successResponse(res, 200, 'Staff member retrieved', items[0]);
  } catch (error) { return errorResponse(res, 500, 'Failed to get staff member', error); }
};

export const updateStaff = async (req, res) => {
  const { name, role, assignedZone, shiftStart, shiftEnd, status, contact, email } = req.body;
  if (!name || !staffRoles.includes(role) || !staffStatuses.includes(status) || !shiftStart || !shiftEnd || !contact) return errorResponse(res, 400, 'Valid staff details are required');
  try {
    const connection = await pool.getConnection();
    const [staff] = await connection.query('SELECT user_id FROM staff_profiles WHERE staff_id = ? AND temple_id = ?', [req.params.staffId, 1]);
    if (!staff.length) { await connection.release(); return errorResponse(res, 404, 'Staff member not found'); }
    await connection.beginTransaction();
    await connection.query('UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?', [name.trim(), email || null, contact.trim(), staff[0].user_id]);
    await connection.query('UPDATE staff_profiles SET staff_role = ?, assigned_zone = ?, shift_start = ?, shift_end = ?, status = ? WHERE staff_id = ? AND temple_id = ?', [role, assignedZone || 'Main Entrance', shiftStart, shiftEnd, status, req.params.staffId, 1]);
    await connection.commit(); await connection.release();
    return getStaffById(req, res);
  } catch (error) { return errorResponse(res, 500, 'Failed to update staff member', error); }
};

export const updateStaffStatus = async (req, res) => {
  if (!staffStatuses.includes(req.body.status)) return errorResponse(res, 400, 'Invalid staff status');
  try { const [result] = await pool.query('UPDATE staff_profiles SET status = ? WHERE staff_id = ? AND temple_id = ?', [req.body.status, req.params.staffId, 1]); if (!result.affectedRows) return errorResponse(res, 404, 'Staff member not found'); return successResponse(res, 200, 'Staff status updated'); } catch (error) { return errorResponse(res, 500, 'Failed to update staff status', error); }
};

export const updateStaffZone = async (req, res) => {
  if (!staffZones.includes(req.body.zone)) return errorResponse(res, 400, 'Invalid staff zone');
  try { const [result] = await pool.query('UPDATE staff_profiles SET assigned_zone = ?, current_location = ? WHERE staff_id = ? AND temple_id = ?', [req.body.zone, req.body.zone, req.params.staffId, 1]); if (!result.affectedRows) return errorResponse(res, 404, 'Staff member not found'); return successResponse(res, 200, 'Staff zone updated'); } catch (error) { return errorResponse(res, 500, 'Failed to update staff zone', error); }
};

export const deployStaff = async (req, res) => {
  const { zone, assignment, priority = 'LOW', notes = '', incidentId } = req.body;
  if (!staffZones.includes(zone) || !deploymentAssignments.includes(assignment) || !priorities.includes(priority)) return errorResponse(res, 400, 'Valid deployment details are required');
  const connection = await pool.getConnection();
  try {
    const [staff] = await connection.query('SELECT id, user_id FROM staff_profiles WHERE staff_id = ? AND temple_id = ?', [req.params.staffId, 1]);
    if (!staff.length) { await connection.release(); return errorResponse(res, 404, 'Staff member not found'); }
    await connection.beginTransaction();
    const deploymentId = `DEP-${Date.now()}`;
    await connection.query('INSERT INTO staff_deployments (deployment_id, staff_profile_id, incident_id, zone, assignment, priority, notes, deployed_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [deploymentId, staff[0].id, incidentId || null, zone, assignment, priority, notes, req.user?.id || null]);
    await connection.query('UPDATE staff_profiles SET status = ?, assigned_zone = ?, assignment = ?, priority = ?, deployment_notes = ?, current_location = ?, last_deployment = NOW() WHERE id = ?', ['Emergency Deployment', zone, assignment, priority, notes, zone, staff[0].id]);
    if (incidentId) await connection.query('UPDATE emergency_alerts SET status = ?, assigned_staff = ? WHERE incident_id = ?', ['assigned', staff[0].user_id, incidentId]);
    await connection.commit(); await connection.release();
    return successResponse(res, 200, 'Staff deployed successfully', { deploymentId });
  } catch (error) { await connection.rollback(); await connection.release(); return errorResponse(res, 500, 'Failed to deploy staff', error); }
};

export const removeStaff = async (req, res) => {
  try { const [result] = await pool.query('DELETE sp FROM staff_profiles sp WHERE sp.staff_id = ? AND sp.temple_id = ?', [req.params.staffId, 1]); if (!result.affectedRows) return errorResponse(res, 404, 'Staff member not found'); return successResponse(res, 200, 'Staff removed successfully'); } catch (error) { return errorResponse(res, 500, 'Failed to remove staff', error); }
};

export const getParkingStatus = async (req, res) => {
  try {
    const { templeId } = req.params;
    const connection = await pool.getConnection();

    const [parkingData] = await connection.query(
      'SELECT * FROM parking WHERE temple_id = ?',
      [templeId]
    );

    const parking = parkingData.map(p => ({
      ...p,
      available: p.capacity - p.occupied,
      occupancy_percentage: ((p.occupied / p.capacity) * 100).toFixed(2)
    }));

    await connection.release();

    return successResponse(res, 200, 'Parking status retrieved', parking);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to get parking status', error);
  }
};

export const updateParkingStatus = async (req, res) => {
  try {
    const { parkingId } = req.params;
    const { occupied } = req.body;

    if (!Number.isInteger(occupied) || occupied < 0) {
      return errorResponse(res, 400, 'Occupied count must be a non-negative integer');
    }

    const connection = await pool.getConnection();

    const [parking] = await connection.query(
      'SELECT capacity FROM parking WHERE id = ?',
      [parkingId]
    );

    if (parking.length === 0) {
      await connection.release();
      return errorResponse(res, 404, 'Parking not found');
    }

    if (occupied > parking[0].capacity) {
      await connection.release();
      return errorResponse(res, 400, 'Occupied cannot exceed capacity');
    }

    await connection.query(
      `UPDATE parking
       SET occupied = ?, available = capacity - ?, occupancy_percentage = (? / capacity) * 100
       WHERE id = ?`,
      [occupied, occupied, occupied, parkingId]
    );

    await connection.release();

    return successResponse(res, 200, 'Parking status updated');
  } catch (error) {
    return errorResponse(res, 500, 'Failed to update parking status', error);
  }
};

export const getQueueStatus = async (req, res) => {
  try {
    const { gateId } = req.params;
    const connection = await pool.getConnection();

    const [queueData] = await connection.query(
      `SELECT q.*, b.booking_id, b.number_of_visitors
       FROM queue_management q
       JOIN bookings b ON q.booking_id = b.id
       WHERE q.gate_id = ? AND q.status IN ('waiting', 'in_progress')
       ORDER BY q.position ASC`,
      [gateId]
    );

    await connection.release();

    return successResponse(res, 200, 'Queue status retrieved', {
      total_in_queue: queueData.length,
      queue: queueData
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to get queue status', error);
  }
};
