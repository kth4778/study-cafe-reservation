import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Headphones, Printer, Home } from 'lucide-react';
import { formatTime, formatKrw } from '@/utils/time';
import type { Reservation } from '@/types/reservation';

const AUTO_RETURN_SEC = 10;

export const CheckOutCompletePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const reservation = (location.state as { reservation?: Reservation } | null)?.reservation ?? null;
  const [countdown, setCountdown] = useState(AUTO_RETURN_SEC);

  useEffect(() => {
    if (countdown <= 0) { navigate('/kiosk'); return; }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown, navigate]);

  const durationHours = reservation
    ? Math.round((new Date(reservation.endTime).getTime() - new Date(reservation.startTime).getTime()) / 3_600_000)
    : 0;
  const actualEnd = reservation?.actualEndTime ?? reservation?.endTime ?? '';

  return (
    <div className="flex flex-col bg-[#F5F5F5]" style={{ minHeight: '100%' }}>
      {/* 헤더 */}
      <div className="bg-white px-3 py-2.5 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="w-8" />
        <span className="text-sm font-black text-gray-900">스터디 오아시스</span>
        <span className="text-xs text-gray-400" />
      </div>

      <div className="flex-1 px-3 py-6 flex flex-col gap-4 items-center">
        {/* 성공 아이콘 */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg shadow-orange-200" style={{ backgroundColor: 'var(--kiosk-orange)' }}>
          <span className="text-white text-3xl">✓</span>
        </div>

        <div className="text-center">
          <p className="text-xl font-black text-gray-900">퇴실이 완료되었습니다</p>
          <p className="text-sm text-gray-400 mt-1">이용해주셔서 감사합니다</p>
        </div>

        {/* 이용 요약 */}
        {reservation && (
          <div className="ki-card p-4 w-full">
            <p className="text-xs font-bold text-gray-500 mb-3">이용 요약</p>
            {[
              ['이용 좌석', `${reservation.seatNumber}번`],
              ['좌석 유형', '일반석'],
              ['이용 시간', `${formatTime(reservation.startTime)} ~ ${formatTime(reservation.endTime)} (${durationHours}시간)`],
              ['퇴실 시간', formatTime(actualEnd)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-500">{label}</span>
                <span className="text-xs font-semibold text-gray-700 text-right max-w-[55%]">{value}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 mt-1">
              <span className="text-sm font-bold text-gray-700">총 이용 금액</span>
              <span className="text-base font-black" style={{ color: 'var(--kiosk-orange)' }}>{formatKrw(reservation.totalAmount)}</span>
            </div>
          </div>
        )}

        {/* 자동 이동 안내 */}
        <div className="w-full ki-card p-3 flex items-center justify-between" style={{ backgroundColor: '#FFF8F0' }}>
          <div className="flex items-center gap-2">
            <span className="text-sm">🔔</span>
            <p className="text-xs text-gray-600">
              <span className="font-bold">{countdown}초</span> 후 메인 화면으로 자동 이동합니다.<br />
              <span className="text-gray-400">창을 닫지 마시면 즉시 이동됩니다.</span>
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-black text-white text-sm"
            style={{ backgroundColor: 'var(--kiosk-orange)' }}
          >
            {String(countdown).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="px-3 pb-4 flex flex-col gap-2 flex-shrink-0">
        <button onClick={() => navigate('/kiosk')} className="ki-btn-orange w-full text-sm flex items-center justify-center gap-2">
          <Home size={16} /> 메인 화면으로 돌아가기
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/kiosk/receipt', { state: { reservation } })}
            className="ki-btn-gray flex-1 text-xs flex items-center justify-center gap-1"
          >
            <Printer size={13} /> 영수증 다시 출력
          </button>
          <button
            onClick={() => navigate('/kiosk/support')}
            className="ki-btn-gray flex-1 text-xs flex items-center justify-center gap-1"
          >
            <Headphones size={13} /> 고객센터 호출
          </button>
        </div>
      </div>
    </div>
  );
};
