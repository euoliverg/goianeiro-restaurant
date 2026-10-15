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
    // Customer reviews (Supabase). Paste the Project URL and the anon / publishable key
    // from Supabase → Project Settings → API. Both are safe to publish: the database
    // only lets the public read visible reviews and add new ones (see supabase/reviews.sql).
    // public (publishable) key only — never the secret / service_role key
    reviews: { supabaseUrl: 'https://zogevfuaffiucgbbreds.supabase.co', supabaseKey: 'sb_publishable_elXWrCATrKV3YF6-l_PqlQ_Vt86lAhx' },
  };
  const fullAddress = `${CONFIG.address.line1}, ${CONFIG.address.line2}`;
  const directionsUrl = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent('Goianeiro Restaurant, ' + fullAddress);
  const mapEmbedUrl = 'https://www.google.com/maps?q=' + encodeURIComponent(fullAddress) + '&z=15&output=embed';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Old one-page links (/#menu, /#visit …) keep working: those sections now have their own pages.
  const MOVED = { menu: 'menu.html', kitchen: 'about.html#kitchen', experience: 'about.html#experience', gallery: 'about.html#gallery', visit: 'contact.html' };
  const oldHash = location.hash.slice(1);
  if (MOVED[oldHash] && !document.getElementById(oldHash)) { location.replace(MOVED[oldHash]); return; }

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
    navAbout: 'Sobre', navContact: 'Contato', fExplore: 'Explorar', ctaHoursMap: 'Horários, telefones e mapa', storyMore: 'Nossa história e cozinha',
    hlPlates: 'Carne na brasa com todos os acompanhamentos no mesmo prato.', hlBuffet: 'Bandejas quentinhas de comida caseira de Minas e Goiás.',
    hlBurgers: 'Hambúrguer brasileiro caprichado: X-Tudo, X-Bacon e mais.', hlSweets: 'Pudim, pavê e copinhos.',
    altBurgerMilho: 'Hambúrguer brasileiro com carne, milho e alface', altBurgerTorre: 'Hambúrguer alto com ovo, queijo e alface, servido com batata frita',
    altPudimCalda: 'Pudim de leite inteiro com calda de caramelo, visto de cima', altPudimDuplo: 'Dois pudins de leite com calda brilhante',
    capBurgerMilho: 'Carne, milho e alface', capBurgerTorre: 'Caprichado, com fritas', gCostela: 'Soltando do osso', gBurger: 'Hambúrguer brasileiro',
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
    tabPlates: 'Pratos da casa', metaPlates: 'Na brasa · novidade',
    platesTitle: 'Pratos da casa',
    platesIntro: 'Pratos brasileiros completos: carne saindo da brasa e todos os acompanhamentos no mesmo prato, do jeito que a gente come em casa.',
    platesNote: 'Ligue antes e deixamos seu prato quentinho, pronto para retirar.',
    espCap: '— servido do jeito brasileiro',
    pEsp: 'Espetinho de carne na brasa com arroz, feijão, macarrão, alface e tomate, mandioca frita e torresmo pururuca.',
    pEspMeta: 'Para comer aqui ou levar',
    pMarmita: 'Churrasco fatiado, linguiça e frango assado com mandioca frita, arroz, macarrão e couve, embalado bem quentinho.',
    tagNew: 'Novo', tagGrill: 'Na brasa', tagSizzling: 'Na chapa quente', tagToGo: 'Para viagem',
    bName13: 'Costelinha assada', bDesc13: 'Costelinha de porco assada, bem temperada e finalizada com salsinha',
    sw4n: 'Copinhos de sobremesa', sw4: 'Sobremesas individuais para levar: pergunte os sabores do dia',
    altEspVideo: 'Feijão sendo servido sobre um prato com espetinho de carne, arroz, macarrão e salada',
    altEspPrato: 'Prato com espetinho de carne, feijão, arroz, macarrão, alface, tomate, mandioca frita e torresmo',
    altEspViagem: 'Prato com espetinho para viagem: espetinho, arroz, feijão, macarrão, mandioca frita e torresmo',
    altEspBalcao: 'Prato com espetinho saindo da cozinha',
    altCostelinha: 'Assadeira de costelinha de porco assada com salsinha',
    altCarneBatata: 'Assadeira de carne cozida com batata',
    altPaoSal: 'Assadeira de pão de sal dourado saindo do forno',
    altCopinhos: 'Copinhos de sobremesa com camadas de creme e chocolate',
    tabBuffet: 'Buffet', tabBurgers: 'Hambúrgueres', tabBreakfast: 'Café da manhã', tabSweets: 'Sobremesas',
    buffetNote: 'Os pratos variam — todos estes já passaram pelo nosso buffet. Pergunte à equipe o que tem hoje.',
    buffetTitle: 'Buffet brasileiro',
    buffetIntro: 'Bandejas quentinhas de comida caseira mineira e goiana, mais churrasco direto da brasa. Coma aqui ou leve um prato completo para viagem.',
    catMeats: 'Carnes', catBuffetSides: 'Acompanhamentos e saladas', catAlso: 'Também no buffet', gBuffetHot: 'O buffet quentinho',
    bDescBisteca: 'Bisteca suína temperada', bDescFrangoFrito: 'Frango frito com mandioca frita',
    bDescCarneMoida: 'Carne moída refogada com pimentão, cebola e tomate', bDescSalsicha: 'Salsicha ao molho de tomate com milho',
    bDescTorresmo: 'Torresmo pururuca', bDescMandioca: 'Mandioca frita sequinha', bDescPolenta: 'Polenta cremosa gratinada com queijo',
    altBisteca: 'Bandeja de bisteca suína temperada', altFrangoFrito: 'Bandeja de frango frito com mandioca frita e cebolinha',
    altCarneMoida: 'Bandeja de carne moída refogada com pimentão, cebola e tomate', altSalsicha: 'Bandeja de salsicha ao molho de tomate com milho',
    altTropeiro: 'Bandeja de feijão tropeiro: feijão e farinha de mandioca com ovos cozidos', altTorresmo: 'Travessa de torresmo pururuca',
    altMandiocaFrita: 'Tigela de mandioca frita dourada', altPolenta: 'Bandeja de polenta cremosa gratinada com queijo',
    altCouve: 'Tigela de couve refogada no alho', altSaladas: 'Bufê de saladas: folhas, ovos cozidos, vinagrete, beterraba, salada de batata e tomate',
    bDesc1: 'Carnes assadas no espeto', bDesc2: 'Feijão com farinha de mandioca tostada, servido com ovos cozidos', bDesc3: 'Nos dias de feijoada',
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
    bf4: 'Pãozinho francês quentinho', bf5n: 'Bolos variados', bf5: 'Variedade de bolos', bf6n: 'Salgados', bf6: 'Sequinhos e crocantes',
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
    altBuffet: 'O buffet do Goianeiro: torresmo, carne moída, macarrão, cozidos, mandioca frita, feijão tropeiro e arroz',
    altPave: 'Pavê em camadas com raspas de chocolate e morangos', altChoc: 'Travessa de creme coberto com chocolate e raspas',
    altMarmita: 'Marmita com churrasco fatiado, linguiça, frango, mandioca frita, arroz, macarrão e couve',
    statusOpen: 'Aberto agora · fecha às {t}', statusOpensToday: 'Fechado · abre hoje às {t}', statusOpensTomorrow: 'Fechado · abre amanhã às {t}',
    today: 'Hoje',
    navReviews: 'Avaliações', revKicker: 'Avaliações', revTitle1: 'Direto dos', revTitle2: 'nossos clientes.',
    revWrite: 'Escrever avaliação', revCatFood: 'Qualidade da comida', revCatService: 'Atendimento', revCatAmb: 'Ambiente',
    revSortLabel: 'Ordenar', revSortNew: 'Mais recentes', revSortHigh: 'Melhores notas', revSortLow: 'Piores notas',
    revMore: 'Ver mais avaliações', revSortPhotos: 'Com fotos',
    rvSeeAll: 'Ver todas as avaliações', rvBack: '← Voltar ao início',
    rvStarsLabel: '{v} de 5 estrelas', rvStar1: '1 estrela', rvStarN: '{n} estrelas',
    rvBasedOne: 'Baseado em 1 avaliação', rvBasedMany: 'Baseado em {n} avaliações', rvNone: 'Ainda não há avaliações',
    rvDistRow: '{s} estrelas: {n}', rvAte: 'Pediu', rvFood: 'Comida',
    rvEmptyT: 'Ainda não há avaliações.', rvEmptyD: 'Já veio ao Goianeiro? Seja o primeiro a contar como estava a comida.',
    rvErr: 'Não foi possível carregar as avaliações agora.', rvRetry: 'Tentar de novo',
    rvSoon: 'As avaliações abrem em breve.',
    fClose: 'Fechar', fKicker: 'Sua avaliação', fTitle: 'Avalie sua visita', fOverall: 'Nota geral', fFood: 'Qualidade da comida',
    fService: 'Atendimento (opcional)', fAmb: 'Ambiente (opcional)', fName: 'Seu nome',
    fNameHint: 'Aparece publicamente — só o primeiro nome já basta.', rfVisit: 'Como foi a visita? (opcional)',
    vDine: 'Comi no restaurante', vTake: 'Para viagem', vBreakfast: 'Café da manhã', vBurgers: 'Hambúrgueres',
    fDish: 'O que você comeu? (opcional)', fComment: 'Conte como estava a comida', fCommentPh: 'O que você pediu? Como estava?',
    fConsent: 'Esta avaliação (e a foto, se tiver) é da minha própria visita ao Goianeiro.',
    fPhoto: 'Adicionar uma foto (opcional)', fPhotoPick: 'Escolher uma foto da sua comida', fPhotoRemove: 'Remover foto',
    fPhotoHint: 'A gente reduz a foto e remove a localização antes de enviar.', fPhotoChange: 'Trocar foto', fPhotoWorking: 'Preparando a foto…',
    ePhotoType: 'Esse arquivo não é uma imagem que dá para usar. Tente uma foto JPG ou PNG.', ePhotoBig: 'Essa foto é grande demais (máx. 15 MB).',
    ePhotoUp: 'Não foi possível enviar a foto. Tente de novo ou publique sem ela.', ePhotoLimit: 'Você enviou várias fotos em pouco tempo. Tente de novo mais tarde.',
    rvNoPhotos: 'Ainda não há avaliações com foto.', rvPhotoAlt: 'Foto de {name}', rvPhotoOpen: 'Ver foto de {name}',
    fNote: 'As avaliações são publicadas na hora. Links não são permitidos, e conteúdo ofensivo é removido.',
    fSubmit: 'Publicar avaliação', fSending: 'Publicando…', fOther: 'Outro prato',
    sTitle: 'Obrigado!', sText: 'Sua avaliação já está publicada no site.', sClose: 'Fechar',
    eOverall: 'Escolha uma nota geral.', eFood: 'Dê uma nota para a comida.', eName: 'Digite seu nome (2 a 40 caracteres).',
    eComment: 'Escreva pelo menos 10 caracteres sobre a sua visita.', eLink: 'Links não são permitidos nas avaliações.',
    eConsent: 'Confirme que a avaliação é sobre a sua própria visita.',
    eRate: 'Você enviou várias avaliações em pouco tempo. Tente de novo mais tarde.',
    eCheck: 'Algum campo não foi aceito. Confira e tente de novo.',
    eNet: 'Não foi possível publicar agora. Verifique a conexão e tente de novo.',
  };
  const EN_EXTRA = {
    sheetKickerR: 'Reservations', sheetTitleR: 'Call to reserve',
    sheetTextR: 'Coming with a group or want to hold a table? Call and check availability with our team.',
    statusOpen: 'Open now · closes at {t}', statusOpensToday: 'Closed · opens today at {t}', statusOpensTomorrow: 'Closed · opens tomorrow at {t}',
    today: 'Today',
    rvStarsLabel: '{v} out of 5 stars', rvStar1: '1 star', rvStarN: '{n} stars',
    rvBasedOne: 'Based on 1 review', rvBasedMany: 'Based on {n} reviews', rvNone: 'No reviews yet',
    rvDistRow: '{s} stars: {n}', rvAte: 'Ate', rvFood: 'Food',
    rvEmptyT: 'No reviews yet.', rvEmptyD: 'Been to Goianeiro? Be the first to tell others how the food was.',
    rvErr: 'We couldn’t load the reviews right now.', rvRetry: 'Try again',
    rvSoon: 'Reviews are opening soon.',
    eOverall: 'Choose an overall rating.', eFood: 'Rate the food quality.', eName: 'Enter your name (2–40 characters).',
    eComment: 'Write at least 10 characters about your visit.', eLink: 'Links aren’t allowed in reviews.',
    eConsent: 'Please confirm this review is about your own visit.',
    eRate: 'You’ve sent several reviews in a short time. Please try again later.',
    eCheck: 'Something in the review isn’t accepted. Check the fields and try again.',
    eNet: 'Couldn’t publish right now. Check your connection and try again.',
    fSending: 'Publishing…', fOther: 'Something else',
    fPhotoChange: 'Change photo', fPhotoWorking: 'Preparing your photo…',
    ePhotoType: 'That file isn’t an image we can use. Try a JPG or PNG photo.', ePhotoBig: 'That photo is too large (max 15 MB).',
    ePhotoUp: 'Couldn’t upload the photo. Try again or publish without it.', ePhotoLimit: 'You’ve sent several photos in a short time. Please try again later.',
    rvNoPhotos: 'No reviews with photos yet.', rvPhotoAlt: 'Photo by {name}', rvPhotoOpen: 'View photo by {name}',
  };
  const onReviewsPage = document.body.classList.contains('page-reviews');
  const META = {
    en: {
      title: document.title,
      desc: $('meta[name="description"]').content,
    },
    pt: document.documentElement.dataset.titlePt ? {
      title: document.documentElement.dataset.titlePt,
      desc: document.documentElement.dataset.descPt,
    } : onReviewsPage ? {
      title: 'Avaliações | Restaurante Goianeiro · Comida brasileira em Kirkland, WA',
      desc: 'O que os clientes dizem do Goianeiro, restaurante brasileiro de Minas e Goiás em Kirkland, WA: notas para a comida, o atendimento e o ambiente, com fotos. Deixe a sua avaliação.',
    } : {
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

  const langHooks = []; // features that render text from JS re-render on language change
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
    langHooks.forEach(fn => fn());
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
  const tabFromHash = () => { const tb = document.getElementById('tab-' + ({ desserts: 'sweets' }[location.hash.slice(1)] || location.hash.slice(1))); if (tb && tb.getAttribute('role') === 'tab') selectTab(tb); };
  tabFromHash();
  addEventListener('hashchange', tabFromHash);
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

  /* ---------- customer reviews (Supabase REST) ---------- */
  // Two layouts share this code: data-reviews="featured" on the home page (only the best reviews,
  // shown once there are real ones) and data-reviews="full" on reviews.html (everything + the form).
  const rvRoot = $('[data-reviews]');
  const rvConfigured = !!(CONFIG.reviews.supabaseUrl && CONFIG.reviews.supabaseKey);
  // Until Supabase is configured the section (and its nav link) stays out of the page entirely,
  // so customers never see an empty or half-working feature.
  if (!rvConfigured) {
    if (rvRoot) rvRoot.hidden = true;
    $$('[data-nav-reviews]').forEach(a => (a.hidden = true));
  }
  if (rvRoot && rvConfigured) {
    const featuredMode = rvRoot.dataset.reviews === 'featured';
    const RV = CONFIG.reviews;
    const enabled = true;
    const base = RV.supabaseUrl.replace(/\/+$/, '');
    const api = (path, opts = {}) => fetch(base + path, { ...opts, headers: { apikey: RV.supabaseKey, 'Content-Type': 'application/json', ...(opts.headers || {}) } });
    const COLS = 'id,created_at,name,rating,food,service,ambience,visit,dish,comment,lang,photo';
    const ORDER = { new: 'created_at.desc', high: 'rating.desc,created_at.desc', low: 'rating.asc,created_at.desc', photos: 'created_at.desc' };
    const BUCKET = 'goianeiro-review-photos';
    const photoUrl = name => `${base}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(name)}`;
    // Legacy anon keys are JWTs (sent as Bearer too); new publishable keys go in `apikey` only.
    const authHeaders = () => (RV.supabaseKey.startsWith('eyJ') ? { apikey: RV.supabaseKey, Authorization: `Bearer ${RV.supabaseKey}` } : { apikey: RV.supabaseKey });
    const PAGE = 6;
    // same rule as the database check (supabase/reviews.sql)
    const LINK_RE = /(https?:\/\/|www\.|\.(com|net|org|io|co|br|us|info|biz|xyz)\b)/i;
    const DISHES = ['Churrasco na brasa', 'Feijão tropeiro', 'Feijoada', 'Torresmo & mandioca frita', 'Couve refogada', 'Farofa',
      'Bife à milanesa', 'Carne com batata', 'X-Tudo', 'X-Bacon', 'X-Salada', 'X-Frango', 'Egg Burger', 'Goianeiro Burger', 'X-Kids',
      'Pão de queijo', 'Coxinhas', 'Pudim de leite', 'Pavê'];
    const VISIT_KEY = { 'dine-in': 'vDine', takeout: 'vTake', breakfast: 'vBreakfast', burgers: 'vBurgers' };
    const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.9 6 6.6.8-4.9 4.6 1.3 6.5L12 17.3l-5.9 3.2 1.3-6.5-4.9-4.6 6.6-.8z"/></svg>';

    const list = $('[data-rv-list]'), state = $('[data-rv-state]'), more = $('[data-rv-more]'), sortSel = $('[data-rv-sort]');
    const sheetRv = $('#review-sheet'), form = $('[data-rv-form]'), done = $('[data-rv-done]'), errBox = $('[data-rv-error]'), submitBtn = $('[data-rv-submit]');
    let sort = 'new', items = [], summary = null, hasMore = false, status = 'loading', lastError = null;

    const locale = () => (lang === 'pt' ? 'pt-BR' : 'en-US');
    const num1 = v => (v == null ? '–' : Number(v).toLocaleString(locale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
    const starsLabel = v => t('rvStarsLabel').replace('{v}', num1(v));
    const fmtDate = iso => new Intl.DateTimeFormat(locale(), { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
    const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
    const stars = (v, lg) => { const s = el('span', 'stars' + (lg ? ' stars--lg' : '')); s.style.setProperty('--v', v || 0); s.setAttribute('role', 'img'); s.setAttribute('aria-label', starsLabel(v || 0)); return s; };

    /* summary */
    function renderSummary() {
      const s = summary || { count: 0, dist: [0, 0, 0, 0, 0] };
      $('[data-rv-avg]').textContent = s.count ? num1(s.rating) : '–';
      const big = $('[data-rv-avg-stars]'); big.style.setProperty('--v', s.count ? s.rating : 0); big.setAttribute('aria-label', starsLabel(s.count ? s.rating : 0));
      $('[data-rv-count]').textContent = !s.count ? t('rvNone') : s.count === 1 ? t('rvBasedOne') : t('rvBasedMany').replace('{n}', s.count.toLocaleString(locale()));
      const dist = $('[data-rv-dist]');
      if (!dist) return;   // the home page only shows the average
      dist.replaceChildren();
      [5, 4, 3, 2, 1].forEach((st, i) => {
        const n = s.dist[i] || 0, li = el('li');
        li.setAttribute('aria-label', t('rvDistRow').replace('{s}', st).replace('{n}', n));
        li.append(el('span', 'rv-dist__s', String(st)), el('span', 'rv-bar'), el('span', 'rv-dist__n', String(n)));
        const fill = el('i'); fill.style.width = s.count ? `${(n / s.count) * 100}%` : '0%'; li.children[1].append(fill);
        dist.append(li);
      });
      ['food', 'service', 'ambience'].forEach(k => {
        const v = s[k]; $(`[data-rv-cat="${k}"]`).style.width = v ? `${(v / 5) * 100}%` : '0%';
        $(`[data-rv-cat-v="${k}"]`).textContent = num1(v);
      });
    }

    /* full-size photo viewer */
    const viewer = $('#rv-viewer'), viewerImg = $('[data-rv-viewer-img]');
    function openViewer(src, alt, name) {
      viewerImg.src = src; viewerImg.alt = alt; $('[data-rv-viewer-cap]').textContent = name;
      viewer.showModal();
    }
    $('[data-rv-viewer-close]').addEventListener('click', () => viewer.close());
    viewer.addEventListener('click', e => { if (e.target === viewer || e.target.tagName === 'FIGURE') viewer.close(); });
    viewer.addEventListener('close', () => viewerImg.removeAttribute('src'));

    /* list */
    function card(r) {
      const li = el('li', 'rv-card');
      const head = el('div', 'rv-card__head');
      const time = el('time', null, fmtDate(r.created_at)); time.dateTime = r.created_at;
      head.append(stars(r.rating), time);
      const text = el('p', 'rv-card__text', r.comment);          // textContent: customer text is never parsed as HTML
      const foot = el('div', 'rv-card__foot');
      foot.append(el('b', null, r.name));
      if (r.visit && VISIT_KEY[r.visit]) foot.append(el('span', null, t(VISIT_KEY[r.visit])));
      if (r.dish) foot.append(el('span', null, `${t('rvAte')}: ${r.dish}`));
      const food = el('span', 'rv-chip', `${t('rvFood')} ${r.food}/5`);
      foot.append(food);
      li.append(head);
      if (r.photo) {
        const btn = el('button', 'rv-card__photo'); btn.type = 'button';
        btn.setAttribute('aria-label', t('rvPhotoOpen').replace('{name}', r.name));
        const img = el('img'); img.src = photoUrl(r.photo); img.alt = t('rvPhotoAlt').replace('{name}', r.name);
        img.loading = 'lazy'; img.decoding = 'async';
        img.addEventListener('error', () => btn.remove());      // photo deleted in Storage → just hide it
        btn.append(img);
        btn.addEventListener('click', () => openViewer(photoUrl(r.photo), img.alt, r.name));
        li.append(btn);
      }
      li.append(text, foot);
      return li;
    }
    if (featuredMode) {
      /* home page: only the best real reviews (4–5 stars), photos first; the section stays hidden until there are some */
      const FEATURED = 3;
      let picks = [];
      const renderFeatured = () => { list.replaceChildren(...picks.map(card)); renderSummary(); };
      const loadFeatured = async () => {
        try {
          const [rows, sum] = await Promise.all([
            api(`/rest/v1/goianeiro_reviews?select=${COLS}&rating=gte.4&food=gte.4&order=created_at.desc&limit=24`).then(r => (r.ok ? r.json() : Promise.reject(r.status))),
            api('/rest/v1/rpc/goianeiro_review_summary', { method: 'POST', body: '{}' }).then(r => (r.ok ? r.json() : Promise.reject(r.status))),
          ]);
          picks = rows
            .map((r, i) => ({ r, i }))
            .sort((a, b) => (!!b.r.photo - !!a.r.photo) || (b.r.rating - a.r.rating) || (b.r.food - a.r.food) || (a.i - b.i))
            .slice(0, FEATURED).map(x => x.r);
          summary = sum;
          if (!picks.length) return;          // nothing to highlight yet: keep the home page clean
          renderFeatured();
          rvRoot.hidden = false;
        } catch { /* reviews are a bonus on the home page: fail silently */ }
      };
      langHooks.push(() => { if (picks.length) renderFeatured(); });
      if (document.readyState === 'complete') loadFeatured(); else addEventListener('load', loadFeatured, { once: true });
    } else {
    function renderList() {
      list.replaceChildren();
      list.setAttribute('aria-busy', String(enabled && status === 'loading'));
      state.hidden = true; state.replaceChildren();
      if (enabled && status === 'loading' && !items.length) {
        for (let i = 0; i < 3; i++) list.append(el('li', 'rv-card rv-card--skel'));
      }
      items.forEach(r => list.append(card(r)));
      const showState = (title, desc, action) => {
        state.hidden = false;
        state.append(el('p', 'rv-state__t', title));
        if (desc) state.append(el('p', 'rv-state__d', desc));
        if (action) state.append(action);
      };
      if (!enabled) showState(t('rvSoon'));
      else if (status === 'error' && !items.length) {
        const retry = el('button', 'btn btn--line btn--sm', t('rvRetry')); retry.type = 'button'; retry.addEventListener('click', () => reload());
        showState(t('rvErr'), null, retry);
      } else if (status === 'ready' && !items.length && sort === 'photos') {
        showState(t('rvNoPhotos'));
      } else if (status === 'ready' && !items.length) {
        const write = el('button', 'btn btn--gold', t('revWrite')); write.type = 'button'; write.addEventListener('click', openForm);
        showState(t('rvEmptyT'), t('rvEmptyD'), write);
      }
      more.hidden = !(hasMore && status !== 'loading');
      $$('[data-open-review]').forEach(b => (b.hidden = !enabled));
    }

    async function fetchPage(offset) {
      const filter = sort === 'photos' ? '&photo=not.is.null' : '';
      const r = await api(`/rest/v1/goianeiro_reviews?select=${COLS}${filter}&order=${ORDER[sort]}&limit=${PAGE + 1}&offset=${offset}`);
      if (!r.ok) throw new Error('list ' + r.status);
      const rows = await r.json();
      hasMore = rows.length > PAGE;
      return rows.slice(0, PAGE);
    }
    async function fetchSummary() {
      const r = await api('/rest/v1/rpc/goianeiro_review_summary', { method: 'POST', body: '{}' });
      if (!r.ok) throw new Error('summary ' + r.status);
      summary = await r.json();
    }
    async function reload() {
      if (!enabled) { renderSummary(); renderList(); return; }
      status = 'loading'; items = []; renderList();
      try { const [rows] = await Promise.all([fetchPage(0), fetchSummary()]); items = rows; status = 'ready'; }
      catch (e) { status = 'error'; lastError = e; }
      renderSummary(); renderList();
    }
    more.addEventListener('click', async () => {
      more.disabled = true;
      try { items = items.concat(await fetchPage(items.length)); status = 'ready'; } catch (e) { status = 'error'; }
      more.disabled = false; renderList();
    });
    sortSel.addEventListener('change', () => { sort = sortSel.value in ORDER ? sortSel.value : 'new'; reload(); });

    /* form: star pickers + dish list */
    const OPTIONAL = { service: true, ambience: true };
    function buildRatePickers() {
      $$('[data-rate-group]', form).forEach(fs => {
        const name = fs.dataset.rateGroup;
        let box = $('.rate', fs);
        const checked = box ? ($('input:checked', box) || {}).value : '';
        if (box) box.remove();
        box = el('div', 'rate');
        for (let n = 5; n >= 1; n--) {
          const id = `rv-${name}-${n}`;
          const inp = el('input'); inp.type = 'radio'; inp.name = name; inp.value = String(n); inp.id = id;
          if (checked === String(n)) inp.checked = true;
          if (!OPTIONAL[name]) inp.required = true;
          const lab = el('label'); lab.htmlFor = id; lab.innerHTML = STAR; lab.title = n === 1 ? t('rvStar1') : t('rvStarN').replace('{n}', n);
          lab.append(el('span', 'sr', lab.title));
          box.append(inp, lab);
          // optional groups: clicking the selected star again clears it
          if (OPTIONAL[name]) lab.addEventListener('click', e => { if (inp.checked) { e.preventDefault(); inp.checked = false; } });
        }
        fs.append(box);
      });
      const sel = $('[data-rv-dishes]'), cur = sel.value;
      sel.replaceChildren(new Option('—', ''), ...DISHES.map(d => new Option(d, d)), new Option(t('fOther'), ''));
      sel.value = cur;
    }
    const counter = $('[data-rv-count-chars]'), area = form.elements.comment;
    area.addEventListener('input', () => (counter.textContent = `${area.value.length}/800`));

    /* photo: resized and re-encoded in the browser (this also strips EXIF/GPS), then uploaded to Storage */
    const photoInput = $('[data-rv-photo-input]'), photoPrev = $('[data-rv-photo-preview]'),
      photoImg = $('[data-rv-photo-img]'), photoLabel = $('[data-rv-photo-label]');
    let photo = null; // { blob, ext, url, uploaded? }
    const MAX_SIDE = 1600, MAX_BYTES = 2 * 1024 * 1024, MAX_INPUT = 15 * 1024 * 1024;
    const toBlob = (canvas, type, q) => new Promise(res => canvas.toBlob(res, type, q));
    async function preparePhoto(file) {
      let src;
      try { src = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
      catch { src = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); }); }
      const w0 = src.width, h0 = src.height;
      if (!w0 || !h0) throw new Error('not an image');
      for (const side of [MAX_SIDE, 1200, 900]) {
        const k = Math.min(1, side / Math.max(w0, h0));
        const c = document.createElement('canvas'); c.width = Math.round(w0 * k); c.height = Math.round(h0 * k);
        c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
        for (const q of [0.82, 0.7]) {
          let blob = await toBlob(c, 'image/webp', q);
          if (!blob || blob.type !== 'image/webp') blob = await toBlob(c, 'image/jpeg', q + 0.05); // Safari without WebP encoding
          if (blob && blob.size <= MAX_BYTES) return { blob, ext: blob.type === 'image/webp' ? 'webp' : 'jpg' };
        }
      }
      throw new Error('too big');
    }
    function clearPhoto() {
      if (photo) URL.revokeObjectURL(photo.url);
      photo = null; photoInput.value = ''; photoPrev.hidden = true; photoImg.removeAttribute('src');
      photoLabel.textContent = t('fPhotoPick');
    }
    photoInput.addEventListener('change', async () => {
      errBox.hidden = true;
      const file = photoInput.files[0];
      if (!file) return;
      if (!/^image\//.test(file.type) && !/\.(jpe?g|png|webp|heic|heif|gif|avif)$/i.test(file.name)) { clearPhoto(); return fail('ePhotoType'); }
      if (file.size > MAX_INPUT) { clearPhoto(); return fail('ePhotoBig'); }
      photoLabel.textContent = t('fPhotoWorking'); submitBtn.disabled = true;
      try {
        const p = await preparePhoto(file);
        if (photo) URL.revokeObjectURL(photo.url);
        photo = { ...p, url: URL.createObjectURL(p.blob) };
        photoImg.src = photo.url; photoPrev.hidden = false; photoLabel.textContent = t('fPhotoChange');
      } catch { clearPhoto(); fail('ePhotoType'); }
      finally { submitBtn.disabled = false; }
    });
    $('[data-rv-photo-remove]').addEventListener('click', clearPhoto);
    const uuid = () => (crypto.randomUUID ? crypto.randomUUID()
      : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)));
    async function uploadPhoto() {
      if (photo.uploaded) return photo.uploaded;   // retry after a failed review: don't upload twice
      const name = `${uuid()}.${photo.ext}`;
      const r = await fetch(`${base}/storage/v1/object/${BUCKET}/${name}`, {
        method: 'POST', body: photo.blob,
        headers: { ...authHeaders(), 'Content-Type': photo.blob.type, 'x-upsert': 'false', 'cache-control': '31536000' },
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw Object.assign(new Error('upload'), { key: /row-level security|policy/i.test(`${j.message || ''} ${j.error || ''}`) ? 'ePhotoLimit' : 'ePhotoUp' });
      }
      photo.uploaded = name;
      return name;
    }

    function openForm() {
      errBox.hidden = true; done.hidden = true; form.hidden = false;
      sheetRv.showModal();
    }
    $$('[data-open-review]').forEach(b => b.addEventListener('click', openForm));
    $('[data-rv-close]').addEventListener('click', () => sheetRv.close());
    sheetRv.addEventListener('click', e => { if (e.target === sheetRv) sheetRv.close(); });

    function fail(key, focusEl) {
      errBox.textContent = t(key); errBox.hidden = false;
      if (focusEl) focusEl.focus();
    }
    form.addEventListener('submit', async e => {
      e.preventDefault();
      errBox.hidden = true;
      const f = form.elements, val = n => (form.querySelector(`input[name="${n}"]:checked`) || {}).value;
      if (f.website.value) { form.reset(); form.hidden = true; done.hidden = false; return; } // spam trap: pretend success
      const data = {
        name: f.name.value.trim().replace(/\s+/g, ' '),
        rating: Number(val('rating')) || 0, food: Number(val('food')) || 0,
        service: Number(val('service')) || null, ambience: Number(val('ambience')) || null,
        visit: f.visit.value || null, dish: f.dish.value || null,
        comment: f.comment.value.trim(), lang,
      };
      if (!data.rating) return fail('eOverall', form.querySelector('input[name="rating"]'));
      if (!data.food) return fail('eFood', form.querySelector('input[name="food"]'));
      if (data.name.length < 2 || data.name.length > 40) return fail('eName', f.name);
      if (data.comment.length < 10) return fail('eComment', f.comment);
      if (LINK_RE.test(data.comment)) return fail('eLink', f.comment);
      if (!f.consent.checked) return fail('eConsent', f.consent);

      submitBtn.disabled = true; submitBtn.textContent = t('fSending');
      try {
        if (photo) {
          try { data.photo = await uploadPhoto(); }
          catch (er) { fail(er.key || 'ePhotoUp'); return; }
        }
        const r = await api('/rest/v1/goianeiro_reviews', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(data) });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          const m = j.message || '';
          fail(/rate_limited/.test(m) ? 'eRate' : /photo_missing/.test(m) ? 'ePhotoUp' : j.code === '23514' ? 'eCheck' : 'eNet');
          return;
        }
        clearPhoto();
        form.reset(); counter.textContent = '0/800'; buildRatePickers();
        form.hidden = true; done.hidden = false;
        sort = 'new'; sortSel.value = 'new';
        reload();
      } catch (err) {
        fail('eNet');
      } finally {
        submitBtn.disabled = false; submitBtn.textContent = t('fSubmit');
      }
    });

    buildRatePickers();
    if (location.hash === '#write') openForm();   // "Write a review" on the home page links here
    langHooks.push(() => { buildRatePickers(); renderSummary(); renderList(); if (photo) photoLabel.textContent = t('fPhotoChange'); });
    // load when the section comes near (saves requests for visitors who never scroll that far)
    new IntersectionObserver((entries, obs) => {
      if (entries[0].isIntersecting) { obs.disconnect(); reload(); }
    }, { rootMargin: '600px 0px' }).observe(rvRoot);
    renderSummary(); renderList();
    }
  }

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
      img.alt = tile.dataset.alt || $('img', tile)?.alt || '';
      stage.appendChild(img);
    }
    $('[data-lb-count]', lb).textContent = `${current + 1} / ${list.length}`;
  }
  tiles.forEach(tile => tile.addEventListener('click', () => {
    list = tiles.filter(t => !t.classList.contains('is-hidden'));
    show(list.indexOf(tile));
    lb.showModal();
  }));

  // menu photos: each category's photos browse together in the same viewer
  $$('[data-zoom-group]').forEach(group => {
    const shots = $$('[data-full]', group);
    shots.forEach(shot => {
      if (shot.hidden) return;
      shot.addEventListener('click', () => { list = shots; show(shots.indexOf(shot)); lb.showModal(); });
    });
  });

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
  if (!map) return;   // reviews.html has no map
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
