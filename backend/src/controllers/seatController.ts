import { Request, Response } from 'express';
import { seats } from '../data/mockData';

export const getSeats = (_req: Request, res: Response): void => {
  res.json(seats);
};
