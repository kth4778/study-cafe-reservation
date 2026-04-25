import { apiClient } from './client';
import type { ApiPaymentMethod, PaymentResult } from '@/types/payment';

interface ProcessPaymentBody {
  reservationId: string;
  method: ApiPaymentMethod;
  amount: number;
}

export const processPayment = async (
  body: ProcessPaymentBody,
): Promise<PaymentResult> => {
  const { data } = await apiClient.post<PaymentResult>('/payments', body);
  return data;
};
