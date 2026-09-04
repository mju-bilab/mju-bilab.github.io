/* "데이터에서 통찰로" banner illustration (research.html) — raw data
   (diamond chips) drifts rightward through four process-stage icons
   (matching the four numbered steps), converges into a glowing insight
   point, then that insight is periodically applied to a business node
   on the right, which flashes/grows to show real-world improvement.
   Hovering a stage icon highlights that step of the pipeline. */
(function () {
  const canvas = document.getElementById("processCanvas");
  if (!canvas) return;
  const wrap = canvas.closest(".process-illustration");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Palette is theme-derived, not fixed: INK replaces what used to be a
  // hardcoded dark-navy foreground, which rendered navy-on-navy (i.e.
  // invisible) once the --soft panel behind this canvas went dark.
  // See js/theme-colors.js.
  let DIM, ACCENT, TEAL, INK;
  function syncPalette() {
    const p = (window.BILAB_THEME && window.BILAB_THEME.current) || {
      ink: [14, 32, 56], dim: [152, 162, 179], accent: [52, 84, 209], teal: [18, 165, 148],
    };
    DIM = p.dim; ACCENT = p.accent; TEAL = p.teal; INK = p.ink;
  }
  syncPalette();

  const STAGE_X = [0.13, 0.32, 0.5, 0.68];
  const INSIGHT_X = 0.83;
  const IMPULSE_PERIOD = 2600;

  let w = 0, h = 0, raf = null;
  const mouse = { x: -999, y: -999, active: false };
  const particles = Array.from({ length: 42 }, (_, i) => ({
    seed: Math.random() * 1000,
    offset: i / 42,
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
  function rgba(c, a) { return `rgba(${c[0].toFixed(0)},${c[1].toFixed(0)},${c[2].toFixed(0)},${a})`; }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function nearestStage() {
    if (!mouse.active) return -1;
    let best = -1, bestD = 34;
    STAGE_X.forEach((sx, i) => {
      const d = Math.hypot(sx * w - mouse.x, h / 2 - mouse.y);
      if (d < bestD) { bestD = d; best = i; }
    });
    return best;
  }

  /* --- data chip (raw data unit) --- */
  function drawDataChip(x, y, size, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = rgba(color, alpha);
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.restore();
  }

  /* --- four process-stage icons: discover / filter / method / interpret --- */
  function drawStageIcon(idx, x, y, active, t) {
    const bob = Math.sin(t / 700 + idx) * 2;
    const cy = y + bob;
    const scale = active ? 1.22 : 1;
    const color = active ? TEAL : INK;
    const alpha = active ? 1 : 0.68;

    if (active) {
      ctx.beginPath();
      ctx.arc(x, cy, 16 * scale, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(TEAL, 0.5);
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.strokeStyle = rgba(color, alpha);
    ctx.fillStyle = rgba(color, alpha);
    ctx.lineWidth = 1.6 * scale;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (idx === 0) {
      // discover — magnifying glass
      const r = 5.4 * scale;
      ctx.beginPath();
      ctx.arc(x - 1.5 * scale, cy - 1.5 * scale, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 2.6 * scale, cy + 2.6 * scale);
      ctx.lineTo(x + 6.5 * scale, cy + 6.5 * scale);
      ctx.stroke();
    } else if (idx === 1) {
      // filter — funnel
      ctx.beginPath();
      ctx.moveTo(x - 7 * scale, cy - 6 * scale);
      ctx.lineTo(x + 7 * scale, cy - 6 * scale);
      ctx.lineTo(x + 2 * scale, cy + 1 * scale);
      ctx.lineTo(x + 2 * scale, cy + 7 * scale);
      ctx.lineTo(x - 2 * scale, cy + 7 * scale);
      ctx.lineTo(x - 2 * scale, cy + 1 * scale);
      ctx.closePath();
      ctx.stroke();
    } else if (idx === 2) {
      // method — hexagon (process module)
      const r = 7 * scale;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        const px = x + Math.cos(a) * r, py = cy + Math.sin(a) * r;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, cy, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // interpret — small ascending bar chart
      const bw = 2.6 * scale, gap = 1.6 * scale;
      const heights = [5, 8.5, 12].map((v) => v * scale);
      heights.forEach((hh, i) => {
        const bx = x - 7 * scale + i * (bw + gap);
        ctx.fillRect(bx, cy + 7 * scale - hh, bw, hh);
      });
    }

    ctx.font = "700 10px Pretendard, sans-serif";
    ctx.fillStyle = active ? rgba(TEAL, 1) : rgba(INK, 0.62);
    ctx.textAlign = "center";
    ctx.fillText(String(idx + 1).padStart(2, "0"), x, cy + 24);
  }

  function drawInsight(t) {
    const x = INSIGHT_X * w, y = h / 2;
    const pulse = 1 + Math.sin(t / 550) * 0.16;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t / 4000);
    ctx.strokeStyle = rgba(TEAL, 0.55);
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 8 * pulse, Math.sin(a) * 8 * pulse);
      ctx.lineTo(Math.cos(a) * 13 * pulse, Math.sin(a) * 13 * pulse);
      ctx.stroke();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(x, y, 5.4 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = rgba(TEAL, 1);
    ctx.shadowColor = rgba(TEAL, 1);
    ctx.shadowBlur = 13;
    ctx.fill();
    ctx.shadowBlur = 0;
    return { x, y };
  }

  /* --- business impact node: briefcase + growth bars, flashes when the
     insight signal (traveling dot) arrives from the insight point --- */
  function drawBusiness(t, insightPos, hoverBoost, x, k) {
    const y = h / 2;
    const phase = (t % IMPULSE_PERIOD) / IMPULSE_PERIOD;

    // traveling signal dot: insight -> business
    const dx = insightPos.x + (x - insightPos.x) * phase;
    const dy = insightPos.y + (y - insightPos.y) * phase - Math.sin(phase * Math.PI) * 10;
    if (phase > 0.02) {
      ctx.beginPath();
      ctx.arc(dx, dy, 2.6, 0, Math.PI * 2);
      ctx.fillStyle = rgba(TEAL, 0.9);
      ctx.shadowColor = rgba(TEAL, 1);
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.strokeStyle = rgba(TEAL, 0.18);
    ctx.setLineDash([2, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(insightPos.x, insightPos.y);
    ctx.quadraticCurveTo((insightPos.x + x) / 2, y - 12, x, y);
    ctx.stroke();
    ctx.setLineDash([]);

    // flash intensity as the signal arrives (last 15% of the cycle)
    const flash = phase > 0.85 ? (phase - 0.85) / 0.15 : 0;
    const boost = Math.max(flash, hoverBoost);
    const scale = 1 + boost * 0.16;

    if (boost > 0.05) {
      ctx.beginPath();
      ctx.arc(x, y, 20 * scale * k, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(TEAL, 0.35 * boost);
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    const color = boost > 0.4 ? TEAL : INK;

    // whole cluster (briefcase, bars, arrow, label) drawn in local
    // coordinates then scaled by pulse * k, so it shrinks together on
    // narrow canvases instead of overflowing the right edge.
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * k, scale * k);

    // briefcase
    ctx.save();
    ctx.translate(0, 3);
    ctx.strokeStyle = rgba(color, 0.85);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-3, -7);
    ctx.lineTo(-3, -9.4);
    ctx.quadraticCurveTo(-3, -11, -1, -11);
    ctx.lineTo(1, -11);
    ctx.quadraticCurveTo(3, -11, 3, -9.4);
    ctx.lineTo(3, -7);
    ctx.stroke();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-8, -7, 16, 11, 2);
    else ctx.rect(-8, -7, 16, 11);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-8, -2.2);
    ctx.lineTo(8, -2.2);
    ctx.stroke();
    ctx.restore();

    // growth bars, taller with more accumulated boost
    const heights = [4, 7, 10.5].map((v) => v + boost * 4);
    heights.forEach((hh, i) => {
      const bx = 12 + i * 5;
      ctx.fillStyle = rgba(i === 2 ? TEAL : color, 0.55 + boost * 0.35);
      ctx.fillRect(bx, 9 - hh, 3, hh);
    });

    // up arrow
    ctx.strokeStyle = rgba(TEAL, 0.75 + boost * 0.25);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(26, -2);
    ctx.lineTo(30, -8 - boost * 2);
    ctx.moveTo(27.4, -6.4 - boost * 2);
    ctx.lineTo(30, -8 - boost * 2);
    ctx.lineTo(28.4, -4.6 - boost * 2);
    ctx.stroke();

    ctx.font = "700 10px Pretendard, sans-serif";
    ctx.fillStyle = rgba(color, 0.7);
    ctx.textAlign = "center";
    ctx.fillText("Business", 0, 26);
    ctx.restore();
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    const cy = h / 2;
    const active = nearestStage();
    const bK = Math.max(0.55, Math.min(1, w / 620));
    const bX = w - 10 - 30 * bK;
    const businessHover =
      mouse.active && Math.hypot(bX - mouse.x, cy - mouse.y) < 30 ? 1 : 0;

    particles.forEach((pt) => {
      const p = (t * pt.speed + pt.offset) % 1;
      const boost = active >= 0 && Math.abs(p - STAGE_X[active]) < 0.06 ? 1 : 0;
      const amp = h * 0.32 * Math.pow(1 - p, 1.5);
      const x = 0.03 * w + p * (INSIGHT_X - 0.03) * w;
      const y = cy + Math.sin(pt.seed * 12.9) * amp + Math.sin(t / 900 + pt.seed) * (3 + boost * 2);
      const color = colorForProgress(p);
      const size = (2.6 + boost * 1.6) * (1 - p * 0.3);
      drawDataChip(x, y, size, color, 0.6 + boost * 0.35);
    });

    STAGE_X.forEach((sx, i) => drawStageIcon(i, sx * w, cy, i === active, t));
    const insightPos = drawInsight(t);
    drawBusiness(t, insightPos, businessHover, bX, bK);
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
  // Repaint when the theme flips; a paused or reduced-motion canvas has
  // no next frame to pick the new palette up on.
  if (window.BILAB_THEME) {
    window.BILAB_THEME.subscribe(() => {
      syncPalette();
      draw(performance.now());
    });
  }
  window.addEventListener("resize", debounce(resize, 150));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  resize();
  if (reduceMotion) draw(0);
  else start();
})();
