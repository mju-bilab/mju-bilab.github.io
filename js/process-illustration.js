/* "데이터에서 통찰로" banner illustration (research.html) — raw data
   drifts rightward, is worked on by four researcher nodes (matching the
   four steps in the numbered list), and converges into a glowing insight
   point. Hovering a researcher node highlights that stage of the pipeline. */
(function () {
  const canvas = document.getElementById("processCanvas");
  if (!canvas) return;
  const wrap = canvas.closest(".process-illustration");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const DIM = [152, 162, 179];
  const ACCENT = [47, 98, 217];
  const TEAL = [14, 165, 160];
  const NAVY = [15, 37, 68];

  const STAGE_X = [0.2, 0.42, 0.64, 0.86];
  const INSIGHT_X = 0.96;

  let w = 0, h = 0, raf = null;
  const mouse = { x: -999, y: -999, active: false };
  const particles = Array.from({ length: 46 }, (_, i) => ({
    seed: Math.random() * 1000,
    offset: i / 46,
    speed: 0.00006 + Math.random() * 0.00002,
  }));

  function lerp(a, b, t) { return a + (b - a) * t; }
  function lerpColor(c1, c2, t) {
    return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
  }
  function colorForProgress(p) {
    if (p < 0.55) return lerpColor(DIM, ACCENT, p / 0.55);
    return lerpColor(ACCENT, TEAL, (p - 0.55) / 0.45);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function nearestStage(t) {
    if (!mouse.active) return -1;
    let best = -1, bestD = 34;
    STAGE_X.forEach((sx, i) => {
      const d = Math.hypot(sx * w - mouse.x, h / 2 - mouse.y);
      if (d < bestD) { bestD = d; best = i; }
    });
    return best;
  }

  function drawResearcher(x, y, active, t, idx) {
    const bob = Math.sin(t / 700 + idx) * 2;
    const cy = y + bob;
    const scale = active ? 1.25 : 1;
    if (active) {
      ctx.beginPath();
      ctx.arc(x, cy - 2, 15 * scale, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${TEAL.join(",")},0.5)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.fillStyle = active ? `rgb(${TEAL.join(",")})` : `rgb(${NAVY.join(",")})`;
    // head
    ctx.beginPath();
    ctx.arc(x, cy - 6 * scale, 3.4 * scale, 0, Math.PI * 2);
    ctx.fill();
    // shoulders
    ctx.beginPath();
    ctx.arc(x, cy + 4 * scale, 6 * scale, Math.PI, 0);
    ctx.fill();
    ctx.font = "700 10px Pretendard, sans-serif";
    ctx.fillStyle = active ? `rgb(${TEAL.join(",")})` : `rgba(${NAVY.join(",")},0.55)`;
    ctx.textAlign = "center";
    ctx.fillText(String(idx + 1).padStart(2, "0"), x, cy + 22);
  }

  function drawInsight(t) {
    const x = INSIGHT_X * w, y = h / 2;
    const pulse = 1 + Math.sin(t / 550) * 0.18;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t / 4000);
    ctx.strokeStyle = `rgba(${TEAL.join(",")},0.55)`;
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 9 * pulse, Math.sin(a) * 9 * pulse);
      ctx.lineTo(Math.cos(a) * 15 * pulse, Math.sin(a) * 15 * pulse);
      ctx.stroke();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(x, y, 6 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${TEAL.join(",")})`;
    ctx.shadowColor = `rgb(${TEAL.join(",")})`;
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    const cy = h / 2;
    const active = nearestStage(t);

    particles.forEach((pt) => {
      let p = ((t * pt.speed + pt.offset) % 1);
      const boost = active >= 0 && Math.abs(p - STAGE_X[active]) < 0.06 ? 1 : 0;
      const amp = (h * 0.34) * Math.pow(1 - p, 1.5);
      const x = 0.04 * w + p * (INSIGHT_X - 0.04) * w;
      const y = cy + Math.sin(pt.seed * 12.9) * amp + Math.sin(t / 900 + pt.seed) * (3 + boost * 2);
      const [r, g, b] = colorForProgress(p);
      ctx.beginPath();
      ctx.arc(x, y, (1.5 + boost * 1.1) * (1 - p * 0.25), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r.toFixed(0)},${g.toFixed(0)},${b.toFixed(0)},${0.55 + boost * 0.35})`;
      ctx.fill();
    });

    STAGE_X.forEach((sx, i) => drawResearcher(sx * w, cy, i === active, t, i));
    drawInsight(t);
  }

  function frame(t) {
    draw(t);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (raf || reduceMotion) return;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  function debounce(fn, wait) {
    let tm;
    return (...args) => { clearTimeout(tm); tm = setTimeout(() => fn(...args), wait); };
  }

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });
  (wrap || canvas).addEventListener("mouseleave", () => {
    mouse.active = false;
    mouse.x = -999;
    mouse.y = -999;
  });
  window.addEventListener("resize", debounce(resize, 150));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  resize();
  if (reduceMotion) draw(0);
  else start();
})();
