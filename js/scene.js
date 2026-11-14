/* ============================================================
   COSMO v3.0 — True 3D Spatial Experience Engine (Three.js)
   - 60/40 Right-Stage Interactive 3D Focal Sculpture (Gyroscopic Core)
   - Scroll-Linked Camera Flight along Z-Axis Corridor (+28m to -42m)
   - Morphing Particle States (Hero Reactive Sphere -> Helix -> Skills Data Grid -> Torus Lattice)
   - True Z-Axis Sandwiching (Deep Clusters z:0 + Out-of-Focus Foreground Bokeh z:4)
   - Shared Cursor Point-Light Synced Across 3D Mesh & Adjacent HTML Card Borders
   - Exponential Atmospheric Depth Fog Matched to #030305
   ============================================================ */

(function () {
  'use strict';

  if (!window.THREE) return;

  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  const fgCanvas = document.getElementById('fg-bokeh-canvas');
  const fgCtx = fgCanvas ? fgCanvas.getContext('2d') : null;

  // Detect mobile/low-power device
  const isMobile = window.innerWidth < 768;
  const PARTICLE_COUNT = isMobile ? 1200 : 3200;
  const MAX_CONNECTIONS = isMobile ? 45 : 110;
  const CONNECTION_DIST = 5.4;

  // ---- Theme & Fog Constants (#030305) ----
  const FOG_HEX = 0x030305;
  const FOG_DENSITY = 0.021;
  let isDark = document.documentElement.getAttribute('data-theme') !== 'light';

  // ---- Scene, Exponential Depth Fog & Camera Setup ----
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(isDark ? FOG_HEX : 0xf8f9fc, FOG_DENSITY);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 220);
  camera.position.set(0, 0, 28);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    precision: 'highp',
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
  renderer.setClearColor(FOG_HEX, 0);
  if (THREE.SRGBColorSpace) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  }
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.28;

  // ---- Mouse, Shared Cursor Point-Light & Scroll Tracking ----
  const mouse = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    clientX: window.innerWidth * 0.65,
    clientY: window.innerHeight * 0.45,
    speed: 0
  };
  let lastMouseX = mouse.clientX;
  let lastMouseY = mouse.clientY;

  // Shared cursor point-light state exposed to HTML card border shader loop
  window.__sharedPointLight = {
    clientX: mouse.clientX,
    clientY: mouse.clientY,
    r: 0,
    g: 240,
    b: 255,
    active: false
  };

  window.addEventListener('mousemove', (e) => {
    mouse.clientX = e.clientX;
    mouse.clientY = e.clientY;
    mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;

    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;
    mouse.speed = Math.min(Math.sqrt(dx * dx + dy * dy) * 0.025, 3);
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    window.__sharedPointLight.clientX = e.clientX;
    window.__sharedPointLight.clientY = e.clientY;
    window.__sharedPointLight.active = true;
  }, { passive: true });

  let scrollProgress = 0;
  let skillsFocusWeight = 0;
  let heroFocusWeight = 1;

  const skillsSectionEl = document.getElementById('skills');
  const profilesSectionEl = document.getElementById('profiles');
  const hudParticleStateEl = document.getElementById('hud-particle-state');
  const hudCameraCoordsEl = document.getElementById('hud-camera-coords');

  function updateScroll() {
    const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollProgress = Math.max(0, Math.min(1, window.scrollY / docHeight));

    // Measure proximity to Hero and Skills sections so particle morph snaps accurately over Skills
    const vh = window.innerHeight;
    heroFocusWeight = Math.max(0, Math.min(1, 1 - window.scrollY / (vh * 0.85)));

    if (skillsSectionEl) {
      const rect = skillsSectionEl.getBoundingClientRect();
      const profRect = profilesSectionEl ? profilesSectionEl.getBoundingClientRect() : rect;
      const topEdge = rect.top;
      const bottomEdge = profRect.bottom;
      // Full grid weight when Skills or Coding Profiles occupies the viewport center
      if (topEdge < vh * 0.65 && bottomEdge > vh * 0.25) {
        const enter = Math.min(1, (vh * 0.65 - topEdge) / (vh * 0.35));
        const exit = Math.min(1, (bottomEdge - vh * 0.25) / (vh * 0.35));
        skillsFocusWeight = Math.max(0, Math.min(1, Math.min(enter, exit)));
      } else {
        skillsFocusWeight = 0;
      }
    }
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  // ---- Theme Observer ----
  const themeObserver = new MutationObserver(() => {
    isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    updateThemeColors();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // ---- Dynamic Lighting & Shared Cursor Point-Light ----
  const ambientLight = new THREE.AmbientLight(isDark ? 0x1a2036 : 0xecf0f8, 0.9);
  scene.add(ambientLight);

  // Primary interactive 3D point light synced with cursor coordinates
  const cursorPointLight = new THREE.PointLight(isDark ? 0x00f0ff : 0x4f46e5, 3.6, 46, 1.6);
  cursorPointLight.position.set(4, 0, 18);
  scene.add(cursorPointLight);

  // Secondary celestial rim light
  const accentLight = new THREE.PointLight(isDark ? 0x818cf8 : 0x06b6d4, 1.8, 44, 1.8);
  accentLight.position.set(8, 6, 12);
  scene.add(accentLight);

  // Directional key light for PBR glass sculpture
  const directionalLight = new THREE.DirectionalLight(isDark ? 0x60a5fa : 0x6366f1, 0.65);
  directionalLight.position.set(-8, 14, 20);
  scene.add(directionalLight);

  // ---- Raycasting for Cursor 3D World Coordinates ----
  const raycaster = new THREE.Raycaster();
  const mouseNDC = new THREE.Vector2();
  const mouseWorld = new THREE.Vector3(5.6, 0, 12);
  const projectionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -12);

  // ============================================================
  // 1. HERO 60/40 RIGHT-STAGE INTERACTIVE 3D FOCAL SCULPTURE
  // ============================================================
  const heroCoreGroup = new THREE.Group();
  function getHeroSculptureBaseX() {
    return window.innerWidth > 1024 ? 5.8 : 0.0;
  }
  function getHeroSculptureBaseY() {
    return window.innerWidth > 1024 ? 0.35 : -1.8;
  }
  heroCoreGroup.position.set(getHeroSculptureBaseX(), getHeroSculptureBaseY(), 11.5);

  // Crystal nucleus: PBR Physical Glass with Transmission & Specular Highlight
  const nucleusGeo = new THREE.IcosahedronGeometry(2.15, 0);
  const nucleusMat = new THREE.MeshPhysicalMaterial({
    color: isDark ? 0x00f0ff : 0x4f46e5,
    emissive: isDark ? 0x06203d : 0x1e1b4b,
    roughness: 0.06,
    metalness: 0.15,
    transmission: 0.76,
    thickness: 2.6,
    ior: 1.58,
    transparent: true,
    opacity: isDark ? 0.88 : 0.65,
    flatShading: true,
    fog: true
  });
  const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
  heroCoreGroup.add(nucleusMesh);

  // Inner Quantum Octahedron Kernel
  const kernelGeo = new THREE.OctahedronGeometry(1.15, 0);
  const kernelMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.65,
    fog: true
  });
  const kernelMesh = new THREE.Mesh(kernelGeo, kernelMat);
  heroCoreGroup.add(kernelMesh);

  // Outer geodesic wireframe cage
  const cageGeo = new THREE.IcosahedronGeometry(2.58, 1);
  const cageMat = new THREE.MeshBasicMaterial({
    color: isDark ? 0x38bdf8 : 0x6366f1,
    wireframe: true,
    transparent: true,
    opacity: isDark ? 0.52 : 0.45,
    fog: true
  });
  const cageMesh = new THREE.Mesh(cageGeo, cageMat);
  heroCoreGroup.add(cageMesh);

  // 3 Concentric Gyroscopic Rings
  const ringMaterials = [
    new THREE.MeshBasicMaterial({ color: isDark ? 0x00f0ff : 0x3b82f6, transparent: true, opacity: 0.68, fog: true }),
    new THREE.MeshBasicMaterial({ color: isDark ? 0x818cf8 : 0x6366f1, transparent: true, opacity: 0.6, fog: true }),
    new THREE.MeshBasicMaterial({ color: isDark ? 0x5eead4 : 0x0d9488, transparent: true, opacity: 0.52, fog: true })
  ];

  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.35, 0.045, 20, 128), ringMaterials[0]);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(4.05, 0.045, 20, 128), ringMaterials[1]);
  const ring3 = new THREE.Mesh(new THREE.TorusGeometry(4.75, 0.04, 20, 128), ringMaterials[2]);

  ring1.rotation.x = Math.PI * 0.32;
  ring2.rotation.y = Math.PI * 0.45;
  ring3.rotation.z = Math.PI * 0.22;

  heroCoreGroup.add(ring1);
  heroCoreGroup.add(ring2);
  heroCoreGroup.add(ring3);

  // Orbiting energy nodes
  const orbitalNode = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffffff, fog: true })
  );
  const orbitalNode2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, fog: true })
  );
  const orbitalNode3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x5eead4, fog: true })
  );
  heroCoreGroup.add(orbitalNode);
  heroCoreGroup.add(orbitalNode2);
  heroCoreGroup.add(orbitalNode3);

  scene.add(heroCoreGroup);

  // Interactive Sculpture Mode & Energy Pulse State
  let sculptureMode = 'sphere'; // 'sphere' | 'lattice' | 'vortex'
  let pulseEnergy = 0;

  function triggerSculpturePulse() {
    pulseEnergy = 1.0;
    if (window.soundEngine && typeof window.soundEngine.playToggle === 'function') {
      window.soundEngine.playToggle();
    }
  }

  // Wire Hero Stage Interactive Controls
  document.querySelectorAll('.stage-mode-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const mode = btn.getAttribute('data-sculpture-mode') || 'sphere';
      sculptureMode = mode;
      document.querySelectorAll('.stage-mode-btn').forEach((b) => b.classList.toggle('active', b === btn));
      triggerSculpturePulse();
    });
  });

  const stagePulseBtn = document.getElementById('stage-pulse-btn');
  if (stagePulseBtn) {
    stagePulseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerSculpturePulse();
    });
  }

  const heroStageInteract = document.getElementById('hero-stage-interact');
  if (heroStageInteract) {
    heroStageInteract.addEventListener('click', () => {
      triggerSculpturePulse();
    });
  }

  // ============================================================
  // 2. SPATIAL CORRIDOR WAYPOINT RINGS (Scroll Camera Flight Tunnel)
  // ============================================================
  const corridorGroup = new THREE.Group();
  const waypointZCoords = [2.0, -10.0, -22.0, -34.0, -46.0];
  const waypointRings = [];

  waypointZCoords.forEach((zPos, idx) => {
    const wpGeo = new THREE.TorusGeometry(13.5 + (idx % 2) * 2.5, 0.035, 12, 96);
    const wpMat = new THREE.MeshBasicMaterial({
      color: idx % 2 === 0 ? 0x38bdf8 : 0x818cf8,
      transparent: true,
      opacity: 0.16,
      fog: true
    });
    const wpMesh = new THREE.Mesh(wpGeo, wpMat);
    wpMesh.position.set(0, 0, zPos);
    wpMesh.rotation.z = idx * 0.4;
    corridorGroup.add(wpMesh);
    waypointRings.push(wpMesh);
  });
  scene.add(corridorGroup);

  // ============================================================
  // 3. MORPHING PARTICLE STATES (Sphere -> Helix -> Skills Data Grid -> Torus)
  // ============================================================
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
  const particleVelocities = new Float32Array(PARTICLE_COUNT * 3);
  const particleSizes = new Float32Array(PARTICLE_COUNT);

  // Morph State Target Buffers
  const morphSphere = new Float32Array(PARTICLE_COUNT * 3);
  const morphHelix = new Float32Array(PARTICLE_COUNT * 3);
  const morphGrid = new Float32Array(PARTICLE_COUNT * 3);
  const morphTorus = new Float32Array(PARTICLE_COUNT * 3);

  function buildMorphStates() {
    const heroCenterX = getHeroSculptureBaseX();
    const heroCenterY = getHeroSculptureBaseY();
    const heroCenterZ = 11.5;

    // Grid dimensions for Skills Structured Data Grid
    const gridCols = isMobile ? 12 : 20;
    const gridRows = isMobile ? 10 : 14;
    const gridLayers = Math.ceil(PARTICLE_COUNT / (gridCols * gridRows));
    const spacingX = 2.4;
    const spacingY = 1.9;
    const spacingZ = 2.2;

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      const t = i / PARTICLE_COUNT;

      // ---- STATE A: HERO REACTIVE SPHERE (Centered in Right 40% around Sculpture + Ambient Halo) ----
      if (i < PARTICLE_COUNT * 0.72) {
        // Dense Fibonacci Reactive Sphere shell around Hero 3D Sculpture
        const sIdx = i / (PARTICLE_COUNT * 0.72);
        const yNorm = 1 - sIdx * 2;
        const radiusAtY = Math.sqrt(Math.max(0, 1 - yNorm * yNorm));
        const theta = goldenAngle * i;
        const shellRadius = 5.4 + (i % 5) * 0.65;

        morphSphere[idx] = heroCenterX + Math.cos(theta) * radiusAtY * shellRadius;
        morphSphere[idx + 1] = heroCenterY + yNorm * shellRadius;
        morphSphere[idx + 2] = heroCenterZ + Math.sin(theta) * radiusAtY * shellRadius;
      } else {
        // Surrounding spatial field spanning the hero viewport depth
        const angle = goldenAngle * i;
        const r = 10.5 + (i % 17) * 1.4;
        morphSphere[idx] = (Math.cos(angle) * r) * 1.35;
        morphSphere[idx + 1] = ((i % 29) / 29 - 0.5) * 26;
        morphSphere[idx + 2] = heroCenterZ + Math.sin(angle) * r * 0.85 - 4.0;
      }

      // ---- STATE B: ABOUT DOUBLE-HELIX FLIGHT STREAM (Z: +14 down to -10) ----
      const strand = i % 2 === 0 ? 1 : -1;
      const helixAngle = t * Math.PI * 14 + (strand > 0 ? 0 : Math.PI);
      const helixRadius = 8.5 + (i % 7) * 0.85;
      morphHelix[idx] = Math.cos(helixAngle) * helixRadius;
      morphHelix[idx + 1] = Math.sin(helixAngle) * (helixRadius * 0.72);
      morphHelix[idx + 2] = 16.0 - t * 32.0;

      // ---- STATE C: SKILLS STRUCTURED 3D DATA GRID (Orthogonal Voxel Matrix around Z: -8 to -28) ----
      const col = i % gridCols;
      const row = Math.floor(i / gridCols) % gridRows;
      const layer = Math.floor(i / (gridCols * gridRows));
      morphGrid[idx] = (col - (gridCols - 1) / 2) * spacingX;
      morphGrid[idx + 1] = (row - (gridRows - 1) / 2) * spacingY;
      morphGrid[idx + 2] = -2.0 - layer * spacingZ;

      // ---- STATE D: PROJECTS & JOURNEY CYBERNETIC TORUS LATTICE (Z: -18 to -55) ----
      const u = (i / PARTICLE_COUNT) * Math.PI * 2 * 11;
      const v = ((i * 7) / PARTICLE_COUNT) * Math.PI * 2;
      const majorR = 13.5;
      const minorR = 4.2 + (i % 4) * 0.6;
      morphTorus[idx] = (majorR + minorR * Math.cos(v)) * Math.cos(u);
      morphTorus[idx + 1] = (majorR + minorR * Math.cos(v)) * Math.sin(u) * 0.68;
      morphTorus[idx + 2] = -28.0 + minorR * Math.sin(v) * 3.2 - (t - 0.5) * 26.0;
    }
  }

  buildMorphStates();

  // Initialize particle positions to State A (Hero Reactive Sphere)
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const idx = i * 3;
    particlePositions[idx] = morphSphere[idx];
    particlePositions[idx + 1] = morphSphere[idx + 1];
    particlePositions[idx + 2] = morphSphere[idx + 2];
    particleSizes[i] = (i % 5 === 0) ? 2.6 : 1.4;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

  // Crisp Radial Glow Texture
  function createParticleTexture() {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 128;
    pCanvas.height = 128;
    const ctx = pCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.24, 'rgba(255, 255, 255, 0.96)');
    grad.addColorStop(0.48, 'rgba(125, 211, 252, 0.85)');
    grad.addColorStop(0.74, 'rgba(129, 140, 248, 0.32)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(pCanvas);
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    return texture;
  }

  const particleTexture = createParticleTexture();

  const particleMat = new THREE.PointsMaterial({
    color: isDark ? 0xffffff : 0x4f46e5,
    size: 0.24,
    map: particleTexture,
    transparent: true,
    opacity: isDark ? 0.92 : 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
    fog: true
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ============================================================
  // 4. DEEP-SPACE BACKGROUND CLUSTERS (Z-Axis Sandwiching Back Layer)
  // ============================================================
  const DEEP_STARS_COUNT = isMobile ? 400 : 1100;
  const deepStarGeo = new THREE.BufferGeometry();
  const deepStarPositions = new Float32Array(DEEP_STARS_COUNT * 3);
  for (let i = 0; i < DEEP_STARS_COUNT; i++) {
    deepStarPositions[i * 3] = (Math.random() - 0.5) * 150;
    deepStarPositions[i * 3 + 1] = (Math.random() - 0.5) * 110;
    deepStarPositions[i * 3 + 2] = -25 - Math.random() * 75;
  }
  deepStarGeo.setAttribute('position', new THREE.BufferAttribute(deepStarPositions, 3));
  const deepStarMat = new THREE.PointsMaterial({
    color: isDark ? 0x93c5fd : 0x6366f1,
    size: 0.34,
    map: particleTexture,
    transparent: true,
    opacity: isDark ? 0.68 : 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: true
  });
  const deepStars = new THREE.Points(deepStarGeo, deepStarMat);
  scene.add(deepStars);

  // ============================================================
  // 5. CONSTELLATION NEURAL WEB (Point-Light Reactive)
  // ============================================================
  const lineGeo = new THREE.BufferGeometry();
  const linePositions = new Float32Array(MAX_CONNECTIONS * 6);
  const lineColors = new Float32Array(MAX_CONNECTIONS * 6);
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
  lineGeo.setDrawRange(0, 0);

  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.48,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: true
  });
  const constellationLines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(constellationLines);

  // ============================================================
  // 6. FOREGROUND DEPTH-OF-FIELD BOKEH PARTICLES (True Z-Axis Sandwiching Front Layer)
  // ============================================================
  const FG_BOKEH_COUNT = isMobile ? 12 : 24;
  const fgParticles = [];

  function initForegroundBokeh() {
    if (!fgCanvas) return;
    fgCanvas.width = window.innerWidth;
    fgCanvas.height = window.innerHeight;
    fgParticles.length = 0;

    for (let i = 0; i < FG_BOKEH_COUNT; i++) {
      fgParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: 18 + Math.random() * 38, // Out-of-focus foreground bokeh size
        vx: (Math.random() - 0.5) * 0.28,
        vy: -0.15 - Math.random() * 0.35,
        parallaxFactor: 1.25 + Math.random() * 0.55,
        alpha: 0.045 + Math.random() * 0.08,
        hueOffset: (i % 3) * 35
      });
    }
  }
  initForegroundBokeh();

  let lastScrollY = window.scrollY;
  function renderForegroundBokeh(time) {
    if (!fgCtx || !fgCanvas) return;
    const w = fgCanvas.width;
    const h = fgCanvas.height;
    fgCtx.clearRect(0, 0, w, h);

    const scrollDelta = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;

    const pl = window.__sharedPointLight;

    for (let i = 0; i < fgParticles.length; i++) {
      const p = fgParticles[i];
      p.x += p.vx + Math.sin(time * 0.4 + i) * 0.18 - mouse.x * 0.35;
      p.y += p.vy - scrollDelta * (p.parallaxFactor * 0.38);

      // Gentle cursor drift on foreground bokeh
      const dx = p.x - pl.clientX;
      const dy = p.y - pl.clientY;
      const dist = Math.hypot(dx, dy);
      if (dist < 220 && dist > 1) {
        const push = (1 - dist / 220) * 0.9;
        p.x += (dx / dist) * push;
        p.y += (dy / dist) * push;
      }

      // Wrap around viewport smoothly
      if (p.y < -p.radius * 2) p.y = h + p.radius * 1.5;
      if (p.y > h + p.radius * 2) p.y = -p.radius * 1.5;
      if (p.x < -p.radius * 2) p.x = w + p.radius * 1.5;
      if (p.x > w + p.radius * 2) p.x = -p.radius * 1.5;

      const grad = fgCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
      const r = Math.min(255, pl.r + p.hueOffset);
      const g = pl.g;
      const b = pl.b;
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${(p.alpha * 1.35).toFixed(3)})`);
      grad.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, ${(p.alpha * 0.55).toFixed(3)})`);
      grad.addColorStop(1, 'rgba(3, 3, 5, 0)');

      fgCtx.fillStyle = grad;
      fgCtx.beginPath();
      fgCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      fgCtx.fill();
    }
  }

  // ============================================================
  // THEME COLOR REFRESH
  // ============================================================
  function updateThemeColors() {
    scene.fog.color.setHex(isDark ? FOG_HEX : 0xf8f9fc);
    ambientLight.color.set(isDark ? 0x1a2036 : 0xecf0f8);
    cursorPointLight.color.set(isDark ? 0x00f0ff : 0x4f46e5);
    accentLight.color.set(isDark ? 0x818cf8 : 0x06b6d4);
    directionalLight.color.set(isDark ? 0x60a5fa : 0x6366f1);

    nucleusMat.color.set(isDark ? 0x00f0ff : 0x4f46e5);
    nucleusMat.emissive.set(isDark ? 0x06203d : 0x1e1b4b);
    nucleusMat.opacity = isDark ? 0.88 : 0.65;

    cageMat.color.set(isDark ? 0x38bdf8 : 0x6366f1);
    cageMat.opacity = isDark ? 0.52 : 0.45;

    ringMaterials[0].color.set(isDark ? 0x00f0ff : 0x3b82f6);
    ringMaterials[1].color.set(isDark ? 0x818cf8 : 0x6366f1);
    ringMaterials[2].color.set(isDark ? 0x5eead4 : 0x0d9488);

    particleMat.color.set(isDark ? 0xffffff : 0x4f46e5);
    particleMat.opacity = isDark ? 0.9 : 0.68;

    deepStarMat.color.set(isDark ? 0x93c5fd : 0x6366f1);
    deepStarMat.opacity = isDark ? 0.68 : 0.45;
  }

  // ============================================================
  // UPDATE CONSTELLATION NEURAL WEB NEAR POINT LIGHT
  // ============================================================
  function updateConstellation() {
    if (isMobile) return;

    const pos = particleGeo.attributes.position.array;
    const lp = lineGeo.attributes.position.array;
    const lc = lineGeo.attributes.color.array;
    let lineIdx = 0;

    const plColor = cursorPointLight.color;

    for (let i = 0; i < PARTICLE_COUNT && lineIdx < MAX_CONNECTIONS; i += 3) {
      const px = pos[i * 3];
      const py = pos[i * 3 + 1];
      const pz = pos[i * 3 + 2];

      const dx = px - mouseWorld.x;
      const dy = py - mouseWorld.y;
      const dz = (pz - mouseWorld.z) * 0.45;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < CONNECTION_DIST) {
        for (let j = i + 1; j < PARTICLE_COUNT && lineIdx < MAX_CONNECTIONS; j += 4) {
          const px2 = pos[j * 3];
          const py2 = pos[j * 3 + 1];
          const pz2 = pos[j * 3 + 2];

          const d = Math.sqrt((px - px2) ** 2 + (py - py2) ** 2 + (pz - pz2) ** 2);

          if (d < CONNECTION_DIST * 0.78) {
            const alpha = (1 - d / (CONNECTION_DIST * 0.78)) * (isDark ? 0.85 : 0.5);
            const idx = lineIdx * 6;

            lp[idx] = px; lp[idx + 1] = py; lp[idx + 2] = pz;
            lp[idx + 3] = px2; lp[idx + 4] = py2; lp[idx + 5] = pz2;

            lc[idx] = plColor.r * alpha;
            lc[idx + 1] = plColor.g * alpha;
            lc[idx + 2] = plColor.b * alpha;
            lc[idx + 3] = plColor.r * alpha;
            lc[idx + 4] = plColor.g * alpha;
            lc[idx + 5] = plColor.b * alpha;

            lineIdx++;
          }
        }
      }
    }

    lineGeo.setDrawRange(0, lineIdx * 2);
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate = true;
  }

  // ============================================================
  // SHARED CURSOR POINT-LIGHT -> HTML CARD BORDER HIGHLIGHT SYNC
  // ============================================================
  let trackedCards = [];
  function refreshTrackedCards() {
    trackedCards = Array.from(document.querySelectorAll(
      '.project-reel-card, .skill-card, .badge-card, .cert-card, .profile-card, .stat-card, .hero__telemetry-dock'
    ));
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refreshTrackedCards);
  } else {
    refreshTrackedCards();
  }

  function syncHtmlCardPointLight() {
    const pl = window.__sharedPointLight;
    document.documentElement.style.setProperty('--point-light-rgb', `${pl.r}, ${pl.g}, ${pl.b}`);

    if (!pl.active || !trackedCards.length) return;

    const LIGHT_RADIUS = 460; // Casts real-time highlights onto adjacent card borders within 460px
    const cx = pl.clientX;
    const cy = pl.clientY;
    const vh = window.innerHeight;

    for (let i = 0; i < trackedCards.length; i++) {
      const card = trackedCards[i];
      const rect = card.getBoundingClientRect();
      // Skip offscreen cards for 60fps performance
      if (rect.bottom < -120 || rect.top > vh + 120) continue;

      const relX = cx - rect.left;
      const relY = cy - rect.top;

      // Shortest distance from cursor to card bounding box
      const clampedX = Math.max(0, Math.min(rect.width, relX));
      const clampedY = Math.max(0, Math.min(rect.height, relY));
      const distToBox = Math.hypot(relX - clampedX, relY - clampedY);

      if (distToBox < LIGHT_RADIUS) {
        const proximity = Math.pow(1 - distToBox / LIGHT_RADIUS, 1.45);
        card.style.setProperty('--cursor-light-x', `${relX.toFixed(1)}px`);
        card.style.setProperty('--cursor-light-y', `${relY.toFixed(1)}px`);
        card.style.setProperty('--cursor-light-alpha', proximity.toFixed(3));
      } else {
        card.style.setProperty('--cursor-light-alpha', '0');
      }
    }
  }

  // ============================================================
  // ANIMATION LOOP
  // ============================================================
  const clock = new THREE.Clock();
  let isPageVisible = true;
  let frameCounter = 0;

  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
    if (isPageVisible) clock.start();
  });

  function animate() {
    requestAnimationFrame(animate);
    if (!isPageVisible) return;

    const time = clock.getElapsedTime();
    frameCounter++;

    // Smooth mouse lerp
    mouse.x += (mouse.targetX - mouse.x) * 0.065;
    mouse.y += (mouse.targetY - mouse.y) * 0.065;

    // Decay sculpture pulse energy
    pulseEnergy *= 0.93;

    // ---- 1. SCROLL-LINKED CAMERA FLIGHT (Z-Axis Flight + 3-Axis Banking Rotation) ----
    // Flies forward from z = +28m (Hero) down to z = -42m (Contact) through 3D space
    const flightZ = 28.0 - scrollProgress * 70.0;
    const flightX = Math.sin(scrollProgress * Math.PI * 2.0) * 3.2 + mouse.x * 2.4;
    const flightY = Math.cos(scrollProgress * Math.PI * 1.5) * 1.8 - scrollProgress * 4.5 + mouse.y * 1.8;

    camera.position.x += (flightX - camera.position.x) * 0.075;
    camera.position.y += (flightY - camera.position.y) * 0.075;
    camera.position.z += (flightZ - camera.position.z) * 0.075;

    // Scroll-linked 3-axis camera rotation (pitch, yaw, and banked roll)
    const targetPitch = -mouse.y * 0.08 + Math.sin(scrollProgress * Math.PI * 2) * 0.045;
    const targetYaw = -mouse.x * 0.1 + Math.cos(scrollProgress * Math.PI * 1.5) * 0.06;
    const targetRoll = Math.sin(scrollProgress * Math.PI * 2.5) * 0.075 + mouse.x * 0.04;

    camera.rotation.x += (targetPitch - camera.rotation.x) * 0.07;
    camera.rotation.y += (targetYaw - camera.rotation.y) * 0.07;
    camera.rotation.z += (targetRoll - camera.rotation.z) * 0.07;

    // ---- 2. RAYCAST SHARED CURSOR POINT-LIGHT IN 3D WORLD SPACE ----
    projectionPlane.constant = -(camera.position.z - 16.0);
    mouseNDC.set(mouse.x, mouse.y);
    raycaster.setFromCamera(mouseNDC, camera);
    raycaster.ray.intersectPlane(projectionPlane, mouseWorld);
    if (mouseWorld) {
      cursorPointLight.position.set(mouseWorld.x, mouseWorld.y, camera.position.z - 12.0);
    }

    // Orbit secondary accent light relative to camera flight Z
    accentLight.position.x = Math.sin(time * 0.45) * 14;
    accentLight.position.y = Math.cos(time * 0.35) * 10;
    accentLight.position.z = camera.position.z - 14 + Math.sin(time * 0.5) * 4;

    // ---- 3. ANIMATE RIGHT-40% HERO 3D FOCAL SCULPTURE ----
    const baseHeroX = getHeroSculptureBaseX();
    const baseHeroY = getHeroSculptureBaseY();
    const modeSpeed = sculptureMode === 'vortex' ? 2.1 : (sculptureMode === 'lattice' ? 1.45 : 1.0);

    heroCoreGroup.position.x += (baseHeroX + mouse.x * 0.85 - heroCoreGroup.position.x) * 0.08;
    heroCoreGroup.position.y += (baseHeroY + Math.sin(time * 1.1) * 0.28 + mouse.y * 0.65 - heroCoreGroup.position.y) * 0.08;

    heroCoreGroup.rotation.y = time * 0.22 * modeSpeed + mouse.x * 0.55;
    heroCoreGroup.rotation.x = Math.sin(time * 0.25) * 0.2 - mouse.y * 0.45;

    nucleusMesh.rotation.y = -time * 0.32 * modeSpeed;
    nucleusMesh.rotation.z = time * 0.18;
    const pulseScale = 1 + pulseEnergy * 0.32 + Math.sin(time * 2.2) * 0.03;
    nucleusMesh.scale.setScalar(pulseScale);

    kernelMesh.rotation.x = -time * 0.6 * modeSpeed;
    kernelMesh.rotation.y = time * 0.5 * modeSpeed;
    kernelMesh.scale.setScalar(1 + pulseEnergy * 0.45);

    cageMesh.rotation.x = time * 0.24 * modeSpeed;
    cageMesh.rotation.y = time * 0.28 * modeSpeed;
    cageMesh.scale.setScalar(sculptureMode === 'lattice' ? 1.16 : 1.0 + pulseEnergy * 0.2);

    ring1.rotation.z = time * 0.38 * modeSpeed;
    ring2.rotation.x = -time * 0.32 * modeSpeed;
    ring3.rotation.y = time * 0.26 * modeSpeed;

    // Orbiting satellite nodes
    const nodeAngle = time * 1.65 * modeSpeed;
    orbitalNode.position.set(
      Math.cos(nodeAngle) * 3.35,
      Math.sin(nodeAngle) * 3.35 * Math.cos(Math.PI * 0.32),
      Math.sin(nodeAngle) * 3.35 * Math.sin(Math.PI * 0.32)
    );
    const nodeAngle2 = -time * 1.35 * modeSpeed;
    orbitalNode2.position.set(
      Math.cos(nodeAngle2) * 4.05 * Math.cos(Math.PI * 0.45),
      Math.sin(nodeAngle2) * 4.05,
      Math.cos(nodeAngle2) * 4.05 * Math.sin(Math.PI * 0.45)
    );
    const nodeAngle3 = time * 1.1 * modeSpeed;
    orbitalNode3.position.set(
      Math.cos(nodeAngle3) * 4.75,
      Math.sin(nodeAngle3) * 4.75 * Math.sin(Math.PI * 0.22),
      Math.sin(nodeAngle3) * 4.75 * Math.cos(Math.PI * 0.22)
    );

    // Rotate corridor waypoint rings as camera flies through them
    for (let w = 0; w < waypointRings.length; w++) {
      waypointRings[w].rotation.z = time * (0.08 + w * 0.02) * (w % 2 === 0 ? 1 : -1);
    }

    // ---- 4. MORPHING PARTICLE STATES + CURSOR REPULSION PHYSICS ----
    // Determine weights across Sphere (Hero), Helix (About), Data Grid (Skills), and Torus (Projects/Contact)
    let wSphere = 0;
    let wHelix = 0;
    let wGrid = 0;
    let wTorus = 0;
    let activeStateLabel = 'SPHERE_MESH';

    if (skillsFocusWeight > 0.15) {
      // Snap cleanly into Structured 3D Data Grid over Skills section
      wGrid = Math.min(1, skillsFocusWeight * 1.25);
      const rem = 1 - wGrid;
      if (scrollProgress < 0.32) {
        wHelix = rem;
      } else {
        wTorus = rem;
      }
      activeStateLabel = wGrid > 0.45 ? 'DATA_GRID_3D' : 'HELIX_STREAM';
    } else if (scrollProgress < 0.16) {
      const t = scrollProgress / 0.16;
      wSphere = 1 - t;
      wHelix = t;
      activeStateLabel = 'SPHERE_MESH';
    } else if (scrollProgress < 0.32) {
      const t = (scrollProgress - 0.16) / 0.16;
      wHelix = 1 - t;
      wGrid = t;
      activeStateLabel = t > 0.5 ? 'DATA_GRID_3D' : 'HELIX_STREAM';
    } else if (scrollProgress < 0.58) {
      const t = (scrollProgress - 0.32) / 0.26;
      wGrid = 1 - t;
      wTorus = t;
      activeStateLabel = wGrid >= 0.4 ? 'DATA_GRID_3D' : 'TORUS_LATTICE';
    } else {
      wTorus = 1;
      activeStateLabel = 'TORUS_LATTICE';
    }

    // Update Hero Telemetry Dock HUD
    if (frameCounter % 4 === 0) {
      if (hudParticleStateEl) {
        hudParticleStateEl.textContent = `STATE: ${activeStateLabel}`;
      }
      if (hudCameraCoordsEl) {
        const zSign = camera.position.z >= 0 ? '+' : '';
        hudCameraCoordsEl.textContent = `CAM Z: ${zSign}${camera.position.z.toFixed(1)}m • FOG #030305`;
      }
    }

    const pPos = particleGeo.attributes.position.array;
    const REPULSION_RADIUS = 5.4 + pulseEnergy * 4.5;
    const REPULSION_RADIUS_SQ = REPULSION_RADIUS * REPULSION_RADIUS;
    const MAX_VELOCITY = 0.24;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;

      // Blended target position from Morph States
      let tx =
        morphSphere[idx] * wSphere +
        morphHelix[idx] * wHelix +
        morphGrid[idx] * wGrid +
        morphTorus[idx] * wTorus;
      let ty =
        morphSphere[idx + 1] * wSphere +
        morphHelix[idx + 1] * wHelix +
        morphGrid[idx + 1] * wGrid +
        morphTorus[idx + 1] * wTorus;
      let tz =
        morphSphere[idx + 2] * wSphere +
        morphHelix[idx + 2] * wHelix +
        morphGrid[idx + 2] * wGrid +
        morphTorus[idx + 2] * wTorus;

      // Harmonic wave modulation (crisp quantized pulse in DATA_GRID_3D, organic ripple in SPHERE_MESH)
      if (wGrid > 0.5) {
        ty += Math.sin(time * 1.4 + tx * 0.35 + tz * 0.25) * 0.28 * wGrid;
      } else {
        const modeAmp = sculptureMode === 'vortex' ? 1.45 : (sculptureMode === 'lattice' ? 0.45 : 0.85);
        ty += Math.sin(time * 0.75 + tx * 0.12) * 0.65 * modeAmp;
        tz += Math.cos(time * 0.6 + ty * 0.12) * 0.45 * modeAmp;
      }

      // Real-time 3D Cursor Point-Light Repulsion & Shockwave Physics
      const dx = pPos[idx] - mouseWorld.x;
      const dy = pPos[idx + 1] - mouseWorld.y;
      const dz = (pPos[idx + 2] - mouseWorld.z) * 0.35;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < REPULSION_RADIUS_SQ && distSq > 0.001) {
        const dist = Math.sqrt(distSq);
        const norm = 1 - dist / REPULSION_RADIUS;
        const force = norm * norm * (0.085 + pulseEnergy * 0.18);
        particleVelocities[idx] += (dx / dist) * force;
        particleVelocities[idx + 1] += (dy / dist) * force;

        particleVelocities[idx] = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, particleVelocities[idx]));
        particleVelocities[idx + 1] = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, particleVelocities[idx + 1]));
      }

      particleVelocities[idx] *= 0.86;
      particleVelocities[idx + 1] *= 0.86;

      // Snap faster when locking into the Skills Data Grid
      const lerpSpeed = wGrid > 0.5 ? 0.085 : 0.06;
      pPos[idx] += (tx - pPos[idx]) * lerpSpeed + particleVelocities[idx];
      pPos[idx + 1] += (ty - pPos[idx + 1]) * lerpSpeed + particleVelocities[idx + 1];
      pPos[idx + 2] += (tz - pPos[idx + 2]) * lerpSpeed;
    }
    particleGeo.attributes.position.needsUpdate = true;

    // Deep background cluster parallax behind UI
    deepStars.position.z = (camera.position.z - 28.0) * 0.35;
    deepStars.rotation.y = time * 0.005 + mouse.x * 0.04;
    deepStars.rotation.x = Math.sin(time * 0.004) * 0.03 - mouse.y * 0.03;

    // ---- 5. SECTION-CHOREOGRAPHED POINT LIGHT COLOR & HTML CARD BORDER SYNC ----
    if (isDark) {
      if (scrollProgress < 0.24) {
        cursorPointLight.color.lerp(new THREE.Color(0x00f0ff), 0.06);
        accentLight.color.lerp(new THREE.Color(0x3b82f6), 0.06);
      } else if (scrollProgress < 0.55) {
        cursorPointLight.color.lerp(new THREE.Color(0x10b981), 0.06);
        accentLight.color.lerp(new THREE.Color(0x06b6d4), 0.06);
      } else if (scrollProgress < 0.8) {
        cursorPointLight.color.lerp(new THREE.Color(0xf59e0b), 0.06);
        accentLight.color.lerp(new THREE.Color(0x818cf8), 0.06);
      } else {
        cursorPointLight.color.lerp(new THREE.Color(0x818cf8), 0.06);
        accentLight.color.lerp(new THREE.Color(0x38bdf8), 0.06);
      }
    }

    // Export current point-light RGB to shared state and update adjacent HTML card borders
    window.__sharedPointLight.r = Math.round(cursorPointLight.color.r * 255);
    window.__sharedPointLight.g = Math.round(cursorPointLight.color.g * 255);
    window.__sharedPointLight.b = Math.round(cursorPointLight.color.b * 255);
    syncHtmlCardPointLight();

    // Update constellation web and foreground bokeh layer
    updateConstellation();
    renderForegroundBokeh(time);

    renderer.render(scene, camera);
  }

  animate();

  // ============================================================
  // RESIZE HANDLER
  // ============================================================
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
    buildMorphStates();
    initForegroundBokeh();
    refreshTrackedCards();
  }, { passive: true });

  window.updateSceneTheme = function (theme) {
    isDark = theme ? theme === 'dark' : document.documentElement.getAttribute('data-theme') !== 'light';
    updateThemeColors();
  };

})();
