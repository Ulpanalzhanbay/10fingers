// final.js

document.addEventListener('DOMContentLoaded', () => {
  // === Sidebar & Section Navigation ===
  const sidebar    = document.getElementById('sidebar');
  const logo       = document.getElementById('logo');
  const inkToggle  = document.getElementById('inkToggle');
  const toLogin    = document.getElementById('toLogin');
  const sections   = {
    home:     document.getElementById('homeSection'),
    info:     document.getElementById('infoSection'),
    settings: document.getElementById('settingsSection'),
    login:    document.getElementById('loginSection'),
    game:     document.getElementById('gameSection'),
  };

  function showSection(name) {
    Object.values(sections).forEach(sec => sec && (sec.style.display = 'none'));
    if (sections[name]) sections[name].style.display = 'block';
  }

  logo.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.getElementById('navHome').onclick     = () => showSection('home');
  document.getElementById('navInfo').onclick     = () => showSection('info');
  document.getElementById('navSettings').onclick = () => showSection('settings');
  document.getElementById('navGame').onclick     = () => showSection('game');
  toLogin.onclick = () => showSection('login');
  inkToggle.onclick = () => document.body.classList.toggle('ink-mode');

  showSection('home');

  // === Home: focus overlay & reload ===
  const practiceText = document.getElementById('practiceText');
  const focusOverlay = document.getElementById('focusOverlay');
  const reloadBtn    = document.getElementById('reloadBtn');

  if (focusOverlay && practiceText) {
    focusOverlay.parentNode.addEventListener('click', () => {
      focusOverlay.style.display = 'none';
      practiceText.focus?.();
    });
  }

  if (reloadBtn) {
    reloadBtn.addEventListener('click', () => location.reload());
  }

  // === Home: dynamic typing-test loader ===
  const api = {
    words:       'https://random-word-api.herokuapp.com/word?number=10',
    quoteRandom: 'https://api.quotable.io/random'
  };
  let typingTime = 15;

  const typeBtns = {
    punctuation: document.querySelector('.button-bar button:nth-of-type(1)'),
    number:      document.querySelector('.button-bar button:nth-of-type(2)'),
    timeCustom:  document.querySelector('.button-bar button:nth-of-type(4)'),
    words:       document.querySelector('.button-bar button:nth-of-type(5)'),
    quote:       document.querySelector('.button-bar button:nth-of-type(6)'),
    custom:      document.querySelector('.button-bar button:nth-of-type(7)')
  };
  const allButtons = Array.from(document.querySelectorAll('.button-bar button'));
  const timeButtons = allButtons.slice(8, 12);

  async function loadWords() {
    if (!practiceText) return;
    practiceText.textContent = 'Loading...';
    try {
      const res = await fetch(api.words);
      const list = await res.json();
      practiceText.textContent = list.join(' ');
    } catch {
      practiceText.textContent = 'Error loading words.';
    }
  }

  async function loadMode(mode) {
    if (!practiceText) return;
    practiceText.textContent = 'Loading...';
    try {
      if (mode === 'punctuation') {
        const res = await fetch(api.words);
        const w   = await res.json();
        practiceText.textContent = w.join(' ') + ' . , ! ? ; : -';
      } else if (mode === 'number') {
        const res = await fetch(api.words);
        const w   = await res.json();
        practiceText.textContent = w.map(() => Math.floor(Math.random() * 100)).join(' ');
      } else if (mode === 'quote') {
        const res = await fetch(api.quoteRandom);
        const q   = await res.json();
        practiceText.textContent = `${q.content} — ${q.author}`;
      } else if (mode === 'custom') {
        const txt = prompt('Enter custom text:');
        practiceText.textContent = txt || '';
      }
    } catch {
      practiceText.textContent = 'Error loading content.';
    }
  }

  // bind buttons
  loadWords();
  reloadBtn?.addEventListener('click', loadWords);
  typeBtns.punctuation?.addEventListener('click', () => loadMode('punctuation'));
  typeBtns.number      ?.addEventListener('click', () => loadMode('number'));
  typeBtns.words       ?.addEventListener('click', loadWords);
  typeBtns.quote       ?.addEventListener('click', () => loadMode('quote'));
  typeBtns.custom      ?.addEventListener('click', () => loadMode('custom'));
  typeBtns.timeCustom  ?.addEventListener('click', () => {
    const t = parseInt(prompt('Enter time (seconds):'), 10);
    if (t > 0) typingTime = t;
    alert(`Typing time set to ${typingTime}s`);
  });
  timeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      typingTime = parseInt(btn.textContent, 10);
      alert(`Typing time set to ${typingTime}s`);
    });
  });

  // === Login & Registration ===
  document.getElementById('registerForm')
    ?.addEventListener('submit', e => { e.preventDefault(); alert('Регистрация успешна!'); });
  document.getElementById('loginForm')
    ?.addEventListener('submit', e => { e.preventDefault(); alert('Вы вошли в аккаунт!'); });

  // === Game: per-letter typing race ===
  const textEl  = document.getElementById('text');
  const inputEl = document.getElementById('input');

  if (textEl && inputEl) {
    const raw = textEl.innerText;
    textEl.innerHTML = '';
    const letters = Array.from(raw).map(ch => {
      const span = document.createElement('span');
      span.textContent = ch;
      textEl.appendChild(span);
      return span;
    });

    let idx   = 0;
    const total = letters.length;

    inputEl.value = '';
    inputEl.focus();

    inputEl.addEventListener('keydown', e => {
      if (e.key.length !== 1) return;
      e.preventDefault();
      const span = letters[idx];
      if (!span) return;

      if (e.key === span.textContent) {
        span.classList.add('correct');
        idx++;
        moveRacers(idx, total);
        if (idx === total) {
          document.querySelectorAll('.track .finish')
            .forEach(f => f.style.display = 'block');
        }
      } else {
        span.classList.add('wrong');
      }
    });
  }
});

// === Racer Movement ===
function moveRacers(current, total) {
  document.querySelectorAll('.track').forEach(track => {
    const racer  = track.querySelector('.racer');
    const finish = track.querySelector('.finish');
    const trackW = track.clientWidth;
    const maxX   = trackW - racer.clientWidth - finish.clientWidth - 4;
    const prog   = Math.min(current / total, 1);
    racer.style.left = `${maxX * prog}px`;
    if (prog === 1) {
      racer.src = racer.dataset.finish;
    }
  });
}
