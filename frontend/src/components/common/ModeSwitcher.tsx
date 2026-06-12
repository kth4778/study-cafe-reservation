import { useNavigate, useLocation } from 'react-router-dom';
import { MonitorSmartphone, Tablet } from 'lucide-react';

export const ModeSwitcher = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isKiosk = pathname.startsWith('/kiosk');

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
      <button
        onClick={() => navigate('/kiosk')}
        className="flex flex-col items-center gap-1.5 px-4 py-4 rounded-2xl text-xs font-bold transition-all shadow-xl"
        style={
          isKiosk
            ? { backgroundColor: 'var(--kiosk-orange)', color: '#fff' }
            : { backgroundColor: 'rgba(30,30,30,0.75)', color: '#bbb', backdropFilter: 'blur(6px)' }
        }
      >
        <Tablet size={20} />
        사용자
      </button>
      <button
        onClick={() => navigate('/admin/dashboard')}
        className="flex flex-col items-center gap-1.5 px-4 py-4 rounded-2xl text-xs font-bold transition-all shadow-xl"
        style={
          !isKiosk
            ? { backgroundColor: 'var(--kiosk-orange)', color: '#fff' }
            : { backgroundColor: 'rgba(30,30,30,0.75)', color: '#bbb', backdropFilter: 'blur(6px)' }
        }
      >
        <MonitorSmartphone size={20} />
        관리자
      </button>
    </div>
  );
};
