import * as THREE from 'three';
import { ACRYLIC_FOCUS, CAMERA_HOME } from '../portfolio-config.js';

const pointer = new THREE.Vector2();

export function createAcrylicHoverController({ camera, cameraController, canvas, getAcrylicModel }) {
  const box = new THREE.Box3();
  const center = new THREE.Vector3();
  const target = new THREE.Vector3();
  const cameraPosition = new THREE.Vector3();
  const viewDirection = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  let isHovered = false;
  let hoverStartX = 0;
  let hoverStartY = 0;

  function getFocusFrame(model) {
    box.setFromObject(model);
    box.getCenter(center);
    target.copy(center).add(ACRYLIC_FOCUS.targetOffset);
    viewDirection.subVectors(CAMERA_HOME.position, CAMERA_HOME.target).normalize();
    cameraPosition
      .copy(target)
      .addScaledVector(viewDirection, ACRYLIC_FOCUS.cameraDistance)
      .add(ACRYLIC_FOCUS.cameraOffset);

    return { cameraPosition, target };
  }

  function updateHover(nextHovered, model, event) {
    if (nextHovered === isHovered) return;
    isHovered = nextHovered;

    if (isHovered && model) {
      hoverStartX = event.clientX;
      hoverStartY = event.clientY;
      cameraController.startObjectFocus(getFocusFrame(model));
    } else {
      cameraController.endObjectFocus();
    }
  }

  function hasPointerMovedPastRelease(event) {
    const deltaX = event.clientX - hoverStartX;
    const deltaY = event.clientY - hoverStartY;
    return Math.hypot(deltaX, deltaY) >= (ACRYLIC_FOCUS.releasePointerMovePixels ?? 130);
  }

  function handlePointerMove(event) {
    if (!ACRYLIC_FOCUS.enabled) return;

    const model = getAcrylicModel();
    if (!model) return;

    if (isHovered && !hasPointerMovedPastRelease(event)) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const isHit = raycaster.intersectObject(model, true).length > 0;
    if (isHovered && isHit) {
      hoverStartX = event.clientX;
      hoverStartY = event.clientY;
      return;
    }

    updateHover(isHit, model, event);
  }

  function handlePointerLeave() {
    updateHover(false);
  }

  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerleave', handlePointerLeave);

  return {
    dispose() {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
    }
  };
}
