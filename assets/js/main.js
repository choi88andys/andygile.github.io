/* ==========================================================================
   Main JS — Theme, Nav, Animations, Component Loading
   ========================================================================== */

(function () {
  'use strict';

  /* --- Theme System --- */
  const THEME_KEY = 'andygile-theme';

  function getPreferredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  // Apply theme immediately to prevent flash
  setTheme(getPreferredTheme());

  // Listen for OS theme changes
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_KEY)) {
      setTheme(e.matches ? 'light' : 'dark');
    }
  });

  /* --- DOM Ready --- */
  document.addEventListener('DOMContentLoaded', async () => {
    await loadComponents();
    initThemeToggle();
    initNavScroll();
    initMobileNav();
    initScrollAnimations();
    initSmoothScroll();
    setActiveNavLink();
  });

  /* --- Component Loading ---
     Loads nav.html and footer.html from same-origin /components/ directory.
     These are trusted, developer-authored HTML fragments — not user input. */
  async function loadComponents() {
    const navEl = document.getElementById('nav-placeholder');
    const footerEl = document.getElementById('footer-placeholder');
    const basePath = document.documentElement.getAttribute('data-base') || '.';

    const loads = [];

    if (navEl) {
      loads.push(
        fetch(basePath + '/components/nav.html')
          .then(function (r) { return r.text(); })
          .then(function (html) { navEl.innerHTML = html; }) // same-origin trusted HTML
          .catch(function () {})
      );
    }

    if (footerEl) {
      loads.push(
        fetch(basePath + '/components/footer.html')
          .then(function (r) { return r.text(); })
          .then(function (html) { footerEl.innerHTML = html; }) // same-origin trusted HTML
          .catch(function () {})
      );
    }

    await Promise.all(loads);

    // Fix relative links in nav/footer for subdirectory pages
    if (basePath !== '.') {
      document.querySelectorAll('[data-nav-link]').forEach(function (link) {
        var href = link.getAttribute('href');
        if (href && href.startsWith('/')) return;
        if (href && !href.startsWith('http') && !href.startsWith('#')) {
          link.setAttribute('href', basePath + '/' + href);
        }
      });
    }
  }

  /* --- Theme Toggle --- */
  function initThemeToggle() {
    document.addEventListener('click', function (e) {
      var toggle = e.target.closest('.theme-toggle');
      if (!toggle) return;
      var current = document.documentElement.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  /* --- Nav Scroll Effect --- */
  function initNavScroll() {
    var nav = document.querySelector('.nav');
    if (!nav) return;

    function onScroll() {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --- Mobile Nav --- */
  function initMobileNav() {
    document.addEventListener('click', function (e) {
      var hamburger = e.target.closest('.nav__hamburger');
      if (hamburger) {
        hamburger.classList.toggle('active');
        var links = document.querySelector('.nav__links');
        if (links) links.classList.toggle('open');
        document.body.style.overflow = hamburger.classList.contains('active') ? 'hidden' : '';
        return;
      }

      if (e.target.closest('.nav__link')) {
        var h = document.querySelector('.nav__hamburger');
        var l = document.querySelector('.nav__links');
        if (h) h.classList.remove('active');
        if (l) l.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* --- Scroll Animations --- */
  function initScrollAnimations() {
    var elements = document.querySelectorAll('.fade-in');
    if (!elements.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* --- Smooth Scroll for Anchor Links --- */
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;

      var targetId = link.getAttribute('href').slice(1);
      var target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      var offset = 64;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  }

  /* --- Active Nav Link --- */
  function setActiveNavLink() {
    var path = window.location.pathname;
    document.querySelectorAll('.nav__link').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;
      var linkPath = new URL(href, window.location.origin).pathname;
      if (linkPath === path || (path.startsWith(linkPath) && linkPath !== '/')) {
        link.classList.add('active');
      }
    });
  }
})();
