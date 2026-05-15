import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, ChevronRight } from 'lucide-react';
import { Clock } from '@/components/common/Clock';

interface Notice {
  id: number;
  tag: string;
  tagColor: string;
  title: string;
  date: string;
  content: string;
  important: boolean;
}

const NOTICES: Notice[] = [
  {
    id: 1,
    tag: '중요',
    tagColor: 'var(--kiosk-orange)',
    title: '스터디 오아시스 이용 수칙 안내',
    date: '2026.05.20',
    content:
      '쾌적한 이용 환경을 위해 다음 사항을 꼭 지켜 주세요.\n\n' +
      '• 음식물 반입 금지 (밀봉된 음료 제외)\n' +
      '• 전화통화는 라운지 구역에서만 허용\n' +
      '• 퇴실 시 쓰레기 정리 및 의자 정돈\n' +
      '• 타인을 방해하는 소음 행위 금지\n\n' +
      '위반 시 이용이 제한될 수 있습니다.',
    important: true,
  },
  {
    id: 2,
    tag: '운영',
    tagColor: '#2563EB',
    title: '6월 운영 시간 변경 안내',
    date: '2026.05.28',
    content:
      '6월 1일부터 운영 시간이 아래와 같이 변경됩니다.\n\n' +
      '평일: 07:00 ~ 24:00\n' +
      '주말: 08:00 ~ 23:00\n' +
      '공휴일: 09:00 ~ 22:00\n\n' +
      '무인 운영 시간에는 키오스크로만 이용 가능합니다.',
    important: false,
  },
  {
    id: 3,
    tag: '공지',
    tagColor: '#059669',
    title: '프리미엄석 신규 오픈 안내',
    date: '2026.05.15',
    content:
      '편안한 공부 환경을 위해 프리미엄석 20석이 새로 오픈했습니다.\n\n' +
      '프리미엄석 특징:\n' +
      '• 전동 높낮이 조절 책상\n' +
      '• 노이즈캔슬링 파티션\n' +
      '• 멀티탭 및 USB 충전 포트\n\n' +
      '요금: 3,000원 / 1시간',
    important: false,
  },
  {
    id: 4,
    tag: '점검',
    tagColor: '#D97706',
    title: '키오스크 정기 점검 안내 (6/10)',
    date: '2026.06.01',
    content:
      '2026년 6월 10일 오전 06:00 ~ 08:00 사이 시스템 정기 점검이 예정되어 있습니다.\n\n' +
      '해당 시간에는 키오스크 예약이 일시 중단됩니다.\n' +
      '불편을 드려 대단히 죄송합니다.',
    important: false,
  },
];

export const KioskNoticesPage = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Notice | null>(null);

  if (selected) {
    return (
      <div className="flex flex-col bg-[#F5F5F5]" style={{ minHeight: '100%' }}>
        <div className="bg-white px-3 py-2.5 flex items-center justify-between shadow-sm flex-shrink-0">
          <button
            onClick={() => setSelected(null)}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center min-h-0"
          >
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
          <span className="text-sm font-black text-gray-900">공지사항</span>
          <span className="text-xs text-gray-400"><Clock /></span>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-none px-4 py-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] text-white font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: selected.tagColor }}
            >
              {selected.tag}
            </span>
            <span className="text-[10px] text-gray-400">{selected.date}</span>
          </div>
          <h2 className="text-lg font-black text-gray-900 leading-snug">{selected.title}</h2>
          <div className="h-px bg-gray-200" />
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{selected.content}</p>
        </div>

        <div className="bg-white border-t border-gray-100 px-3 pt-3 pb-3 flex-shrink-0">
          <button onClick={() => setSelected(null)} className="ki-btn-gray w-full text-sm">
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#F5F5F5]" style={{ minHeight: '100%' }}>
      {/* 헤더 */}
      <div className="bg-white px-3 py-2.5 flex items-center justify-between shadow-sm flex-shrink-0">
        <button
          onClick={() => navigate('/kiosk')}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center min-h-0"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <span className="text-sm font-black text-gray-900">공지사항</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400"><Clock /></span>
          <Bell size={14} className="text-gray-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-3 py-4 flex flex-col gap-2">
        {/* 중요 공지 배너 */}
        {NOTICES.filter((n) => n.important).map((n) => (
          <button
            key={n.id}
            onClick={() => setSelected(n)}
            className="w-full rounded-2xl p-4 text-left flex items-start gap-3 active:opacity-80 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #FF6D00 0%, #FF8C00 100%)' }}
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bell size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[9px] text-orange-200 font-bold bg-white/20 px-1.5 py-0.5 rounded-full">
                  {n.tag}
                </span>
                <span className="text-[10px] text-orange-200">{n.date}</span>
              </div>
              <p className="text-sm font-bold text-white leading-snug">{n.title}</p>
            </div>
            <ChevronRight size={16} className="text-white/60 flex-shrink-0 mt-1" />
          </button>
        ))}

        {/* 일반 공지 목록 */}
        {NOTICES.filter((n) => !n.important).map((n) => (
          <button
            key={n.id}
            onClick={() => setSelected(n)}
            className="w-full ki-card px-4 py-3 text-left flex items-center gap-3 hover:border-orange-200 active:bg-orange-50 transition-all border border-gray-100"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-[10px] font-black text-white"
              style={{ backgroundColor: n.tagColor }}
            >
              {n.tag[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800 truncate">{n.title}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{n.date}</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
          </button>
        ))}
      </div>

      <div className="bg-white border-t border-gray-100 px-3 py-2.5 flex-shrink-0">
        <p className="text-[10px] text-gray-400 text-center">
          총 {NOTICES.length}개의 공지사항이 있습니다
        </p>
      </div>
    </div>
  );
};
