import { useEffect, useState } from 'react';
import { Search, Download, Filter } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { fetchAdminRecords } from '@/api/admin';
import { formatDate, formatKrw } from '@/utils/time';
import type { UsageRecord } from '@/types/admin';

const getSeatType = (n: number) => n <= 60 ? '일반석' : n <= 90 ? '프리미엄' : '1인실';
const getSeatColor = (n: number) =>
  n <= 60
    ? { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' }
    : n <= 90
    ? { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' }
    : { bg: 'bg-cyan-50',   text: 'text-cyan-600',   border: 'border-cyan-100' };

export const RecordsPage = () => {
  const [records, setRecords]   = useState<UsageRecord[]>([]);
  const [search, setSearch]     = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage]         = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchAdminRecords().then(setRecords).finally(() => setIsLoading(false));
  }, []);

  const filtered = records.filter(
    (r) => r.contact.includes(search) || String(r.seatNumber).includes(search)
  );

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalRevenue = filtered.reduce((s, r) => s + r.totalAmount, 0);

  const formatDur = (m: number) => {
    const h = Math.floor(m / 60), mm = m % 60;
    return h > 0 ? `${h}시간 ${mm > 0 ? `${mm}분` : ''}` : `${mm}분`;
  };

  return (
    <AdminLayout>
      <div className="p-6 flex flex-col gap-5">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900">이용자 기록</h1>
            <p className="text-gray-400 text-xs mt-0.5">
              총 {filtered.length}건 · 합계 {formatKrw(totalRevenue)}
            </p>
          </div>
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-400 text-sm cursor-not-allowed min-h-0"
          >
            <Download size={14} /> 엑셀 내보내기
          </button>
        </div>

        {/* 검색 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 flex-1 max-w-sm focus-within:border-orange-400 transition-colors">
            <Search size={15} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="연락처 또는 좌석 번호 검색"
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Filter size={13} />
            <span>{filtered.length}/{records.length}건</span>
          </div>
        </div>

        {/* 테이블 */}
        <div className="ad-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                {['날짜·시간', '좌석', '연락처', '이용 시간', '결제 금액'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-semibold text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">불러오는 중...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">기록이 없습니다.</td></tr>
              ) : (
                paginated.map((r) => {
                  const sc = getSeatColor(r.seatNumber);
                  return (
                    <tr key={r.recordId} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(r.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className="font-black text-gray-900">{r.seatNumber}번</span>
                        <span className={`ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>
                          {getSeatType(r.seatNumber)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{r.contact}</td>
                      <td className="px-4 py-3 text-gray-700 font-medium">{formatDur(r.usageDuration)}</td>
                      <td className="px-4 py-3">
                        <span className="font-black text-gray-900">{formatKrw(r.totalAmount)}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
              <span className="text-xs text-gray-400">{page} / {totalPages} 페이지</span>
              <div className="flex gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1 rounded-lg bg-white border border-gray-200 hover:border-orange-300 text-gray-500 text-xs disabled:opacity-40 min-h-0">
                  이전
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`px-3 py-1 rounded-lg text-xs min-h-0 font-semibold ${
                      page === p
                        ? 'text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-500 hover:border-orange-300'
                    }`}
                    style={page === p ? { backgroundColor: 'var(--kiosk-orange)' } : {}}
                  >
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1 rounded-lg bg-white border border-gray-200 hover:border-orange-300 text-gray-500 text-xs disabled:opacity-40 min-h-0">
                  다음
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
