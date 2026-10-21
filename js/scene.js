/* ============================================================
   COSMO — Three.js Scene (Particles + Floating Objects)
   ============================================================ */

(function () {
  'use strict';

  // Only run on desktop (>= 1024px)
  if (window.innerWidth < 1024 || !window.THREE) return;

  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  // ---- Scene Setup ----
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 30);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // ---- Mouse tracking ----
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  document.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ---- Scroll tracking ----
  let scrollProgress = 0;
  window.addEventListener('scroll', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = docHeight > 0 ? window.scrollY / docHeight : 0;
  });

  // ---- Theme tracking ----
  let isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const observer = new MutationObserver(() => {
    isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    updateThemeColors();
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // ---- Create Floating Objects ----
  const floatingObjects = [];

  function getObjectMaterial(hue) {
    return new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(hue, 0.7, isDark ? 0.6 : 0.5),
      transparent: true,
      opacity: isDark ? 0.3 : 0.2,
      wireframe: true,
    });
  }

  const geometries = [
    new THREE.IcosahedronGeometry(1.5, 0),
    new THREE.TorusGeometry(1.2, 0.4, 8, 24),
    new THREE.OctahedronGeometry(1.3, 0),
    new THREE.DodecahedronGeometry(1.2, 0),
    new THREE.TorusKnotGeometry(0.8, 0.3, 64, 8),
    new THREE.TetrahedronGeometry(1.4, 0),
  ];

  const hues = [0.65, 0.75, 0.85, 0.55, 0.70, 0.80]; // blue-purple range

  const objectPositions = [
    { x: -12, y: 6, z: -5 },
    { x: 14, y: -4, z: -8 },
    { x: -8, y: -7, z: -3 },
    { x: 10, y: 8, z: -10 },
    { x: -15, y: 0, z: -7 },
    { x: 13, y: 3, z: -4 },
  ];

  geometries.forEach((geo, i) => {
    const mat = getObjectMaterial(hues[i]);
    const mesh = new THREE.Mesh(geo, mat);
    const pos = objectPositions[i];
    mesh.position.set(pos.x, pos.y, pos.z);
    mesh.userData = {
      basePos: { ...pos },
      rotSpeed: { x: 0.001 + Math.random() * 0.003, y: 0.002 + Math.random() * 0.003 },
      floatSpeed: 0.3 + Math.random() * 0.5,
      floatAmp: 0.5 + Math.random() * 1,
      hue: hues[i]
    };
    scene.add(mesh);
    floatingObjects.push(mesh);
  });

  // ---- Create Particles ----
  const PARTICLE_COUNT = 1200;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
  const particleSizes = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 80;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 60;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 50 - 10;
    particleSizes[i] = Math.random() * 2 + 0.5;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

  const particleMat = new THREE.PointsMaterial({
    color: isDark ? 0xffffff : 0x6366f1,
    size: 0.08,
    transparent: true,
    opacity: isDark ? 0.6 : 0.4,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ---- Constellation Lines ----
  const MAX_CONNECTIONS = 80;
  const CONNECTION_DIST = 6;
  const lineGeo = new THREE.BufferGeometry();
  const linePositions = new Float32Array(MAX_CONNECTIONS * 6);
  const lineColors = new Float32Array(MAX_CONNECTIONS * 6);
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
  lineGeo.setDrawRange(0, 0);

  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const constellationLines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(constellationLines);

  // ---- Lighting ----
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0x818cf8, 0.5);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // ---- Update theme colors ----
  function updateThemeColors() {
    particleMat.color.set(isDark ? 0xffffff : 0x6366f1);
    particleMat.opacity = isDark ? 0.6 : 0.4;

    floatingObjects.forEach((obj) => {
      obj.material.color.setHSL(obj.userData.hue, 0.7, isDark ? 0.6 : 0.5);
      obj.material.opacity = isDark ? 0.3 : 0.2;
    });

    directionalLight.color.set(isDark ? 0x818cf8 : 0x6366f1);
  }

  // ---- Mouse-to-world projection for constellation ----
  const mouseWorld = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const mouseNDC = new THREE.Vector2();

  function updateConstellation() {
    mouseNDC.set(mouse.x, mouse.y);
    raycaster.setFromCamera(mouseNDC, camera);

    // Project mouse to a plane at z = -5
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 5);
    raycaster.ray.intersectPlane(plane, mouseWorld);

    const positions = particleGeo.attributes.position.array;
    const lp = lineGeo.attributes.position.array;
    const lc = lineGeo.attributes.color.array;
    let lineIdx = 0;

    for (let i = 0; i < PARTICLE_COUNT && lineIdx < MAX_CONNECTIONS; i++) {
      const px = positions[i * 3];
      const py = positions[i * 3 + 1];
      const pz = positions[i * 3 + 2];

      if (mouseWorld) {
        const dx = px - mouseWorld.x;
        const dy = py - mouseWorld.y;
        const dz = pz - mouseWorld.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < CONNECTION_DIST) {
          // Find nearby particles
          for (let j = i + 1; j < PARTICLE_COUNT && lineIdx < MAX_CONNECTIONS; j++) {
            const px2 = positions[j * 3];
            const py2 = positions[j * 3 + 1];
            const pz2 = positions[j * 3 + 2];

            const d = Math.sqrt(
              (px - px2) ** 2 + (py - py2) ** 2 + (pz - pz2) ** 2
            );

            if (d < CONNECTION_DIST * 0.7) {
              const alpha = 1 - d / (CONNECTION_DIST * 0.7);
              const idx = lineIdx * 6;
              lp[idx] = px; lp[idx + 1] = py; lp[idx + 2] = pz;
              lp[idx + 3] = px2; lp[idx + 4] = py2; lp[idx + 5] = pz2;

              const clr = isDark ? alpha : alpha * 0.5;
              lc[idx] = 0.5 * clr; lc[idx + 1] = 0.55 * clr; lc[idx + 2] = clr;
              lc[idx + 3] = 0.5 * clr; lc[idx + 4] = 0.55 * clr; lc[idx + 5] = clr;

              lineIdx++;
            }
          }
        }
      }
    }

    lineGeo.setDrawRange(0, lineIdx * 2);
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate = true;
  }

  // ---- Animation Loop ----
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Smooth mouse
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // Float + rotate objects
    floatingObjects.forEach((obj) => {
      const d = obj.userData;
      obj.rotation.x += d.rotSpeed.x;
      obj.rotation.y += d.rotSpeed.y;

      // Gentle floating
      obj.position.y = d.basePos.y + Math.sin(time * d.floatSpeed) * d.floatAmp;

      // Mouse parallax
      obj.position.x = d.basePos.x + mouse.x * 1.5;
      obj.position.z = d.basePos.z + mouse.y * 0.8;
    });

    // Scroll-driven camera movement
    camera.position.y = -scrollProgress * 15;
    camera.position.z = 30 - scrollProgress * 5;
    camera.lookAt(0, camera.position.y, 0);

    // Gently rotate particles
    particles.rotation.y = time * 0.02;
    particles.rotation.x = time * 0.01;

    // Update constellation
    updateConstellation();

    renderer.render(scene, camera);
  }

  animate();

  // ---- Resize Handler ----
  window.addEventListener('resize', () => {
    if (window.innerWidth < 1024) {
      canvas.style.display = 'none';
      return;
    }
    canvas.style.display = 'block';
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Expose theme update for app.js to call if needed
  window.updateSceneTheme = updateThemeColors;

})();
