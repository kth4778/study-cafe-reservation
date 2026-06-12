import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import seatsRouter from './routes/seats';
import reservationsRouter from './routes/reservations';
import paymentsRouter from './routes/payments';
import adminRouter from './routes/admin';
import { seats } from './data/mockData';
import { setIo } from './socket';

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});
setIo(io);

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/seats', seatsRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api', adminRouter);

// WebSocket — broadcast seat updates
io.on('connection', (socket) => {
  console.log(`[WS] client connected: ${socket.id}`);

  // Send current state on connect
  socket.emit('seats:init', seats);

  socket.on('disconnect', () => {
    console.log(`[WS] client disconnected: ${socket.id}`);
  });
});


const PORT = process.env['PORT'] ?? 4000;
httpServer.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
