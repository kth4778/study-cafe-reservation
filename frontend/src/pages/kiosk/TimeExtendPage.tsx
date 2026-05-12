import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Headphones } from 'lucide-react';
import { useReservationStore } from '@/store/reservationStore';
import { formatTime, formatKrw, getRemainingMinutes } from '@/utils/time';
import { Clock } from '@/components/common/Clock';

const EXTEND_OPTIONS = [1, 2, 4, 6] as const;
type ExtHours = typeof EXTEND_OPTIONS[number];

function addHoursToIso(isoStr: string, hours: number): string {
  return new Date(new Date(isoStr).getTime() + hours * 3_600_000).toISOString();
}

export const TimeExtendPage = () => {
  const navigate = useNavigate();
  const { currentReservation, setExtensionContext } = useReservationStore();
  const [selected, setSelected] = useState<ExtHours>(2);

  // 예약 없으면 좌석 조회 → 연장 페이지로 돌아오도록
  useEffect(() => {
    if (!currentReservation) {
      navigate('/kiosk/lookup', { state: { next: '/kiosk/extend' }, replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!currentReservation) return null;

  const pricePerHour = Math.round(
    currentReservation.totalAmount /
    Math.max(1, Math.round(
      (new Date(currentReservation.endTime).getTime() - new Date(currentReservation.startTime).getTime()) / 3_600_000,
    )),
  );

  const remainingMin = getRemainingMinutes(currentReservation.endTime);
  const remainH = Math.floor(remainingMin / 60);
  const remainM = remainingMin % 60;
  const addCost = pricePerHour * selected;
  const newEndTime = addHoursToIso(currentReservation.endTime, selected);

  const handleProceedToPayment = () => {
    // 연장 컨텍스트를 store에 저장하고 결제 화면으로 이동
    setExtensionContext({ hours: selected, extraCost: addCost, newEndTime });
    navigate('/kiosk/payment');
  };

  return (
    <div className="flex flex-col bg-[#F5F5F5]" style={{ minHeight: '100%' }}>
      {/* 헤더 */}
      <div className="bg-white px-3 py-2.5 flex items-center justify-between shadow-sm flex-shrink-0">
        <button onClick={() => navigate('/kiosk/usage')} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center min-h-0">
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <span className="text-sm font-black" style={{ color: 'var(--kiosk-orange)' }}>시간 연장</span>
        <span className="text-xs text-gray-400"><Clock /></span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-3 py-3 flex flex-col gap-3">
        {/* 현재 좌석 정보 */}
        <div className="ki-card p-4">
          <p className="text-xs text-gray-400 mb-1">현재 이용 중인 좌석</p>
          <p className="text-3xl font-black text-gray-900 mb-2">
            {currentReservation.seatNumber}번{' '}
            <span className="text-base font-semibold text-gray-500">일반석</span>
          </p>
          <div className="flex justify-between text-xs">
            <div>
              <p className="text-gray-400">기존 종료 시간</p>
              <p className="font-bold text-gray-700 mt-0.5">{formatTime(currentReservation.endTime)}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400">현재 남은 시간</p>
              <p className="font-bold mt-0.5" style={{ color: 'var(--kiosk-orange)' }}>
                {remainH > 0 ? `${remainH}시간 ` : ''}{remainM}분
              </p>
            </div>
          </div>
        </div>

        {/* 연장 시간 선택 */}
        <div className="ki-card p-4">
          <p className="text-xs font-bold text-gray-500 mb-3">연장할 시간을 선택해주세요</p>
          <div className="grid grid-cols-2 gap-2">
            {EXTEND_OPTIONS.map((h) => {
              const cost = pricePerHour * h;
              const newEnd = addHoursToIso(currentReservation.endTime, h);
              const isSelected = selected === h;
              return (
                <button
                  key={h}
                  onClick={() => setSelected(h)}
                  className="rounded-2xl p-3 text-left border-2 transition-all min-h-0"
                  style={{
                    borderColor: isSelected ? 'var(--kiosk-orange)' : '#E5E7EB',
                    backgroundColor: isSelected ? '#FFF0E6' : '#FAFAFA',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-base font-black ${isSelected ? '' : 'text-gray-700'}`}
                      style={isSelected ? { color: 'var(--kiosk-orange)' } : {}}
                    >
                      {h}시간
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs" style={{ backgroundColor: 'var(--kiosk-orange)' }}>✓</span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-600">+{formatKrw(cost)}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">예상 종료 {formatTime(newEnd)}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 결제 요약 */}
        <div className="ki-card p-4">
          <p className="text-xs font-bold text-gray-500 mb-2">연장 결제 요약</p>
          <div className="flex justify-between text-xs py-1.5 border-b border-gray-50">
            <span className="text-gray-500">연장 시간</span>
            <span className="font-semibold text-gray-700">{selected}시간</span>
          </div>
          <div className="flex justify-between text-xs py-1.5 border-b border-gray-50">
            <span className="text-gray-500">새 종료 시간</span>
            <span className="font-semibold text-gray-700">{formatTime(newEndTime)}</span>
          </div>
          <div className="flex justify-between pt-2 mt-1">
            <span className="text-sm font-bold text-gray-700">추가 결제 금액</span>
            <span className="text-lg font-black" style={{ color: 'var(--kiosk-orange)' }}>{formatKrw(addCost)}</span>
          </div>
        </div>

        {/* 안내 */}
        <div className="rounded-2xl px-4 py-3 flex items-start gap-2" style={{ backgroundColor: '#FFF0E6' }}>
          <span className="text-orange-400 mt-0.5">ℹ</span>
          <p className="text-xs text-gray-600">
            연장 결제 완료 후 좌석 이용 시간이 자동으로 연장됩니다.<br />
            이용 종료 전까지 횟수 제한 없이 연장이 가능합니다.
          </p>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="bg-white border-t border-gray-100 px-3 pt-3 pb-3 flex flex-col gap-2 flex-shrink-0">
        <button onClick={handleProceedToPayment} className="ki-btn-orange w-full text-sm">
          추가 결제 진행하기 →
        </button>
        <button onClick={() => navigate('/kiosk/usage')} className="ki-btn-gray w-full text-sm">취소</button>
        <div className="flex justify-between items-center pt-1">
          <p className="text-[10px] text-gray-400">ⓘ 결제 완료 후 즉시 시간이 연장됩니다.</p>
          <button
            onClick={() => navigate('/kiosk/support')}
            className="flex items-center gap-1 text-[10px] text-gray-400 min-h-0 hover:text-orange-500"
          >
            <Headphones size={10} /> 고객센터
          </button>
        </div>
      </div>
    </div>
  );
};
