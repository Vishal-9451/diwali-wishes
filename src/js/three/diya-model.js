import * as THREE from 'three';
import { glowTexture } from './particles.js';

/** Glowing brass diya with a flickering flame, built from a lathe profile. */
export function createDiyaModel() {
  const group = new THREE.Group();
  const gold = new THREE.MeshStandardMaterial({ color: 0xd6a84d, metalness: 1, roughness: 0.28 });

  const profile = [
    [0.0, 0.0], [0.55, 0.0], [0.9, 0.08], [1.3, 0.32], [1.52, 0.62], [1.62, 0.82],
    [1.5, 0.84], [1.36, 0.7], [1.0, 0.5], [0.55, 0.38], [0.0, 0.36],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const bowl = new THREE.Mesh(new THREE.LatheGeometry(profile, 48), gold);
  bowl.castShadow = true;
  group.add(bowl);

  // Spout for the wick
  const spout = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.7, 20), gold);
  spout.rotation.z = -Math.PI / 2.4;
  spout.position.set(1.55, 0.72, 0);
  group.add(spout);

  const oil = new THREE.Mesh(
    new THREE.CircleGeometry(1.15, 40),
    new THREE.MeshStandardMaterial({ color: 0x7a4a12, roughness: 0.15, metalness: 0.3 })
  );
  oil.rotation.x = -Math.PI / 2;
  oil.position.y = 0.42;
  group.add(oil);

  const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.4, 8), new THREE.MeshStandardMaterial({ color: 0x1a0f0a }));
  wick.position.set(0.1, 0.62, 0);
  group.add(wick);

  const flame = new THREE.Group();
  flame.position.set(0.1, 0.8, 0);
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 20, 16),
    new THREE.MeshBasicMaterial({ color: 0xfff1c9 })
  );
  core.scale.set(1, 2.1, 1);
  core.position.y = 0.22;
  const outer = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 20, 16),
    new THREE.MeshBasicMaterial({ color: 0xf5a623, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  outer.scale.set(1, 2.2, 1);
  outer.position.y = 0.26;
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xffd27a, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.scale.set(3.4, 3.4, 1);
  halo.position.y = 0.35;
  flame.add(outer, core, halo);
  group.add(flame);

  const light = new THREE.PointLight(0xffb347, 6, 10, 2);
  light.position.set(0.1, 1.2, 0.2);
  group.add(light);

  return {
    group,
    update(t) {
      const f = 1 + Math.sin(t * 9) * 0.05 + Math.sin(t * 17.3) * 0.04;
      flame.scale.set(1 / f, f, 1 / f);
      flame.rotation.z = Math.sin(t * 3.1) * 0.06;
      light.intensity = 5.2 + Math.sin(t * 11) * 0.7 + Math.sin(t * 23) * 0.4;
      halo.material.opacity = 0.7 + Math.sin(t * 7) * 0.12;
    },
  };
}
