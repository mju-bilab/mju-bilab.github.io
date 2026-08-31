/* Page-specific rendering: news list, activity gallery, publication tabs */
(function () {
  function tagLabel(tag) {
    if (tag === "conference") return "CONFERENCE";
    if (tag === "award") return "AWARD";
    if (tag === "seminar") return "SEMINAR";
    return "NEWS";
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
        <p>${n.text}</p>
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

  function initNewsToggle() {
    const btn = document.getElementById("newsMoreBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      renderNews("newsList", null);
      btn.style.display = "none";
    });
  }

  function initPubTabs() {
    const tabs = document.querySelectorAll(".pub-tab");
    if (!tabs.length) return;
    const groups = document.querySelectorAll("[data-pub-group]");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const target = tab.getAttribute("data-target");
        groups.forEach((g) => {
          g.style.display =
            target === "all" || g.getAttribute("data-pub-group") === target ? "" : "none";
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderNews("newsListPreview", 6);
    renderNews("newsList", 8);
    initNewsToggle();
    renderActivity("activityGrid");
    initPubTabs();
  });
})();
