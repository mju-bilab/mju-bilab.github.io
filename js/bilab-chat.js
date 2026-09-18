/**
 * BILAB 연구실 안내 챗봇 위젯
 *
 * 연구실 사이트 아무 페이지에나 이 한 줄만 넣으면 오른쪽 아래에 채팅 버튼이 생깁니다.
 *   <script src="bilab-chat.js" data-api="https://<함수 URL>" defer></script>
 *
 * 사이트 CSS와 섞이지 않도록 Shadow DOM 안에서 그립니다.
 */
(function () {
  'use strict';

  var script = document.currentScript || (function () {
    var all = document.getElementsByTagName('script');
    return all[all.length - 1];
  })();

  var API = (script && script.dataset.api) || '';
  var TITLE = (script && script.dataset.title) || 'BILAB 안내';
  var ACCENT = (script && script.dataset.accent) || '#3454D1';

  if (!API) {
    console.error('[BILAB 챗봇] data-api 에 서버 주소를 넣어 주세요.');
    return;
  }

  var GREETING =
    '안녕하세요! 명지대 비즈니스 인텔리전스 연구실(BILAB) 안내 챗봇이에요.\n' +
    '연구실 소개, 논문, 학부연구생 지원 같은 걸 물어보면 아는 만큼 답해 드릴게요.';

  var SUGGESTIONS = [
    '학부연구생은 어떻게 지원하나요?',
    '어떤 연구를 하는 연구실인가요?',
    '학생들이 발표한 연구가 궁금해요',
    '연구실 위치와 연락처를 알려주세요',
  ];

  var STYLE = [
    ':host { all: initial; }',
    '*, *::before, *::after { box-sizing: border-box; }',
    // 밝은 테마가 기본이고, 사이트가 어두우면 .dark 가 붙습니다.
    '.wrap { --bg:#ffffff; --fg:#1f2328; --muted:#6b7280; --line:#e3e6ea;',
    '  --botbg:#f2f4f7; --inbg:#ffffff; }',
    '.wrap.dark { --bg:#101F38; --fg:#E7ECF7; --muted:#A9B4C9; --line:#233251;',
    '  --botbg:#16294A; --inbg:#0A1729; }',
    '.wrap { position: fixed; right: 20px; bottom: 20px; z-index: 2147483000;',
    '  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif; }',
    '.launch { display: flex; align-items: center; gap: 8px; border: 0; cursor: pointer;',
    '  background: var(--accent); color: #fff; border-radius: 999px; padding: 13px 20px;',
    '  font-size: 15px; font-weight: 600; box-shadow: 0 6px 20px rgba(0,0,0,.22); }',
    '.launch:hover { filter: brightness(1.08); }',
    '.launch:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }',
    '.panel { display: none; flex-direction: column; width: 400px; height: 580px;',
    '  max-height: calc(100vh - 40px); background: var(--bg); border-radius: 16px; overflow: hidden;',
    '  box-shadow: 0 18px 50px rgba(0,0,0,.28); border: 1px solid var(--line); }',
    '.panel.open { display: flex; }',
    '.wrap.open .launch { display: none; }',
    '.head { display: flex; align-items: center; justify-content: space-between; gap: 10px;',
    '  padding: 14px 16px; background: var(--accent); color: #fff; }',
    '.head h2 { margin: 0; font-size: 15px; font-weight: 700; }',
    '.head p { margin: 2px 0 0; font-size: 11.5px; opacity: .85; }',
    '.close { background: transparent; border: 0; color: #fff; cursor: pointer; font-size: 22px;',
    '  line-height: 1; padding: 4px 6px; border-radius: 8px; }',
    '.close:hover { background: rgba(255,255,255,.18); }',
    '.log { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }',
    '.msg { max-width: 86%; padding: 10px 13px; border-radius: 13px; font-size: 14px; line-height: 1.62;',
    '  white-space: pre-wrap; word-break: break-word; }',
    '.msg.bot { align-self: flex-start; background: var(--botbg); color: var(--fg);',
    '  border-bottom-left-radius: 4px; }',
    '.msg.me { align-self: flex-end; background: var(--accent); color: #fff;',
    '  border-bottom-right-radius: 4px; }',
    '.msg.err { align-self: flex-start; background: #fdecec; color: #9b1c1c; font-size: 13px; }',
    '.srcs { align-self: flex-start; max-width: 86%; font-size: 11.5px; color: var(--muted); line-height: 1.6; }',
    '.srcs b { color: var(--fg); font-weight: 600; }',
    '.chips { display: flex; flex-wrap: wrap; gap: 7px; padding: 0 16px 12px; }',
    '.chip { border: 1px solid var(--line); background: var(--bg); color: var(--fg); cursor: pointer;',
    '  border-radius: 999px; padding: 7px 12px; font-size: 12.5px; }',
    '.chip:hover { border-color: var(--accent); color: var(--accent); }',
    '.form { display: flex; gap: 8px; padding: 12px; border-top: 1px solid var(--line); background: var(--bg); }',
    '.form textarea { flex: 1; resize: none; border: 1px solid var(--line); border-radius: 10px;',
    '  padding: 10px 12px; font: inherit; font-size: 14px; line-height: 1.5; max-height: 110px;',
    '  background: var(--inbg); color: var(--fg); }',
    '.form textarea:focus { outline: none; border-color: var(--accent); }',
    '.send { border: 0; background: var(--accent); color: #fff; border-radius: 10px; cursor: pointer;',
    '  padding: 0 16px; font-size: 14px; font-weight: 600; }',
    '.send:disabled { opacity: .45; cursor: default; }',
    '.dots { display: inline-flex; gap: 4px; }',
    '.dots i { width: 6px; height: 6px; border-radius: 50%; background: var(--muted);',
    '  animation: b 1.2s infinite ease-in-out; }',
    '.dots i:nth-child(2) { animation-delay: .18s; } .dots i:nth-child(3) { animation-delay: .36s; }',
    '@keyframes b { 0%, 60%, 100% { opacity: .25; } 30% { opacity: 1; } }',
    '.foot { padding: 0 16px 10px; font-size: 11px; color: var(--muted); }',
    '@media (max-width: 480px) {',
    '  .wrap { right: 12px; bottom: 12px; left: 12px; }',
    '  .panel { width: auto; height: calc(100vh - 24px); } }',
    '@media (prefers-reduced-motion: reduce) { .dots i { animation: none; } }',
  ].join('\n');

  var host = document.createElement('div');
  host.setAttribute('data-bilab-chat', '');
  var root = host.attachShadow({ mode: 'open' });
  document.body.appendChild(host);

  root.innerHTML =
    '<style>:host{ --accent:' + ACCENT + '; }\n' + STYLE + '</style>' +
    '<div class="wrap">' +
      '<button class="launch" type="button" aria-label="' + TITLE + ' 열기">' +
        '<span aria-hidden="true">💬</span><span>무엇이든 물어보세요</span>' +
      '</button>' +
      '<section class="panel" role="dialog" aria-modal="false" aria-label="' + TITLE + '">' +
        '<header class="head"><div><h2>' + TITLE + '</h2>' +
          '<p>연구실 자료를 근거로 답합니다</p></div>' +
          '<button class="close" type="button" aria-label="닫기">&times;</button></header>' +
        '<div class="log" role="log" aria-live="polite"></div>' +
        '<div class="chips"></div>' +
        '<p class="foot">AI가 만든 답변이라 부정확할 수 있어요. 중요한 내용은 mjubilab@gmail.com으로 확인해 주세요.</p>' +
        '<form class="form">' +
          '<textarea rows="1" placeholder="궁금한 점을 적어 주세요" aria-label="질문"></textarea>' +
          '<button class="send" type="submit">보내기</button>' +
        '</form>' +
      '</section>' +
    '</div>';

  var wrap = root.querySelector('.wrap');

  // 사이트의 테마를 그대로 따라갑니다.
  // data-theme 이 dark/light 면 그 값을, 없으면 시스템 설정을 씁니다.
  var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

  function siteIsDark() {
    var attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'dark') return true;
    if (attr === 'light') return false;
    return !!(systemDark && systemDark.matches);
  }

  function applyTheme() {
    wrap.classList.toggle('dark', siteIsDark());
  }

  applyTheme();
  new MutationObserver(applyTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  if (systemDark) {
    if (systemDark.addEventListener) systemDark.addEventListener('change', applyTheme);
    else if (systemDark.addListener) systemDark.addListener(applyTheme);
  }
  var panel = root.querySelector('.panel');
  var log = root.querySelector('.log');
  var chips = root.querySelector('.chips');
  var form = root.querySelector('.form');
  var input = root.querySelector('textarea');
  var sendBtn = root.querySelector('.send');
  var history = [];
  var busy = false;

  function scroll() { log.scrollTop = log.scrollHeight; }

  function addMsg(who, text) {
    var el = document.createElement('div');
    el.className = 'msg ' + who;
    el.textContent = text;
    log.appendChild(el);
    scroll();
    return el;
  }

  function addSources(sources) {
    if (!sources || !sources.length) return;
    var seen = {};
    var names = [];
    sources.forEach(function (s) {
      if (seen[s.title]) return;
      seen[s.title] = 1;
      names.push(s.title);
    });
    var el = document.createElement('div');
    el.className = 'srcs';
    el.innerHTML = '<b>참고한 자료</b><br>' + names.map(function (n) {
      return '· ' + n.replace(/[<>&]/g, '');
    }).join('<br>');
    log.appendChild(el);
    scroll();
  }

  function renderChips() {
    chips.innerHTML = '';
    if (history.length) return;
    SUGGESTIONS.forEach(function (q) {
      var b = document.createElement('button');
      b.className = 'chip';
      b.type = 'button';
      b.textContent = q;
      b.addEventListener('click', function () { send(q); });
      chips.appendChild(b);
    });
  }

  function setBusy(on) {
    busy = on;
    sendBtn.disabled = on;
    input.disabled = on;
  }

  async function send(text) {
    text = (text || '').trim();
    if (!text || busy) return;

    addMsg('me', text);
    history.push({ role: 'user', content: text });
    input.value = '';
    input.style.height = 'auto';
    renderChips();
    setBusy(true);

    var bubble = addMsg('bot', '');
    bubble.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>';
    var answer = '';
    var pendingSources = null;

    try {
      var res = await fetch(API, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) {
        var info = await res.json().catch(function () { return {}; });
        throw new Error(info.error || ('서버가 ' + res.status + ' 를 돌려줬어요.'));
      }

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buf = '';

      while (true) {
        var step = await reader.read();
        if (step.done) break;
        buf += decoder.decode(step.value, { stream: true });

        var parts = buf.split('\n\n');
        buf = parts.pop();

        for (var i = 0; i < parts.length; i++) {
          var line = parts[i].trim();
          if (line.indexOf('data:') !== 0) continue;
          var ev;
          try { ev = JSON.parse(line.slice(5).trim()); } catch (e) { continue; }

          if (ev.type === 'text') {
            answer += ev.text;
            bubble.textContent = answer;
            scroll();
          } else if (ev.type === 'sources') {
            pendingSources = ev.sources;
          } else if (ev.type === 'error') {
            throw new Error(ev.message);
          }
        }
      }

      if (!answer) throw new Error('답변이 비어 있어요. 다시 물어봐 주세요.');
      history.push({ role: 'assistant', content: answer });
      addSources(pendingSources);
    } catch (err) {
      bubble.remove();
      addMsg('err', '문제가 생겼어요: ' + err.message);
      history.pop();
    } finally {
      setBusy(false);
      input.focus();
    }
  }

  root.querySelector('.launch').addEventListener('click', function () {
    wrap.classList.add('open');
    panel.classList.add('open');
    if (!log.children.length) addMsg('bot', GREETING);
    renderChips();
    input.focus();
  });

  root.querySelector('.close').addEventListener('click', function () {
    wrap.classList.remove('open');
    panel.classList.remove('open');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    send(input.value);
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      send(input.value);
    }
  });

  input.addEventListener('input', function () {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 110) + 'px';
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('open')) {
      root.querySelector('.close').click();
    }
  });
})();
