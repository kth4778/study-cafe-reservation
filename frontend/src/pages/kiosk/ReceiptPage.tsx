import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Printer } from 'lucide-react';
import { useReservationStore } from '@/store/reservationStore';
import { formatKrw } from '@/utils/time';
import { Clock } from '@/components/common/Clock';
import { METHOD_LABEL } from '@/types/payment';
import type { Reservation } from '@/types/reservation';

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function formatTimeRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  return `${String(s.getHours()).padStart(2, '0')}:${String(s.getMinutes()).padStart(2, '0')}~${String(e.getHours()).padStart(2, '0')}:${String(e.getMinutes()).padStart(2, '0')}`;
}

export const ReceiptPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentReservation, selectedPaymentMethod, paymentResult } = useReservationStore();
  const [printing, setPrinting] = useState(false);
  const [printed, setPrinted] = useState(false);

  // checkout 후 store가 reset된 경우, CheckOutCompletePage에서 state로 전달된 reservation 사용
  const stateReservation = (location.state as { reservation?: Reservation } | null)?.reservation ?? null;
  const effectiveReservation = currentReservation ?? stateReservation;

  if (!effectiveReservation) { navigate('/kiosk'); return null; }

  const durationHours = Math.round(
    (new Date(effectiveReservation.endTime).getTime() - new Date(effectiveReservation.startTime).getTime()) / 3_600_000,
  );
  const approvalNo = paymentResult?.approvalNumber ?? '12345678';

  const handlePrint = async () => {
    setPrinting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setPrinting(false);
    setPrinted(true);
    setTimeout(() => setPrinted(false), 3000);
  };

  return (
    <div className="flex flex-col bg-[#F5F5F5]" style={{ minHeight: '100%' }}>
      {/* 헤더 */}
      <div className="bg-white px-3 py-2.5 flex items-center justify-between shadow-sm flex-shrink-0">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center min-h-0">
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <span className="text-sm font-black text-gray-900">영수증 다시 출력</span>
        <span className="text-xs text-gray-400"><Clock /></span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-3 py-5 flex flex-col gap-4">
        {/* 타이틀 */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🖨️</span>
          </div>
          <p className="text-lg font-black text-gray-900">영수증을 다시 출력할 수 있어요</p>
          <p className="text-xs text-gray-400 mt-1">최근 이용 내역 기준으로 재출력이 가능합니다.</p>
        </div>

        {/* 이용 정보 + 영수증 미리보기 (2열) */}
        <div className="grid grid-cols-2 gap-2">
          {/* 이용 정보 */}
          <div className="ki-card p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-gray-500">🪑 이용 정보</p>
              <span className="text-[9px] text-white font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--kiosk-orange)' }}>
                {effectiveReservation.seatNumber}번
              </span>
            </div>
            {[
              ['이용 시간', `${durationHours}시간 (${formatTimeRange(effectiveReservation.startTime, effectiveReservation.endTime)})`],
              ['결제 금액', formatKrw(effectiveReservation.totalAmount)],
              ['결제 수단', METHOD_LABEL[selectedPaymentMethod ?? 'card']],
              ['결제 일시', formatDateTime(effectiveReservation.startTime)],
            ].map(([label, value]) => (
              <div key={label} className="py-1 border-b border-gray-50 last:border-0">
                <p className="text-[9px] text-gray-400">{label}</p>
                <p className="text-[10px] font-bold text-gray-700 leading-tight">{value}</p>
              </div>
            ))}
          </div>

          {/* 영수증 미리보기 */}
          <div className="ki-card p-3 flex flex-col">
            <p className="text-[10px] font-bold text-gray-700 text-center mb-1">스터디 오아시스</p>
            <p className="text-[9px] text-gray-400 text-center mb-2">영수증 미리보기</p>
            <div className="border-t border-dashed border-gray-200 pt-2 flex-1">
              <div className="flex justify-between text-[9px] mb-1">
                <span className="text-gray-500">승인 번호</span>
                <span className="font-bold text-gray-700">{approvalNo}</span>
              </div>
              <div className="flex justify-between text-[9px] mb-1">
                <span className="text-gray-500">품목</span>
                <span className="font-bold text-gray-700">{durationHours}시간 이용권</span>
              </div>
              <div className="border-t border-dashed border-gray-200 mt-2 pt-2">
                <div className="flex justify-between">
                  <span className="text-[9px] text-gray-500">합계</span>
                  <span className="text-sm font-black" style={{ color: 'var(--kiosk-orange)' }}>{formatKrw(effectiveReservation.totalAmount)}</span>
                </div>
              </div>
            </div>
            {/* 프린터 상태 */}
            <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
              <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />프린터 연결
              </span>
              <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />용지 상태
              </span>
            </div>
          </div>
        </div>

        {printed && (
          <div className="rounded-2xl p-3 text-center text-sm font-bold text-green-700 bg-green-50 border border-green-200">
            ✅ 영수증이 출력되었습니다
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="bg-white border-t border-gray-100 px-3 pt-3 pb-3 flex flex-col gap-2 flex-shrink-0">
        <button onClick={handlePrint} disabled={printing} className="ki-btn-orange w-full text-sm flex items-center justify-center gap-2 disabled:opacity-60">
          <Printer size={16} />
          {printing ? '출력 중...' : '영수증 다시 출력'}
        </button>
        <button onClick={() => navigate('/kiosk')} className="ki-btn-gray w-full text-sm">
          메인 화면으로 이동
        </button>
      </div>
    </div>
  );
};
