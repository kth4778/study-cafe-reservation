import { useEffect, useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import { SeatGrid } from '@/components/kiosk/SeatGrid';
import { useSeatStore } from '@/store/seatStore';
import { useReservationStore } from '@/store/reservationStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useHeartbeat } from '@/hooks/useHeartbeat';
import { useIdleTimeout } from '@/hooks/useIdleTimeout';
import { fetchSeats } from '@/api/seats';
import { createReservation } from '@/api/reservations';
import { formatKrw } from '@/utils/time';
import type { Seat } from '@/types/seat';

const TIME_OPTIONS = [1, 2, 4, 6] as const;
type Hours = typeof TIME_OPTIONS[number];

export const SeatSelectPage = () => {
  const navigate = useNavigate();
  const { seats, isLoading, setSeats, setLoading } = useSeatStore();
  const { setCurrentReservation } = useReservationStore();

  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [selectedHours, setSelectedHours] = useState<Hours>(1);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Derive selectedSeat from store so WebSocket updates are reflected immediately
  const selectedSeat = useMemo(
    () => seats.find((s) => s.seatId === selectedSeatId) ?? null,
    [seats, selectedSeatId],
  );

  // Clear selection when the selected seat becomes unavailable via WebSocket
  useEffect(() => {
    if (selectedSeatId && selectedSeat && selectedSeat.status !== 'available') {
      setSelectedSeatId(null);
      setCreateError('선택하신 좌석이 다른 사용자에게 예약되었습니다. 다시 선택해 주세요.');
      setTimeout(() => setCreateError(null), 4000);
    }
  }, [selectedSeat?.status, selectedSeatId]); // eslint-disable-line react-hooks/exhaustive-deps

  useWebSocket();
  useHeartbeat();
  useIdleTimeout(() => navigate('/kiosk'), true);

  const loadSeats = useCallback(async () => {
    setLoading(true);
    try { setSeats(await fetchSeats()); } catch { /* offline */ } finally { setLoading(false); }
  }, [setSeats, setLoading]);

  useEffect(() => { loadSeats(); }, [loadSeats]);

  const available = seats.filter((s) => s.status === 'available').length;

  const handleProceed = async () => {
    if (!selectedSeat) return;
    setIsCreating(true);
    try {
      const reservation = await createReservation({ seatId: selectedSeat.seatId, durationHours: selectedHours });
      setCurrentReservation(reservation);
      navigate('/kiosk/payment');
    } catch {
      setCreateError('예약 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      setTimeout(() => setCreateError(null), 4000);
    } finally {
      setIsCreating(false);
    }
  };

  const totalAmount = selectedSeat ? selectedSeat.pricePerHour * selectedHours : 0;
  const seatTypeLabel: Record<string, string> = { general: '일반석', premium: '프리미엄석', private: '1인실' };

  return (
    <div className="flex flex-col bg-[#F5F5F5]" style={{ minHeight: '100%' }}>
      {/* 헤더 */}
      <div className="bg-white px-3 py-2.5 flex items-center justify-between shadow-sm flex-shrink-0">
        <button
          onClick={() => navigate('/kiosk')}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center min-h-0"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <span className="text-sm font-black text-gray-900">좌석 선택</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">잔여 {available}석</span>
          <button
            onClick={loadSeats}
            disabled={isLoading}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center min-h-0"
          >
            <RefreshCw size={14} className={`text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 좌석 그리드 영역 */}
      <div className="flex-1 px-3 pt-3 pb-2 overflow-y-auto scrollbar-none">
        <SeatGrid selectedSeat={selectedSeat} onSeatClick={(seat: Seat) => setSelectedSeatId(seat.seatId)} />
      </div>

      {/* 에러 메시지 */}
      {createError && (
        <div className="mx-3 mb-1 rounded-xl bg-red-50 border border-red-200 px-3 py-2 flex items-center gap-2 flex-shrink-0">
          <span className="text-red-500 text-sm">⚠</span>
          <p className="text-xs text-red-600 font-semibold">{createError}</p>
        </div>
      )}

      {/* 하단 — 선택 정보 + 시간 + 예약 버튼 */}
      <div className="bg-white border-t border-gray-100 px-3 pt-3 pb-3 flex-shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        {selectedSeat ? (
          <>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-white font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--kiosk-orange)' }}>
                  선택
                </span>
                <span className="text-sm font-bold text-gray-800">
                  {selectedSeat.seatNumber}번 {seatTypeLabel[selectedSeat.type]}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400">예상 결제 금액</span>
                <p className="text-base font-black leading-tight" style={{ color: 'var(--kiosk-orange)' }}>
                  {formatKrw(totalAmount)}
                </p>
              </div>
            </div>

            {/* 시간 선택 */}
            <div className="grid grid-cols-4 gap-1.5 mb-2.5">
              {TIME_OPTIONS.map((h) => (
                <button
                  key={h}
                  onClick={() => setSelectedHours(h)}
                  className={`py-2 rounded-xl text-sm font-bold transition-all min-h-0 ${
                    selectedHours === h
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                  style={selectedHours === h ? { backgroundColor: 'var(--kiosk-orange)' } : {}}
                >
                  {h}시간
                </button>
              ))}
            </div>

            <button
              onClick={handleProceed}
              disabled={isCreating}
              className="ki-btn-orange w-full text-sm disabled:opacity-60"
            >
              {isCreating ? '처리 중...' : `예약 진행하기 →`}
            </button>
          </>
        ) : (
          <div className="text-center py-2">
            <p className="text-xs text-gray-400">좌석을 선택하면 시간 및 결제 옵션이 표시됩니다</p>
          </div>
        )}
      </div>
    </div>
  );
};
