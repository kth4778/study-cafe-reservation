import { apiClient } from './client';
import type { Reservation } from '@/types/reservation';

interface CreateReservationBody {
  seatId: string;
  durationHours: number;
}

export const createReservation = async (
  body: CreateReservationBody
): Promise<Reservation> => {
  const { data } = await apiClient.post<Reservation>('/reservations', body);
  return data;
};

export const extendReservation = async (
  reservationId: string,
  extraHours: number
): Promise<Reservation> => {
  const { data } = await apiClient.patch<Reservation>(
    `/reservations/${reservationId}/extend`,
    { extraHours }
  );
  return data;
};

export const checkoutReservation = async (
  reservationId: string,
): Promise<Reservation> => {
  const { data } = await apiClient.patch<Reservation>(
    `/reservations/${reservationId}/checkout`,
  );
  return data;
};

/** 이용 중인 좌석을 다른 빈 좌석으로 이동 */
export const transferReservation = async (
  reservationId: string,
  newSeatId: string,
): Promise<Reservation> => {
  const { data } = await apiClient.patch<Reservation>(
    `/reservations/${reservationId}/transfer`,
    { newSeatId },
  );
  return data;
};

/** 좌석 번호로 현재 진행 중인 예약 조회 */
export const findReservationBySeat = async (
  seatNumber: number,
): Promise<Reservation> => {
  const { data } = await apiClient.get<Reservation>(
    `/reservations/active?seatNumber=${seatNumber}`,
  );
  return data;
};
