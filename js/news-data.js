/* BILAB news items — newest first */
const NEWS_DATA = [
  {
    date: "2026.06.04 - 06.05",
    tag: "conference",
    text: "경주화백컨벤션센터에서 진행된 2026 대한산업공학회 춘계공동학술대회에 김민경, 김진경 학부연구생이 참가하였습니다. (포스터 2건 발표)",
  },
  {
    date: "2026.04.01",
    tag: "news",
    text: "이혜정, 정의주 학사과정이 학부연구생으로 BILAB에 참여하게 되었습니다. 진심으로 환영합니다!",
  },
  {
    date: "2025.08.01",
    tag: "news",
    text: "김진경, 김형진, 허재성 학사과정이 학부연구생으로 BILAB에 참여하게 되었습니다. 진심으로 환영합니다!",
  },
  {
    date: "2025.03.01",
    tag: "news",
    text: "김민경, 백세린, 이서연 학사과정이 학부연구생으로 BILAB에 참여하게 되었습니다. 진심으로 환영합니다!",
  },
  {
    date: "2024.05.01 – 05.03",
    tag: "conference",
    text: "여수 엑스포컨벤션에서 진행된 2024 대한산업공학회 춘계공동학술대회에 권예지, 이슬 학부연구생이 참가하였습니다. (포스터 2건 발표)",
  },
  {
    date: "2023.11.01",
    tag: "news",
    text: "이예빈, 이예진 학사과정이 학부연구생으로 BILAB에 참여하게 되었습니다. 진심으로 환영합니다!",
  },
  {
    date: "2023.06.01",
    tag: "news",
    text: "이슬 학사과정이 학부연구생으로 BILAB에 참여하게 되었습니다. 진심으로 환영합니다!",
  },
  {
    date: "2023.05.31 – 06.03",
    tag: "conference",
    text: "제주 신화월드에서 진행된 2023 대한산업공학회 춘계공동학술대회에 박지훈 학부연구생이 참가하였습니다. (포스터 1건 발표)",
  },
  {
    date: "2023.03.01",
    tag: "news",
    text: "서수원, 권예지 학사과정이 학부연구생으로 BILAB에 참여하게 되었습니다. 진심으로 환영합니다!",
  },
  {
    date: "2022.11.01",
    tag: "news",
    text: "박지훈 학사과정이 학부연구생으로 BILAB에 참여하게 되었습니다. 진심으로 환영합니다!",
  },
  {
    date: "2022.06.01 – 06.03",
    tag: "conference",
    text: "제주 라마다프라자 호텔에서 진행된 2022 대한산업공학회 춘계공동학술대회에 김정현, 김규한 학부연구생이 참가하였습니다. (포스터 2건 발표)",
  },
  {
    date: "2022.05.01",
    tag: "news",
    text: "최정원 학사과정이 학부연구생으로 BILAB에 참여하게 되었습니다. 진심으로 환영합니다!",
  },
  {
    date: "2021.09.01",
    tag: "news",
    text: "김정현, 김규한 학사과정이 학부연구생으로 BILAB에 참여하게 되었습니다. 진심으로 환영합니다!",
  },
];

/* Our Lab — activity log.
   To attach a photo to an entry, add a "photo" field pointing at a file
   in images/ (e.g. photo: "images/activity/2025-conference.jpg") — the
   card will show that image instead of the plain placeholder. */
const ACTIVITY_DATA = [
  { date: "2025.06.18 – 06.20", title: "2025 대한산업공학회 춘계공동학술대회", people: ["권예지", "백세린", "김민경", "이서연"] },
  { date: "2025.08.20", title: "2024 후기 학위수여식", people: ["권예지"] },
  { date: "2025.02.19", title: "2024 전기 학위수여식", people: ["이슬", "이예빈", "이예진"] },
  { date: "2024.08.25 – 08.29", title: "International Ergonomics Association (IEA) 2024", people: ["이슬", "이예빈", "이예진", "권예지"] },
  { date: "2024.05.02 – 05.03", title: "2024 대한산업공학회 춘계공동학술대회", people: ["권예지", "이슬", "이예빈", "이예진"] },
  { date: "2024.02.21", title: "2023 전기 학위수여식", people: ["김정현", "최정원", "박지훈", "서수원"] },
  { date: "2024.02.02", title: "2024 기술경영경제학회 동계학술대회", people: ["권예지", "서수원", "이슬", "이예빈", "이예진"] },
  { date: "2023.06.01", title: "2023 대한산업공학회 춘계공동학술대회", people: ["권예지", "박지훈", "서수원", "최정원"] },
  { date: "2023.02.15", title: "2022 전기 학위수여식", people: ["김규한"] },
  { date: "2022.06.02", title: "2022 대한산업공학회 춘계공동학술대회", people: ["김규한", "김정현", "최정원"] },
];

/* Alumni — single source of truth for both the members.html table and
   the "Lab Alumni" count on index.html (computed as ALUMNI_DATA.length,
   so adding/removing a row here updates both automatically). */
const ALUMNI_DATA = [
  { name: "김규한", dest: "KT", period: "2021.09.01 → 2023.02.28" },
  { name: "김정현", dest: "NS홈쇼핑", period: "2021.09.01 → 2023.02.28" },
  { name: "최정원", dest: "동국시스템즈", period: "2022.05.01 → 2023.02.28" },
  { name: "박지훈", dest: "연세대학교", period: "2022.11.01 → 2024.02.29" },
  { name: "서수원", dest: "롯데손해보험", period: "2023.03.01 → 2024.02.29" },
  { name: "권예지", dest: "SK AX", period: "2023.03.01 → 2025.08.31" },
  { name: "이슬", dest: "—", period: "2023.06.01 → 2025.02.28" },
  { name: "이예빈", dest: "—", period: "2023.11.01 → 2025.02.28" },
  { name: "이예진", dest: "—", period: "2023.11.01 → 2025.02.28" },
  { name: "백세린", dest: "—", period: "2025.03.01 → 2026.02.28" },
  { name: "김형진", dest: "LS머트리얼즈", period: "2025.08.01 → 2026.02.28" },
];
