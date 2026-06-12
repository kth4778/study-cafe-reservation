# Backend — 스터디 오아시스

## 스택 & 구조
Express + TypeScript. 컨트롤러-라우터-미들웨어 분리.
데이터: src/data/mockData.ts 배열 (seats, reservations, adminUsers, errorLogs, usageRecords)

## 파일 명명
| 대상 | 규칙 | 예시 |
|------|------|------|
| 컨트롤러 | camelCase + Controller | adminController.ts |
| 라우터 | camelCase (기능명) | admin.ts, reservations.ts |
| 미들웨어 | camelCase + Middleware | authMiddleware.ts |
| 타입 | src/types/index.ts 단일 파일 유지 | |

## 함수 명명
- GET → get~ / find~  (getKpi, findActiveReservationBySeat)
- POST → create~ / process~  (createReservation, processPayment)
- PATCH → extend~ / checkout~ / reset~
- 미들웨어: ~Middleware suffix  (authMiddleware, superadminMiddleware)

## API 응답 규칙
- 성공: 적절한 2xx + JSON 본문
- 실패: status + `{ message: string, code?: string }`
- 에러 코드: 대문자 (SEAT_UNAVAILABLE, E004)
- 입력 검증 실패: 400 / 미발견: 404 / 충돌: 409

## 입력 검증 (필수)
- durationHours, extraHours: 1~12 범위 강제
- 결제 amount: reservation.totalAmount와 일치 확인
- seatNumber: 1~100 범위 강제

## Socket.IO 규칙
- broadcastSeatUpdate는 반드시 src/socket.ts에서 import
- 좌석 상태 변경 시 항상 호출 (예약생성/결제완료/결제실패/체크아웃/자동취소)
- app.ts에서 직접 io 참조 금지 → setIo()로 주입

## 권한 체계
- 일반 관리 API: authMiddleware
- 위험 작업 (resetSeat 등): authMiddleware + superadminMiddleware 순서 적용

## 주의사항
- In-memory 특성상 동시 요청 race condition 가능 — 좌석 상태 확인 후 즉시 변경
- JWT_SECRET는 반드시 환경변수 사용 (기본값 'dev-secret'은 개발 전용)
- 결제 실패 시 rollback 필수: reservation 'cancelled' + 좌석 'available' + broadcast
