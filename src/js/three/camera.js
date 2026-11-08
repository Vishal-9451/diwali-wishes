import * as THREE from 'three';

export function createCamera(aspect = 1, { fov = 38, distance = 9.5, height = 2.6, lookY = 0.8 } = {}) {
  const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 60);
  camera.userData = { distance, height, lookY };
  fitCamera(camera, aspect);
  return camera;
}

/** Pull the camera back on narrow (portrait) viewports so the model never gets cropped. */
export function fitCamera(camera, aspect) {
  const { distance, height, lookY } = camera.userData;
  const factor = aspect < 1 ? 1 + (1 - aspect) * 0.95 : 1;
  camera.aspect = aspect;
  camera.position.set(0, height * factor, distance * factor);
  camera.lookAt(0, lookY, 0);
  camera.updateProjectionMatrix();
}
