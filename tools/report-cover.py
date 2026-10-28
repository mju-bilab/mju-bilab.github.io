"""Make a Blue Spot report's cover image from its PDF's first page.

    python tools/report-cover.py files/reports/2026-W44.pdf

writes files/reports/2026-W44.jpg next to the PDF (the list and detail pages
pick it up by that name; no `cover` entry needed) and prints the page count
for the report's `pages` field in js/insights-data.js.
With no argument, every PDF in files/reports/ without a cover gets one.

Needs PyMuPDF:  pip install pymupdf
"""
import sys
from pathlib import Path

try:
    import pymupdf as fitz
except ImportError:
    sys.exit("PyMuPDF가 필요합니다:  pip install pymupdf")

WIDTH = 720  # px; cards show covers at most ~360px wide, so this stays sharp on 2x screens
QUALITY = 82

REPORTS = Path(__file__).resolve().parent.parent / "files" / "reports"


def make_cover(pdf: Path) -> None:
    with fitz.open(pdf) as doc:
        page = doc[0]
        zoom = WIDTH / page.rect.width
        pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
        out = pdf.with_suffix(".jpg")
        pix.save(out, jpg_quality=QUALITY)
        print(f"{out.name}  ({pix.width}x{pix.height}, {out.stat().st_size // 1024} KB)  pages: {doc.page_count}")


def main(args: list[str]) -> None:
    if args:
        pdfs = [Path(a) for a in args]
    else:
        pdfs = [p for p in sorted(REPORTS.glob("*.pdf")) if not p.with_suffix(".jpg").exists()]
        if not pdfs:
            print("표지가 없는 PDF가 없습니다")
    for pdf in pdfs:
        if not pdf.is_file():
            sys.exit(f"파일이 없습니다: {pdf}")
        make_cover(pdf)


if __name__ == "__main__":
    main(sys.argv[1:])
