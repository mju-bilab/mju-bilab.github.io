# BILAB — Business Intelligence Lab, Myongji University

명지대학교 산업경영공학과 비즈니스 인텔리전스 연구실(BILAB) 홈페이지입니다.
순수 정적 HTML/CSS/JS로 제작되어 별도의 빌드 과정 없이 바로 배포할 수 있습니다.

## 폴더 구조

```
bilab/
├── index.html          홈
├── director.html       지도교수 소개
├── members.html         현재 구성원 · 졸업생(Alumni)
├── research.html         연구 분야 · 연구 과제
├── publications.html    논문(저널/진행중/학술대회)
├── lectures.html         강의 목록
├── activity.html         Our Lab (활동 아카이브 · 세미나)
├── contact.html          연락처 · 지도
├── 404.html              오류 페이지 (GitHub Pages가 자동으로 사용)
├── css/style.css
├── js/
│   ├── components.js       공통 헤더/푸터, 모바일 메뉴(모달), 스크롤 효과
│   ├── main.js             뉴스/활동 렌더링, 논문·구성원 탭 필터, 자동 카운트
│   ├── news-data.js        뉴스·활동·졸업생 데이터 (여기만 수정하면 반영됨)
│   ├── theme-colors.js     캔버스 일러스트용 테마별 색상 (라이트/다크 연동)
│   ├── pub-counts.js       논문 수 단일 진실원 (publications.html 마크업을 셈)
│   ├── pub-links.js        논문 PDF·DOI 링크 렌더링
│   ├── hero-network.js     히어로 파티클 네트워크
│   ├── pipeline-graph.js   Research 파이프라인 그래프
│   ├── process-illustration.js  Research 프로세스 일러스트
│   └── research-interests.js    연구 관심분야 카드 일러스트
├── files/publications/index.json   논문별 PDF 파일명 + DOI
└── images/
```

## 콘텐츠가 자동으로 계산되는 항목 (직접 숫자를 쓰지 마세요)

| 화면 | 값 | 계산 근거 |
|---|---|---|
| 홈 Refereed / Conference | 논문 수 | `publications.html`의 `.pub-item` 개수 (`pub-counts.js`) |
| 홈 Research Projects | 과제 수 | `research.html`의 `.tl-item` 개수 |
| 홈 Lab Alumni | 졸업생 수 | `ALUMNI_DATA.length` |
| Members "N명이 함께하고 있습니다" | 재학생 수 | 페이지의 `.person-card` 개수 |
| Publications 요약줄 / 그룹별 건수 | 논문 수 | `pub-counts.js` |

## 로컬에서 미리보기

Python이 설치되어 있다면 프로젝트 폴더에서:

```bash
python -m http.server 8080
```

이후 브라우저에서 http://localhost:8080 접속.

## GitHub Pages로 배포하기

1. GitHub에 새 저장소 생성 (예: `mju-bilab.github.io` 또는 일반 저장소 + `gh-pages`)
2. 이 폴더 내용을 저장소에 push
3. 저장소 Settings → Pages → Source에서 배포 브랜치(main) 선택
4. (선택) 커스텀 도메인을 쓰려면 저장소에 `CNAME` 파일을 추가하고, 도메인 DNS에 해당 GitHub Pages 주소로 CNAME/A 레코드를 연결

```bash
git init
git add .
git commit -m "Initial BILAB website"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

## 콘텐츠 업데이트 방법

- **새 소식 추가**: `js/news-data.js`의 `NEWS_DATA` 배열 맨 위에 항목 추가
- **활동 사진/기록 추가**: `js/news-data.js`의 `ACTIVITY_DATA` 배열에 항목 추가. 사진을 넣으려면 `images/activity/` 폴더에 파일을 넣고 그 항목에 `photo: "images/activity/파일명.jpg"` 필드만 추가하면 자동으로 카드 썸네일에 표시됨 (없으면 기본 플레이스홀더 표시)
- **구성원 추가/변경**: `members.html`의 `person-card` 블록 복사해서 수정
- **논문 추가**: `publications.html`의 해당 `pub-item` 블록 복사해서 수정 (`data-pub-id`를 고유하게 지정)
- **논문 PDF·DOI 연결**: `files/publications/index.json`에서 해당 `data-pub-id` 항목의 `pdf`(파일명) / `doi` 값을 채우면 제목이 PDF 링크가 되고 DOI 링크가 붙습니다. PDF 파일은 `files/publications/`에 넣으세요
- **활동 사진/종류**: `ACTIVITY_DATA` 항목에 `photo`를 넣으면 사진 카드, 없으면 종류별 아이콘 카드가 표시됩니다. 종류는 제목에서 자동 추론되며(`학술대회`/`학위수여식`/`세미나`), `kind: "conference" | "commencement" | "seminar"`로 직접 지정할 수도 있습니다
- **메뉴/링크 변경**: `js/components.js`의 `NAV` 배열 수정 (모든 페이지에 자동 반영)

## 배포 도메인 설정

메타 태그(`og:url`, `canonical`)와 `404.html`의 링크는 **루트 도메인 배포**를 전제로
`https://mju-bilab.github.io` 를 사용합니다. 도메인이 확정되면 다음 두 곳을 바꾸세요.

1. 각 HTML `<head>`의 `canonical` / `og:url` / `og:image` / `twitter:image`
2. `404.html`은 루트 절대 경로(`/css/style.css`, `/js/...`)를 씁니다 — GitHub Pages가
   `/foo/bar/` 같은 임의 경로에서도 이 파일을 서빙하기 때문입니다. **하위 경로
   배포(`user.github.io/repo/`)로 바꾸면 이 경로들 앞에 `/repo`를 붙여야 합니다.**

## 남은 할 일 (실제 운영 전 확인 필요)

- [x] 지도교수 실제 프로필 사진 적용 (`director.html`, `members.html`)
- [ ] 지도교수 외 구성원 실제 프로필 사진 추가 (현재는 이름 2자 아바타로 대체)
- [ ] Google Scholar 프로필 정확한 URL 연결 (`director.html`)
- [x] 연구실 로고 이미지 적용 (`images/logo.png`, 헤더/푸터/파비콘)
- [ ] Our Lab 활동 사진 추가 (`ACTIVITY_DATA`에 `photo` 필드로)
- [ ] 실제 도메인 연결 여부 결정 (위 "배포 도메인 설정" 참고)
- [ ] **공유용 OG 이미지 제작** — 현재 `images/logo.png`를 쓰고 있으나
      카톡·슬랙 카드에는 1200×630 커버 이미지가 적합합니다
- [ ] **Lectures 종료 학기 확인** — 아래 4과목은 Status가 `Closed`인데 종료 학기가
      기록되어 있지 않아 "YYYY SEASON 개설"로만 표시 중입니다.
      실제 종료 학기를 알려주시면 반영합니다.
      - 인간공학 및 작업관리 (2021 SPRING 개설)
      - 기술 혁신과 비즈니스 모델 (2025 SPRING 개설)
      - 텍스트 애널리틱스 (2022 FALL 개설)
      - 테크놀로지 인텔리전스 (2024 SPRING 개설)
- [ ] (선택) Pretendard 셀프 호스팅 — 현재 jsdelivr CDN 사용. CDN 장애 시
      `Malgun Gothic`으로 폴백되며 레이아웃이 흔들립니다
- [ ] 논문 DOI 채우기 (`files/publications/index.json`)
