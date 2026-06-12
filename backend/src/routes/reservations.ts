import { Router } from 'express';
import { createReservation, extendReservation, checkoutReservation, findActiveReservationBySeat } from '../controllers/reservationController';

const router = Router();
router.get('/active', findActiveReservationBySeat);
router.post('/', createReservation);
router.patch('/:id/extend', extendReservation);
router.patch('/:id/checkout', checkoutReservation);

export default router;
