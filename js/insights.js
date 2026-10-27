/* Trend Report list and Card News gallery + slide viewer (data: js/insights-data.js) */
(function () {
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"]/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]
    );

  function emptyHTML(title, text) {
    return `<div class="insight-empty"><b>${title}</b><p>${text}</p></div>`;
  }

  // "2026-W44" → "W44", shown as the row's badge with the year beneath.
  function weekParts(week) {
    const m = /^(\d{4})-W(\d{1,2})$/.exec(week || "");
    return m ? { y: m[1], w: "W" + m[2].padStart(2, "0") } : { y: "", w: week || "" };
  }

  function reportRowHTML(r, latest) {
    const wk = weekParts(r.week);
    const tags = (r.tags || []).map((t) => `<span>${esc(t)}</span>`).join("");
    const pdf = r.pdf
      ? `<div class="report-actions">
           <a href="${esc(r.pdf)}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">리포트 보기 →</a>
           <a href="${esc(r.pdf)}" download class="btn btn-outline btn-sm">PDF 다운로드</a>
         </div>`
      : "";
    return `
      <article class="report-row${latest ? " latest" : ""}">
        <div class="report-week"><b>${esc(wk.w)}</b><span>${esc(wk.y)}</span></div>
        <div class="report-body">
          <time>${esc(r.date)}${latest ? ' <em class="tag news">Latest</em>' : ""}</time>
          <h3>${esc(r.title)}</h3>
          ${r.summary ? `<p>${esc(r.summary)}</p>` : ""}
          ${tags ? `<div class="people report-tags">${tags}</div>` : ""}
          ${pdf}
        </div>
      </article>`;
  }

  function renderReports() {
    const el = document.getElementById("reportList");
    if (!el || typeof REPORT_DATA === "undefined") return;
    el.innerHTML = REPORT_DATA.length
      ? REPORT_DATA.map((r, i) => reportRowHTML(r, i === 0)).join("")
      : emptyHTML("첫 리포트를 준비하고 있습니다", "매주 발행되는 비즈니스 트렌드 리포트가 이곳에 차례로 게시됩니다");
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
  let dialog, track, counter, titleEl, prevBtn, nextBtn, opener;

  function buildViewer() {
    dialog = document.createElement("dialog");
    dialog.className = "cn-viewer";
    dialog.setAttribute("aria-labelledby", "cnTitle");
    dialog.innerHTML = `
      <div class="cn-head">
        <b id="cnTitle"></b>
        <span class="cn-counter" aria-live="polite"></span>
        <button type="button" class="cn-close" aria-label="닫기">×</button>
      </div>
      <div class="cn-stage">
        <button type="button" class="cn-nav cn-prev" aria-label="이전 장">‹</button>
        <div class="cn-track" tabindex="0"></div>
        <button type="button" class="cn-nav cn-next" aria-label="다음 장">›</button>
      </div>`;
    document.body.appendChild(dialog);
    track = dialog.querySelector(".cn-track");
    counter = dialog.querySelector(".cn-counter");
    titleEl = dialog.querySelector("#cnTitle");
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

  function openViewer(index, from) {
    const c = CARDNEWS_DATA[index];
    if (!c) return;
    if (!dialog) buildViewer();
    opener = from;
    titleEl.textContent = c.title;
    track.innerHTML = (c.slides || [])
      .map(
        (src, i) =>
          `<figure class="cn-slide"><img src="${esc(src)}" alt="${esc(c.title)} ${i + 1}장" ${i > 1 ? 'loading="lazy"' : ""}></figure>`
      )
      .join("");
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

  document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    renderReports();
    renderCardNews();
  });
})();
