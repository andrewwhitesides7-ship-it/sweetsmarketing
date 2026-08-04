/* ============================================================
   SWEETS MARKETING - motion layer
   Lenis (smooth scroll) + GSAP + ScrollTrigger + MotionPath.

   Everything degrades safely: if the CDN scripts do not load,
   .js-ready never gets added and the page renders as plain
   static HTML with all content visible.
   ============================================================ */

(function () {
  'use strict';

  var doc = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';
  var hasST = hasGSAP && typeof window.ScrollTrigger !== 'undefined';

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- forms (always wired, animation or not) ---------- */

  function wireForm(form) {
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = form.querySelector('[data-note]');
      var email = form.querySelector('input[type="email"]');

      if (!email || !email.value || email.value.indexOf('@') === -1) {
        note.textContent = 'That email looks off. Mind checking it?';
        note.classList.remove('is-good');
        if (email) email.focus();
        if (hasGSAP) gsap.fromTo(form, { x: -8 }, { x: 0, duration: .5, ease: 'elastic.out(1,0.35)' });
        return;
      }

      // TODO: POST to your endpoint here. See README.
      // fetch('https://formspree.io/f/YOUR_ID', {
      //   method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form)
      // });

      note.textContent = "Got it. We'll email you today with a start date.";
      note.classList.add('is-good');
      form.querySelectorAll('input, textarea').forEach(function (el) { el.value = ''; });
      if (hasGSAP) gsap.fromTo(note, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: .5 });
    });
  }
  wireForm(document.getElementById('hero-form'));   // optional, may not exist
  wireForm(document.getElementById('cta-form'));    // optional, may not exist

  /* ---------- FAQ accordion height animation ---------- */

  document.querySelectorAll('.faq-list details').forEach(function (d) {
    var body = d.querySelector('.faq-body');
    if (!body || !hasGSAP || reduced) return;
    d.addEventListener('toggle', function () {
      if (d.open) {
        gsap.fromTo(body, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: .45, ease: 'power3.out' });
      }
    });
  });

  /* If motion is off or the libs failed, stop here. Page is fully usable. */
  if (!hasGSAP || !hasST || reduced) {
    var l = document.getElementById('loader');
    if (l) l.remove();
    return;
  }

  doc.classList.add('js-ready');
  gsap.registerPlugin(ScrollTrigger);
  var hasPath = typeof window.MotionPathPlugin !== 'undefined';
  if (hasPath) gsap.registerPlugin(MotionPathPlugin);

  /* ---------- Lenis smooth scroll ---------- */

  var lenis = null;
  var scrollVelocity = 0;

  if (typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.95, touchMultiplier: 1.6 });
    window.__lenis = lenis;
    lenis.on('scroll', function (e) {
      scrollVelocity = e.velocity || 0;
      ScrollTrigger.update();
    });
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    document.querySelectorAll('a[href^="#"]:not([data-checkout])').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var t = document.querySelector(a.getAttribute('href'));
        if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -80 }); }
      });
    });
  }

  /* ---------- split text into masked words ---------- */

  function splitWords(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    var out = [];
    words.forEach(function (w, i) {
      var outer = document.createElement('span');
      outer.className = 'word';
      var inner = document.createElement('span');
      inner.className = 'word-in';
      inner.textContent = w;
      outer.appendChild(inner);
      el.appendChild(outer);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      out.push(inner);
    });
    return out;
  }

  document.querySelectorAll('[data-split]').forEach(function (el) {
    var inners = splitWords(el);
    gsap.to(inners, {
      y: '0%', duration: 1, ease: 'power4.out', stagger: 0.035,
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  /* ---------- generic fades ---------- */

  document.querySelectorAll('[data-fade]').forEach(function (el) {
    if (el.closest('.hero-copy')) return; // owned by the intro timeline
    gsap.to(el, {
      opacity: 1, y: 0, duration: .95, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });

  /* ---------- image wipe reveals ---------- */

  document.querySelectorAll('[data-reveal]').forEach(function (frame) {
    var img = frame.querySelector('img');
    var tl = gsap.timeline({ scrollTrigger: { trigger: frame, start: 'top 82%' } });
    tl.to(frame, { clipPath: 'inset(0 0 0% 0)', duration: 1.15, ease: 'power4.inOut' })
      .to(img, { scale: 1, duration: 1.4, ease: 'power3.out' }, 0.05);

    // slow parallax drift inside the frame
    gsap.to(img, {
      yPercent: -8, ease: 'none',
      scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* ---------- preloader ---------- */

  var loader = document.getElementById('loader');
  var fill = document.getElementById('loader-fill');

  var intro = gsap.timeline({ delay: 0.15 });
  intro
    .to('.loader-cookie', { rotate: 360, scale: 1.12, duration: 1.1, ease: 'power2.inOut' }, 0)
    .to(fill, { width: '100%', duration: 1.1, ease: 'power2.inOut' }, 0)
    .to('.loader-mid', { opacity: 0, y: -18, duration: .4, ease: 'power2.in' }, 1.1)
    .to('.loader-top', { yPercent: -100, duration: .9, ease: 'power4.inOut' }, 1.25)
    .to('.loader-bottom', { yPercent: 100, duration: .9, ease: 'power4.inOut' }, 1.25)
    .add(function () { if (loader) loader.remove(); })
    // hero entrance
    .to('.line-in', { y: '0%', duration: 1.1, ease: 'power4.out', stagger: .09 }, 1.55)
    .to('.hero-copy [data-fade]', { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .1 }, 1.8)
    .to('.ticket', { opacity: 1, y: 0, rotate: -2.5, duration: 1, ease: 'back.out(1.5)' }, 2.1)
    .fromTo('.float',
      { opacity: 0, scale: .6, y: 60 },
      { opacity: 1, scale: 1, y: 0, duration: 1.4, ease: 'back.out(1.4)', stagger: .08 }, 1.7);

  /* ---------- floating cutouts: idle + mouse + scroll ---------- */

  var floats = gsap.utils.toArray('.float');
  floats.forEach(function (el, i) {
    var spin = parseFloat(el.dataset.spin || 8);
    gsap.to(el, {
      y: '+=26', rotate: spin, duration: 4 + i * 0.6,
      ease: 'sine.inOut', repeat: -1, yoyo: true, delay: i * 0.25
    });
    gsap.to(el, {
      yPercent: -40 - i * 12, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
    });
  });

  var drifts = gsap.utils.toArray('.drift');
  drifts.forEach(function (el) {
    gsap.to(el, {
      yPercent: -55, rotate: 18, ease: 'none',
      scrollTrigger: { trigger: el.closest('section'), start: 'top bottom', end: 'bottom top', scrub: 1 }
    });
  });

  /* mouse parallax across everything with data-depth */
  var parallaxEls = document.querySelectorAll('[data-depth]');
  var mx = 0, my = 0, cx = 0, cy = 0;

  window.addEventListener('mousemove', function (e) {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  gsap.ticker.add(function () {
    cx += (mx - cx) * 0.06;
    cy += (my - cy) * 0.06;
    parallaxEls.forEach(function (el) {
      var d = parseFloat(el.dataset.depth || 0.1) * 120;
      gsap.set(el, { x: -cx * d });
    });
  });

  /* ---------- sprinkle particles ---------- */

  var canvas = document.getElementById('sprinkles');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var parts = [];
    var colors = ['#FF3D8B', '#FFC53D', '#FFF3E6', '#FF77AE'];

    function sizeCanvas() {
      var r = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return r;
    }
    var rect = sizeCanvas();

    for (var i = 0; i < 46; i++) {
      parts.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        w: 2 + Math.random() * 3,
        h: 6 + Math.random() * 9,
        vy: 0.18 + Math.random() * 0.5,
        vx: -0.16 + Math.random() * 0.32,
        rot: Math.random() * Math.PI,
        vr: (-0.5 + Math.random()) * 0.018,
        c: colors[(Math.random() * colors.length) | 0],
        a: 0.25 + Math.random() * 0.5
      });
    }

    function drawSprinkles() {
      ctx.clearRect(0, 0, rect.width, rect.height);
      parts.forEach(function (p) {
        p.y += p.vy; p.x += p.vx; p.rot += p.vr;
        if (p.y > rect.height + 20) { p.y = -20; p.x = Math.random() * rect.width; }
        if (p.x < -20) p.x = rect.width + 20;
        if (p.x > rect.width + 20) p.x = -20;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.a;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(-p.w / 2, -p.h / 2, p.w, p.h, p.w / 2);
        else ctx.rect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.fill();
        ctx.restore();
      });
    }
    gsap.ticker.add(drawSprinkles);
    window.addEventListener('resize', function () { rect = sizeCanvas(); });
  }

  /* ---------- marquee, speed reacts to scroll velocity ---------- */

  var track = document.getElementById('marquee-track');
  if (track) {
    var half = track.scrollWidth / 2;
    var marqueeTween = gsap.to(track, {
      x: -half, duration: 22, ease: 'none', repeat: -1,
      modifiers: { x: function (x) { return (parseFloat(x) % half) + 'px'; } }
    });
    gsap.ticker.add(function () {
      var boost = 1 + Math.min(Math.abs(scrollVelocity) * 0.32, 5);
      marqueeTween.timeScale(gsap.utils.interpolate(marqueeTween.timeScale(), boost, 0.08));
    });
  }

  /* ---------- counters ---------- */

  gsap.utils.toArray('[data-count]').forEach(function (el) {
    var target = parseFloat(el.dataset.count);
    var pre = el.dataset.prefix || '';
    var suf = el.dataset.suffix || '';
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 1.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 92%' },
      onUpdate: function () { el.textContent = pre + Math.round(obj.v) + suf; }
    });
  });

  /* ---------- journey: cookie travels the dotted path ---------- */

  var traveler = document.getElementById('traveler');
  var path = document.getElementById('journey');

  if (traveler && path) {
    gsap.set(traveler, { opacity: 1 });
    var journeyST = {
      trigger: '.how',
      start: 'top 70%',
      end: 'bottom 75%',
      scrub: 1
    };

    if (hasPath) {
      gsap.to(traveler, {
        motionPath: { path: path, align: path, alignOrigin: [0.5, 0.5], autoRotate: false },
        rotate: 720,
        ease: 'none',
        scrollTrigger: journeyST
      });
    } else {
      gsap.fromTo(traveler,
        { xPercent: 0, left: '2%' },
        { left: '96%', rotate: 720, ease: 'none', scrollTrigger: journeyST });
    }

  }

  /* ---------- staggered cards ---------- */

  gsap.utils.toArray('.steps').forEach(function (group) {
    gsap.to(group.querySelectorAll('.step'), {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .14,
      scrollTrigger: { trigger: group, start: 'top 82%' }
    });
  });

  gsap.utils.toArray('.plans').forEach(function (group) {
    gsap.to(group.querySelectorAll('.plan'), {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .12,
      scrollTrigger: { trigger: group, start: 'top 82%' }
    });
  });

  gsap.utils.toArray('.box-list').forEach(function (list) {
    gsap.to(list.querySelectorAll('li'), {
      opacity: 1, x: 0, duration: .8, ease: 'power3.out', stagger: .1,
      scrollTrigger: { trigger: list, start: 'top 86%' }
    });
  });

  /* featured plan floats up as you scroll past */
  gsap.to('.plan-lead', {
    y: -34, ease: 'none',
    scrollTrigger: { trigger: '.plans', start: 'top bottom', end: 'bottom top', scrub: 1 }
  });

  /* ---------- CTA cake: scroll-scrubbed spin ---------- */

  var ctaCake = document.getElementById('cta-cake');
  if (ctaCake) {
    gsap.fromTo(ctaCake,
      { rotate: -18, y: 90, scale: .82 },
      {
        rotate: 14, y: -60, scale: 1, ease: 'none',
        scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
  }

  /* ---------- footer wordmark parallax ---------- */

  var footGiant = document.getElementById('foot-giant');
  if (footGiant) {
    gsap.fromTo(footGiant,
      { y: 80, scale: .92 },
      {
        y: 0, scale: 1, ease: 'none',
        scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: 1 }
      });
  }

  /* ---------- scroll progress bar ---------- */

  var progress = document.getElementById('progress');
  if (progress) {
    gsap.to(progress, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: .3 }
    });
  }

  /* ---------- nav hide on scroll down ---------- */

  var nav = document.getElementById('nav');
  if (nav) {
    ScrollTrigger.create({
      start: 'top -120',
      end: 99999,
      onUpdate: function (self) {
        if (self.direction === 1 && self.scroll() > 400) nav.classList.add('is-hidden');
        else nav.classList.remove('is-hidden');
      }
    });
  }

  /* ---------- 3D tilt cards ---------- */

  document.querySelectorAll('[data-tilt]').forEach(function (card) {
    var qx = gsap.quickTo(card, 'rotationY', { duration: .6, ease: 'power3' });
    var qy = gsap.quickTo(card, 'rotationX', { duration: .6, ease: 'power3' });
    var qz = gsap.quickTo(card, 'z', { duration: .6, ease: 'power3' });

    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', (px * 100) + '%');
      card.style.setProperty('--my', (py * 100) + '%');
      qx((px - .5) * 13);
      qy((.5 - py) * 13);
      qz(40);
    });
    card.addEventListener('mouseleave', function () { qx(0); qy(0); qz(0); });
    gsap.set(card, { transformPerspective: 900 });
  });

  /* ---------- magnetic buttons ---------- */

  document.querySelectorAll('[data-magnet]').forEach(function (el) {
    var qx = gsap.quickTo(el, 'x', { duration: .5, ease: 'power3' });
    var qy = gsap.quickTo(el, 'y', { duration: .5, ease: 'power3' });
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      qx((e.clientX - (r.left + r.width / 2)) * 0.32);
      qy((e.clientY - (r.top + r.height / 2)) * 0.42);
    });
    el.addEventListener('mouseleave', function () { qx(0); qy(0); });
  });

  /* ---------- custom cursor ---------- */

  var cur = document.getElementById('cursor');
  var dot = document.getElementById('cursor-dot');

  if (cur && dot && window.matchMedia('(hover:hover)').matches) {
    var cxq = gsap.quickTo(cur, 'x', { duration: .5, ease: 'power3' });
    var cyq = gsap.quickTo(cur, 'y', { duration: .5, ease: 'power3' });
    var dxq = gsap.quickTo(dot, 'x', { duration: .12, ease: 'power3' });
    var dyq = gsap.quickTo(dot, 'y', { duration: .12, ease: 'power3' });

    window.addEventListener('mousemove', function (e) {
      cxq(e.clientX); cyq(e.clientY); dxq(e.clientX); dyq(e.clientY);
      gsap.to([cur, dot], { opacity: 1, duration: .3, overwrite: 'auto' });
    });
    document.addEventListener('mouseleave', function () {
      gsap.to([cur, dot], { opacity: 0, duration: .3 });
    });
    document.querySelectorAll('a, button, summary, input, textarea').forEach(function (el) {
      el.addEventListener('mouseenter', function () { gsap.to(cur, { scale: 2.1, duration: .35 }); });
      el.addEventListener('mouseleave', function () { gsap.to(cur, { scale: 1, duration: .35 }); });
    });
  }

  /* ---------- keep everything measured correctly ---------- */

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
