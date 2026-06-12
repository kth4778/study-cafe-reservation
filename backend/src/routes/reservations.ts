import { Router } from 'express';
import { createReservation, extendReservation, checkoutReservation, findActiveReservationBySeat, transferReservation } from '../controllers/reservationController';

const router = Router();
router.get('/active', findActiveReservationBySeat);
router.post('/', createReservation);
router.patch('/:id/extend', extendReservation);
router.patch('/:id/checkout', checkoutReservation);
router.patch('/:id/transfer', transferReservation);

export default router;
