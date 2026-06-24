/** Header, tema y menú mobile — compartido landing + blog */
(function () {
  const THEME_KEY = 'preciosya-theme';

  function getStoredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    localStorage.setItem(THEME_KEY, theme);
    const meta = document.getElementById('themeColorMeta');
    if (meta) meta.content = theme === 'dark' ? '#12100e' : '#f8f7f4';
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.setAttribute(
        'aria-label',
        theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'
      );
    }
  }

  applyTheme(getStoredTheme());

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  const header = document.getElementById('header');
  if (header) {
    window.addEventListener(
      'scroll',
      () => header.classList.toggle('scrolled', window.scrollY > 20),
      { passive: true }
    );
  }

  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = mobileMenu.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', String(isActive));
    });

    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        mobileMenu.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const loginUrl = window.PRECIOSYA_APP_LOGIN || 'https://preciosya.vercel.app/login?from=landing';
  document.querySelectorAll('[data-login-cta]').forEach((el) => {
    el.href = loginUrl;
  });

  const bar = document.getElementById('mobileCtaBar');
  if (bar) {
    window.addEventListener(
      'scroll',
      () => bar.classList.toggle('visible', window.scrollY > 480),
      { passive: true }
    );
  }
})();
