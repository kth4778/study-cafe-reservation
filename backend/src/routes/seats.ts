import { Router } from 'express';
import { getSeats } from '../controllers/seatController';

const router = Router();
router.get('/', getSeats);

export default router;
