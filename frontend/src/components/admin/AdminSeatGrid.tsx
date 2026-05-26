import type { Seat, SeatStatus } from '@/types/seat';

interface AdminSeatGridProps {
  seats: Seat[];
  onReset: (seat: Seat) => void;
}

const STATUS_STYLE: Record<SeatStatus, { bg: string; text: string; border: string; label: string }> = {
  available:   { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0', label: '이용가능' },
  occupied:    { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA', label: '사용 중' },
  reserved:    { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE', label: '예약됨' },
  maintenance: { bg: '#F9FAFB', text: '#6B7280', border: '#E5E7EB', label: '점검 중' },
};

export const AdminSeatGrid = ({ seats, onReset }: AdminSeatGridProps) => {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))' }}>
      {seats.map((seat) => {
        const s = STATUS_STYLE[seat.status];
        const canReset = seat.status !== 'available';
        return (
          <div
            key={seat.seatId}
            className="relative rounded-xl flex flex-col items-center justify-center gap-0.5 py-2.5 px-1 text-center transition-all"
            style={{
              backgroundColor: s.bg,
              border: `1.5px solid ${s.border}`,
            }}
          >
            <span className="text-base font-black leading-none" style={{ color: s.text }}>
              {String(seat.seatNumber).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-medium" style={{ color: s.text }}>
              {s.label}
            </span>
            {canReset && (
              <button
                onClick={() => onReset(seat)}
                className="mt-1 text-[9px] px-2 py-0.5 rounded-full transition-colors font-semibold min-h-0"
                style={{
                  backgroundColor: s.border,
                  color: s.text,
                }}
              >
                초기화
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
