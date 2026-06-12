import { useEffect, useState } from 'react';
import { AlertTriangle, AlertCircle, Info, RefreshCw, Trash2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { fetchAdminLogs } from '@/api/admin';
import { formatDate, formatTime } from '@/utils/time';
import type { ErrorLog, LogSeverity } from '@/types/admin';

const SEVERITY_FILTERS: Array<LogSeverity | 'ALL'> = ['ALL', 'CRITICAL', 'ERROR', 'WARN'];

const SEV_STYLE: Record<LogSeverity, {
  bg: string; text: string; border: string; badgeBg: string; badgeText: string; icon: React.ReactNode;
}> = {
  CRITICAL: {
    bg: 'bg-red-50', text: 'text-red-600', border: 'border-l-red-500',
    badgeBg: 'bg-red-100', badgeText: 'text-red-700',
    icon: <AlertCircle size={14} />,
  },
  ERROR: {
    bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-l-orange-500',
    badgeBg: 'bg-orange-100', badgeText: 'text-orange-700',
    icon: <AlertTriangle size={14} />,
  },
  WARN: {
    bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-l-yellow-400',
    badgeBg: 'bg-yellow-100', badgeText: 'text-yellow-800',
    icon: <Info size={14} />,
  },
};

const FILTER_ACTIVE: Record<LogSeverity | 'ALL', string> = {
  ALL:      'bg-gray-700 text-white',
  CRITICAL: 'bg-red-500 text-white',
  ERROR:    'bg-orange-500 text-white',
  WARN:     'bg-yellow-500 text-white',
};

export const ErrorLogPage = () => {
  const [allLogs, setAllLogs] = useState<ErrorLog[]>([]);
  const [filter, setFilter]   = useState<LogSeverity | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const load = () => {
    setIsLoading(true);
    fetchAdminLogs().then(setAllLogs).finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'ALL' ? allLogs : allLogs.filter((l) => l.severity === filter);

  const counts = {
    ALL:      allLogs.length,
    CRITICAL: allLogs.filter((l) => l.severity === 'CRITICAL').length,
    ERROR:    allLogs.filter((l) => l.severity === 'ERROR').length,
    WARN:     allLogs.filter((l) => l.severity === 'WARN').length,
  };

  return (
    <AdminLayout>
      <div className="p-6 flex flex-col gap-5">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900">오류 로그</h1>
            <p className="text-gray-400 text-xs mt-0.5">총 {allLogs.length}건</p>
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

        {/* 필터 탭 */}
        <div className="flex gap-2">
          {SEVERITY_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-0 ${
                filter === s ? FILTER_ACTIVE[s] : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {s}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                filter === s ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {counts[s]}
              </span>
            </button>
          ))}
        </div>

        {/* 로그 목록 */}
        <div className="flex flex-col gap-2">
          {isLoading ? (
            <div className="ad-card flex items-center justify-center py-12 text-gray-400">불러오는 중...</div>
          ) : filtered.length === 0 ? (
            <div className="ad-card flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
              <AlertCircle size={24} />
              <p className="text-sm">해당 로그가 없습니다.</p>
            </div>
          ) : (
            filtered.map((log) => {
              const s = SEV_STYLE[log.severity];
              return (
                <div
                  key={log.logId}
                  className={`ad-card p-4 border-l-4 ${s.bg} ${s.border}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 flex-shrink-0 ${s.text}`}>{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${s.badgeBg} ${s.badgeText}`}>
                          {log.severity}
                        </span>
                        <span className="text-gray-400 font-mono text-xs">{log.errorCode}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{log.module}</span>
                        <span className="ml-auto text-xs text-gray-400">
                          {formatDate(log.createdAt)} {formatTime(log.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-800 text-sm font-medium">{log.message}</p>
                    </div>
                    <button
                      onClick={() => setAllLogs((prev) => prev.filter((l) => l.logId !== log.logId))}
                      className={`flex-shrink-0 min-h-0 transition-colors ${s.text} opacity-40 hover:opacity-100`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
