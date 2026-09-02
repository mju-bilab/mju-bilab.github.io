/* Auto-links a publication's title to its PDF, if one exists.
   Indexing rule: drop a file named "<data-pub-id>.pdf" into
   files/publications/ — no HTML/JS edits needed. Each .pub-item in
   publications.html carries a data-pub-id; on load we HEAD-check
   files/publications/<id>.pdf and only turn the title into a link
   when the file is actually there, so missing PDFs never render as
   dead links. */
(function () {
  const PDF_DIR = "files/publications/";
  const items = document.querySelectorAll(".pub-item[data-pub-id]");
  if (!items.length) return;

  items.forEach(async (item) => {
    const id = item.getAttribute("data-pub-id");
    const h4 = item.querySelector("h4");
    if (!id || !h4) return;
    const url = PDF_DIR + id + ".pdf";

    let exists = false;
    try {
      const res = await fetch(url, { method: "HEAD" });
      exists = res.ok;
    } catch (e) {
      exists = false;
    }
    if (!exists) return;

    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    a.className = "pub-pdf-link";
    a.innerHTML = h4.innerHTML + ' <span class="pdf-badge">PDF ↗</span>';
    h4.innerHTML = "";
    h4.appendChild(a);
  });
})();
