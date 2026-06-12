import { Outlet } from 'react-router-dom';
import { ModeSwitcher } from '@/components/common/ModeSwitcher';

export const AdminShell = () => {
  return (
    <div className="min-h-screen bg-neutral-700 flex items-center justify-center py-6 px-20">
      {/* PC 모니터 프레임 */}
      <div className="flex flex-col items-center gap-2 w-full" style={{ maxWidth: 'calc(100vw - 200px)' }}>
        {/* 모니터 본체 */}
        <div
          className="relative bg-neutral-900 rounded-2xl border-4 border-neutral-800 shadow-2xl shadow-black/70 flex flex-col overflow-hidden w-full"
          style={{ height: 'calc(100vh - 120px)' }}
        >
          {/* 상단 OS 크롬 바 */}
          <div className="flex-shrink-0 h-8 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" />
              <div className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-neutral-800 rounded-md px-6 py-0.5 text-[10px] text-neutral-400">
                스터디 오아시스 · 관리자 시스템
              </div>
            </div>
          </div>

          {/* 화면 콘텐츠 */}
          <div className="flex-1 bg-[#F5F5F5] overflow-auto">
            <Outlet />
          </div>
        </div>

        {/* 스탠드 */}
        <div className="w-24 h-3 bg-neutral-800 rounded-full" />
        <div className="w-40 h-2 bg-neutral-900 rounded-full" />

        <p className="text-neutral-500 text-xs mt-0.5">스터디 오아시스 · 관리자 미리보기</p>
      </div>

      {/* 모드 전환 버튼 */}
      <ModeSwitcher />
    </div>
  );
};
