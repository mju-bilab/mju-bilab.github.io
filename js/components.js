/* Shared header / footer / nav behavior for all BILAB pages */
(function () {
  const NAV = [
    { href: "index.html", label: "Home", key: "home" },
    { href: "director.html", label: "Director", key: "director" },
    { href: "members.html", label: "Members", key: "members" },
    { href: "research.html", label: "Research", key: "research" },
    { href: "publications.html", label: "Publications", key: "publications" },
    { href: "lectures.html", label: "Lectures", key: "lectures" },
    { href: "activity.html", label: "Our Lab", key: "activity" },
    { href: "contact.html", label: "Contact", key: "contact" },
  ];

  function headerHTML(activeKey) {
    const links = NAV.map(
      (item) =>
        `<a href="${item.href}" class="${item.key === activeKey ? "active" : ""}">${item.label}</a>`
    ).join("");

    return `
    <div class="topbar">
      <div class="wrap">
        <span>Dept. of Industrial &amp; Management Engineering, Myongji University</span>
        <span class="tb-links">
          <a href="https://mju-bilab.tistory.com/" target="_blank" rel="noopener">Tech Blog</a>
          <span class="sep">|</span>
          <a href="https://ideamyongji-admin.github.io" target="_blank" rel="noopener">IDEA 사업단</a>
          <span class="sep">|</span>
          <button type="button" id="themeToggle" class="theme-toggle" aria-label="다크 모드로 전환">Dark</button>
        </span>
      </div>
    </div>
    <header id="siteHeader">
      <nav class="wrap">
        <a href="index.html" class="brand">
          <span class="mark"><img src="images/logo.png" alt="BILAB logo"></span>
          <span class="bt"><b>BILAB</b><span>Business Intelligence Lab · MJU</span></span>
        </a>
        <div class="menu" id="mainMenu">${links}</div>
        <button type="button" class="burger" id="burger" aria-label="메뉴 열기" aria-expanded="false"><span></span><span></span><span></span></button>
      </nav>
    </header>`;
  }

  function footerHTML() {
    return `
    <div class="wrap">
      <div class="foot-grid">
        <div class="foot-col">
          <div class="foot-brand"><span class="mark" style="width:34px;height:34px;"><img src="images/logo.png" alt="BILAB logo"></span><b>BILAB</b></div>
          <span>비즈니스 인텔리전스 연구실<br>Business Intelligence Laboratory</span>
          <span>Dept. of Industrial &amp; Management Engineering<br>Myongji University</span>
        </div>
        <div class="foot-col">
          <h5>Explore</h5>
          <a href="research.html">Research Areas</a>
          <a href="publications.html">Publications</a>
          <a href="lectures.html">Lectures</a>
          <a href="activity.html">Our Lab</a>
        </div>
        <div class="foot-col">
          <h5>People</h5>
          <a href="director.html">Director</a>
          <a href="members.html">Members</a>
          <a href="members.html#alumni">Alumni</a>
          <a href="https://ideamyongji-admin.github.io" target="_blank" rel="noopener">IDEA 사업단 ↗</a>
        </div>
        <div class="foot-col">
          <h5>Contact</h5>
          <a href="mailto:mthan@mju.ac.kr">mthan@mju.ac.kr</a>
          <a href="mailto:mjubilab@gmail.com">mjubilab@gmail.com</a>
          <span>제1공학관 521호 / 541호<br>경기도 용인시 처인구 명지로 116</span>
        </div>
      </div>
      <div class="foot-bottom">
        <span>&copy; <span id="year"></span> Business Intelligence Lab, Myongji University. All rights reserved.</span>
        <span>+82-31-330-6448</span>
      </div>
    </div>`;
  }

  const THEME_KEY = "bilab-theme";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initThemeToggle() {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;
    const root = document.documentElement;

    function label() {
      const current = root.getAttribute("data-theme");
      const isDark =
        current === "dark" ||
        (!current && window.matchMedia("(prefers-color-scheme: dark)").matches);
      btn.textContent = isDark ? "Light" : "Dark";
      btn.setAttribute("aria-label", isDark ? "라이트 모드로 전환" : "다크 모드로 전환");
    }
    label();

    btn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme");
      const isDark =
        current === "dark" ||
        (!current && window.matchMedia("(prefers-color-scheme: dark)").matches);
      const next = isDark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {}
      label();
    });
  }

  // Fade/slide-in each top-level section as it enters the viewport.
  function initScrollReveal() {
    const targets = document.querySelectorAll("main > section, main > .pagehero");
    if (!targets.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach((t) => t.classList.add("reveal-in"));
      return;
    }
    targets.forEach((t) => t.classList.add("reveal"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    targets.forEach((t) => io.observe(t));
  }

  function initBackToTop() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "backToTop";
    btn.className = "back-to-top";
    btn.setAttribute("aria-label", "맨 위로 이동");
    btn.textContent = "↑";
    document.body.appendChild(btn);

    const onScroll = () => {
      btn.classList.toggle("show", window.scrollY > 700);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  // Subtle cursor-driven 3D tilt on people/activity cards.
  function initTilt() {
    if (reduceMotion) return;
    document.querySelectorAll(".person-card, .gallery-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(700px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateY(-2px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  function mount() {
    const headerMount = document.getElementById("site-header");
    const footerMount = document.getElementById("site-footer");
    const activeKey = document.body.getAttribute("data-page") || "";

    if (headerMount) headerMount.innerHTML = headerHTML(activeKey);
    if (footerMount) footerMount.innerHTML = footerHTML();

    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const header = document.getElementById("siteHeader");
    const onScroll = () => {
      if (!header) return;
      if (window.scrollY > 20) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    window.addEventListener("scroll", onScroll);
    onScroll();

    const burger = document.getElementById("burger");
    const menu = document.getElementById("mainMenu");
    if (burger && menu) {
      burger.addEventListener("click", () => {
        const open = menu.classList.toggle("open");
        burger.setAttribute("aria-expanded", String(open));
        burger.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
        if (header) header.classList.add("scrolled");
      });
      menu.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => {
          menu.classList.remove("open");
          burger.setAttribute("aria-expanded", "false");
          burger.setAttribute("aria-label", "메뉴 열기");
        })
      );
    }

    initThemeToggle();
    initScrollReveal();
    initBackToTop();
    initTilt();
  }

  document.addEventListener("DOMContentLoaded", mount);
})();
