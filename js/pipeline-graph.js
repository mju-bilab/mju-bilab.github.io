/* "데이터에서 논문까지" — connects the six data sources BILAB works
   with, through a Research Projects hub, out to the lab's Refereed
   and Conference publication counts. An illustrative pipeline (the
   exact source→project→paper mapping isn't tracked data), not a
   precise Sankey — the point is showing the three stages as one
   connected system rather than three separate lists on the page. */
(function () {
  const canvas = document.getElementById("pipelineCanvas");
  if (!canvas) return;
  const wrap = canvas.closest(".pipeline-illustration");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const DIM = [152, 162, 179];
  const ACCENT = [52, 84, 209];
  const TEAL = [18, 165, 148];
  const NAVY = [14, 32, 56];

  const SOURCES = ["Patent", "GitHub", "SF Media", "Futuristic DB", "Social Media", "Job Posting"];
  const SOURCE_X = 0.14;
  const HUB_X = 0.52;
  const PUB_X = 0.86;
  const PUBS = [
    { label: "Refereed Journals", count: 7, y: 0.3 },
    { label: "Conference Papers", count: 19, y: 0.72 },
  ];

  let w = 0, h = 0, raf = null;
  const mouse = { x: -999, y: -999, active: false };

  function rgba(c, a) {
    return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  function lerpColor(c1, c2, t) {
    return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
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

  function sourceY(i) {
    return (0.1 + i * (0.8 / (SOURCES.length - 1))) * h;
  }

  function nodePositions() {
    const sources = SOURCES.map((label, i) => ({ x: SOURCE_X * w, y: sourceY(i), label }));
    const hub = { x: HUB_X * w, y: 0.5 * h };
    const pubs = PUBS.map((p) => ({ x: PUB_X * w, y: p.y * h, label: p.label, count: p.count }));
    return { sources, hub, pubs };
  }

  function nearest(mx, my, nodes) {
    let best = -1, bestD = 26;
    nodes.forEach((n, i) => {
      const d = Math.hypot(n.x - mx, n.y - my);
      if (d < bestD) { bestD = d; best = i; }
    });
    return best;
  }

  function drawLine(x1, y1, x2, y2, color, alpha, width) {
    ctx.strokeStyle = rgba(color, alpha);
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2, x2, y2);
    ctx.stroke();
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    const { sources, hub, pubs } = nodePositions();
    const k = Math.max(0.6, Math.min(1, w / 640));

    const hoverIdx = mouse.active
      ? nearest(mouse.x, mouse.y, [...sources, hub, ...pubs])
      : -1;
    const hoverSource = hoverIdx >= 0 && hoverIdx < sources.length ? hoverIdx : -1;
    const hoverHub = hoverIdx === sources.length;
    const hoverPub = hoverIdx > sources.length ? hoverIdx - sources.length - 1 : -1;
    const allActive = hoverHub;

    // fan-in: sources -> hub
    sources.forEach((s, i) => {
      const active = allActive || hoverSource === i;
      drawLine(s.x, s.y, hub.x, hub.y, active ? TEAL : DIM, active ? 0.55 : 0.22, active ? 1.6 : 1);
    });
    // fan-out: hub -> pubs
    pubs.forEach((p, i) => {
      const active = allActive || hoverPub === i;
      drawLine(hub.x, hub.y, p.x, p.y, active ? TEAL : ACCENT, active ? 0.6 : 0.3, active ? 1.8 : 1.2);
    });

    // traveling flow dots, staggered per line
    sources.forEach((s, i) => {
      const speed = 0.00028 + (i % 3) * 0.00004;
      const phase = (t * speed + i / sources.length) % 1;
      const x = lerp(s.x, hub.x, phase);
      const y = lerp(s.y, hub.y, phase);
      const c = lerpColor(DIM, ACCENT, phase);
      ctx.beginPath();
      ctx.arc(x, y, 2 * k, 0, Math.PI * 2);
      ctx.fillStyle = rgba(c, 0.85);
      ctx.fill();
    });
    pubs.forEach((p, i) => {
      const speed = 0.00032 + i * 0.00005;
      const phase = (t * speed + i / 2) % 1;
      const x = lerp(hub.x, p.x, phase);
      const y = lerp(hub.y, p.y, phase);
      const c = lerpColor(ACCENT, TEAL, phase);
      ctx.beginPath();
      ctx.arc(x, y, 2.2 * k, 0, Math.PI * 2);
      ctx.fillStyle = rgba(c, 0.9);
      ctx.fill();
    });

    // source nodes + labels (label to the right of the dot)
    ctx.font = `${600} ${10 * k}px Pretendard, sans-serif`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    sources.forEach((s, i) => {
      const active = allActive || hoverSource === i;
      ctx.beginPath();
      ctx.arc(s.x, s.y, active ? 4.4 : 3, 0, Math.PI * 2);
      ctx.fillStyle = active ? rgba(TEAL, 1) : rgba(ACCENT, 0.7);
      ctx.fill();
      ctx.fillStyle = active ? rgba(TEAL, 1) : rgba(NAVY, 0.65);
      ctx.fillText(s.label, s.x + 9 * k, s.y);
    });

    // hub node
    const hubPulse = 1 + Math.sin(t / 500) * 0.08;
    ctx.beginPath();
    ctx.arc(hub.x, hub.y, 12 * k * (allActive ? 1.15 : 1) * hubPulse, 0, Math.PI * 2);
    ctx.fillStyle = allActive ? rgba(TEAL, 0.16) : rgba(ACCENT, 0.14);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hub.x, hub.y, 6 * k, 0, Math.PI * 2);
    ctx.fillStyle = allActive ? rgba(TEAL, 1) : rgba(ACCENT, 0.9);
    ctx.fill();
    ctx.textAlign = "center";
    ctx.font = `700 ${10.5 * k}px Pretendard, sans-serif`;
    ctx.fillStyle = rgba(NAVY, 0.8);
    ctx.fillText("Research Projects", hub.x, hub.y - 20 * k);
    ctx.font = `800 ${13 * k}px Pretendard, sans-serif`;
    ctx.fillStyle = allActive ? rgba(TEAL, 1) : rgba(ACCENT, 1);
    ctx.fillText("8건", hub.x, hub.y + 20 * k);

    // publication nodes + labels (label to the left of the dot)
    ctx.textAlign = "right";
    pubs.forEach((p, i) => {
      const active = allActive || hoverPub === i;
      ctx.beginPath();
      ctx.arc(p.x, p.y, active ? 5 : 3.6, 0, Math.PI * 2);
      ctx.fillStyle = active ? rgba(TEAL, 1) : rgba(TEAL, 0.75);
      ctx.fill();
      ctx.font = `700 ${10 * k}px Pretendard, sans-serif`;
      ctx.fillStyle = active ? rgba(TEAL, 1) : rgba(NAVY, 0.65);
      ctx.fillText(p.label, p.x - 10 * k, p.y - 7 * k);
      ctx.font = `800 ${12 * k}px Pretendard, sans-serif`;
      ctx.fillText(p.count + "편", p.x - 10 * k, p.y + 8 * k);
    });
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
    return (...args) => {
      clearTimeout(tm);
      tm = setTimeout(() => fn(...args), wait);
    };
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

  // Fill in the real publication counts once available; the fallback
  // values above keep the graph legible before (or if) this resolves.
  if (typeof window.getPubCounts === "function") {
    window.getPubCounts().then((counts) => {
      if (!counts) return;
      PUBS[0].count = counts.refereed;
      PUBS[1].count = counts.conf;
    });
  }
})();
