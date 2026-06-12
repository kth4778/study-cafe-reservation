import { useNavigate } from 'react-router-dom';
import { ChevronRight, Armchair, Bell, Wifi, Coffee, Settings, ClipboardList, Clock3, Sparkles, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Clock } from '@/components/common/Clock';
import { useSeatStore } from '@/store/seatStore';
import { useReservationStore } from '@/store/reservationStore';
import { useEffect, useCallback, useState } from 'react';
import { fetchSeats } from '@/api/seats';
import { useWebSocket } from '@/hooks/useWebSocket';

interface NoticeSlide {
  tag: string;
  tagBg: string;
  tagColor: string;
  title: string;
  preview: string;
  date: string;
  Icon: LucideIcon;
}

const NOTICE_SLIDES: NoticeSlide[] = [
  {
    tag: '중요',
    tagBg: '#FEE2E2',
    tagColor: '#DC2626',
    title: '스터디 오아시스 이용 수칙 안내',
    preview: '음식물 반입 금지 · 전화통화 라운지만 허용 · 소음 행위 금지',
    date: '2026.05.20',
    Icon: ClipboardList,
  },
  {
    tag: '운영',
    tagBg: '#DBEAFE',
    tagColor: '#2563EB',
    title: '6월 운영 시간 변경 안내',
    preview: '6월 1일부터 평일 07:00~24:00, 주말 08:00~23:00으로 변경',
    date: '2026.05.28',
    Icon: Clock3,
  },
  {
    tag: '공지',
    tagBg: '#D1FAE5',
    tagColor: '#059669',
    title: '프리미엄석 신규 오픈 안내',
    preview: '전동 높낮이 조절 책상 · 노이즈캔슬링 파티션 · 3,000원/시간',
    date: '2026.05.15',
    Icon: Sparkles,
  },
  {
    tag: '점검',
    tagBg: '#FEF3C7',
    tagColor: '#D97706',
    title: '키오스크 정기 점검 안내 (6/10)',
    preview: '6월 10일 06:00~08:00 시스템 점검 · 예약 일시 중단',
    date: '2026.06.01',
    Icon: Wrench,
  },
];

interface NoticeIllustrationProps {
  Icon: LucideIcon;
  color: string;
  bgColor: string;
}

const NoticeIllustration = ({ Icon, color, bgColor }: NoticeIllustrationProps) => (
  <div className="relative flex items-center justify-center w-full h-full">
    {/* 배경 후광 */}
    <div
      className="absolute rounded-full"
      style={{ width: 110, height: 110, backgroundColor: color, opacity: 0.08 }}
    />
    <div
      className="absolute rounded-full"
      style={{ width: 80, height: 80, backgroundColor: color, opacity: 0.12 }}
    />
    {/* 아이콘 컨테이너 */}
    <div
      className="relative flex items-center justify-center rounded-3xl shadow-sm"
      style={{ width: 60, height: 60, backgroundColor: bgColor }}
    >
      <Icon size={30} style={{ color }} strokeWidth={1.8} />
    </div>
  </div>
);

export const KioskHomePage = () => {
  const navigate = useNavigate();
  const { seats, setSeats, setLoading } = useSeatStore();
  const { setCurrentReservation } = useReservationStore();
  const [slideIndex, setSlideIndex] = useState(0);

  useWebSocket();

  const loadSeats = useCallback(async () => {
    setLoading(true);
    try { setSeats(await fetchSeats()); } catch { /* offline */ } finally { setLoading(false); }
  }, [setSeats, setLoading]);

  useEffect(() => { loadSeats(); }, [loadSeats]);

  useEffect(() => {
    const id = setInterval(() => setSlideIndex((i) => (i + 1) % NOTICE_SLIDES.length), 4000);
    return () => clearInterval(id);
  }, []);

  const available = seats.filter((s) => s.status === 'available').length;
  const total = seats.length || 100;
  const slide = NOTICE_SLIDES[slideIndex];

  const handleUsageStatus = () => {
    setCurrentReservation(null);
    navigate('/kiosk/lookup', { state: { next: '/kiosk/usage' } });
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F5F5]">
      {/* 상단바 */}
      <div className="bg-white px-4 py-2.5 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: 'var(--kiosk-orange)' }}>
            <span className="text-white text-[8px] font-black">S</span>
          </div>
          <span className="text-xs font-bold text-gray-700">오아시스·SG</span>
        </div>
        <button
          onClick={() => navigate('/kiosk/notices')}
          className="flex items-center gap-1 text-gray-500 text-xs hover:text-gray-700 min-h-0"
        >
          <Bell size={14} />
          공지사항
        </button>
      </div>

      {/* 브랜드 + 시계 */}
      <div className="text-center pt-4 pb-3 flex-shrink-0">
        <p className="text-sm font-semibold text-gray-500 mb-1">스터디 오아시스</p>
        <div className="text-5xl font-black text-gray-900 tracking-tight leading-none">
          <Clock />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
      </div>

      {/* 예약하기 CTA */}
      <div className="px-4 mb-3 flex-shrink-0">
        <button
          onClick={() => navigate('/kiosk/seats')}
          className="w-full rounded-2xl p-4 flex items-center justify-between active:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, var(--kiosk-orange) 0%, #FF8C00 100%)' }}
        >
          <div className="text-left">
            <p className="text-[10px] text-orange-100 font-medium mb-0.5">⭐ 바로 예약 가능</p>
            <p className="text-xl font-black text-white">좌석 예약하기</p>
            <p className="text-xs text-orange-100 mt-0.5">조용하고 쾌적한 나만의 공간</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Armchair size={28} className="text-white" />
          </div>
        </button>
      </div>

      {/* 이용 현황 확인 */}
      <div className="px-4 mb-3 flex-shrink-0">
        <button
          onClick={handleUsageStatus}
          className="w-full bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm border border-gray-100 hover:border-orange-200 active:bg-orange-50 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
            <Armchair size={22} className="text-orange-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-gray-800">이용 현황 확인</p>
            <p className="text-xs text-gray-400 mt-0.5">시간 연장 · 자리이동 · 퇴실하기</p>
          </div>
          <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
        </button>
      </div>

      {/* 공지사항 캐러셀 */}
      <div className="px-4 flex flex-col gap-2 flex-1 min-h-0">
        <button
          onClick={() => navigate('/kiosk/notices')}
          className="ki-card w-full flex flex-col text-left hover:border-orange-200 active:bg-orange-50 transition-all flex-1 overflow-hidden"
        >
          {/* 상단: 태그 + 날짜 + 더보기 */}
          <div className="flex items-center justify-between px-4 pt-3">
            <div className="flex items-center gap-2">
              <Bell size={12} className="text-gray-400" />
              <span
                className="text-[9px] font-black px-2 py-0.5 rounded-full"
                style={{ backgroundColor: slide.tagBg, color: slide.tagColor }}
              >
                {slide.tag}
              </span>
              <span className="text-[9px] text-gray-400">{slide.date}</span>
            </div>
            <div className="flex items-center gap-0.5 text-gray-400 text-[9px]">
              <span>더보기</span>
              <ChevronRight size={10} />
            </div>
          </div>

          {/* 중앙: 일러스트 */}
          <div className="flex-1 flex items-center justify-center py-2">
            <NoticeIllustration
              Icon={slide.Icon}
              color={slide.tagColor}
              bgColor={slide.tagBg}
            />
          </div>

          {/* 하단: 텍스트 */}
          <div className="px-4 pb-3 text-center">
            <div className="h-px bg-gray-100 mb-2.5" />
            <p className="text-sm font-black text-gray-900 leading-snug">{slide.title}</p>
            <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{slide.preview}</p>

            {/* 인디케이터 */}
            <div className="flex justify-center gap-1.5 mt-2.5">
              {NOTICE_SLIDES.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === slideIndex ? 14 : 5,
                    height: 5,
                    backgroundColor: i === slideIndex ? 'var(--kiosk-orange)' : '#D1D5DB',
                  }}
                />
              ))}
            </div>
          </div>
        </button>

        {/* Wi-Fi + 운영시간 */}
        <div className="grid grid-cols-2 gap-2 flex-shrink-0">
          <div className="bg-white rounded-2xl px-3 py-2 flex items-center gap-2 border border-gray-100 shadow-sm">
            <div className="w-7 h-7 rounded-lg bg-cyan-50 flex items-center justify-center flex-shrink-0">
              <Wifi size={14} className="text-cyan-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-800">무료 Wi-Fi</p>
              <p className="text-[9px] text-gray-400 leading-tight">ID: oasis_free · PW: 1234</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl px-3 py-2 flex items-center gap-2 border border-gray-100 shadow-sm">
            <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Coffee size={14} className="text-orange-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-800">운영 시간</p>
              <p className="text-[9px] text-gray-400 leading-tight">평일 06~24 · 주말 08~22</p>
            </div>
          </div>
        </div>
      </div>

      {/* 하단: 좌석 현황 + 관리자 전환 */}
      <div className="bg-white border-t border-gray-100 px-4 py-2 flex items-center justify-between flex-shrink-0 mt-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">이용 가능 좌석</span>
          <span className="text-sm font-black" style={{ color: 'var(--kiosk-orange)' }}>{available}석</span>
          <span className="text-xs text-gray-400">/ {total}석</span>
        </div>
        <button
          onClick={() => navigate('/admin/login')}
          className="flex items-center gap-1 text-[10px] text-gray-300 hover:text-gray-500 transition-colors min-h-0"
        >
          <Settings size={11} />
          관리자
        </button>
      </div>
    </div>
  );
};
