import type { Server } from 'socket.io';

let io: Server | null = null;

export const setIo = (instance: Server): void => {
  io = instance;
};

export const broadcastSeatUpdate = (seatId: string, status: string): void => {
  io?.emit('seat:update', { seatId, status });
};
