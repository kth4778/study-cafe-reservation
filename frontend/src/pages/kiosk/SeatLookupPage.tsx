import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Search } from 'lucide-react';
import { useReservationStore } from '@/store/reservationStore';
import { findReservationBySeat } from '@/api/reservations';
import { isAxiosError } from '@/api/client';
import { Clock } from '@/components/common/Clock';

export const SeatLookupPage = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const { currentReservation, setCurrentReservation } = useReservationStore();

  const [seatInput, setSeatInput]   = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  // 어디로 갈지 (state.next)
  const nextRoute = (location.state as { next?: string } | null)?.next ?? '/kiosk/usage';

  // 이미 예약이 있으면 바로 목적지로
  useEffect(() => {
    if (currentReservation) navigate(nextRoute, { replace: true });
  }, [currentReservation, nextRoute, navigate]);

  const handleSearch = async () => {
    const num = parseInt(seatInput, 10);
    if (!num || num < 1 || num > 100) {
      setError('1~100 사이의 좌석 번호를 입력해 주세요.');
      return;
    }
    setIsSearching(true);
    setError(null);

    try {
      const reservation = await findReservationBySeat(num);
      setCurrentReservation(reservation);
      navigate(nextRoute, { replace: true });
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) {
        setError(`${num}번 좌석의 이용 중인 예약이 없습니다.\n좌석 번호를 다시 확인해 주세요.`);
      } else {
        setError('서버와 연결할 수 없습니다.\n잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const destinationLabel: Record<string, string> = {
    '/kiosk/usage':    '이용 현황 확인',
    '/kiosk/extend':   '시간 연장하기',
    '/kiosk/checkout': '퇴실하기',
  };

  return (
    <div className="flex flex-col bg-[#F5F5F5]" style={{ minHeight: '100%' }}>
      {/* 헤더 */}
      <div className="bg-white px-3 py-2.5 flex items-center justify-between shadow-sm flex-shrink-0">
        <button
          onClick={() => navigate('/kiosk')}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center min-h-0"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <span className="text-sm font-black text-gray-900">
          {destinationLabel[nextRoute] ?? '좌석 조회'}
        </span>
        <span className="text-xs text-gray-400"><Clock /></span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-5">
        {/* 아이콘 */}
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg shadow-orange-200"
          style={{ backgroundColor: 'var(--kiosk-orange)' }}
        >
          <Search size={32} className="text-white" />
        </div>

        {/* 안내 */}
        <div className="text-center">
          <p className="text-xl font-black text-gray-900">이용 중인 좌석 번호를 입력해 주세요</p>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            예약 시 안내받은 좌석 번호를 입력하시면<br />
            현재 이용 내역을 불러옵니다.
          </p>
        </div>

        {/* 입력 카드 */}
        <div className="w-full ki-card p-5 flex flex-col gap-3">
          <label className="text-xs font-bold text-gray-500">좌석 번호 (1 ~ 100)</label>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={100}
            value={seatInput}
            onChange={(e) => { setSeatInput(e.target.value); setError(null); }}
            onKeyDown={handleKey}
            placeholder="예)  42"
            className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-2xl px-4 py-3 text-3xl font-black text-gray-900 text-center outline-none transition-colors placeholder:text-gray-300"
          />

          {error && (
            <div className="flex items-start gap-2 text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <span className="mt-0.5 flex-shrink-0">⚠</span>
              <span className="whitespace-pre-line">{error}</span>
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={isSearching || !seatInput}
            className="ki-btn-orange w-full text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSearching ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                조회 중...
              </>
            ) : (
              <><Search size={15} /> 조회하기</>
            )}
          </button>
        </div>

        <button onClick={() => navigate('/kiosk')} className="ki-btn-gray w-full text-sm">
          메인으로 돌아가기
        </button>
      </div>
    </div>
  );
};
