/* Trend Report list and Card News gallery + slide viewer (data: js/insights-data.js) */
(function () {
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"]/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]
    );

  function emptyHTML(title, text) {
    return `<div class="insight-empty"><b>${title}</b><p>${text}</p></div>`;
  }

  /* ---------- Trend Report: latest report up top, then a filterable card grid ---------- */
  const PAGE = 9; // cards shown before "더 보기"

  // Cards rise in as they scroll into view, 0.05s apart within each batch that
  // enters together (one row, or the first screenful). The delay stops growing
  // after the sixth card so a long batch doesn't drag. Only the first render
  // animates; cards swapped in by the filter or "더 보기" just appear.
  function revealCards(grid) {
    const cards = grid.querySelectorAll(".rp-card");
    if (!cards.length || matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    cards.forEach((c) => c.classList.add("rp-rise"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.filter((e) => e.isIntersecting).forEach((e, i) => {
          e.target.style.transitionDelay = Math.min(i, 5) * 0.05 + "s";
          e.target.classList.add("rp-rise-in");
          io.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -40px 0px" }
    );
    cards.forEach((c) => io.observe(c));
  }

  function featuredHTML(r) {
    const B = window.BlueSpot;
    const tags = (r.tags || []).map((t) => `<span>${esc(t)}</span>`).join("");
    return `
      <article class="rp-feature">
        <a class="rp-feature-cover" href="${B.detailURL(r)}" tabindex="-1" aria-hidden="true">${B.coverHTML(r, true)}</a>
        <div class="rp-feature-body">
          <span class="rp-meta"><em class="tag news">Latest</em><time>${esc(r.date)}</time></span>
          <h3><a href="${B.detailURL(r)}">${esc(r.title)}</a></h3>
          ${B.bylineHTML(r)}
          ${r.summary ? `<p>${esc(r.summary)}</p>` : ""}
          ${tags ? `<div class="rp-tags">${tags}</div>` : ""}
          <div class="report-actions">
            <a href="${B.detailURL(r)}" class="btn btn-primary btn-sm">리포트 소개 →</a>
            ${r.pdf ? `<a href="${B.viewerURL(r)}" class="btn btn-outline btn-sm">바로 읽기</a>` : ""}
          </div>
        </div>
      </article>`;
  }

  function renderReports() {
    const el = document.getElementById("reportList");
    if (!el || typeof REPORT_DATA === "undefined" || !window.BlueSpot) return;
    if (!REPORT_DATA.length) {
      el.innerHTML = emptyHTML("첫 리포트를 준비하고 있습니다", "매주 발행되는 Blue Spot Magazine 리포트가 이곳에 차례로 게시됩니다");
      return;
    }

    // tags ordered by how many reports use them
    const counts = {};
    REPORT_DATA.forEach((r) => (r.tags || []).forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
    const tags = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

    el.innerHTML = `
      <div class="rp-feature-slot"></div>
      <div class="rp-toolbar"${REPORT_DATA.length > 1 ? "" : " hidden"}>
        <h3 class="rp-toolbar-title">지난 리포트</h3>
        ${tags.length > 1 ? `<div class="rp-filter" role="group" aria-label="키워드로 거르기">
          <button type="button" aria-pressed="true" data-tag="">전체</button>
          ${tags.map((t) => `<button type="button" aria-pressed="false" data-tag="${esc(t)}">${esc(t)}</button>`).join("")}
        </div>` : ""}
      </div>
      <div class="rp-grid"></div>
      <div class="rp-more" hidden><button type="button" class="btn btn-outline btn-sm">더 보기</button></div>`;

    const slot = el.querySelector(".rp-feature-slot");
    const toolbar = el.querySelector(".rp-toolbar");
    const title = el.querySelector(".rp-toolbar-title");
    const grid = el.querySelector(".rp-grid");
    const more = el.querySelector(".rp-more");
    let tag = "", shown = PAGE, first = true;

    function draw() {
      // "전체": the latest report is featured and the grid holds the rest;
      // a keyword: every matching report, the latest included, goes in the grid
      const items = tag ? REPORT_DATA.filter((r) => (r.tags || []).includes(tag)) : REPORT_DATA.slice(1);
      slot.innerHTML = tag ? "" : featuredHTML(REPORT_DATA[0]);
      title.textContent = tag ? `‘${tag}’ 리포트 ${items.length}편` : "지난 리포트";
      grid.innerHTML = items.slice(0, shown).map(window.BlueSpot.cardHTML).join("");
      more.hidden = items.length <= shown;
      toolbar.hidden = REPORT_DATA.length < 2;
      if (first) revealCards(grid);
      first = false;
    }

    el.querySelectorAll(".rp-filter button").forEach((b) =>
      b.addEventListener("click", () => {
        tag = b.dataset.tag;
        shown = PAGE;
        el.querySelectorAll(".rp-filter button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        draw();
      })
    );
    more.querySelector("button").addEventListener("click", () => {
      shown += PAGE;
      draw();
    });
    draw();
  }

  /* ---------- Card News ---------- */
  function renderCardNews() {
    const el = document.getElementById("cardnewsGrid");
    if (!el || typeof CARDNEWS_DATA === "undefined") return;
    if (!CARDNEWS_DATA.length) {
      el.classList.add("is-empty");
      el.innerHTML = emptyHTML("첫 카드뉴스를 준비하고 있습니다", "매주 발행되는 카드뉴스가 이곳에 차례로 게시됩니다");
      return;
    }
    el.innerHTML = CARDNEWS_DATA.map((c, i) => {
      const n = (c.slides || []).length;
      const cover = n ? `<img src="${esc(c.slides[0])}" alt="" loading="lazy">` : "";
      return `
      <button type="button" class="cardnews-card" data-index="${i}" aria-label="${esc(c.title)} 카드뉴스 보기 (${n}장)">
        <span class="cardnews-cover">${cover}<span class="cardnews-count">${n}장</span></span>
        <span class="cardnews-body">
          <time>${esc(c.date)}</time>
          <b>${esc(c.title)}</b>
          ${window.BlueSpot ? window.BlueSpot.bylineHTML(c) : ""}
          ${c.summary ? `<span>${esc(c.summary)}</span>` : ""}
        </span>
      </button>`;
    }).join("");
    el.querySelectorAll(".cardnews-card").forEach((btn) =>
      btn.addEventListener("click", () => openViewer(Number(btn.dataset.index), btn))
    );
  }

  // Slide viewer: a native <dialog> (focus trap + ESC for free) holding a
  // horizontal scroll-snap track, so touch swipe works without any gesture
  // code; the buttons and arrow keys just scroll the track one slide over.
  let dialog, track, counter, titleEl, authorEl, prevBtn, nextBtn, opener;

  function buildViewer() {
    dialog = document.createElement("dialog");
    dialog.className = "cn-viewer";
    dialog.setAttribute("aria-labelledby", "cnTitle");
    dialog.innerHTML = `
      <div class="cn-head">
        <b id="cnTitle"></b>
        <span class="cn-author" hidden></span>
        <span class="cn-counter" aria-live="polite"></span>
        <button type="button" class="cn-close" aria-label="닫기">×</button>
      </div>
      <div class="cn-stage">
        <button type="button" class="cn-nav cn-prev" aria-label="이전 장">‹</button>
        <div class="cn-track" tabindex="0"></div>
        <button type="button" class="cn-nav cn-next" aria-label="다음 장">›</button>
      </div>
      <a class="cn-report" hidden></a>`;
    document.body.appendChild(dialog);
    track = dialog.querySelector(".cn-track");
    counter = dialog.querySelector(".cn-counter");
    titleEl = dialog.querySelector("#cnTitle");
    authorEl = dialog.querySelector(".cn-author");
    prevBtn = dialog.querySelector(".cn-prev");
    nextBtn = dialog.querySelector(".cn-next");

    const step = (d) => track.scrollBy({ left: d * track.clientWidth, behavior: "smooth" });
    prevBtn.addEventListener("click", () => step(-1));
    nextBtn.addEventListener("click", () => step(1));
    dialog.querySelector(".cn-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    });
    track.addEventListener("scroll", updateCounter, { passive: true });
    dialog.addEventListener("close", () => {
      document.documentElement.classList.remove("nav-open");
      if (opener) opener.focus();
    });
  }

  function updateCounter() {
    const total = track.children.length;
    const i = Math.round(track.scrollLeft / Math.max(track.clientWidth, 1));
    counter.textContent = `${Math.min(i + 1, total)} / ${total}`;
    prevBtn.disabled = i <= 0;
    nextBtn.disabled = i >= total - 1;
  }

  function reportOf(c) {
    if (!c.week || typeof REPORT_DATA === "undefined") return null;
    return REPORT_DATA.find((r) => r.week === c.week) || null;
  }

  function openViewer(index, from) {
    const c = CARDNEWS_DATA[index];
    if (!c) return;
    if (!dialog) buildViewer();
    opener = from;
    titleEl.textContent = c.title;
    const author = window.BlueSpot ? window.BlueSpot.authorOf(c) : "";
    authorEl.textContent = author;
    authorEl.hidden = !author;
    // alts: each slide's text, for screen readers and search; else "제목 N장"
    const alts = c.alts || [];
    track.innerHTML = (c.slides || [])
      .map(
        (src, i) =>
          `<figure class="cn-slide"><img src="${esc(src)}" alt="${esc(alts[i] || `${c.title} ${i + 1}장`)}" ${i > 1 ? 'loading="lazy"' : ""}></figure>`
      )
      .join("");
    // same-week report, if any: a link under the slides
    const report = reportOf(c);
    const link = dialog.querySelector(".cn-report");
    link.hidden = !report;
    dialog.classList.toggle("has-report", !!report);
    if (report) {
      link.href = `report.html?w=${encodeURIComponent(report.week)}`;
      link.textContent = "이번 호 리포트 전체 보기 →";
    }
    dialog.showModal();
    document.documentElement.classList.add("nav-open"); // reuses the menu's scroll lock
    track.scrollLeft = 0;
    updateCounter();
    track.focus();
  }

  // Report / Card News tabs on one page. The hash (#report, #cardnews)
  // selects the tab so the footer and home links can open either directly.
  function initTabs() {
    const tabs = document.querySelectorAll(".insight-tabs .pub-tab");
    if (!tabs.length) return;
    const panels = document.querySelectorAll("[data-insight-group]");
    function activate(target, push) {
      const tab = [...tabs].find((t) => t.dataset.target === target) || tabs[0];
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle("active", on);
        t.setAttribute("aria-selected", String(on));
      });
      panels.forEach((p) => (p.hidden = p.dataset.insightGroup !== tab.dataset.target));
      if (push) history.replaceState(null, "", "#" + tab.dataset.target);
    }
    tabs.forEach((t) => t.addEventListener("click", () => activate(t.dataset.target, true)));
    const fromHash = () => activate(location.hash.slice(1), false);
    window.addEventListener("hashchange", fromHash);
    fromHash();
  }

  // bluespot.html?cn=2026-W44#cardnews opens that week's card news straight away
  // (the report detail page links here)
  function openFromURL() {
    const want = new URLSearchParams(location.search).get("cn");
    if (!want || typeof CARDNEWS_DATA === "undefined") return;
    const i = CARDNEWS_DATA.findIndex((c) => c.week === want);
    if (i >= 0) openViewer(i, document.querySelector(`.cardnews-card[data-index="${i}"]`));
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    renderReports();
    renderCardNews();
    openFromURL();
  });
})();
