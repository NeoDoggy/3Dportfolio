import * as THREE from 'three';
import { publicPath } from './public-path.js';

export const PORTFOLIO_URL = import.meta.env.VITE_PORTFOLIO_URL || 'https://neodoggy.org';

export const MODEL_PATH = publicPath(import.meta.env.VITE_COMPUTER_MODEL || 'models/computer.glb');
export const ACRYLIC_MODEL_PATH = publicPath(import.meta.env.VITE_ACRYLIC_MODEL || 'models/acrylic.glb');

export const CAMERA_HOME = {
  position: new THREE.Vector3(0.2, 1.15, 6.1),
  target: new THREE.Vector3(0, 0.15, 0)
};

export const CAMERA_CONTROLS = {
  dampingFactor: 0.065,
  enablePan: true,
  enableZoom: false,
  maxDistance: 11,
  minDistance: 1.85,
  panSpeed: 0.75,
  screenSpacePanning: true,
  panTargetBounds: {
    min: new THREE.Vector3(-0.35, -0.05, -0.35),
    max: new THREE.Vector3(0.35, 0.35, 0.35)
  },
  rotationLimits: {
    minAzimuthDegrees: -6.5,
    maxAzimuthDegrees: 9,
    minPolarOffsetDegrees: -6.5,
    maxPolarDegrees: 81
  }
};

export const MODEL_PLACEMENT = {
  targetHeight: 2.8,
  floorY: -0.95,
  offsetX: -0.55
};

export const SCENE_RENDERING = {
  backgroundColor: 0x050505,
  environmentIntensity: 0.18,
  fogDensity: 0.025,
  toneMappingExposure: 0.95
};

export const SCENE_LIGHTS = {
  ambient: {
    skyColor: 0xf2f2f2,
    groundColor: 0x111111,
    intensity: 1.05
  },
  key: {
    color: 0xffffff,
    intensity: 2.65,
    position: new THREE.Vector3(3.8, 5.5, 4.5),
    shadowMapSize: 2048
  },
  rim: {
    color: 0xffffff,
    intensity: 3.85,
    distance: 14,
    position: new THREE.Vector3(-3.5, 2.2, -2.5),
    pulseBase: 3.65,
    pulseSpeed: 2.2,
    pulseStrength: 0.3
  }
};

export const COMPUTER_MATERIAL = {
  envMapIntensity: 0,
  roughness: 0.62,
  specularIntensity: 0.55,
  useSceneEnvironment: true
};

export const ACRYLIC_PLACEMENT = {
  floorY: -0.925,
  position: new THREE.Vector3(-1.45, 0, 1.2),
  rotation: new THREE.Euler(0, THREE.MathUtils.degToRad(200), 0),
  scale: 0.18,
  center: true
};

export const ACRYLIC_FOCUS = {
  enabled: true,
  cameraDistance: 2.1,
  cameraOffset: new THREE.Vector3(0, 0.15, 0),
  releasePointerMovePixels: 250,
  targetOffset: new THREE.Vector3(0, 0.12, 0)
};

export const ACRYLIC_MATERIAL = {
  clearcoat: 0.35,
  clearcoatRoughness: 0.18,
  depthWrite: true,
  envMapIntensity: 0.55,
  ior: 1.28,
  opacity: 0.78,
  roughness: 0.04,
  specularIntensity: 0.42,
  transmission: 0.9,
  transparent: true,
  useSceneEnvironment: true
};

export const SCENE_MODELS = [
  {
    id: 'computer',
    path: MODEL_PATH,
    material: COMPUTER_MATERIAL,
    placement: MODEL_PLACEMENT
  },
  {
    id: 'acrylic',
    path: ACRYLIC_MODEL_PATH,
    material: ACRYLIC_MATERIAL,
    placement: ACRYLIC_PLACEMENT
  }
];

export const SCREEN_PLANES = [
  {
    id: 'portfolio',
    type: 'iframe',
    elementId: 'screen-portal',
    frameId: 'portfolio-frame',
    url: PORTFOLIO_URL,
    parentName: 'SM_Computer_Amo_MI_Computer_A2_0.geometry',
    pixelWidth: 1024,
    pixelHeight: 768,
    width: 0.365,
    height: 0.295,
    position: new THREE.Vector3(-0.008, 0.376, 0.195),
    rotation: new THREE.Euler(0, 0, 0),
    focusTarget: true
  },
  {
    id: 'computer-b',
    type: 'terminal',
    elementId: 'computer-b-screen-portal',
    parentName: 'SM_Computer_B_Monitor.mo_MI_Computer_B_0.001',
    pixelWidth: 1024,
    pixelHeight: 768,
    width: 0.33,
    height: 0.250,
    position: new THREE.Vector3(-0.555, 0.245, 0.1675),
    rotation: new THREE.Euler(-THREE.MathUtils.degToRad(5), THREE.MathUtils.degToRad(33), THREE.MathUtils.degToRad(3)),
    focusTarget: false,
    terminalWords: [
      'NEODOGGY',
      'SYSTEM',
      'MEMORY',
      'SIGNAL',
      'VECTOR',
      'PORTFOLIO',
      'DREAM',
      'RENDER',
      'BOOT',
      'ONLINE',
      'PATCH',
      'FRAME',
      'ORBIT',
      'ACCESS',
      'READY'
    ]
  }
];

export const SCREEN_PLANE = SCREEN_PLANES[0];

export const RIPPLE_EFFECTS = [
  {
    parentName: 'SM_Computer_Amo_MI_Computer_A1_0.geometry',
    position: new THREE.Vector3(-0.315, 0.12, 0.36),
    rotation: new THREE.Euler(0, THREE.MathUtils.degToRad(28), 0),
    radius: 0.06,
    phase: 0
  },
  {
    parentName: 'SM_Computer_Amo_MI_Computer_A1_0.geometry',
    position: new THREE.Vector3(0.43, 0.12, 0.20),
    rotation: new THREE.Euler(0, 0, 0),
    radius: 0.05,
    phase: 0.48
  }
];
