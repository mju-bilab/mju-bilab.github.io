/* Small interactive canvas illustrations for the four Research Interest
   cards (director.html, research.html) — each visual nods to its topic
   and reacts to the cursor on hover. */
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cards = document.querySelectorAll(".ri-card");
  if (!cards.length) return;

  const C = {
    accent: "47,98,217",
    teal: "14,165,160",
    dim: "152,162,179",
  };

  function debounce(fn, wait) {
    let tm;
    return (...args) => {
      clearTimeout(tm);
      tm = setTimeout(() => fn(...args), wait);
    };
  }

  function initState(type) {
    if (type === "text") {
      const words = ["data", "signal", "trend", "pattern", "review", "insight", "topic", "network"];
      return {
        tokens: words.map((w, i) => ({
          w,
          x: Math.random(),
          row: i % 4,
          drift: (Math.random() - 0.5) * 0.6,
        })),
      };
    }
    if (type === "graph") {
      return {
        nodes: Array.from({ length: 12 }, () => ({
          x: Math.random(),
          y: Math.random(),
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
        })),
      };
    }
    return {};
  }

  const RENDERERS = {
    text(ctx, w, h, t, mouse, hover, state) {
      ctx.font = "600 11px Pretendard, sans-serif";
      ctx.textBaseline = "middle";
      state.tokens.forEach((tok, i) => {
        tok.x += tok.drift * 0.0006;
        if (tok.x > 1.1) tok.x = -0.1;
        if (tok.x < -0.1) tok.x = 1.1;
        const px = tok.x * w;
        const py = (0.16 + tok.row * 0.24) * h + Math.sin(t / 900 + i) * 3;
        const dist = hover ? Math.hypot(px - mouse.x, py - mouse.y) : 999;
        const near = dist < 42;
        ctx.globalAlpha = near ? 1 : 0.4;
        ctx.fillStyle = near ? `rgb(${C.accent})` : `rgb(${C.dim})`;
        ctx.fillText(tok.w, px, py);
        if (near) {
          const tw = ctx.measureText(tok.w).width;
          ctx.strokeStyle = `rgba(${C.teal},0.5)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px - 1, py + 8);
          ctx.lineTo(px + tw + 1, py + 8);
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;
    },

    graph(ctx, w, h, t, mouse, hover, state) {
      const nodes = state.nodes;
      nodes.forEach((n) => {
        n.x += n.vx * 0.0016;
        n.y += n.vy * 0.0016;
        if (n.x < 0.05 || n.x > 0.95) n.vx *= -1;
        if (n.y < 0.1 || n.y > 0.9) n.vy *= -1;
      });
      const pts = nodes.map((n) => ({ x: n.x * w, y: n.y * h }));
      const LINK = w * 0.34;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(${C.accent},${(1 - d / LINK) * 0.28})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      let nearestIdx = -1, nearestD = 9999;
      if (hover) {
        pts.forEach((p, i) => {
          const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (d < nearestD) { nearestD = d; nearestIdx = i; }
        });
      }
      pts.forEach((p, i) => {
        const active = i === nearestIdx && nearestD < 44;
        if (active) {
          pts.forEach((q, j) => {
            if (j === i) return;
            const d = Math.hypot(p.x - q.x, p.y - q.y);
            if (d < LINK) {
              ctx.strokeStyle = `rgba(${C.teal},0.5)`;
              ctx.lineWidth = 1.3;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(q.x, q.y);
              ctx.stroke();
            }
          });
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, active ? 4.2 : 2.2, 0, Math.PI * 2);
        ctx.fillStyle = active ? `rgb(${C.teal})` : `rgba(${C.accent},0.75)`;
        ctx.fill();
      });
    },

    agent(ctx, w, h, t, mouse, hover) {
      const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.36;
      const steps = 4;
      const pts = [];
      for (let i = 0; i < steps; i++) {
        const a = (i / steps) * Math.PI * 2 - Math.PI / 2;
        pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
      }
      ctx.strokeStyle = `rgba(${C.dim},0.4)`;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.closePath();
      ctx.stroke();
      pts.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${C.accent},0.65)`;
        ctx.fill();
      });
      const speed = hover ? 0.0024 : 0.0009;
      const idx = ((t * speed) % (Math.PI * 2)) / (Math.PI * 2) * steps;
      const i0 = Math.floor(idx) % steps, i1 = (i0 + 1) % steps, f = idx - Math.floor(idx);
      const dx = pts[i0].x + (pts[i1].x - pts[i0].x) * f;
      const dy = pts[i0].y + (pts[i1].y - pts[i0].y) * f;
      ctx.beginPath();
      ctx.arc(dx, dy, 4.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${C.teal})`;
      ctx.shadowColor = `rgb(${C.teal})`;
      ctx.shadowBlur = 9;
      ctx.fill();
      ctx.shadowBlur = 0;
    },

    "human-ai"(ctx, w, h, t, mouse, hover) {
      let hx = 0.24 * w, hy = 0.5 * h;
      const ax = 0.76 * w, ay = 0.5 * h;
      if (hover) {
        hx += (mouse.x - hx) * 0.05;
        hy += (mouse.y - hy) * 0.05;
        hx = Math.max(0.1 * w, Math.min(0.42 * w, hx));
        hy = Math.max(0.18 * h, Math.min(0.82 * h, hy));
      }
      ctx.strokeStyle = `rgba(${C.accent},0.32)`;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.quadraticCurveTo(w / 2, h / 2 + Math.sin(t / 500) * 6, ax, ay);
      ctx.stroke();
      for (let k = 0; k < 3; k++) {
        const p = ((t / 1100) + k / 3) % 1;
        const px = hx + (ax - hx) * p;
        const py = hy + (ay - hy) * p + Math.sin(p * Math.PI) * -8;
        ctx.beginPath();
        ctx.arc(px, py, 2.1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${C.teal},0.85)`;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(hx, hy, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${C.accent})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ax, ay, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${C.teal})`;
      ctx.fill();
    },
  };

  function setupCard(card) {
    const canvas = card.querySelector(".ri-canvas");
    const type = card.getAttribute("data-ri");
    const renderer = RENDERERS[type];
    if (!canvas || !renderer) return;

    const ctx = canvas.getContext("2d");
    let w = 0, h = 0;
    let raf = null;
    let hover = false;
    const mouse = { x: -999, y: -999 };
    const state = initState(type);

    function resize() {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function frame(t) {
      ctx.clearRect(0, 0, w, h);
      renderer(ctx, w, h, t, mouse, hover, state);
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

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    card.addEventListener("mouseenter", () => { hover = true; });
    card.addEventListener("mouseleave", () => {
      hover = false;
      mouse.x = -999;
      mouse.y = -999;
    });

    window.addEventListener("resize", debounce(resize, 150));
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    resize();
    if (reduceMotion) renderer(ctx, w, h, 0, mouse, false, state);
    else start();
  }

  cards.forEach(setupCard);
})();
