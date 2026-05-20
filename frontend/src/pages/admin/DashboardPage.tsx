import { useEffect, useState, useCallback } from 'react';
import {
  Grid3X3, CheckCircle, XCircle, DollarSign,
  RefreshCw, AlertTriangle, TrendingUp, Users,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { KpiCard } from '@/components/admin/KpiCard';
import { AdminSeatGrid } from '@/components/admin/AdminSeatGrid';
import { useSeatStore } from '@/store/seatStore';
import { fetchSeats } from '@/api/seats';
import { fetchAdminKpi, resetSeat } from '@/api/admin';
import { useWebSocket } from '@/hooks/useWebSocket';
import { formatKrw } from '@/utils/time';
import type { KpiData } from '@/types/admin';
import type { Seat } from '@/types/seat';

const makeDemoSeats = (): Seat[] =>
  Array.from({ length: 100 }, (_, i) => ({
    seatId: `seat-${i + 1}`,
    seatNumber: i + 1,
    type: i < 60 ? 'general' : i < 90 ? 'premium' : 'private',
    status: i < 37 ? 'available' : i < 95 ? 'occupied' : 'maintenance',
    floor: 1,
    pricePerHour: i < 60 ? 2000 : i < 90 ? 3000 : 4000,
  }));

export const DashboardPage = () => {
  const { seats, setSeats } = useSeatStore();
  const [kpi, setKpi] = useState<KpiData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [resetTarget, setResetTarget] = useState<Seat | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  useWebSocket();

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [seatsData, kpiData] = await Promise.all([fetchSeats(), fetchAdminKpi()]);
      setSeats(seatsData.length > 0 ? seatsData : makeDemoSeats());
      setKpi(kpiData);
      setLastUpdated(new Date());
    } catch {
      setSeats(makeDemoSeats());
      setKpi({ totalSeats: 100, availableSeats: 37, occupiedSeats: 58, todayRevenue: 234000 });
    } finally {
      setIsLoading(false);
    }
  }, [setSeats]);

  useEffect(() => { load(); const id = setInterval(load, 30_000); return () => clearInterval(id); }, [load]);

  const handleReset = async () => {
    if (!resetTarget) return;
    setIsResetting(true);
    try { await resetSeat(resetTarget.seatId); await load(); }
    finally { setIsResetting(false); setResetTarget(null); }
  };

  const occupancyRate = kpi ? Math.round(((kpi.totalSeats - kpi.availableSeats) / kpi.totalSeats) * 100) : 0;

  return (
    <AdminLayout>
      <div className="p-6 flex flex-col gap-5">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900">메인 대시보드</h1>
            <p className="text-gray-400 text-xs mt-0.5">
              마지막 갱신: {lastUpdated.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
          <button
            onClick={load}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:border-orange-300 text-gray-600 text-sm transition-all disabled:opacity-50 min-h-0 shadow-sm"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            새로고침
          </button>
        </div>

        {/* KPI */}
        {kpi && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="총 좌석 수"  value={kpi.totalSeats}             icon={<Grid3X3 size={20} />}    color="blue" />
            <KpiCard label="이용 가능"   value={kpi.availableSeats}          icon={<CheckCircle size={20} />} color="green" />
            <KpiCard label="사용 중"     value={kpi.occupiedSeats}           icon={<XCircle size={20} />}    color="red" />
            <KpiCard label="금일 매출"   value={formatKrw(kpi.todayRevenue)} icon={<DollarSign size={20} />} color="orange" />
          </div>
        )}

        {/* 요약 배너 */}
        {kpi && (
          <div className="grid grid-cols-2 gap-4">
            <div className="ad-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={19} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-gray-400 text-xs">좌석 점유율</p>
                <p className="text-2xl font-black text-gray-900">{occupancyRate}%</p>
              </div>
              <div className="w-24">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${occupancyRate}%`, backgroundColor: '#7C3AED' }}
                  />
                </div>
              </div>
            </div>
            <div className="ad-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                <Users size={19} style={{ color: 'var(--kiosk-orange)' }} />
              </div>
              <div>
                <p className="text-gray-400 text-xs">이용 중인 인원</p>
                <p className="text-2xl font-black text-gray-900">{kpi.occupiedSeats}명</p>
              </div>
              <div className="text-right ml-auto">
                <p className="text-xs text-gray-400">수용 인원</p>
                <p className="text-sm text-gray-500 font-semibold">{kpi.totalSeats}명</p>
              </div>
            </div>
          </div>
        )}

        {/* 좌석 현황 */}
        <div className="ad-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">실시간 좌석 현황</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-3 h-3 rounded-sm bg-green-100 border border-green-300 inline-block" />이용가능
                <span className="w-3 h-3 rounded-sm bg-orange-100 border border-orange-300 inline-block ml-1" />사용중
                <span className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-300 inline-block ml-1" />점검
              </div>
              <span className="flex items-center gap-1 text-xs text-green-600">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                실시간
              </span>
            </div>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <RefreshCw size={18} className="animate-spin mr-2" /> 불러오는 중...
            </div>
          ) : (
            <AdminSeatGrid seats={seats} onReset={(s) => setResetTarget(s)} />
          )}
        </div>
      </div>

      {/* 초기화 모달 */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="ad-card max-w-xs w-full p-6 text-center shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={22} className="text-orange-500" />
            </div>
            <p className="text-lg font-black text-gray-900 mb-1">좌석 강제 초기화</p>
            <p className="text-gray-500 text-sm mb-5">
              <span className="font-bold text-gray-800">{resetTarget.seatNumber}번</span> 좌석을<br />이용 가능 상태로 초기화할까요?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setResetTarget(null)} className="ad-btn-secondary flex-1 py-2.5 text-sm">취소</button>
              <button onClick={handleReset} disabled={isResetting} className="ad-btn-danger flex-[2] py-2.5 text-sm disabled:opacity-50">
                {isResetting ? '처리 중...' : '초기화하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
