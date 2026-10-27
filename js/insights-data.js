/* Weekly Business Trend Report & Card News — 여기만 수정하면 페이지에 반영됩니다.
   새 항목은 각 배열의 "맨 위"에 추가하세요 (최신순으로 표시).

   REPORT_DATA 항목
     week    : "2026-W44"                      ISO 주차 (목록의 주차 배지)
     date    : "2026.10.27"                    발행일
     title   : "리포트 제목"
     summary : "한두 문장 요약"
     tags    : ["AI", "Retail"]                (선택) 키워드
     pdf     : "files/reports/2026-W44.pdf"    PDF 파일 경로 (files/reports/ 에 올리기)
               목록의 "리포트 보기"는 웹 뷰어 report.html?w=2026-W44 로 열립니다.
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
