// Clínica Amor de Patas
(() => {
  // ---- Unidades (dias: 0 = domingo ... 6 = sábado; horários em minutos) ----
  const UNITS = [
    {
      name: 'Unidade I · Afogados',
      address: 'Av. 21 de Abril, 1254 · Afogados, Recife - PE',
      hoursText: 'Segunda a sábado, 8h30 às 18h',
      phone: '(81) 99718-5601',
      wa: '5581997185601',
      days: [1, 2, 3, 4, 5, 6], open: 510, close: 1080,
      query: 'Av. 21 de Abril, 1254, Afogados, Recife - PE',
    },
    {
      name: 'Unidade II · Maurício de Nassau',
      address: 'R. Gonçalves Dias, 95 · Maurício de Nassau, Caruaru - PE',
      hoursText: 'Todos os dias, 8h30 às 22h · Internamento 24h',
      phone: '(81) 99896-3040',
      wa: '5581998963040',
      days: [0, 1, 2, 3, 4, 5, 6], open: 510, close: 1320,
      query: 'Clínica Amor de Patas, R. Gonçalves Dias, 95, Maurício de Nassau, Caruaru - PE',
    },
    {
      name: 'Unidade III · Estrada p/ Xique-Xique',
      address: 'Estrada para o Xique-Xique, 90 · Boa Vista II, Caruaru - PE (após o mercado É Bom)',
      hoursText: 'Segunda a sábado, 8h30 às 18h',
      phone: '(81) 99617-1177',
      wa: '5581996171177',
      days: [1, 2, 3, 4, 5, 6], open: 510, close: 1080,
      query: 'Estrada para o Xique-Xique, 90, Boa Vista II, Caruaru - PE',
    },
  ];

  // Hora local de Pernambuco (UTC-3), independente do fuso do visitante
  const nowPE = () => {
    const d = new Date(Date.now() - 3 * 3600 * 1000);
    return { day: d.getUTCDay(), min: d.getUTCHours() * 60 + d.getUTCMinutes() };
  };
  const fmt = (m) => `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, '0') : ''}`;

  const statusOf = (u) => {
    const { day, min } = nowPE();
    const openToday = u.days.includes(day);
    if (openToday && min >= u.open && min < u.close) {
      return { open: true, text: `Aberto agora · fecha às ${fmt(u.close)}` };
    }
    if (openToday && min < u.open) return { open: false, text: `Fechado · abre hoje às ${fmt(u.open)}` };
    for (let i = 1; i <= 7; i++) {
      const next = (day + i) % 7;
      if (u.days.includes(next)) {
        return { open: false, text: `Fechado · abre ${i === 1 ? 'amanhã' : 'segunda'} às ${fmt(u.open)}` };
      }
    }
    return { open: false, text: 'Fechado' };
  };

  // ---- Painel de unidades ----
  const tabs = [...document.querySelectorAll('.unit-tab')];
  const panel = document.querySelector('.unit-panel');
  const $ = (sel) => panel.querySelector(sel);
  const mapCache = {};

  const showUnit = (i) => {
    const u = UNITS[i];
    const st = statusOf(u);
    tabs.forEach((t, k) => t.setAttribute('aria-selected', String(k === i)));
    // No celular as abas rolam na horizontal: centraliza a aba ativa
    const strip = tabs[i].parentElement;
    if (strip.scrollWidth > strip.clientWidth) {
      strip.scrollTo({ left: tabs[i].offsetLeft - (strip.clientWidth - tabs[i].offsetWidth) / 2, behavior: 'smooth' });
    }
    $('[data-unit-name]').textContent = u.name;
    $('[data-unit-address]').textContent = u.address;
    $('[data-unit-hours]').textContent = u.hoursText;
    $('[data-unit-phone]').textContent = u.phone;
    const status = $('[data-unit-status]');
    status.textContent = st.text;
    status.classList.toggle('open', st.open);
    $('[data-unit-wa]').href = `https://wa.me/${u.wa}?text=${encodeURIComponent(`Olá! Vim pelo site e gostaria de agendar na ${u.name}.`)}`;
    $('[data-unit-route]').href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(u.query)}`;
    const src = mapCache[i] || (mapCache[i] = `https://maps.google.com/maps?q=${encodeURIComponent(u.query)}&z=16&output=embed`);
    const frame = $('[data-unit-map]');
    if (frame.src !== src) frame.src = src;
    panel.classList.remove('swap');
    void panel.offsetWidth;
    panel.classList.add('swap');
  };

  tabs.forEach((t, i) => t.addEventListener('click', () => showUnit(i)));
  tabs.forEach((t, i) => {
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const n = (i + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[n].focus();
      showUnit(n);
    });
  });
  document.querySelectorAll('[data-unit-link]').forEach((a) =>
    a.addEventListener('click', () => showUnit(Number(a.dataset.unitLink)))
  );

  const refreshDots = () => {
    UNITS.forEach((u, i) => {
      const dot = document.querySelector(`[data-dot="${i}"]`);
      if (dot) dot.classList.toggle('open', statusOf(u).open);
    });
    // Selo do hero: status de Caruaru (unidade principal)
    const main = statusOf(UNITS[1]);
    document.querySelector('[data-live-dot]').classList.toggle('open', main.open);
    document.querySelector('[data-live-text]').textContent = main.open
      ? `Aberto agora em Caruaru · até as ${fmt(UNITS[1].close)}`
      : 'Caruaru · Recife · Internamento 24h';
  };

  showUnit(1);
  refreshDots();
  setInterval(refreshDots, 60000);

  // ---- Menu mobile ----
  const burger = document.querySelector('.burger');
  const menu = document.getElementById('menu');
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  menu.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    })
  );

  // ---- Topbar ao rolar ----
  const topbar = document.querySelector('.topbar');
  const onScroll = () => topbar.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Reveal ----
  const items = document.querySelectorAll('.reveal:not(.hero .reveal)');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 70}ms`;
      io.observe(el);
    });
  } else {
    items.forEach((el) => el.classList.add('in'));
  }

  // ---- Player dos vídeos das dicas (um tocando por vez) ----
  const players = [...document.querySelectorAll('[data-player]')];
  const fmtTime = (t) => {
    if (!Number.isFinite(t)) return '0:00';
    const m = Math.floor(t / 60);
    return `${m}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  };

  players.forEach((box) => {
    const v = box.querySelector('video');
    const seek = box.querySelector('.seek');
    const vol = box.querySelector('.vol-range');
    const cur = box.querySelector('[data-cur]');
    const dur = box.querySelector('[data-dur]');
    const playBtn = box.querySelector('.c-play');
    const muteBtn = box.querySelector('[data-act="mute"]');
    let idleTimer;
    let lastVolume = 1;

    const paintRange = (input, ratio) => input.style.setProperty('--p', `${(ratio * 100).toFixed(2)}%`);

    const toggle = () => {
      if (v.paused || v.ended) {
        players.forEach((o) => { if (o !== box) o.querySelector('video').pause(); });
        const p = v.play();
        if (p) p.catch(() => {});
      } else {
        v.pause();
      }
    };
    const skip = (s) => {
      if (!Number.isFinite(v.duration)) return;
      v.currentTime = Math.min(Math.max(v.currentTime + s, 0), v.duration - 0.1);
    };
    const syncVolume = () => {
      const level = v.muted ? 0 : v.volume;
      vol.value = level;
      paintRange(vol, level);
      box.classList.toggle('is-muted', level === 0);
      muteBtn.setAttribute('aria-label', level === 0 ? 'Ativar som' : 'Silenciar');
    };
    // Controles somem sozinhos enquanto o vídeo toca
    const wake = () => {
      box.classList.remove('idle');
      clearTimeout(idleTimer);
      if (!v.paused) idleTimer = setTimeout(() => box.classList.add('idle'), 2500);
    };

    box.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'play') toggle();
      else if (act === 'back') skip(-10);
      else if (act === 'fwd') skip(10);
      else if (act === 'mute') {
        if (v.muted || v.volume === 0) {
          v.muted = false;
          v.volume = lastVolume || 1;
        } else {
          lastVolume = v.volume;
          v.muted = true;
        }
      } else if (e.target === v) toggle();
      wake();
    });

    v.addEventListener('play', () => { box.classList.add('is-playing'); playBtn.setAttribute('aria-label', 'Pausar'); wake(); });
    v.addEventListener('pause', () => { box.classList.remove('is-playing', 'idle'); playBtn.setAttribute('aria-label', 'Reproduzir'); });
    v.addEventListener('ended', () => { box.classList.remove('is-playing', 'idle'); });
    v.addEventListener('loadedmetadata', () => { dur.textContent = fmtTime(v.duration); });
    v.addEventListener('timeupdate', () => {
      cur.textContent = fmtTime(v.currentTime);
      if (v.duration && !box.classList.contains('seeking')) {
        const r = v.currentTime / v.duration;
        seek.value = Math.round(r * 1000);
        paintRange(seek, r);
      }
    });
    v.addEventListener('volumechange', syncVolume);

    seek.addEventListener('input', () => {
      box.classList.add('seeking');
      paintRange(seek, seek.value / 1000);
      if (v.duration) cur.textContent = fmtTime((seek.value / 1000) * v.duration);
    });
    seek.addEventListener('change', () => {
      if (v.duration) v.currentTime = (seek.value / 1000) * v.duration;
      box.classList.remove('seeking');
    });
    vol.addEventListener('input', () => {
      v.volume = Number(vol.value);
      v.muted = v.volume === 0;
      if (v.volume > 0) lastVolume = v.volume;
    });

    box.addEventListener('pointermove', wake);
    box.addEventListener('focusin', wake);
    box.tabIndex = -1;
    box.addEventListener('keydown', (e) => {
      if (e.target.matches('input[type="range"]')) return;
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); toggle(); }
      else if (e.key === 'ArrowLeft' || e.key === 'j') { e.preventDefault(); skip(-10); }
      else if (e.key === 'ArrowRight' || e.key === 'l') { e.preventDefault(); skip(10); }
      else if (e.key === 'm') muteBtn.click();
      wake();
    });

    paintRange(seek, 0);
    syncVolume();
  });

  // Pausa o vídeo quando ele sai da tela
  if ('IntersectionObserver' in window) {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => { if (!isIntersecting) target.pause(); });
    }, { threshold: 0.25 });
    players.forEach((box) => vio.observe(box.querySelector('video')));
  }

  document.querySelector('[data-year]').textContent = new Date().getFullYear();
})();
