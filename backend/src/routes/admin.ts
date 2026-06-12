import { Router } from 'express';
import { authMiddleware, superadminMiddleware } from '../middleware/authMiddleware';
import { adminLogin, getKpi, getRecords, getStats, getLogs, resetSeat } from '../controllers/adminController';

const router = Router();

router.post('/auth/admin/login', adminLogin);
router.get('/admin/kpi', authMiddleware, getKpi);
router.get('/admin/records', authMiddleware, getRecords);
router.get('/admin/stats', authMiddleware, getStats);
router.get('/admin/logs', authMiddleware, getLogs);
router.post('/admin/seats/:id/reset', authMiddleware, superadminMiddleware, resetSeat);

export default router;
