import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/temples', bookingController.getAllTemples);
router.get('/temples/:templeId', bookingController.getTempleDetails);
router.get('/time-slots', bookingController.getTimeSlots);
router.get('/available-dates', bookingController.getAvailableDates);

router.post('/create', verifyAuth, bookingController.createBooking);
router.get('/my-bookings', verifyAuth, bookingController.getUserBookings);
router.get('/:bookingId/qr', verifyAuth, bookingController.getBookingQr);
router.post('/verify-qr', verifyAuth, bookingController.verifyQr);
router.get('/:bookingId', verifyAuth, bookingController.getBookingDetails);
router.post('/:bookingId/cancel', verifyAuth, bookingController.cancelBooking);
router.post('/checkin', verifyAuth, bookingController.checkinBooking);

export default router;