import { Outlet } from 'react-router-dom';
import { ModeSwitcher } from '@/components/common/ModeSwitcher';

export const KioskShell = () => {
  return (
    <div className="min-h-screen bg-neutral-600 flex flex-col items-center justify-center py-6 gap-3">
      {/* 키오스크 단말기 프레임 */}
      <div
        className="relative bg-neutral-800 rounded-[36px] border-[5px] border-neutral-700 shadow-2xl shadow-black/60 flex flex-col overflow-hidden"
        style={{ width: 440, height: 880 }}
      >
        {/* 상단 베젤 */}
        <div className="flex-shrink-0 h-8 bg-neutral-800 flex items-center justify-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
          <div className="w-16 h-1 bg-neutral-700 rounded-full" />
        </div>

        {/* 스크린 */}
        <div className="flex-1 bg-[#F5F5F5] overflow-y-auto overflow-x-hidden scrollbar-none">
          <Outlet />
        </div>

        {/* 하단 베젤 */}
        <div className="flex-shrink-0 h-8 bg-neutral-800 flex items-center justify-center">
          <div className="w-12 h-1.5 bg-neutral-600 rounded-full" />
        </div>
      </div>

      <p className="text-neutral-500 text-xs">스터디 오아시스 · 키오스크 미리보기</p>

      {/* 모드 전환 버튼 */}
      <ModeSwitcher />
    </div>
  );
};
