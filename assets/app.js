/* صفحة التسليم — سلوك خفيف: نسخ الأوامر، وتظليل القسم الحالي في الفهرس. لا مكتبات خارجية. */
(function () {
  'use strict';

  // ---- نسخ الأوامر إلى الحافظة ----
  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () {
        if (!legacyCopy(text)) { throw new Error('copy failed'); }
      });
    }
    return legacyCopy(text) ? Promise.resolve() : Promise.reject(new Error('copy failed'));
  }

  document.querySelectorAll('.copy').forEach(function (btn) {
    var original = btn.innerHTML;
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy') || '';
      copyText(text).then(function () {
        btn.classList.add('done');
        btn.textContent = 'نُسخ';
      }).catch(function () {
        btn.textContent = 'انسخه يدويًّا';
      }).then(function () {
        setTimeout(function () { btn.classList.remove('done'); btn.innerHTML = original; }, 1600);
      });
    });
  });

  // ---- القسم الحالي في الفهرس ----
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var current = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { current = en.target.id; }
      });
      if (!current) { return; }
      links.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
      });
      var active = document.querySelector('.nav a.active');
      var nav = active && active.parentNode;
      if (active && nav && nav.scrollWidth > nav.clientWidth + 4 && active.scrollIntoView) {
        active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      }
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach(function (s) { io.observe(s); });
  }
})();
