/* ШАРК ТРАНЗИТ — интерактив главной страницы */
(function () {
  'use strict';

  /* ---------- Прелоадер ---------- */
  var preloader = document.getElementById('preloader');
  window.addEventListener('load', function () {
    setTimeout(function () {
      preloader.classList.add('is-done');
      document.body.style.overflow = '';
    }, 1500);
  });
  // страховка: убрать прелоадер, даже если load задержался
  setTimeout(function () { preloader.classList.add('is-done'); }, 4000);

  /* ---------- Шапка при скролле ---------- */
  var header = document.getElementById('header');
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }
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
    if (e.target.tagName === 'A') {
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
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ---------- Счетчики в блоке статистики ---------- */
  function animateCount(el) {
    var to = parseInt(el.dataset.to, 10);
    if (!to) { el.textContent = el.dataset.to; return; }
    var duration = 1400;
    var start = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / duration, 1);
      // ease-out
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

  /* ---------- Прогресс линии шагов ---------- */
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

  /* ---------- Дублируем дорожку марки для бесшовной ленты ---------- */
  var track = document.getElementById('marqueeTrack');
  if (track) track.innerHTML += track.innerHTML;

  /* ---------- Калькулятор (демо-расчет для макета) ---------- */
  var calcForm = document.getElementById('calcForm');
  var calcDate = document.getElementById('calcDate');
  if (calcDate) {
    calcDate.textContent = new Date().toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric'
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
