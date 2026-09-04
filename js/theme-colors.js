/* Canvas illustrations paint onto --soft panels, so their "ink" has to track
   the active theme. Hardcoding a navy foreground made every label in the
   Research pipeline / process graphics invisible in dark mode (navy text on
   the dark navy panel). Exposes the current RGB triples plus subscribe(),
   which fires on theme toggle and on OS-level scheme changes so each canvas
   can repaint. Values mirror the --ink / --dim / --accent / --teal tokens in
   css/style.css — keep the two in sync. */
(function () {
  const LIGHT = {
    ink: [14, 32, 56],
    dim: [152, 162, 179],
    accent: [52, 84, 209],
    teal: [18, 165, 148],
  };
  const DARK = {
    ink: [231, 236, 247],
    dim: [124, 135, 156],
    accent: [110, 134, 232],
    teal: [63, 207, 198],
  };

  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const listeners = new Set();

  function isDark() {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "dark") return true;
    if (attr === "light") return false;
    return systemDark.matches;
  }

  const api = {
    isDark,
    current: isDark() ? DARK : LIGHT,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };

  function refresh() {
    api.current = isDark() ? DARK : LIGHT;
    listeners.forEach((fn) => fn(api.current));
  }

  new MutationObserver(refresh).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  if (systemDark.addEventListener) systemDark.addEventListener("change", refresh);
  else systemDark.addListener(refresh);

  window.BILAB_THEME = api;
})();
