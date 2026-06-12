import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock3 } from 'lucide-react';
import { useReservationStore } from '@/store/reservationStore';
import { formatKrw, formatTime } from '@/utils/time';
import type { PaymentMethod } from '@/types/payment';

interface MethodOption {
  id: PaymentMethod;
  label: string;
  sub: string;
  icon: React.ReactNode;
}

const METHODS: MethodOption[] = [
  {
    id: 'card', label: '카드 결제', sub: '신용/체크카드, 삼성페이',
    icon: (
      <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center">
        <span className="text-white text-xs font-black">카드</span>
      </div>
    ),
  },
  {
    id: 'cash', label: '현금 결제', sub: '지폐만 가능합니다 (만원/오천원/천원)',
    icon: (
      <div className="w-9 h-9 rounded-xl bg-gray-300 flex items-center justify-center">
        <span className="text-gray-600 text-xs font-black">현금</span>
      </div>
    ),
  },
];

const SIMPLE_METHODS: MethodOption[] = [
  {
    id: 'kakao', label: '카카오페이', sub: 'QR 결제, 바코드결제',
    icon: (
      <div className="w-9 h-9 rounded-xl bg-yellow-400 flex items-center justify-center">
        <span className="text-gray-900 text-xs font-black">K</span>
      </div>
    ),
  },
  {
    id: 'toss', label: '토스페이', sub: '토스 앱 간편결제',
    icon: (
      <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center">
        <span className="text-white text-xs font-black">T</span>
      </div>
    ),
  },
  {
    id: 'naver', label: '네이버페이', sub: '네이버 아이디 간편결제',
    icon: (
      <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center">
        <span className="text-white text-xs font-black">N</span>
      </div>
    ),
  },
];

const MethodRow = ({
  option, selected, onSelect,
}: { option: MethodOption; selected: boolean; onSelect: () => void }) => (
  <button
    onClick={onSelect}
    className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left min-h-0"
    style={{ borderColor: selected ? 'var(--kiosk-orange)' : '#E5E7EB', backgroundColor: selected ? '#FFF0E6' : '#FFFFFF' }}
  >
    {option.icon}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-gray-800 leading-tight">{option.label}</p>
      <p className="text-[10px] text-gray-400 leading-tight mt-0.5 truncate">{option.sub}</p>
    </div>
    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
      style={{ borderColor: selected ? 'var(--kiosk-orange)' : '#D1D5DB' }}>
      {selected && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--kiosk-orange)' }} />}
    </div>
    {selected && option.id === 'card' && (
      <span className="text-[9px] text-white font-bold px-1.5 py-0.5 rounded-full ml-1 flex-shrink-0" style={{ backgroundColor: 'var(--kiosk-orange)' }}>
        추천
      </span>
    )}
  </button>
);

export const PaymentPage = () => {
  const navigate = useNavigate();
  const { currentReservation, extensionContext, setSelectedPaymentMethod } = useReservationStore();
  const [selected, setSelected] = useState<PaymentMethod>('card');

  // 연장 모드: extensionContext가 있으면 연장 결제
  const isExtensionMode = extensionContext !== null;

  if (!currentReservation) { navigate('/kiosk'); return null; }

  const { seatNumber, endTime, startTime } = currentReservation;
  const durationHours = currentReservation.durationHours
    ?? Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 3_600_000);

  // 결제 금액: 연장 모드면 추가 금액, 일반 모드면 원래 금액
  const paymentAmount = isExtensionMode
    ? extensionContext.extraCost
    : currentReservation.totalAmount;

  const handleProceed = () => {
    setSelectedPaymentMethod(selected);
    navigate('/kiosk/loading');
  };

  const handleBack = () => {
    if (isExtensionMode) navigate('/kiosk/extend');
    else navigate('/kiosk/seats');
  };

  return (
    <div className="flex flex-col bg-[#F5F5F5]" style={{ minHeight: '100%' }}>
      {/* 헤더 */}
      <div className="bg-white px-3 py-2.5 flex items-center gap-3 shadow-sm flex-shrink-0">
        <button onClick={handleBack} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center min-h-0">
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <div className="flex-1 text-center">
          <span className="text-sm font-black text-gray-900">
            {isExtensionMode ? '연장 결제하기' : '결제하기'}
          </span>
          {isExtensionMode && (
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <Clock3 size={10} className="text-orange-400" />
              <span className="text-[10px] font-bold" style={{ color: 'var(--kiosk-orange)' }}>
                {extensionContext.hours}시간 연장
              </span>
            </div>
          )}
        </div>
        <div className="w-8" />
      </div>

      {/* 단계 표시 */}
      {!isExtensionMode && (
        <div className="flex items-center justify-center gap-2 py-3 bg-white border-b border-gray-100 flex-shrink-0">
          {['좌석 선택', '결제 수단', '결제 완료'].map((step, i) => (
            <div key={step} className="flex items-center gap-1.5">
              {i > 0 && <div className="w-6 h-px bg-gray-200" />}
              <div className="flex items-center gap-1">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black"
                  style={i === 1 ? { backgroundColor: 'var(--kiosk-orange)', color: '#FFF' } : { backgroundColor: '#E5E7EB', color: '#9CA3AF' }}
                >
                  {i + 1}
                </div>
                <span className={`text-[10px] ${i === 1 ? 'font-bold text-gray-700' : 'text-gray-400'}`}>{step}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-none px-3 py-3 flex flex-col gap-3">
        {/* 결제 정보 요약 */}
        <div className="ki-card p-4">
          <p className="text-xs font-bold text-gray-500 mb-3">
            {isExtensionMode ? '연장 정보' : '예약 정보 요약'}
          </p>

          {isExtensionMode ? (
            <>
              {[
                ['좌석 번호', `${seatNumber}번`],
                ['연장 시간', `${extensionContext.hours}시간`],
                ['새 종료 시간', formatTime(extensionContext.newEndTime)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-xs font-semibold text-gray-800">{value}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 mt-1">
                <span className="text-sm font-bold text-gray-700">추가 결제 금액</span>
                <span className="text-lg font-black" style={{ color: 'var(--kiosk-orange)' }}>{formatKrw(paymentAmount)}</span>
              </div>
            </>
          ) : (
            <>
              {[
                ['좌석 번호', `${seatNumber}번`],
                ['이용 시간', `${durationHours}시간`],
                ['종료 예정 시각', formatTime(endTime)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-xs font-semibold text-gray-800">{value}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 mt-1">
                <span className="text-sm font-bold text-gray-700">최종 금액</span>
                <span className="text-lg font-black" style={{ color: 'var(--kiosk-orange)' }}>{formatKrw(paymentAmount)}</span>
              </div>
            </>
          )}
        </div>

        {/* 결제 수단 */}
        <div className="ki-card p-4">
          <p className="text-xs font-bold text-gray-500 mb-2">결제 수단 선택</p>
          <div className="flex flex-col gap-2">
            {METHODS.map((m) => (
              <MethodRow key={m.id} option={m} selected={selected === m.id} onSelect={() => setSelected(m.id)} />
            ))}
          </div>
        </div>

        {/* 간편결제 */}
        <div className="ki-card p-4">
          <p className="text-xs font-bold text-gray-500 mb-2">간편결제 (페이)</p>
          <div className="flex flex-col gap-2">
            {SIMPLE_METHODS.map((m) => (
              <MethodRow key={m.id} option={m} selected={selected === m.id} onSelect={() => setSelected(m.id)} />
            ))}
          </div>
        </div>

        {/* 총 결제 금액 */}
        <div className="ki-card p-4 flex justify-between items-center">
          <span className="text-sm font-bold text-gray-700">
            {isExtensionMode ? '추가 결제 금액' : '총 결제 금액'}
          </span>
          <span className="text-xl font-black" style={{ color: 'var(--kiosk-orange)' }}>{formatKrw(paymentAmount)}</span>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="bg-white border-t border-gray-100 px-3 pt-3 pb-3 flex gap-2 flex-shrink-0">
        <button onClick={handleBack} className="ki-btn-gray flex-1 text-sm">
          이전으로
        </button>
        <button onClick={handleProceed} className="ki-btn-orange flex-[2] text-sm">
          {isExtensionMode ? '연장 결제 진행하기' : '결제 진행하기'}
        </button>
      </div>
    </div>
  );
};
