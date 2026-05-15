import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Home } from 'lucide-react';
import { SeatGrid } from '@/components/kiosk/SeatGrid';
import { SeatPopup } from '@/components/kiosk/SeatPopup';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import { Clock } from '@/components/common/Clock';
import { useSeatStore } from '@/store/seatStore';
import { useReservationStore } from '@/store/reservationStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useHeartbeat } from '@/hooks/useHeartbeat';
import { useIdleTimeout } from '@/hooks/useIdleTimeout';
import { fetchSeats } from '@/api/seats';
import type { Seat } from '@/types/seat';

export const SeatStatusPage = () => {
  const navigate = useNavigate();
  const { seats, selectedSeat, isLoading, setSeats, setSelectedSeat, setLoading } = useSeatStore();
  const setCurrentSeat = useReservationStore((s) => s.setCurrentReservation);

  useWebSocket();
  useHeartbeat();

  const loadSeats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSeats();
      setSeats(data);
    } catch {
      // 오프라인 또는 오류 시 기존 데이터 유지
    } finally {
      setLoading(false);
    }
  }, [setSeats, setLoading]);

  useEffect(() => {
    loadSeats();
  }, [loadSeats]);

  useIdleTimeout(() => navigate('/'), true);

  const handleSeatClick = (seat: Seat) => {
    setSelectedSeat(seat);
  };

  const handleConfirm = () => {
    if (!selectedSeat) return;
    // selectedSeat must remain set for TimeSelectPage — clear popup by navigating
    navigate('/kiosk/time-select');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <OfflineBanner />

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400"
          >
            <Home size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white leading-none">좌석 현황</h1>
            <p className="text-xs text-gray-500 mt-0.5">이용 가능한 좌석을 선택하세요</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock />
          <button
            onClick={loadSeats}
            disabled={isLoading}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 disabled:opacity-40"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Stats bar */}
      <div className="flex gap-3 px-4 py-2 bg-gray-900/50 border-b border-gray-800 flex-shrink-0">
        {(['available', 'occupied', 'reserved', 'maintenance'] as const).map((status) => {
          const count = seats.filter((s) => s.status === status).length;
          const colors: Record<string, string> = {
            available: 'text-green-400', occupied: 'text-red-400',
            reserved: 'text-yellow-400', maintenance: 'text-gray-400',
          };
          const labels: Record<string, string> = {
            available: '이용가능', occupied: '사용중',
            reserved: '예약됨', maintenance: '점검중',
          };
          return (
            <div key={status} className="flex items-center gap-1 whitespace-nowrap">
              <span className={`text-base font-black ${colors[status]}`}>{count}</span>
              <span className="text-gray-500 text-xs whitespace-nowrap">{labels[status]}</span>
            </div>
          );
        })}
      </div>

      {/* Main */}
      <main className="flex-1 flex flex-col p-3 min-h-0">
        <SeatGrid selectedSeat={selectedSeat} onSeatClick={handleSeatClick} />
      </main>

      {/* Popup */}
      {selectedSeat && (
        <SeatPopup
          seat={selectedSeat}
          onConfirm={handleConfirm}
          onClose={() => setSelectedSeat(null)}
        />
      )}
    </div>
  );
};
