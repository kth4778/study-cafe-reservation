import { useSeatStore } from '@/store/seatStore';
import { SEAT_TYPE_LABELS } from '@/constants/config';
import type { Seat, SeatTypeFilter } from '@/types/seat';

interface SeatGridProps {
  selectedSeat: Seat | null;
  onSeatClick: (seat: Seat) => void;
}

const FILTER_TABS: SeatTypeFilter[] = ['all', 'general', 'premium', 'private'];

/* ── 상태 → 색상 (2가지만) ── */
const canBook = (s: Seat) => s.status === 'available';

const bg = (s: Seat, sel: boolean) => {
  if (sel) return '#FFFFFF';
  return canBook(s) ? '#FFD5BD' : '#E5E7EB';
};
const fg = (s: Seat, sel: boolean) => {
  if (sel) return 'var(--kiosk-orange)';
  return canBook(s) ? '#B84B0A' : '#9CA3AF';
};

/* ── 개별 좌석 버튼 ── */
const SeatBtn = ({
  seat, sel, onClick,
}: { seat: Seat; sel: boolean; onClick: (s: Seat) => void }) => (
  <button
    onClick={() => canBook(seat) && onClick(seat)}
    disabled={!canBook(seat)}
    className="w-7 h-7 rounded flex items-center justify-center transition-all min-h-0 disabled:cursor-default active:scale-90 flex-shrink-0"
    style={{
      backgroundColor: bg(seat, sel),
      border: sel ? '2px solid #FF6D00' : '1px solid rgba(0,0,0,0.07)',
      color: fg(seat, sel),
    }}
  >
    <span className="text-[7.5px] font-black leading-none select-none">
      {String(seat.seatNumber).padStart(2, '0')}
    </span>
  </button>
);

/* ── 테이블 유닛 (2좌석 묶음) ── */
const TablePair = ({
  a, b, sel, onClick,
}: { a: Seat; b?: Seat; sel: Seat | null; onClick: (s: Seat) => void }) => (
  <div className="inline-flex gap-px bg-stone-300/50 rounded-[5px] p-[2px] flex-shrink-0">
    <SeatBtn seat={a} sel={sel?.seatId === a.seatId} onClick={onClick} />
    {b && <SeatBtn seat={b} sel={sel?.seatId === b.seatId} onClick={onClick} />}
  </div>
);

/* ── 1인실 부스 유닛 ── */
const Booth = ({
  seat, sel, onClick,
}: { seat: Seat; sel: Seat | null; onClick: (s: Seat) => void }) => (
  <div className="inline-flex bg-slate-100 border border-slate-200 rounded-[5px] p-[2px] flex-shrink-0">
    <SeatBtn seat={seat} sel={sel?.seatId === seat.seatId} onClick={onClick} />
  </div>
);

/* ── 한 행 렌더링 ── */
const Row = ({
  rowSeats, sel, onClick, isPaired,
}: { rowSeats: Seat[]; sel: Seat | null; onClick: (s: Seat) => void; isPaired: boolean }) => {
  if (!isPaired) {
    return (
      <div className="flex gap-1.5">
        {rowSeats.map((s) => <Booth key={s.seatId} seat={s} sel={sel} onClick={onClick} />)}
      </div>
    );
  }
  const pairs: [Seat, Seat?][] = [];
  for (let i = 0; i < rowSeats.length; i += 2) pairs.push([rowSeats[i], rowSeats[i + 1]]);
  return (
    <div className="flex gap-1.5">
      {pairs.map((p, pi) => <TablePair key={pi} a={p[0]} b={p[1]} sel={sel} onClick={onClick} />)}
    </div>
  );
};

/* ── 통로 ── */
const Aisle = () => (
  <div className="flex items-center gap-1.5 my-0.5">
    <div className="flex-1 border-t border-dashed border-gray-200" />
    <span className="text-[8px] text-gray-300 tracking-widest font-medium">통 로</span>
    <div className="flex-1 border-t border-dashed border-gray-200" />
  </div>
);

/* ── 구역 헤더 ── */
const ZoneLabel = ({
  label, price, color, avail, total,
}: { label: string; price: string; color: string; avail: number; total: number }) => (
  <div className="flex items-center gap-1.5 mb-1.5">
    <span className="text-[9px] text-white font-black px-1.5 py-[2px] rounded-full flex-shrink-0" style={{ backgroundColor: color }}>
      {label}
    </span>
    <span className="text-[9px] text-gray-400 flex-shrink-0">{price}</span>
    <div className="flex-1 h-px bg-gray-200 min-w-0" />
    <span className="text-[9px] text-gray-400 flex-shrink-0">{avail}/{total}</span>
  </div>
);

/* ── 유틸: 배열 청크 ── */
const chunk = <T,>(arr: T[], n: number): T[][] => {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += n) res.push(arr.slice(i, i + n));
  return res;
};

/* ── 단일 타입 필터 뷰 ── */
const SimpleView = ({
  seats, sel, onClick, pairsPerRow, isPaired,
}: { seats: Seat[]; sel: Seat | null; onClick: (s: Seat) => void; pairsPerRow: number; isPaired: boolean }) => {
  const rows = chunk(seats, pairsPerRow * (isPaired ? 2 : 1));
  return (
    <div className="flex flex-col gap-1.5">
      {rows.map((row, ri) => (
        <div key={ri}>
          <Row rowSeats={row} sel={sel} onClick={onClick} isPaired={isPaired} />
          {(ri + 1) % 2 === 0 && ri < rows.length - 1 && <Aisle />}
        </div>
      ))}
    </div>
  );
};

/* ══════════════ 메인 ══════════════ */
export const SeatGrid = ({ selectedSeat, onSeatClick }: SeatGridProps) => {
  const { seats, typeFilter, isLoading, setTypeFilter } = useSeatStore();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  const sorted = [...seats].sort((a, b) => a.seatNumber - b.seatNumber);
  const general = sorted.filter((s) => s.type === 'general');
  const premium = sorted.filter((s) => s.type === 'premium');
  const priv    = sorted.filter((s) => s.type === 'private');

  /* 창가석: 일반석 앞 20개 / 중앙: 나머지 */
  const genTop = general.slice(0, 20);
  const genMid = general.slice(20);

  const avail = (arr: Seat[]) => arr.filter(canBook).length;

  const displaySeats =
    typeFilter === 'all'     ? sorted   :
    typeFilter === 'general' ? general  :
    typeFilter === 'premium' ? premium  : priv;

  return (
    <div className="flex flex-col gap-3">
      {/* 필터 탭 */}
      <div className="flex gap-1.5">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setTypeFilter(tab)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap min-h-0 ${
              typeFilter === tab ? 'ki-tab-active' : 'ki-tab-inactive'
            }`}
          >
            {SEAT_TYPE_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* ── 전체 보기: ㄱ자 배치도 ── */}
      {typeFilter === 'all' ? (
        <div className="flex flex-col gap-2">

          {/* 1. 상단 창가석 (전체 너비) */}
          {genTop.length > 0 && (
            <div>
              <ZoneLabel label="일반석" price="2,000원/h" color="#FF6D00"
                avail={avail(general)} total={general.length} />
              <div className="flex flex-col gap-1.5">
                {chunk(genTop, 10).map((row, ri) => (
                  <Row key={ri} rowSeats={row} sel={selectedSeat} onClick={onSeatClick} isPaired />
                ))}
              </div>
              <div className="border-b border-dashed border-gray-200 mt-2 mb-1" />
            </div>
          )}

          {/* 2. 중앙 ㄱ자 구조 */}
          <div className="flex gap-2 items-start">

            {/* 왼쪽: 일반석 (아래로 길게 — ㄱ의 세로 막대) */}
            {genMid.length > 0 && (
              <div className="flex flex-col gap-1.5 flex-shrink-0" style={{ width: 140 }}>
                {chunk(genMid, 4).map((row, ri) => (
                  <div key={ri}>
                    <Row rowSeats={row} sel={selectedSeat} onClick={onSeatClick} isPaired />
                    {(ri + 1) % 4 === 0 && ri < chunk(genMid, 4).length - 1 && <Aisle />}
                  </div>
                ))}
              </div>
            )}

            {/* 오른쪽: 프리미엄 + 1인실 (짧게 끝남 — ㄱ의 빈 공간) */}
            <div className="flex flex-col gap-3 flex-1 min-w-0">
              {premium.length > 0 && (
                <div>
                  <ZoneLabel label="프리미엄석" price="3,000원/h" color="#7C3AED"
                    avail={avail(premium)} total={premium.length} />
                  <div className="flex flex-col gap-1.5">
                    {chunk(premium, 6).map((row, ri) => (
                      <div key={ri}>
                        <Row rowSeats={row} sel={selectedSeat} onClick={onSeatClick} isPaired />
                        {(ri + 1) % 3 === 0 && ri < chunk(premium, 6).length - 1 && <Aisle />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {priv.length > 0 && (
                <div>
                  <ZoneLabel label="1인실" price="4,000원/h" color="#0891B2"
                    avail={avail(priv)} total={priv.length} />
                  <div className="flex flex-col gap-1.5">
                    {chunk(priv, 5).map((row, ri) => (
                      <Row key={ri} rowSeats={row} sel={selectedSeat} onClick={onSeatClick} isPaired={false} />
                    ))}
                  </div>
                </div>
              )}

              {/* 빈 공간 표시 (카운터/입구) — ㄱ자 하단 우측 여백 */}
              <div
                className="flex items-center justify-center rounded-xl border border-dashed border-gray-200 mt-1"
                style={{ minHeight: 48 }}
              >
                <span className="text-[10px] text-gray-300 font-medium tracking-wide">COUNTER / 입구</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── 단일 타입 필터 뷰 ── */
        <div className="flex flex-col gap-2">
          {typeFilter === 'general' && general.length > 0 && (
            <div>
              <ZoneLabel label="일반석" price="2,000원/h" color="#FF6D00"
                avail={avail(general)} total={general.length} />
              <SimpleView seats={general} sel={selectedSeat} onClick={onSeatClick} pairsPerRow={5} isPaired />
            </div>
          )}
          {typeFilter === 'premium' && premium.length > 0 && (
            <div>
              <ZoneLabel label="프리미엄석" price="3,000원/h" color="#7C3AED"
                avail={avail(premium)} total={premium.length} />
              <SimpleView seats={premium} sel={selectedSeat} onClick={onSeatClick} pairsPerRow={3} isPaired />
            </div>
          )}
          {typeFilter === 'private' && priv.length > 0 && (
            <div>
              <ZoneLabel label="1인실" price="4,000원/h" color="#0891B2"
                avail={avail(priv)} total={priv.length} />
              <SimpleView seats={priv} sel={selectedSeat} onClick={onSeatClick} pairsPerRow={5} isPaired={false} />
            </div>
          )}
        </div>
      )}

      {/* 범례 (2가지만) */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-[3px] flex-shrink-0" style={{ backgroundColor: '#FFD5BD', border: '1px solid rgba(0,0,0,0.08)' }} />
          <span className="text-[10px] text-gray-500 font-medium">이용 가능</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-[3px] flex-shrink-0" style={{ backgroundColor: '#E5E7EB', border: '1px solid rgba(0,0,0,0.08)' }} />
          <span className="text-[10px] text-gray-500 font-medium">이용 불가</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-[3px] bg-white flex-shrink-0" style={{ border: '2px solid #FF6D00' }} />
          <span className="text-[10px] text-gray-500 font-medium">선택됨</span>
        </div>
        <div className="flex-1 text-right">
          <span className="text-[10px] text-gray-400">
            가능 {avail(displaySeats)}/{displaySeats.length}석
          </span>
        </div>
      </div>
    </div>
  );
};
