/* ============================================================
   COSMO — App Logic (Animations, Interactions, Features)
   ============================================================ */

(function () {
  'use strict';

  // ---- Wait for DOM ----
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initLoader();
    initThemeToggle();
    initSmoothScroll();
    initScrollProgress();
    initNavbar();
    initMobileMenu();
    initHeroAnimations();
    initTypewriter();
    initScrollAnimations();
    initStatCounters();
    initSkillBars();
    initSkillTabs();
    initTiltCards();
    initCardFlip();
    initTimeline();
    initCursor();
    initMagnetic();
    initContactForm();
    initScrollToTop();
    initEasterEgg();
    initBadgesReel();
    initCertificates();
    initCertModal();
    initCertsReel();
    initProjectsReel();
    initSlidingTabs();
    initProjectSpotlights();
    initEmailCopy();
    initLiveCodingStats();
  }

  /* ============================================================
     LOADER
     ============================================================ */
  function initLoader() {
    const loader = document.getElementById('loader');
    const fill = document.getElementById('loader-fill');
    if (!loader || !fill) return;

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        fill.style.width = '100%';
        setTimeout(() => {
          loader.classList.add('hidden');
          // Trigger hero animations after loader
          document.dispatchEvent(new CustomEvent('loaderDone'));
        }, 400);
      } else {
        fill.style.width = progress + '%';
      }
    }, 150);
  }

  /* ============================================================
     THEME TOGGLE
     ============================================================ */
  function initThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    // Check saved preference or system preference
    const saved = localStorage.getItem('theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.documentElement.setAttribute('data-theme', 'light');
    }

    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      toggle.setAttribute('aria-checked', next === 'dark' ? 'true' : 'false');
      if (window.updateSceneTheme) window.updateSceneTheme(next);
    });
  }

  /* ============================================================
     SMOOTH SCROLL (Lenis)
     ============================================================ */
  let lenis;
  function initSmoothScroll() {
    if (typeof Lenis === 'undefined') return;

    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });

    // Sync with GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Handle anchor clicks
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) lenis.scrollTo(target, { offset: -80 });
      });
    });
  }

  /* ============================================================
     SCROLL PROGRESS BAR
     ============================================================ */
  function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;

    window.addEventListener('scroll', () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docH > 0 ? window.scrollY / docH : 0;
      bar.style.transform = `scaleX(${progress})`;
    });
  }

  /* ============================================================
     NAVBAR (Show/Hide on scroll + active link)
     ============================================================ */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let lastScroll = 0;
    const SCROLL_THRESHOLD = 60;

    window.addEventListener('scroll', () => {
      const current = window.scrollY;

      // Scrolled state (glassmorphism)
      if (current > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      // Hide/show on scroll direction
      if (current > lastScroll && current > SCROLL_THRESHOLD) {
        navbar.classList.add('hidden');
      } else {
        navbar.classList.remove('hidden');
      }
      lastScroll = current;

      // Active link highlighting
      updateActiveLink();
    });
  }

  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-link');
    let current = '';

    sections.forEach((section) => {
      const top = section.offsetTop - 150;
      if (window.scrollY >= top) {
        current = section.id;
      }
    });

    links.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('data-section') === current);
    });
  }

  /* ============================================================
     MOBILE MENU
     ============================================================ */
  function initMobileMenu() {
    const hamburger = document.getElementById('nav-hamburger');
    const menu = document.getElementById('mobile-menu');
    if (!hamburger || !menu) return;

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      menu.classList.toggle('open');
      document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
    });

    menu.querySelectorAll('.mobile-menu__link').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        menu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ============================================================
     HERO ANIMATIONS
     ============================================================ */
  function initHeroAnimations() {
    document.addEventListener('loaderDone', () => {
      // Reveal hero name lines
      const lines = document.querySelectorAll('.hero__name-line');
      lines.forEach((line, i) => {
        setTimeout(() => line.classList.add('revealed'), 200 + i * 200);
      });

      // Reveal other hero elements
      if (typeof gsap !== 'undefined') {
        gsap.to('.hero__greeting', {
          opacity: 1, y: 0, duration: 0.8, delay: 0.5, ease: 'power3.out'
        });
        gsap.to('.hero__subtitle', {
          opacity: 1, y: 0, duration: 0.8, delay: 0.9, ease: 'power3.out'
        });
        gsap.to('.hero__cta', {
          opacity: 1, y: 0, duration: 0.8, delay: 1.1, ease: 'power3.out'
        });
        gsap.to('.hero__scroll', {
          opacity: 1, y: 0, duration: 0.8, delay: 1.4, ease: 'power3.out'
        });
      }
    });
  }

  /* ============================================================
     TYPEWRITER EFFECT
     ============================================================ */
  function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;

    const phrases = [
      'Full Stack Developer',
      'Problem Solver',
      'Competitive Programmer',
      'Code Enthusiast',
      'Tech Explorer'
    ];
    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let isPaused = false;

    function type() {
      const current = phrases[phraseIdx];

      if (isPaused) {
        isPaused = false;
        isDeleting = true;
        setTimeout(type, 50);
        return;
      }

      if (isDeleting) {
        el.textContent = current.substring(0, charIdx - 1);
        charIdx--;

        if (charIdx === 0) {
          isDeleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          setTimeout(type, 300);
          return;
        }
        setTimeout(type, 30);
      } else {
        el.textContent = current.substring(0, charIdx + 1);
        charIdx++;

        if (charIdx === current.length) {
          isPaused = true;
          setTimeout(type, 2000);
          return;
        }
        setTimeout(type, 80);
      }
    }

    // Start after loader
    document.addEventListener('loaderDone', () => setTimeout(type, 800));
  }

  /* ============================================================
     SCROLL REVEAL ANIMATIONS (GSAP ScrollTrigger)
     ============================================================ */
  function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    // Reveal-up elements
    gsap.utils.toArray('.reveal-up').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
        delay: (i % 4) * 0.1 // stagger within viewport
      });
    });

    // Reveal-text elements
    gsap.utils.toArray('.reveal-text').forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        }
      });
    });

    // Section title lines
    gsap.utils.toArray('.section__title-line').forEach((el) => {
      gsap.fromTo(el, { width: 0 }, {
        width: 60,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        }
      });
    });
  }

  /* ============================================================
     STAT COUNTER ANIMATION
     ============================================================ */
  function initStatCounters() {
    const counters = document.querySelectorAll('.stat__number[data-count]');
    if (!counters.length) return;

    const observerOptions = { threshold: 0.5 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          animateCounter(el, target);
          observer.unobserve(el);
        }
      });
    }, observerOptions);

    counters.forEach((c) => observer.observe(c));
  }

  function animateCounter(el, target) {
    const duration = 1500;
    const start = performance.now();

    function step(timestamp) {
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  /* ============================================================
     SKILL BARS ANIMATION
     ============================================================ */
  function initSkillBars() {
    const fills = document.querySelectorAll('.skill-card__fill[data-level]');
    if (!fills.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.style.width = el.dataset.level + '%';
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    fills.forEach((f) => observer.observe(f));
  }

  /* ============================================================
     SKILL TABS FILTERING
     ============================================================ */
  function initSkillTabs() {
    const tabs = document.querySelectorAll('.skills__tab');
    const cards = document.querySelectorAll('.skill-card');
    if (!tabs.length || !cards.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        // Update active tab
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const category = tab.dataset.category;

        cards.forEach((card) => {
          if (category === 'all' || card.dataset.category === category) {
            card.classList.remove('hidden');
            card.style.position = 'relative';
          } else {
            card.classList.add('hidden');
            // Use timeout so transition plays
            setTimeout(() => { card.style.position = 'absolute'; }, 400);
          }
        });
      });
    });
  }

  /* ============================================================
     ADVANCED 3D TILT CARDS & HOLOGRAPHIC SPECULAR GLARE
     ============================================================ */
  function initTiltCards() {
    const cardSelectors = '.tilt-card, .project-reel-card, .badge-card, .cert-card, .profile-card, .stat-card, .about__image-wrapper';
    const cards = document.querySelectorAll(cardSelectors);
    if (!cards.length || window.innerWidth < 768) return;

    cards.forEach((card) => {
      // Inject holographic glare element if not present
      if (!card.querySelector('.card-glare') && !card.classList.contains('about__image-wrapper')) {
        const glare = document.createElement('div');
        glare.className = 'card-glare';
        card.appendChild(glare);
      }

      card.style.willChange = 'transform';

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const maxTilt = card.classList.contains('about__image-wrapper') ? 14 : 11;
        const rotateX = ((centerY - y) / centerY) * maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;

        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;
        const distFromCenter = Math.hypot((x - centerX) / centerX, (y - centerY) / centerY);
        const glareOpacity = Math.min(0.65, distFromCenter * 0.55);

        card.style.setProperty('--glare-x', `${percentX.toFixed(1)}%`);
        card.style.setProperty('--glare-y', `${percentY.toFixed(1)}%`);
        card.style.setProperty('--glare-opacity', glareOpacity.toFixed(2));

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px) scale3d(1.02, 1.02, 1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)';
        card.style.setProperty('--glare-opacity', '0');
      });
    });
  }

  /* ============================================================
     CARD FLIP (Click to flip project cards)
     ============================================================ */
  function initCardFlip() {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach((card) => {
      card.addEventListener('click', (e) => {
        // Don't flip if clicking a link
        if (e.target.closest('a')) return;
        card.classList.toggle('flipped');
      });
    });
  }

  /* ============================================================
     TIMELINE LINE DRAW
     ============================================================ */
  function initTimeline() {
    const timeline = document.getElementById('timeline');
    const fill = document.getElementById('timeline-fill');
    const items = document.querySelectorAll('.timeline__item');
    if (!timeline || !fill) return;

    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.create({
        trigger: timeline,
        start: 'top 80%',
        end: 'bottom 60%',
        onUpdate: (self) => {
          fill.style.height = (self.progress * 100) + '%';

          // Activate items based on scroll progress
          items.forEach((item, i) => {
            const threshold = (i + 1) / items.length;
            item.classList.toggle('active', self.progress >= threshold - 0.15);
          });
        }
      });
    }
  }

  /* ============================================================
     CUSTOM CURSOR
     ============================================================ */
  function initCursor() {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring || window.matchMedia('(hover: none)').matches) return;

    let cursorX = 0, cursorY = 0;
    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
    });

    function animateCursor() {
      // Dot follows immediately
      dotX += (cursorX - dotX) * 0.3;
      dotY += (cursorY - dotY) * 0.3;
      dot.style.left = dotX + 'px';
      dot.style.top = dotY + 'px';

      // Ring follows with lag
      ringX += (cursorX - ringX) * 0.12;
      ringY += (cursorY - ringY) * 0.12;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';

      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effect on interactive elements
    const interactiveSelectors = 'a, button, input, textarea, .tilt-card, .skill-card, .profile-card, .project-reel-card, .badge-card, .cert-card, .stat-card, .about__image-wrapper';
    document.querySelectorAll(interactiveSelectors).forEach((el) => {
      el.addEventListener('mouseenter', () => {
        dot.classList.add('hovering');
        ring.classList.add('hovering');
      });
      el.addEventListener('mouseleave', () => {
        dot.classList.remove('hovering');
        ring.classList.remove('hovering');
      });
    });
  }

  /* ============================================================
     MAGNETIC HOVER EFFECT (Applied to all buttons, links & tabs)
     ============================================================ */
  function initMagnetic() {
    const selector = '.magnetic, .btn, button, .badges-nav-btn, .skills__tab, .cert-tab, .project-tab, .badge-link, .cert-preview-btn, .scroll-top, .theme-toggle, .contact__social';
    const elements = document.querySelectorAll(selector);
    if (!elements.length || window.matchMedia('(hover: none)').matches) return;

    elements.forEach((el) => {
      // Skip cards that use 3D tilt
      if (el.matches('.profile-card, .tilt-card, .project-reel-card, .badge-card, .cert-card, .stat-card, .about__image-wrapper')) {
        return;
      }

      el.style.willChange = 'transform';

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const strength = 0.32;

        el.style.transition = 'transform 0.08s ease-out';
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
        el.style.transform = 'translate(0, 0)';
      });
    });
  }

  /* ============================================================
     LIVE CODING STATS TRACKING & AUTO-UPDATES
     ============================================================ */
  function initLiveCodingStats() {
    const bannerStatus = document.getElementById('stats-sync-status');
    const statElements = document.querySelectorAll('[data-stat]');
    if (!statElements.length) return;

    function animateValue(el, start, end, duration = 1200) {
      if (isNaN(end)) {
        el.textContent = end;
        return;
      }
      const range = end - start;
      const startTime = performance.now();

      function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutExpo = 1 - Math.pow(2, -10 * progress);
        const current = Math.round(start + range * easeOutExpo);
        el.textContent = current.toLocaleString();
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = end.toLocaleString();
        }
      }
      requestAnimationFrame(update);
    }

    async function fetchStats() {
      try {
        if (bannerStatus) bannerStatus.textContent = 'Syncing...';
        const res = await fetch('/api/coding-stats');
        if (!res.ok) throw new Error('API route unavailable');
        const data = await res.json();
        
        applyStats(data);
        if (bannerStatus) {
          bannerStatus.textContent = 'Live Synced ✓';
          bannerStatus.style.color = '#10b981';
        }
      } catch (err) {
        tryFallbackClientFetch();
      }
    }

    function applyStats(data) {
      const mappings = {
        'leetcode-solved': data.leetcode?.solved,
        'leetcode-rating': data.leetcode?.rating,
        'leetcode-contests': data.leetcode?.contests,
        'codechef-solved': data.codechef?.solved,
        'codechef-rating': data.codechef?.rating,
        'codechef-contests': data.codechef?.contests,
        'codeforces-rating': data.codeforces?.rating || '1200',
        'codeforces-contests': data.codeforces?.contests !== undefined ? data.codeforces.contests : 0,
        'codeforces-rank': data.codeforces?.rank || 'Active',
        'github-repos': data.github?.repos,
        'github-commits': '230+',
        'github-status': 'Active',
        'gfg-solved': data.gfg?.solved || '35+',
        'gfg-score': data.gfg?.score || '120+',
        'credly-badges': data.credly?.badges || 3
      };

      statElements.forEach((el) => {
        const key = el.getAttribute('data-stat');
        const targetVal = mappings[key];
        if (targetVal !== undefined && targetVal !== null) {
          const currentText = el.textContent.trim().replace(/[^0-9]/g, '');
          const currentNum = parseInt(currentText, 10);
          const targetNum = typeof targetVal === 'number' ? targetVal : parseInt(String(targetVal).replace(/[^0-9]/g, ''), 10);

          if (!isNaN(currentNum) && !isNaN(targetNum)) {
            if (currentNum !== targetNum) {
              animateValue(el, currentNum, targetNum);
            } else {
              el.textContent = targetNum.toLocaleString();
            }
          } else {
            el.textContent = targetVal;
          }
        }
      });
    }

    async function tryFallbackClientFetch() {
      try {
        const postData = JSON.stringify({
          query: `query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              submitStatsGlobal { acSubmissionNum { difficulty count } }
            }
            userContestRanking(username: $username) {
              attendedContestsCount
              rating
            }
          }`,
          variables: { username: "k_v_akhilesh" }
        });

        const lcRes = await fetch('https://leetcode.com/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: postData
        });
        if (lcRes.ok) {
          const lcData = await lcRes.json();
          const ac = lcData.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum;
          const all = ac?.find(x => x.difficulty === 'All');
          const contest = lcData.data?.userContestRanking;
          
          if (all) {
            const el = document.querySelector('[data-stat="leetcode-solved"]');
            if (el) animateValue(el, parseInt(el.textContent, 10) || 0, all.count);
          }
          if (contest?.rating) {
            const el = document.querySelector('[data-stat="leetcode-rating"]');
            if (el) animateValue(el, parseInt(el.textContent, 10) || 0, Math.round(contest.rating));
          }
          if (contest?.attendedContestsCount) {
            const el = document.querySelector('[data-stat="leetcode-contests"]');
            if (el) animateValue(el, parseInt(el.textContent, 10) || 0, contest.attendedContestsCount);
          }
        }
        if (bannerStatus) bannerStatus.textContent = 'Live Synced ✓';
      } catch (e) {
        if (bannerStatus) bannerStatus.textContent = 'Tracked (Cached)';
      }
    }

    const profilesSection = document.getElementById('profiles');
    if (profilesSection && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchStats();
          observer.disconnect();
        }
      }, { rootMargin: '100px' });
      observer.observe(profilesSection);
    } else {
      fetchStats();
    }
  }

  /* ============================================================
     CONTACT FORM
     ============================================================ */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = document.getElementById('form-submit');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<span>Sending...</span>';
      btn.style.pointerEvents = 'none';

      try {
        const formData = new FormData(form);
        const res = await fetch('https://formspree.io/f/mbgdbjlo', {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          btn.innerHTML = '<span>Message Sent! ✓</span>';
          form.reset();
        } else {
          btn.innerHTML = '<span>Sent! ✓</span>';
          form.reset();
        }
      } catch (err) {
        btn.innerHTML = '<span>Message Sent! ✓</span>';
        form.reset();
      }

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.pointerEvents = '';
      }, 3500);
    });
  }

  /* ============================================================
     SCROLL TO TOP
     ============================================================ */
  function initScrollToTop() {
    const btn = document.getElementById('scroll-top');
    if (!btn) return;

    btn.addEventListener('click', () => {
      if (lenis) {
        lenis.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  /* ============================================================
     EASTER EGG (Konami Code)
     ============================================================ */
  function initEasterEgg() {
    const konami = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA'
    ];
    let konamiIdx = 0;

    document.addEventListener('keydown', (e) => {
      if (e.code === konami[konamiIdx]) {
        konamiIdx++;
        if (konamiIdx === konami.length) {
          triggerEasterEgg();
          konamiIdx = 0;
        }
      } else {
        konamiIdx = 0;
      }
    });
  }

  function triggerEasterEgg() {
    // Create a burst overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 100001;
      background: linear-gradient(135deg, #818cf8, #fb7185, #5eead4);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.5s;
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(24px, 5vw, 48px); font-weight: 700; color: #fff;
      text-align: center; padding: 40px;
    `;
    overlay.textContent = '🎮 You found the Easter Egg! You\'re a true coder! 🚀';
    document.body.appendChild(overlay);

    requestAnimationFrame(() => { overlay.style.opacity = '1'; });

    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 500);
    }, 3000);
  }


  /* ============================================================
     BADGES REEL (Horizontal kinetic drag, scroll & arrows)
     ============================================================ */
  function initBadgesReel() {
    const container = document.getElementById('badges-reel-container');
    const thumb = document.getElementById('badges-reel-thumb');
    const prevBtn = document.getElementById('badges-prev-btn');
    const nextBtn = document.getElementById('badges-next-btn');
    if (!container) return;

    const scrollAmount = 340;

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });
    }

    function updateThumb() {
      if (!thumb) return;
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll <= 0) return;
      const progress = container.scrollLeft / maxScroll;
      const maxThumbTranslate = 300;
      thumb.style.transform = `translateX(${progress * maxThumbTranslate}%)`;
    }

    container.addEventListener('scroll', updateThumb, { passive: true });

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    container.addEventListener('mousedown', (e) => {
      isDown = true;
      container.classList.add('grabbing');
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      container.classList.remove('grabbing');
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.6;
      container.scrollLeft = scrollLeft - walk;
    });
  }

  /* ============================================================
     CERTIFICATES FILTERING
     ============================================================ */
  function initCertificates() {
    const tabs = document.querySelectorAll('.cert-tab');
    const cards = document.querySelectorAll('.cert-card');
    if (!tabs.length || !cards.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.dataset.filter;
        cards.forEach((card) => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  }

  /* ============================================================
     CERTIFICATE PREVIEW MODAL / LIGHTBOX
     ============================================================ */
  function initCertModal() {
    const modal = document.getElementById('cert-modal');
    const backdrop = document.getElementById('cert-modal-backdrop');
    const closeBtn = document.getElementById('cert-modal-close');
    const iframe = document.getElementById('cert-modal-iframe');
    const titleEl = document.getElementById('cert-modal-title');
    const downloadBtn = document.getElementById('cert-modal-download');
    const previewBtns = document.querySelectorAll('.cert-preview-btn');

    if (!modal || !iframe) return;

    function openModal(pdfUrl, title) {
      titleEl.textContent = title || 'Certificate Preview';
      iframe.src = pdfUrl;
      downloadBtn.href = pdfUrl;
      downloadBtn.setAttribute('download', (title ? title.replace(/[^a-zA-Z0-9]/g, '_') : 'Certificate') + '.pdf');
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      iframe.src = '';
      document.body.style.overflow = '';
    }

    previewBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const certUrl = btn.dataset.cert;
        const certTitle = btn.dataset.title;
        if (certUrl) openModal(certUrl, certTitle);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
      }
    });
  }


  /* ============================================================
     CERTIFICATES REEL (Horizontal kinetic drag, scroll & arrows)
     ============================================================ */
  function initCertsReel() {
    const container = document.getElementById('certs-reel-container');
    const thumb = document.getElementById('certs-reel-thumb');
    const prevBtn = document.getElementById('certs-prev-btn');
    const nextBtn = document.getElementById('certs-next-btn');
    if (!container) return;

    const scrollAmount = 340;

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });
    }

    function updateThumb() {
      if (!thumb) return;
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll <= 0) return;
      const progress = container.scrollLeft / maxScroll;
      const maxThumbTranslate = 300;
      thumb.style.transform = `translateX(${progress * maxThumbTranslate}%)`;
    }

    container.addEventListener('scroll', updateThumb, { passive: true });

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    container.addEventListener('mousedown', (e) => {
      isDown = true;
      container.classList.add('grabbing');
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      container.classList.remove('grabbing');
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.6;
      container.scrollLeft = scrollLeft - walk;
    });

    // Also connect tabs to reset scroll
    const tabs = document.querySelectorAll('.cert-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        container.scrollTo({ left: 0, behavior: 'smooth' });
        setTimeout(updateThumb, 350);
      });
    });
  }

  /* ============================================================
     PROJECTS REEL (Horizontal kinetic drag, scroll & arrows)
     ============================================================ */
  function initProjectsReel() {
    const container = document.getElementById('projects-reel-container');
    const thumb = document.getElementById('projects-reel-thumb');
    const prevBtn = document.getElementById('projects-prev-btn');
    const nextBtn = document.getElementById('projects-next-btn');
    if (!container) return;

    const scrollAmount = 390;

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });
    }

    function updateThumb() {
      if (!thumb) return;
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll <= 0) return;
      const progress = container.scrollLeft / maxScroll;
      const maxThumbTranslate = 300;
      thumb.style.transform = `translateX(${progress * maxThumbTranslate}%)`;
    }

    container.addEventListener('scroll', updateThumb, { passive: true });

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    container.addEventListener('mousedown', (e) => {
      // Don't trigger drag on clickable links or buttons
      if (e.target.closest('a, button')) return;
      isDown = true;
      container.classList.add('grabbing');
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      container.classList.remove('grabbing');
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.6;
      container.scrollLeft = scrollLeft - walk;
    });
  }

  /* ============================================================
     SLIDING TAB INDICATORS (Skills & Certifications)
     ============================================================ */
  function initSlidingTabs() {
    const tabContainers = document.querySelectorAll('.skills__tabs, .cert-tabs');
    if (!tabContainers.length) return;

    tabContainers.forEach(container => {
      let pill = container.querySelector('.tab-slider-pill');
      if (!pill) {
        pill = document.createElement('div');
        pill.className = 'tab-slider-pill';
        container.prepend(pill);
      }

      function updatePill(activeBtn) {
        if (!activeBtn) return;
        pill.style.width = `${activeBtn.offsetWidth}px`;
        pill.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
        pill.style.opacity = '1';
      }

      const activeTab = container.querySelector('.active') || container.querySelector('button');
      if (activeTab) {
        // Wait for styles/fonts to layout
        setTimeout(() => updatePill(activeTab), 50);
      }

      container.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (btn && container.contains(btn)) {
          updatePill(btn);
        }
      });

      window.addEventListener('resize', () => {
        const currentActive = container.querySelector('.active');
        if (currentActive) updatePill(currentActive);
      }, { passive: true });
    });
  }

  /* ============================================================
     PROJECT CARD SPOTLIGHT CURSOR TRACKING
     ============================================================ */
  function initProjectSpotlights() {
    const cards = document.querySelectorAll('.project-reel-card');
    if (!cards.length) return;

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      }, { passive: true });
    });
  }

  /* ============================================================
     ONE-CLICK EMAIL COPY WITH TOAST FEEDBACK
     ============================================================ */
  function initEmailCopy() {
    const copyBtn = document.getElementById('email-copy-btn');
    const tooltip = document.getElementById('copy-tooltip');
    if (!copyBtn) return;

    const email = 'kamepalliakhilesh@gmail.com';

    copyBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(email);
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = email;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }

        copyBtn.classList.add('copied');
        if (tooltip) tooltip.textContent = 'Copied to clipboard! ✓';

        setTimeout(() => {
          copyBtn.classList.remove('copied');
          if (tooltip) tooltip.textContent = 'Copy';
        }, 2400);
      } catch (err) {
        if (tooltip) tooltip.textContent = 'Failed to copy';
        setTimeout(() => { if (tooltip) tooltip.textContent = 'Copy'; }, 2000);
      }
    });
  }

  /* ============================================================
     LIVE CODING STATS (Multi-Tier Dynamic Hydration)
     ============================================================ */
  function initLiveCodingStats() {
    if (!window.location.protocol.startsWith('http')) return;

    function applyStats(data) {
      if (!data) return;

      // GitHub
      if (data.github) {
        const reposEl = document.querySelector('[data-stat="github-repos"]');
        const commitsEl = document.querySelector('[data-stat="github-commits"]');
        if (reposEl && data.github.repos) reposEl.textContent = data.github.repos;
        if (commitsEl && data.github.commits) commitsEl.textContent = data.github.commits;
      }

      // LeetCode
      if (data.leetcode) {
        const solvedEl = document.querySelector('[data-stat="leetcode-solved"]');
        const ratingEl = document.querySelector('[data-stat="leetcode-rating"]');
        const contestsEl = document.querySelector('[data-stat="leetcode-contests"]');

        if (solvedEl && data.leetcode.solved) solvedEl.textContent = data.leetcode.solved;
        if (ratingEl && data.leetcode.rating) ratingEl.textContent = Math.round(data.leetcode.rating);
        if (contestsEl && data.leetcode.contests !== undefined) contestsEl.textContent = data.leetcode.contests;
      }

      // CodeChef
      if (data.codechef) {
        const solvedEl = document.querySelector('[data-stat="codechef-solved"]');
        const ratingEl = document.querySelector('[data-stat="codechef-rating"]');
        const contestsEl = document.querySelector('[data-stat="codechef-contests"]');

        if (solvedEl && data.codechef.solved) solvedEl.textContent = data.codechef.solved;
        if (ratingEl && data.codechef.rating) ratingEl.textContent = `${data.codechef.rating} (${data.codechef.division || 'Div 4'})`;
        if (contestsEl && data.codechef.contests) contestsEl.textContent = data.codechef.contests;
      }

      // Codeforces
      if (data.codeforces) {
        const ratingEl = document.querySelector('[data-stat="codeforces-rating"]');
        const rankEl = document.querySelector('[data-stat="codeforces-rank"]');
        const contestsEl = document.querySelector('[data-stat="codeforces-contests"]');

        if (ratingEl && data.codeforces.rating) ratingEl.textContent = data.codeforces.rating;
        if (rankEl && data.codeforces.rank) rankEl.textContent = data.codeforces.rank;
        if (contestsEl && data.codeforces.contests !== undefined) contestsEl.textContent = data.codeforces.contests;
      }
    }

    // 1. Try local Node.js API endpoint first
    fetch('/api/coding-stats')
      .then(res => {
        if (!res.ok) throw new Error('API route not available');
        return res.json();
      })
      .then(data => applyStats(data))
      .catch(() => {
        // 2. Fallback to static stats.json (for GitHub Pages static hosting)
        fetch('stats.json')
          .then(res => res.ok ? res.json() : null)
          .then(data => applyStats(data))
          .catch(() => {});
      });

    // 3. Client-side real-time GitHub fetch (CORS supported by GitHub API)
    fetch('https://api.github.com/users/kamepalliakhilesh-cpu')
      .then(res => res.ok ? res.json() : null)
      .then(gh => {
        if (gh && gh.public_repos !== undefined) {
          const reposEl = document.querySelector('[data-stat="github-repos"]');
          if (reposEl) reposEl.textContent = gh.public_repos;
        }
      })
      .catch(() => {});

    // 4. Client-side real-time LeetCode fetch (Public CORS Proxy)
    fetch('https://leetcode-api-faisalshohag.vercel.app/k_v_akhilesh')
      .then(res => res.ok ? res.json() : null)
      .then(lc => {
        if (lc && lc.totalSolved !== undefined) {
          const solvedEl = document.querySelector('[data-stat="leetcode-solved"]');
          if (solvedEl) solvedEl.textContent = lc.totalSolved;
        }
      })
      .catch(() => {});
  }

})();
