import { X, MapPin, Clock, CreditCard } from 'lucide-react';
import type { Seat } from '@/types/seat';
import { formatKrw } from '@/utils/time';

const SEAT_TYPE_NAMES: Record<string, string> = {
  general: '일반석',
  premium: '프리미엄석',
  private: '1인실',
};

interface SeatPopupProps {
  seat: Seat;
  onConfirm: () => void;
  onClose: () => void;
}

export const SeatPopup = ({ seat, onConfirm, onClose }: SeatPopupProps) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
      <div className="kiosk-card w-full max-w-sm p-6 flex flex-col gap-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">좌석 선택</p>
            <h2 className="text-3xl font-black text-white">{seat.seatNumber}번</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-3 bg-gray-800/60 rounded-xl p-4">
          <div className="flex items-center gap-3 text-gray-300">
            <MapPin size={16} className="text-blue-400 flex-shrink-0" />
            <span className="text-sm">유형: <span className="text-white font-semibold">{SEAT_TYPE_NAMES[seat.type]}</span></span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <CreditCard size={16} className="text-green-400 flex-shrink-0" />
            <span className="text-sm">요금: <span className="text-white font-semibold">{formatKrw(seat.pricePerHour)} / 시간</span></span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <Clock size={16} className="text-yellow-400 flex-shrink-0" />
            <span className="text-sm">이용가능 상태</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose} className="kiosk-btn-secondary flex-1 text-base">
            취소
          </button>
          <button onClick={onConfirm} className="kiosk-btn-primary flex-[2] text-base">
            예약 진행
          </button>
        </div>
      </div>
    </div>
  );
};
