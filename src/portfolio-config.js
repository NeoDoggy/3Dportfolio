import * as THREE from 'three';

export const PORTFOLIO_URL = import.meta.env.VITE_PORTFOLIO_URL || 'https://neodoggy.org';

export const MODEL_PATH = import.meta.env.VITE_COMPUTER_MODEL || '/models/computer.glb';

export const CAMERA_HOME = {
  position: new THREE.Vector3(0.2, 1.15, 6.1),
  target: new THREE.Vector3(0, 0.15, 0)
};

export const MODEL_PLACEMENT = {
  targetHeight: 2.8,
  floorY: -0.95,
  offsetX: -0.55
};

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
