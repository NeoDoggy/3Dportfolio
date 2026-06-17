import * as THREE from 'three';
import { RIPPLE_EFFECTS } from '../portfolio-config.js';

function createRippleMaterial() {
  return new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
}

export function createRippleController() {
  const rippleMeshes = [];

  function setup(model) {
    rippleMeshes.length = 0;

    for (const config of RIPPLE_EFFECTS) {
      const parent = model.getObjectByName(config.parentName) || model;
      const radius = config.radius * 0.5;
      const geometry = new THREE.RingGeometry(radius * 0.62, radius, 8);
      const ripple = new THREE.Mesh(geometry, createRippleMaterial());
      ripple.position.copy(config.position);
      ripple.rotation.copy(config.rotation);
      ripple.userData.phase = config.phase ?? 0;
      parent.add(ripple);
      rippleMeshes.push(ripple);
    }
  }

  function update(elapsed, isMusicActive) {
    for (const ripple of rippleMeshes) {
      if (!isMusicActive) {
        ripple.material.opacity = THREE.MathUtils.lerp(ripple.material.opacity, 0, 0.12);
        continue;
      }

      const progress = (elapsed * 0.55 + ripple.userData.phase) % 1;
      const scale = THREE.MathUtils.lerp(0.85, 2.8, progress);
      ripple.scale.setScalar(scale);
      ripple.material.opacity = Math.sin(progress * Math.PI) * 0.34;
    }
  }

  return { setup, update };
}
