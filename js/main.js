/* Page-specific rendering: news list, activity gallery, publication tabs */
(function () {
  function tagLabel(tag) {
    if (tag === "conference") return "CONFERENCE";
    if (tag === "award") return "AWARD";
    if (tag === "seminar") return "SEMINAR";
    return "NEWS";
  }

  // Conference posts consistently read "...에 <이름[, 이름...]> 학부연구생이
  // 참가하였습니다" — bold the presenting student's name(s) right before
  // that phrase so the byline stands out from the rest of the sentence.
  function highlightPresenters(text) {
    return text.replace(
      /([가-힣]{2,4}(?:,\s*[가-힣]{2,4})*)(\s*학부연구생(?:이|들이)\s*참가)/,
      '<b class="presenter">$1</b>$2'
    );
  }

  function renderNews(elId, limit) {
    const el = document.getElementById(elId);
    if (!el || typeof NEWS_DATA === "undefined") return;
    const items = limit ? NEWS_DATA.slice(0, limit) : NEWS_DATA;
    el.innerHTML = items
      .map(
        (n) => `
      <div class="news-row">
        <time>${n.date}</time>
        <span class="tag ${n.tag}">${tagLabel(n.tag)}</span>
        <p>${n.tag === "conference" ? highlightPresenters(n.text) : n.text}</p>
      </div>`
      )
      .join("");
  }

  function renderActivity(elId) {
    const el = document.getElementById(elId);
    if (!el || typeof ACTIVITY_DATA === "undefined") return;
    el.innerHTML = ACTIVITY_DATA.map((a) => {
      const thumb = a.photo
        ? `<img src="${a.photo}" alt="${a.title}">`
        : `BILAB · ${a.date.split(" ")[0].slice(0, 4)}`;
      return `
      <div class="gallery-card">
        <div class="gallery-thumb">${thumb}</div>
        <div class="gallery-body">
          <time>${a.date}</time>
          <h4>${a.title}</h4>
          <div class="people">${a.people.map((p) => `<span>${p}</span>`).join("")}</div>
        </div>
      </div>`;
    }).join("");
  }

  function renderAlumniTable(elId) {
    const el = document.getElementById(elId);
    if (!el || typeof ALUMNI_DATA === "undefined") return;
    el.innerHTML = ALUMNI_DATA.map(
      (a) => `
      <tr>
        <td class="name">${a.name}</td>
        <td class="dest">${a.dest}</td>
        <td class="period">${a.period}</td>
      </tr>`
    ).join("");
  }

  function renderAlumniCount(elId) {
    const el = document.getElementById(elId);
    if (!el || typeof ALUMNI_DATA === "undefined") return;
    el.setAttribute("data-count-target", ALUMNI_DATA.length);
  }

  // Publication counts are never hand-typed: publications.html's own
  // .pub-item markup is the source of truth (see js/pub-counts.js).
  // Feeds the homepage hero stats and, on publications.html itself,
  // the pagehero summary line and each group's item-count label.
  async function initPubStats() {
    if (typeof window.getPubCounts !== "function") return;
    const counts = await window.getPubCounts();
    if (!counts) return;

    const refStat = document.getElementById("statRefereed");
    if (refStat) refStat.setAttribute("data-count-target", counts.refereed);
    const confStat = document.getElementById("statConf");
    if (confStat) confStat.setAttribute("data-count-target", counts.conf);

    const summary = document.getElementById("pubSummary");
    if (summary) {
      summary.textContent = `국제저널 ${counts.refereed}편 · 진행중 연구 ${counts.wip}건 · 학술대회 발표 ${counts.conf}건`;
    }
    const refereedCount = document.getElementById("refereedCount");
    if (refereedCount) refereedCount.textContent = counts.refereed + "편";
    const wipCount = document.getElementById("wipCount");
    if (wipCount) wipCount.textContent = counts.wip + "건";
    const confCount = document.getElementById("confCount");
    if (confCount) confCount.textContent = counts.conf + "건";
  }

  // Animate any <b data-count-target="N"> from 0 to N once it scrolls
  // into view (e.g. the hero stats). Falls back to the plain target
  // value under prefers-reduced-motion or without IntersectionObserver.
  function initCountUp() {
    const els = document.querySelectorAll("[data-count-target]");
    if (!els.length) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const suffixFor = (el) => el.getAttribute("data-count-suffix") || "";

    function animate(el) {
      const target = parseInt(el.getAttribute("data-count-target"), 10);
      const suffix = suffixFor(el);
      if (reduceMotion || Number.isNaN(target)) {
        el.textContent = target + suffix;
        return;
      }
      const dur = 900;
      const start = performance.now();
      function step(now) {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      els.forEach(animate);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    els.forEach((el) => io.observe(el));
  }

  function initNewsToggle() {
    const btn = document.getElementById("newsMoreBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      renderNews("newsList", null);
      btn.style.display = "none";
    });
  }

  // Generic pill-tab filter: clicking a button with data-target="X" shows
  // only the sibling elements whose `groupAttr` equals X (or all, for
  // data-target="all"). Reused for Publications (data-pub-group) and
  // Members (data-member-group) — each page only has one of the two.
  function initTabGroups(barSelector, groupAttr) {
    const bar = document.querySelector(barSelector);
    if (!bar) return;
    const tabs = bar.querySelectorAll(".pub-tab");
    const groups = document.querySelectorAll(`[${groupAttr}]`);
    function activate(tab) {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.getAttribute("data-target");
      groups.forEach((g) => {
        g.style.display =
          target === "all" || g.getAttribute(groupAttr) === target ? "" : "none";
      });
    }
    tabs.forEach((tab) => tab.addEventListener("click", () => activate(tab)));

    // Deep-link support, e.g. members.html#alumni opens straight to that tab.
    const hashTarget = location.hash.slice(1);
    const hashTab = [...tabs].find((t) => t.getAttribute("data-target") === hashTarget);
    if (hashTab) activate(hashTab);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    renderNews("newsListPreview", 6);
    renderNews("newsList", 8);
    initNewsToggle();
    renderActivity("activityGrid");
    renderAlumniTable("alumniTableBody");
    renderAlumniCount("alumniCount");
    initTabGroups(".pub-tabs", "data-pub-group");
    initTabGroups(".member-tabs", "data-member-group");
    await initPubStats();
    initCountUp();
  });
})();
