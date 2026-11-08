import * as THREE from 'three';
import { glowTexture } from './particles.js';

/**
 * Procedural gift box: violet body, gold ribbon, hinged lid and a decorative bow.
 * Everything is built from primitives - no external model files are needed.
 */
export function createGiftModel() {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4a2380, roughness: 0.38, metalness: 0.25 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd6a84d, roughness: 0.22, metalness: 1 });
  const lidMat = new THREE.MeshStandardMaterial({ color: 0x5a2c99, roughness: 0.34, metalness: 0.28 });

  const mesh = (geo, mat, { cast = true, receive = true } = {}) => {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = cast;
    m.receiveShadow = receive;
    return m;
  };

  // Body + ribbons
  const bodyH = 1.5;
  const body = mesh(new THREE.BoxGeometry(2.2, bodyH, 2.2), bodyMat);
  body.position.y = bodyH / 2;
  group.add(body);
  const bandA = mesh(new THREE.BoxGeometry(0.4, bodyH + 0.01, 2.24), goldMat);
  const bandB = mesh(new THREE.BoxGeometry(2.24, bodyH + 0.01, 0.4), goldMat);
  bandA.position.y = bandB.position.y = bodyH / 2;
  group.add(bandA, bandB);

  // Inner glow revealed when the lid opens
  const glowMat = new THREE.MeshBasicMaterial({
    map: glowTexture(), color: 0xffe3a3, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), glowMat);
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = bodyH + 0.02;
  group.add(glow);

  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xf5cc75, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 0.7, 2.6, 32, 1, true), beamMat);
  beam.position.y = bodyH + 1.3;
  group.add(beam);

  const innerLight = new THREE.PointLight(0xffd27a, 0, 9, 2);
  innerLight.position.set(0, bodyH + 0.6, 0);
  group.add(innerLight);

  // Lid hinged at the back top edge
  const lid = new THREE.Group();
  lid.position.set(0, bodyH, -1.15);
  const lidH = 0.42;
  const lidMesh = mesh(new THREE.BoxGeometry(2.4, lidH, 2.4), lidMat);
  lidMesh.position.set(0, lidH / 2, 1.15);
  const lidBandA = mesh(new THREE.BoxGeometry(0.4, lidH + 0.01, 2.44), goldMat);
  const lidBandB = mesh(new THREE.BoxGeometry(2.44, lidH + 0.01, 0.4), goldMat);
  lidBandA.position.set(0, lidH / 2, 1.15);
  lidBandB.position.set(0, lidH / 2, 1.15);
  lid.add(lidMesh, lidBandA, lidBandB);

  // Bow: two loops, two tails and a knot
  const bow = new THREE.Group();
  bow.position.set(0, lidH, 1.15);
  const loopGeo = new THREE.TorusGeometry(0.42, 0.11, 16, 36);
  const loopL = mesh(loopGeo, goldMat);
  const loopR = mesh(loopGeo, goldMat);
  loopL.scale.set(1, 1.25, 0.8);
  loopR.scale.copy(loopL.scale);
  loopL.position.set(-0.42, 0.34, 0);
  loopR.position.set(0.42, 0.34, 0);
  loopL.rotation.set(0.2, 0.55, 0.45);
  loopR.rotation.set(0.2, -0.55, -0.45);
  const knot = mesh(new THREE.SphereGeometry(0.25, 24, 18), goldMat);
  knot.position.y = 0.2;
  const tailGeo = new THREE.BoxGeometry(0.26, 0.04, 0.9);
  const tailL = mesh(tailGeo, goldMat);
  const tailR = mesh(tailGeo, goldMat);
  tailL.position.set(-0.28, 0.05, 0.5);
  tailR.position.set(0.28, 0.05, 0.5);
  tailL.rotation.y = 0.35;
  tailR.rotation.y = -0.35;
  bow.add(loopL, loopR, knot, tailL, tailR);
  lid.add(bow);
  group.add(lid);

  // Floor: shadow catcher + soft gold halo
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.38 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  const halo = new THREE.Mesh(
    new THREE.CircleGeometry(2.9, 48),
    new THREE.MeshBasicMaterial({ map: glowTexture(), color: 0xd6a84d, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending })
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 0.005;

  return { group, floor, halo, lid, bow, glow, glowMat, beam, beamMat, innerLight, bodyH };
}
