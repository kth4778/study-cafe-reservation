import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock3, ArrowLeftRight, LogOut, Headphones } from 'lucide-react';
import { useReservationStore } from '@/store/reservationStore';
import { formatTime, getRemainingMinutes } from '@/utils/time';
import { EXPIRE_ALERT_TIMES_MIN } from '@/constants/config';
import { Clock } from '@/components/common/Clock';

const SEAT_TYPE_LABEL: Record<string, string> = {
  general: '일반석', premium: '프리미엄석', private: '1인실',
};

export const UsageStatusPage = () => {
  const navigate = useNavigate();
  const { currentReservation } = useReservationStore();
  const [remainingMin, setRemainingMin] = useState(0);
  const [totalMin, setTotalMin] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMin, setAlertMin] = useState(0);
  const alertedRef = useRef<Set<number>>(new Set());

  // 예약 없으면 좌석 조회 페이지로 (흰 화면 방지)
  useEffect(() => {
    if (!currentReservation) {
      navigate('/kiosk/lookup', { state: { next: '/kiosk/usage' }, replace: true });
    }
  }, [currentReservation, navigate]);

  useEffect(() => {
    if (!currentReservation) return;
    const start = new Date(currentReservation.startTime).getTime();
    const end = new Date(currentReservation.endTime).getTime();
    setTotalMin(Math.round((end - start) / 60_000));
    alertedRef.current = new Set();

    const update = () => {
      const mins = getRemainingMinutes(currentReservation.endTime);
      setRemainingMin(Math.max(0, mins));
      for (const am of EXPIRE_ALERT_TIMES_MIN) {
        if (mins <= am && !alertedRef.current.has(am)) {
          alertedRef.current.add(am);
          setAlertMin(am);
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 15_000);
        }
      }
      if (mins <= 0) navigate('/kiosk/checkout');
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [currentReservation, navigate]);

  if (!currentReservation) return null;

  const hours = Math.floor(remainingMin / 60);
  const minutes = remainingMin % 60;
  const elapsed = totalMin - remainingMin;
  const progress = totalMin > 0 ? Math.min(1, elapsed / totalMin) : 0;
  const seatType = (currentReservation as { seatType?: string }).seatType ?? 'general';

  const menuItems = [
    { icon: <Clock3 size={18} className="text-orange-500" />, label: '시간 연장하기', sub: '현재 좌석 그대로 연장 가능', onClick: () => navigate('/kiosk/extend') },
    { icon: <ArrowLeftRight size={18} className="text-orange-500" />, label: '자리 이동', sub: '빈 좌석으로 직접 이동 가능', onClick: () => navigate('/kiosk/transfer') },
    { icon: <LogOut size={18} className="text-orange-500" />, label: '퇴실하기', sub: '이용을 마치고 퇴실합니다', onClick: () => navigate('/kiosk/checkout') },
  ];

  return (
    <div className="flex flex-col bg-[#F5F5F5]" style={{ minHeight: '100%' }}>
      {/* 헤더 */}
      <div className="bg-white px-3 py-2.5 flex items-center justify-between shadow-sm flex-shrink-0">
        <button onClick={() => navigate('/kiosk')} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center min-h-0">
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <span className="text-sm font-black text-gray-900">이용 현황</span>
        <span className="text-xs text-gray-400"><Clock /></span>
      </div>

      <div className="flex-1 px-3 py-3 flex flex-col gap-3 overflow-y-auto scrollbar-none">
        {/* 좌석 정보 카드 */}
        <div className="ki-card p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] text-white font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--kiosk-orange)' }}>
                  {SEAT_TYPE_LABEL[seatType] ?? '일반석'}
                </span>
                <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">이용 중</span>
              </div>
              <p className="text-4xl font-black text-gray-900">{currentReservation.seatNumber}번</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
              <span className="text-2xl">🪑</span>
            </div>
          </div>
          <div className="flex justify-between text-xs">
            <div>
              <p className="text-gray-400">이용 시작</p>
              <p className="font-bold text-gray-700 mt-0.5">{formatTime(currentReservation.startTime)}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400">종료 예정</p>
              <p className="font-bold text-gray-700 mt-0.5">{formatTime(currentReservation.endTime)}</p>
            </div>
          </div>
        </div>

        {/* 남은 시간 + 프로그레스 바 */}
        <div className="ki-card p-4 text-center">
          <p className="text-3xl font-black leading-none" style={{ color: 'var(--kiosk-orange)' }}>
            {hours > 0 ? `${hours}시간 ${minutes}분 남음` : `${minutes}분 남음`}
          </p>
          <div className="mt-3 h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${progress * 100}%`, backgroundColor: 'var(--kiosk-orange)' }}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5">
            {formatTime(currentReservation.startTime)} 시작 → {formatTime(currentReservation.endTime)} 종료 예정
          </p>
        </div>

        {/* 액션 메뉴 */}
        <div className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="w-full bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm border border-gray-100 hover:border-orange-200 active:bg-orange-50 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
              </div>
              <span className="text-gray-300 text-lg">›</span>
            </button>
          ))}
        </div>
      </div>

      {/* 하단 */}
      <div className="bg-white border-t border-gray-100 px-3 py-2.5 flex items-center justify-between flex-shrink-0">
        <p className="text-[10px] text-gray-400">⓪ 이용 종료 10분 전에 안내 알림이 표시됩니다.</p>
        <button onClick={() => navigate('/kiosk/support')} className="flex items-center gap-1 text-xs text-gray-500 min-h-0 hover:text-orange-500 transition-colors">
          <Headphones size={12} />
          고객센터 호출
        </button>
      </div>

      {/* 10분 알림 모달 */}
      {showAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="ki-card w-full max-w-xs p-6 text-center">
            <p className="text-3xl mb-2">⏰</p>
            <p className="text-lg font-black text-gray-900">{alertMin}분 전 알림</p>
            <p className="text-sm text-gray-500 mt-1">이용 시간이 {alertMin}분 후에 종료됩니다</p>
            <button onClick={() => setShowAlert(false)} className="ki-btn-orange w-full mt-4 text-sm">확인</button>
          </div>
        </div>
      )}
    </div>
  );
};
