/* Interactive data-network canvas for the home hero and every pagehero.
   Particles drift and link to nearby particles + the cursor — a lightweight
   nod to graph/network analysis, BILAB's own research area. Density scales
   with the container's area, so it's automatically lighter on the shorter
   pageheroes than on the full home hero. */
(function () {
  const canvas = document.querySelector(".hero-canvas");
  if (!canvas) return;
  const heroSection = canvas.closest(".hero, .pagehero");
  if (!heroSection) return;

  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Ripples are a home-hero-only flourish (clicking, or just moving the
  // cursor, sends a water-like wave through the data network) — the
  // shorter pageheroes keep just the plain particle network.
  const isFullHero = heroSection.classList.contains("hero");

  const LINE_COLOR = "110,134,232"; // accent blue, brightened for the dark hero (Deep Signal)
  const MOUSE_COLOR = "63,207,198"; // teal, same
  const DOT_COLOR = "200,216,245";

  let width = 0, height = 0, dpr = 1;
  let particles = [];
  let ripples = [];
  let lastMoveRipple = 0;
  let lastMoveX = -9999, lastMoveY = -9999;
  let rafId = null;
  let running = false;
  const mouse = { x: -9999, y: -9999, active: false };

  function spawnRipple(x, y, opts) {
    ripples.push({
      x, y,
      start: performance.now(),
      duration: opts.duration,
      maxR: opts.maxR,
      color: opts.color,
      rings: opts.rings,
    });
    if (ripples.length > 14) ripples.shift();
  }

  // Expanding rings (like drops on water) that also gently nudge any
  // nearby particle outward as the wavefront passes through it.
  function drawRipples() {
    if (!ripples.length) return;
    const now = performance.now();
    ripples = ripples.filter((r) => now - r.start < r.duration);
    for (const r of ripples) {
      const p = (now - r.start) / r.duration;
      const eased = 1 - Math.pow(1 - p, 2);
      for (let i = 0; i < r.rings; i++) {
        const ringP = eased - i * 0.14;
        if (ringP <= 0) continue;
        const radius = ringP * r.maxR;
        const alpha = (1 - ringP) * 0.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r.color},${alpha.toFixed(3)})`;
        ctx.lineWidth = 1.3;
        ctx.stroke();
      }
      const frontR = eased * r.maxR;
      const band = 20;
      for (const pt of particles) {
        const dx = pt.x - r.x, dy = pt.y - r.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0.001 && Math.abs(dist - frontR) < band) {
          const push = (1 - Math.abs(dist - frontR) / band) * 0.5 * (1 - p);
          pt.x += (dx / dist) * push;
          pt.y += (dy / dist) * push;
        }
      }
    }
  }

  function resize() {
    const rect = heroSection.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
  }

  function initParticles() {
    const density = Math.floor((width * height) / 16000);
    const count = Math.max(26, Math.min(80, density));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.26,
      vy: (Math.random() - 0.5) * 0.26,
      r: Math.random() * 1.5 + 1,
    }));
  }

  function drawFrame() {
    ctx.clearRect(0, 0, width, height);

    if (isFullHero) drawRipples();

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x <= 0 || p.x >= width) p.vx *= -1;
      if (p.y <= 0 || p.y >= height) p.vy *= -1;
      p.x = Math.max(0, Math.min(width, p.x));
      p.y = Math.max(0, Math.min(height, p.y));
    }

    const LINK_DIST = 130;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < LINK_DIST) {
          const o = (1 - dist / LINK_DIST) * 0.32;
          ctx.strokeStyle = `rgba(${LINE_COLOR},${o.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    if (mouse.active) {
      const MOUSE_DIST = 190;
      for (const p of particles) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MOUSE_DIST) {
          const o = (1 - dist / MOUSE_DIST) * 0.6;
          ctx.strokeStyle = `rgba(${MOUSE_COLOR},${o.toFixed(3)})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
          p.x += dx * 0.0016;
          p.y += dy * 0.0016;
        }
      }
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${MOUSE_COLOR},0.9)`;
      ctx.fill();
    }

    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${DOT_COLOR},0.85)`;
      ctx.fill();
    }
  }

  function loop() {
    drawFrame();
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running || reduceMotion) return;
    running = true;
    loop();
  }
  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  }

  function toLocal(clientX, clientY) {
    const rect = heroSection.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }
  function handleMove(e) {
    const point = e.touches ? e.touches[0] : e;
    const p = toLocal(point.clientX, point.clientY);
    mouse.x = p.x;
    mouse.y = p.y;
    mouse.active = p.x >= 0 && p.x <= width && p.y >= 0 && p.y <= height;

    if (isFullHero && mouse.active && !reduceMotion) {
      const now = performance.now();
      const moved = Math.hypot(p.x - lastMoveX, p.y - lastMoveY);
      if (now - lastMoveRipple > 450 && moved > 40) {
        spawnRipple(p.x, p.y, { duration: 750, maxR: 55, color: LINE_COLOR, rings: 1 });
        lastMoveRipple = now;
        lastMoveX = p.x;
        lastMoveY = p.y;
      }
    }
  }
  function handleLeave() {
    mouse.active = false;
  }
  function handleClick(e) {
    if (!isFullHero || reduceMotion) return;
    const p = toLocal(e.clientX, e.clientY);
    spawnRipple(p.x, p.y, { duration: 1100, maxR: 170, color: MOUSE_COLOR, rings: 2 });
  }

  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  window.addEventListener("resize", debounce(resize, 150));
  heroSection.addEventListener("mousemove", handleMove);
  heroSection.addEventListener("mouseleave", handleLeave);
  heroSection.addEventListener("touchmove", handleMove, { passive: true });
  heroSection.addEventListener("touchend", handleLeave);
  heroSection.addEventListener("click", handleClick);
  heroSection.addEventListener("touchstart", (e) => {
    if (!e.touches[0]) return;
    handleClick(e.touches[0]);
  }, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  resize();
  if (reduceMotion) {
    drawFrame();
  } else {
    start();
  }
})();
