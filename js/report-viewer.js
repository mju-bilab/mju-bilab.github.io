/* Trend Report PDF viewer (report-view.html?w=2026-W44, data: js/insights-data.js).
   Opened from the report's detail page (report.html?w=…), which "← 리포트 소개" returns to.
   PDF.js draws each page onto a canvas, so the report reads the same in
   desktop browsers, phones and in-app browsers (Instagram, KakaoTalk) that
   would otherwise download the file or show only its first page. Pages
   are drawn when they come near the screen and dropped when far away, so a
   long report stays light on a phone. */
(function () {
  // legacy build: also runs in older in-app webviews
  const PDFJS = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174";
  const ZOOMS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];
  const MAX_PIXELS = 8e6; // per canvas — keeps mobile Safari under its canvas memory limit

  const $ = (sel) => document.querySelector(sel);
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  const list = typeof REPORT_DATA !== "undefined" ? REPORT_DATA : [];
  const want = new URLSearchParams(location.search).get("w");
  const index = want ? list.findIndex((r) => r.week === want) : 0;
  const report = list[index];

  let doc, pages = [], zoom = 1, current = 1;
  let stage, pagesEl, counter;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error("load " + src));
      document.head.appendChild(s);
    });
  }

  function weekLabel(week) {
    const m = /^(\d{4})-W(\d{1,2})$/.exec(week || "");
    return m ? `${m[1]} · W${m[2].padStart(2, "0")}` : week || "";
  }

  function fillHeader() {
    $("#rvWeek").textContent = "Trend Report · " + weekLabel(report.week);
    $("#rvTitle").textContent = report.title;
    $("#rvDate").textContent = report.date || "";
    if (report.summary) $("#rvSummary").textContent = report.summary;
    $("#rvTags").innerHTML = (report.tags || []).map((t) => `<span>${esc(t)}</span>`).join("");
    document.title = `${report.title} | Blue Spot | BILAB`;
    $("#rvBack").href = `report.html?w=${encodeURIComponent(report.week)}`;
    const dl = $("#rvDownload");
    dl.href = report.pdf;
    dl.setAttribute("download", (report.week || "report") + ".pdf");
  }

  // older / newer reports at the bottom (REPORT_DATA is newest first)
  function fillSiblings() {
    const link = (r, label) =>
      r ? `<a class="rv-sib" href="report.html?w=${encodeURIComponent(r.week)}"><small>${label}</small><b>${esc(r.title)}</b><span>${esc(r.date)}</span></a>` : "<span></span>";
    $("#rvSiblings").innerHTML = link(list[index + 1], "← 이전 리포트") + link(list[index - 1], "다음 리포트 →");
  }

  function showError(title, text, withFile) {
    $("#rvPages").innerHTML = `<div class="insight-empty rv-error"><b>${title}</b><p>${text}</p>${
      withFile && report ? `<a class="btn btn-primary btn-sm" href="${esc(report.pdf)}" target="_blank" rel="noopener">PDF 파일 바로 열기</a>` : ""
    }<a class="btn btn-outline btn-sm" href="bluespot.html">리포트 목록으로</a></div>`;
    $("#rvBar").hidden = true;
  }

  // ---------- layout & drawing ----------
  // "100%" = the page fills the stage's content box, up to a readable 920px
  function baseWidth() {
    const cs = getComputedStyle(stage);
    return Math.min(stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), 920);
  }

  function layout() {
    const w = Math.round(baseWidth() * zoom);
    pages.forEach((p) => {
      p.el.style.width = w + "px";
      p.el.style.height = Math.round((w * p.h) / p.w) + "px";
    });
    $("#rvZoom").textContent = Math.round(zoom * 100) + "%";
  }

  function draw(p) {
    const cssW = p.el.clientWidth;
    if (!cssW || p.drawnAt === cssW) return;
    let scale = (cssW / p.w) * Math.min(window.devicePixelRatio || 1, 2);
    const px = p.w * p.h * scale * scale;
    if (px > MAX_PIXELS) scale *= Math.sqrt(MAX_PIXELS / px);
    const vp = p.page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(vp.width);
    canvas.height = Math.floor(vp.height);
    if (p.task) p.task.cancel();
    p.task = p.page.render({ canvasContext: canvas.getContext("2d", { alpha: false }), viewport: vp });
    p.drawnAt = cssW;
    p.task.promise.then(
      () => {
        p.task = null;
        p.el.querySelector("canvas")?.remove();
        p.el.appendChild(canvas);
        p.el.classList.add("is-drawn");
      },
      () => { if (p.drawnAt === cssW) p.drawnAt = 0; } // cancelled: draw again next time
    );
  }

  function forget(p) {
    if (p.task) p.task.cancel();
    p.task = null;
    p.drawnAt = 0;
    p.el.querySelector("canvas")?.remove();
    p.el.classList.remove("is-drawn");
  }

  function redrawVisible() {
    pages.forEach((p) => p.near && draw(p));
  }

  // ---------- page tracking ----------
  function pageInView() {
    const mid = stickyOffset() + (window.innerHeight - stickyOffset()) * 0.35;
    for (const p of pages) {
      const r = p.el.getBoundingClientRect();
      if (r.bottom > mid) return p.n;
    }
    return pages.length;
  }

  function updateCounter() {
    current = pageInView();
    counter.textContent = `${current} / ${pages.length}`;
    $("#rvPrev").disabled = current <= 1;
    $("#rvNext").disabled = current >= pages.length;
  }

  // in fullscreen the viewer box scrolls, otherwise the window does
  const fullscreen = () => document.fullscreenElement === $("#rvShell");

  function goTo(n, smooth) {
    const p = pages[Math.max(1, Math.min(pages.length, n)) - 1];
    if (!p) return;
    const behavior = smooth ? "smooth" : "auto";
    const dy = p.el.getBoundingClientRect().top - stickyOffset() - 12;
    if (fullscreen()) $("#rvShell").scrollBy({ top: dy, behavior });
    else window.scrollTo({ top: window.scrollY + dy, behavior });
  }

  // bottom edge of the fixed site header + the sticky toolbar
  function stickyOffset() {
    const bar = $("#rvBar");
    return bar.getBoundingClientRect().bottom;
  }

  function setZoom(z) {
    const keep = current;
    zoom = z;
    layout();
    goTo(keep, false);
    redrawVisible();
  }

  function stepZoom(dir) {
    const i = ZOOMS.findIndex((z) => z >= zoom - 1e-6);
    const next = ZOOMS[Math.max(0, Math.min(ZOOMS.length - 1, i + dir))];
    if (next !== zoom) setZoom(next);
  }

  // ---------- controls ----------
  function wireControls() {
    $("#rvPrev").addEventListener("click", () => goTo(current - 1, true));
    $("#rvNext").addEventListener("click", () => goTo(current + 1, true));
    $("#rvZoomOut").addEventListener("click", () => stepZoom(-1));
    $("#rvZoomIn").addEventListener("click", () => stepZoom(1));
    $("#rvFit").addEventListener("click", () => setZoom(1));
    $("#rvShare").addEventListener("click", share);

    const fs = $("#rvFull");
    const shell = $("#rvShell");
    if (document.fullscreenEnabled) {
      fs.addEventListener("click", () => {
        if (document.fullscreenElement) document.exitFullscreen();
        else shell.requestFullscreen().catch(() => {});
      });
      document.addEventListener("fullscreenchange", () => {
        fs.setAttribute("aria-pressed", String(!!document.fullscreenElement));
        setTimeout(() => { layout(); redrawVisible(); updateCounter(); }, 100);
      });
    } else {
      fs.hidden = true; // iPhone Safari: no element fullscreen
    }

    document.addEventListener("keydown", (e) => {
      if (e.target.closest("input, textarea, select") || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); goTo(current + 1, true); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); goTo(current - 1, true); }
      else if (e.key === "+" || e.key === "=") stepZoom(1);
      else if (e.key === "-") stepZoom(-1);
      else if (e.key === "0") setZoom(1);
    });

    let raf;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateCounter);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    shell.addEventListener("scroll", onScroll, { passive: true });

    let t, lastW = stage.clientWidth;
    window.addEventListener("resize", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        if (stage.clientWidth === lastW) return; // mobile URL-bar show/hide only changes height
        lastW = stage.clientWidth;
        const keep = current;
        layout();
        goTo(keep, false);
        redrawVisible();
      }, 150);
    });
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

  // ---------- boot ----------
  async function open() {
    const status = $("#rvStatus");
    try {
      await loadScript(PDFJS + "/legacy/build/pdf.min.js");
      const lib = window.pdfjsLib;
      // A worker can't be started straight from another origin; a tiny
      // same-origin blob that importScripts() the CDN build can.
      lib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(
        new Blob([`importScripts("${PDFJS}/legacy/build/pdf.worker.min.js");`], { type: "text/javascript" })
      );
      const task = lib.getDocument({
        url: report.pdf,
        cMapUrl: PDFJS + "/cmaps/", // Korean text in PDFs without embedded fonts
        cMapPacked: true,
        standardFontDataUrl: PDFJS + "/standard_fonts/",
      });
      task.onProgress = ({ loaded, total }) => {
        if (total) status.textContent = `리포트를 불러오는 중… ${Math.min(99, Math.round((loaded / total) * 100))}%`;
      };
      doc = await task.promise;
    } catch (e) {
      console.error(e);
      showError("리포트를 불러오지 못했습니다", "네트워크 상태를 확인하거나, PDF 파일을 직접 열어 보세요.", true);
      return;
    }

    pagesEl.innerHTML = "";
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      const vp = page.getViewport({ scale: 1 });
      const el = document.createElement("div");
      el.className = "rv-page";
      el.setAttribute("role", "img");
      el.setAttribute("aria-label", `${n}쪽`);
      el.dataset.n = n;
      pagesEl.appendChild(el);
      pages.push({ n, page, el, w: vp.width, h: vp.height, drawnAt: 0, task: null, near: false });
    }
    layout();

    // draw what is within ~1.5 screens, drop what is further away
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const p = pages[+en.target.dataset.n - 1];
        p.near = en.isIntersecting;
        if (p.near) draw(p);
        else forget(p);
      });
    }, { rootMargin: "150% 0px" });
    pages.forEach((p) => io.observe(p.el));

    $("#rvBar").hidden = false;
    wireControls();
    updateCounter();
  }

  document.addEventListener("DOMContentLoaded", () => {
    stage = $("#rvStage");
    pagesEl = $("#rvPages");
    counter = $("#rvCounter");
    if (!report) {
      $("#rvTitle").textContent = "리포트를 찾을 수 없습니다";
      showError(list.length ? "요청한 리포트가 없습니다" : "아직 발행된 리포트가 없습니다", "목록에서 다른 리포트를 선택해 주세요.", false);
      return;
    }
    fillHeader();
    fillSiblings();
    open();
  });
})();
