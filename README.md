# 🗂️ 경원환경개발 민원관리 시스템

> **React.js + TypeScript + Tailwind CSS**로 구축된 현대적인 민원관리 웹 애플리케이션

## 📦 기술 스택

### 🎯 핵심 기술

- **React 18** - 사용자 인터페이스 구축
- **TypeScript** - 타입 안전성과 개발 생산성 향상
- **Vite** - 빠른 개발 서버와 빌드 도구
- **Tailwind CSS** - 유틸리티 퍼스트 CSS 프레임워크

### 🛠️ 주요 라이브러리

- **React Router DOM** - 클라이언트 사이드 라우팅
- **TanStack Table** - 고성능 데이터 테이블
- **Radix UI** - 접근성 중심 UI 컴포넌트
- **Lucide React** - 아이콘 라이브러리
- **Axios** - HTTP 클라이언트
- **Date-fns** - 날짜 유틸리티

### 🎨 UI/UX

- **Shadcn/ui** - 재사용 가능한 UI 컴포넌트
- **React Hook Form** - 폼 상태 관리
- **React Calendar** - 날짜 선택 컴포넌트

### 🔧 개발 도구

- **ESLint** - 코드 품질 관리
- **Prettier** - 코드 포맷팅
- **PostCSS** - CSS 전처리

## ✨ 프로젝트 요약

서울특별시 도봉구의 환경 민원을 효율적으로 관리하는 웹 애플리케이션입니다. 네이버 지도 API를 활용한 주소 검색, 실시간 민원 등록 및 관리, 그리고 반응형 디자인을 통해 데스크톱과 모바일 환경에서 모두 최적화된 사용자 경험을 제공합니다.

## 💡 주요 기능

### 🗺️ 지도 기반 민원 관리

- **네이버 지도 API** 연동으로 정확한 주소 검색
- **실시간 위치 확인** 및 민원 발생 지점 표시
- **동 정보 자동 추출** (방학 1동, 쌍문 3동 등)

### 📝 민원 등록 시스템

- **다단계 폼** (입력 → 확인 → 전송)
- **파일 첨부** 기능 (이미지, 문서)
- **실시간 유효성 검사** 및 에러 처리
- **자동 저장** 및 작성 중 경고

### 📊 민원 관리 대시보드

- **고성능 데이터 테이블** (정렬, 필터링, 검색)
- **상태별 분류** (처리중/완료)
- **날짜별 필터링** 및 통계
- **일괄 작업** (선택, 삭제, 다운로드)

### 🔐 인증 및 보안

- **세션 기반 인증** 시스템
- **보호된 라우트** 및 권한 관리
- **자동 로그인** 기능

### 📱 반응형 디자인

- **모바일 최적화** 레이아웃
- **터치 친화적** 인터페이스
- **적응형 네비게이션** (햄버거 메뉴)

## 🚀 실행 방법

### 1. 환경 설정

```bash
# 프로젝트 클론
git clone [repository-url]
cd my-hybrid-app/frontend

# 의존성 설치
npm install
```

### 2. 환경 변수 설정

```bash
# .env 파일 생성
cp .env.example .env

# 네이버 클라우드 API 키 설정
VITE_NAVER_CLOUD_API_KEY_ID=your_api_key_id
VITE_NAVER_CLOUD_API_KEY=your_api_key
```

### 3. 개발 서버 실행

```bash
# 개발 모드 실행
npm run dev

# 브라우저에서 확인
# http://localhost:5173
```

### 4. 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 📸 주요 화면

### 🏠 메인 페이지

```
┌─────────────────────────────────────┐
│  📍 지도 기반 민원 현황 대시보드    │
│  📊 실시간 통계 및 차트            │
│  🚗 차량 위치 추적 시스템          │
└─────────────────────────────────────┘
```

### 📝 민원 등록 폼

```typescript
// 주소 검색 예시
const addressSearch = async (query: string) => {
  const results = await AddressService.searchAddress(query);
  // "서울특별시 도봉구 방학로 101" → "방학 1동" 자동 추출
};
```

### 📋 민원 관리 테이블

```typescript
// 데이터 테이블 기능
const columns = [
  { accessorKey: "number", header: "연번" },
  { accessorKey: "date", header: "접수 일자" },
  { accessorKey: "type", header: "종류" },
  { accessorKey: "status", header: "처리결과" },
  // 정렬, 필터링, 검색 지원
];
```

## 🎯 프로젝트 구조

```
frontend/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── ui/             # Shadcn/ui 컴포넌트
│   │   ├── complaints/      # 민원 관련 컴포넌트
│   │   └── ...
│   ├── pages/              # 페이지 컴포넌트
│   ├── hooks/              # 커스텀 훅
│   ├── services/           # API 서비스
│   ├── types/              # TypeScript 타입 정의
│   └── assets/             # 이미지, 아이콘 등
├── public/                 # 정적 파일
└── package.json           # 프로젝트 설정
```

## 🔧 개발 환경

- **Node.js** 18.0.0 이상
- **npm** 9.0.0 이상
- **모던 브라우저** (Chrome, Firefox, Safari, Edge)

## 📄 라이선스

이 프로젝트는 경원환경개발을 위한 내부 시스템입니다.

---

**개발팀**: 경원환경개발 프론트엔드 팀  
**최종 업데이트**: 2025년 8월
