import { NavLink, useNavigate } from 'react-router-dom';

import {
  LayoutDashboard, Users, BarChart3, Megaphone,
  AlertTriangle, Settings, LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import type { ReactNode } from 'react';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  superadminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/admin/dashboard', label: '대시보드',    icon: <LayoutDashboard size={17} /> },
  { to: '/admin/records',   label: '이용자 기록', icon: <Users size={17} /> },
  { to: '/admin/stats',     label: '이용 통계',   icon: <BarChart3 size={17} /> },
  { to: '/admin/notices',   label: '공지사항',    icon: <Megaphone size={17} /> },
  { to: '/admin/logs',      label: '오류 로그',   icon: <AlertTriangle size={17} /> },
  { to: '/admin/settings',  label: '시스템 설정', icon: <Settings size={17} /> },
];

interface AdminLayoutProps { children: ReactNode; }

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const { admin, logout } = useAuthStore();

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.superadminOnly || admin?.role === 'ROLE_SUPERADMIN'
  );

  return (
    <div className="flex h-full min-h-full bg-[#F5F5F5]">
      {/* 사이드바 */}
      <aside className="w-56 flex flex-col bg-white border-r border-gray-100 flex-shrink-0 shadow-sm">
        {/* 로고 */}
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-gray-100">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--kiosk-orange)' }}
          >
            <span className="text-white text-sm font-black">S</span>
          </div>
          <div>
            <p className="text-sm font-black text-gray-900 leading-none">스터디 오아시스</p>
            <p className="text-[10px] text-gray-400 mt-0.5">관리자 시스템</p>
          </div>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 py-3 px-2">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`
              }
              style={({ isActive }) =>
                isActive ? { backgroundColor: 'var(--kiosk-orange)' } : {}
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* 사용자 정보 + 로그아웃 */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-black" style={{ color: 'var(--kiosk-orange)' }}>
                {admin?.username?.[0]?.toUpperCase() ?? 'A'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{admin?.username ?? '-'}</p>
              <p className="text-[10px] font-bold" style={{ color: 'var(--kiosk-orange)' }}>
                {admin?.role === 'ROLE_SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 text-xs transition-colors w-full min-h-0"
          >
            <LogOut size={13} /> 로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  );
};
