/* Single source of truth for publication counts. publications.html's
   markup (.pub-item under each [data-pub-group]) IS the data — instead
   of keeping separate hardcoded numbers in sync across index.html,
   research.html and publications.html itself, every page asks this
   function, which counts the live DOM when already on publications.html
   and otherwise fetches+parses that page once. */
(function () {
  let cached = null;

  function countFrom(doc) {
    return {
      refereed: doc.querySelectorAll('[data-pub-group="refereed"] .pub-item').length,
      wip: doc.querySelectorAll('[data-pub-group="wip"] .pub-item').length,
      conf: doc.querySelectorAll('[data-pub-group="conf"] .pub-item').length,
    };
  }

  window.getPubCounts = async function () {
    if (cached) return cached;
    if (document.querySelector("[data-pub-group]")) {
      cached = countFrom(document);
      return cached;
    }
    try {
      const res = await fetch("publications.html");
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      cached = countFrom(doc);
    } catch (e) {
      cached = null;
    }
    return cached;
  };
})();
