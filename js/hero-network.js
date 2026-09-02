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

  const LINE_COLOR = "143,178,255"; // accent blue
  const MOUSE_COLOR = "56,214,204"; // teal
  const DOT_COLOR = "200,216,245";

  let width = 0, height = 0, dpr = 1;
  let particles = [];
  let rafId = null;
  let running = false;
  const mouse = { x: -9999, y: -9999, active: false };

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
  }
  function handleLeave() {
    mouse.active = false;
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
