import * as THREE from 'three';
import { MODEL_PLACEMENT } from '../portfolio-config.js';

export function applyModelMaterials(object) {
  object.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
    if (child.material?.map) {
      child.material.map.colorSpace = THREE.SRGBColorSpace;
    }
  });
}

export function fitModelToScene(model) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = MODEL_PLACEMENT.targetHeight / Math.max(size.y, 0.001);

  model.scale.multiplyScalar(scale);

  const scaledCenter = center.multiplyScalar(scale);
  const scaledBox = new THREE.Box3().setFromObject(model);
  model.position.set(-scaledCenter.x, MODEL_PLACEMENT.floorY - scaledBox.min.y, -scaledCenter.z);
}
