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
