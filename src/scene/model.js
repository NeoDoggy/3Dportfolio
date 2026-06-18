import * as THREE from 'three';

function applyMaterialOverrides(material, overrides) {
  if (!overrides) return;

  Object.entries(overrides).forEach(([key, value]) => {
    if (key === 'useSceneEnvironment') return;
    if (key in material) {
      material[key] = value;
    }
  });

  material.needsUpdate = true;
}

export function applyModelMaterials(object, materialOverrides, environmentMap) {
  object.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if (!material) return;
      if (material.map) {
        material.map.colorSpace = THREE.SRGBColorSpace;
      }
      if (materialOverrides?.useSceneEnvironment && environmentMap && 'envMap' in material) {
        material.envMap = environmentMap;
      }
      applyMaterialOverrides(material, materialOverrides);
    });
  });
}

function applyConfiguredScale(model, placement) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());

  if (placement.targetHeight) {
    model.scale.multiplyScalar(placement.targetHeight / Math.max(size.y, 0.001));
  }

  if (typeof placement.scale === 'number') {
    model.scale.multiplyScalar(placement.scale);
  } else if (placement.scale?.isVector3) {
    model.scale.multiply(placement.scale);
  }
}

export function placeModelInScene(model, placement = {}) {
  if (placement.rotation) {
    model.rotation.copy(placement.rotation);
  }

  applyConfiguredScale(model, placement);

  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const position = new THREE.Vector3();

  if (placement.center ?? true) {
    position.set(-center.x, 0, -center.z);
  }

  if (typeof placement.floorY === 'number') {
    position.y = placement.floorY - box.min.y;
  } else if (placement.center ?? true) {
    position.y = -center.y;
  }

  if (placement.position) {
    position.add(placement.position);
  }

  model.position.copy(position);
}
