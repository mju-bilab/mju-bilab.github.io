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

  // Stable colour index for a person's name. Position-based colouring
  // (nth-child) gave the same student a different colour on every card, so
  // the colour carried no information; hashing the name fixes it in place.
  function chipIndex(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 100000;
    return h % 5;
  }

  function peopleHTML(names) {
    return names
      .map((p) => `<span data-chip="${chipIndex(p)}">${p}</span>`)
      .join("");
  }

  // Until real photos land, the thumbnail carries the one thing we do know
  // about an entry — what kind of event it was. Ten identical grey boxes
  // told the reader nothing. An entry with a `photo` still wins.
  const KIND_ICONS = {
    conference:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v10H4z"/><path d="M9 19h6"/><path d="M12 15v4"/></svg>',
    commencement:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 8l10-4 10 4-10 4z"/><path d="M6 10v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/></svg>',
    seminar:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v11H8l-5 4z"/><path d="M8 10h8"/></svg>',
  };
  const KIND_LABELS = {
    conference: "Conference",
    commencement: "Commencement",
    seminar: "Seminar",
    etc: "Activity",
  };

  function activityKind(a) {
    if (a.kind) return a.kind;
    const t = a.title;
    if (/학위수여식|졸업/.test(t)) return "commencement";
    if (/세미나|Seminar/i.test(t)) return "seminar";
    if (/학술대회|Conference|Association|Symposium/i.test(t)) return "conference";
    return "etc";
  }

  function renderActivity(elId) {
    const el = document.getElementById(elId);
    if (!el || typeof ACTIVITY_DATA === "undefined") return;
    el.innerHTML = ACTIVITY_DATA.map((a) => {
      const kind = activityKind(a);
      const year = a.date.split(" ")[0].slice(0, 4);
      const thumb = a.photo
        ? `<img src="${a.photo}" alt="${a.title}">`
        : `<span class="thumb-kind">${KIND_ICONS[kind] || ""}
             <b>${KIND_LABELS[kind]}</b><i>${year}</i></span>`;
      return `
      <div class="gallery-card">
        <div class="gallery-thumb" data-kind="${kind}">${thumb}</div>
        <div class="gallery-body">
          <time>${a.date}</time>
          <h4>${a.title}</h4>
          <div class="people">${peopleHTML(a.people)}</div>
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

  // Counts the person cards actually on the page rather than trusting a
  // hand-typed number in the headline, which drifts every time someone joins.
  function renderMemberCount() {
    const el = document.getElementById("memberCount");
    if (!el) return;
    const n = document.querySelectorAll('[data-member-group="current"] .person-card').length;
    if (n) el.textContent = String(n);
  }

  // Same idea for the homepage "Research Projects" stat: research.html's
  // own .tl-item list is the source of truth.
  async function renderProjectCount() {
    const el = document.getElementById("projectCount");
    if (!el) return;
    try {
      const res = await fetch("research.html");
      const doc = new DOMParser().parseFromString(await res.text(), "text/html");
      const n = doc.querySelectorAll(".timeline .tl-item").length;
      if (n) el.setAttribute("data-count-target", String(n));
    } catch (e) {
      /* leave whatever the markup already declares */
    }
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
  // into view (e.g. the hero stats), each digit rolling into place like
  // an odometer. Falls back to the plain target value under
  // prefers-reduced-motion or without IntersectionObserver.
  function initCountUp() {
    const els = document.querySelectorAll("[data-count-target]");
    if (!els.length) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const suffixFor = (el) => el.getAttribute("data-count-suffix") || "";

    // Builds a hidden "0-9" strip per digit inside `el` and returns each
    // strip alongside the digit it should land on. A visually-hidden
    // sr-only span carries the real "19편" text so screen readers don't
    // have to parse ten stacked digits per window.
    function buildOdometer(el, target, suffix) {
      el.textContent = "";
      el.classList.add("odo-digits");

      const sr = document.createElement("span");
      sr.className = "sr-only";
      sr.textContent = target + suffix;
      el.appendChild(sr);

      const visual = document.createElement("span");
      visual.className = "odo-visual";
      visual.setAttribute("aria-hidden", "true");
      el.appendChild(visual);

      const strips = String(target)
        .split("")
        .map((d) => {
          const win = document.createElement("span");
          win.className = "odo-window";
          const strip = document.createElement("span");
          strip.className = "odo-strip";
          for (let n = 0; n <= 9; n++) {
            const s = document.createElement("span");
            s.textContent = String(n);
            strip.appendChild(s);
          }
          win.appendChild(strip);
          visual.appendChild(win);
          return { strip, digit: Number(d) };
        });

      if (suffix) {
        const sfx = document.createElement("span");
        sfx.className = "odo-suffix";
        sfx.textContent = suffix;
        visual.appendChild(sfx);
      }
      return strips;
    }

    function animate(el) {
      const target = parseInt(el.getAttribute("data-count-target"), 10);
      const suffix = suffixFor(el);
      if (Number.isNaN(target)) return;
      if (reduceMotion) {
        el.textContent = target + suffix;
        return;
      }
      const strips = buildOdometer(el, target, suffix);
      strips.forEach(({ strip, digit }, i) => {
        setTimeout(() => {
          strip.style.transform = `translateY(-${digit}em)`;
        }, 180 + i * 160);
      });
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
    renderMemberCount();
    await renderProjectCount();
    initTabGroups(".pub-tabs", "data-pub-group");
    initTabGroups(".member-tabs", "data-member-group");
    await initPubStats();
    initCountUp();
  });
})();
