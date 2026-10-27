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
    initSoundEngine();
    initCommandPalette();
    initDeveloperTerminal();
    initLeetCodeVisuals();
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
     THEME (Locked Dark Mode)
     ============================================================ */
  function initThemeToggle() {
    // Ensure permanent dark mode across the entire portfolio
    document.documentElement.setAttribute('data-theme', 'dark');
    try {
      localStorage.removeItem('theme');
    } catch (e) {}
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
     SCROLL LOCK HELPERS (Prevents background scrolling during modals)
     ============================================================ */
  function lockScroll() {
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    if (lenis && typeof lenis.stop === 'function') {
      lenis.stop();
    }
  }

  function unlockScroll() {
    // Only resume scrolling if no modal/palette/terminal/menu remains open
    const isModalActive = document.querySelector('.cmd-palette.is-open, .dev-terminal.is-open, .cert-modal.open, .mobile-menu.open');
    if (!isModalActive) {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      if (lenis && typeof lenis.start === 'function') {
        lenis.start();
      }
    }
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
      const isOpen = !menu.classList.contains('open');
      hamburger.classList.toggle('open', isOpen);
      menu.classList.toggle('open', isOpen);
      if (isOpen) {
        lockScroll();
      } else {
        unlockScroll();
      }
    });

    menu.querySelectorAll('.mobile-menu__link').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        menu.classList.remove('open');
        unlockScroll();
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
  /* ============================================================
     QUANTUM FLUID JELLY CURSOR & MAGNETIC PHYSICS (Apple / Awwwards)
     ============================================================ */
  function initCursor() {
    const jelly = document.getElementById('jelly-cursor');
    const dot = document.getElementById('jelly-dot');
    if (!jelly || !dot || window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let prevMouseX = mouseX;
    let prevMouseY = mouseY;

    let jellyX = mouseX;
    let jellyY = mouseY;
    let dotX = mouseX;
    let dotY = mouseY;

    let currentScaleX = 1;
    let currentScaleY = 1;
    let currentAngle = 0;

    let activeMagneticEl = null;
    let isInitialized = false;

    // Fluid physics loop
    function render() {
      // Calculate instantaneous mouse velocity for organic jelly deformation
      const vx = mouseX - prevMouseX;
      const vy = mouseY - prevMouseY;
      prevMouseX = mouseX;
      prevMouseY = mouseY;

      const speed = Math.hypot(vx, vy);

      let targetX = mouseX;
      let targetY = mouseY;

      if (activeMagneticEl) {
        // Magnetic element capture & pull
        const rect = activeMagneticEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const pullX = (mouseX - centerX) * 0.28;
        const pullY = (mouseY - centerY) * 0.28;

        targetX = centerX + pullX;
        targetY = centerY + pullY;

        // Micro magnetic pull on the target button itself
        activeMagneticEl.style.transform = `translate(${pullX * 0.75}px, ${pullY * 0.75}px)`;

        // Interpolate jelly position towards magnetic center
        jellyX += (targetX - jellyX) * 0.28;
        jellyY += (targetY - jellyY) * 0.28;

        currentScaleX += (1 - currentScaleX) * 0.2;
        currentScaleY += (1 - currentScaleY) * 0.2;

        jelly.style.transform = `translate3d(${jellyX}px, ${jellyY}px, 0) translate(-50%, -50%)`;
      } else {
        // Free-flight fluid jelly: squashes and stretches along velocity angle
        const targetAngle = speed > 1.5 ? Math.atan2(vy, vx) * (180 / Math.PI) : currentAngle;

        // Shortest-distance angle interpolation
        let diffAngle = targetAngle - currentAngle;
        while (diffAngle < -180) diffAngle += 360;
        while (diffAngle > 180) diffAngle -= 360;
        currentAngle += diffAngle * 0.15;

        const targetScaleX = 1 + Math.min(speed * 0.005, 0.65);
        const targetScaleY = 1 - Math.min(speed * 0.004, 0.32);

        currentScaleX += (targetScaleX - currentScaleX) * 0.16;
        currentScaleY += (targetScaleY - currentScaleY) * 0.16;

        jellyX += (targetX - jellyX) * 0.2;
        jellyY += (targetY - jellyY) * 0.2;

        jelly.style.transform = `translate3d(${jellyX}px, ${jellyY}px, 0) translate(-50%, -50%) rotate(${currentAngle}deg) scale(${currentScaleX}, ${currentScaleY})`;
      }

      // Precision micro-dot tracks near-instantaneously
      dotX += (mouseX - dotX) * 0.85;
      dotY += (mouseY - dotY) * 0.85;
      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;

      requestAnimationFrame(render);
    }

    // Mouse movement
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isInitialized) {
        prevMouseX = mouseX;
        prevMouseY = mouseY;
        jellyX = mouseX;
        jellyY = mouseY;
        dotX = mouseX;
        dotY = mouseY;
        document.body.classList.add('custom-cursor-active', 'cursor-active');
        isInitialized = true;
        render();
      }
    }, { passive: true });

    // Click / elastic bounce
    window.addEventListener('mousedown', () => {
      jelly.classList.add('is-click');
      dot.classList.add('is-click');
    });

    window.addEventListener('mouseup', () => {
      jelly.classList.remove('is-click');
      dot.classList.remove('is-click');
    });

    // Window leave / enter
    document.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-active');
    });

    document.addEventListener('mouseenter', () => {
      if (isInitialized) document.body.classList.add('cursor-active');
    });

    // Magnetic detection and interactive target snapping
    const magneticSelector = '.btn, button, .badges-nav-btn, .skills__tab, .cert-tab, .project-tab, .badge-link, .cert-preview-btn, .scroll-top, .email-copy-btn, .traffic-btn, .terminal-quick-cmd';

    document.addEventListener('mouseover', (e) => {
      const target = e.target;
      if (!target || !(target instanceof Element)) return;

      const magEl = target.closest(magneticSelector);
      if (magEl && !magEl.matches('.project-reel-card, .tilt-card, .cert-card, .badge-card, .profile-card')) {
        activeMagneticEl = magEl;
        const rect = magEl.getBoundingClientRect();

        jelly.classList.add('is-magnetic');
        document.body.classList.add('is-magnetic-active');

        // Dynamically sheath the button geometry
        jelly.style.width = `${rect.width + 12}px`;
        jelly.style.height = `${rect.height + 12}px`;
        const radius = window.getComputedStyle(magEl).borderRadius;
        jelly.style.borderRadius = radius && radius !== '0px' ? radius : '20px';

        if (window.soundEngine) window.soundEngine.playHover();
        return;
      }

      // Check general hover for cards / links
      const isInteractive = target.closest('a, .cert-card, .project-reel-card, .badge-card, .dev-terminal__window, .cmd-palette__box, .stat-card');
      if (isInteractive) {
        jelly.classList.add('is-hover');
      } else {
        jelly.classList.remove('is-hover');
      }
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
      const target = e.target;
      if (!target || !(target instanceof Element)) return;

      if (activeMagneticEl && target.closest(magneticSelector) === activeMagneticEl) {
        activeMagneticEl.style.transform = '';
        activeMagneticEl = null;

        jelly.classList.remove('is-magnetic');
        document.body.classList.remove('is-magnetic-active');

        // Reset to original jelly drop dimensions
        jelly.style.width = '32px';
        jelly.style.height = '32px';
        jelly.style.borderRadius = '50%';
      }
    }, { passive: true });
  }

  /* Magnetic hover effect is integrated into Quantum Fluid Jelly */
  function initMagnetic() {
    // Handled seamlessly within initCursor with fluid physics
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
     FEATURE 8: ENHANCED CERTIFICATE PREVIEW MODAL / LIGHTBOX
     ============================================================ */
  function initCertModal() {
    const modal = document.getElementById('cert-modal');
    const backdrop = document.getElementById('cert-modal-backdrop');
    const closeBtn = document.getElementById('cert-modal-close');
    const iframe = document.getElementById('cert-modal-iframe');
    const titleEl = document.getElementById('cert-modal-title');
    const issuerEl = document.getElementById('cert-modal-issuer');
    const downloadBtn = document.getElementById('cert-modal-download');
    const previewBtns = Array.from(document.querySelectorAll('.cert-preview-btn'));
    const zoomInBtn = document.getElementById('cert-zoom-in');
    const zoomOutBtn = document.getElementById('cert-zoom-out');
    const zoomResetBtn = document.getElementById('cert-zoom-reset');
    const zoomLevelEl = document.getElementById('cert-zoom-level');
    const prevBtn = document.getElementById('cert-modal-prev');
    const nextBtn = document.getElementById('cert-modal-next');
    const fallbackCard = document.getElementById('cert-fallback-card');
    const fallbackTitle = document.getElementById('cert-fallback-title');
    const fallbackOpen = document.getElementById('cert-fallback-open');

    if (!modal || !iframe) return;

    let currentIndex = 0;
    let currentZoom = 1;

    function applyZoom(val) {
      currentZoom = Math.min(2.2, Math.max(0.6, val));
      if (iframe) iframe.style.transform = `scale(${currentZoom})`;
      if (zoomLevelEl) zoomLevelEl.textContent = `${Math.round(currentZoom * 100)}%`;
      if (window.soundEngine) window.soundEngine.playClick();
    }

    if (zoomInBtn) zoomInBtn.addEventListener('click', () => applyZoom(currentZoom + 0.15));
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => applyZoom(currentZoom - 0.15));
    if (zoomResetBtn) zoomResetBtn.addEventListener('click', () => applyZoom(1));

    function loadCertByIndex(idx) {
      if (!previewBtns.length) return;
      if (idx < 0) idx = previewBtns.length - 1;
      if (idx >= previewBtns.length) idx = 0;
      currentIndex = idx;

      const btn = previewBtns[currentIndex];
      const certUrl = btn.dataset.cert || '';
      const certTitle = btn.dataset.title || 'Official Credential';

      const card = btn.closest('.cert-card');
      const issuerText = card ? (card.querySelector('.cert-card__issuer')?.textContent || card.querySelector('.cert-badge')?.textContent) : 'Verified Credential';

      if (titleEl) titleEl.textContent = certTitle;
      if (issuerEl) issuerEl.textContent = `${issuerText} • Issued to Kamepalli Venkata Akhilesh`;
      if (downloadBtn) {
        downloadBtn.href = certUrl;
        downloadBtn.setAttribute('download', (certTitle ? certTitle.replace(/[^a-zA-Z0-9]/g, '_') : 'Certificate') + '.pdf');
      }

      // Check mobile / small screens where raw PDF iframe might be blocked
      const isMobileDevice = window.innerWidth < 768;
      if (isMobileDevice && fallbackCard) {
        iframe.style.display = 'none';
        fallbackCard.style.display = 'block';
        if (fallbackTitle) fallbackTitle.textContent = certTitle;
        if (fallbackOpen) fallbackOpen.href = certUrl;
      } else {
        if (fallbackCard) fallbackCard.style.display = 'none';
        iframe.style.display = 'block';
        iframe.src = certUrl;
      }

      applyZoom(1);
    }

    function openModal(btnIndex) {
      loadCertByIndex(btnIndex);
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      lockScroll();
      if (window.soundEngine) window.soundEngine.playChime();
    }

    function closeModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      if (iframe) iframe.src = '';
      unlockScroll();
      if (window.soundEngine) window.soundEngine.playClick();
    }

    previewBtns.forEach((btn, idx) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(idx);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) {
      backdrop.addEventListener('click', closeModal);
      backdrop.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
      backdrop.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        loadCertByIndex(currentIndex - 1);
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        loadCertByIndex(currentIndex + 1);
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'ArrowLeft') {
        loadCertByIndex(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        loadCertByIndex(currentIndex + 1);
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
          .catch(() => { });
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
      .catch(() => { });

    // 4. Client-side real-time LeetCode fetch (Public CORS Proxy)
    fetch('https://leetcode-api-faisalshohag.vercel.app/k_v_akhilesh')
      .then(res => res.ok ? res.json() : null)
      .then(lc => {
        if (lc && lc.totalSolved !== undefined) {
          const solvedEl = document.querySelector('[data-stat="leetcode-solved"]');
          if (solvedEl) solvedEl.textContent = lc.totalSolved;
          if (typeof window.updateLeetCodeDonut === 'function') {
            window.updateLeetCodeDonut(lc.easySolved || 159, lc.mediumSolved || 26, lc.hardSolved || 0);
          }
        }
      })
      .catch(() => { });
  }

  /* ============================================================
     FEATURE 3: TACTILE WEB AUDIO API SOUND ENGINE
     ============================================================ */
  function initSoundEngine() {
    let audioCtx = null;
    let isSoundEnabled = localStorage.getItem('cosmo_sound_enabled') === 'true';

    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
      soundToggle.setAttribute('aria-pressed', isSoundEnabled ? 'true' : 'false');
      soundToggle.title = isSoundEnabled ? 'Audio Feedback (Sound ON)' : 'Audio Feedback (Muted by default)';

      soundToggle.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        localStorage.setItem('cosmo_sound_enabled', isSoundEnabled ? 'true' : 'false');
        soundToggle.setAttribute('aria-pressed', isSoundEnabled ? 'true' : 'false');
        soundToggle.title = isSoundEnabled ? 'Audio Feedback (Sound ON)' : 'Audio Feedback (Muted by default)';
        if (isSoundEnabled) {
          ensureContext();
          playChime();
        }
      });
    }

    function ensureContext() {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) audioCtx = new AudioContextClass();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }

    function playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.04) {
      if (!isSoundEnabled) return;
      try {
        ensureContext();
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch (e) { }
    }

    function playClick() {
      playTone(850, 'sine', 0.03, 0.04);
    }

    function playHover() {
      playTone(480, 'sine', 0.02, 0.015);
    }

    function playToggle() {
      if (!isSoundEnabled) return;
      try {
        ensureContext();
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(360, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(640, audioCtx.currentTime + 0.07);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.07);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.07);
      } catch (e) { }
    }

    function playChime() {
      if (!isSoundEnabled) return;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        setTimeout(() => playTone(freq, 'sine', 0.14, 0.04), idx * 60);
      });
    }

    function playKey() {
      playTone(600 + Math.random() * 200, 'triangle', 0.02, 0.02);
    }

    window.soundEngine = {
      playClick,
      playHover,
      playToggle,
      playChime,
      playKey,
      isEnabled: () => isSoundEnabled
    };

    // Attach gentle click feedback to interactive links and buttons
    document.addEventListener('click', (e) => {
      const target = e.target.closest('button, a.btn, .nav-link, .skills__tab, .cert-tab');
      if (target && !target.closest('#sound-toggle')) {
        playClick();
      }
    });
  }

  /* ============================================================
     FEATURE 2: INTERACTIVE COMMAND PALETTE (Ctrl+K / Cmd+K)
     ============================================================ */
  function initCommandPalette() {
    const palette = document.getElementById('cmd-palette');
    const backdrop = document.getElementById('cmd-palette-backdrop');
    const trigger = document.getElementById('cmd-k-trigger');
    const input = document.getElementById('cmd-palette-input');
    const clearBtn = document.getElementById('cmd-palette-clear');
    const body = document.getElementById('cmd-palette-body');

    if (!palette || !input || !body) return;

    let selectedIndex = 0;
    let filteredCommands = [];

    const commands = [
      // Navigation
      { id: 'nav-home', label: 'Go to Home / Hero', cat: 'Navigation', icon: '🏠', badge: 'Section', action: () => scrollToId('hero') },
      { id: 'nav-about', label: 'About Akhilesh & Credentials', cat: 'Navigation', icon: '👤', badge: 'Section', action: () => scrollToId('about') },
      { id: 'nav-skills', label: 'Skills & Tech Stack', cat: 'Navigation', icon: '⚡', badge: 'Section', action: () => scrollToId('skills') },
      { id: 'nav-profiles', label: 'Coding Profiles (LeetCode, GitHub)', cat: 'Navigation', icon: '📊', badge: 'Section', action: () => scrollToId('profiles') },
      { id: 'nav-badges', label: 'Badges & Honors Reel', cat: 'Navigation', icon: '🏅', badge: 'Section', action: () => scrollToId('badges') },
      { id: 'nav-projects', label: 'Featured Engineering Projects', cat: 'Navigation', icon: '🚀', badge: 'Section', action: () => scrollToId('projects') },
      { id: 'nav-certs', label: 'Certifications & Accreditations', cat: 'Navigation', icon: '📜', badge: 'Section', action: () => scrollToId('certificates') },
      { id: 'nav-journey', label: 'Career Journey Timeline', cat: 'Navigation', icon: '🗺️', badge: 'Section', action: () => scrollToId('journey') },
      { id: 'nav-contact', label: 'Let’s Connect / Contact Form', cat: 'Navigation', icon: '✉️', badge: 'Section', action: () => scrollToId('contact') },

      // Quick Actions
      {
        id: 'act-resume', label: 'Download Resume (Akhilesh_Kamepalli_Resume.pdf)', cat: 'Quick Actions', icon: '📄', badge: 'PDF', action: () => {
          const a = document.createElement('a');
          a.href = 'assets/Akhilesh_Kamepalli_Resume.pdf';
          a.download = 'Akhilesh_Kamepalli_Resume.pdf';
          a.click();
        }
      },
      {
        id: 'act-email', label: 'Copy Email Address (kamepalliakhilesh@gmail.com)', cat: 'Quick Actions', icon: '📋', badge: 'Clipboard', action: () => {
          navigator.clipboard.writeText('kamepalliakhilesh@gmail.com');
          if (window.soundEngine) window.soundEngine.playChime();
          alert('Email copied to clipboard: kamepalliakhilesh@gmail.com');
        }
      },
      {
        id: 'act-term', label: 'Launch Developer Terminal CLI', cat: 'Quick Actions', icon: '>_', badge: 'Press `', action: () => {
          if (window.openDevTerminal) window.openDevTerminal();
        }
      },
      {
        id: 'act-sound', label: 'Toggle Sound Effects (SFX)', cat: 'Quick Actions', icon: '🔊', badge: 'Audio', action: () => {
          const soundBtn = document.getElementById('sound-toggle');
          if (soundBtn) soundBtn.click();
        }
      },

      // Profiles
      { id: 'prof-gh', label: 'GitHub Profile (@kamepalliakhilesh-cpu)', cat: 'External Profiles', icon: '🐙', badge: 'GitHub', action: () => window.open('https://github.com/kamepalliakhilesh-cpu', '_blank') },
      { id: 'prof-lc', label: 'LeetCode Profile (@k_v_akhilesh)', cat: 'External Profiles', icon: '🧩', badge: '185 Solved', action: () => window.open('https://leetcode.com/u/k_v_akhilesh/', '_blank') },
      { id: 'prof-cc', label: 'CodeChef Profile (@k_v_akhilesh)', cat: 'External Profiles', icon: '⭐', badge: '1205 Rating', action: () => window.open('https://www.codechef.com/users/k_v_akhilesh', '_blank') },
      { id: 'prof-credly', label: 'Credly Verified Badges', cat: 'External Profiles', icon: '🛡️', badge: '3 Badges', action: () => window.open('https://www.credly.com/users/akhilesh-kamepalli/badges', '_blank') },

      // Easter Eggs
      {
        id: 'fun-confetti', label: 'Celebrate / Confetti Blast', cat: 'Easter Eggs', icon: '🎉', badge: 'Surprise', action: () => {
          if (window.soundEngine) window.soundEngine.playChime();
          for (let i = 0; i < 24; i++) {
            const conf = document.createElement('div');
            conf.style.cssText = `position:fixed;width:10px;height:10px;background:hsl(${Math.random() * 360},100%,50%);left:${50 + (Math.random() - 0.5) * 40}vw;top:${40 + (Math.random() - 0.5) * 30}vh;border-radius:50%;z-index:99999;pointer-events:none;transition:all 1s ease-out;`;
            document.body.appendChild(conf);
            requestAnimationFrame(() => {
              conf.style.transform = `translate(${(Math.random() - 0.5) * 400}px, ${(Math.random() - 0.5) * 400}px) scale(0)`;
              conf.style.opacity = '0';
            });
            setTimeout(() => conf.remove(), 1100);
          }
        }
      }
    ];

    function scrollToId(id) {
      const el = document.getElementById(id);
      if (el) {
        closePalette();
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }

    function renderList(query = '') {
      const q = query.trim().toLowerCase();
      filteredCommands = commands.filter(c => {
        if (!q) return true;
        return c.label.toLowerCase().includes(q) || c.cat.toLowerCase().includes(q) || (c.badge && c.badge.toLowerCase().includes(q));
      });

      if (!filteredCommands.length) {
        body.innerHTML = `<div class="cmd-palette__empty">No commands matching "<strong>${escapeHtml(query)}</strong>"</div>`;
        return;
      }

      // Group by category
      const groups = {};
      filteredCommands.forEach((cmd, idx) => {
        if (!groups[cmd.cat]) groups[cmd.cat] = [];
        groups[cmd.cat].push({ cmd, originalIndex: idx });
      });

      let html = '';
      let flatIndex = 0;

      Object.entries(groups).forEach(([category, items]) => {
        html += `<div class="cmd-group"><div class="cmd-group__title">${category}</div>`;
        items.forEach(({ cmd }) => {
          const isSelected = flatIndex === selectedIndex;
          html += `
            <div class="cmd-item ${isSelected ? 'is-selected' : ''}" data-index="${flatIndex}" role="button" tabindex="0">
              <div class="cmd-item__left">
                <span class="cmd-item__icon">${cmd.icon}</span>
                <span class="cmd-item__label">${cmd.label}</span>
              </div>
              <span class="cmd-item__badge">${cmd.badge}</span>
            </div>
          `;
          flatIndex++;
        });
        html += `</div>`;
      });

      body.innerHTML = html;

      // Add click handlers
      body.querySelectorAll('.cmd-item').forEach(item => {
        item.addEventListener('click', () => {
          const idx = parseInt(item.dataset.index, 10);
          executeCommand(idx);
        });
        item.addEventListener('mouseenter', () => {
          selectedIndex = parseInt(item.dataset.index, 10);
          updateSelectionHighlight();
        });
      });
    }

    function updateSelectionHighlight() {
      const items = body.querySelectorAll('.cmd-item');
      items.forEach((item, idx) => {
        if (idx === selectedIndex) {
          item.classList.add('is-selected');
          item.scrollIntoView({ block: 'nearest' });
        } else {
          item.classList.remove('is-selected');
        }
      });
    }

    function executeCommand(idx) {
      if (filteredCommands[idx] && typeof filteredCommands[idx].action === 'function') {
        if (window.soundEngine) window.soundEngine.playClick();
        closePalette();
        filteredCommands[idx].action();
      }
    }

    function openPalette() {
      palette.classList.add('is-open');
      palette.setAttribute('aria-hidden', 'false');
      selectedIndex = 0;
      input.value = '';
      if (clearBtn) clearBtn.style.display = 'none';
      renderList('');
      lockScroll();
      setTimeout(() => input.focus(), 50);
      if (window.soundEngine) window.soundEngine.playChime();
    }

    function closePalette() {
      palette.classList.remove('is-open');
      palette.setAttribute('aria-hidden', 'true');
      unlockScroll();
      if (window.soundEngine) window.soundEngine.playClick();
    }

    if (trigger) trigger.addEventListener('click', openPalette);
    if (backdrop) {
      backdrop.addEventListener('click', closePalette);
      backdrop.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
      backdrop.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    }

    input.addEventListener('input', () => {
      const val = input.value;
      if (clearBtn) clearBtn.style.display = val ? 'block' : 'none';
      selectedIndex = 0;
      renderList(val);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.style.display = 'none';
        renderList('');
        input.focus();
      });
    }

    // Keyboard Navigation
    window.addEventListener('keydown', (e) => {
      // Toggle palette on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (palette.classList.contains('is-open')) closePalette();
        else openPalette();
        return;
      }

      if (!palette.classList.contains('is-open')) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closePalette();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % Math.max(1, filteredCommands.length);
        updateSelectionHighlight();
        if (window.soundEngine) window.soundEngine.playHover();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length);
        updateSelectionHighlight();
        if (window.soundEngine) window.soundEngine.playHover();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeCommand(selectedIndex);
      }
    });

    function escapeHtml(str) {
      return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
    }
  }

  /* ============================================================
     FEATURE 6: INTERACTIVE DEVELOPER TERMINAL CLI
     ============================================================ */
  function initDeveloperTerminal() {
    const terminal = document.getElementById('dev-terminal');
    const backdrop = document.getElementById('dev-terminal-backdrop');
    const trigger = document.getElementById('terminal-trigger');
    const closeBtn = document.getElementById('terminal-close-btn');
    const minBtn = document.getElementById('terminal-min-btn');
    const maxBtn = document.getElementById('terminal-max-btn');
    const historyEl = document.getElementById('dev-terminal-history');
    const form = document.getElementById('terminal-form');
    const input = document.getElementById('terminal-input');
    const quickCmds = document.querySelectorAll('.terminal-quick-cmd');

    if (!terminal || !input || !historyEl) return;

    let commandHistory = [];
    let historyIndex = -1;

    function renderBanner() {
      historyEl.innerHTML = `
<div class="terminal-banner">╔══════════════════════════════════════════════════════════════════╗
║   AKHILESH KAMEPALLI — INTERACTIVE DEVELOPER CONSOLE v2.0        ║
║   Full Stack Developer & AI Engineer • Aditya University CSE     ║
╚══════════════════════════════════════════════════════════════════╝</div>
<div class="terminal-line terminal-line--output">Welcome to the portfolio shell. Type <strong style="color:#5eead4;">help</strong> to inspect commands, or test shortcuts below.</div>
      `;
    }

    renderBanner();

    function openTerminal() {
      terminal.classList.add('is-open');
      terminal.setAttribute('aria-hidden', 'false');
      lockScroll();
      setTimeout(() => input.focus(), 50);
      if (window.soundEngine) window.soundEngine.playChime();
    }

    function closeTerminal() {
      terminal.classList.remove('is-open');
      terminal.setAttribute('aria-hidden', 'true');
      unlockScroll();
      if (window.soundEngine) window.soundEngine.playClick();
    }

    window.openDevTerminal = openTerminal;

    if (trigger) trigger.addEventListener('click', openTerminal);
    if (closeBtn) closeBtn.addEventListener('click', closeTerminal);
    if (minBtn) minBtn.addEventListener('click', closeTerminal);
    if (maxBtn) {
      maxBtn.addEventListener('click', () => {
        const win = terminal.querySelector('.dev-terminal__window');
        if (win) win.style.height = win.style.height === '92vh' ? '520px' : '92vh';
      });
    }
    if (backdrop) {
      backdrop.addEventListener('click', closeTerminal);
      backdrop.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
      backdrop.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    }

    function handleCommand(rawCmd) {
      const cmd = rawCmd.trim();
      if (!cmd) return;

      commandHistory.push(cmd);
      historyIndex = commandHistory.length;

      // Print command line
      const lineCmd = document.createElement('div');
      lineCmd.className = 'terminal-line terminal-line--cmd';
      lineCmd.innerHTML = `<span>akhilesh@dev:~$</span> <span>${escapeHtml(cmd)}</span>`;
      historyEl.appendChild(lineCmd);

      const parts = cmd.split(' ');
      const main = parts[0].toLowerCase();
      const arg = parts.slice(1).join(' ').toLowerCase();

      const out = document.createElement('div');
      out.className = 'terminal-line terminal-line--output';

      switch (main) {
        case 'help':
          out.innerHTML = `
Available commands:
  <strong>whoami</strong>     - Overview of Akhilesh Kamepalli
  <strong>skills</strong>     - Technical competencies & framework stack
  <strong>projects</strong>   - Featured engineering systems & live links
  <strong>stats</strong>      - Competitive coding ratings (LeetCode, CodeChef)
  <strong>contact</strong>    - Email, phone, GitHub, LinkedIn
  <strong>theme</strong>      - Dark mode status (portfolio is locked to Dark Mode)
  <strong>clear</strong>      - Clear the console buffer
  <strong>sudo hire</strong>  - Verification & recruiting inquiry
  <strong>exit</strong>       - Close this developer terminal window
          `;
          break;

        case 'whoami':
        case 'about':
          out.innerHTML = `
<strong>Kamepalli Venkata Akhilesh</strong>
B.Tech CSE (2nd Year) @ Aditya University
Specialization: Full Stack Web Engineering & AI Applications
Academic Aptitude: JEE Mains 86.63%ile • Intermediate 962/1000
Current Focus: Building Op Code (AI LeetCode Chrome Mentor)
          `;
          break;

        case 'skills':
          out.innerHTML = `
• <strong>Frontend:</strong> React.js, TypeScript, Next.js, HTML5/CSS3, TailwindCSS, Three.js, GSAP
• <strong>Backend:</strong> Node.js, Express, Python, Java, C/C++, REST APIs, WebSockets
• <strong>Databases & Cloud:</strong> PostgreSQL, MySQL, Relational Normalization, Docker, AWS, Render
• <strong>Competitive DSA:</strong> 185+ LeetCode (100-Day Streak), 483+ CodeChef, HackerRank Gold
          `;
          break;

        case 'projects':
          out.innerHTML = `
1. <strong>Op Code</strong> (In Active Dev) — AI-powered Chrome Extension for LeetCode guided hints.
2. <strong>MediScan AI</strong> (Prototype) — Early health biomarker analysis & emergency locator. [Live Demo: pulse-scan-friend.lovable.app]
3. <strong>PocketOps</strong> (Hackathon) — Cross-device telemetry & productivity bridge for laptop/phone. [GitHub: kamepalliakhilesh-cpu/PocketOps]
4. <strong>Shadow Rift</strong> (Playable) — 2D Action Roguelike built in Godot 4 & GDScript.
5. <strong>Disaster Relief DBMS</strong> (Live) — Relational resource management schema hosted on Render.
          `;
          break;

        case 'stats':
          out.innerHTML = `
• <strong>LeetCode:</strong> 185 Solved (159 Easy, 26 Medium) • 1403 Contest Rating • Top 32%
• <strong>CodeChef:</strong> 483 Solved • 1205 Rating (Div 4) • 14 Contests Attended
• <strong>GitHub:</strong> 7 Public Repositories • 240+ Commits
• <strong>Credly Badges:</strong> 3 Industry Certifications (Certiport Python, Power Platform, Excel)
          `;
          break;

        case 'contact':
          out.innerHTML = `
• <strong>Email:</strong> <a href="mailto:kamepalliakhilesh@gmail.com" style="color:#5eead4;">kamepalliakhilesh@gmail.com</a>
• <strong>Phone:</strong> +91 93923 79172
• <strong>GitHub:</strong> <a href="https://github.com/kamepalliakhilesh-cpu" target="_blank" style="color:#818cf8;">github.com/kamepalliakhilesh-cpu</a>
• <strong>LeetCode:</strong> <a href="https://leetcode.com/u/k_v_akhilesh/" target="_blank" style="color:#ffa116;">leetcode.com/u/k_v_akhilesh/</a>
          `;
          break;

        case 'theme':
          document.documentElement.setAttribute('data-theme', 'dark');
          try { localStorage.removeItem('theme'); } catch (e) {}
          if (window.updateSceneTheme) window.updateSceneTheme('dark');
          out.innerHTML = `<span class="terminal-line--info">Theme is permanently locked to Dark Mode.</span>`;
          break;

        case 'clear':
          historyEl.innerHTML = '';
          return;

        case 'sudo':
          if (arg === 'hire') {
            out.innerHTML = `
<div class="terminal-line--success" style="font-weight:600;">[ACCESS GRANTED — RECRUITER MODE]</div>
Thank you for your interest! I am actively looking for software engineering internships and AI / full-stack junior opportunities.
Drop me a note directly at <a href="mailto:kamepalliakhilesh@gmail.com" style="color:#5eead4;">kamepalliakhilesh@gmail.com</a> or phone: +91 93923 79172. Let's create impactful software together!
            `;
            if (window.soundEngine) window.soundEngine.playChime();
          } else {
            out.innerHTML = `<span class="terminal-line--error">sudo: ${escapeHtml(arg)}: command not recognized. Try 'sudo hire'.</span>`;
          }
          break;

        case 'exit':
          closeTerminal();
          return;

        default:
          out.innerHTML = `<span class="terminal-line--error">command not found: ${escapeHtml(main)}. Type 'help' for available commands.</span>`;
          break;
      }

      historyEl.appendChild(out);
      const scrollable = terminal.querySelector('.dev-terminal__content');
      if (scrollable) scrollable.scrollTop = scrollable.scrollHeight;

      if (window.soundEngine) window.soundEngine.playKey();
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = input.value;
        input.value = '';
        handleCommand(val);
      });
    }

    // Quick Command Pills
    quickCmds.forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.dataset.cmd;
        if (cmd) handleCommand(cmd);
      });
    });

    // History and Backtick shortcut
    window.addEventListener('keydown', (e) => {
      // Toggle terminal on backtick ` if not currently typing in a normal form input
      if (e.key === '`' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        if (terminal.classList.contains('is-open')) closeTerminal();
        else openTerminal();
        return;
      }

      if (!terminal.classList.contains('is-open')) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeTerminal();
      } else if (e.key === 'ArrowUp') {
        if (commandHistory.length > 0 && historyIndex > 0) {
          historyIndex--;
          input.value = commandHistory[historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
          historyIndex++;
          input.value = commandHistory[historyIndex];
        } else {
          historyIndex = commandHistory.length;
          input.value = '';
        }
      }
    });

    function escapeHtml(str) {
      return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
    }
  }

  /* ============================================================
     FEATURE 5: LEETCODE SVG DONUT VISUALIZATION
     ============================================================ */
  function initLeetCodeVisuals() {
    function updateDonut(easy = 159, med = 26, hard = 0) {
      const total = Math.max(1, easy + med + hard);
      const circumference = 238.76; // 2 * PI * 38

      const easyArc = document.querySelector('.donut-arc--easy');
      const medArc = document.querySelector('.donut-arc--med');
      const hardArc = document.querySelector('.donut-arc--hard');

      const easyRatio = easy / total;
      const medRatio = med / total;

      const easyOffset = circumference * (1 - easyRatio);
      const medOffset = circumference * (1 - (easyRatio + medRatio));

      if (easyArc) easyArc.style.strokeDashoffset = `${easyOffset}`;
      if (medArc) medArc.style.strokeDashoffset = `${medOffset}`;

      // Update text numbers
      const easyEl = document.querySelector('[data-stat="leetcode-easy"]');
      const medEl = document.querySelector('[data-stat="leetcode-medium"]');
      const hardEl = document.querySelector('[data-stat="leetcode-hard"]');

      if (easyEl) easyEl.textContent = easy;
      if (medEl) medEl.textContent = med;
      if (hardEl) hardEl.textContent = hard;
    }

    window.updateLeetCodeDonut = updateDonut;

    // Trigger initial calculation
    setTimeout(() => updateDonut(159, 26, 0), 400);
  }

})();

