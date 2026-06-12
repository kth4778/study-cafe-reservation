# Frontend — 스터디 오아시스

## 스택 & 구조
React 19 + TypeScript + Tailwind CSS v4 + Zustand + React Router v7 + Axios

## 파일 명명
| 대상 | 규칙 | 예시 |
|------|------|------|
| 페이지 컴포넌트 | PascalCase + Page | KioskHomePage.tsx, DashboardPage.tsx |
| 일반 컴포넌트 | PascalCase + 역할 | SeatGrid.tsx, KpiCard.tsx, AdminLayout.tsx |
| 커스텀 훅 | use + PascalCase | useWebSocket.ts, useIdleTimeout.ts |
| API 모음 | camelCase 기능명 | admin.ts, seats.ts, reservations.ts |
| Zustand 스토어 | camelCase + Store | authStore.ts, seatStore.ts |
| 상수 모음 | camelCase | config.ts, colors.ts |

## 함수 명명
- GET  → fetch~  (fetchSeats, fetchAdminStats)
- POST → create~ / process~  (createReservation, processPayment)
- PUT  → update~  (updateNotice)
- DEL  → delete~  (deleteNotice)
- 이벤트 핸들러: handle + 동사  (handleSave, handleLogout, handleSeatClick)
- 유틸 함수: camelCase  (formatKrw, formatDateTime, getRemainingMinutes)

## 컴포넌트 규칙
- 페이지 컴포넌트는 named export (`export const SeatSelectPage = ...`)
- props 타입은 interface로 선언, 파일 상단에 위치
- 키오스크 화면: 440×880px KioskShell 프레임 안에서 렌더링
- 유휴 타임아웃 3분: 키오스크 페이지에서 useIdleTimeout() 호출

## Zustand 스토어 규칙
- 파일: src/store/~Store.ts
- authStore: persist 미들웨어로 localStorage 자동 저장
- reservationStore: 흐름 완료 시 반드시 reset() 호출
- seatStore: WebSocket 이벤트로 updateSeatStatus() 업데이트

## CSS 유틸리티 클래스
- 키오스크 전용: ki- 접두사  (.ki-card, .ki-btn-orange, .ki-btn-gray)
- 관리자 전용: ad- 접두사  (.ad-card, .ad-btn-primary, .ad-input)
- CSS 변수: --kiosk- 접두사  (--kiosk-orange: #FF6D00)
- 인라인 style은 CSS 변수가 없는 경우에만 사용

## API 레이어 규칙
- 모든 API 호출: src/api/ 의 함수만 사용, 컴포넌트에서 직접 axios 금지
- 401 응답: authStore.logout() + window.location.href = '/admin/login' 자동 처리 (client.ts)
- 에러 분기: axios.isAxiosError(err) + err.response?.status로 404 vs 네트워크 오류 구분
- 키오스크 예약 API에 mock fallback 생성 금지

## WebSocket 규칙
- useWebSocket() 훅: 모듈 레벨 싱글턴 소켓 + refCount 관리
- seats:init 이벤트: 연결 시 전체 좌석 상태 수신 → seatStore.setSeats()
- seat:update 이벤트: 개별 좌석 변경 → seatStore.updateSeatStatus()

## 라우팅
- /kiosk/* : 인증 불필요, KioskShell 레이아웃
- /admin/* : AuthGuard 필수 (isAuthenticated 체크)
- 미등록 경로: / 로 리다이렉트
