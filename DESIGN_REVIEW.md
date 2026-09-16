# Design Review: 홈페이지 (index.html)

Reviewed against: 별도 DESIGN_BRIEF 없음 — 기존 코드베이스(css/style.css "Deep Signal" 토큰 시스템)와 사이트 목적(명지대 BILAB 소개)을 기준으로 검토
Date: 2026-09-17

## 검증 방법

- 코드 리뷰: `index.html`, `css/style.css`, `js/main.js`, `js/components.js`, `js/hero-network.js`, `js/pub-counts.js`
- 실제 브라우저 구동 확인 (로컬 `python -m http.server 8080`): 데스크톱 1280×800, 태블릿 768×1024, 모바일 375×812 3개 뷰포트
- 라이트/다크 모드 토글, 모바일 메뉴 열기/닫기(포커스 이동, ESC, 스크롤 락), 헤더 스크롤 상태 전환을 실제 클릭·키보드 이벤트로 실행해 확인
- WCAG 대비비를 실제 렌더링된 CSS 변수 값으로 직접 계산 (라이트/다크 각각)
- 참고: 이 세션의 브라우저 패널이 중간에 숨김 상태가 되어 일부 화면은 스크린샷 파일 대신 DOM/접근성 트리·computed style로 교차 검증했습니다.

## Summary

이미 상당히 완성도 높은 상태입니다. 토큰 기반 디자인 시스템, 라이트/다크 테마, 반응형 3단 브레이크포인트, reduced-motion 대응, 모바일 메뉴의 포커스 트랩까지 — 보통 사후에 추가되는 접근성 디테일이 이미 촘촘히 들어가 있습니다 (커밋 히스토리의 "Fix layout/a11y defects" 등과 일치). Must Fix에 해당하는 치명적 결함은 없었고, 지적 사항은 대부분 다듬기 수준입니다.

## Must Fix

없음. 레이아웃 깨짐, 콘솔 에러, 대비 실패, 키보드 트랩 등 치명적 문제는 발견되지 않았습니다.

## Should Fix

1. **푸터 헤딩이 H2 → H5로 건너뜀**: 메인 콘텐츠는 `h1`(하나) → `h2`(About/Research/News 등) 순서인데, 푸터의 "Explore/People/Contact" 라벨은 `h5`로 마크업되어 있습니다(`js/components.js:61,68,74` → `<h5>`). 스크린리더 사용자가 헤딩 단위로 내비게이션할 때 순서가 끊깁니다. _Fix: `h5`를 `h2`(또는 헤딩이 아닌 `<p class="foot-h">` + 시각 스타일만 유지)로 변경._
2. **햄버거 버튼 터치 타깃이 작음**: 모바일(≤1024px)에서 `.burger`의 실측 크기가 35×28px입니다(`padding:6px` + 23×2px 바 3개, `css/style.css:187-190`). 44×44px 권장 기준에 못 미칩니다. 메뉴 안의 링크(247×53px)는 충분히 큽니다. _Fix: `.burger` padding을 늘려 실측 44×44px 이상 확보._

## Could Improve

1. **죽은 코드 한 줄**: `js/main.js:293`의 `renderNews("newsListPreview", 6)`이 참조하는 `#newsListPreview` 엘리먼트가 어떤 페이지에도 없습니다 (`renderNews`가 `!el`이면 조용히 반환하므로 동작엔 영향 없음). _정리 대상._
2. **미사용 드롭다운 CSS**: `css/style.css`의 `.menu .hassub` 관련 스타일(178-186행)에 대응하는 네비게이션 항목이 `js/components.js`의 `NAV` 배열엔 없습니다. 향후 하위 메뉴 계획이 없다면 정리해도 좋습니다.
3. **푸터 "People" 열에 "IDEA 사업단 ↗" 배치**: Director/Members/Alumni와 나란히 있지만 사람이 아니라 외부 사업단 링크라, 분류상 다소 어색합니다. Explore 열이나 별도 열이 더 자연스러워 보입니다.
4. **홈 히어로 통계가 매 로드마다 다른 페이지를 fetch**: `research.html`(프로젝트 수), `publications.html`(논문 수)을 홈페이지 로드 시마다 fetch+파싱합니다(`js/pub-counts.js`, `js/main.js renderProjectCount`). 수치를 한 곳에서만 관리하려는 의도적 트레이드오프(주석에 명시)라 지금은 문제 없지만, 페이지 수가 늘면 정적 빌드 스텝에서 값을 굽는 방식도 고려해볼 만합니다.
5. **한/영 혼용 문장에 lang 속성 없음**: About 섹션의 영문 문장("Welcome to Business Intelligence (BI) Laboratory…")이 `lang="ko"` 문서 안에 그대로 있어, 스크린리더가 한국어 음성 엔진으로 영어를 읽을 수 있습니다. 우선순위는 낮음.

## What Works Well

- **대비비**: `--muted`/`--dim`/`--accent` 등 본문에 쓰이는 색 조합을 라이트·다크 모드 각각 실측한 결과 전부 WCAG AA(4.5:1) 이상입니다 (최저 4.97:1). 별도 `--dim-deco`를 장식용으로 분리해둔 설계가 실제로 유효합니다.
- **모바일 메뉴 접근성**: 열림 시 포커스가 첫 링크로 이동, `Tab`/`Shift+Tab`이 패널 안에서만 순환, `Esc`로 닫히고 포커스가 버거 버튼으로 복귀, `html.nav-open`으로 배경 스크롤 잠금까지 — 직접 클릭·키보드로 재현해 전부 확인했습니다.
- **odometer 통계 카운터**: 시각적으로는 숫자가 굴러가는 애니메이션이지만, 실제 텍스트는 `sr-only` 스팬(`"7편"`)이 담당하고 애니메이션용 0-9 스트립은 `aria-hidden="true"`로 숨겨져 있어 스크린리더에는 깔끔한 값만 전달됩니다.
- **reduced-motion 전면 대응**: 히어로 네트워크 캔버스, 스크롤 리빌, split-word 리빌, odometer, 뒤로가기 버튼까지 `prefers-reduced-motion`을 개별적으로 체크해 정적 상태로 대체합니다. 탭이 백그라운드로 가면 캔버스 rAF 루프도 멈춥니다(`visibilitychange`).
- **반응형**: 1280 / 768 / 375 세 뷰포트 모두 가로 스크롤이나 겹침 없이 깔끔하게 재배치되었고, 주요 CTA 버튼과 메뉴 링크의 터치 타깃도 넉넉합니다.
- **다크모드 토큰 전환**: 토글 클릭 시 `localStorage` 저장, 라벨/aria-label 갱신까지 정상 동작하며 다크 모드 전용 팔레트도 별도 대비 검증을 통과합니다.
- **데이터 일관성 설계**: 발행 논문 수·프로젝트 수를 손으로 하드코딩하지 않고 각 페이지의 실제 DOM에서 세어오는 구조(`pub-counts.js`, `renderProjectCount`)라 페이지 간 숫자가 어긋날 일이 없습니다.
