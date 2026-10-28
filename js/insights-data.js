/* Weekly Business Trend Report & Card News — 여기만 수정하면 페이지에 반영됩니다.
   새 항목은 각 배열의 "맨 위"에 추가하세요 (최신순으로 표시).

   REPORT_DATA 항목
     week    : "2026-W44"                      ISO 주차 (목록의 주차 배지)
     date    : "2026.10.27"                    발행일
     title   : "리포트 제목"
     summary : "한두 문장 요약"
     tags    : ["AI", "Retail"]                (선택) 키워드 — 목록의 키워드 필터와 관련 리포트 추천에 쓰입니다
     pdf     : "files/reports/2026-W44.pdf"    PDF 파일 경로 (files/reports/ 에 올리기)
     pages   : 18                              (선택) 쪽수 — 상세 페이지에 "분량 18쪽"으로 표시
     highlights : ["핵심 1", "핵심 2", ...]    (선택) 상세 페이지 "이번 호 핵심" (3~4개 권장)
     cover   : "files/reports/2026-W44.jpg"    (선택) 표지 이미지. 비워 두면 PDF와 같은 이름의 .jpg를 씁니다.
               python tools/report-cover.py files/reports/2026-W44.pdf
               를 실행하면 PDF 첫 쪽으로 그 .jpg를 만들고 쪽수도 알려 줍니다.
               표지 파일이 없으면 주차가 적힌 기본 표지가 대신 보입니다.

     카드를 누르면 상세 페이지 report.html?w=2026-W44 가 열리고,
     "리포트 읽기"를 누르면 웹 뷰어 report-view.html?w=2026-W44 로 넘어갑니다.
     week 값이 주소가 되므로 리포트마다 겹치지 않게 적어 주세요.

   CARDNEWS_DATA 항목
     date    : "2026.10.27"
     title   : "카드뉴스 제목"
     summary : "한 줄 소개"                    (선택)
     slides  : ["files/cardnews/2026-W44/01.png", "files/cardnews/2026-W44/02.png", ...]
               첫 장이 목록의 커버로 쓰입니다. 4:5(1080×1350) 또는 1:1 이미지 권장.
*/
const REPORT_DATA = [];

const CARDNEWS_DATA = [];
