import { useNavigate } from 'react-router-dom';
import { Monitor, ShieldCheck } from 'lucide-react';
import { Clock } from '@/components/common/Clock';

export const EntryPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 p-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-4">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <Clock />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">무인 스터디카페</h1>
        <p className="text-gray-400 mt-2 text-lg">좌석 예약 시스템</p>
      </div>

      {/* Role selection */}
      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg">
        <button
          onClick={() => navigate('/kiosk')}
          className="flex-1 flex flex-col items-center gap-4 rounded-3xl bg-blue-600 hover:bg-blue-500 active:scale-95 p-10 transition-all duration-150 shadow-2xl shadow-blue-600/40 group"
        >
          <Monitor size={52} className="text-blue-200 group-hover:scale-110 transition-transform" />
          <div className="text-center">
            <p className="text-2xl font-black text-white">사용자 화면</p>
            <p className="text-blue-200 text-sm mt-1">키오스크 · 좌석 예약</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/admin/login')}
          className="flex-1 flex flex-col items-center gap-4 rounded-3xl bg-gray-800 hover:bg-gray-700 active:scale-95 p-10 transition-all duration-150 shadow-xl border border-gray-700 group"
        >
          <ShieldCheck size={52} className="text-gray-400 group-hover:text-gray-300 group-hover:scale-110 transition-all" />
          <div className="text-center">
            <p className="text-2xl font-black text-gray-200">관리자 화면</p>
            <p className="text-gray-500 text-sm mt-1">운영 관리 · 통계</p>
          </div>
        </button>
      </div>

      <p className="mt-10 text-gray-600 text-sm">터치하여 시작하세요</p>
    </div>
  );
};
