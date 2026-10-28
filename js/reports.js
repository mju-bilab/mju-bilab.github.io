/* Trend Report helpers shared by the Blue Spot list (insights.js) and the
   report detail page (report-detail.js). data: js/insights-data.js */
(function () {
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"]/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]
    );

  // "2026-W44" → { y: "2026", w: "W44" }
  function weekParts(week) {
    const m = /^(\d{4})-W(\d{1,2})$/.exec(week || "");
    return m ? { y: m[1], w: "W" + m[2].padStart(2, "0") } : { y: "", w: week || "" };
  }

  const detailURL = (r) => `report.html?w=${encodeURIComponent(r.week)}`;
  const viewerURL = (r) => `report-view.html?w=${encodeURIComponent(r.week)}`;

  // The cover defaults to the PDF's first page saved next to it
  // (files/reports/2026-W44.pdf → 2026-W44.jpg, made by tools/report-cover.py).
  function coverOf(r) {
    if (r.cover) return r.cover;
    return r.pdf ? r.pdf.replace(/\.pdf$/i, ".jpg") : "";
  }

  // The designed placeholder always sits underneath; the image covers it and
  // removes itself if the file is missing, so a report without a cover still looks set.
  function coverHTML(r, eager) {
    const wk = weekParts(r.week);
    const src = coverOf(r);
    return `
      <span class="rp-cover">
        <span class="rp-cover-ph" aria-hidden="true">
          <small>BLUE SPOT</small>
          <b>${esc(wk.w)}</b>
          <span>${esc(wk.y)}</span>
        </span>
        ${src ? `<img src="${esc(src)}" alt="" ${eager ? "" : 'loading="lazy"'} onerror="this.remove()">` : ""}
      </span>`;
  }

  function cardHTML(r) {
    const wk = weekParts(r.week);
    const tags = (r.tags || []).map((t) => `<span>${esc(t)}</span>`).join("");
    return `
      <a class="rp-card" href="${detailURL(r)}">
        ${coverHTML(r)}
        <span class="rp-card-body">
          <span class="rp-meta"><b>${esc(wk.w)}</b><time>${esc(r.date)}</time></span>
          <strong>${esc(r.title)}</strong>
          ${r.summary ? `<span class="rp-sum">${esc(r.summary)}</span>` : ""}
          ${tags ? `<span class="rp-tags">${tags}</span>` : ""}
        </span>
      </a>`;
  }

  window.BlueSpot = { esc, weekParts, detailURL, viewerURL, coverOf, coverHTML, cardHTML };
})();
