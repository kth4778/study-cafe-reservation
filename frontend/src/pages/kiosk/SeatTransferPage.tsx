import { useEffect, useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ArrowLeftRight } from 'lucide-react';
import { SeatGrid } from '@/components/kiosk/SeatGrid';
import { useSeatStore } from '@/store/seatStore';
import { useReservationStore } from '@/store/reservationStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { fetchSeats } from '@/api/seats';
import { transferReservation } from '@/api/reservations';
import { isAxiosError } from '@/api/client';
import { Clock } from '@/components/common/Clock';
import type { Seat } from '@/types/seat';

export const SeatTransferPage = () => {
  const navigate = useNavigate();
  const { seats, setSeats, setLoading } = useSeatStore();
  const { currentReservation, setCurrentReservation } = useReservationStore();

  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedSeat = useMemo(
    () => seats.find((s) => s.seatId === selectedSeatId) ?? null,
    [seats, selectedSeatId],
  );

  // 선택 중 WebSocket으로 좌석이 점유되면 선택 해제
  useEffect(() => {
    if (selectedSeatId && selectedSeat && selectedSeat.status !== 'available') {
      setSelectedSeatId(null);
      setError('선택하신 좌석이 방금 다른 사람에게 배정되었습니다. 다시 선택해 주세요.');
      setTimeout(() => setError(null), 4000);
    }
  }, [selectedSeat?.status, selectedSeatId]); // eslint-disable-line react-hooks/exhaustive-deps

  useWebSocket();

  const loadSeats = useCallback(async () => {
    setLoading(true);
    try { setSeats(await fetchSeats()); } catch { /* offline */ } finally { setLoading(false); }
  }, [setSeats, setLoading]);

  useEffect(() => { loadSeats(); }, [loadSeats]);

  useEffect(() => {
    if (!currentReservation) navigate('/kiosk', { replace: true });
  }, [currentReservation, navigate]);

  if (!currentReservation) return null;

  const available = seats.filter((s) => s.status === 'available').length;
  const seatTypeLabel: Record<string, string> = { general: '일반석', premium: '프리미엄석', private: '1인실' };

  const handleTransfer = async () => {
    if (!selectedSeat) return;
    setIsTransferring(true);
    setError(null);
    try {
      const updated = await transferReservation(currentReservation.reservationId, selectedSeat.seatId);
      setCurrentReservation(updated);
      navigate('/kiosk/usage', { replace: true });
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setError('이미 사용 중인 좌석입니다. 다른 좌석을 선택해 주세요.');
        setSelectedSeatId(null);
      } else {
        setError('자리 이동에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="flex flex-col bg-[#F5F5F5]" style={{ minHeight: '100%' }}>
      {/* 헤더 */}
      <div className="bg-white px-3 py-2.5 flex items-center justify-between shadow-sm flex-shrink-0">
        <button
          onClick={() => navigate('/kiosk/usage')}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center min-h-0"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <span className="text-sm font-black text-gray-900">자리 이동</span>
        <span className="text-xs text-gray-400"><Clock /></span>
      </div>

      {/* 현재 좌석 안내 */}
      <div className="px-3 pt-3 flex-shrink-0">
        <div className="ki-card px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 mb-0.5">현재 이용 중인 좌석</p>
            <p className="text-lg font-black text-gray-900">{currentReservation.seatNumber}번</p>
          </div>
          <ArrowLeftRight size={20} className="text-gray-300 mx-3" />
          <div className="text-right">
            <p className="text-[10px] text-gray-400 mb-0.5">이동할 좌석</p>
            {selectedSeat ? (
              <p className="text-lg font-black" style={{ color: 'var(--kiosk-orange)' }}>
                {selectedSeat.seatNumber}번 {seatTypeLabel[selectedSeat.type]}
              </p>
            ) : (
              <p className="text-sm text-gray-300 font-semibold">선택하세요</p>
            )}
          </div>
        </div>
      </div>

      {/* 좌석 그리드 */}
      <div className="flex-1 px-3 pt-2 pb-2 overflow-y-auto scrollbar-none">
        <p className="text-[10px] text-gray-400 mb-1.5 text-center">빈 좌석(흰색)을 선택하세요 · 잔여 {available}석</p>
        <SeatGrid
          selectedSeat={selectedSeat}
          onSeatClick={(seat: Seat) => {
            if (seat.seatNumber === currentReservation.seatNumber) return;
            setSelectedSeatId(seat.seatId);
          }}
        />
      </div>

      {/* 에러 */}
      {error && (
        <div className="mx-3 mb-1 rounded-xl bg-red-50 border border-red-200 px-3 py-2 flex items-center gap-2 flex-shrink-0">
          <span className="text-red-500 text-sm">⚠</span>
          <p className="text-xs text-red-600 font-semibold">{error}</p>
        </div>
      )}

      {/* 하단 확인 버튼 */}
      <div className="bg-white border-t border-gray-100 px-3 pt-3 pb-3 flex-shrink-0">
        {selectedSeat ? (
          <button
            onClick={handleTransfer}
            disabled={isTransferring}
            className="ki-btn-orange w-full text-sm disabled:opacity-60"
          >
            {isTransferring ? '이동 처리 중...' : `${selectedSeat.seatNumber}번 좌석으로 이동하기`}
          </button>
        ) : (
          <div className="text-center py-1">
            <p className="text-xs text-gray-400">이동할 좌석을 선택해 주세요</p>
          </div>
        )}
      </div>
    </div>
  );
};
