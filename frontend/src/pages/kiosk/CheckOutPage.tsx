import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut, Headphones } from 'lucide-react';
import { useReservationStore } from '@/store/reservationStore';
import { checkoutReservation } from '@/api/reservations';
import { formatTime, formatKrw, getRemainingMinutes } from '@/utils/time';
import { Clock } from '@/components/common/Clock';

const SEAT_TYPE_LABEL: Record<string, string> = {
  general: '일반석', premium: '프리미엄석', private: '1인실',
};

export const CheckOutPage = () => {
  const navigate = useNavigate();
  const { currentReservation, reset } = useReservationStore();
  const [isProcessing, setIsProcessing] = useState(false);

  // 예약 없으면 좌석 조회 → 퇴실 페이지로 돌아오도록
  useEffect(() => {
    if (!currentReservation) {
      navigate('/kiosk/lookup', { state: { next: '/kiosk/checkout' }, replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!currentReservation) return null;

  const remainingMin = Math.max(0, getRemainingMinutes(currentReservation.endTime));
  const remainH = Math.floor(remainingMin / 60);
  const remainM = remainingMin % 60;
  const seatType = (currentReservation as { seatType?: string }).seatType ?? 'general';

  const handleCheckOut = async () => {
    setIsProcessing(true);
    try {
      await checkoutReservation(currentReservation.reservationId);
    } catch { /* proceed anyway */ }
    const snapshot = { ...currentReservation };
    reset();
    navigate('/kiosk/checkout-complete', { state: { reservation: snapshot } });
  };

  return (
    <div className="flex flex-col bg-[#F5F5F5]" style={{ minHeight: '100%' }}>
      {/* 헤더 */}
      <div className="bg-white px-3 py-2.5 flex items-center justify-between shadow-sm flex-shrink-0">
        <button onClick={() => navigate('/kiosk/usage')} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center min-h-0">
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <span className="text-sm font-black text-gray-900">퇴실하기</span>
        <span className="text-xs text-gray-400"><Clock /></span>
      </div>

      <div className="flex-1 px-3 py-3 flex flex-col gap-3">
        {/* 좌석 정보 카드 */}
        <div className="ki-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] text-white font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--kiosk-orange)' }}>
                  이용 중인 좌석
                </span>
              </div>
              <p className="text-4xl font-black text-gray-900">{currentReservation.seatNumber}번</p>
              <p className="text-sm text-gray-500 mt-0.5">{SEAT_TYPE_LABEL[seatType]}</p>
            </div>
            <div className="text-right">
              <div className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">시작 시간</span>
                  <span className="font-semibold text-gray-700">{formatTime(currentReservation.startTime)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">종료 예정</span>
                  <span className="font-semibold text-gray-700">{formatTime(currentReservation.endTime)}</span>
                </div>
              </div>
              <div className="mt-2 px-2 py-1 rounded-lg text-right" style={{ backgroundColor: '#FFF0E6' }}>
                <p className="text-[10px] text-gray-400">남은 시간</p>
                <p className="text-sm font-black" style={{ color: 'var(--kiosk-orange)' }}>
                  {remainH > 0 ? `${remainH}시간 ` : ''}{remainM}분
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 퇴실 가이드 */}
        <div className="ki-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px]" style={{ color: 'var(--kiosk-orange)' }}>ℹ</span>
            </div>
            <p className="text-sm font-bold text-gray-800">퇴실 가이드</p>
          </div>
          <p className="text-xs text-gray-500 mb-2">퇴실 전 다음 사항을 꼭 확인해 주세요.</p>
          <ul className="flex flex-col gap-1.5">
            {[
              '퇴실 즉시 좌석이 자동 반납되며, 남은 시간은 소멸됩니다.',
              '개인 소지품을 모두 챙겼는지 다시 한번 확인해 주세요.',
              '퇴실 이후에는 좌석 복구가 불가능합니다.',
            ].map((text) => (
              <li key={text} className="flex items-start gap-1.5 text-xs text-gray-600">
                <span className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* 퇴실 버튼 */}
        <button
          onClick={handleCheckOut}
          disabled={isProcessing}
          className="w-full rounded-2xl py-5 flex flex-col items-center justify-center gap-2 transition-all active:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: '#8B3A00' }}
        >
          <LogOut size={28} className="text-white" />
          <span className="text-lg font-black text-white">{isProcessing ? '처리 중...' : '퇴실하기'}</span>
        </button>
      </div>

      {/* 하단 */}
      <div className="bg-white border-t border-gray-100 px-3 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">😊</span>
          <p className="text-[10px] text-gray-500">이용해 주셔서 감사합니다<br /><span className="text-gray-400">오늘도 열공하신 당신을 응원합니다.</span></p>
        </div>
        <button onClick={() => navigate('/kiosk/support')} className="flex items-center gap-1 text-xs text-gray-500 min-h-0 hover:text-orange-500 transition-colors">
          <Headphones size={12} />
          고객센터 호출
        </button>
      </div>
    </div>
  );
};
