export type SeatStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';
export type SeatType = 'general' | 'premium' | 'private';
export type SeatTypeFilter = 'all' | SeatType;

export interface Seat {
  seatId: string;
  seatNumber: number;
  type: SeatType;
  status: SeatStatus;
  floor: number;
  pricePerHour: number;
}
