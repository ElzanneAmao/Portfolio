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
