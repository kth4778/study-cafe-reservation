import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, Printer, Headphones } from 'lucide-react';
import { useReservationStore } from '@/store/reservationStore';
import { formatTime, formatKrw } from '@/utils/time';
import { Clock } from '@/components/common/Clock';
import { METHOD_LABEL } from '@/types/payment';

export const PaymentCompletePage = () => {
  const navigate = useNavigate();
  const { currentReservation, selectedPaymentMethod, paymentResult } = useReservationStore();

  if (!currentReservation) { navigate('/kiosk'); return null; }

  const durationHours = Math.round(
    (new Date(currentReservation.endTime).getTime() - new Date(currentReservation.startTime).getTime()) / 3_600_000
  );

  return (
    <div className="flex flex-col bg-[#F5F5F5]" style={{ minHeight: '100%' }}>
      {/* 헤더 */}
      <div className="bg-white px-3 py-2.5 flex items-center justify-between shadow-sm flex-shrink-0">
        <button onClick={() => navigate('/kiosk')} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center min-h-0">
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <span className="text-sm font-black text-gray-900">Study Oasis</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400"><Clock /></span>
          <Bell size={14} className="text-gray-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-3 py-5 flex flex-col gap-4 items-center">
        {/* 성공 아이콘 */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg shadow-orange-200" style={{ backgroundColor: 'var(--kiosk-orange)' }}>
          <span className="text-white text-3xl font-black">✓</span>
        </div>

        <div className="text-center">
          <p className="text-xl font-black text-gray-900">결제가 완료되었습니다</p>
          <p className="text-xs text-gray-400 mt-1">좌석 예약이 정상적으로 완료되었어요</p>
        </div>

        {/* 예약 정보 카드 */}
        <div className="ki-card p-4 w-full">
          {[
            ['좌석 번호', currentReservation.seatNumber + '번', true],
            ['좌석 유형', '일반석', false],
            ['이용 시간', `${durationHours}시간`, false],
            ['종료 예정', formatTime(currentReservation.endTime), false],
            ['결제 금액', formatKrw(currentReservation.totalAmount), false],
            ['결제 수단', METHOD_LABEL[selectedPaymentMethod ?? 'card'], false],
          ].map(([label, value, orange]) => (
            <div key={String(label)} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-xs text-gray-500">{label}</span>
              <span className={`text-xs font-bold ${orange ? '' : 'text-gray-800'}`} style={orange ? { color: 'var(--kiosk-orange)' } : {}}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* 안내 메시지 */}
        <div className="w-full rounded-2xl p-4 flex flex-col gap-2" style={{ backgroundColor: '#FFF0E6' }}>
          {[
            '선택한 좌석에서 바로 이용 가능합니다.',
            '이용 종료 10분 전에 안내 알림이 표시됩니다.',
          ].map((msg) => (
            <div key={msg} className="flex items-start gap-2">
              <span className="text-xs mt-0.5" style={{ color: 'var(--kiosk-orange)' }}>⓪</span>
              <p className="text-xs text-gray-600">{msg}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="bg-white border-t border-gray-100 px-3 pt-3 pb-3 flex flex-col gap-2 flex-shrink-0">
        <button onClick={() => navigate('/kiosk/usage')} className="ki-btn-orange w-full text-sm">
          이동 시작하기 →
        </button>
        <button
          onClick={() => navigate('/kiosk/receipt')}
          className="ki-btn-gray w-full text-sm flex items-center justify-center gap-1.5"
        >
          <Printer size={14} /> 영수증 출력
        </button>
        <div className="flex items-center justify-center pt-1 gap-1">
          <p className="text-[10px] text-gray-400">고객가 발생하면 고객센터를 호출해주세요</p>
          <button
            onClick={() => navigate('/kiosk/support')}
            className="text-[10px] font-bold flex items-center gap-0.5 min-h-0"
            style={{ color: 'var(--kiosk-orange)' }}
          >
            <Headphones size={10} /> 고객센터 호출
          </button>
        </div>
      </div>
    </div>
  );
};
