import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, CreditCard, Armchair, MonitorX, Bell as BellIcon } from 'lucide-react';
import { Clock } from '@/components/common/Clock';
import { useNetworkStore } from '@/store/networkStore';

type Category = 'payment' | 'seat' | 'device' | 'staff';

interface CategoryOption {
  id: Category;
  icon: React.ReactNode;
  label: string;
  sub: string;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'payment', icon: <CreditCard size={22} className="text-orange-500" />, label: '결제 문의', sub: '결제가 정상적으로 진행되지 않았어요' },
  { id: 'seat', icon: <Armchair size={22} className="text-orange-500" />, label: '좌석 문의', sub: '좌석 상담 또는 이용 불편' },
  { id: 'device', icon: <MonitorX size={22} className="text-orange-500" />, label: '기기 오류', sub: '프린터로는 키오스크 오류' },
  { id: 'staff', icon: <BellIcon size={22} className="text-orange-500" />, label: '직원 호출', sub: '직접 도움 요청' },
];

export const CustomerServicePage = () => {
  const navigate = useNavigate();
  const isOnline = useNetworkStore((s) => s.isOnline);
  const [selected, setSelected] = useState<Category>('staff');
  const [called, setCalled] = useState(false);

  const handleCall = () => {
    setCalled(true);
    setTimeout(() => setCalled(false), 5000);
  };

  return (
    <div className="flex flex-col bg-[#F5F5F5]" style={{ minHeight: '100%' }}>
      {/* 헤더 */}
      <div className="bg-white px-3 py-2.5 flex items-center justify-between shadow-sm flex-shrink-0">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center min-h-0">
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <span className="text-sm font-black text-gray-900">고객센터 호출</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400"><Clock /></span>
          <Bell size={14} className="text-gray-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-3 py-5 flex flex-col gap-4">
        {/* 타이틀 */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🎧</span>
          </div>
          <p className="text-xl font-black text-gray-900">무엇을 도와드릴까요?</p>
          <p className="text-xs text-gray-400 mt-1">문제가 발생하면 직원이 빠르게 도와드릴게요.</p>
        </div>

        {/* 카테고리 그리드 */}
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selected === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelected(cat.id)}
                className="ki-card p-4 text-left border-2 transition-all min-h-0 flex flex-col gap-2"
                style={{ borderColor: isSelected ? 'var(--kiosk-orange)' : 'transparent', backgroundColor: isSelected ? '#FFF0E6' : 'white' }}
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                    {cat.icon}
                  </div>
                  {isSelected && (
                    <span className="text-[9px] text-white font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--kiosk-orange)' }}>선택됨</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{cat.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{cat.sub}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* 호출 상태 안내 */}
        {called && (
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ backgroundColor: '#FFF0E6' }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--kiosk-orange)' }} />
            <div>
              <p className="text-xs font-bold text-gray-800">직원이 호출되었습니다</p>
              <p className="text-[10px] text-gray-400">평균 응답 시간 1~2초</p>
            </div>
            <span className="ml-auto text-sm">🔔</span>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="bg-white border-t border-gray-100 px-3 pt-3 pb-3 flex flex-col gap-2 flex-shrink-0">
        <button onClick={handleCall} className="ki-btn-orange w-full text-sm flex items-center justify-center gap-2">
          <span>☎</span> 직원 호출하기
        </button>
        <button onClick={() => navigate('/kiosk')} className="ki-btn-gray w-full text-sm">
          메인 화면으로 이동
        </button>
        <div className="pt-1 flex items-center justify-between">
          <p className="text-[9px] text-gray-400">🌙 야간 무인 운영 안내: 22:00 - 09:00 (직원 지원 가능)</p>
        </div>
        <div className="flex justify-center gap-4">
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
            Network {isOnline ? 'OK' : 'FAIL'}
          </span>
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Kiosk OK
          </span>
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Server OK
          </span>
        </div>
      </div>
    </div>
  );
};
