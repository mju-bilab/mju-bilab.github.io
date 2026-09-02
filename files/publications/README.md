# Publications PDF — indexing rule

Drop a PDF into this folder named exactly `<id>.pdf`, where `<id>` matches the
`data-pub-id` on that publication's entry in [`publications.html`](../../publications.html).
No HTML/JS edits needed — [`js/pub-pdfs.js`](../../js/pub-pdfs.js) checks for
`files/publications/<id>.pdf` on page load and automatically turns that
paper's title into a link (with a small "PDF ↗" badge) the moment the file
exists. Nothing happens for papers without a matching file — the title just
stays plain text.

## ID → paper

### Refereed Publications
| id | title (year) |
|---|---|
| `ref-2023-platform-roadmap` | Roadmap incorporating data management perspective for platform business model innovation (2023) |
| `ref-2022-problem-oriented-cbr` | Problem-oriented CBR: Finding potential problems from lead user communities (2022) |
| `ref-2021-smartwatch-experience` | A hybrid approach to discern customer experience for facilitating the adoption of smartwatches (2021) |
| `ref-2020-data-roadmapping` | Roadmapping for Data: Concept and Typology of Data-Integrated Smart-Service Roadmaps (2020) |
| `ref-2019-smart-service-concepts` | Developing smart service concepts: Morphological analysis using Novelty-Quality map (2019) |
| `ref-2017-patent-knowledge-patterns` | Identifying dynamic knowledge patterns of business method patents with a hidden Markov model (2017) |
| `ref-2016-futuristic-scenario-building` | Futuristic data-driven scenario building (2016) |

### Work in Progress
| id | title |
|---|---|
| `wip-github-informatics` | GitHub informatics for technological nowcasting |
| `wip-ict-convergence` | How to generate ICT emerging convergence |
| `wip-data-professions-taxonomy` | Toward a taxonomy of data professions |
| `wip-bank-digital-transformation` | 키워드 네트워크 분석을 통한 국내 은행 산업의 디지털전환 전략 현황분석 |
| `wip-sns-persona` | SNS 마케팅 전략 수립을 위한 데이터 기반 바이어 페르소나 생성 연구 |
| `wip-c2c-platform-xai` | What attracts people to C2C platform? |

### Conference Presentations
| id | title (year) |
|---|---|
| `conf-2024-brand-better-life` | What is required to impress upon the market... (2024) |
| `conf-2024-fashion-vertical` | 패션 버티컬 플랫폼의 서비스 다각화... (2024) |
| `conf-2024-naver-place-review` | 네이버 플레이스 리뷰 데이터의 정보적 가치... (2024) |
| `conf-2024-persona-genai` | 페르소나 기반 유저 시나리오 작성을 위한 생성형 AI 활용 (2024) |
| `conf-2023-ota-service-quality` | 온라인 여행사(OTA)의 고객 만족도 향상... (2023) |
| `conf-2022-c2c-motivation` | 소비자간거래(C2C) 플랫폼의 이용 동기 요인... (2022) |
| `conf-2022-ekickboard` | 전동킥보드 공유서비스 운영 개선... (2022) |
| `conf-2019-smartwatch-needs` | Analysis of human needs to promote the adoption of smartwatches (2019) |
| `conf-2019-assistive-tech` | Data-driven analysis for uncovering human needs... assistive technologies (2019) |
| `conf-2019-local-db` | 지방자치단체 통합 데이터베이스 활용 방안 연구 (2019) |
| `conf-2018-open-innovation` | Open Innovation in the Big Data Era (2018) |
| `conf-2018-tech-disclosure` | 신기술의 선 공개 전략을 고려한 다단계 확산 모형 제안 (2018) |
| `conf-2017-sao-network` | 사용자 니즈 분석을 통한 유망기술의 활용 영역 탐색: SAO 네트워크 분석 (2017) |
| `conf-2016-foresight-communities` | Integrating the Foresights of Emerging Technologies from Online Communities (2016) |
| `conf-2016-lead-user-cbr` | How to Utilize Lead User Communities as a Source of New Product Ideas (2016) |
| `conf-2016-novelty-quality-map` | 스마트 제품과 모바일 앱 서비스의 통합 기회 탐색: Novelty-Quality 지도 제안 (2016) |
| `conf-2015-security-forecast` | Forecasting Future Society to Explore Promising Security Technologies (2015) |
| `conf-2015-product-service-systems` | Product-Service Systems within Smart Environment (2015) |
| `conf-2015-future-data-measurement` | 기술예측을 위한 미래 데이터의 적절성 측정 (2015) |

## Adding a new publication later

1. Add a new `.pub-item` block in `publications.html` with a fresh, unique
   `data-pub-id="..."` (pick a short slug, e.g. `ref-2027-my-new-paper`).
2. Name the PDF to match exactly and drop it in this folder.
3. Add a row to the table above so the convention stays documented.
