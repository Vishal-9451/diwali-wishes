import * as THREE from 'three';

let sharedSprite = null;
/** Soft round golden sprite texture, generated once with the Canvas API. */
export function glowTexture() {
  if (sharedSprite) return sharedSprite;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,248,235,1)');
  grad.addColorStop(0.25, 'rgba(245,204,117,0.85)');
  grad.addColorStop(1, 'rgba(214,168,77,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  sharedSprite = new THREE.CanvasTexture(c);
  sharedSprite.colorSpace = THREE.SRGBColorSpace;
  return sharedSprite;
}
export const disposeGlowTexture = () => { sharedSprite?.dispose(); sharedSprite = null; };

function makePoints(count, size, opacity = 1) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  const mat = new THREE.PointsMaterial({
    map: glowTexture(), size, transparent: true, opacity, depthWrite: false,
    blending: THREE.AdditiveBlending, color: 0xf5cc75, sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  return points;
}

/** Slowly drifting ambient golden dust. */
export function createGoldDust({ count = 90, radius = 4.5, height = 5 } = {}) {
  const points = makePoints(count, 0.12, 0.8);
  const pos = points.geometry.attributes.position;
  const speed = new Float32Array(count);
  const phase = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * radius;
    pos.setXYZ(i, Math.cos(a) * r, Math.random() * height - 0.5, Math.sin(a) * r);
    speed[i] = 0.12 + Math.random() * 0.3;
    phase[i] = Math.random() * 6.28;
  }
  return {
    points,
    update(dt, t) {
      for (let i = 0; i < count; i += 1) {
        let y = pos.getY(i) + speed[i] * dt;
        if (y > height - 0.5) y = -0.5;
        pos.setXYZ(i, pos.getX(i) + Math.sin(t + phase[i]) * 0.1 * dt, y, pos.getZ(i));
      }
      pos.needsUpdate = true;
    },
  };
}

/** Burst emitter used when the gift opens. Fixed capacity, no allocations per frame. */
export function createBurst({ max = 220 } = {}) {
  const points = makePoints(max, 0.2, 1);
  const pos = points.geometry.attributes.position;
  const vel = new Float32Array(max * 3);
  const life = new Float32Array(max);
  let alive = 0;
  points.visible = false;

  return {
    points,
    emit(origin, n = 140, speed = 3.2) {
      points.visible = true;
      for (let i = 0; i < Math.min(n, max); i += 1) {
        const theta = Math.random() * Math.PI * 2;
        const up = 0.4 + Math.random() * 0.6;
        const s = speed * (0.4 + Math.random() * 0.8);
        pos.setXYZ(i, origin.x, origin.y, origin.z);
        vel[i * 3] = Math.cos(theta) * s * (1 - up * 0.5);
        vel[i * 3 + 1] = s * (0.6 + up);
        vel[i * 3 + 2] = Math.sin(theta) * s * (1 - up * 0.5);
        life[i] = 1 + Math.random() * 0.9;
      }
      alive = Math.min(n, max);
    },
    update(dt) {
      if (!alive) return;
      let any = false;
      for (let i = 0; i < alive; i += 1) {
        if (life[i] <= 0) { pos.setXYZ(i, 0, -50, 0); continue; }
        life[i] -= dt;
        vel[i * 3 + 1] -= 2.6 * dt;
        pos.setXYZ(i, pos.getX(i) + vel[i * 3] * dt, pos.getY(i) + vel[i * 3 + 1] * dt, pos.getZ(i) + vel[i * 3 + 2] * dt);
        any = true;
      }
      pos.needsUpdate = true;
      points.material.opacity = Math.max(0, Math.min(1, any ? points.material.opacity : 0));
      if (!any) { alive = 0; points.visible = false; }
    },
  };
}
