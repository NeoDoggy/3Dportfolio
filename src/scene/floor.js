import * as THREE from 'three';

function createFloorAlphaMap() {
  const size = 512;
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = size;
  textureCanvas.height = size;
  const context = textureCanvas.getContext('2d');
  const gradient = context.createRadialGradient(
    size * 0.5,
    size * 0.5,
    size * 0.02,
    size * 0.5,
    size * 0.5,
    size * 0.5
  );

  gradient.addColorStop(0, 'rgb(245, 245, 245)');
  gradient.addColorStop(0.2, 'rgb(220, 220, 220)');
  gradient.addColorStop(0.42, 'rgb(165, 165, 165)');
  gradient.addColorStop(0.64, 'rgb(96, 96, 96)');
  gradient.addColorStop(0.84, 'rgb(36, 36, 36)');
  gradient.addColorStop(1, 'rgb(0, 0, 0)');

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

export function createFloor() {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 12),
    new THREE.MeshStandardMaterial({
      color: 0x121212,
      roughness: 0.78,
      metalness: 0.02,
      transparent: true,
      alphaMap: createFloorAlphaMap(),
      depthWrite: false
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -0.95, 0);
  floor.receiveShadow = true;
  return floor;
}
