import * as THREE from 'three';
import { CAMERA_HOME, MODEL_PLACEMENT } from '../portfolio-config.js';

const IDLE_RETURN_RATE = 2.1;
const ENTRY_FLY_IN_DURATION = 2.45;

function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function createCameraController({ camera, controls, screenController, onEntryComplete }) {
  const focusStartPosition = new THREE.Vector3();
  const focusStartTarget = new THREE.Vector3();
  const focusEndPosition = new THREE.Vector3();
  const focusEndTarget = new THREE.Vector3();
  const entryStartPosition = new THREE.Vector3(-9.2, 6.8, 12.4);
  const entryStartTarget = new THREE.Vector3((MODEL_PLACEMENT.offsetX ?? 0) - 0.35, 0.72, 0);

  let focusProgress = 1;
  let entryProgress = 1;
  let isOrbitDragging = false;
  let isScreenHovered = false;

  function setOrbitDragging(isDragging) {
    isOrbitDragging = isDragging;
  }

  function startFocusTransition(shouldFocus) {
    isScreenHovered = shouldFocus;
    focusProgress = 0;
    focusStartPosition.copy(camera.position);
    focusStartTarget.copy(controls.target);

    if (shouldFocus) {
      screenController.getFocusPosition(focusEndPosition);
      focusEndTarget.copy(screenController.position);
    } else {
      focusEndPosition.copy(CAMERA_HOME.position);
      focusEndTarget.copy(CAMERA_HOME.target);
    }
  }

  function updateFocus(delta) {
    if (focusProgress >= 1) return;

    focusProgress = Math.min(1, focusProgress + delta * 1.9);
    const easedProgress = easeInOutCubic(focusProgress);

    camera.position.lerpVectors(focusStartPosition, focusEndPosition, easedProgress);
    controls.target.lerpVectors(focusStartTarget, focusEndTarget, easedProgress);
  }

  function startEntryFlyIn() {
    isScreenHovered = false;
    focusProgress = 1;
    entryProgress = 0;
    controls.enabled = false;
    camera.position.copy(entryStartPosition);
    controls.target.copy(entryStartTarget);
    camera.lookAt(controls.target);
  }

  function updateEntryFlyIn(delta) {
    if (entryProgress >= 1) return false;

    entryProgress = Math.min(1, entryProgress + delta / ENTRY_FLY_IN_DURATION);
    const easedProgress = easeInOutCubic(entryProgress);

    camera.position.lerpVectors(entryStartPosition, CAMERA_HOME.position, easedProgress);
    controls.target.lerpVectors(entryStartTarget, CAMERA_HOME.target, easedProgress);
    camera.lookAt(controls.target);

    if (entryProgress >= 1) {
      camera.position.copy(CAMERA_HOME.position);
      controls.target.copy(CAMERA_HOME.target);
      controls.enabled = true;
      controls.update();
      onEntryComplete?.();
    }

    return true;
  }

  function updateIdleReturn(delta) {
    if (entryProgress < 1 || isOrbitDragging || isScreenHovered || focusProgress < 1) return;

    const returnAlpha = 1 - Math.exp(-IDLE_RETURN_RATE * delta);
    camera.position.lerp(CAMERA_HOME.position, returnAlpha);
    controls.target.lerp(CAMERA_HOME.target, returnAlpha);
  }

  function update(delta) {
    const isEntryActive = updateEntryFlyIn(delta);
    if (isEntryActive) return;

    updateFocus(delta);
    updateIdleReturn(delta);
    controls.update();
  }

  return {
    setOrbitDragging,
    startEntryFlyIn,
    startFocusTransition,
    update
  };
}
