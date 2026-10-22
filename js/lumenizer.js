/* Lumenizer page: the demo videos play only while on screen (saves battery and data), and
   respect reduced motion by staying paused with controls instead of autoplaying. */
(function () {
  const videos = document.querySelectorAll(".lz-video");
  if (!videos.length) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  setupZoom(videos, reduce);

  if (reduce || !("IntersectionObserver" in window)) {
    videos.forEach((v) => {
      v.controls = true;
      v.preload = "metadata";
    });
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        if (entry.isIntersecting) {
          if (v.preload === "none") v.preload = "auto";
          const p = v.play();
          if (p && p.catch) p.catch(() => (v.controls = true));
        } else {
          v.pause();
        }
      });
    },
    { threshold: 0.35 }
  );
  videos.forEach((v) => io.observe(v));

  // A paused tab shouldn't keep decoding video.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) videos.forEach((v) => v.pause());
  });
})();

/* On phones the 16:10 videos shrink to ~320px wide and the app's small text is unreadable, so a
   tap (or the expand button) opens the video in a full-screen dialog: landscape-locked where the
   browser allows it (Android), turned sideways in portrait otherwise (iPhone has no element
   fullscreen; its native controls still offer the system player). Desktop is left untouched. */
function setupZoom(videos, reduce) {
  if (typeof HTMLDialogElement !== "function") return;
  const narrow = window.matchMedia("(max-width: 900px)");

  const dialog = document.createElement("dialog");
  dialog.className = "lz-zoom";
  dialog.innerHTML =
    '<video class="lz-zoom-video" controls loop muted playsinline></video>' +
    '<button type="button" class="lz-zoom-close" aria-label="크게 보기 닫기">' +
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>' +
    "</button>";
  document.body.appendChild(dialog);
  const zv = dialog.querySelector("video");
  let source = null; // the inline video the dialog was opened from
  let opener = null;
  let resume = false;

  function open(v, from) {
    source = v;
    opener = from;
    resume = !v.paused;
    v.pause();
    zv.poster = v.poster;
    zv.replaceChildren(...[...v.querySelectorAll("source")].map((s) => s.cloneNode()));
    zv.setAttribute("aria-label", v.getAttribute("aria-label") || "");
    dialog.setAttribute("aria-label", "크게 보기: " + (v.getAttribute("aria-label") || "기능 영상"));
    zv.load();
    const t = v.currentTime;
    zv.addEventListener("loadedmetadata", () => (zv.currentTime = t), { once: true });
    if (!reduce) zv.play().catch(() => {});

    document.documentElement.classList.add("lz-zoom-open");
    dialog.showModal();
    dialog.querySelector(".lz-zoom-close").focus();
    // Must run inside the tap's user gesture.
    if (document.fullscreenEnabled && dialog.requestFullscreen) {
      dialog
        .requestFullscreen({ navigationUI: "hide" })
        .then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock("landscape"))
        .catch(() => {});
    }
  }

  function cleanup() {
    if (!source) return; // already cleaned up (close button, then the dialog's close event)
    document.documentElement.classList.remove("lz-zoom-open");
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    try {
      screen.orientation && screen.orientation.unlock && screen.orientation.unlock();
    } catch (e) {}
    // Carry the position back so the page video continues where the large view left off.
    const t = zv.readyState > 0 ? zv.currentTime : null;
    zv.pause();
    zv.replaceChildren(); // stop downloading the full-size copy
    zv.load();
    const v = source;
    if (t !== null) {
      if (v.readyState > 0) v.currentTime = t;
      else v.addEventListener("loadedmetadata", () => (v.currentTime = t), { once: true });
    }
    if (resume) v.play().catch(() => {});
    if (opener) opener.focus();
    source = opener = null;
  }

  function close() {
    if (dialog.open) dialog.close();
    cleanup(); // right away: the close event can lag behind (it waits for a rendered frame)
  }

  dialog.querySelector(".lz-zoom-close").addEventListener("click", close);
  dialog.addEventListener("close", cleanup); // Esc / Android back
  // Leaving fullscreen with the system gesture closes the whole view, not just fullscreen.
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && dialog.open) close();
  });

  videos.forEach((v) => {
    const frame = v.closest(".lz-frame");
    if (!frame) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lz-zoom-btn";
    btn.setAttribute("aria-haspopup", "dialog");
    btn.setAttribute("aria-label", "영상 크게 보기");
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    btn.addEventListener("click", () => open(v, btn));
    frame.appendChild(btn);
    // Tapping the picture itself does the same, unless native controls own the tap (reduced motion).
    v.addEventListener("click", () => {
      if (narrow.matches && !v.controls) open(v, btn);
    });
  });
}
