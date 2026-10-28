/* Trend Report detail page (report.html?w=2026-W44, data: js/insights-data.js).
   Cover, facts, summary and key points of one report, with "리포트 읽기"
   going on to the PDF viewer (report-view.html), then related reports
   (most shared keywords first) and the previous / next issue. */
(function () {
  const B = window.BlueSpot;
  const $ = (sel) => document.querySelector(sel);
  const esc = B.esc;

  const list = typeof REPORT_DATA !== "undefined" ? REPORT_DATA : [];
  const want = new URLSearchParams(location.search).get("w");
  const index = want ? list.findIndex((r) => r.week === want) : 0;
  const report = list[index];

  function notFound() {
    $("#rdWeek").textContent = "Trend Report";
    $("#rdTitle").textContent = list.length ? "리포트를 찾을 수 없습니다" : "첫 리포트를 준비하고 있습니다";
    $("#rdSummary").textContent = list.length
      ? "주소가 바뀌었거나 삭제된 리포트입니다. 목록에서 다시 찾아 주세요."
      : "매주 발행되는 비즈니스 트렌드 리포트가 곧 이곳에 게시됩니다.";
    $("#rdActions").innerHTML = `<a href="bluespot.html" class="btn btn-primary">리포트 목록 →</a>`;
    $("#rdCover").hidden = true;
    document.querySelector(".rd-head").classList.add("is-empty");
  }

  function fillHead() {
    const wk = B.weekParts(report.week);
    document.title = `${report.title} | Blue Spot | BILAB`;
    $("#rdCover").innerHTML = report.pdf
      ? `<a href="${B.viewerURL(report)}" aria-label="리포트 읽기">${B.coverHTML(report, true)}</a>`
      : B.coverHTML(report, true);
    $("#rdWeek").textContent = `Trend Report · ${wk.y} · ${wk.w}`;
    $("#rdTitle").textContent = report.title;

    const facts = [["발행일", report.date], ["분량", report.pages ? `${report.pages}쪽` : ""], ["형식", report.pdf ? "PDF" : ""]];
    $("#rdFacts").innerHTML = facts
      .filter((f) => f[1])
      .map((f) => `<div><dt>${f[0]}</dt><dd>${esc(f[1])}</dd></div>`)
      .join("");
    if (report.summary) $("#rdSummary").textContent = report.summary;
    $("#rdTags").innerHTML = (report.tags || []).map((t) => `<span>${esc(t)}</span>`).join("");

    $("#rdActions").innerHTML = report.pdf
      ? `<a href="${B.viewerURL(report)}" class="btn btn-primary">리포트 읽기 →</a>
         <a href="${esc(report.pdf)}" download="${esc(report.week)}.pdf" class="btn btn-outline">PDF 다운로드</a>
         ${cardnewsButton()}
         <button type="button" class="btn btn-outline" id="rdShare">공유</button>`
      : `${cardnewsButton()}<button type="button" class="btn btn-outline" id="rdShare">공유</button>`;
    $("#rdShare").addEventListener("click", share);
  }

  // the same week's card news, opened in the Blue Spot slide viewer
  function cardnewsButton() {
    const has = typeof CARDNEWS_DATA !== "undefined" && CARDNEWS_DATA.some((c) => c.week === report.week);
    return has
      ? `<a href="bluespot.html?cn=${encodeURIComponent(report.week)}#cardnews" class="btn btn-outline">카드뉴스로 보기</a>`
      : "";
  }

  function fillPoints() {
    const points = report.highlights || [];
    if (!points.length) return;
    $("#rdPoints").innerHTML = points.map((p) => `<li>${esc(p)}</li>`).join("");
    if (report.pdf)
      $("#rdPointsCta").innerHTML = `<a href="${B.viewerURL(report)}" class="btn btn-primary btn-sm">전체 리포트 읽기 →</a>`;
    $("#rdPointsSection").hidden = false;
  }

  // up to four others: most keywords in common, then the most recent
  function fillRelated() {
    const mine = new Set(report.tags || []);
    const related = list
      .map((r, i) => ({ r, i, score: (r.tags || []).filter((t) => mine.has(t)).length }))
      .filter((x) => x.r !== report)
      .sort((a, b) => b.score - a.score || a.i - b.i)
      .slice(0, 4)
      .map((x) => x.r);
    if (!related.length) return;
    $("#rdRelated").innerHTML = related.map(B.cardHTML).join("");

    // REPORT_DATA is newest first
    const link = (r, label) =>
      r ? `<a class="rv-sib" href="${B.detailURL(r)}"><small>${label}</small><b>${esc(r.title)}</b><span>${esc(r.date)}</span></a>` : "<span></span>";
    $("#rdSiblings").innerHTML = link(list[index + 1], "← 이전 호") + link(list[index - 1], "다음 호 →");
    $("#rdRelatedSection").hidden = false;
  }

  async function share() {
    const data = { title: report.title + " | Blue Spot", url: location.href };
    if (navigator.share) {
      try { await navigator.share(data); } catch (e) { /* closed the share sheet */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(location.href);
      toast("링크를 복사했습니다");
    } catch (e) {
      prompt("이 링크를 복사하세요", location.href);
    }
  }

  let toastTimer;
  function toast(msg) {
    const el = $("#rvToast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!report) return notFound();
    fillHead();
    fillPoints();
    fillRelated();
  });
})();
