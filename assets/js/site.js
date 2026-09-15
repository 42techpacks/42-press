(() => {
  document.documentElement.classList.add('js');
  const reveals = document.querySelectorAll('.reveal, article > h2, article > h3, article > p, article > ul, article > ol, article > table, article > blockquote, article > .visual');
  reveals.forEach(el => el.classList.add('will-reveal'));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(el => observer.observe(el));
  } else reveals.forEach(el => el.classList.add('is-visible'));

  const progress = document.querySelector('.reading-progress span');
  if (document.querySelector('article') && progress) {
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    };
    addEventListener('scroll', update, { passive: true });
    update();
  }

  document.querySelectorAll('.skill-disclosure').forEach(skill => {
    const detail = skill.querySelector('.skill-detail');
    skill.addEventListener('toggle', () => {
      if (!detail || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      detail.animate(skill.open ? [
        { opacity: 0, transform: 'translateY(-6px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ] : [
        { opacity: 1 }, { opacity: 0 }
      ], { duration: 240, easing: 'cubic-bezier(.2,.8,.2,1)' });
    });
  });

  if ('serviceWorker' in navigator) {
    addEventListener('load', () => navigator.serviceWorker.register('/42-press/service-worker.js').catch(() => {}));
  }

  document.querySelectorAll('.bar-fill').forEach(bar => {
    const width = bar.style.getPropertyValue('--w');
    bar.style.setProperty('--target', width);
    bar.style.setProperty('--w', '0%');
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { bar.style.setProperty('--w', bar.style.getPropertyValue('--target')); io.disconnect(); }
    }, { threshold: .4 });
    io.observe(bar);
  });
})();
