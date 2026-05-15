import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { TimePicker } from '@/components/kiosk/TimePicker';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import { useSeatStore } from '@/store/seatStore';

import { useReservationStore } from '@/store/reservationStore';
import { createReservation } from '@/api/reservations';
import { formatKrw } from '@/utils/time';
import { useIdleTimeout } from '@/hooks/useIdleTimeout';

export const TimeSelectPage = () => {
  const navigate = useNavigate();
  const { selectedSeat, setSelectedSeat } = useSeatStore();
  const { selectedHours, setSelectedHours, setCurrentReservation } = useReservationStore();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useIdleTimeout(() => navigate('/'), true);

  if (!selectedSeat) {
    navigate('/kiosk');
    return null;
  }

  const totalAmount = selectedSeat.pricePerHour * selectedHours;

  const handleProceed = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const reservation = await createReservation({
        seatId: selectedSeat.seatId,
        durationHours: selectedHours,
      });
      setCurrentReservation(reservation);
      navigate('/kiosk/payment');
    } catch {
      setError('예약 생성에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <OfflineBanner />

      <header className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
        <button
          onClick={() => navigate('/kiosk')}
          className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white leading-none">이용 시간 선택</h1>
          <p className="text-xs text-gray-500 mt-0.5">{selectedSeat.seatNumber}번 좌석</p>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-6 gap-6">
        {/* Seat info card */}
        <div className="kiosk-card p-4 flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm">선택된 좌석</p>
            <p className="text-2xl font-black text-white mt-0.5">{selectedSeat.seatNumber}번</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">시간당 요금</p>
            <p className="text-xl font-bold text-blue-400 mt-0.5">{formatKrw(selectedSeat.pricePerHour)}</p>
          </div>
        </div>

        {/* Time picker */}
        <div className="flex-1">
          <p className="text-gray-400 text-sm mb-3">이용 시간을 선택하세요</p>
          <TimePicker
            pricePerHour={selectedSeat.pricePerHour}
            selectedHours={selectedHours}
            onSelect={setSelectedHours}
          />
        </div>

        {/* Total amount */}
        <div className="kiosk-card p-4 flex justify-between items-center">
          <span className="text-gray-300 font-semibold">총 결제 금액</span>
          <span className="text-2xl font-black text-white">{formatKrw(totalAmount)}</span>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-900/40 border border-red-700 rounded-xl p-3 text-red-300 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => { setSelectedSeat(null); navigate('/kiosk'); }}
            className="kiosk-btn-secondary flex-1 text-base"
          >
            뒤로
          </button>
          <button
            onClick={handleProceed}
            disabled={isCreating}
            className="kiosk-btn-primary flex-[2] text-base disabled:opacity-50"
          >
            {isCreating ? '처리 중...' : `결제하기 · ${formatKrw(totalAmount)}`}
          </button>
        </div>
      </main>
    </div>
  );
};
