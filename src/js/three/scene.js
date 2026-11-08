import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createLoop, observeSize, cappedDpr, isSmallScreen } from '../utils/helpers.js';
import { createCamera, fitCamera } from './camera.js';
import { addLights } from './lights.js';

/**
 * Create a self-contained Three.js stage bound to a canvas.
 * Throws if WebGL cannot be created so callers can show the 2D fallback.
 */
export function createStage(canvas, { shadows = true, maxDpr = 1.75, camera: camOpts, environment = true, lights = true, onContextLost } = {}) {
  const small = isSmallScreen();
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !small,
    alpha: true,
    powerPreference: 'default',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = shadows;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setPixelRatio(cappedDpr(maxDpr));

  const scene = new THREE.Scene();
  const camera = createCamera(1, camOpts);

  let envTexture = null;
  if (environment) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    envTexture = pmrem.fromScene(room, 0.04).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 0.55;
    room.dispose?.();
    pmrem.dispose();
  }

  const rig = lights ? addLights(scene, { shadows, shadowSize: small ? 512 : 1024 }) : null;

  const frameFns = new Set();
  const loop = createLoop((dt, t) => {
    frameFns.forEach((fn) => fn(dt, t));
    renderer.render(scene, camera);
  });

  const stopObserve = observeSize(canvas.parentElement || canvas, (w, h) => {
    if (!w || !h) return;
    renderer.setPixelRatio(cappedDpr(maxDpr));
    renderer.setSize(w, h, false);
    fitCamera(camera, w / h);
    if (!loop.running) renderer.render(scene, camera);
  });

  const lostHandler = (e) => {
    e.preventDefault();
    loop.stop();
    onContextLost?.();
  };
  canvas.addEventListener('webglcontextlost', lostHandler);

  let disposed = false;
  return {
    THREE,
    renderer,
    scene,
    camera,
    rig,
    loop,
    onFrame(fn) {
      frameFns.add(fn);
      return () => frameFns.delete(fn);
    },
    start: () => loop.start(),
    stop: () => loop.stop(),
    renderOnce: () => renderer.render(scene, camera),
    /** Release every GPU resource: geometries, materials, textures, renderer. */
    dispose() {
      if (disposed) return;
      disposed = true;
      loop.destroy();
      stopObserve();
      canvas.removeEventListener('webglcontextlost', lostHandler);
      frameFns.clear();
      const seen = new Set();
      scene.traverse((obj) => {
        obj.geometry?.dispose?.();
        const mats = [].concat(obj.material || []);
        mats.forEach((m) => {
          if (!m || seen.has(m)) return;
          seen.add(m);
          for (const val of Object.values(m)) if (val && val.isTexture) val.dispose();
          m.dispose();
        });
      });
      envTexture?.dispose();
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss?.();
    },
  };
}
