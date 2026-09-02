/* Small interactive canvas illustrations for the four Research Interest
   cards (director.html, research.html) — each visual nods to its topic
   and reacts to the cursor on hover. */
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cards = document.querySelectorAll(".ri-card");
  if (!cards.length) return;

  const C = {
    accent: "52,84,209",
    teal: "18,165,148",
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
      const words = [
        "data", "signal", "trend", "pattern", "review", "insight", "topic", "network",
        "sentiment", "corpus", "embedding", "cluster", "keyword", "semantic", "context",
        "token", "summary", "opinion",
      ];
      return {
        tokens: words.map((w, i) => ({
          w,
          x: (i / words.length + Math.random() * 0.12) % 1,
          row: i % 6,
          size: 9 + Math.random() * 3,
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

  function drawGear(ctx, x, y, r, angle, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = `rgba(${color},${alpha})`;
    ctx.strokeStyle = `rgba(${color},${alpha})`;
    ctx.lineWidth = 1.3;
    const teeth = 8;
    for (let i = 0; i < teeth; i++) {
      ctx.save();
      ctx.rotate((i / teeth) * Math.PI * 2);
      ctx.fillRect(-1, -r - 2, 2, 2.4);
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
    else ctx.rect(x, y, w, h);
  }

  function drawPerson(ctx, x, y, color, alpha, scale) {
    scale = scale || 1;
    ctx.fillStyle = `rgba(${color},${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y - 5 * scale, 3.2 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y + 4 * scale, 5.6 * scale, Math.PI, 0);
    ctx.fill();
  }

  function drawRobot(ctx, x, y, color, alpha, scale) {
    scale = scale || 1;
    ctx.strokeStyle = `rgba(${color},${alpha})`;
    ctx.fillStyle = `rgba(${color},${alpha})`;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(x, y - 11 * scale);
    ctx.lineTo(x, y - 8.4 * scale);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y - 12 * scale, 1 * scale, 0, Math.PI * 2);
    ctx.fill();
    roundRectPath(ctx, x - 4.6 * scale, y - 8 * scale, 9.2 * scale, 6.8 * scale, 1.8 * scale);
    ctx.stroke();
    ctx.fillRect(x - 2.6 * scale, y - 5.4 * scale, 1.6 * scale, 1.6 * scale);
    ctx.fillRect(x + 1 * scale, y - 5.4 * scale, 1.6 * scale, 1.6 * scale);
    roundRectPath(ctx, x - 5.6 * scale, y + 0.6 * scale, 11.2 * scale, 6 * scale, 2 * scale);
    ctx.stroke();
  }

  const RENDERERS = {
    text(ctx, w, h, t, mouse, hover, state) {
      ctx.textBaseline = "middle";
      state.tokens.forEach((tok, i) => {
        tok.x += tok.drift * 0.0006;
        if (tok.x > 1.12) tok.x = -0.12;
        if (tok.x < -0.12) tok.x = 1.12;
        const px = tok.x * w;
        const py = (0.08 + tok.row * 0.168) * h + Math.sin(t / 900 + i) * 2.2;
        const dist = hover ? Math.hypot(px - mouse.x, py - mouse.y) : 999;
        const near = dist < 40;
        ctx.font = `${near ? 700 : 600} ${tok.size}px Pretendard, sans-serif`;
        ctx.globalAlpha = near ? 1 : 0.42;
        ctx.fillStyle = near ? `rgb(${C.accent})` : `rgb(${C.dim})`;
        ctx.fillText(tok.w, px, py);
        if (near) {
          const tw = ctx.measureText(tok.w).width;
          ctx.strokeStyle = `rgba(${C.teal},0.5)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px - 1, py + tok.size * 0.7);
          ctx.lineTo(px + tw + 1, py + tok.size * 0.7);
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
      // a horizontal automation pipeline: 4 gears an AI agent glyph
      // travels across, spinning up whichever gear it's currently over —
      // symbolizes an agent automating a tech-management process.
      const cy = h / 2 + 6;
      const stageX = [0.14, 0.4, 0.62, 0.86].map((f) => f * w);

      ctx.strokeStyle = `rgba(${C.dim},0.4)`;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(stageX[0], cy);
      ctx.lineTo(stageX[3], cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(stageX[3] - 6, cy - 3.5);
      ctx.lineTo(stageX[3] + 3, cy);
      ctx.lineTo(stageX[3] - 6, cy + 3.5);
      ctx.fillStyle = `rgba(${C.dim},0.55)`;
      ctx.fill();

      const speed = hover ? 0.00055 : 0.00022;
      const phase = (t * speed) % 1;
      const agentX = stageX[0] + (stageX[3] - stageX[0]) * phase;

      stageX.forEach((sx, i) => {
        const active = Math.abs(sx - agentX) < 15;
        const r = active ? 7.4 : 6;
        const angle = (active ? t / 160 : t / 1100) * (i % 2 === 0 ? 1 : -1);
        drawGear(ctx, sx, cy, r, angle, active ? C.teal : C.accent, active ? 1 : 0.55);
      });

      // agent glyph: small bot head hovering above the pipeline
      const by = cy - 17;
      ctx.strokeStyle = `rgba(${C.teal},0.45)`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(agentX, by + 9);
      ctx.lineTo(agentX, cy - 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(agentX, by - 6);
      ctx.lineTo(agentX, by - 9);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(agentX, by - 10, 1, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${C.teal})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(agentX, by, 4.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${C.teal})`;
      ctx.shadowColor = `rgb(${C.teal})`;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(agentX - 1.5, by, 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(agentX + 1.5, by, 0.8, 0, Math.PI * 2);
      ctx.fill();
    },

    "human-ai"(ctx, w, h, t, mouse, hover) {
      // a person and a robot linked by a UI/UX chat surface — symbolizes
      // human-AI interaction design rather than an abstract data link.
      let hx = 0.2 * w, hy = 0.6 * h;
      const ax = 0.8 * w, ay = 0.6 * h;
      if (hover) {
        hx += (mouse.x - hx) * 0.05;
        hy += (mouse.y - hy) * 0.05;
        hx = Math.max(0.08 * w, Math.min(0.38 * w, hx));
        hy = Math.max(0.3 * h, Math.min(0.88 * h, hy));
      }

      ctx.strokeStyle = `rgba(${C.accent},0.28)`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.quadraticCurveTo(w / 2, hy + Math.sin(t / 500) * 5, ax, ay);
      ctx.stroke();
      for (let k = 0; k < 2; k++) {
        const p = (t / 1300 + k / 2) % 1;
        const px = hx + (ax - hx) * p;
        const py = hy + (ay - hy) * p + Math.sin(p * Math.PI) * -7;
        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${C.teal},0.7)`;
        ctx.fill();
      }

      // chat / UI bubble floating above the midpoint
      const mx = (hx + ax) / 2, my = Math.min(hy, ay) - 26;
      roundRectPath(ctx, mx - 14, my - 8, 28, 15, 5);
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fill();
      ctx.strokeStyle = `rgba(${C.accent},0.3)`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(mx - 3, my + 7);
      ctx.lineTo(mx, my + 11);
      ctx.lineTo(mx + 3, my + 7);
      ctx.closePath();
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fill();
      for (let i = 0; i < 3; i++) {
        const ph = (t / 480 + i * 0.28) % 1;
        const s = 0.55 + Math.sin(ph * Math.PI) * 0.55;
        ctx.beginPath();
        ctx.arc(mx - 6 + i * 6, my - 0.5, 1.3 * s, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${C.teal},0.9)`;
        ctx.fill();
      }

      drawPerson(ctx, hx, hy, C.accent, 1);
      drawRobot(ctx, ax, ay, C.teal, 1);
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
