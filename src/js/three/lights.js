import * as THREE from 'three';

/** Warm festive lighting rig: ambient, hemisphere fill, shadow-casting key, gold rim. */
export function addLights(scene, { shadows = true, shadowSize = 1024 } = {}) {
  const ambient = new THREE.AmbientLight(0xc7b9d7, 0.55);
  const hemi = new THREE.HemisphereLight(0xfff0d0, 0x291542, 0.5);

  const key = new THREE.DirectionalLight(0xfff1d6, 2.3);
  key.position.set(4, 7, 5);
  if (shadows) {
    key.castShadow = true;
    key.shadow.mapSize.set(shadowSize, shadowSize);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 20;
    key.shadow.camera.left = -4;
    key.shadow.camera.right = 4;
    key.shadow.camera.top = 4;
    key.shadow.camera.bottom = -4;
    key.shadow.bias = -0.0005;
    key.shadow.radius = 4;
  }

  const rim = new THREE.PointLight(0xf5cc75, 18, 18, 2);
  rim.position.set(-4, 3, -3);

  scene.add(ambient, hemi, key, rim);
  return { ambient, hemi, key, rim };
}
