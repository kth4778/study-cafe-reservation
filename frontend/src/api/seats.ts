import { apiClient } from './client';
import type { Seat } from '@/types/seat';

export const fetchSeats = async (): Promise<Seat[]> => {
  const { data } = await apiClient.get<Seat[]>('/seats');
  return data;
};
