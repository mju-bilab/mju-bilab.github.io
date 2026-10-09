/* Lumenizer page: the demo videos play only while on screen (saves battery and data), and
   respect reduced motion by staying paused with controls instead of autoplaying. */
(function () {
  const videos = document.querySelectorAll(".lz-video");
  if (!videos.length) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
