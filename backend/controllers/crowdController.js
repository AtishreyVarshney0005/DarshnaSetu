import pool from '../config/database.js';
import { calculateWaitTime, determineRiskLevel, errorResponse, getIndiaDateString, successResponse } from '../utils/helpers.js';

const getLiveCrowd = async (connection, templeId) => {
  const [temples] = await connection.query(
    'SELECT id, name, capacity FROM temples WHERE id = ?',
    [templeId]
  );

  if (!temples.length) return null;

  const temple = temples[0];
  const [gateRows] = await connection.query(
    `SELECT id, name, capacity, current_crowd, risk_level
     FROM gates WHERE temple_id = ? ORDER BY id`,
    [templeId]
  );
  const [bookingRows] = await connection.query(
    `SELECT COALESCE(SUM(number_of_visitors), 0) AS booked_visitors
     FROM bookings
     WHERE temple_id = ? AND booking_date = ?
       AND booking_status IN ('confirmed', 'completed')`,
    [templeId, getIndiaDateString()]
  );

  const gateVisitors = gateRows.reduce((total, gate) => total + Number(gate.current_crowd || 0), 0);
  const currentVisitors = gateVisitors || Number(bookingRows[0].booked_visitors || 0);
  const capacity = Number(temple.capacity || 0);
  const occupancy = capacity ? Number(((currentVisitors / capacity) * 100).toFixed(2)) : 0;
  const gates = gateRows.map((gate) => {
    const gateCapacity = Number(gate.capacity || 0);
    const gateOccupancy = gateCapacity ? Number(((Number(gate.current_crowd || 0) / gateCapacity) * 100).toFixed(2)) : 0;
    return {
      id: gate.id,
      name: gate.name,
      capacity: gateCapacity,
      currentVisitors: Number(gate.current_crowd || 0),
      occupancy: gateOccupancy,
      riskLevel: determineRiskLevel(gateOccupancy)
    };
  });

  return {
    templeId: temple.id,
    templeName: temple.name,
    currentVisitors,
    capacity,
    occupancy,
    estimatedWait: calculateWaitTime(currentVisitors, capacity),
    riskLevel: determineRiskLevel(occupancy),
    gates,
    updatedAt: new Date().toISOString()
  };
};

export const getLive = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const crowd = await getLiveCrowd(connection, req.params.templeId);
    if (!crowd) return errorResponse(res, 404, 'Temple not found');
    return successResponse(res, 200, 'Live crowd retrieved', crowd);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to retrieve live crowd', error);
  } finally {
    connection?.release();
  }
};

export const getHistory = async (req, res) => {
  let connection;
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 24, 1), 168);
    connection = await pool.getConnection();
    const [history] = await connection.query(
      `SELECT date, hour, estimated_crowd AS currentVisitors,
              predicted_crowd AS predictedVisitors,
              occupancy_percentage AS occupancy, risk_level AS riskLevel,
              created_at AS updatedAt
       FROM crowd_analytics
       WHERE temple_id = ?
       ORDER BY date DESC, hour DESC
       LIMIT ${limit}`,
      [req.params.templeId]
    );
    return successResponse(res, 200, 'Crowd history retrieved', history.reverse());
  } catch (error) {
    return errorResponse(res, 500, 'Failed to retrieve crowd history', error);
  } finally {
    connection?.release();
  }
};

export const recordCrowd = async (req, res) => {
  let connection;
  try {
    const { templeId, visitorCount, capacity, averageWaitTime, entryCount = 0, exitCount = 0, source = 'MANUAL' } = req.body;
    if (!templeId || !Number.isInteger(Number(visitorCount)) || Number(visitorCount) < 0) {
      return errorResponse(res, 400, 'Temple ID and a non-negative visitor count are required');
    }

    connection = await pool.getConnection();
    const crowd = await getLiveCrowd(connection, templeId);
    if (!crowd) return errorResponse(res, 404, 'Temple not found');

    const resolvedCapacity = Number(capacity) || crowd.capacity;
    const occupancy = resolvedCapacity ? (Number(visitorCount) / resolvedCapacity) * 100 : 0;
    const riskLevel = determineRiskLevel(occupancy);
    await connection.query(
      `INSERT INTO crowd_analytics
       (temple_id, date, hour, estimated_crowd, predicted_crowd,
        occupancy_percentage, risk_level)
       VALUES (?, CURDATE(), HOUR(NOW()), ?, ?, ?, ?)`,
      [templeId, Number(visitorCount), Number(visitorCount), occupancy, riskLevel]
    );

    const response = {
      ...crowd,
      currentVisitors: Number(visitorCount),
      capacity: resolvedCapacity,
      occupancy: Number(occupancy.toFixed(2)),
      estimatedWait: Number(averageWaitTime) || calculateWaitTime(Number(visitorCount), resolvedCapacity),
      riskLevel,
      entryCount: Number(entryCount),
      exitCount: Number(exitCount),
      source,
      updatedAt: new Date().toISOString()
    };
    return successResponse(res, 201, 'Crowd data recorded', response);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to record crowd data', error);
  } finally {
    connection?.release();
  }
};

export { getLiveCrowd };
