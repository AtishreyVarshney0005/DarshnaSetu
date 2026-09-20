import express from 'express';
import * as crowdController from '../controllers/crowdController.js';
import { verifyAuth, verifyStaff } from '../middleware/auth.js';

const router = express.Router();

router.get('/live/:templeId', verifyAuth, crowdController.getLive);
router.get('/history/:templeId', verifyAuth, crowdController.getHistory);
router.post('/', verifyAuth, verifyStaff, crowdController.recordCrowd);

export default router;
