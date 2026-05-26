import { useState } from 'react';
import { Clock, DollarSign, Bell, Info, Save, RotateCcw, Check, ShieldCheck } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAuthStore } from '@/store/authStore';

type Tab = 'hours' | 'pricing' | 'alerts' | 'system';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'hours',   label: '운영 시간',   icon: <Clock size={15} /> },
  { id: 'pricing', label: '좌석 요금',   icon: <DollarSign size={15} /> },
  { id: 'alerts',  label: '알림 설정',   icon: <Bell size={15} /> },
  { id: 'system',  label: '시스템 정보', icon: <Info size={15} /> },
];

/* ── 공통 컴포넌트 ── */
const Toggle = ({ value, onChange, label, sub }: {
  value: boolean; onChange: (v: boolean) => void; label: string; sub?: string;
}) => (
  <label className="flex items-center justify-between cursor-pointer select-none">
    <div>
      <p className="text-sm font-medium text-gray-800">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors min-h-0 flex-shrink-0 ml-3`}
      style={{ backgroundColor: value ? 'var(--kiosk-orange)' : '#E5E7EB' }}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </label>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-gray-500 text-xs font-semibold">{label}</label>
    {children}
  </div>
);

const TextInput = ({ value, onChange, suffix }: { value: string; onChange: (v: string) => void; suffix?: string }) => (
  <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:border-orange-400 transition-colors">
    <input
      type="text" value={value} onChange={(e) => onChange(e.target.value)}
      className="flex-1 px-4 py-2.5 bg-transparent text-gray-900 text-sm placeholder-gray-400 focus:outline-none"
    />
    {suffix && <span className="px-3 text-gray-400 text-sm border-l border-gray-100">{suffix}</span>}
  </div>
);

export const SettingsPage = () => {
  const admin = useAuthStore((s) => s.admin);
  const [tab, setTab]   = useState<Tab>('hours');
  const [saved, setSaved] = useState(false);

  const [weekdayOpen,  setWeekdayOpen]  = useState('06:00');
  const [weekdayClose, setWeekdayClose] = useState('24:00');
  const [weekendOpen,  setWeekendOpen]  = useState('08:00');
  const [weekendClose, setWeekendClose] = useState('22:00');
  const [is24h, setIs24h] = useState(false);

  const [generalPrice, setGeneralPrice] = useState('2000');
  const [premiumPrice, setPremiumPrice] = useState('3000');
  const [privatePrice, setPrivatePrice] = useState('4000');
  const [minDuration,  setMinDuration]  = useState('1');

  const [expireAlert10, setExpireAlert10] = useState(true);
  const [expireAlert30, setExpireAlert30] = useState(true);
  const [adminSlack,    setAdminSlack]    = useState(false);
  const [cashAlert,     setCashAlert]     = useState(true);
  const [cashThreshold, setCashThreshold] = useState('90');

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <AdminLayout>
      <div className="p-6 flex flex-col gap-5">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-gray-900">시스템 설정</h1>
          <div className="flex gap-2">
            <button
              onClick={() => {}}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-500 text-sm min-h-0 hover:border-gray-300 transition-all"
            >
              <RotateCcw size={13} /> 초기화
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all min-h-0 ${
                saved ? 'bg-green-500 text-white' : 'ad-btn-primary'
              }`}
            >
              {saved ? <><Check size={13} /> 저장됨</> : <><Save size={13} /> 설정 저장</>}
            </button>
          </div>
        </div>

        <div className="flex gap-5 items-start">
          {/* 탭 */}
          <div className="w-40 ad-card p-2 flex flex-col gap-0.5 flex-shrink-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all min-h-0 text-left ${
                  tab === t.id ? 'text-white' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
                style={tab === t.id ? { backgroundColor: 'var(--kiosk-orange)' } : {}}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* 패널 */}
          <div className="flex-1 min-w-0">

            {/* 운영 시간 */}
            {tab === 'hours' && (
              <div className="ad-card p-6 flex flex-col gap-5">
                <div>
                  <p className="font-bold text-gray-900 mb-0.5">운영 시간 설정</p>
                  <p className="text-gray-400 text-xs">키오스크에 표시되는 운영 시간을 설정합니다.</p>
                </div>
                <Toggle value={is24h} onChange={setIs24h} label="24시간 운영" sub="활성화 시 아래 설정이 무시됩니다" />
                <div className={`flex flex-col gap-4 ${is24h ? 'opacity-40 pointer-events-none' : ''}`}>
                  <div>
                    <p className="text-gray-500 text-xs font-semibold mb-2">평일 (월~금)</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="오픈 시간"><TextInput value={weekdayOpen} onChange={setWeekdayOpen} /></Field>
                      <Field label="마감 시간"><TextInput value={weekdayClose} onChange={setWeekdayClose} /></Field>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-semibold mb-2">주말·공휴일 (토~일)</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="오픈 시간"><TextInput value={weekendOpen} onChange={setWeekendOpen} /></Field>
                      <Field label="마감 시간"><TextInput value={weekendClose} onChange={setWeekendClose} /></Field>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-xs text-orange-700">
                  ℹ 운영 시간 외에는 키오스크에서 예약이 불가능합니다.
                </div>
              </div>
            )}

            {/* 요금 */}
            {tab === 'pricing' && (
              <div className="ad-card p-6 flex flex-col gap-5">
                <div>
                  <p className="font-bold text-gray-900 mb-0.5">좌석 요금 설정</p>
                  <p className="text-gray-400 text-xs">좌석 유형별 시간당 이용 요금을 설정합니다.</p>
                </div>
                {[
                  { label: '일반석',      sub: '좌석 1~60번',  color: 'var(--kiosk-orange)', value: generalPrice, set: setGeneralPrice },
                  { label: '프리미엄석',  sub: '좌석 61~90번', color: '#7C3AED', value: premiumPrice, set: setPremiumPrice },
                  { label: '1인 독립 부스', sub: '좌석 91~100번', color: '#0891B2', value: privatePrice, set: setPrivatePrice },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.sub}</p>
                    </div>
                    <div className="w-36">
                      <TextInput value={item.value} onChange={item.set} suffix="원/h" />
                    </div>
                  </div>
                ))}
                <Field label="최소 이용 시간">
                  <TextInput value={minDuration} onChange={setMinDuration} suffix="시간" />
                </Field>
              </div>
            )}

            {/* 알림 */}
            {tab === 'alerts' && (
              <div className="ad-card p-6 flex flex-col gap-5">
                <div>
                  <p className="font-bold text-gray-900 mb-0.5">알림 설정</p>
                  <p className="text-gray-400 text-xs">이용 만료 알림 및 관리자 알림 기준을 설정합니다.</p>
                </div>
                <div className="flex flex-col gap-5 divide-y divide-gray-100">
                  <div className="flex flex-col gap-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">이용 만료 알림</p>
                    <Toggle value={expireAlert10} onChange={setExpireAlert10} label="10분 전 알림" sub="이용 종료 10분 전 키오스크 팝업" />
                    <Toggle value={expireAlert30} onChange={setExpireAlert30} label="30분 전 알림" sub="이용 종료 30분 전 키오스크 팝업" />
                  </div>
                  <div className="pt-5 flex flex-col gap-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">관리자 알림</p>
                    <Toggle value={adminSlack} onChange={setAdminSlack} label="Slack 알림 연동" sub="오류 발생 시 Slack 채널로 전송" />
                  </div>
                  <div className="pt-5 flex flex-col gap-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">현금함 알림</p>
                    <Toggle value={cashAlert} onChange={setCashAlert} label="현금함 용량 경고" sub="임계값 초과 시 관리자 알림" />
                    <div className={cashAlert ? '' : 'opacity-40 pointer-events-none'}>
                      <Field label="경고 임계값 (%)">
                        <TextInput value={cashThreshold} onChange={setCashThreshold} suffix="%" />
                      </Field>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 시스템 정보 */}
            {tab === 'system' && (
              <div className="flex flex-col gap-4">
                <div className="ad-card p-6 flex flex-col gap-0">
                  <p className="font-bold text-gray-900 mb-4">시스템 정보</p>
                  {[
                    ['서비스 명',     '스터디 오아시스'],
                    ['프론트엔드',    'React 18 + Vite + TypeScript'],
                    ['UI 프레임워크', 'Tailwind CSS v4'],
                    ['상태 관리',     'Zustand'],
                    ['백엔드',        'Node.js + Express + TypeScript'],
                    ['실시간 통신',   'Socket.io (준비 중)'],
                    ['버전',          'v1.0.0-demo'],
                    ['빌드 날짜',     new Date().toLocaleDateString('ko-KR')],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                      <span className="text-gray-500 text-sm">{label}</span>
                      <span className="text-gray-800 text-sm font-medium">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="ad-card p-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={19} style={{ color: 'var(--kiosk-orange)' }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{admin?.username}</p>
                    <p className="text-xs font-bold" style={{ color: 'var(--kiosk-orange)' }}>
                      {admin?.role === 'ROLE_SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN'}
                    </p>
                  </div>
                  <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-semibold">
                    로그인 중
                  </span>
                </div>

                <div className="ad-card p-4 bg-orange-50 border border-orange-100">
                  <p className="font-bold text-orange-700 text-xs mb-1">⚠ 데모 모드 동작 중</p>
                  <p className="text-orange-600 text-xs leading-relaxed">
                    현재 백엔드 서버 없이 모의 데이터로 동작합니다.<br />
                    설정 변경은 새로고침 시 초기화됩니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
