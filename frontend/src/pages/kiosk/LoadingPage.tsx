import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';
import { useReservationStore } from '@/store/reservationStore';
import { useNetworkStore } from '@/store/networkStore';
import { processPayment } from '@/api/payments';
import { extendReservation } from '@/api/reservations';
import { Clock } from '@/components/common/Clock';
import type { PaymentErrorCode } from '@/types/payment';
import { PAYMENT_ERROR_MESSAGES, toApiMethod } from '@/types/payment';
import { MAX_RETRY_COUNT, RETRYABLE_CODES } from '@/constants/config';

type Step = 'pending' | 'active' | 'done';

export const LoadingPage = () => {
  const navigate = useNavigate();
  const {
    currentReservation,
    selectedPaymentMethod,
    extensionContext,
    setPaymentResult,
    setCurrentReservation,
    setExtensionContext,
  } = useReservationStore();
  const isOnline = useNetworkStore((s) => s.isOnline);

  const isExtensionMode = extensionContext !== null;

  const [steps, setSteps] = useState<[Step, Step, Step]>(['active', 'pending', 'pending']);
  const [failed, setFailed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // 연장 모드 / 일반 모드에 따라 단계 레이블이 다름
  const STEP_LABELS = isExtensionMode
    ? ['연장 결제 승인 요청', '좌석 연장 처리 중', '연장 확정']
    : ['결제 승인 요청', '좌석 상태 확인', '예약 확정'];

  const advanceStep = (index: 0 | 1 | 2) => {
    setSteps((prev) => {
      const next: [Step, Step, Step] = [...prev] as [Step, Step, Step];
      next[index] = 'done';
      if (index < 2) next[(index + 1) as 1 | 2] = 'active';
      return next;
    });
  };

  const executePayment = useCallback(async (retry = 0) => {
    if (!currentReservation || !selectedPaymentMethod) return;

    // 결제 금액: 연장이면 extraCost, 일반이면 totalAmount
    const payAmount = isExtensionMode
      ? (extensionContext?.extraCost ?? 0)
      : currentReservation.totalAmount;

    try {
      setTimeout(() => advanceStep(0), 800);
      const result = await processPayment({
        reservationId: currentReservation.reservationId,
        method: toApiMethod(selectedPaymentMethod),
        amount: payAmount,
      });
      setPaymentResult(result);
      setTimeout(() => advanceStep(1), 400);

      if (isExtensionMode && extensionContext) {
        // 연장 결제 성공 → API로 실제 연장 처리
        try {
          const updated = await extendReservation(
            currentReservation.reservationId,
            extensionContext.hours,
          );
          setCurrentReservation(updated);
        } catch {
          // API 실패 시 로컬 상태만 업데이트 (오프라인 대비)
          setCurrentReservation({
            ...currentReservation,
            endTime: extensionContext.newEndTime,
            totalAmount: currentReservation.totalAmount + extensionContext.extraCost,
          });
        }
        setExtensionContext(null);
        setTimeout(() => advanceStep(2), 900);
        setTimeout(() => navigate('/kiosk/usage'), 1800);
      } else {
        setTimeout(() => advanceStep(2), 900);
        setTimeout(() => navigate('/kiosk/payment-complete'), 1800);
      }
    } catch (err: unknown) {
      const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code as PaymentErrorCode | undefined;
      const retryable = code && (RETRYABLE_CODES as readonly string[]).includes(code);
      if (retryable && retry < MAX_RETRY_COUNT - 1) {
        setRetryCount(retry + 1);
        setTimeout(() => executePayment(retry + 1), 3000);
      } else {
        setErrorMsg(code ? PAYMENT_ERROR_MESSAGES[code] : '결제를 처리할 수 없습니다. 관리자를 호출해 주세요.');
        setFailed(true);
      }
    }
  }, [currentReservation, selectedPaymentMethod, isExtensionMode, extensionContext, setPaymentResult, setCurrentReservation, setExtensionContext, navigate]);

  useEffect(() => { executePayment(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!currentReservation) { navigate('/kiosk'); return null; }

  /* ── 결제 오류 화면 ── */
  if (failed) {
    const backRoute = isExtensionMode ? '/kiosk/payment' : '/kiosk/payment';
    return (
      <div className="flex flex-col bg-white" style={{ minHeight: '100%' }}>
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
          <span className="text-sm font-black text-gray-900">Study Oasis</span>
          <span className="text-xs text-gray-400"><Clock /></span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          <div className="w-24 h-24 rounded-3xl bg-orange-50 flex items-center justify-center">
            <span className="text-5xl">🚫</span>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-gray-900">결제를 완료하지 못했어요</p>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              {errorMsg ?? '카드 한도 초과 또는 일시적인 승인 오류일 수 있습니다.'}<br />
              잠시 후 다시 시도해 주세요.
            </p>
          </div>
          <div className="w-full flex flex-col gap-2">
            <button onClick={() => navigate(backRoute)} className="ki-btn-orange w-full text-sm">
              ↺ 다시 결제 시도하기
            </button>
            <button onClick={() => { setExtensionContext(null); navigate('/kiosk'); }} className="ki-btn-gray w-full text-sm">
              메인 화면으로 이동
            </button>
          </div>
          <div className="w-full ki-card p-3 flex items-start gap-2">
            <span className="text-orange-400 text-sm mt-0.5">⚠</span>
            <div>
              <p className="text-xs text-gray-600">결제 정보는 안전하게 보호됩니다.</p>
              <p className="text-[10px] text-gray-400 mt-0.5">문제가 반복되면 고객센터로 문의해 주세요.</p>
              <p className="text-[10px] font-bold text-gray-500 mt-1">고객센터: 1588-XXXX</p>
            </div>
          </div>
        </div>
        <div className="px-4 pb-4 flex justify-center gap-6 flex-shrink-0">
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
            서버 연결 {isOnline ? '정상' : '오류'}
          </span>
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            키오스크 상태 양호
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white" style={{ minHeight: '100%' }}>
      {/* 헤더 */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <span className="text-sm font-black text-gray-900">Study Oasis</span>
        <span className="text-xs text-gray-400"><Clock /></span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {/* 스피너 */}
        <div className="relative w-20 h-20">
          <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center">
            <Loader2 size={36} className="text-orange-400 animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
        </div>

        {/* 타이틀 */}
        <div className="text-center">
          <p className="text-lg font-black text-gray-900">
            {isExtensionMode ? '연장 결제를 진행하고 있습니다' : '결제를 진행하고 있습니다'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {retryCount > 0 ? `재시도 중... (${retryCount}/${MAX_RETRY_COUNT})` : '잠시만 기다려주세요. 화면을 종료하지 마세요.'}
          </p>
        </div>

        {/* 단계 */}
        <div className="w-full ki-card p-4 flex flex-col gap-3">
          {STEP_LABELS.map((label, i) => {
            const st = steps[i as 0 | 1 | 2];
            return (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {st === 'done' && <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />}
                  {st === 'active' && <Loader2 size={18} className="text-orange-500 animate-spin flex-shrink-0" />}
                  {st === 'pending' && <Circle size={18} className="text-gray-300 flex-shrink-0" />}
                  <span className={`text-xs font-semibold ${st === 'pending' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {label}
                  </span>
                </div>
                {st === 'done' && (
                  <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">완료</span>
                )}
                {st === 'active' && (
                  <span className="text-[10px] text-white font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--kiosk-orange)' }}>
                    진행중
                  </span>
                )}
                {st === 'pending' && (
                  <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-2 py-0.5 rounded-full">대기중</span>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-gray-400 text-center">
          ⓘ 보통 5초 이내 완료됩니다.<br />
          네트워크 상태에 따라 시간이 달라질 수 있습니다.
        </p>
      </div>

      {/* 하단 */}
      <div className="px-4 pb-4 flex flex-col gap-2 flex-shrink-0">
        <button onClick={() => { setExtensionContext(null); navigate('/kiosk'); }} className="ki-btn-gray w-full text-sm">
          취소하기
        </button>
        <div className="flex justify-center gap-4 pt-1">
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
            Network {isOnline ? 'OK' : 'FAIL'}
          </span>
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Server OK
          </span>
        </div>
      </div>
    </div>
  );
};
