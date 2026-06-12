import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { seats, reservations } from '../data/mockData';
import { broadcastSeatUpdate } from '../socket';
import type { PaymentMethod } from '../types';

export const processPayment = (req: Request, res: Response): void => {
  const { reservationId, method, amount } = req.body as {
    reservationId: string;
    method: PaymentMethod;
    amount: number;
  };

  const reservation = reservations.find((r) => r.reservationId === reservationId);
  if (!reservation) {
    res.status(404).json({ message: '예약을 찾을 수 없습니다.' });
    return;
  }

  if (typeof amount !== 'number' || amount !== reservation.totalAmount) {
    res.status(400).json({ message: '결제 금액이 예약 금액과 일치하지 않습니다.' });
    return;
  }

  // Mock: succeed in most cases
  const shouldFail = Math.random() < 0.05;
  if (shouldFail) {
    // Rollback: cancel reservation and free seat immediately
    reservation.status = 'cancelled';
    const failedSeat = seats.find((s) => s.seatId === reservation.seatId);
    if (failedSeat) {
      failedSeat.status = 'available';
      broadcastSeatUpdate(reservation.seatId, 'available');
    }
    res.status(402).json({ message: '결제 처리 실패', code: 'E004' });
    return;
  }

  reservation.status = 'completed';
  const seat = seats.find((s) => s.seatId === reservation.seatId);
  if (seat) {
    seat.status = 'occupied';
    broadcastSeatUpdate(reservation.seatId, 'occupied');
  }

  res.status(201).json({
    paymentId: uuidv4(),
    reservationId,
    approvalNumber: `AP${Date.now()}`,
    amount,
    method,
    status: 'success',
  });
};
