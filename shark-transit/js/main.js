/* ШАРК ТРАНЗИТ — интерактив главной страницы */
(function () {
  'use strict';

  /* ---------- Прелоадер с процентами ---------- */
  var preloader = document.getElementById('preloader');
  var preCount = document.getElementById('preCount');
  var preBar = document.getElementById('preBar');
  var progress = 0;
  var loaded = false;

  var preTimer = setInterval(function () {
    // до события load тянемся к 90%, после — добегаем до 100
    var target = loaded ? 100 : 90;
    progress = Math.min(progress + Math.max(1, (target - progress) * 0.12), target);
    var val = Math.round(progress);
    if (preCount) preCount.textContent = val + '%';
    if (preBar) preBar.style.width = val + '%';
    if (val >= 100) {
      clearInterval(preTimer);
      setTimeout(function () { preloader.classList.add('is-done'); }, 350);
    }
  }, 30);

  window.addEventListener('load', function () { loaded = true; });
  // страховка: убрать прелоадер, даже если load задержался
  setTimeout(function () {
    loaded = true;
    setTimeout(function () { preloader.classList.add('is-done'); }, 1200);
  }, 3500);

  /* ---------- Шапка: фон при скролле + автоскрытие вниз ---------- */
  var header = document.getElementById('header');
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    header.classList.toggle('is-hidden', y > 600 && y > lastY);
    lastY = y;

    var doc = document.documentElement;
    var p = y / (doc.scrollHeight - doc.clientHeight || 1);
    scrollProgress.style.width = (p * 100) + '%';
  }
  var scrollProgress = document.getElementById('scrollProgress');
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  burger.addEventListener('click', function () {
    burger.classList.toggle('is-open');
    nav.classList.toggle('is-open');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      burger.classList.remove('is-open');
      nav.classList.remove('is-open');
    }
  });

  /* ---------- Появление при скролле ---------- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ---------- Счетчики ---------- */
  function animateCount(el) {
    var to = parseInt(el.dataset.to, 10);
    if (!to) { el.textContent = el.dataset.to; return; }
    var duration = 1400;
    var start = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var stats = document.getElementById('stats');
  if (stats) {
    var statsObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        stats.querySelectorAll('.count').forEach(animateCount);
        statsObserver.disconnect();
      }
    }, { threshold: 0.4 });
    statsObserver.observe(stats);
  }

  /* ---------- Прогресс линии этапов ---------- */
  var stepsProgress = document.getElementById('stepsProgress');
  if (stepsProgress) {
    var stepsObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        stepsProgress.style.width = '100%';
        stepsObserver.disconnect();
      }
    }, { threshold: 0.3 });
    stepsObserver.observe(stepsProgress.parentElement);
  }

  /* ---------- Бегущие строки: дублируем дорожки ---------- */
  document.querySelectorAll('.marquee__track').forEach(function (track) {
    track.innerHTML += track.innerHTML;
  });

  /* ---------- Калькулятор (демо-расчет для макета) ---------- */
  var calcForm = document.getElementById('calcForm');
  var calcDate = document.getElementById('calcDate');
  if (calcDate) {
    calcDate.textContent = new Date().toLocaleDateString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }
  if (calcForm) {
    calcForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var from = document.getElementById('calcFrom').value.trim();
      var to = document.getElementById('calcTo').value.trim();
      if (!from || !to) {
        (!from ? document.getElementById('calcFrom') : document.getElementById('calcTo')).focus();
        return;
      }
      var weight = parseInt(document.getElementById('calcWeight').value, 10) || 2000;
      var body = calcForm.querySelector('input[name="body"]:checked').value;

      // демо-формула: база + вес + тип кузова
      var base = 40000;
      var price = base + Math.round(weight * 2.4 / 100) * 100;
      if (body === 'ref') price = Math.round(price * 1.45 / 1000) * 1000;
      if (body === 'other') price = Math.round(price * 1.25 / 1000) * 1000;

      document.getElementById('calcRoute').textContent = from + ' → ' + to;
      document.getElementById('calcPrice').textContent =
        'от ' + price.toLocaleString('ru-RU') + ' ₽';
      document.getElementById('calcResult').hidden = false;
    });
  }

  /* ---------- Формы заявок (демо: показываем подтверждение) ---------- */
  ['ctaForm', 'routeForm'].forEach(function (id) {
    var form = document.getElementById(id);
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var btn = form.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.textContent = 'Заявка отправлена ✓';
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = original;
        btn.disabled = false;
        form.reset();
      }, 3500);
    });
  });

  /* ---------- Легкий параллакс фуры в hero ---------- */
  var truck = document.getElementById('heroTruck');
  if (truck && matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y < 900) truck.style.translate = (y * 0.12) + 'px 0';
    }, { passive: true });
  }
})();
