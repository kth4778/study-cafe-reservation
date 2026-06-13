import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, AlertCircle, KeyRound, ChevronRight } from 'lucide-react';
import { adminLogin } from '@/api/admin';
import { useAuthStore } from '@/store/authStore';

type LoginStep = 'credentials' | 'otp';

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [step, setStep] = useState<LoginStep>('credentials');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin1234');
  const [otp, setOtp] = useState('000000');
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failCount, setFailCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const handleCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { setError('아이디와 비밀번호를 입력해 주세요.'); return; }
    setError(null);
    setStep('otp');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { setError('6자리 OTP 코드를 입력해 주세요.'); return; }
    setIsLoading(true);
    setError(null);
    try {
      const { token, admin } = await adminLogin({ username, password, otp });
      setAuth(token, admin);
      navigate('/admin/dashboard');
    } catch {
      const newCount = failCount + 1;
      setFailCount(newCount);
      if (newCount >= 5) {
        setIsLocked(true);
        setError('로그인 5회 실패로 계정이 30분간 잠금됩니다.');
        setTimeout(() => { setIsLocked(false); setFailCount(0); }, 30 * 60 * 1000);
      } else {
        setError(`인증에 실패했습니다. (${newCount}/5)`);
      }
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex bg-[#F5F5F5]">
      {/* 좌측 브랜드 패널 */}
      <div
        className="hidden lg:flex w-80 flex-col items-center justify-center p-10 flex-shrink-0"
        style={{ background: 'linear-gradient(160deg, #FF6D00 0%, #FF8C00 100%)' }}
      >
        <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center mb-5">
          <span className="text-white text-3xl font-black">S</span>
        </div>
        <p className="text-white text-2xl font-black text-center leading-snug">스터디 오아시스</p>
        <p className="text-orange-100 text-sm mt-2 text-center">운영 관리 시스템</p>
        <div className="mt-10 flex flex-col gap-3 w-full">
          {['실시간 좌석 현황 모니터링', '이용자 기록 및 매출 통계', '공지사항 CRUD 관리', '시스템 설정 및 알림'].map((t) => (
            <div key={t} className="flex items-center gap-2.5 text-orange-100 text-sm">
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-white text-xs">✓</span>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* 우측 로그인 폼 */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* 모바일 로고 */}
          <div className="lg:hidden text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
              style={{ backgroundColor: 'var(--kiosk-orange)' }}
            >
              <span className="text-white text-2xl font-black">S</span>
            </div>
            <p className="text-gray-900 text-xl font-black">스터디 오아시스</p>
            <p className="text-gray-500 text-sm mt-0.5">운영 관리 시스템</p>
          </div>

          {step === 'credentials' ? (
            <>
              <div className="mb-7">
                <h1 className="text-2xl font-black text-gray-900">관리자 로그인</h1>
                <p className="text-gray-500 text-sm mt-1">계정 정보를 입력해 주세요</p>
              </div>

              <form onSubmit={handleCredentials} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-600 text-sm font-medium">아이디</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="ad-input"
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-600 text-sm font-medium">비밀번호</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="ad-input pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 min-h-0"
                    >
                      {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl p-3">
                    <AlertCircle size={14} className="flex-shrink-0" /> {error}
                  </div>
                )}

                <button type="submit" className="ad-btn-primary w-full py-3 text-base mt-1 flex items-center justify-center gap-1.5">
                  다음 <ChevronRight size={16} />
                </button>
              </form>

              <div className="mt-4 p-3 bg-orange-50 border border-orange-100 rounded-xl">
                <p className="text-xs text-orange-700 font-medium">데모 계정</p>
                <p className="text-xs text-orange-600 mt-0.5">아이디: admin · 비밀번호: admin1234</p>
              </div>
            </>
          ) : (
            <>
              <div className="mb-7">
                <button
                  onClick={() => { setStep('credentials'); setError(null); setOtp(''); }}
                  className="flex items-center gap-1 text-gray-500 text-sm mb-4 hover:text-gray-700 min-h-0"
                >
                  ← 뒤로
                </button>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                    <KeyRound size={18} style={{ color: 'var(--kiosk-orange)' }} />
                  </div>
                  <h1 className="text-2xl font-black text-gray-900">OTP 인증</h1>
                </div>
                <p className="text-gray-500 text-sm">6자리 인증 코드를 입력해 주세요</p>
              </div>

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl">
                  <p className="text-xs text-orange-700">데모 모드: OTP 코드는 <span className="font-bold">000000</span>을 입력해 주세요</p>
                </div>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full bg-white border-2 border-gray-200 focus:border-orange-400 rounded-2xl px-4 py-4 text-gray-900 text-center text-3xl font-black tracking-widest placeholder-gray-300 focus:outline-none transition-colors"
                  autoFocus
                  disabled={isLocked}
                />

                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl p-3">
                    <AlertCircle size={14} className="flex-shrink-0" /> {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || isLocked || otp.length !== 6}
                  className="ad-btn-primary w-full py-3 text-base disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> 인증 중...</>
                  ) : (
                    <><ShieldCheck size={16} /> 로그인</>
                  )}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
