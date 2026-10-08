/* Goianeiro Restaurant — site behavior (no dependencies). */
(() => {
  'use strict';

  /* ------------------------------------------------------------------
     SITE CONFIG — the single place for business facts.
     Sources: Instagram @goianeiro_ (bio + 19 Sep 2026 post).
     ------------------------------------------------------------------ */
  const CONFIG = {
    address: { line1: '14338 124th Ave NE', line2: 'Kirkland, WA 98034' },
    phones: ['+18435083226', '+14256918936'], // Jhon, Pamela
    // Leave empty to use the "call to order" sheet. Paste a DoorDash/Toast/etc. link here to send ORDER NOW there.
    orderUrl: '',
    timezone: 'America/Los_Angeles',
    // 0 = Sunday … 6 = Saturday; [open, close] in minutes after midnight
    hours: { 0: [660, 1320], 1: [660, 1140], 2: [660, 1140], 3: [660, 1140], 4: [660, 1320], 5: [660, 1320], 6: [660, 1320] },
  };
  const fullAddress = `${CONFIG.address.line1}, ${CONFIG.address.line2}`;
  const directionsUrl = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent('Goianeiro Restaurant, ' + fullAddress);
  const mapEmbedUrl = 'https://www.google.com/maps?q=' + encodeURIComponent(fullAddress) + '&z=15&output=embed';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conn = navigator.connection || {};
  const liteMode = reduceMotion || conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');

  /* ---------- wire facts into the DOM ---------- */
  $$('[data-addr-line1]').forEach(el => (el.textContent = CONFIG.address.line1));
  $$('[data-addr-line2]').forEach(el => (el.textContent = CONFIG.address.line2));
  $$('[data-directions]').forEach(a => (a.href = directionsUrl));
  $$('[data-tel]').forEach(a => (a.href = 'tel:' + CONFIG.phones[Number(a.dataset.tel) || 0]));
  $$('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));

  /* ------------------------------------------------------------------
     I18N — English ships in the HTML; Portuguese lives here.
     ------------------------------------------------------------------ */
  const PT = {
    skip: 'Pular para o conteúdo',
    brandSub: 'Restaurante',
    navMenu: 'Cardápio', navKitchen: 'Cozinha', navExperience: 'Experiência', navGallery: 'Galeria', navVisit: 'Visite',
    ctaOrder: 'Peça agora', ctaMenu: 'Ver cardápio', ctaMenuFull: 'Ver o cardápio completo', ctaDirections: 'Como chegar',
    ctaCall: 'Ligar agora', ctaReserve: 'Reservar mesa', ctaOrderPlate: 'Peça seu prato para viagem',
    heroEyebrow: 'Restaurante brasileiro · Kirkland, WA',
    heroTitle1: 'O sabor', heroTitle2: 'do Brasil.',
    heroLede: 'Comida de verdade de Minas Gerais e Goiás — buffet quentinho, churrasco na brasa, hambúrguer brasileiro e pão de queijo saindo do forno. Pertinho de Seattle.',
    storyKicker: 'Nossa história',
    storyTitle: '“Com o sabor inconfundível de Minas e o amor do coração de Goiás, criamos o Restaurante Goianeiro.”',
    storyText: 'O Goianeiro traz para a região de Seattle a comida do coração do Brasil: feijão cozido devagar, torresmo pururuca, mandioca frita douradinha, couve no alho e carne saindo da brasa. Comida de verdade, feita do jeito que a gente come em casa.',
    tagline: 'Sabor de casa',
    kitchenKicker: 'Da nossa cozinha',
    kitchenTitle1: 'Na brasa,', kitchenTitle2: 'na panela,', kitchenTitle3: 'no forno.',
    dish1: 'Espetos girando devagar sobre a brasa viva — carne, linguiça e frango assados do jeito brasileiro, fatiados direto no seu prato.',
    dish2: 'O clássico mineiro: feijão com farinha de mandioca, torresmo crocante, couve e ovo.',
    dish3: 'Mandioca dourada, torresmo pururuca e couve no alho — o trio que todo brasileiro conhece de cor.',
    dish4: 'Carne fatiada com cebola chegando à mesa ainda chiando na chapa de ferro, com batata frita e queijo derretido.',
    duoText: 'E porque refeição brasileira que se preze termina assim: pão de queijo quentinho e uma fatia de pudim.',
    menuKicker: 'O cardápio', menuTitle1: 'O Brasil,', menuTitle2: 'prato a prato.',
    tabBuffet: 'Buffet', tabBurgers: 'Hambúrgueres', tabBreakfast: 'Café da manhã', tabSweets: 'Sobremesas',
    buffetNote: 'Os pratos variam — todos estes já passaram pelo nosso buffet. Pergunte à equipe o que tem hoje.',
    buffetTitle: 'Buffet brasileiro',
    buffetIntro: 'Bandejas quentinhas de comida caseira mineira e goiana, mais churrasco direto da brasa. Coma aqui ou leve um prato completo para viagem.',
    bDesc1: 'Carnes assadas no espeto', bDesc2: 'Feijão, farinha, torresmo e couve', bDesc3: 'Nos dias de feijoada',
    bDesc4: 'Torresmo pururuca e mandioca frita', bDesc5: 'Couve refogada no alho', bDesc6: 'Farinha de mandioca tostada com ovo',
    bDesc7: 'Bifes empanados', bName8: 'Carne com batata', bDesc8: 'Carne cozida devagar com batata',
    bName9: 'Frango assado', bDesc9: 'Frango assado no ponto', bName10: 'Banana frita', bDesc10: 'Banana-da-terra frita',
    bName11: 'Arroz & feijão', bDesc11: 'Arroz e feijão, todo dia', bName12: 'Saladas', bDesc12: 'Saladas frescas, vinagrete e ovos',
    houseFav: 'Destaque da casa',
    m01: 'Pão, 2 hambúrgueres, muçarela, presunto, bacon, linguiça, picanha, ovo, milho, alface, tomate e abacaxi.',
    xtudoQuote: '“O melhor x-tudo de Seattle” — palavra nossa, lá no Instagram.',
    burgerHours: 'Hambúrgueres brasileiros de quinta a domingo, das 17h às 22h.',
    catCraft: 'Hambúrgueres artesanais', catCombos: 'Combos', catSides: 'Acompanhamentos e molhos',
    m02: 'Pão, hambúrguer, muçarela, presunto, bacon e linguiça.',
    m03: '2 ovos, muçarela, milho, alface e tomate.',
    m04: 'Pão de hambúrguer, filé de frango, muçarela, presunto, milho, alface, tomate e bacon.',
    m07: 'Pão, hambúrguer, muçarela, ovo, bacon, milho, alface e tomate.',
    m08: 'Pão, hambúrguer, muçarela, presunto, alface e tomate.',
    m09: 'Pão, hambúrguer, queijo e presunto.',
    c12: 'X-Tudo + batata frita + refrigerante', c13: 'X-Bacon + batata frita + refrigerante', c14: 'X-Salada + batata frita + refrigerante',
    s15: 'Batata frita (P)', s16: 'Batata frita (G)', s21: 'Maionese temperada',
    bfTitle: 'Café da manhã', bfIntro: 'Café da manhã brasileiro, a partir das 6h30.',
    bf1: 'Quentinho, saindo do forno', bf2: 'Café coado com leite', bf3: 'Crocantes, recheadas de frango',
    bf4: 'Pãozinho francês quentinho', bf5n: 'Bolos variados', bf5: 'Bolos caseiros do dia', bf6n: 'Salgados', bf6: 'Sequinhos e crocantes',
    sw1: 'Pudim de leite com calda de caramelo', sw2: 'Camadas de creme e biscoito, chocolate e morango',
    sw3n: 'Pavê de chocolate', sw3: 'Chocolate sobre creme, finalizado com raspas',
    sweetsNote: 'Pergunte à nossa equipe quais sobremesas estão na vitrine hoje.',
    metaBuffet: 'Comer aqui ou levar', metaBurgers: 'Qui – dom · 17h – 22h', metaBreakfast: 'A partir das 6h30', metaSweets: 'Pergunte as opções do dia',
    burgerTitle: 'Hambúrgueres brasileiros', sweetsTitle: 'Sobremesas',
    fAll: 'Todos', fDishes: 'Pratos', fBuffet: 'Buffet', fDesserts: 'Sobremesas', fVideos: 'Vídeos', gMarmita: 'Prato para viagem', gBuffetLine: 'A linha do buffet',
    altBuffetLine: 'O buffet do Goianeiro: farofa com ovos, banana frita, batata frita, frango assado e cozidos',
    expKicker: 'Por que o Goianeiro', expTitle1: 'Sentiu falta', expTitle2: 'do gosto de casa?',
    r1t: 'Comida de verdade', r1: 'Feita na hora, do zero: o feijão, os cozidos e a mandioca frita que você comia em Minas e Goiás.',
    r2t: 'Direto da brasa', r2: 'Nossa churrasqueira mantém os espetos girando — a carne chega no prato saindo do fogo.',
    r3t: 'Do café ao hambúrguer', r3: 'Pão de queijo e café de manhã, buffet no almoço e hambúrguer brasileiro de quinta a domingo à noite.',
    r4t: 'Leve para casa', r4: 'Peça um prato completo para viagem — churrasco, mandioca, arroz e todos os acompanhamentos, bem quentinho.',
    marmitaCap: 'Um prato do Goianeiro para viagem.',
    galKicker: 'Galeria', galTitle1: 'Uma mesa', galTitle2: 'que vale a viagem.', gDoces: 'Sobremesas',
    visitKicker: 'Visite a gente', visitTitle1: 'Chegue com fome.', visitTitle2: 'Saia de barriga cheia.',
    hoursTitle: 'Horário', monWed: 'Segunda a quarta', thuSun: 'Quinta a domingo', hMonWed: '11h – 19h', hThuSun: '11h – 22h',
    hBreakfast: 'Café da manhã', hBreakfastT: 'a partir das 6h30', hBurgers: 'Hambúrgueres', hBurgersT: 'qui – dom, 17h – 22h',
    mapNear: 'Kirkland · pertinho de Seattle', mapLoad: 'Mostrar mapa',
    closeTitle1: 'Sentiu saudade', closeTitle2: 'da terrinha?', closeText: 'Sua mesa no Goianeiro está esperando.',
    fVisit: 'Endereço', fCall: 'Telefone', fFollow: 'Siga',
    abOrder: 'Pedir', abMenu: 'Cardápio', abCall: 'Ligar', abDirections: 'Rota',
    sheetKicker: 'Retirada e viagem', sheetTitle: 'Ligue para pedir',
    sheetText: 'Faça seu pedido por telefone e deixamos tudo quentinho, pronto para você retirar.',
    sheetKickerR: 'Reservas', sheetTitleR: 'Ligue para reservar',
    sheetTextR: 'Vem em grupo ou quer garantir a mesa? Ligue e confira a disponibilidade com a nossa equipe.',
    altMandioca: 'Gamela com mandioca frita, torresmo e couve refogada',
    altTropeiro: 'Bandeja de feijão tropeiro com torresmo, couve e ovos fritos',
    altChapa: 'Chapa de ferro com carne fatiada, cebola e batata frita com queijo derretido',
    altPao: 'Cesta de pão de queijo fresquinho em papel xadrez', altPaoShort: 'Pão de queijo fresquinho',
    altPudim: 'Pudim de leite inteiro com calda de caramelo em prato azul e branco', altPudimShort: 'Pudim de leite com calda',
    altBuffet: 'Vista de cima do buffet do Goianeiro: frango, cozidos, arroz, feijão, macarrão, mandioca com torresmo',
    altPave: 'Pavê em camadas com raspas de chocolate e morangos', altChoc: 'Travessa de creme coberto com chocolate e raspas',
    altMarmita: 'Marmita com churrasco fatiado, linguiça, frango, mandioca frita, arroz, macarrão e couve',
    statusOpen: 'Aberto agora · fecha às {t}', statusOpensToday: 'Fechado · abre hoje às {t}', statusOpensTomorrow: 'Fechado · abre amanhã às {t}',
    today: 'Hoje',
  };
  const EN_EXTRA = {
    sheetKickerR: 'Reservations', sheetTitleR: 'Call to reserve',
    sheetTextR: 'Coming with a group or want to hold a table? Call and check availability with our team.',
    statusOpen: 'Open now · closes at {t}', statusOpensToday: 'Closed · opens today at {t}', statusOpensTomorrow: 'Closed · opens tomorrow at {t}',
    today: 'Today',
  };
  const META = {
    en: {
      title: document.title,
      desc: $('meta[name="description"]').content,
    },
    pt: {
      title: 'Restaurante Goianeiro | Comida brasileira em Kirkland, WA · Minas e Goiás',
      desc: 'O Goianeiro é um restaurante brasileiro em Kirkland, WA, perto de Seattle: comida caseira de Minas Gerais e Goiás, buffet, churrasco na brasa, hambúrguer brasileiro, pão de queijo e café da manhã.',
    },
  };

  // Capture the English copy from the HTML once.
  const EN = { ...EN_EXTRA };
  $$('[data-i18n]').forEach(el => { if (!(el.dataset.i18n in EN)) EN[el.dataset.i18n] = el.innerHTML; });
  $$('[data-i18n-attr]').forEach(el => el.dataset.i18nAttr.split(';').forEach(pair => {
    const [attr, key] = pair.split(':'); if (!(key in EN)) EN[key] = el.getAttribute(attr);
  }));
  let lang = 'en';
  const t = key => (lang === 'pt' ? PT[key] : EN[key]) ?? EN[key] ?? key;

  function setLang(next) {
    lang = next === 'pt' ? 'pt' : 'en';
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    $$('[data-i18n]').forEach(el => { const v = t(el.dataset.i18n); if (v != null) el.innerHTML = v; });
    $$('[data-i18n-attr]').forEach(el => el.dataset.i18nAttr.split(';').forEach(pair => {
      const [attr, key] = pair.split(':'); const v = t(key); if (v != null) el.setAttribute(attr, v);
    }));
    $$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    document.title = META[lang].title;
    $('meta[name="description"]').content = META[lang].desc;
    try { localStorage.setItem('goianeiro-lang', lang); } catch (e) { /* storage unavailable */ }
    updateStatus();
  }
  $$('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));

  /* ---------- open-now status & today's hours (Pacific time) ---------- */
  function pacificNow() {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: CONFIG.timezone, weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false })
      .formatToParts(new Date()).reduce((o, p) => (o[p.type] = p.value, o), {});
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
    return { day, mins: (Number(parts.hour) % 24) * 60 + Number(parts.minute) };
  }
  function fmtTime(m) {
    const h = Math.floor(m / 60), mm = m % 60;
    if (lang === 'pt') return `${h}h${mm ? String(mm).padStart(2, '0') : ''}`;
    return `${((h + 11) % 12) + 1}${mm ? ':' + String(mm).padStart(2, '0') : ''} ${h < 12 ? 'AM' : 'PM'}`;
  }
  function updateStatus() {
    const { day, mins } = pacificNow();
    const [open, close] = CONFIG.hours[day];
    let text, isOpen = false;
    if (mins >= open && mins < close) { isOpen = true; text = t('statusOpen').replace('{t}', fmtTime(close)); }
    else if (mins < open) text = t('statusOpensToday').replace('{t}', fmtTime(open));
    else text = t('statusOpensTomorrow').replace('{t}', fmtTime(CONFIG.hours[(day + 1) % 7][0]));
    $$('[data-status]').forEach(el => { el.textContent = text; el.classList.toggle('is-open', isOpen); });
    $$('.hours tr[data-days]').forEach(tr => {
      const today = tr.dataset.days.split(',').map(Number).includes(day);
      tr.classList.toggle('is-today', today);
      $('th', tr).dataset.today = t('today');
    });
  }

  // Language: saved choice → browser language → English
  let saved = null;
  try { saved = localStorage.getItem('goianeiro-lang'); } catch (e) { /* ignore */ }
  setLang(saved || ((navigator.language || '').toLowerCase().startsWith('pt') ? 'pt' : 'en'));
  setInterval(updateStatus, 60000);

  // Smooth scrolling only after load, so deep links (/#menu) land instantly.
  addEventListener('load', () => setTimeout(() => document.documentElement.classList.add('smooth'), 400));

  /* ---------- header: solid on scroll, hide on scroll down ---------- */
  const header = $('.site-header');
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    header.classList.toggle('is-hidden', y > 600 && y > lastY + 4);
    if (y < lastY - 4) header.classList.remove('is-hidden');
    lastY = y;
  }, { passive: true });

  // active nav link
  const navLinks = $$('.nav a');
  const sectionObs = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['menu', 'kitchen', 'experience', 'gallery', 'visit'].forEach(id => { const s = document.getElementById(id); if (s) sectionObs.observe(s); });

  /* ---------- reveal on scroll ---------- */
  // Clip-reveal frames start fully clipped, and browsers count an element's own clip-path
  // as "not visible" — so those are observed through their (unclipped) parent instead.
  const revealTargets = new Map(); // observed element -> elements to reveal
  const revealObs = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    (revealTargets.get(e.target) || []).forEach(el => el.classList.add('is-in'));
    revealObs.unobserve(e.target);
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0 });
  $$('[data-reveal]').forEach(el => {
    // stagger siblings in the same parent
    const sibs = $$(':scope > [data-reveal]', el.parentElement);
    const i = sibs.indexOf(el);
    if (i > 0) el.style.transitionDelay = `${Math.min(i, 5) * 90}ms`;
    const watch = el.dataset.reveal === 'clip' ? el.parentElement : el;
    if (!revealTargets.has(watch)) revealTargets.set(watch, []);
    revealTargets.get(watch).push(el);
    revealObs.observe(watch);
  });
  // Safety net: never leave content hidden (e.g. a jump-link landing past an element).
  addEventListener('load', () => setTimeout(() => {
    $$('[data-reveal]:not(.is-in)').forEach(el => { if (el.getBoundingClientRect().bottom < innerHeight) el.classList.add('is-in'); });
  }, 1500));

  /* ---------- lazy, viewport-aware video ---------- */
  const isMobile = matchMedia('(max-width: 899px)').matches;
  // Videos may ship a lighter portrait cut for phones (data-src-m / data-poster-m).
  if (isMobile) $$('video[data-poster-m]').forEach(v => (v.poster = v.dataset.posterM));
  function loadVideo(v) {
    if (v.dataset.loaded) return;
    $$('source[data-src]', v).forEach(s => (s.src = (isMobile && s.dataset.srcM) || s.dataset.src));
    v.load();
    v.dataset.loaded = '1';
  }
  const autoplayVideos = $$('video[data-autoplay]');
  if (!liteMode) {
    const videoObs = new IntersectionObserver(entries => entries.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) { loadVideo(v); v.play().catch(() => {}); }
      else if (v.dataset.loaded) v.pause();
    }), { rootMargin: '200px 0px', threshold: 0.15 });
    autoplayVideos.forEach(v => videoObs.observe(v));
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) autoplayVideos.forEach(v => v.pause());
  });

  /* ---------- hero 3D: pointer tilt, scroll depth, embers ---------- */
  const hero = $('[data-hero]');
  // The hero is pinned (sticky) on desktop; if it is taller than the window, pin it so its bottom stays reachable.
  const pinHero = () => hero && hero.style.setProperty('--hero-top', Math.min(0, innerHeight - hero.offsetHeight) + 'px');
  pinHero();
  addEventListener('resize', pinHero, { passive: true });
  if (hero && !reduceMotion) {
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches && !isMobile;
    const lowEnd = (navigator.hardwareConcurrency || 8) <= 2 || (navigator.deviceMemory || 8) <= 2;
    let heroVisible = true, raf = 0;
    const cur = { x: 0, y: 0 }, target = { x: 0, y: 0 };

    const setScroll = () => hero.style.setProperty('--p', Math.min(Math.max(scrollY / hero.offsetHeight, 0), 1).toFixed(4));
    const tick = () => {
      cur.x += (target.x - cur.x) * 0.075;
      cur.y += (target.y - cur.y) * 0.075;
      hero.style.setProperty('--mx', cur.x.toFixed(4));
      hero.style.setProperty('--my', cur.y.toFixed(4));
      raf = (Math.abs(target.x - cur.x) > 0.001 || Math.abs(target.y - cur.y) > 0.001) && heroVisible ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => { if (!raf && heroVisible) raf = requestAnimationFrame(tick); };

    if (finePointer) {
      addEventListener('pointermove', e => {
        if (!heroVisible) return;
        target.x = (e.clientX / innerWidth) * 2 - 1;
        target.y = (e.clientY / innerHeight) * 2 - 1;
        kick();
      }, { passive: true });
      document.documentElement.addEventListener('pointerleave', () => { target.x = target.y = 0; kick(); });
    }
    let scrollQueued = false;
    addEventListener('scroll', () => {
      if (scrollQueued || scrollY > hero.offsetHeight * 1.2) return;
      scrollQueued = true;
      requestAnimationFrame(() => { setScroll(); scrollQueued = false; });
    }, { passive: true });
    setScroll();

    // Ember particles: a few dozen sparks drifting up from the coals (desktop only)
    const canvas = $('.h3d__embers', hero);
    let embersOn = false;
    if (canvas && finePointer && !liteMode && !lowEnd) {
      const ctx = canvas.getContext('2d');
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      let w = 0, h = 0, last = 0;
      const sparks = [];
      const resize = () => {
        w = canvas.clientWidth; h = canvas.clientHeight;
        canvas.width = w * dpr; canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      const spawn = (s = {}) => Object.assign(s, {
        x: w * (0.15 + Math.random() * 0.75), y: h * (0.62 + Math.random() * 0.4),
        r: 0.5 + Math.random() * 1.4, vy: 10 + Math.random() * 26, vx: -6 + Math.random() * 12,
        life: 0, ttl: 3 + Math.random() * 4, hue: 22 + Math.random() * 22,
      });
      const frame = t => {
        if (!embersOn) return;
        const dt = Math.min((t - last) / 1000, 0.05); last = t;
        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'lighter';
        for (const s of sparks) {
          s.life += dt;
          if (s.life > s.ttl) spawn(s);
          s.y -= s.vy * dt; s.x += (s.vx + Math.sin((s.life + s.r) * 2) * 8) * dt;
          const fade = Math.sin(Math.PI * (s.life / s.ttl));
          ctx.fillStyle = `hsla(${s.hue}, 95%, 62%, ${0.55 * fade})`;
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
        }
        requestAnimationFrame(frame);
      };
      resize();
      addEventListener('resize', resize, { passive: true });
      for (let i = 0; i < 34; i++) { const s = spawn(); s.life = Math.random() * s.ttl; sparks.push(s); }
      const start = () => { if (!embersOn) { embersOn = true; last = performance.now(); requestAnimationFrame(frame); } };
      const stop = () => { embersOn = false; };
      new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop())).observe(hero);
      document.addEventListener('visibilitychange', () => (document.hidden ? stop() : heroVisible && start()));
    }

    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; if (heroVisible) kick(); }).observe(hero);
  }

  /* ---------- parallax ---------- */
  const parallax = $$('[data-parallax]');
  if (!reduceMotion && parallax.length) {
    let ticking = false;
    const run = () => {
      const vh = innerHeight;
      parallax.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const offset = (r.top + r.height / 2 - vh / 2) * Number(el.dataset.parallax);
        el.style.transform = `translate3d(0, ${(-offset).toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  /* ---------- menu tabs (WAI-ARIA tabs pattern) ---------- */
  const tabs = $$('[role="tab"]');
  function selectTab(tab, focus) {
    tabs.forEach(tb => {
      const on = tb === tab;
      tb.setAttribute('aria-selected', String(on));
      tb.tabIndex = on ? 0 : -1;
      document.getElementById(tb.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', e => {
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (d) { e.preventDefault(); selectTab(tabs[(i + d + tabs.length) % tabs.length], true); }
      if (e.key === 'Home') { e.preventDefault(); selectTab(tabs[0], true); }
      if (e.key === 'End') { e.preventDefault(); selectTab(tabs[tabs.length - 1], true); }
    });
  });

  /* ---------- order / reserve sheet ---------- */
  const sheet = $('#order-sheet');
  $$('[data-open-order]').forEach(btn => btn.addEventListener('click', () => {
    const reserve = btn.dataset.openOrder === 'reserve';
    if (!reserve && CONFIG.orderUrl) { window.open(CONFIG.orderUrl, '_blank', 'noopener'); return; }
    $('[data-sheet-kicker]', sheet).dataset.i18n = reserve ? 'sheetKickerR' : 'sheetKicker';
    $('[data-sheet-title]', sheet).dataset.i18n = reserve ? 'sheetTitleR' : 'sheetTitle';
    $('[data-sheet-text]', sheet).dataset.i18n = reserve ? 'sheetTextR' : 'sheetText';
    ['[data-sheet-kicker]', '[data-sheet-title]', '[data-sheet-text]'].forEach(s => { const el = $(s, sheet); el.innerHTML = t(el.dataset.i18n); });
    sheet.showModal();
  }));
  sheet.addEventListener('click', e => { if (e.target === sheet) sheet.close(); });
  $$('[data-close-sheet]', sheet).forEach(a => a.addEventListener('click', () => sheet.close()));

  /* ---------- gallery lightbox ---------- */
  const lb = $('#lightbox');
  const stage = $('[data-lb-stage]', lb);
  const tiles = $$('[data-gallery] .tile');
  let list = tiles; // the tiles the lightbox browses: only those visible under the current filter
  let current = 0;
  function show(i) {
    current = (i + list.length) % list.length;
    const tile = list[current];
    stage.innerHTML = '';
    if (tile.dataset.type === 'video') {
      const v = document.createElement('video');
      v.controls = true; v.loop = true; v.muted = true; v.playsInline = true; v.autoplay = true;
      v.poster = tile.dataset.poster;
      v.setAttribute('aria-label', tile.getAttribute('aria-label'));
      ['webm', 'mp4'].forEach(ext => {
        const s = document.createElement('source');
        s.src = `${tile.dataset.full}.${ext}`; s.type = `video/${ext}`; v.appendChild(s);
      });
      stage.appendChild(v);
    } else {
      const img = new Image();
      img.src = tile.dataset.full;
      img.alt = $('img', tile).alt;
      stage.appendChild(img);
    }
    $('[data-lb-count]', lb).textContent = `${current + 1} / ${list.length}`;
  }
  tiles.forEach(tile => tile.addEventListener('click', () => {
    list = tiles.filter(t => !t.classList.contains('is-hidden'));
    show(list.indexOf(tile));
    lb.showModal();
  }));

  // gallery filters
  const filterBtns = $$('[data-filter]');
  filterBtns.forEach(btn => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    filterBtns.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    tiles.forEach(t => {
      const show = f === 'all' || t.dataset.cat.split(' ').includes(f);
      t.classList.toggle('is-hidden', !show);
      t.classList.remove('is-in-filter');
      if (show) { void t.offsetWidth; t.classList.add('is-in-filter'); }
    });
  }));
  lb.addEventListener('click', e => {
    const act = e.target.closest('[data-lb]')?.dataset.lb;
    if (act === 'close' || e.target === lb || e.target === stage) lb.close();
    if (act === 'prev') show(current - 1);
    if (act === 'next') show(current + 1);
  });
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') show(current + 1);
    if (e.key === 'ArrowLeft') show(current - 1);
  });
  lb.addEventListener('close', () => { stage.innerHTML = ''; });
  // swipe on touch
  let sx = null;
  lb.addEventListener('touchstart', e => (sx = e.touches[0].clientX), { passive: true });
  lb.addEventListener('touchend', e => {
    if (sx == null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    sx = null;
  });

  /* ---------- map: load the embed only when wanted/near ---------- */
  const map = $('[data-map]');
  function loadMap() {
    if (map.dataset.loaded) return;
    map.dataset.loaded = '1';
    const f = document.createElement('iframe');
    f.src = mapEmbedUrl; f.loading = 'lazy'; f.title = 'Map: ' + fullAddress;
    f.referrerPolicy = 'no-referrer-when-downgrade';
    map.appendChild(f);
    f.addEventListener('load', () => $('.map__facade', map)?.remove());
  }
  $('[data-load-map]').addEventListener('click', loadMap);
  if (!liteMode) {
    new IntersectionObserver((entries, obs) => {
      if (entries[0].isIntersecting) { loadMap(); obs.disconnect(); }
    }, { rootMargin: '300px 0px' }).observe(map);
  }
})();
