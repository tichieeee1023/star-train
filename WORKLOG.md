# v2.3 작업 로그

- 원본 참조: 별빛 항해일지 `src/Cabin.tsx` (`voyageStage`, `stageNames`, 창밖 항해 상태), `src/main.tsx` (`sailing?'space':destination`, 실제 시각과 도착 화면 전환).
- 문제: v2.2.1은 항로 선택 즉시 해당 목적지 지형을 `Sky`에 전달하여 출발 전에도 행성 풍경이 보였음.
- 변경: 객실 Canvas 항해 화면을 `VoyageSky`로 분리. 현재 선택된 목적지는 항해 표시용 별도의 우주 엔진에만 ‘접근 단계 행성 색상 힌트’로 전달.
- 움직이는 별은 Canvas 시차 레이어를 사용하며 24fps 상한, 백그라운드 정지, 모션 감소 설정을 존중.
- 1h: departure,nebula,sea,approach / 3h: departure,nebula,sea,aurora,approach / 8h: departure,nebula,islands,sea,aurora,approach.
- 도착 후 3.3초 역 접근 연출; 정산된 여정의 기존 저장 상태를 복원하면 즉시 stopped.
- 테스트: TS 구문 18개 / 단계 15개 / 브라우저 5구간 + 모바일 + 실제 움직임 이미지 차이.
- 미해결: 로컬 npm ci 내부 오류로 정식 빌드 미검증.
- 원격 배포: 보류.

## v2.4 — PWA + 《별빛 항해일지》 UI/UX 계승 (2026-11-23)
- 원본 확인: `work-starvoyage-origin/index.html`, `public/manifest.webmanifest`, `public/sw.js`, `src/main.tsx`, `src/style.css`, `src/PlantCare.tsx`. 목적지 카드→출발 확인 모달, 1/3/8시간 선택, 3탭 네비게이션, 접기형 상세 UI, 화면 전환 시 스크롤 복귀, PWA 오프라인 앱 셸 참조.
- 은하 열차 `index.html`: PWA 및 아이콘, iOS meta, viewport-fit=cover, theme color.
- `public/manifest.webmanifest`, `public/sw.js`, `public/icons/*`, `public/icons/apple-touch-icon.png`: 완전히 새로 추가. 기존 localStorage 건드리지 않음. Vite 해시 에셋은 cache-first, HTML navigations는 network-first, offline fallback.
- `src/InstallApp.tsx`: 설치 프롬프트/기기별 설치 도움말. 서비스 워커 프로덕션 등록.
- `src/main.tsx`: 두 목적지 카드 선택 후 모달에서 1/3/8시간 고르는 흐름. 시간과 탭 기억, 탭 이동 시 상단으로. 목적지 선택만으로 창밖이 변하지 않는 v2.3 Canvas 유지.
- `src/style.css`: 고정 하단 3탭, PWA 설치 버튼, 출항 모달, 작은 화면 카드/여백/안전 영역.
- 검증: 19개 TS/TSX 구문 변환 0 오류, 서비스워커 `node --check`, manifest JSON·아이콘 파일·사이즈 통과; 360px/390px 뷰포트 정적 UI 미리보기 가로 넘침 0, 카드 클릭 시 모달 확인. **정식 타입 검사/Vite 빌드는 npm 의존성 폴더가 비어 있어 실패**, 해당 환경 npm 설치 요청은 시간 초과. Playwright 로컬 HTTP 접속은 관리자에 의해 차단되어 실제 SW/오프라인 점검 미수행. **배포하지 않음**.
