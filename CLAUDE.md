# 스터디 오아시스 — 무인 스터디카페 좌석 예약 시스템

## 프로젝트 개요
무인 키오스크 기반 좌석 예약·결제·연장·퇴실 + 관리자 대시보드.
monorepo 구조: `backend/` (Express/TypeScript) + `frontend/` (React/TypeScript/Vite)

## 기술 스택
| 영역 | 스택 |
|------|------|
| Backend | Node.js, Express, TypeScript, Socket.IO, JWT, bcrypt, UUID |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, React Router v7, Axios, Socket.IO-client |
| 데이터 | In-memory (mockData.ts) — DB 없음, 서버 재시작 시 초기화 |

## 실행 명령어
```bash
# 백엔드 (포트 4000)
cd backend && npm run dev

# 프론트엔드 (포트 3000)
cd frontend && npm run dev

# 타입 체크
cd backend && npx tsc --noEmit
cd frontend && npx tsc --noEmit
```

## 도메인 용어
| 용어 | 설명 |
|------|------|
| seat | 좌석 (general / premium / private) |
| reservation | 예약 (pending → completed / cancelled / expired) |
| kiosk | 고객용 터치 화면 (440×880px 프레임) |
| admin | 관리자 대시보드 |
| broadcastSeatUpdate | 좌석 상태 변경 시 Socket.IO 전파 함수 |
| pricePerHour | 시간당 요금 |
| totalAmount | 총 결제 금액 |

## 예약 상태 전환
- pending → completed : 결제 완료 or 퇴실(체크아웃)
- pending → cancelled  : 결제 실패 or 3분 타임아웃 자동 취소
- completed → expired  : 이용 시간 자연 만료

## 디렉토리 구조
```
프로젝트/
├── backend/src/         ← 백엔드 규칙: backend/CLAUDE.md
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── data/mockData.ts
│   ├── socket.ts        ← broadcastSeatUpdate 전용 모듈
│   └── app.ts
└── frontend/src/        ← 프론트엔드 규칙: frontend/CLAUDE.md
    ├── pages/kiosk/
    ├── pages/admin/
    ├── components/
    ├── store/
    ├── hooks/
    ├── api/
    ├── types/
    ├── utils/
    └── constants/
```

## 공통 명명 규칙
- 인터페이스/타입: PascalCase, I 접두사 금지
- ID 필드: 엔티티명 + Id (adminId, seatId, reservationId)
- 금액 필드: ~Amount / ~Revenue (totalAmount, todayRevenue)
- 날짜 필드: ~At (createdAt, resolvedAt)
- 상수: SCREAMING_SNAKE_CASE

## 커밋 컨벤션
Conventional Commits 형식 준수:
```
<type>(<scope>): <subject>
```

### type
| type | 사용 시점 |
|------|-----------|
| feat | 새 기능 추가 |
| fix | 버그 수정 |
| refactor | 동작 변경 없는 코드 개선 |
| style | 포맷·공백·CSS 등 로직 무관 변경 |
| chore | 빌드·설정·의존성·문서 등 |
| docs | 문서 전용 변경 (CLAUDE.md, README 등) |
| test | 테스트 추가·수정 |

### scope
| scope | 대상 |
|-------|------|
| backend | 백엔드 전체 |
| frontend | 프론트엔드 전체 |
| kiosk | 키오스크 페이지·컴포넌트 |
| admin | 관리자 페이지·컴포넌트 |
| api | API 레이어 (routes, controllers) |
| ws | WebSocket / Socket.IO |
| auth | 인증·권한 |
| types | 타입 정의 |
| config | 환경 설정 |

### 규칙
- subject는 한국어, 명사형 또는 동사원형으로 종결
- 한 커밋 = 한 논리적 단위 (기능 하나, 버그 하나)
- 커밋 전 반드시 `tsc --noEmit` 통과 확인
- 예시: `feat(kiosk): 좌석 자리이동 페이지 추가`

## 브랜치 전략
GitHub Flow 기반:

```
main ← 항상 배포 가능한 상태
  └── feat/기능명        새 기능
  └── fix/버그명         버그 수정
  └── refactor/대상명    리팩토링
  └── docs/문서명        문서 작업
```

### 규칙
- main 직접 push 금지 — PR을 통해서만 병합
- 브랜치명: kebab-case, 영문 또는 한글 혼용 허용
  - 예: `feat/seat-transfer`, `fix/payment-rollback`, `docs/project-document`
- 작업 완료 후 브랜치 삭제
- 예외: 초기 프로젝트 세팅, 긴급 hotfix는 main 직접 커밋 허용
