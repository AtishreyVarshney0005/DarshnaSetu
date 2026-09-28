import pool from '../config/database.js';
import { generateBookingId, generateQRCode, generateSecureQrToken, successResponse, errorResponse, calculateWaitTime, determineRiskLevel, getIndiaDateString, addDaysToDateString, isDateOnlyString } from '../utils/helpers.js';

const MAX_VISITORS_PER_BOOKING = 20;

const FALLBACK_TEMPLE_CATALOG = [
  { id: 1, name: 'Banke Bihari Temple', location: 'Vrindavan', capacity: 10000, description: 'Ancient temple dedicated to Lord Krishna', image_url: '/assets/hero_temple.png' },
  { id: 2, name: 'Dauji Temple', location: 'Baldeo', capacity: 8000, description: 'Shiva temple with historical significance', image_url: '/assets/temple_image.png' },
  { id: 3, name: 'Dwarkadhish Temple', location: 'Mathura', capacity: 12000, description: 'Grand temple of Lord Krishna', image_url: '/assets/temple_illustration.png' },
  { id: 4, name: 'Giriraj Ji Temple', location: 'Govardhan', capacity: 6000, description: 'Sacred mountain temple', image_url: '/assets/hero_temple.png' },
  { id: 5, name: 'Prem Mandir', location: 'Vrindavan', capacity: 9000, description: 'Modern architectural marvel', image_url: '/assets/temple_image.png' },
  { id: 6, name: 'Radha Rani Temple', location: 'Barsana', capacity: 7000, description: 'Devotion to Radha Ji', image_url: '/assets/temple_illustration.png' },
  { id: 7, name: 'Shri Krishna Janmabhoomi', location: 'Mathura', capacity: 15000, description: 'Birthplace of Lord Krishna', image_url: '/assets/hero_temple.png' }
];

const FALLBACK_DARSHAN_TYPES = {
  1: [
    { id: 1, name: 'Regular Darshan', description: 'Standard darshan experience', price: 0, duration_minutes: 30 },
    { id: 2, name: 'VIP Darshan', description: 'Priority access with less waiting', price: 500, duration_minutes: 30 },
    { id: 3, name: 'Special Pooja Darshan', description: 'Includes special prayers', price: 1000, duration_minutes: 45 }
  ],
  2: [{ id: 4, name: 'Regular Darshan', description: 'Standard darshan', price: 0, duration_minutes: 30 }],
  3: [{ id: 5, name: 'Regular Darshan', description: 'Standard darshan', price: 0, duration_minutes: 30 }, { id: 6, name: 'VIP Darshan', description: 'VIP priority access', price: 500, duration_minutes: 30 }],
  4: [{ id: 7, name: 'Regular Darshan', description: 'Standard darshan', price: 0, duration_minutes: 30 }],
  5: [{ id: 8, name: 'Regular Darshan', description: 'Standard darshan', price: 0, duration_minutes: 30 }],
  6: [{ id: 9, name: 'Regular Darshan', description: 'Standard darshan', price: 0, duration_minutes: 30 }],
  7: [{ id: 10, name: 'Regular Darshan', description: 'Standard darshan', price: 0, duration_minutes: 30 }]
};

const FALLBACK_GATE_CONFIG = [
  { id: 1, name: 'Gate A', capacity: 2000, current_crowd: 1200, risk_level: 'moderate' },
  { id: 2, name: 'Gate B', capacity: 1800, current_crowd: 900, risk_level: 'safe' },
  { id: 3, name: 'Gate C', capacity: 2000, current_crowd: 1500, risk_level: 'high' },
  { id: 4, name: 'Gate D', capacity: 2200, current_crowd: 950, risk_level: 'moderate' }
];

const getFallbackTempleById = (templeId) => {
  const normalizedId = Number(templeId);
  const temple = FALLBACK_TEMPLE_CATALOG.find((item) => Number(item.id) === normalizedId);
  if (!temple) return null;

  return {
    ...temple,
    darshanTypes: FALLBACK_DARSHAN_TYPES[normalizedId] || FALLBACK_DARSHAN_TYPES[1],
    gates: FALLBACK_GATE_CONFIG.map((gate) => ({ ...gate, temple_id: normalizedId }))
  };
};

const getFallbackTimeSlots = (templeId, date) => {
  const normalizedTempleId = Number(templeId);
  const startTimes = ['06:00:00', '07:00:00', '08:00:00', '16:00:00', '17:00:00', '18:00:00'];
  const capacity = normalizedTempleId % 2 === 0 ? 1200 : 1000;

  return startTimes.map((start_time, index) => ({
    id: index + 1,
    temple_id: normalizedTempleId,
    date,
    start_time,
    end_time: index < 2 ? '07:00:00' : index < 3 ? '17:00:00' : index < 4 ? '18:00:00' : '19:00:00',
    capacity,
    booked: index === 0 ? 200 : index === 1 ? 420 : index === 2 ? 580 : index === 3 ? 350 : index === 4 ? 460 : 510,
    status: 'available',
    created_at: new Date().toISOString()
  }));
};

const validateBookingDate = (date) => {
  if (!isDateOnlyString(date)) return { valid: false, message: 'Date must use YYYY-MM-DD format' };
  const today = getIndiaDateString();
  const lastBookableDate = addDaysToDateString(today, 6);
  if (date < today) return { valid: false, message: 'Past dates are not available for booking' };
  if (date > lastBookableDate) return { valid: false, message: 'Booking is allowed only for the next 7 days' };
  return { valid: true, today, lastBookableDate };
};

const ensureSlotsForDate = async (connection, templeId, date) => {
  const normalizedTempleId = Number(templeId);
  if (!Number.isInteger(normalizedTempleId)) return false;

  const [temples] = await connection.query('SELECT capacity FROM temples WHERE id = ?', [normalizedTempleId]);
  if (!temples.length) return false;
  const capacity = Math.max(100, Math.floor(temples[0].capacity / 10));
  const defaultSlots = [['06:00:00', '07:00:00'], ['07:00:00', '08:00:00'], ['08:00:00', '09:00:00'], ['16:00:00', '17:00:00'], ['17:00:00', '18:00:00'], ['18:00:00', '19:00:00']];
  await connection.query(
    `INSERT IGNORE INTO time_slots (temple_id, date, start_time, end_time, capacity, booked, status)
     VALUES ${defaultSlots.map(() => '(?, ?, ?, ?, ?, 0, \'available\')').join(', ')}`,
    defaultSlots.flatMap(([start, end]) => [normalizedTempleId, date, start, end, capacity])
  );
  return true;
};

export const getAllTemples = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [temples] = await connection.query('SELECT * FROM temples');
    await connection.release();

    return successResponse(res, 200, 'Temples retrieved', temples.length ? temples : FALLBACK_TEMPLE_CATALOG);
  } catch (error) {
    return successResponse(res, 200, 'Temples retrieved from fallback catalog', FALLBACK_TEMPLE_CATALOG);
  }
};

export const getTempleDetails = async (req, res) => {
  try {
    const { templeId } = req.params;
    const connection = await pool.getConnection();

    const [temples] = await connection.query('SELECT * FROM temples WHERE id = ?', [templeId]);
    
    if (temples.length === 0) {
      await connection.release();
      const fallbackTemple = getFallbackTempleById(templeId);
      if (!fallbackTemple) return errorResponse(res, 404, 'Temple not found');
      return successResponse(res, 200, 'Temple details retrieved', fallbackTemple);
    }

    const [darshanTypes] = await connection.query('SELECT * FROM darshan_types WHERE temple_id = ?', [templeId]);
    
    const [gates] = await connection.query('SELECT * FROM gates WHERE temple_id = ?', [templeId]);

    await connection.release();

    return successResponse(res, 200, 'Temple details retrieved', {
      ...temples[0],
      darshanTypes,
      gates
    });
  } catch (error) {
    const fallbackTemple = getFallbackTempleById(templeId);
    if (!fallbackTemple) return errorResponse(res, 404, 'Temple not found');
    return successResponse(res, 200, 'Temple details retrieved from fallback catalog', fallbackTemple);
  }
};

export const getTimeSlots = async (req, res) => {
  try {
    const { templeId, date } = req.query;

    if (!templeId || !date) {
      return errorResponse(res, 400, 'Temple ID and date are required');
    }

    const dateValidation = validateBookingDate(date);
    if (!dateValidation.valid) return errorResponse(res, 400, dateValidation.message);

    const connection = await pool.getConnection();
    if (!await ensureSlotsForDate(connection, templeId, date)) {
      await connection.release();
      const fallbackTemple = getFallbackTempleById(templeId);
      if (!fallbackTemple) return errorResponse(res, 404, 'Temple not found');
      return successResponse(res, 200, 'Time slots retrieved from fallback catalog', getFallbackTimeSlots(templeId, date));
    }

    const [slots] = await connection.query(
      `SELECT id, temple_id, TO_CHAR(date, 'YYYY-MM-DD') AS date, start_time, end_time,
              capacity, booked, status, created_at
       FROM time_slots WHERE temple_id = ? AND date = ? ORDER BY start_time`,
      [templeId, date]
    );

    await connection.release();

    return successResponse(res, 200, 'Time slots retrieved', slots.length ? slots : getFallbackTimeSlots(templeId, date));
  } catch (error) {
    const fallbackTemple = getFallbackTempleById(templeId);
    if (!fallbackTemple) return errorResponse(res, 404, 'Temple not found');
    return successResponse(res, 200, 'Time slots retrieved from fallback catalog', getFallbackTimeSlots(templeId, date));
  }
};

export const getAvailableDates = async (req, res) => {
  const today = getIndiaDateString();
  const dates = Array.from({ length: 7 }, (_, index) => addDaysToDateString(today, index));
  return successResponse(res, 200, 'Booking dates retrieved', { today, lastBookableDate: dates[6], dates });
};

export const getBookingQr = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [bookings] = await connection.query(
      'SELECT booking_id, qr_code, DATE_FORMAT(booking_date, \'%Y-%m-%d\') as booking_date FROM bookings WHERE booking_id = ? AND user_id = ?',
      [req.params.bookingId, req.user.id]
    );
    await connection.release();
    if (!bookings.length) return errorResponse(res, 404, 'Booking not found');
    return successResponse(res, 200, 'QR retrieved', bookings[0]);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to retrieve QR', error);
  }
};

export const verifyQr = async (req, res) => {
  let connection;
  let transactionStarted = false;
  try {
    const { token, templeId, date, timeSlotId } = req.body;
    if (!token) return errorResponse(res, 400, 'QR token is required');
    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;
    const [bookings] = await connection.query(
      `SELECT b.*, DATE_FORMAT(b.booking_date, '%Y-%m-%d') as booking_date, t.name as temple_name,
              ts.start_time, ts.end_time
       FROM bookings b JOIN temples t ON t.id = b.temple_id JOIN time_slots ts ON ts.id = b.time_slot_id
       WHERE b.qr_token = ? FOR UPDATE`,
      [token]
    );
    if (!bookings.length) return errorResponse(res, 404, 'Invalid QR Code');
    const booking = bookings[0];
    if (booking.booking_status === 'cancelled') return errorResponse(res, 409, 'Cancelled booking QR code');
    if (booking.booking_status === 'completed') return errorResponse(res, 409, 'QR Already Used');
    if ((templeId && Number(templeId) !== booking.temple_id) || (date && date !== booking.booking_date) || (timeSlotId && Number(timeSlotId) !== booking.time_slot_id)) {
      return errorResponse(res, 409, 'QR details do not match this temple visit');
    }
    await connection.commit();
    transactionStarted = false;
    return successResponse(res, 200, 'Valid Darshan Pass', { bookingId: booking.booking_id, temple: booking.temple_name, date: booking.booking_date, time: `${booking.start_time} - ${booking.end_time}` });
  } catch (error) {
    return errorResponse(res, 500, 'QR verification failed', error);
  } finally {
    if (connection) {
      if (transactionStarted) await connection.rollback().catch(() => {});
      connection.release();
    }
  }
};

export const createBooking = async (req, res) => {
  let connection;
  let transactionStarted = false;

  try {
    const { templeId, darshanTypeId, timeSlotId, numberOfVisitors, date } = req.body;
    const userId = req.user.id;

    if (!templeId || !darshanTypeId || !timeSlotId || !date || !Number.isInteger(numberOfVisitors) || numberOfVisitors < 1 || numberOfVisitors > MAX_VISITORS_PER_BOOKING) {
      return errorResponse(res, 400, 'Missing required fields');
    }

    const dateValidation = validateBookingDate(date);
    if (!dateValidation.valid) return errorResponse(res, 400, dateValidation.message);

    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    if (!await ensureSlotsForDate(connection, templeId, date)) {
      await connection.rollback();
      transactionStarted = false;
      return errorResponse(res, 404, 'Temple not found');
    }

    const [slots] = await connection.query(
      'SELECT * FROM time_slots WHERE id = ? AND temple_id = ? AND date = ? FOR UPDATE',
      [timeSlotId, templeId, date]
    );

    if (slots.length === 0) {
      await connection.rollback();
      transactionStarted = false;
      return errorResponse(res, 404, 'Time slot not found');
    }

    const slot = slots[0];
    const availableSlots = slot.capacity - slot.booked;

    if (availableSlots < numberOfVisitors) {
      await connection.rollback();
      transactionStarted = false;
      return errorResponse(res, 409, 'Not enough slots available');
    }

    const [duplicateBookings] = await connection.query(
      `SELECT id FROM bookings
       WHERE user_id = ? AND temple_id = ? AND time_slot_id = ? AND booking_date = ?
       AND booking_status IN ('pending', 'confirmed', 'completed') LIMIT 1`,
      [userId, templeId, timeSlotId, date]
    );
    if (duplicateBookings.length > 0) {
      await connection.rollback();
      transactionStarted = false;
      return errorResponse(res, 409, 'You already have a booking for this temple, date, and time slot');
    }

    const [darshanTypes] = await connection.query(
      'SELECT id FROM darshan_types WHERE id = ? AND temple_id = ?',
      [darshanTypeId, templeId]
    );

    if (darshanTypes.length === 0) {
      await connection.rollback();
      transactionStarted = false;
      return errorResponse(res, 404, 'Darshan type not found');
    }

    const bookingId = generateBookingId();
    const qrToken = generateSecureQrToken();
    const qrData = { bookingId, token: qrToken };
    const qrCode = await generateQRCode(qrData);

    const [temples] = await connection.query('SELECT * FROM temples WHERE id = ?', [templeId]);

    if (temples.length === 0) {
      await connection.rollback();
      transactionStarted = false;
      return errorResponse(res, 404, 'Temple not found');
    }

    const temple = temples[0];

    const [gates] = await connection.query(
      'SELECT * FROM gates WHERE temple_id = ? ORDER BY current_crowd ASC LIMIT 1',
      [templeId]
    );
    const gateAssignment = gates.length > 0 ? gates[0].name : 'A-001';

    const [result] = await connection.query(
      `INSERT INTO bookings 
      (booking_id, user_id, temple_id, darshan_type_id, time_slot_id, number_of_visitors, gate_assignment, qr_code, qr_token, booking_status, booking_date, booking_time) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingId,
        userId,
        templeId,
        darshanTypeId,
        timeSlotId,
        numberOfVisitors,
        gateAssignment,
        qrCode,
        qrToken,
        'confirmed',
        date,
        slot.start_time
      ]
    );

    await connection.query(
      'UPDATE time_slots SET booked = booked + ? WHERE id = ?',
      [numberOfVisitors, timeSlotId]
    );

    const newBooked = slot.booked + numberOfVisitors;
    const occupancyPercentage = (newBooked / slot.capacity) * 100;
    let status = 'available';
    if (occupancyPercentage > 85) status = 'full';
    else if (occupancyPercentage > 70) status = 'almost_full';
    else if (occupancyPercentage > 50) status = 'limited';

    await connection.query(
      'UPDATE time_slots SET status = ? WHERE id = ?',
      [status, timeSlotId]
    );

    await connection.query(
      `INSERT INTO notifications (user_id, title, message, notification_type) 
       VALUES (?, ?, ?, ?)`,
      [userId, 'Booking Confirmed', `Your booking ${bookingId} has been confirmed`, 'booking']
    );

    await connection.commit();
    transactionStarted = false;

    const waitTime = calculateWaitTime(newBooked, slot.capacity);

    return successResponse(res, 201, 'Booking created successfully', {
      bookingId,
      templeId,
      temple: temple.name,
      numberOfVisitors,
      gateAssignment,
      date,
      time: `${slot.start_time} - ${slot.end_time}`,
      darshanType: darshanTypes[0].name,
      estimatedWaitTime: `${waitTime} minutes`,
      qrCode,
      qrToken
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to create booking', error);
  } finally {
    if (connection) {
      if (transactionStarted) {
        await connection.rollback().catch(() => {});
      }
      connection.release();
    }
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await pool.getConnection();

    const [bookings] = await connection.query(
      `SELECT b.*, DATE_FORMAT(b.booking_date, '%Y-%m-%d') as booking_date, t.name as temple_name, dt.name as darshan_type 
       FROM bookings b 
       JOIN temples t ON b.temple_id = t.id 
       JOIN darshan_types dt ON b.darshan_type_id = dt.id 
       WHERE b.user_id = ? 
       ORDER BY b.booking_date DESC`,
      [userId]
    );

    await connection.release();

    return successResponse(res, 200, 'User bookings retrieved', bookings);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to retrieve bookings', error);
  }
};

export const getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const connection = await pool.getConnection();

    const [bookings] = await connection.query(
      `SELECT b.*, DATE_FORMAT(b.booking_date, '%Y-%m-%d') as booking_date, t.name as temple_name, dt.name as darshan_type, ts.start_time, ts.end_time 
       FROM bookings b 
       JOIN temples t ON b.temple_id = t.id 
       JOIN darshan_types dt ON b.darshan_type_id = dt.id 
       JOIN time_slots ts ON b.time_slot_id = ts.id 
      WHERE b.booking_id = ? AND b.user_id = ?`,
          [bookingId, req.user.id]
    );

    if (bookings.length === 0) {
      await connection.release();
      return errorResponse(res, 404, 'Booking not found');
    }

    await connection.release();

    return successResponse(res, 200, 'Booking details retrieved', bookings[0]);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to retrieve booking details', error);
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    const connection = await pool.getConnection();

    const [bookings] = await connection.query(
      'SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?',
      [bookingId, userId]
    );

    if (bookings.length === 0) {
      await connection.release();
      return errorResponse(res, 404, 'Booking not found');
    }

    const booking = bookings[0];

    if (booking.booking_status === 'cancelled') {
      await connection.release();
      return errorResponse(res, 400, 'Booking is already cancelled');
    }

    await connection.query(
      'UPDATE bookings SET booking_status = ? WHERE booking_id = ?',
      ['cancelled', bookingId]
    );

    await connection.query(
      'UPDATE time_slots SET booked = booked - ? WHERE id = ?',
      [booking.number_of_visitors, booking.time_slot_id]
    );

    await connection.query(
      `INSERT INTO notifications (user_id, title, message, notification_type) 
       VALUES (?, ?, ?, ?)`,
      [userId, 'Booking Cancelled', `Your booking ${bookingId} has been cancelled`, 'booking']
    );

    await connection.release();

    return successResponse(res, 200, 'Booking cancelled successfully');
  } catch (error) {
    return errorResponse(res, 500, 'Failed to cancel booking', error);
  }
};

export const checkinBooking = async (req, res) => {
  let connection;
  let transactionStarted = false;

  try {
    const { bookingId, gateId } = req.body;
    if (!bookingId) {
      return errorResponse(res, 400, 'Booking ID is required');
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const [bookings] = await connection.query(
      `SELECT * FROM bookings
       WHERE booking_id = ? AND (user_id = ? OR ? IN ('staff', 'admin'))
       FOR UPDATE`,
      [bookingId, req.user.id, req.user.role]
    );

    if (bookings.length === 0) {
      await connection.rollback();
      transactionStarted = false;
      return errorResponse(res, 404, 'Booking not found');
    }

    const booking = bookings[0];
    if (booking.booking_status === 'cancelled') {
      await connection.rollback();
      transactionStarted = false;
      return errorResponse(res, 400, 'Cancelled bookings cannot be checked in');
    }
    if (booking.booking_status === 'completed') {
      await connection.rollback();
      transactionStarted = false;
      return errorResponse(res, 409, 'Booking is already checked in');
    }

    if (gateId) {
      const [gates] = await connection.query(
        'SELECT id FROM gates WHERE id = ? AND temple_id = ?',
        [gateId, booking.temple_id]
      );
      if (gates.length === 0) {
        await connection.rollback();
        transactionStarted = false;
        return errorResponse(res, 404, 'Gate not found for this temple');
      }
    }

    await connection.query(
      'INSERT INTO checkins (booking_id, gate_id, status) VALUES (?, ?, ?)',
      [booking.id, gateId || null, 'checked_in']
    );

    await connection.query(
      'UPDATE bookings SET booking_status = ? WHERE booking_id = ?',
      ['completed', bookingId]
    );

    if (gateId) {
      await connection.query(
        'UPDATE gates SET current_crowd = LEAST(current_crowd + ?, capacity) WHERE id = ?',
        [booking.number_of_visitors, gateId]
      );
    }

    await connection.commit();
    transactionStarted = false;

    return successResponse(res, 200, 'Check-in successful', {
      bookingId,
      checkinTime: new Date()
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to check-in', error);
  } finally {
    if (connection) {
      if (transactionStarted) {
        await connection.rollback().catch(() => {});
      }
      connection.release();
    }
  }
};
