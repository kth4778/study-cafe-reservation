# 무인 스터디카페 좌석 예약 시스템

> 소프트웨어공학 프로젝트 | 국립한국교통대학교 | 2026-1학기

키오스크 기반 무인 스터디카페 좌석 예약·결제·퇴실 시스템과 관리자 웹 대시보드입니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React + TypeScript + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| 실시간 통신 | WebSocket (Socket.io) |
| 인증 | JWT (HS256) + bcrypt + TOTP |

## 프로젝트 구조

```
study-cafe-reservation/
├── frontend/     # 키오스크 UI + 관리자 대시보드 (React)
├── backend/      # REST API + WebSocket 서버 (Node.js)
└── docs/         # 기획 문서 및 설계 문서
```

## 주요 기능

- **키오스크 UI**: 좌석 조회 → 선택 → 결제 → 퇴실 플로우
- **실시간 좌석 현황**: WebSocket 기반 2초 이내 상태 반영
- **결제 처리**: PG사 API 연동 (카드/현금), 오류 코드 처리 및 자동 재시도
- **관리자 대시보드**: KPI 카드, 이용 통계, 오류 로그, 시스템 설정
- **보안**: RBAC 3단계 (USER / ADMIN / SUPERADMIN), 2FA, 감사 로그

## 화면 목록

| 구분 | 화면 |
|------|------|
| 공통 | SCR-00 진입 선택 |
| 키오스크 | SCR-01 ~ SCR-11 |
| 관리자 | SCR-20 ~ SCR-27 |

## 개발 우선순위

- **Phase 1 (MVP)**: 좌석 조회·예약·결제·퇴실 + 관리자 로그인·대시보드
- **Phase 2**: 시간 연장, 만료 알림, 통계, 오류 로그
- **Phase 3**: 공지사항, 개인정보 자동 파기, 정기 백업

## 로컬 실행

```bash
# 백엔드
cd backend && npm install && npm run dev

# 프론트엔드
cd frontend && npm install && npm start
```

---

*기반 문서: SRS v1.1 | 기획 문서 v1.0*
