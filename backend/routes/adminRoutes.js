import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { verifyAuth, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyAuth, verifyAdmin);

router.get('/crowd/:templeId', adminController.getCrowdStatus);
router.get('/analytics/crowd', adminController.getCrowdAnalytics);
router.get('/analytics/booking', adminController.getBookingAnalytics);

router.post('/emergency/create', adminController.createEmergencyAlert);
router.get('/emergency/:templeId', adminController.getActiveEmergencies);
router.put('/emergency/:incidentId', adminController.updateEmergencyStatus);

router.get('/staff/stats', adminController.getStaffStats);
router.get('/staff', adminController.getStaff);
router.get('/staff/:staffId', adminController.getStaffById);
router.put('/staff/:staffId', adminController.updateStaff);
router.patch('/staff/:staffId/status', adminController.updateStaffStatus);
router.patch('/staff/:staffId/zone', adminController.updateStaffZone);
router.patch('/staff/:staffId/deploy', adminController.deployStaff);
router.delete('/staff/:staffId', adminController.removeStaff);

router.get('/parking/:templeId', adminController.getParkingStatus);
router.put('/parking/:parkingId', adminController.updateParkingStatus);

router.get('/queue/:gateId', adminController.getQueueStatus);

export default router;
