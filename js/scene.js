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
  renderer.toneMappingExposure = 1.15;

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

  // ---- Dynamic Lighting ----
  const ambientLight = new THREE.AmbientLight(isDark ? 0x24273a : 0xecf0f8, 0.8);
  scene.add(ambientLight);

  // Primary interactive light that tracks cursor
  const cursorPointLight = new THREE.PointLight(isDark ? 0x00f0ff : 0x4f46e5, 3.2, 45, 1.8);
  cursorPointLight.position.set(0, 0, 10);
  scene.add(cursorPointLight);

  // Orbiting secondary accent light (magenta/violet)
  const accentLight = new THREE.PointLight(isDark ? 0xa855f7 : 0x06b6d4, 2.5, 55, 1.6);
  accentLight.position.set(12, 10, 8);
  scene.add(accentLight);

  // Soft directional rim light
  const directionalLight = new THREE.DirectionalLight(isDark ? 0x818cf8 : 0x6366f1, 0.7);
  directionalLight.position.set(-15, 20, 15);
  scene.add(directionalLight);

  // ---- Raycasting for Mouse World Coordinates ----
  const raycaster = new THREE.Raycaster();
  const mouseNDC = new THREE.Vector2();
  const mouseWorld = new THREE.Vector3(0, 0, 0);
  const projectionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

  // ============================================================
  // 1. HERO 3D GYROSCOPIC CORE ("Cosmic Core")
  // ============================================================
  const heroCoreGroup = new THREE.Group();
  heroCoreGroup.position.set(0, 1.2, 0);

  // Crystal nucleus
  const nucleusGeo = new THREE.IcosahedronGeometry(2.0, 0);
  const nucleusMat = new THREE.MeshPhongMaterial({
    color: isDark ? 0x00f0ff : 0x6366f1,
    emissive: isDark ? 0x0b1e36 : 0x1e1b4b,
    specular: 0xffffff,
    shininess: 90,
    transparent: true,
    opacity: isDark ? 0.42 : 0.28,
    flatShading: true
  });
  const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
  heroCoreGroup.add(nucleusMesh);

  // Outer wireframe cage
  const cageGeo = new THREE.IcosahedronGeometry(2.35, 0);
  const cageMat = new THREE.MeshBasicMaterial({
    color: isDark ? 0x38bdf8 : 0x4f46e5,
    wireframe: true,
    transparent: true,
    opacity: isDark ? 0.65 : 0.45
  });
  const cageMesh = new THREE.Mesh(cageGeo, cageMat);
  heroCoreGroup.add(cageMesh);

  // 3 Concentric Gyroscopic Rings
  const ringMaterials = [
    new THREE.MeshBasicMaterial({ color: isDark ? 0x00f0ff : 0x3b82f6, transparent: true, opacity: 0.55 }),
    new THREE.MeshBasicMaterial({ color: isDark ? 0xa855f7 : 0x8b5cf6, transparent: true, opacity: 0.5 }),
    new THREE.MeshBasicMaterial({ color: isDark ? 0xec4899 : 0x06b6d4, transparent: true, opacity: 0.45 })
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

  // Orbiting energy node on ring 1
  const nodeGeo = new THREE.SphereGeometry(0.16, 12, 12);
  const nodeMat = new THREE.MeshBasicMaterial({ color: isDark ? 0xffffff : 0x00f0ff });
  const orbitalNode = new THREE.Mesh(nodeGeo, nodeMat);
  heroCoreGroup.add(orbitalNode);

  scene.add(heroCoreGroup);

  // ============================================================
  // 2. DUAL-LAYER FLOATING 3D SHAPES (Core + Wireframe Cage)
  // ============================================================
  const floatingObjects = [];

  const shapeGeometries = [
    new THREE.TorusKnotGeometry(1.1, 0.35, 80, 16),
    new THREE.OctahedronGeometry(1.5, 0),
    new THREE.TorusGeometry(1.4, 0.45, 16, 36),
    new THREE.DodecahedronGeometry(1.4, 0),
    new THREE.IcosahedronGeometry(1.5, 1),
    new THREE.TetrahedronGeometry(1.6, 0)
  ];

  const shapeHues = [0.55, 0.72, 0.85, 0.48, 0.65, 0.78]; // cyan, purple, magenta, teal, blue, violet

  const shapePositions = [
    { x: -14, y: 7, z: -5 },
    { x: 15, y: -3, z: -7 },
    { x: -10, y: -9, z: -4 },
    { x: 12, y: 9, z: -9 },
    { x: -16, y: -2, z: -8 },
    { x: 13, y: 4, z: -5 }
  ];

  shapeGeometries.forEach((geo, i) => {
    const group = new THREE.Group();
    const pos = shapePositions[i];
    group.position.set(pos.x, pos.y, pos.z);

    const hue = shapeHues[i];

    // Solid inner core
    const solidMat = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(hue, 0.8, isDark ? 0.55 : 0.45),
      emissive: new THREE.Color().setHSL(hue, 0.9, isDark ? 0.12 : 0.05),
      specular: 0xffffff,
      shininess: 80,
      transparent: true,
      opacity: isDark ? 0.35 : 0.22,
      flatShading: true
    });
    const coreMesh = new THREE.Mesh(geo, solidMat);
    group.add(coreMesh);

    // Outer wireframe shell
    const wireMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue, 0.9, isDark ? 0.75 : 0.55),
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.5 : 0.3
    });
    const wireMesh = new THREE.Mesh(geo, wireMat);
    wireMesh.scale.setScalar(1.12);
    group.add(wireMesh);

    group.userData = {
      basePos: { ...pos },
      rotSpeed: {
        x: (Math.random() - 0.5) * 0.006,
        y: (Math.random() - 0.5) * 0.008,
        z: (Math.random() - 0.5) * 0.004
      },
      floatSpeed: 0.4 + Math.random() * 0.5,
      floatAmp: 0.6 + Math.random() * 0.8,
      hue: hue,
      coreMat: solidMat,
      wireMat: wireMat
    };

    scene.add(group);
    floatingObjects.push(group);
  });

  // ============================================================
  // 3. DYNAMIC 3D PARTICLE WAVE SEA WITH PHYSICS
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
    ambientLight.color.set(isDark ? 0x24273a : 0xecf0f8);
    cursorPointLight.color.set(isDark ? 0x00f0ff : 0x4f46e5);
    accentLight.color.set(isDark ? 0xa855f7 : 0x06b6d4);
    directionalLight.color.set(isDark ? 0x818cf8 : 0x6366f1);

    nucleusMat.color.set(isDark ? 0x00f0ff : 0x6366f1);
    nucleusMat.emissive.set(isDark ? 0x0b1e36 : 0x1e1b4b);
    nucleusMat.opacity = isDark ? 0.42 : 0.28;

    cageMat.color.set(isDark ? 0x38bdf8 : 0x4f46e5);
    cageMat.opacity = isDark ? 0.65 : 0.45;

    ringMaterials[0].color.set(isDark ? 0x00f0ff : 0x3b82f6);
    ringMaterials[1].color.set(isDark ? 0xa855f7 : 0x8b5cf6);
    ringMaterials[2].color.set(isDark ? 0xec4899 : 0x06b6d4);

    particleMat.color.set(isDark ? 0xffffff : 0x4f46e5);
    particleMat.opacity = isDark ? 0.85 : 0.65;

    floatingObjects.forEach((obj) => {
      const d = obj.userData;
      d.coreMat.color.setHSL(d.hue, 0.8, isDark ? 0.55 : 0.45);
      d.coreMat.emissive.setHSL(d.hue, 0.9, isDark ? 0.12 : 0.05);
      d.coreMat.opacity = isDark ? 0.35 : 0.22;

      d.wireMat.color.setHSL(d.hue, 0.9, isDark ? 0.75 : 0.55);
      d.wireMat.opacity = isDark ? 0.5 : 0.3;
    });
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

    // Satellite node on ring 1
    const nodeAngle = time * 1.5;
    orbitalNode.position.set(
      Math.cos(nodeAngle) * 3.2,
      Math.sin(nodeAngle) * 3.2 * Math.cos(Math.PI * 0.3),
      Math.sin(nodeAngle) * 3.2 * Math.sin(Math.PI * 0.3)
    );

    // Hero Core response to scroll (fades and moves back as user scrolls past hero)
    heroCoreGroup.position.y = 1.2 - scrollProgress * 25;
    heroCoreGroup.position.z = -scrollProgress * 20;
    const heroScale = Math.max(0.1, 1 - scrollProgress * 1.6);
    heroCoreGroup.scale.setScalar(heroScale);
    heroCoreGroup.visible = heroScale > 0.08;

    // ---- Animate Floating Objects ----
    floatingObjects.forEach((obj) => {
      const d = obj.userData;
      obj.rotation.x += d.rotSpeed.x;
      obj.rotation.y += d.rotSpeed.y;
      obj.rotation.z += d.rotSpeed.z;

      // Vertical sine float
      obj.position.y = d.basePos.y + Math.sin(time * d.floatSpeed) * d.floatAmp;

      // Mouse Parallax depth
      obj.position.x = d.basePos.x + mouse.x * 2.2;
      obj.position.z = d.basePos.z + mouse.y * 1.4;
    });

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

    // Gently rotate particle galaxy
    particles.rotation.y = time * 0.012;
    particles.rotation.x = Math.sin(time * 0.01) * 0.05;

    // Camera 3D flight on scroll
    camera.position.y = -scrollProgress * 18;
    camera.position.z = 28 - Math.sin(scrollProgress * Math.PI) * 4;
    camera.rotation.z = Math.sin(scrollProgress * Math.PI) * 0.04;
    camera.lookAt(0, camera.position.y, 0);

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
