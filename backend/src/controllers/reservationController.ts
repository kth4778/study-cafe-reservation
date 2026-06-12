import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { seats, reservations } from '../data/mockData';
import { broadcastSeatUpdate } from '../socket';
import type { Reservation } from '../types';

export const createReservation = (req: Request, res: Response): void => {
  const { seatId, durationHours } = req.body as { seatId: string; durationHours: number };

  if (!durationHours || durationHours < 1 || durationHours > 12) {
    res.status(400).json({ message: '이용 시간은 1~12시간 사이여야 합니다.' });
    return;
  }

  const seat = seats.find((s) => s.seatId === seatId);
  if (!seat) { res.status(404).json({ message: '좌석을 찾을 수 없습니다.' }); return; }
  if (seat.status !== 'available') { res.status(409).json({ message: '이미 선택된 좌석입니다.', code: 'SEAT_UNAVAILABLE' }); return; }

  seat.status = 'reserved';
  broadcastSeatUpdate(seatId, 'reserved');

  const now = new Date();
  const end = new Date(now.getTime() + durationHours * 3600_000);
  const reservation: Reservation = {
    reservationId: uuidv4(),
    seatId,
    seatNumber: seat.seatNumber,
    startTime: now.toISOString(),
    endTime: end.toISOString(),
    status: 'pending',
    totalAmount: seat.pricePerHour * durationHours,
  };

  reservations.push(reservation);

  // auto-cancel after 180s if payment not completed
  setTimeout(() => {
    const r = reservations.find((r) => r.reservationId === reservation.reservationId);
    if (r && r.status === 'pending') {
      r.status = 'cancelled';
      const s = seats.find((s) => s.seatId === seatId);
      if (s) {
        s.status = 'available';
        broadcastSeatUpdate(seatId, 'available');
      }
    }
  }, 180_000);

  res.status(201).json(reservation);
};

export const extendReservation = (req: Request, res: Response): void => {
  const { id } = req.params;
  const { extraHours } = req.body as { extraHours: number };

  if (!extraHours || extraHours < 1 || extraHours > 12) {
    res.status(400).json({ message: '연장 시간은 1~12시간 사이여야 합니다.' });
    return;
  }

  const r = reservations.find((r) => r.reservationId === id);
  if (!r) { res.status(404).json({ message: '예약을 찾을 수 없습니다.' }); return; }

  const seat = seats.find((s) => s.seatId === r.seatId);
  if (!seat) { res.status(404).json({ message: '해당 예약의 좌석 정보를 찾을 수 없습니다.' }); return; }

  const extra = seat.pricePerHour * extraHours;
  const newEnd = new Date(new Date(r.endTime).getTime() + extraHours * 3600_000);
  r.endTime = newEnd.toISOString();
  r.totalAmount += extra;

  res.json(r);
};

export const checkoutReservation = (req: Request, res: Response): void => {
  const { id } = req.params;
  const r = reservations.find((r) => r.reservationId === id);
  if (!r) { res.status(404).json({ message: '예약을 찾을 수 없습니다.' }); return; }

  r.actualEndTime = new Date().toISOString();
  r.status = 'completed';

  const seat = seats.find((s) => s.seatId === r.seatId);
  if (seat) {
    seat.status = 'available';
    broadcastSeatUpdate(r.seatId, 'available');
  }

  res.json(r);
};

export const findActiveReservationBySeat = (req: Request, res: Response): void => {
  const seatNumber = parseInt(req.query['seatNumber'] as string, 10);
  if (!seatNumber || seatNumber < 1 || seatNumber > 100) {
    res.status(400).json({ message: '올바른 좌석 번호를 입력해 주세요.' });
    return;
  }

  const reservation = reservations.find(
    (r) => r.seatNumber === seatNumber && (r.status === 'completed' || r.status === 'pending'),
  );
  if (!reservation) {
    res.status(404).json({ message: '해당 좌석의 이용 중인 예약이 없습니다.' });
    return;
  }

  res.json(reservation);
};
