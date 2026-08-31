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
│   ├── components.js     공통 헤더/푸터, 모바일 메뉴, 스크롤 효과
│   ├── main.js           뉴스/활동 렌더링, 논문 탭 필터
│   └── news-data.js       뉴스·활동 데이터 (여기만 수정하면 새 소식 반영됨)
└── images/
```

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
- **활동 사진/기록 추가**: `js/news-data.js`의 `ACTIVITY_DATA` 배열에 항목 추가 (실제 사진을 쓰려면 `images/` 폴더에 넣고 `js/main.js`의 `renderActivity` 함수에서 썸네일을 `<img>`로 교체)
- **구성원 추가/변경**: `members.html`의 `person-card` 블록 복사해서 수정
- **논문 추가**: `publications.html`의 해당 `pub-item` 블록 복사해서 수정
- **메뉴/링크 변경**: `js/components.js`의 `NAV` 배열 수정 (모든 페이지에 자동 반영)

## 남은 할 일 (실제 운영 전 확인 필요)

- [ ] 지도교수·구성원 실제 프로필 사진 추가 (현재는 이니셜 아바타로 대체)
- [ ] Google Scholar 프로필 정확한 URL 연결 (`director.html`)
- [ ] 연구실 로고 이미지가 있다면 `images/`에 추가하고 헤더의 "BI" 마크를 교체
- [ ] 실제 도메인 연결 여부 결정
