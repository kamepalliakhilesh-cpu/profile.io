/* ============================================================
   COSMO — Advanced Three.js 3D Scene
   - Interactive Gyroscopic Hero Core
   - Dual-Layer Holographic Polyhedra (Core + Wireframe Cage)
   - Dynamic 3D Particle Wave Sea with Cursor Repulsion Physics
   - Real-time Cursor-Tracking Point Lights & Specular Highlights
   - Adaptive Performance & Responsive Sizing
   ============================================================ */

(function () {
  'use strict';

  if (!window.THREE) return;

  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  // Detect mobile/low-power device
  const isMobile = window.innerWidth < 768;
  const PARTICLE_COUNT = isMobile ? 1200 : 3500;
  const MAX_CONNECTIONS = isMobile ? 40 : 100;
  const CONNECTION_DIST = 5.2;

  // ---- Theme State ----
  let isDark = document.documentElement.getAttribute('data-theme') !== 'light';

  // ---- Scene & Camera Setup ----
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 28);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    precision: 'highp',
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 3));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  // ---- Mouse & Scroll Tracking ----
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0, speed: 0 };
  let lastMouseX = 0;
  let lastMouseY = 0;

  window.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;

    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;
    mouse.speed = Math.min(Math.sqrt(dx * dx + dy * dy) * 0.02, 3);
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  }, { passive: true });

  let scrollProgress = 0;
  function updateScroll() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = docHeight > 0 ? window.scrollY / docHeight : 0;
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  // ---- Theme Observer ----
  const themeObserver = new MutationObserver(() => {
    isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    updateThemeColors();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // ---- Dynamic Lighting (Unified Celestial Palette - No Harsh Side Pink/Blue Glare) ----
  const ambientLight = new THREE.AmbientLight(isDark ? 0x1e2238 : 0xecf0f8, 0.85);
  scene.add(ambientLight);

  // Primary interactive light that tracks cursor (Electric Cyan)
  const cursorPointLight = new THREE.PointLight(isDark ? 0x00f0ff : 0x4f46e5, 2.8, 40, 1.8);
  cursorPointLight.position.set(0, 0, 10);
  scene.add(cursorPointLight);

  // Subtle celestial sapphire rim light (balanced soft illumination)
  const accentLight = new THREE.PointLight(isDark ? 0x3b82f6 : 0x06b6d4, 1.2, 38, 2.0);
  accentLight.position.set(6, 6, 6);
  scene.add(accentLight);

  // Soft directional celestial light
  const directionalLight = new THREE.DirectionalLight(isDark ? 0x60a5fa : 0x6366f1, 0.45);
  directionalLight.position.set(-8, 14, 12);
  scene.add(directionalLight);

  // ---- Raycasting for Mouse World Coordinates ----
  const raycaster = new THREE.Raycaster();
  const mouseNDC = new THREE.Vector2();
  const mouseWorld = new THREE.Vector3(0, 0, 0);
  const projectionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

  // ============================================================
  // 1. HERO 3D GYROSCOPIC CORE ("Cosmic Core" with PBR Glass Refraction)
  // ============================================================
  const heroCoreGroup = new THREE.Group();
  heroCoreGroup.position.set(0, 1.2, 0);

  // Crystal nucleus: PBR Physical Glass with Transmission & Refraction
  const nucleusGeo = new THREE.IcosahedronGeometry(2.0, 0);
  const nucleusMat = new THREE.MeshPhysicalMaterial({
    color: isDark ? 0x00f0ff : 0x4f46e5,
    emissive: isDark ? 0x051b36 : 0x1e1b4b,
    roughness: 0.08,
    metalness: 0.1,
    transmission: 0.72,
    thickness: 2.4,
    ior: 1.55,
    transparent: true,
    opacity: isDark ? 0.82 : 0.6,
    flatShading: true
  });
  const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
  heroCoreGroup.add(nucleusMesh);

  // Outer wireframe cage
  const cageGeo = new THREE.IcosahedronGeometry(2.35, 0);
  const cageMat = new THREE.MeshBasicMaterial({
    color: isDark ? 0x38bdf8 : 0x6366f1,
    wireframe: true,
    transparent: true,
    opacity: isDark ? 0.72 : 0.5
  });
  const cageMesh = new THREE.Mesh(cageGeo, cageMat);
  heroCoreGroup.add(cageMesh);

  // 3 Concentric Gyroscopic Rings (Unified Cyan / Sapphire / Indigo Palette)
  const ringMaterials = [
    new THREE.MeshBasicMaterial({ color: isDark ? 0x00f0ff : 0x3b82f6, transparent: true, opacity: 0.6 }),
    new THREE.MeshBasicMaterial({ color: isDark ? 0x818cf8 : 0x6366f1, transparent: true, opacity: 0.55 }),
    new THREE.MeshBasicMaterial({ color: isDark ? 0x38bdf8 : 0x0d9488, transparent: true, opacity: 0.5 })
  ];

  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.045, 20, 128), ringMaterials[0]);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.9, 0.045, 20, 128), ringMaterials[1]);
  const ring3 = new THREE.Mesh(new THREE.TorusGeometry(4.6, 0.045, 20, 128), ringMaterials[2]);

  ring1.rotation.x = Math.PI * 0.3;
  ring2.rotation.y = Math.PI * 0.45;
  ring3.rotation.z = Math.PI * 0.2;

  heroCoreGroup.add(ring1);
  heroCoreGroup.add(ring2);
  heroCoreGroup.add(ring3);

  // Orbiting energy node on ring 1 (Cyan)
  const nodeGeo = new THREE.SphereGeometry(0.18, 16, 16);
  const nodeMat = new THREE.MeshBasicMaterial({ color: isDark ? 0xffffff : 0x00f0ff });
  const orbitalNode = new THREE.Mesh(nodeGeo, nodeMat);
  heroCoreGroup.add(orbitalNode);

  // Orbiting energy node on ring 2 (Sapphire Blue)
  const nodeGeo2 = new THREE.SphereGeometry(0.14, 16, 16);
  const nodeMat2 = new THREE.MeshBasicMaterial({ color: isDark ? 0x38bdf8 : 0x6366f1 });
  const orbitalNode2 = new THREE.Mesh(nodeGeo2, nodeMat2);
  heroCoreGroup.add(orbitalNode2);

  scene.add(heroCoreGroup);

  // ============================================================
  // 2. DYNAMIC 3D PARTICLE WAVE SEA WITH PHYSICS
  // ============================================================
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
  const particleBasePos = new Float32Array(PARTICLE_COUNT * 3);
  const particleVelocities = new Float32Array(PARTICLE_COUNT * 3);
  const particleSizes = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const x = (Math.random() - 0.5) * 95;
    const y = (Math.random() - 0.5) * 75;
    const z = (Math.random() - 0.5) * 55 - 6;

    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;

    particleBasePos[i * 3] = x;
    particleBasePos[i * 3 + 1] = y;
    particleBasePos[i * 3 + 2] = z;

    particleVelocities[i * 3] = 0;
    particleVelocities[i * 3 + 1] = 0;
    particleVelocities[i * 3 + 2] = 0;

    particleSizes[i] = Math.random() * 2.2 + 0.8;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

  // High-Resolution Crisp Particle Glow Texture
  function createParticleTexture() {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 128;
    pCanvas.height = 128;
    const ctx = pCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.22, 'rgba(255, 255, 255, 0.98)');
    grad.addColorStop(0.42, 'rgba(165, 180, 252, 0.9)');
    grad.addColorStop(0.68, 'rgba(99, 102, 241, 0.35)');
    grad.addColorStop(0.88, 'rgba(79, 70, 229, 0.1)');
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
    size: 0.22,
    map: particleTexture,
    transparent: true,
    opacity: isDark ? 0.92 : 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ============================================================
  // 3B. VOLUMETRIC DEEP-SPACE STARFIELD (Multi-Layer Parallax)
  // ============================================================
  const DEEP_STARS_COUNT = isMobile ? 350 : 1000;
  const deepStarGeo = new THREE.BufferGeometry();
  const deepStarPositions = new Float32Array(DEEP_STARS_COUNT * 3);
  for (let i = 0; i < DEEP_STARS_COUNT; i++) {
    deepStarPositions[i * 3] = (Math.random() - 0.5) * 160;
    deepStarPositions[i * 3 + 1] = (Math.random() - 0.5) * 130;
    deepStarPositions[i * 3 + 2] = -40 - Math.random() * 80;
  }
  deepStarGeo.setAttribute('position', new THREE.BufferAttribute(deepStarPositions, 3));
  const deepStarMat = new THREE.PointsMaterial({
    color: isDark ? 0xa5b4fc : 0x6366f1,
    size: 0.32,
    map: particleTexture,
    transparent: true,
    opacity: isDark ? 0.75 : 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const deepStars = new THREE.Points(deepStarGeo, deepStarMat);
  scene.add(deepStars);

  // ============================================================
  // 4. CONSTELLATION NEURAL WEB
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
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const constellationLines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(constellationLines);

  // ============================================================
  // THEME COLOR REFRESH
  // ============================================================
  function updateThemeColors() {
    ambientLight.color.set(isDark ? 0x1e2238 : 0xecf0f8);
    cursorPointLight.color.set(isDark ? 0x00f0ff : 0x4f46e5);
    accentLight.color.set(isDark ? 0x3b82f6 : 0x06b6d4);
    directionalLight.color.set(isDark ? 0x60a5fa : 0x6366f1);

    nucleusMat.color.set(isDark ? 0x00f0ff : 0x4f46e5);
    nucleusMat.emissive.set(isDark ? 0x051b36 : 0x1e1b4b);
    nucleusMat.opacity = isDark ? 0.82 : 0.6;

    cageMat.color.set(isDark ? 0x38bdf8 : 0x6366f1);
    cageMat.opacity = isDark ? 0.72 : 0.5;

    ringMaterials[0].color.set(isDark ? 0x00f0ff : 0x3b82f6);
    ringMaterials[1].color.set(isDark ? 0x818cf8 : 0x6366f1);
    ringMaterials[2].color.set(isDark ? 0x38bdf8 : 0x0d9488);

    particleMat.color.set(isDark ? 0xffffff : 0x4f46e5);
    particleMat.opacity = isDark ? 0.88 : 0.68;

    deepStarMat.color.set(isDark ? 0xa5b4fc : 0x6366f1);
    deepStarMat.opacity = isDark ? 0.75 : 0.5;
  }

  // ============================================================
  // UPDATE CONSTELLATION
  // ============================================================
  function updateConstellation() {
    if (isMobile) return;

    const pos = particleGeo.attributes.position.array;
    const lp = lineGeo.attributes.position.array;
    const lc = lineGeo.attributes.color.array;
    let lineIdx = 0;

    for (let i = 0; i < PARTICLE_COUNT && lineIdx < MAX_CONNECTIONS; i += 3) {
      const px = pos[i * 3];
      const py = pos[i * 3 + 1];
      const pz = pos[i * 3 + 2];

      const dx = px - mouseWorld.x;
      const dy = py - mouseWorld.y;
      const dz = pz - mouseWorld.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < CONNECTION_DIST) {
        for (let j = i + 1; j < PARTICLE_COUNT && lineIdx < MAX_CONNECTIONS; j += 4) {
          const px2 = pos[j * 3];
          const py2 = pos[j * 3 + 1];
          const pz2 = pos[j * 3 + 2];

          const d = Math.sqrt(
            (px - px2) ** 2 + (py - py2) ** 2 + (pz - pz2) ** 2
          );

          if (d < CONNECTION_DIST * 0.75) {
            const alpha = (1 - d / (CONNECTION_DIST * 0.75)) * (isDark ? 0.8 : 0.5);
            const idx = lineIdx * 6;

            lp[idx] = px; lp[idx + 1] = py; lp[idx + 2] = pz;
            lp[idx + 3] = px2; lp[idx + 4] = py2; lp[idx + 5] = pz2;

            const r = isDark ? 0.2 : 0.4;
            const g = isDark ? 0.85 : 0.5;
            const b = 1.0;

            lc[idx] = r * alpha; lc[idx + 1] = g * alpha; lc[idx + 2] = b * alpha;
            lc[idx + 3] = r * alpha; lc[idx + 4] = g * alpha; lc[idx + 5] = b * alpha;

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
  // ANIMATION LOOP
  // ============================================================
  const clock = new THREE.Clock();
  let isPageVisible = true;

  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
    if (isPageVisible) clock.start();
  });

  function animate() {
    requestAnimationFrame(animate);
    if (!isPageVisible) return;

    const time = clock.getElapsedTime();

    // Smooth mouse lerp
    mouse.x += (mouse.targetX - mouse.x) * 0.055;
    mouse.y += (mouse.targetY - mouse.y) * 0.055;

    // Update cursor world coordinates for this frame
    mouseNDC.set(mouse.x, mouse.y);
    raycaster.setFromCamera(mouseNDC, camera);
    raycaster.ray.intersectPlane(projectionPlane, mouseWorld);
    if (mouseWorld) {
      cursorPointLight.position.set(mouseWorld.x, mouseWorld.y, 6);
    }

    // Orbit secondary accent light
    accentLight.position.x = Math.sin(time * 0.4) * 16;
    accentLight.position.y = Math.cos(time * 0.3) * 12;
    accentLight.position.z = 8 + Math.sin(time * 0.5) * 4;

    // ---- Animate Hero Cosmic Core ----
    heroCoreGroup.rotation.y = time * 0.15 + mouse.x * 0.4;
    heroCoreGroup.rotation.x = Math.sin(time * 0.2) * 0.15 - mouse.y * 0.3;

    nucleusMesh.rotation.y = -time * 0.25;
    nucleusMesh.rotation.z = time * 0.12;

    cageMesh.rotation.x = time * 0.18;
    cageMesh.rotation.y = time * 0.22;

    ring1.rotation.z = time * 0.3;
    ring2.rotation.x = -time * 0.25;
    ring3.rotation.y = time * 0.2;

    // Satellite node on ring 1 (Cyan)
    const nodeAngle = time * 1.5;
    orbitalNode.position.set(
      Math.cos(nodeAngle) * 3.2,
      Math.sin(nodeAngle) * 3.2 * Math.cos(Math.PI * 0.3),
      Math.sin(nodeAngle) * 3.2 * Math.sin(Math.PI * 0.3)
    );

    // Satellite node on ring 2 (Counter-orbiting Magenta)
    const nodeAngle2 = -time * 1.2;
    orbitalNode2.position.set(
      Math.cos(nodeAngle2) * 3.9 * Math.cos(Math.PI * 0.45),
      Math.sin(nodeAngle2) * 3.9,
      Math.cos(nodeAngle2) * 3.9 * Math.sin(Math.PI * 0.45)
    );

    // Hero Core response to scroll (fades and moves back as user scrolls past hero)
    heroCoreGroup.position.y = 1.2 - scrollProgress * 25;
    heroCoreGroup.position.z = -scrollProgress * 20;
    const heroScale = Math.max(0.1, 1 - scrollProgress * 1.6);
    heroCoreGroup.scale.setScalar(heroScale);
    heroCoreGroup.visible = heroScale > 0.08;

    // ---- Dynamic 3D Particle Wave + Subtle Gentle Cursor Repulsion Physics ----
    const pPos = particleGeo.attributes.position.array;
    const REPULSION_RADIUS = 4.8;
    const REPULSION_RADIUS_SQ = REPULSION_RADIUS * REPULSION_RADIUS;
    const MAX_VELOCITY = 0.18;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      const bx = particleBasePos[idx];
      const by = particleBasePos[idx + 1];
      const bz = particleBasePos[idx + 2];

      // Gentle undulating wave
      const waveY = by + Math.sin(time * 0.6 + bx * 0.07) * 1.0 + Math.cos(time * 0.5 + bz * 0.07) * 0.7;
      const waveZ = bz + Math.cos(time * 0.45 + by * 0.06) * 0.6;

      // Subtle, refined cursor repulsion force
      const dx = pPos[idx] - mouseWorld.x;
      const dy = pPos[idx + 1] - mouseWorld.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < REPULSION_RADIUS_SQ && distSq > 0.001) {
        const dist = Math.sqrt(distSq);
        const norm = 1 - dist / REPULSION_RADIUS;
        // Smooth quadratic falloff: gentle whisper at edge, subtle nudge near center
        const force = norm * norm * 0.075;
        particleVelocities[idx] += (dx / dist) * force;
        particleVelocities[idx + 1] += (dy / dist) * force;

        // Clamp velocity so particles never scatter violently
        particleVelocities[idx] = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, particleVelocities[idx]));
        particleVelocities[idx + 1] = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, particleVelocities[idx + 1]));
      }

      // Smooth damping & elastic spring return back to wave rest position
      particleVelocities[idx] *= 0.86;
      particleVelocities[idx + 1] *= 0.86;

      pPos[idx] += (bx - pPos[idx]) * 0.055 + particleVelocities[idx];
      pPos[idx + 1] += (waveY - pPos[idx + 1]) * 0.055 + particleVelocities[idx + 1];
      pPos[idx + 2] += (waveZ - pPos[idx + 2]) * 0.03;
    }
    particleGeo.attributes.position.needsUpdate = true;

    // Gently rotate particle galaxy & deep starfield
    particles.rotation.y = time * 0.012;
    particles.rotation.x = Math.sin(time * 0.01) * 0.05;

    deepStars.rotation.y = time * 0.006 + mouse.x * 0.05;
    deepStars.rotation.x = Math.sin(time * 0.005) * 0.03 - mouse.y * 0.04;

    // ---- Feature 4: Choreographed 3D Camera Holographic Parallax & Dynamic Stage Tilt ----
    const targetCamX = Math.sin(scrollProgress * Math.PI * 1.5) * 5.0 + mouse.x * 3.4;
    const targetCamY = -scrollProgress * 26 + mouse.y * 2.5;
    const targetCamZ = 28 - Math.sin(scrollProgress * Math.PI) * 7.0;

    camera.position.x += (targetCamX - camera.position.x) * 0.065;
    camera.position.y += (targetCamY - camera.position.y) * 0.065;
    camera.position.z += (targetCamZ - camera.position.z) * 0.065;

    camera.rotation.z = Math.sin(scrollProgress * Math.PI * 1.2) * 0.06 + mouse.x * 0.035;
    camera.lookAt(mouse.x * 2.2, camera.position.y * 0.9, 0);

    // Dynamic light color choreography across page sections (Unified Celestial Space - No Harsh Pink/Blue Glare)
    if (isDark) {
      if (scrollProgress < 0.25) {
        // Hero: Electric Cyan & Deep Sapphire Blue (No Pink)
        cursorPointLight.color.lerp(new THREE.Color(0x00f0ff), 0.05);
        accentLight.color.lerp(new THREE.Color(0x3b82f6), 0.05);
      } else if (scrollProgress < 0.55) {
        // About & Skills: Emerald & Deep Teal
        cursorPointLight.color.lerp(new THREE.Color(0x10b981), 0.05);
        accentLight.color.lerp(new THREE.Color(0x06b6d4), 0.05);
      } else if (scrollProgress < 0.8) {
        // Projects & Badges: Amber & Soft Celestial Cyan
        cursorPointLight.color.lerp(new THREE.Color(0xf59e0b), 0.05);
        accentLight.color.lerp(new THREE.Color(0x0d9488), 0.05);
      } else {
        // Certs & Contact: Indigo & Cyan
        cursorPointLight.color.lerp(new THREE.Color(0x6366f1), 0.05);
        accentLight.color.lerp(new THREE.Color(0x38bdf8), 0.05);
      }
    }

    // Update constellation lines
    updateConstellation();

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 3));
  }, { passive: true });

  // Expose theme updater for manual toggle calls
  window.updateSceneTheme = function (theme) {
    isDark = theme ? theme === 'dark' : document.documentElement.getAttribute('data-theme') !== 'light';
    updateThemeColors();
  };

})();
