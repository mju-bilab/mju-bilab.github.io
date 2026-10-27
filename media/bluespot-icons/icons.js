/* Blue Spot icon set — one geometry, three finishes: "clay" (soft 3D clay),
   "glass" (glassmorphism) and "badge" (flat on a disc with a long shadow). Every icon sits on a 256×256 grid and is
   built from three layers:
     back   — the coloured shape behind
     front  — the main shape (frosted glass / light clay)
     detail — marks on top (white on glass, coloured on clay)
   Part types: rr (rounded rect), c (circle), e (ellipse), p (filled path),
   s (stroked path, `w` = width). `c` = colour key, `cc` = colour override
   for the clay finish only.

   Run `node media/bluespot-icons/icons.js` to rewrite svg/clay,
   svg/glass and svg/badge. preview.html loads this same file to list the icons. */
(function (root) {
  const CLAY = {
    blue: "#5B8DEF", sky: "#7CCBF4", navy: "#3D55C4", coral: "#FF8F85", yellow: "#FFD15C",
    orange: "#FFAA4C", mint: "#5AD2A8", green: "#2FA77E", violet: "#9C83F5", pink: "#FF9DBF",
    cream: "#F3F6FF",
  };
  const GLASS = {
    blue: "#3B82F6", sky: "#38BDF8", navy: "#4F46E5", coral: "#FB7185", yellow: "#FBBF24",
    orange: "#FB923C", mint: "#34D399", green: "#10B981", violet: "#8B5CF6", pink: "#F472B6",
    cream: "#E0E7FF",
  };

  const rr = (x, y, w, h, r, o = {}) => ({ t: "rr", x, y, w, h, r, ...o });
  const c = (cx, cy, r, o = {}) => ({ t: "c", cx, cy, r, ...o });
  const e = (cx, cy, rx, ry, o = {}) => ({ t: "e", cx, cy, rx, ry, ...o });
  const p = (d, o = {}) => ({ t: "p", d, ...o });
  const s = (d, w, o = {}) => ({ t: "s", d, w, ...o });

  function gearPath(cx, cy, rOut, rIn, teeth) {
    const pt = (r, deg) => {
      const a = ((deg - 90) * Math.PI) / 180;
      return `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
    };
    const step = 360 / teeth;
    let d = "";
    for (let i = 0; i < teeth; i++) {
      const a = i * step;
      d += `${i ? "L" : "M"}${pt(rIn, a - step * 0.3)} L${pt(rOut, a - step * 0.18)} L${pt(rOut, a + step * 0.18)} L${pt(rIn, a + step * 0.3)} `;
      d += `A${rIn} ${rIn} 0 0 1 ${pt(rIn, a + step * 0.7)} `;
    }
    return d + "Z";
  }

  const HEART = "M120 214 C60 172 32 140 32 104 C32 76 54 56 80 56 C98 56 112 66 120 80 C128 66 142 56 160 56 C186 56 208 76 208 104 C208 140 180 172 120 214 Z";
  const SPARK = (x, y, k) =>
    `M${x} ${y - 42 * k} C${x + 4 * k} ${y - 12 * k} ${x + 12 * k} ${y - 4 * k} ${x + 42 * k} ${y} C${x + 12 * k} ${y + 4 * k} ${x + 4 * k} ${y + 12 * k} ${x} ${y + 42 * k} C${x - 4 * k} ${y + 12 * k} ${x - 12 * k} ${y + 4 * k} ${x - 42 * k} ${y} C${x - 12 * k} ${y - 4 * k} ${x - 4 * k} ${y - 12 * k} ${x} ${y - 42 * k} Z`;

  const ICONS = [
    {
      id: "trend", ko: "트렌드 · 성장", dc: "coral",
      back: [rr(116, 118, 30, 98, 12, { c: "sky" }), rr(156, 82, 30, 134, 12, { c: "blue" }), rr(196, 40, 30, 176, 12, { c: "navy" })],
      front: [rr(28, 110, 150, 114, 28)],
      detail: [s("M54 196 L86 166 L112 180 L150 140", 12), c(150, 140, 11)],
    },
    {
      id: "insight", ko: "인사이트 · 아이디어", dc: "orange",
      back: [c(160, 88, 58, { c: "yellow", cc: "sky" })],
      front: [p("M76 160 A66 66 0 1 1 156 160 Q148 172 148 184 H84 Q84 172 76 160 Z", { cc: "yellow" }), rr(84, 192, 64, 30, 13, { cc: "cream" })],
      detail: [s("M98 140 Q107 116 116 140 Q125 164 134 140", 9), s("M98 207 H134", 7, { cc: "blue" })],
    },
    {
      id: "search", ko: "탐색 · 리서치", dc: "sky",
      back: [s("M162 162 L212 212", 34, { c: "navy" }), c(106, 106, 80, { c: "blue" })],
      front: [c(106, 106, 58)],
      detail: [s("M74 100 A34 34 0 0 1 100 74", 11)],
    },
    {
      id: "ai", ko: "AI · 기술", dc: "violet",
      back: [
        ...[86, 119, 152].flatMap((x) => [rr(x, 22, 18, 40, 9), rr(x, 194, 18, 40, 9), rr(22, x, 40, 18, 9), rr(194, x, 40, 18, 9)]).map((q) => ({ ...q, c: "violet" })),
        rr(46, 46, 164, 164, 40, { c: "violet" }),
      ],
      front: [rr(62, 62, 132, 132, 30)],
      detail: [p(SPARK(124, 132, 0.95)), p(SPARK(162, 92, 0.36), { cc: "yellow" })],
    },
    {
      id: "global", ko: "글로벌 · 시장", dc: "blue",
      back: [c(148, 108, 78, { c: "blue" })],
      front: [c(114, 142, 80)],
      detail: [e(114, 142, 32, 78, { sw: 8 }), s("M36 142 H192", 8), s("M48 106 H180", 8), s("M48 178 H180", 8)],
    },
    {
      id: "money", ko: "금융 · 투자", dc: "orange",
      back: [rr(124, 118, 102, 34, 17, { c: "yellow", cc: "orange" }), rr(124, 156, 102, 34, 17, { c: "yellow", cc: "orange" }), rr(124, 194, 102, 34, 17, { c: "yellow", cc: "orange" })],
      front: [c(102, 126, 76, { cc: "yellow" })],
      detail: [s("M68 98 L84 156 L102 114 L120 156 L136 98", 11), s("M64 124 H140", 9)],
    },
    {
      id: "rocket", ko: "스타트업 · 런칭", dc: "sky", tf: "rotate(45 128 128)",
      back: [p("M92 126 L56 180 L92 174 Z", { c: "blue" }), p("M164 126 L200 180 L164 174 Z", { c: "blue" }), p("M100 176 Q128 238 156 176 Z", { c: "coral", cc: "orange" })],
      front: [p("M128 30 C168 62 176 116 168 180 H88 C80 116 88 62 128 30 Z")],
      detail: [c(128, 104, 19), c(128, 146, 11)],
    },
    {
      id: "target", ko: "전략 · 목표", dc: "navy",
      back: [c(124, 132, 94, { c: "coral" })],
      front: [c(124, 132, 64)],
      detail: [c(124, 132, 34, { sw: 10, cc: "coral" }), c(124, 132, 11), s("M124 132 L204 52", 10), s("M188 40 L204 52 L216 68", 10)],
    },
    {
      id: "shopping", ko: "소비 · 커머스", dc: "navy",
      back: [rr(96, 64, 132, 140, 30, { c: "pink", cc: "pink" }), s("M84 108 V86 A26 26 0 0 1 136 86 V108", 14, { c: "navy" })],
      front: [rr(40, 98, 140, 128, 30)],
      detail: [c(90, 146, 7), c(130, 146, 7), s("M90 170 Q110 190 130 170", 10, { cc: "coral" })],
    },
    {
      id: "mobile", ko: "앱 · 서비스", dc: "blue",
      back: [rr(108, 32, 104, 172, 28, { c: "sky" })],
      front: [rr(48, 56, 112, 176, 28)],
      detail: [
        rr(88, 72, 32, 8, 4), rr(70, 102, 30, 30, 9, { cc: "coral" }), rr(108, 102, 30, 30, 9, { cc: "yellow" }),
        rr(70, 142, 30, 30, 9, { cc: "mint" }), rr(108, 142, 30, 30, 9, { cc: "violet" }), rr(86, 208, 36, 8, 4),
      ],
    },
    {
      id: "calendar", ko: "주간 · 일정", dc: "blue",
      back: [rr(32, 54, 192, 172, 34, { c: "blue" })],
      front: [rr(50, 98, 156, 110, 22)],
      detail: [
        s("M88 40 V74", 16, { cc: "navy" }), s("M168 40 V74", 16, { cc: "navy" }),
        c(84, 128, 10), c(128, 128, 10), c(172, 128, 10), c(84, 174, 10), c(128, 174, 10),
        s("M160 174 L170 184 L188 162", 10, { cc: "coral" }),
      ],
    },
    {
      id: "megaphone", ko: "뉴스 · 이슈", dc: "navy",
      back: [p("M64 100 L184 48 V208 L64 156 Z", { c: "coral", rs: 12 }), s("M84 160 L98 210", 18, { c: "navy" })],
      front: [rr(30, 94, 58, 68, 22), e(186, 128, 26, 82)],
      detail: [s("M186 98 V158", 10, { cc: "coral" })],
    },
    {
      id: "gear", ko: "제품 · 기술 개발", dc: "navy",
      back: [p(gearPath(128, 128, 94, 74, 8), { c: "blue", rs: 14 })],
      front: [c(128, 128, 52)],
      detail: [c(128, 128, 19, { sw: 10 })],
    },
    {
      id: "report", ko: "리포트 · 문서", dc: "blue",
      back: [rr(94, 28, 126, 166, 24, { c: "sky" })],
      front: [rr(40, 60, 136, 172, 24)],
      detail: [
        s("M70 96 H146", 10), s("M70 124 H146", 10), s("M70 152 H118", 10),
        rr(70, 180, 18, 30, 6, { cc: "coral" }), rr(96, 168, 18, 42, 6, { cc: "yellow" }), rr(122, 188, 18, 22, 6, { cc: "mint" }),
      ],
    },
    {
      id: "chart", ko: "데이터 · 분석", dc: "navy",
      back: [p("M116 140 L116 52 A88 88 0 1 0 204 140 Z", { c: "blue" })],
      front: [p("M132 124 L124 30 A94 94 0 0 1 226 132 Z", { cc: "yellow" })],
      detail: [],
    },
    {
      id: "company", ko: "기업 · 산업", dc: "sky",
      back: [rr(116, 30, 96, 196, 20, { c: "navy" })],
      front: [rr(36, 94, 116, 132, 20)],
      detail: [
        rr(176, 54, 18, 18, 5, { cc: "yellow" }), rr(176, 84, 18, 18, 5, { cc: "yellow" }), rr(176, 114, 18, 18, 5, { cc: "yellow" }),
        rr(60, 118, 26, 22, 7), rr(102, 118, 26, 22, 7), rr(60, 152, 26, 22, 7), rr(102, 152, 26, 22, 7),
        rr(80, 190, 28, 36, 8, { cc: "blue" }),
      ],
    },
    {
      id: "esg", ko: "ESG · 지속가능", dc: "green",
      back: [p("M52 210 C42 120 102 46 218 38 C216 156 142 218 52 210 Z", { c: "mint" })],
      front: [p("M34 220 C54 168 92 138 150 130 C146 186 104 226 34 220 Z", { cc: "cream" })],
      detail: [s("M66 196 C108 152 150 100 196 62", 9)],
    },
    {
      id: "security", ko: "신뢰 · 보안", dc: "mint",
      back: [c(170, 82, 54, { c: "blue" })],
      front: [p("M124 34 L200 62 V118 C200 168 168 206 124 226 C80 206 48 168 48 118 V62 Z")],
      detail: [s("M90 128 L116 154 L162 104", 15)],
    },
    {
      id: "community", ko: "커뮤니티 · SNS", dc: "blue",
      back: [rr(98, 34, 128, 96, 34, { c: "blue" }), p("M178 122 L214 158 L154 128 Z", { c: "blue" })],
      front: [rr(30, 92, 144, 106, 36), p("M60 188 L42 228 L100 194 Z")],
      detail: [c(72, 145, 10), c(102, 145, 10), c(132, 145, 10)],
    },
    {
      id: "like", ko: "반응 · 인기", dc: "coral",
      back: [p(HEART, { c: "coral", cc: "pink" })],
      front: [rr(134, 34, 88, 76, 38)],
      detail: [p("M178 92 C160 80 152 72 152 62 C152 53 158 47 165 47 C171 47 175 51 178 55 C181 51 185 47 191 47 C198 47 204 53 204 62 C204 72 196 80 178 92 Z")],
    },
  ];

  const STAR = (cx, cy, ro, ri, n = 5) => {
    let d = "";
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 ? ri : ro;
      const a = (Math.PI * i) / n - Math.PI / 2;
      d += `${i ? "L" : "M"}${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)} `;
    }
    return d + "Z";
  };

  ICONS.push(
    // ---- business · finance ----
    {
      id: "briefcase", ko: "비즈니스 · 커리어", dc: "navy",
      back: [s("M96 82 V64 Q96 48 112 48 H144 Q160 48 160 64 V82", 14, { c: "navy" }), rr(28, 78, 200, 144, 32, { c: "blue" })],
      front: [rr(44, 128, 168, 78, 22)],
      detail: [rr(110, 114, 36, 30, 9, { cc: "yellow" })],
    },
    {
      id: "team", ko: "팀 · 인재", dc: "blue",
      back: [c(170, 76, 32, { c: "sky" }), p("M118 196 Q118 128 170 128 Q222 128 222 196 Z", { c: "sky", rs: 10 })],
      front: [c(98, 98, 38), p("M34 226 Q34 150 98 150 Q162 150 162 226 Z", { rs: 10 })],
      detail: [c(86, 96, 6), c(110, 96, 6), s("M88 112 Q98 120 108 112", 6, { cc: "coral" })],
    },
    {
      id: "piggy", ko: "저축 · 자산", dc: "navy",
      back: [c(148, 48, 28, { c: "yellow" }), rr(70, 176, 28, 46, 12, { c: "pink" }), rr(140, 176, 28, 46, 12, { c: "pink" }), p("M70 104 L60 66 L104 86 Z", { c: "pink", rs: 10 })],
      front: [e(122, 142, 88, 66, { cc: "pink" }), e(206, 146, 20, 24, { cc: "pink" })],
      detail: [c(160, 124, 8), s("M104 96 H140", 9), c(202, 140, 4), c(212, 152, 4)],
    },
    {
      id: "wallet", ko: "결제 · 핀테크", dc: "navy",
      back: [rr(56, 30, 150, 96, 18, { c: "sky", tf: "rotate(-10 131 78)" })],
      front: [rr(28, 88, 196, 136, 30)],
      detail: [rr(150, 132, 74, 46, 23, { cc: "yellow" }), c(176, 155, 9)],
    },
    {
      id: "stock", ko: "주식 · 증시", dc: "blue",
      back: [
        s("M76 34 V176", 8, { c: "mint" }), rr(60, 62, 32, 90, 10, { c: "mint" }),
        s("M128 56 V200", 8, { c: "coral" }), rr(112, 92, 32, 84, 10, { c: "coral" }),
        s("M180 24 V160", 8, { c: "mint" }), rr(164, 44, 32, 92, 10, { c: "mint" }),
      ],
      front: [rr(24, 148, 208, 82, 26)],
      detail: [s("M50 202 L96 180 L140 192 L206 166", 11)],
    },
    {
      id: "contract", ko: "계약 · 협약", dc: "blue",
      back: [rr(150, 36, 32, 156, 16, { c: "orange", tf: "rotate(32 166 114)" })],
      front: [rr(34, 40, 136, 184, 24)],
      detail: [s("M62 82 H142", 9), s("M62 110 H142", 9), s("M62 138 H118", 9), s("M62 186 Q78 154 92 180 T122 176 T150 178", 7, { cc: "navy" })],
    },
    {
      id: "receipt", ko: "세금 · 비용", dc: "blue",
      back: [c(180, 172, 50, { c: "coral" })],
      front: [p("M44 34 H172 Q180 34 180 42 V214 L164 202 L148 214 L132 202 L116 214 L100 202 L84 214 L68 202 L52 214 L44 208 Z", { rs: 8 })],
      detail: [s("M72 74 H150", 9), s("M72 102 H150", 9), s("M72 130 H126", 9), s("M164 190 L198 156", 8, { cc: "cream" }), c(166, 160, 7, { cc: "cream" }), c(196, 186, 7, { cc: "cream" })],
    },
    {
      id: "crown", ko: "1위 · 프리미엄", dc: "coral",
      back: [c(128, 118, 90, { c: "yellow", cc: "sky" })],
      front: [p("M40 92 L86 134 L128 62 L170 134 L216 92 L200 198 H56 Z", { cc: "yellow", rs: 16 })],
      detail: [c(128, 164, 13), c(86, 170, 8, { cc: "sky" }), c(170, 170, 8, { cc: "sky" })],
    },
    {
      id: "trophy", ko: "성과 · 수상", dc: "orange",
      back: [
        c(170, 80, 50, { c: "yellow", cc: "sky" }),
        s("M78 72 H56 Q40 72 40 90 Q40 124 82 130", 14, { c: "orange" }), s("M178 72 H200 Q216 72 216 90 Q216 124 174 130", 14, { c: "orange" }),
      ],
      front: [p("M74 44 H182 V100 C182 140 158 162 128 162 C98 162 74 140 74 100 Z", { cc: "yellow" }), rr(114, 156, 28, 40, 8, { cc: "yellow" }), rr(84, 192, 88, 30, 12, { cc: "orange" })],
      detail: [p(STAR(128, 102, 26, 11))],
    },
    // ---- tech · AI ----
    {
      id: "robot", ko: "로봇 · 자동화", dc: "navy",
      back: [s("M128 70 V42", 10, { c: "navy" }), c(128, 36, 14, { c: "coral" }), rr(24, 108, 32, 56, 14, { c: "violet" }), rr(200, 108, 32, 56, 14, { c: "violet" }), rr(70, 150, 116, 84, 30, { c: "violet" })],
      front: [rr(50, 68, 156, 128, 42)],
      detail: [c(100, 126, 15, { cc: "sky" }), c(156, 126, 15, { cc: "sky" }), s("M106 164 Q128 178 150 164", 9)],
    },
    {
      id: "neural", ko: "딥러닝 · 네트워크", dc: "violet",
      back: [
        s("M64 70 L128 128 M64 186 L128 128 M196 64 L128 128 M196 192 L128 128", 10, { c: "violet" }),
        c(64, 70, 26, { c: "violet" }), c(64, 186, 26, { c: "pink" }), c(196, 64, 26, { c: "sky" }), c(196, 192, 26, { c: "violet" }),
      ],
      front: [c(128, 128, 54)],
      detail: [p(SPARK(128, 128, 0.62))],
    },
    {
      id: "cloud", ko: "클라우드 · 플랫폼", dc: "blue",
      back: [c(172, 94, 56, { c: "blue" })],
      front: [p("M70 198 C38 198 24 174 28 152 C32 128 54 114 76 118 C82 84 110 64 142 68 C174 72 194 96 196 122 C222 122 236 144 232 166 C228 186 212 198 192 198 Z")],
      detail: [s("M128 178 V128", 13), s("M106 148 L128 126 L150 148", 13)],
    },
    {
      id: "laptop", ko: "개발 · IT", dc: "blue",
      back: [rr(70, 30, 152, 112, 22, { c: "blue" })],
      front: [rr(40, 52, 152, 116, 20), rr(18, 178, 196, 32, 16)],
      detail: [s("M86 92 L66 112 L86 132", 10), s("M146 92 L166 112 L146 132", 10), s("M124 86 L108 138", 10, { cc: "coral" })],
    },
    {
      id: "database", ko: "데이터베이스", dc: "sky",
      back: [rr(52, 52, 152, 164, 44, { c: "blue" })],
      front: [e(128, 74, 76, 30)],
      detail: [s("M54 128 Q128 160 202 128", 9), s("M54 176 Q128 208 202 176", 9)],
    },
    {
      id: "vr", ko: "메타버스 · XR", dc: "navy",
      back: [s("M44 104 Q128 26 212 104", 16, { c: "navy" }), rr(62, 96, 132, 108, 36, { c: "violet" })],
      front: [rr(26, 80, 204, 104, 42)],
      detail: [e(88, 132, 28, 24, { cc: "sky" }), e(168, 132, 28, 24, { cc: "sky" })],
    },
    {
      id: "battery", ko: "배터리 · 에너지", dc: "orange",
      back: [rr(200, 102, 26, 52, 10, { c: "mint" }), rr(58, 88, 92, 80, 16, { c: "mint" })],
      front: [rr(30, 68, 176, 120, 30)],
      detail: [p("M132 86 L94 134 H122 L110 172 L152 120 H124 Z", { cc: "yellow" })],
    },
    {
      id: "lightning", ko: "속보 · 임팩트", dc: "navy",
      back: [c(150, 104, 80, { c: "yellow", cc: "sky" })],
      front: [p("M140 26 L58 142 H118 L98 230 L198 102 H138 Z", { cc: "yellow", rs: 12 })],
      detail: [],
    },
    {
      id: "lock", ko: "개인정보 · 프라이버시", dc: "navy",
      back: [s("M82 112 V86 A46 46 0 0 1 174 86 V112", 22, { c: "navy" }), c(186, 196, 34, { c: "blue" })],
      front: [rr(46, 104, 164, 122, 32)],
      detail: [c(128, 152, 16), rr(121, 156, 14, 34, 7)],
    },
    // ---- marketing · consumer ----
    {
      id: "cart", ko: "장바구니 · 유통", dc: "blue",
      back: [rr(94, 36, 54, 54, 14, { c: "coral" }), rr(150, 50, 46, 40, 12, { c: "yellow" }), s("M24 52 H54 L70 82", 14, { c: "navy" }), c(94, 208, 18, { c: "navy" }), c(180, 208, 18, { c: "navy" })],
      front: [p("M62 78 H224 L204 166 Q200 180 186 180 H92 Q78 180 74 166 Z", { rs: 10 })],
      detail: [s("M104 108 V150", 9), s("M140 108 V150", 9), s("M176 108 V150", 9)],
    },
    {
      id: "gift", ko: "이벤트 · 프로모션", dc: "coral",
      back: [s("M128 86 C100 38 64 62 98 86", 13, { c: "coral" }), s("M128 86 C156 38 192 62 158 86", 13, { c: "coral" }), rr(32, 82, 192, 50, 18, { c: "coral" })],
      front: [rr(46, 122, 164, 104, 24)],
      detail: [rr(114, 122, 28, 104, 6)],
    },
    {
      id: "tag", ko: "가격 · 할인", dc: "navy",
      back: [c(176, 84, 52, { c: "coral" })],
      front: [p("M40 120 L120 40 H200 Q216 40 216 56 V136 L136 216 Q124 228 112 216 L40 144 Q28 132 40 120 Z", { rs: 6 })],
      detail: [c(176, 80, 13, { cc: "coral" }), s("M98 164 L146 116", 9), c(102, 122, 9), c(144, 160, 9)],
    },
    {
      id: "review", ko: "리뷰 · 평점", dc: "orange",
      back: [rr(28, 36, 200, 148, 42, { c: "blue" }), p("M62 172 L44 220 L110 180 Z", { c: "blue" })],
      front: [p(STAR(128, 114, 70, 32), { cc: "yellow", rs: 12 })],
      detail: [],
    },
    {
      id: "video", ko: "영상 · 릴스", dc: "coral",
      back: [rr(26, 46, 204, 156, 42, { c: "coral" })],
      front: [p("M100 86 L176 128 L100 170 Z", { rs: 24 })],
      detail: [s("M52 222 H204", 8, { cc: "coral" }), c(108, 222, 11, { cc: "coral" })],
    },
    {
      id: "camera", ko: "사진 · 콘텐츠", dc: "navy",
      back: [rr(76, 44, 68, 44, 14, { c: "navy" }), rr(26, 70, 204, 152, 38, { c: "navy" })],
      front: [c(128, 146, 54)],
      detail: [c(128, 146, 26, { sw: 10, cc: "sky" }), c(190, 100, 10, { cc: "yellow" })],
    },
    {
      id: "mail", ko: "뉴스레터 · 메일", dc: "blue",
      back: [rr(66, 34, 124, 116, 14, { c: "sky" })],
      front: [rr(28, 96, 200, 130, 28)],
      detail: [s("M42 114 L128 170 L214 114", 10), s("M94 66 H162", 8, { cc: "blue" }), s("M94 90 H140", 8, { cc: "blue" })],
    },
    {
      id: "hashtag", ko: "해시태그 · 바이럴", dc: "pink",
      back: [c(180, 70, 46, { c: "pink" }), c(70, 196, 34, { c: "violet" })],
      front: [rr(40, 40, 176, 176, 50)],
      detail: [s("M108 78 L96 178", 13), s("M158 78 L146 178", 13), s("M74 108 H182", 13), s("M70 148 H178", 13)],
    },
    {
      id: "bell", ko: "알림 · 공지", dc: "coral",
      back: [c(128, 206, 22, { c: "orange" }), c(128, 34, 14, { c: "orange" })],
      front: [p("M128 42 C172 42 188 76 188 114 V150 L210 178 H46 L68 150 V114 C68 76 84 42 128 42 Z", { cc: "yellow", rs: 10 })],
      detail: [c(186, 64, 22)],
    },
    {
      id: "eye", ko: "조회수 · 관심", dc: "navy",
      back: [c(128, 128, 62, { c: "blue" })],
      front: [p("M20 128 Q128 22 236 128 Q128 234 20 128 Z")],
      detail: [c(128, 128, 42, { sw: 14, cc: "blue" }), c(128, 128, 17)],
    },
    // ---- industry · society ----
    {
      id: "factory", ko: "제조 · 산업", dc: "orange",
      back: [c(204, 34, 16, { c: "sky" }), rr(172, 48, 34, 90, 10, { c: "navy" })],
      front: [p("M28 222 V118 L86 152 V118 L144 152 V100 H228 V222 Z", { rs: 10 })],
      detail: [rr(52, 176, 26, 22, 7), rr(100, 176, 26, 22, 7), rr(148, 176, 26, 22, 7), rr(192, 176, 20, 22, 7)],
    },
    {
      id: "car", ko: "모빌리티 · EV", dc: "sky",
      back: [c(80, 182, 28, { c: "navy" }), c(176, 182, 28, { c: "navy" })],
      front: [p("M30 168 V140 Q30 124 48 120 L74 80 Q82 66 100 66 H156 Q174 66 182 80 L208 120 Q226 124 226 140 V168 Q226 180 214 180 H42 Q30 180 30 168 Z", { cc: "coral" })],
      detail: [p("M88 116 L104 88 H124 V116 Z"), p("M136 88 H152 L168 116 H136 Z"), c(52, 146, 8, { cc: "yellow" }), c(204, 146, 8, { cc: "yellow" })],
    },
    {
      id: "truck", ko: "물류 · 배송", dc: "navy",
      back: [rr(22, 62, 140, 122, 20, { c: "orange" })],
      front: [p("M156 98 H196 L232 140 V184 H156 Z", { rs: 12 })],
      detail: [c(72, 196, 22), c(190, 196, 22), p("M172 112 H190 L212 140 H172 Z", { cc: "sky" })],
    },
    {
      id: "airplane", ko: "여행 · 해외", dc: "blue", tf: "rotate(45 128 128)",
      back: [c(128, 128, 86, { c: "sky" })],
      front: [p("M128 26 Q142 26 142 52 V104 L222 150 V174 L142 150 V196 L170 216 V232 L128 220 L86 232 V216 L114 196 V150 L34 174 V150 L114 104 V52 Q114 26 128 26 Z", { rs: 8 })],
      detail: [],
    },
    {
      id: "box", ko: "패키지 · 출시", dc: "orange",
      back: [rr(26, 56, 204, 56, 18, { c: "orange" })],
      front: [rr(42, 96, 172, 130, 22, { cc: "yellow" })],
      detail: [rr(112, 96, 32, 70, 6, { cc: "cream" }), s("M64 196 H104", 9, { cc: "orange" })],
    },
    {
      id: "health", ko: "헬스케어 · 바이오", dc: "coral",
      back: [c(180, 76, 52, { c: "coral" })],
      front: [rr(38, 46, 172, 172, 50)],
      detail: [s("M124 92 V172", 28), s("M84 132 H164", 28)],
    },
    {
      id: "education", ko: "교육 · 캠퍼스", dc: "yellow",
      back: [p("M66 112 V176 Q128 208 190 176 V112 Z", { c: "navy" })],
      front: [p("M128 44 L234 96 L128 148 L22 96 Z", { rs: 12 })],
      detail: [s("M212 104 V166", 8), c(212, 174, 12)],
    },
    {
      id: "home", ko: "부동산 · 주거", dc: "blue",
      back: [rr(164, 46, 30, 64, 8, { c: "navy" }), p("M128 30 L232 120 H24 Z", { c: "coral", rs: 16 })],
      front: [rr(52, 106, 152, 120, 20)],
      detail: [rr(108, 158, 40, 68, 12), rr(70, 132, 26, 26, 7, { cc: "yellow" }), rr(160, 132, 26, 26, 7, { cc: "yellow" })],
    },
    {
      id: "pin", ko: "지역 · 매장", dc: "coral",
      back: [e(128, 222, 66, 16, { c: "navy" }), c(176, 70, 44, { c: "coral" })],
      front: [p("M128 214 C82 166 54 134 54 102 C54 60 88 30 128 30 C168 30 202 60 202 102 C202 134 174 166 128 214 Z")],
      detail: [c(128, 102, 30, { sw: 14 })],
    },
    {
      id: "coffee", ko: "F&B · 라이프", dc: "orange",
      back: [s("M100 70 Q86 54 100 36", 10, { c: "sky" }), s("M140 70 Q126 54 140 36", 10, { c: "sky" }), s("M182 118 H200 Q226 118 226 144 Q226 172 196 172 H182", 16, { c: "orange" })],
      front: [p("M48 94 H190 V156 C190 196 162 222 120 222 C76 222 48 196 48 156 Z")],
      detail: [s("M78 130 H160", 9)],
    },
    // ---- content · basics ----
    {
      id: "clock", ko: "시간 · 타이밍", dc: "navy",
      back: [c(128, 128, 98, { c: "blue" })],
      front: [c(128, 128, 76)],
      detail: [s("M128 128 V82", 12), s("M128 128 L162 150", 12, { cc: "coral" }), c(128, 128, 10)],
    },
    {
      id: "flag", ko: "마일스톤 · 출발", dc: "coral",
      back: [c(160, 98, 58, { c: "coral" }), s("M58 30 V226", 14, { c: "navy" })],
      front: [p("M66 42 H200 L174 92 L200 142 H66 Z", { rs: 12 })],
      detail: [p(STAR(118, 92, 22, 10))],
    },
    {
      id: "puzzle", ko: "전략 · 솔루션", dc: "navy",
      back: [rr(112, 34, 110, 110, 22, { c: "mint" }), c(166, 156, 24, { c: "mint" })],
      front: [rr(34, 112, 110, 110, 22), c(88, 100, 24), c(156, 166, 24)],
      detail: [],
    },
    {
      id: "question", ko: "Q&A · 퀴즈", dc: "violet",
      back: [c(184, 62, 40, { c: "violet" })],
      front: [rr(34, 40, 176, 154, 48), p("M70 184 L54 228 L124 190 Z")],
      detail: [s("M98 96 Q98 68 124 68 Q150 68 150 94 Q150 114 124 122 V136", 15), c(124, 166, 11)],
    },
    {
      id: "checklist", ko: "체크리스트 · 할 일", dc: "mint",
      back: [rr(72, 46, 160, 180, 28, { c: "mint" }), rr(92, 18, 72, 38, 14, { c: "navy" })],
      front: [rr(40, 34, 164, 194, 28)],
      detail: [
        s("M66 88 L78 100 L100 78", 10), s("M118 90 H176", 9, { cc: "blue" }),
        s("M66 136 L78 148 L100 126", 10), s("M118 138 H176", 9, { cc: "blue" }),
        rr(66, 172, 32, 32, 8, { sw: 7, cc: "blue" }), s("M118 188 H160", 9, { cc: "blue" }),
      ],
    },
    {
      id: "alert", ko: "주의 · 리스크", dc: "navy",
      back: [c(180, 70, 46, { c: "coral" })],
      front: [p("M128 34 L228 208 H28 Z", { cc: "yellow", rs: 24 })],
      detail: [s("M128 96 V148", 18), c(128, 182, 12)],
    },
    {
      id: "fire", ko: "핫이슈 · 화제", dc: "yellow",
      back: [c(182, 70, 36, { c: "coral", cc: "pink" })],
      front: [p("M128 26 C150 70 198 92 198 152 C198 196 166 226 128 226 C90 226 58 196 58 152 C58 118 78 96 96 80 C98 108 108 120 120 124 C116 90 112 56 128 26 Z", { cc: "orange" })],
      detail: [p("M128 134 C140 154 160 164 160 186 C160 206 146 218 128 218 C110 218 96 206 96 188 C96 170 112 160 128 134 Z")],
    },
    {
      id: "ranking", ko: "랭킹 · 순위", dc: "navy",
      back: [rr(22, 136, 76, 88, 16, { c: "sky" }), rr(158, 158, 76, 66, 16, { c: "sky" })],
      front: [rr(90, 92, 76, 132, 16, { cc: "yellow" })],
      detail: [s("M118 128 L130 120 V174", 12), p(STAR(128, 60, 26, 11), { cc: "yellow" })],
    },
    {
      id: "sprout", ko: "성장 · 그린", dc: "orange",
      back: [s("M128 150 V100", 10, { c: "green" }), p("M126 150 C126 106 98 78 52 78 C52 118 80 146 126 150 Z", { c: "mint" }), p("M130 150 C130 98 162 62 210 62 C210 110 174 146 130 150 Z", { c: "mint" })],
      front: [rr(62, 136, 132, 26, 12, { cc: "orange" }), p("M74 162 H182 L168 224 H88 Z", { cc: "orange", rs: 10 })],
      detail: [],
    },
    {
      id: "news", ko: "기사 · 미디어", dc: "blue",
      back: [rr(66, 30, 166, 176, 24, { c: "sky" })],
      front: [rr(24, 50, 180, 176, 24)],
      detail: [rr(50, 78, 74, 54, 10, { cc: "coral" }), s("M142 84 H180", 9), s("M142 112 H180", 9), s("M50 158 H180", 9), s("M50 186 H150", 9)],
    }
  );

  const CATS = {
    "비즈니스 · 금융": ["trend", "money", "chart", "company", "briefcase", "team", "piggy", "wallet", "stock", "contract", "receipt", "crown", "trophy", "global"],
    "기술 · AI": ["ai", "robot", "neural", "cloud", "laptop", "database", "vr", "mobile", "gear", "battery", "lightning", "security", "lock"],
    "마케팅 · 소비": ["shopping", "cart", "gift", "tag", "review", "like", "community", "video", "camera", "mail", "hashtag", "bell", "eye", "megaphone"],
    "산업 · 사회": ["factory", "car", "truck", "airplane", "box", "health", "education", "home", "pin", "coffee", "esg", "rocket"],
    "콘텐츠 · 기본": ["insight", "search", "report", "news", "calendar", "clock", "target", "flag", "puzzle", "question", "checklist", "alert", "fire", "ranking", "sprout"],
  };
  for (const [cat, ids] of Object.entries(CATS)) ids.forEach((id) => { const ic = ICONS.find((x) => x.id === id); if (ic) ic.cat = cat; });

  // ---------- rendering ----------
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const toHex = (rgb) => "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
  const mix = (h, to, k) => { const a = hex(h), b = hex(to); return toHex(a.map((v, i) => v + (b[i] - v) * k)); };

  function geom(part, paint) {
    const extra = part.tf ? ` transform="${part.tf}"` : "";
    switch (part.t) {
      case "rr": return `<rect x="${part.x}" y="${part.y}" width="${part.w}" height="${part.h}" rx="${part.r}"${paint}${extra}/>`;
      case "c": return `<circle cx="${part.cx}" cy="${part.cy}" r="${part.r}"${paint}${extra}/>`;
      case "e": return `<ellipse cx="${part.cx}" cy="${part.cy}" rx="${part.rx}" ry="${part.ry}"${paint}${extra}/>`;
      default: return `<path d="${part.d}"${paint}${extra}/>`;
    }
  }
  const isLine = (part) => part.t === "s" || part.sw;
  // a rect's `w` is its width, so only `s` parts take their stroke from `w`
  const lineW = (part) => (part.t === "s" ? part.w : part.sw);
  // paint for a part: lines get a solid stroke (a gradient on a zero-height
  // bbox would paint nothing), shapes get `fill`, optionally rounded off
  // with a same-coloured stroke (`rs`)
  function paintFor(part, fill, solid) {
    if (isLine(part)) return ` fill="none" stroke="${solid}" stroke-width="${lineW(part)}" stroke-linecap="round" stroke-linejoin="round"`;
    const r = part.rs ? ` stroke="${fill}" stroke-width="${part.rs}" stroke-linejoin="round"` : "";
    return ` fill="${fill}"${r}`;
  }

  function renderClay(icon) {
    const used = new Set();
    const colorOf = (part, fallback) => part.cc || part.c || fallback;
    const layer = (parts, fallback, filter) =>
      `<g filter="url(#${filter})">${parts.map((part) => {
        const key = colorOf(part, fallback);
        used.add(key);
        return geom(part, paintFor(part, `url(#g-${key})`, CLAY[key]));
      }).join("")}</g>`;
    const back = layer(icon.back, "blue", "clay");
    const front = layer(icon.front, "cream", "clay-front");
    const detail = layer(icon.detail, icon.dc || "blue", "clay-s");
    const grads = [...used].map((k) =>
      `<linearGradient id="g-${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${mix(CLAY[k], "#ffffff", 0.38)}"/><stop offset=".55" stop-color="${CLAY[k]}"/><stop offset="1" stop-color="${mix(CLAY[k], "#1b2a55", 0.12)}"/></linearGradient>`
    ).join("");
    const inner = (id, d, blur, dark, light, extra = "") => `
    <filter id="${id}" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
      <feOffset in="SourceAlpha" dx="${-d}" dy="${-d * 1.25}" result="o1"/><feGaussianBlur in="o1" stdDeviation="${blur}" result="b1"/>
      <feComposite in="SourceAlpha" in2="b1" operator="out" result="e1"/><feFlood flood-color="#14204a" flood-opacity="${dark}"/><feComposite in2="e1" operator="in" result="shade"/>
      <feOffset in="SourceAlpha" dx="${d * 0.9}" dy="${d * 1.1}" result="o2"/><feGaussianBlur in="o2" stdDeviation="${blur * 0.85}" result="b2"/>
      <feComposite in="SourceAlpha" in2="b2" operator="out" result="e2"/><feFlood flood-color="#ffffff" flood-opacity="${light}"/><feComposite in2="e2" operator="in" result="light"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="shade"/><feMergeNode in="light"/></feMerge>${extra}
    </filter>`;
    const castShadow = (dy, blur, op) =>
      `<feGaussianBlur in="SourceAlpha" stdDeviation="${blur}" result="sb"/><feOffset in="sb" dy="${dy}" result="so"/><feFlood flood-color="#14204a" flood-opacity="${op}"/><feComposite in2="so" operator="in" result="sh"/>`;
    const defs = `<defs>${grads}
    ${inner("clay", 7, 7, 0.26, 0.8)}
    <filter id="clay-front" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
      ${castShadow(7, 7, 0.22)}
      <feOffset in="SourceAlpha" dx="-7" dy="-9" result="o1"/><feGaussianBlur in="o1" stdDeviation="7" result="b1"/>
      <feComposite in="SourceAlpha" in2="b1" operator="out" result="e1"/><feFlood flood-color="#14204a" flood-opacity=".18"/><feComposite in2="e1" operator="in" result="shade"/>
      <feOffset in="SourceAlpha" dx="6" dy="8" result="o2"/><feGaussianBlur in="o2" stdDeviation="6" result="b2"/>
      <feComposite in="SourceAlpha" in2="b2" operator="out" result="e2"/><feFlood flood-color="#ffffff" flood-opacity=".9"/><feComposite in2="e2" operator="in" result="light"/>
      <feMerge><feMergeNode in="sh"/><feMergeNode in="SourceGraphic"/><feMergeNode in="shade"/><feMergeNode in="light"/></feMerge>
    </filter>
    <filter id="clay-s" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
      ${castShadow(3, 2.5, 0.2)}
      <feOffset in="SourceAlpha" dx="-2.5" dy="-3" result="o1"/><feGaussianBlur in="o1" stdDeviation="2.2" result="b1"/>
      <feComposite in="SourceAlpha" in2="b1" operator="out" result="e1"/><feFlood flood-color="#14204a" flood-opacity=".28"/><feComposite in2="e1" operator="in" result="shade"/>
      <feOffset in="SourceAlpha" dx="2" dy="2.5" result="o2"/><feGaussianBlur in="o2" stdDeviation="2" result="b2"/>
      <feComposite in="SourceAlpha" in2="b2" operator="out" result="e2"/><feFlood flood-color="#ffffff" flood-opacity=".75"/><feComposite in2="e2" operator="in" result="light"/>
      <feMerge><feMergeNode in="sh"/><feMergeNode in="SourceGraphic"/><feMergeNode in="shade"/><feMergeNode in="light"/></feMerge>
    </filter>
    <filter id="drop" x="-25%" y="-25%" width="150%" height="160%"><feDropShadow dx="0" dy="12" stdDeviation="11" flood-color="#1b2f6b" flood-opacity=".22"/></filter>
  </defs>`;
    return svg(icon, defs, `<g filter="url(#drop)"><g${icon.tf ? ` transform="${icon.tf}"` : ""}>${back}${front}${detail}</g></g>`);
  }

  // the icon's main colour: its last (front-most) back part
  const mainKey = (icon) => icon.back[icon.back.length - 1].c || "blue";

  function renderGlass(icon) {
    const used = new Set();
    const backParts = icon.back.map((part) => {
      const key = part.c || "blue";
      used.add(key);
      return geom(part, paintFor(part, `url(#g-${key})`, GLASS[key]));
    }).join("");
    const maskShapes = icon.front.map((part) => geom(part, paintFor(part, "#fff", "#fff"))).join("");
    const outline = icon.front.filter((part) => !isLine(part)).map((part) => geom(part, ` fill="none" stroke="url(#rim)" stroke-width="3.5"${part.rs ? ' stroke-linejoin="round"' : ""}`)).join("");
    const detail = icon.detail.map((part) => geom(part, paintFor(part, "#ffffff", "#ffffff"))).join("");
    // the frosted front is tinted with the main back colour, so it still
    // reads on a plain white card where nothing shows through it
    const tint = GLASS[mainKey(icon)];
    const grads = [...used].map((k) =>
      `<linearGradient id="g-${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${mix(GLASS[k], "#ffffff", 0.28)}"/><stop offset="1" stop-color="${mix(GLASS[k], "#0b1640", 0.12)}"/></linearGradient>`
    ).join("");
    const defs = `<defs>${grads}
    <linearGradient id="frost" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".7"/><stop offset=".6" stop-color="${mix(tint, "#ffffff", 0.45)}" stop-opacity=".5"/><stop offset="1" stop-color="${tint}" stop-opacity=".55"/></linearGradient>
    <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".35"/><stop offset="1" stop-color="#ffffff" stop-opacity=".7"/></linearGradient>
    <filter id="blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="13"/></filter>
    <filter id="drop" x="-25%" y="-25%" width="150%" height="160%"><feDropShadow dx="0" dy="12" stdDeviation="11" flood-color="#1b2f6b" flood-opacity=".2"/></filter>
    <filter id="lift" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#0b1640" flood-opacity=".34"/></filter>
    <mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="256" height="256">${maskShapes}</mask>
    <g id="back">${backParts}</g>
  </defs>`;
    const body = `<g filter="url(#drop)"><g${icon.tf ? ` transform="${icon.tf}"` : ""}>
    <use href="#back"/>
    <g mask="url(#m)"><use href="#back" filter="url(#blur)" opacity=".85"/><rect x="-64" y="-64" width="384" height="384" fill="url(#frost)"/></g>
    ${outline}
    <g filter="url(#lift)" opacity=".96">${detail}</g>
  </g></g>`;
    return svg(icon, defs, body);
  }

  // Ballicons-style badge: flat shapes on a coloured disc with a long
  // diagonal shadow (the silhouette repeated down-right, clipped to the disc)
  function renderBadge(icon) {
    const key = mainKey(icon);
    const disc = GLASS[key];
    const T = `translate(128 128) scale(.68) translate(-128 -128)${icon.tf ? " " + icon.tf : ""}`;
    const all = [...icon.back, ...icon.front, ...icon.detail];
    const sil = all.map((part) => geom(part, paintFor(part, "#000", "#000"))).join("");
    const shadow = Array.from({ length: 34 }, (_, i) => `<use href="#sil" x="${(i + 1) * 2.4}" y="${(i + 1) * 2.4}"/>`).join("");
    const flat = (part, color) => geom(part, paintFor(part, color, color));
    const back = icon.back.map((part) => {
      const k = part.c || "blue";
      return flat(part, mix(GLASS[k], "#ffffff", k === key ? 0.42 : 0.12));
    }).join("");
    const front = icon.front.map((part) => flat(part, "#F8FAFF")).join("");
    const detail = icon.detail.map((part) => {
      const k = part.cc || part.c || icon.dc || "blue";
      return flat(part, k === "cream" ? "#ffffff" : mix(GLASS[k], "#0b1640", 0.08));
    }).join("");
    const defs = `<defs>
    <linearGradient id="disc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(disc, "#ffffff", 0.12)}"/><stop offset="1" stop-color="${mix(disc, "#0b1640", 0.1)}"/></linearGradient>
    <clipPath id="clip"><circle cx="128" cy="128" r="116"/></clipPath>
    <g id="sil"><g transform="${T}">${sil}</g></g>
  </defs>`;
    const body = `<circle cx="128" cy="128" r="116" fill="url(#disc)"/>
  <g clip-path="url(#clip)" opacity=".16">${shadow}</g>
  <g transform="${T}">${back}${front}${detail}</g>`;
    return svg(icon, defs, body);
  }

  const svg = (icon, defs, body) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">\n<title>Blue Spot — ${icon.ko.replace(/&/g, "&amp;")}</title>\n${defs}\n${body}\n</svg>\n`;

  const RENDER = { clay: renderClay, glass: renderGlass, badge: renderBadge };
  const api = { ICONS, CATS, RENDER, renderClay, renderGlass, renderBadge };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.BlueSpotIcons = api;

  if (typeof require !== "undefined" && typeof module !== "undefined" && require.main === module) {
    const fs = require("fs");
    const path = require("path");
    for (const [style, render] of Object.entries(RENDER)) {
      const dir = path.join(__dirname, "svg", style);
      fs.mkdirSync(dir, { recursive: true });
      for (const icon of ICONS) fs.writeFileSync(path.join(dir, `${icon.id}.svg`), render(icon));
    }
    const missing = ICONS.filter((ic) => !ic.cat).map((ic) => ic.id);
    if (missing.length) console.warn("no category:", missing.join(", "));
    console.log(`wrote ${ICONS.length} icons × ${Object.keys(RENDER).length} styles`);
  }
})(this);
