// site.js: shared behaviour for every page (scroll reveal and mobile menu)
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  // Reveal on scroll (progressive enhancement)
  const els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    els.forEach(el => io.observe(el));
  } else {
    els.forEach(el => el.classList.add('in'));
  }

  // Count-up numbers: animate from 0 when their card scrolls into view
  const counters = document.querySelectorAll('[data-count]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) document.documentElement.classList.add('no-motion');
  if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
    const run = el => {
      const end = +el.dataset.count, t0 = performance.now(), dur = 1600;
      const tick = t => {
        const k = Math.min(1, (t - t0) / dur), eased = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(end * eased);
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const co = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { run(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(el => { el.textContent = '0'; co.observe(el); });
  }

  // Testimonials carousel: auto-advances, pauses on hover/focus, arrows to navigate
  document.querySelectorAll('.t-carousel').forEach(car => {
    const slides = [...car.querySelectorAll('.t-slide')];
    const now = car.querySelector('.t-now');
    const bar = car.querySelector('.t-bar i');
    const delay = 8000;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let i = 0, timer = null;
    car.style.setProperty('--t-delay', delay + 'ms');
    const show = n => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => {
        s.classList.toggle('is-active', k === i);
        if (k === i) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
      });
      if (now) now.textContent = i + 1;
      restart();
    };
    const stop = () => { clearTimeout(timer); timer = null; car.classList.remove('playing'); };
    const restart = () => {
      stop();
      if (reduce || car.dataset.paused) return;
      void bar.offsetWidth; // restart the progress bar animation
      car.classList.add('playing');
      timer = setTimeout(() => show(i + 1), delay);
    };
    car.querySelector('.t-prev').addEventListener('click', () => show(i - 1));
    car.querySelector('.t-next').addEventListener('click', () => show(i + 1));
    const pause = () => { car.dataset.paused = '1'; stop(); };
    const resume = () => { delete car.dataset.paused; restart(); };
    car.addEventListener('mouseenter', pause);
    car.addEventListener('mouseleave', resume);
    car.addEventListener('focusin', pause);
    car.addEventListener('focusout', e => { if (!car.contains(e.relatedTarget)) resume(); });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : restart());
    // swipe on touch screens
    let x0 = null;
    car.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    car.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) show(dx < 0 ? i + 1 : i - 1);
    }, { passive: true });
    restart();
  });

  // Mobile menu
  const btn = document.querySelector('.menu-btn');
  const links = document.getElementById('site-links');
  if (!btn || !links) return;
  const close = () => { links.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.textContent = 'Menu'; };
  btn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Close' : 'Menu';
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
});
