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

  // Testimonials carousel: slides glide sideways, auto-advance, pause on hover/focus,
  // next arrow, keyboard arrows and swipe
  document.querySelectorAll('.t-carousel').forEach(car => {
    const track = car.querySelector('.t-track');
    const slides = [...car.querySelectorAll('.t-slide')];
    const delay = 8000;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let i = 0, timer = null;
    car.style.setProperty('--t-delay', delay + 'ms');
    if (reduce) track.style.transition = 'none';
    const show = n => {
      i = (n + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-100 * i) + '%)';
      slides.forEach((s, k) => {
        s.classList.toggle('is-active', k === i);
        if (k === i) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
      });
      restart();
    };
    const stop = () => { clearTimeout(timer); timer = null; car.classList.remove('playing'); };
    const restart = () => {
      stop();
      if (reduce || car.dataset.paused) return;
      void car.offsetWidth; // restart the progress animation
      car.classList.add('playing');
      timer = setTimeout(() => show(i + 1), delay);
    };
    car.querySelector('.t-next').addEventListener('click', () => show(i + 1));
    const pause = () => { car.dataset.paused = '1'; stop(); };
    const resume = () => { delete car.dataset.paused; restart(); };
    car.addEventListener('mouseenter', pause);
    car.addEventListener('mouseleave', resume);
    car.addEventListener('focusin', pause);
    car.addEventListener('focusout', e => { if (!car.contains(e.relatedTarget)) resume(); });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : restart());
    car.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') show(i + 1);
      if (e.key === 'ArrowLeft') show(i - 1);
    });
    // swipe on touch screens
    let x0 = null;
    car.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    car.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) show(dx < 0 ? i + 1 : i - 1);
    }, { passive: true });
    show(0);
  });

  // Netlify forms: submit in the background and thank the visitor on the page
  document.querySelectorAll('form[data-netlify="true"]').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      const label = btn.textContent;
      const old = form.querySelector('.form-error'); if (old) old.remove();
      btn.disabled = true; btn.textContent = 'Sending…';
      try {
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(new FormData(form)).toString()
        });
        if (!res.ok) throw new Error(res.status);
        const done = document.createElement('div');
        done.className = 'form-thanks';
        done.setAttribute('role', 'status');
        done.tabIndex = -1;
        done.innerHTML = '<p class="form-thanks-title">Thank you, your message is on its way.</p>' +
          '<p>I\'ll read it and get back to you soon.</p>';
        form.replaceWith(done);
        done.focus();
      } catch (err) {
        btn.disabled = false; btn.textContent = label;
        const msg = document.createElement('p');
        msg.className = 'form-error'; msg.setAttribute('role', 'alert');
        msg.textContent = 'Something went wrong sending your message. Please try again in a moment.';
        btn.after(msg);
      }
    });
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
