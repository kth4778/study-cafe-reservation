import { useEffect, useState } from 'react';
import { TrendingUp, Users, DollarSign } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { fetchAdminStats } from '@/api/admin';
import { formatKrw } from '@/utils/time';
import type { StatPoint } from '@/types/admin';

type Period = 'daily' | 'weekly' | 'monthly';
const PERIOD_LABELS: Record<Period, string> = { daily: '일별', weekly: '주별', monthly: '월별' };

/* ── SVG 선 그래프 ── */
const LineChart = ({ data }: { data: StatPoint[] }) => {
  if (data.length === 0) return null;

  const W = 600;
  const H = 180;
  const PAD = { top: 20, right: 16, bottom: 32, left: 60 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...data.map((d) => d.revenue));
  const minVal = Math.min(...data.map((d) => d.revenue));
  const range  = maxVal - minVal || 1;

  const xOf = (i: number) => PAD.left + (i / (data.length - 1)) * innerW;
  const yOf = (v: number) => PAD.top + innerH - ((v - minVal) / range) * innerH;

  // polyline points
  const pts = data.map((d, i) => `${xOf(i)},${yOf(d.revenue)}`).join(' ');

  // area fill path
  const areaPath = [
    `M ${xOf(0)},${yOf(data[0].revenue)}`,
    ...data.slice(1).map((d, i) => `L ${xOf(i + 1)},${yOf(d.revenue)}`),
    `L ${xOf(data.length - 1)},${PAD.top + innerH}`,
    `L ${xOf(0)},${PAD.top + innerH}`,
    'Z',
  ].join(' ');

  // Y축 눈금 4개
  const yTicks = [0, 0.33, 0.66, 1].map((r) => minVal + r * range);

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  return (
    <div className="relative w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 180 }}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#FF6D00" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FF6D00" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y축 그리드 + 레이블 */}
        {yTicks.map((v, i) => {
          const y = yOf(v);
          return (
            <g key={i}>
              <line
                x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
                stroke="#F3F4F6" strokeWidth="1"
              />
              <text
                x={PAD.left - 6} y={y + 4}
                textAnchor="end" fontSize="9" fill="#9CA3AF"
              >
                {formatKrw(Math.round(v))}
              </text>
            </g>
          );
        })}

        {/* 영역 채우기 */}
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* 선 */}
        <polyline
          points={pts}
          fill="none"
          stroke="#FF6D00"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 호버 수직선 */}
        {hoverIdx !== null && (
          <line
            x1={xOf(hoverIdx)} y1={PAD.top}
            x2={xOf(hoverIdx)} y2={PAD.top + innerH}
            stroke="#FF6D00" strokeWidth="1" strokeDasharray="3 3" opacity="0.5"
          />
        )}

        {/* 데이터 포인트 + X 레이블 + 투명 히트존 */}
        {data.map((d, i) => {
          const x = xOf(i);
          const y = yOf(d.revenue);
          const isHov = hoverIdx === i;
          return (
            <g key={i}>
              {/* X 레이블 */}
              <text
                x={x} y={H - 4}
                textAnchor="middle" fontSize="9" fill="#9CA3AF"
              >
                {d.label}
              </text>

              {/* 점 */}
              <circle cx={x} cy={y} r={isHov ? 5 : 3.5}
                fill="white" stroke="#FF6D00"
                strokeWidth={isHov ? 2.5 : 2}
                style={{ transition: 'r 0.1s' }}
              />

              {/* 호버 툴팁 */}
              {isHov && (
                <g>
                  <rect
                    x={x - 38} y={y - 30}
                    width={76} height={22}
                    rx="6" fill="#1F2937"
                  />
                  <text
                    x={x} y={y - 15}
                    textAnchor="middle" fontSize="10"
                    fill="white" fontWeight="bold"
                  >
                    {formatKrw(d.revenue)}
                  </text>
                </g>
              )}

              {/* 히트존 */}
              <rect
                x={x - 16} y={PAD.top}
                width={32} height={innerH}
                fill="transparent"
                style={{ cursor: 'crosshair' }}
                onMouseEnter={() => setHoverIdx(i)}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* ── 메인 ── */
export const StatsPage = () => {
  const [period, setPeriod] = useState<Period>('daily');
  const [stats,  setStats]  = useState<StatPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchAdminStats(period).then(setStats).finally(() => setIsLoading(false));
  }, [period]);

  const totalRevenue = stats.reduce((s, p) => s + p.revenue, 0);
  const totalCount   = stats.reduce((s, p) => s + p.count,   0);
  const maxRevenue   = Math.max(...stats.map((s) => s.revenue), 1);
  const avgRevenue   = stats.length > 0 ? Math.round(totalRevenue / stats.length) : 0;

  return (
    <AdminLayout>
      <div className="p-6 flex flex-col gap-5">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-gray-900">이용 통계</h1>
          <div className="flex gap-1.5 bg-gray-100 rounded-xl p-1">
            {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all min-h-0 ${
                  period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="ad-card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
              <DollarSign size={17} className="text-green-600" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">총 매출</p>
              <p className="text-lg font-black text-gray-900">{formatKrw(totalRevenue)}</p>
            </div>
          </div>
          <div className="ad-card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
              <Users size={17} className="text-blue-600" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">총 이용 건수</p>
              <p className="text-lg font-black text-gray-900">{totalCount.toLocaleString()}건</p>
            </div>
          </div>
          <div className="ad-card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={17} style={{ color: 'var(--kiosk-orange)' }} />
            </div>
            <div>
              <p className="text-gray-400 text-xs">평균 매출</p>
              <p className="text-lg font-black text-gray-900">{formatKrw(avgRevenue)}</p>
            </div>
          </div>
        </div>

        {/* 선 그래프 카드 */}
        <div className="ad-card p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-bold text-gray-700">매출 추이</p>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-6 h-0.5 rounded-full inline-block" style={{ backgroundColor: 'var(--kiosk-orange)' }} />
              매출 (원)
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-44 text-gray-400">불러오는 중...</div>
          ) : stats.length === 0 ? (
            <div className="flex items-center justify-center h-44 text-gray-400">데이터 없음</div>
          ) : (
            <LineChart data={stats} />
          )}
        </div>

        {/* 상세 표 */}
        {!isLoading && stats.length > 0 && (
          <div className="ad-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {['기간', '이용 건수', '매출', '비율'].map((h) => (
                    <th key={h} className={`py-3 px-4 font-semibold text-xs text-gray-500 ${h !== '기간' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.map((s, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                    <td className="py-2.5 px-4 text-gray-700 font-medium">{s.label}</td>
                    <td className="py-2.5 px-4 text-right text-gray-900 font-semibold">{s.count}건</td>
                    <td className="py-2.5 px-4 text-right font-black text-gray-900">{formatKrw(s.revenue)}</td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${Math.round((s.revenue / maxRevenue) * 100)}%`, backgroundColor: 'var(--kiosk-orange)' }}
                          />
                        </div>
                        <span className="text-gray-400 text-xs w-8 text-right">
                          {Math.round((s.revenue / totalRevenue) * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td className="py-2.5 px-4 text-gray-500 font-bold text-xs">합계</td>
                  <td className="py-2.5 px-4 text-right text-gray-900 font-black">{totalCount}건</td>
                  <td className="py-2.5 px-4 text-right font-black text-gray-900">{formatKrw(totalRevenue)}</td>
                  <td className="py-2.5 px-4 text-right text-gray-400 text-xs">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
