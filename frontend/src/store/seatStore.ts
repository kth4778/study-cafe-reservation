import { create } from 'zustand';
import type { Seat, SeatStatus, SeatTypeFilter } from '@/types/seat';

interface SeatState {
  seats: Seat[];
  selectedSeat: Seat | null;
  typeFilter: SeatTypeFilter;
  isLoading: boolean;

  setSeats: (seats: Seat[]) => void;
  updateSeatStatus: (seatId: string, status: SeatStatus) => void;
  setSelectedSeat: (seat: Seat | null) => void;
  setTypeFilter: (filter: SeatTypeFilter) => void;
  setLoading: (loading: boolean) => void;
}

export const useSeatStore = create<SeatState>((set) => ({
  seats: [],
  selectedSeat: null,
  typeFilter: 'all',
  isLoading: false,

  setSeats: (seats) => set({ seats }),
  updateSeatStatus: (seatId, status) =>
    set((state) => ({
      seats: state.seats.map((s) =>
        s.seatId === seatId ? { ...s, status } : s
      ),
    })),
  setSelectedSeat: (seat) => set({ selectedSeat: seat }),
  setTypeFilter: (typeFilter) => set({ typeFilter }),
  setLoading: (isLoading) => set({ isLoading }),
}));
