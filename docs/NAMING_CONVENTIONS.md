# Naming Conventions

> 무인 스터디카페 좌석 예약 시스템 | 전체 코드베이스 명명 규칙

모든 기여자는 이 문서의 규칙을 **예외 없이** 준수한다.

---

## 1. 디렉토리 (Directories)

| 규칙 | 형식 | 예시 |
|------|------|------|
| 모든 디렉토리 | **kebab-case** | `seat-grid/`, `payment-screen/`, `admin-layout/` |
| 기능 그룹 | 명사 복수형 | `components/`, `pages/`, `hooks/`, `types/`, `utils/` |
| 도메인 구분 | 역할 기반 | `kiosk/`, `admin/`, `common/` |

```
frontend/src/
├── components/
│   ├── common/
│   ├── kiosk/
│   └── admin/
├── pages/
│   ├── kiosk/
│   └── admin/
├── hooks/
├── store/
├── api/
├── types/
├── constants/
└── utils/

backend/src/
├── controllers/
├── routes/
├── services/
├── middleware/
├── models/
├── config/
├── types/
└── utils/
```

---

## 2. 파일명 (Files)

| 종류 | 형식 | 예시 |
|------|------|------|
| React 컴포넌트 | **PascalCase** + `.tsx` | `SeatGrid.tsx`, `PaymentScreen.tsx` |
| 페이지 컴포넌트 | **PascalCase** + `Page.tsx` | `SeatStatusPage.tsx`, `AdminLoginPage.tsx` |
| Custom Hook | **camelCase** + `use` 접두사 | `useSeatStatus.ts`, `useWebSocket.ts` |
| Zustand Store | **camelCase** + `Store.ts` | `seatStore.ts`, `reservationStore.ts` |
| API 모듈 | **camelCase** | `seats.ts`, `reservations.ts` |
| 타입 정의 | **camelCase** | `seat.ts`, `reservation.ts` |
| 상수 파일 | **camelCase** | `colors.ts`, `config.ts` |
| 유틸리티 | **camelCase** | `mask.ts`, `hash.ts` |
| 백엔드 컨트롤러 | **camelCase** + `Controller.ts` | `seatController.ts` |
| 백엔드 서비스 | **camelCase** + `Service.ts` | `seatService.ts` |
| 백엔드 라우터 | **camelCase** | `seats.ts` |
| 백엔드 미들웨어 | **camelCase** + `Middleware.ts` | `authMiddleware.ts` |

---

## 3. 클래스 / 인터페이스 / 타입 (Classes / Interfaces / Types)

| 종류 | 형식 | 예시 |
|------|------|------|
| Interface | **PascalCase** (접두사 `I` 없음) | `Seat`, `Reservation`, `Payment` |
| Type Alias | **PascalCase** | `SeatStatus`, `PaymentMethod` |
| Enum | **PascalCase** (값은 SCREAMING_SNAKE_CASE) | `SeatStatus.AVAILABLE` |
| Class (백엔드) | **PascalCase** | `ReservationService`, `SeatController` |
| Generic | 단일 대문자 또는 의미있는 PascalCase | `T`, `TData`, `TResponse` |

```typescript
// ✅ 올바른 예
interface Seat {
  seatId: string;
  seatNumber: number;
  type: SeatType;
  status: SeatStatus;
}

enum SeatStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  MAINTENANCE = 'maintenance',
}

type PaymentMethod = 'card' | 'cash';
```

---

## 4. 변수 / 함수 / 메소드 (Variables / Functions / Methods)

| 종류 | 형식 | 예시 |
|------|------|------|
| 일반 변수 | **camelCase** | `seatList`, `totalAmount`, `isLoading` |
| boolean 변수 | `is` / `has` / `can` 접두사 | `isOnline`, `hasExpired`, `canPay` |
| 함수 / 메소드 | **camelCase** 동사 시작 | `fetchSeats()`, `processPayment()`, `handleCheckout()` |
| 이벤트 핸들러 | `handle` 접두사 | `handleSeatClick()`, `handlePaymentSubmit()` |
| React 컴포넌트 함수 | **PascalCase** | `SeatGrid`, `PaymentScreen` |
| Custom Hook | `use` 접두사 + **camelCase** | `useSeatStatus()`, `useIdleTimer()` |
| async 함수 | 동사 + 명사 (명사 = 반환 대상) | `fetchReservation()`, `createPayment()` |

---

## 5. 상수 (Constants)

| 종류 | 형식 | 예시 |
|------|------|------|
| 전역 상수 | **SCREAMING_SNAKE_CASE** | `MAX_RETRY_COUNT`, `IDLE_TIMEOUT_MS` |
| 색상 상수 | `COLOR_` 접두사 | `COLOR_AVAILABLE`, `COLOR_OCCUPIED` |
| API 경로 | `API_` 접두사 | `API_BASE_URL`, `API_SEATS` |
| 시간 관련 | `_MS` / `_SEC` / `_MIN` 접미사 | `HEARTBEAT_INTERVAL_MS`, `SESSION_TIMEOUT_MIN` |
| 객체 상수 | **camelCase** (값 배열/맵) | `seatColors`, `errorMessages` |

```typescript
// ✅ 올바른 예
export const MAX_RETRY_COUNT = 3;
export const HEARTBEAT_INTERVAL_MS = 10_000;
export const IDLE_TIMEOUT_MS = 3 * 60 * 1000;

export const SEAT_COLORS = {
  available: '#4CAF50',
  occupied: '#F44336',
  reserved: '#FFC107',
  maintenance: '#9E9E9E',
} as const;
```

---

## 6. Props (React)

| 종류 | 형식 | 예시 |
|------|------|------|
| Props 인터페이스 | 컴포넌트명 + `Props` | `SeatGridProps`, `KpiCardProps` |
| Callback prop | `on` 접두사 | `onSeatSelect`, `onPaymentComplete` |
| boolean prop | `is` / `has` / `can` | `isLoading`, `isDisabled` |
| 렌더링 prop | `render` 접두사 | `renderItem` |

```typescript
// ✅ 올바른 예
interface SeatGridProps {
  seats: Seat[];
  onSeatSelect: (seat: Seat) => void;
  isLoading: boolean;
}
```

---

## 7. API 엔드포인트 (REST API)

| 규칙 | 형식 | 예시 |
|------|------|------|
| 경로 세그먼트 | **kebab-case** | `/api/seats`, `/api/admin/error-logs` |
| 리소스 | 복수 명사 | `/api/seats`, `/api/reservations` |
| 중첩 리소스 | `/:id/action` | `/api/reservations/:id/extend` |
| 쿼리 파라미터 | **camelCase** | `?startDate=&endDate=&severity=` |

---

## 8. 데이터베이스 (PostgreSQL)

| 종류 | 형식 | 예시 |
|------|------|------|
| 테이블명 | **snake_case** 복수 | `seats`, `reservations`, `error_logs` |
| 컬럼명 | **snake_case** | `seat_id`, `start_time`, `is_deleted` |
| PK | `테이블단수_id` | `seat_id`, `reservation_id` |
| FK | 참조 테이블 PK와 동일 | `seat_id` (reservations 테이블 내) |
| 타임스탬프 | `created_at`, `updated_at` | `created_at TIMESTAMPTZ` |
| boolean | `is_` 접두사 | `is_deleted`, `is_active` |
| 인덱스 | `idx_테이블_컬럼` | `idx_reservations_seat_id` |

---

## 9. 환경 변수 (Environment Variables)

| 규칙 | 형식 | 예시 |
|------|------|------|
| 모든 환경 변수 | **SCREAMING_SNAKE_CASE** | `DATABASE_URL`, `JWT_SECRET` |
| 프론트엔드 (Vite) | `VITE_` 접두사 | `VITE_API_BASE_URL`, `VITE_WS_URL` |
| 백엔드 | 접두사 없음 | `PORT`, `JWT_SECRET`, `DATABASE_URL` |

---

## 10. Git 커밋 메시지 (Conventional Commits)

형식: `<type>(<scope>): <subject>`

| Type | 용도 | 예시 |
|------|------|------|
| `feat` | 새 기능 추가 | `feat(kiosk): add seat selection popup` |
| `fix` | 버그 수정 | `fix(payment): handle E004 network error retry` |
| `chore` | 설정, 빌드, 의존성 | `chore(frontend): add tailwind css config` |
| `docs` | 문서 작성/수정 | `docs: add naming conventions` |
| `refactor` | 리팩토링 (기능 변경 없음) | `refactor(seat): extract status color util` |
| `style` | 코드 스타일 (포맷팅 등) | `style: fix lint warnings in SeatGrid` |
| `test` | 테스트 추가/수정 | `test(api): add seat endpoint tests` |
| `perf` | 성능 개선 | `perf(ws): debounce seat update events` |

**Scope 목록:** `kiosk`, `admin`, `backend`, `db`, `auth`, `payment`, `seat`, `ws`, `common`

### 커밋 메시지 예시

```
feat(kiosk): implement seat grid with real-time status colors

- Add SeatGrid component with available/occupied/reserved/maintenance states
- Wire WebSocket events to Zustand seat store
- Add 3-minute idle timeout auto-reset

closes #3
```

---

## 11. Zustand Store

| 종류 | 형식 | 예시 |
|------|------|------|
| Store 파일 | `camelCase` + `Store.ts` | `seatStore.ts` |
| State 인터페이스 | `Store명` + `State` | `SeatState` |
| Actions | 동사 시작 camelCase | `setSeats()`, `updateSeatStatus()` |
| Selector | `select` 접두사 또는 직접 구조분해 | `useSeats()`, `useSeatById()` |

---

*문서 버전: v1.0 | 최종 수정: 2026-06-03*
