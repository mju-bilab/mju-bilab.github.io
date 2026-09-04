/* Attaches a PDF link and/or a DOI link to each publication entry.

   files/publications/index.json is the single source for both:

     "ref-2023-platform-roadmap": {
       "doi": "10.3390/su15129999",     // "" = no DOI link
       "pdf": "ref-2023-platform-roadmap.pdf"   // "" = no PDF link
     }

   Keys are the data-pub-id values in publications.html. Adding a paper
   means dropping the file into files/publications/ and filling in that
   one line. This replaced a per-item HEAD probe that fired 32 requests
   on every page load and logged a 404 for each missing PDF. */
(function () {
  const DIR = "files/publications/";
  const items = document.querySelectorAll(".pub-item[data-pub-id]");
  if (!items.length) return;

  function addPdf(item, file) {
    const h4 = item.querySelector("h4");
    if (!h4) return;
    const a = document.createElement("a");
    a.href = DIR + file;
    a.target = "_blank";
    a.rel = "noopener";
    a.className = "pub-pdf-link";
    a.innerHTML = h4.innerHTML + ' <span class="pdf-badge">PDF ↗</span>';
    h4.innerHTML = "";
    h4.appendChild(a);
  }

  function addDoi(item, doi) {
    const a = document.createElement("a");
    a.className = "pub-doi";
    a.href = "https://doi.org/" + doi;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = "DOI: " + doi + " ↗";
    item.appendChild(a);
  }

  (async function () {
    let manifest;
    try {
      const res = await fetch(DIR + "index.json");
      if (!res.ok) return;
      manifest = await res.json();
    } catch (e) {
      return; // no manifest yet — entries just render without links
    }
    items.forEach((item) => {
      const entry = manifest[item.getAttribute("data-pub-id")];
      if (!entry) return;
      if (entry.pdf) addPdf(item, entry.pdf);
      if (entry.doi) addDoi(item, entry.doi);
    });
  })();
})();
