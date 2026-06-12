import { create } from 'zustand';
import type { Reservation } from '@/types/reservation';
import type { PaymentMethod, PaymentResult } from '@/types/payment';

/** 시간 연장 결제 시 임시 보관하는 컨텍스트 */
export interface ExtensionContext {
  hours: number;
  extraCost: number;
  newEndTime: string;
}

interface ReservationState {
  currentReservation: Reservation | null;
  selectedHours: number;
  selectedPaymentMethod: PaymentMethod | null;
  paymentResult: PaymentResult | null;
  /** 시간 연장 결제 모드일 때 설정됨 */
  extensionContext: ExtensionContext | null;

  setCurrentReservation: (r: Reservation | null) => void;
  setSelectedHours: (hours: number) => void;
  setSelectedPaymentMethod: (method: PaymentMethod | null) => void;
  setPaymentResult: (result: PaymentResult | null) => void;
  setExtensionContext: (ctx: ExtensionContext | null) => void;
  reset: () => void;
}

export const useReservationStore = create<ReservationState>((set) => ({
  currentReservation: null,
  selectedHours: 1,
  selectedPaymentMethod: null,
  paymentResult: null,
  extensionContext: null,

  setCurrentReservation: (r) => set({ currentReservation: r }),
  setSelectedHours: (h) => set({ selectedHours: h }),
  setSelectedPaymentMethod: (m) => set({ selectedPaymentMethod: m }),
  setPaymentResult: (r) => set({ paymentResult: r }),
  setExtensionContext: (ctx) => set({ extensionContext: ctx }),
  reset: () =>
    set({
      currentReservation: null,
      selectedHours: 1,
      selectedPaymentMethod: null,
      paymentResult: null,
      extensionContext: null,
    }),
}));
