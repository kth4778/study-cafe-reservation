import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { WS_URL } from '@/constants/config';
import { useSeatStore } from '@/store/seatStore';
import type { SeatStatus } from '@/types/seat';

interface SeatUpdateEvent {
  seatId: string;
  status: SeatStatus;
}

// Module-level singleton: shared across all hook instances so only one connection is maintained
let sharedSocket: Socket | null = null;
let refCount = 0;

export const useWebSocket = () => {
  const updateSeatStatus = useSeatStore((s) => s.updateSeatStatus);
  const setSeats = useSeatStore((s) => s.setSeats);
  const listenerRef = useRef<((event: SeatUpdateEvent) => void) | null>(null);

  useEffect(() => {
    // Create shared connection on first mount
    if (!sharedSocket) {
      sharedSocket = io(WS_URL, { transports: ['polling', 'websocket'], reconnection: true });

      sharedSocket.on('seats:init', (seats) => {
        setSeats(seats);
      });
    }
    refCount++;

    // Register per-instance listener (avoids duplicate calls when re-registered)
    const listener = (event: SeatUpdateEvent) => {
      updateSeatStatus(event.seatId, event.status);
    };
    listenerRef.current = listener;
    sharedSocket.on('seat:update', listener);

    return () => {
      if (listenerRef.current) {
        sharedSocket?.off('seat:update', listenerRef.current);
        listenerRef.current = null;
      }
      refCount--;
      if (refCount === 0) {
        sharedSocket?.disconnect();
        sharedSocket = null;
      }
    };
  }, [updateSeatStatus, setSeats]);

  return sharedSocket;
};
