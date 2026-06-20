import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { SCREEN_PLANES } from '../portfolio-config.js';

const SCREEN_CONTENT_WARM_IN_DELAY = 120;

export function createScreenController({ camera, cssScene, screenPortals }) {
  const focusViewDirection = new THREE.Vector3();
  const fallbackPosition = new THREE.Vector3();
  let screens = [];
  let focusScreen = null;

  function shuffleWords(words) {
    return [...words].sort(() => Math.random() - 0.5);
  }

  function updateTexture(textureBinding) {
    textureBinding?.update();
  }

  function createTerminalTicker(portal, config, textureBinding) {
    const lines = portal.querySelector('.screen-terminal-lines');
    if (!lines) return null;

    const words = config.terminalWords?.length
      ? config.terminalWords
      : ['SYSTEM', 'READY', 'ONLINE', 'MEMORY', 'SIGNAL'];

    function render() {
      const shuffled = shuffleWords(words);
      const lineCount = 7;
      lines.textContent = Array.from({ length: lineCount }, (_, index) => {
        const word = shuffled[index % shuffled.length];
        const address = Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0');
        const status = Math.random() > 0.28 ? 'OK' : 'WAIT';
        return `C:\\${word}> ${address} ${status}`;
      }).join('\n');
      updateTexture(textureBinding);
    }

    render();
    return window.setInterval(render, 640);
  }

  function createTerminalTextureBinding(portal, config) {
    const canvas = document.createElement('canvas');
    canvas.width = config.pixelWidth;
    canvas.height = config.pixelHeight;

    const context = canvas.getContext('2d');
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    let isPoweredOn = portal.classList.contains('is-powered-on');
    let powerOnStartedAt = isPoweredOn ? 0 : null;

    function getWarmInState() {
      if (!isPoweredOn) return { opacity: 0, brightness: 0.35, isAnimating: false };
      if (powerOnStartedAt === null) return { opacity: 1, brightness: 1, isAnimating: false };

      const elapsed = performance.now() - powerOnStartedAt - SCREEN_CONTENT_WARM_IN_DELAY;
      if (elapsed < 0) return { opacity: 0, brightness: 0.65, isAnimating: true };

      const progress = Math.min(elapsed / 840, 1);

      if (progress < 0.18) {
        return { opacity: 0, brightness: 0.65, isAnimating: true };
      }

      if (progress < 0.48) {
        const t = (progress - 0.18) / 0.3;
        return {
          opacity: THREE.MathUtils.lerp(0, 0.78, t),
          brightness: THREE.MathUtils.lerp(0.65, 1.22, t),
          isAnimating: true
        };
      }

      if (progress < 1) {
        const t = (progress - 0.48) / 0.52;
        return {
          opacity: THREE.MathUtils.lerp(0.78, 1, t),
          brightness: THREE.MathUtils.lerp(1.22, 1, t),
          isAnimating: true
        };
      }

      powerOnStartedAt = null;
      return { opacity: 1, brightness: 1, isAnimating: false };
    }

    function draw() {
      const warmIn = getWarmInState();
      const width = canvas.width;
      const height = canvas.height;
      const lines = portal.querySelector('.screen-terminal-lines')?.textContent.split('\n') || [];

      context.clearRect(0, 0, width, height);
      context.fillStyle = '#010301';
      context.fillRect(0, 0, width, height);

      if (warmIn.opacity > 0) {
        context.save();
        context.globalAlpha = warmIn.opacity;
        context.filter = `brightness(${warmIn.brightness}) contrast(1.08)`;

        const paddingX = 42;
        const paddingY = 34;
        const glowColor = 'rgba(184, 255, 177, 0.58)';

        const background = context.createLinearGradient(0, 0, 0, height);
        background.addColorStop(0, '#071607');
        background.addColorStop(0.48, '#041104');
        background.addColorStop(1, '#030c03');
        context.fillStyle = background;
        context.fillRect(0, 0, width, height);

        const upperGlow = context.createLinearGradient(0, 0, 0, height);
        upperGlow.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
        upperGlow.addColorStop(0.38, 'rgba(95, 255, 120, 0.055)');
        upperGlow.addColorStop(1, 'rgba(95, 255, 120, 0.025)');
        context.fillStyle = upperGlow;
        context.fillRect(0, 0, width, height);

        const vignette = context.createRadialGradient(
          width * 0.5,
          height * 0.48,
          height * 0.1,
          width * 0.5,
          height * 0.5,
          height * 0.78
        );
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.26)');
        context.fillStyle = vignette;
        context.fillRect(0, 0, width, height);

        context.shadowColor = glowColor;
        context.shadowBlur = 12;
        context.fillStyle = '#d7f5d2';
        context.fillRect(paddingX, paddingY + 5, 18, 18);

        context.shadowBlur = 8;
        context.font = '30px "MS Gothic", "Courier New", monospace';
        context.textBaseline = 'top';
        context.fillText('WIN_SYS.EXE', paddingX + 32, paddingY);

        context.shadowBlur = 0;
        context.strokeStyle = 'rgba(215, 245, 210, 0.32)';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(paddingX, paddingY + 48);
        context.lineTo(width - paddingX, paddingY + 48);
        context.stroke();

        context.shadowColor = glowColor;
        context.shadowBlur = 8;
        context.fillStyle = '#d7f5d2';
        context.font = '34px "MS Gothic", "Courier New", monospace';
        lines.forEach((line, index) => {
          context.fillText(line, paddingX, paddingY + 70 + index * 43);
        });

        const cursorVisible = Math.floor(performance.now() / 380) % 2 === 0;
        if (cursorVisible) {
          context.fillText('_', paddingX, paddingY + 70 + lines.length * 43);
        }

        context.restore();
      }

      context.fillStyle = 'rgba(0, 0, 0, 0.2)';
      context.fillRect(0, 0, width, 10);
      context.fillRect(0, height - 10, width, 10);
      context.fillRect(0, 0, 10, height);
      context.fillRect(width - 10, 0, 10, height);

      context.fillStyle = 'rgba(255, 255, 255, 0.045)';
      for (let y = 0; y < height; y += 4) {
        context.fillRect(0, y, width, 1);
      }

      texture.needsUpdate = true;
      return warmIn.isAnimating;
    }

    return {
      dispose: () => texture.dispose(),
      get isAnimating() {
        return powerOnStartedAt !== null;
      },
      powerOff: () => {
        isPoweredOn = false;
        powerOnStartedAt = null;
        draw();
      },
      powerOn: () => {
        isPoweredOn = true;
        powerOnStartedAt = performance.now();
        draw();
      },
      texture,
      update: draw
    };
  }

  function createIframeTextureBinding(portal, config) {
    const canvas = document.createElement('canvas');
    canvas.width = config.pixelWidth;
    canvas.height = config.pixelHeight;

    const context = canvas.getContext('2d');
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    let isPoweredOn = portal.classList.contains('is-powered-on');
    let refreshUntil = 0;
    const frame = config.frameId ? portal.querySelector(`#${config.frameId}`) : null;

    function draw() {
      const width = canvas.width;
      const height = canvas.height;
      const isAnimating = performance.now() < refreshUntil;
      const pulse = isAnimating ? 0.5 + Math.sin(performance.now() * 0.018) * 0.5 : 0;

      context.clearRect(0, 0, width, height);
      context.fillStyle = '#030303';
      context.fillRect(0, 0, width, height);

      if (isPoweredOn) {
        const background = context.createLinearGradient(0, 0, width, height);
        background.addColorStop(0, '#111111');
        background.addColorStop(0.5, '#181818');
        background.addColorStop(1, '#060606');
        context.fillStyle = background;
        context.fillRect(0, 0, width, height);

        context.globalAlpha = 0.28 + pulse * 0.1;
        context.fillStyle = '#f2f2f2';
        context.fillRect(0, 0, width, 18);
        context.globalAlpha = 1;

        context.fillStyle = 'rgba(255, 255, 255, 0.055)';
        for (let y = 0; y < height; y += 4) {
          context.fillRect(0, y, width, 1);
        }

        const glow = context.createRadialGradient(
          width * 0.52,
          height * 0.45,
          height * 0.08,
          width * 0.52,
          height * 0.48,
          height * 0.78
        );
        glow.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        context.fillStyle = glow;
        context.fillRect(0, 0, width, height);
      }

      context.fillStyle = 'rgba(0, 0, 0, 0.24)';
      context.fillRect(0, 0, width, 12);
      context.fillRect(0, height - 12, width, 12);
      context.fillRect(0, 0, 12, height);
      context.fillRect(width - 12, 0, 12, height);

      texture.needsUpdate = true;
      return isAnimating;
    }

    const refreshFor = (duration) => {
      refreshUntil = Math.max(refreshUntil, performance.now() + duration);
      draw();
    };
    const handleFrameLoad = () => refreshFor(1200);

    frame?.addEventListener('load', handleFrameLoad);
    draw();

    return {
      dispose: () => {
        frame?.removeEventListener('load', handleFrameLoad);
        texture.dispose();
      },
      get isAnimating() {
        return performance.now() < refreshUntil;
      },
      powerOff: () => {
        isPoweredOn = false;
        refreshUntil = 0;
        draw();
      },
      powerOn: () => {
        isPoweredOn = true;
        refreshFor(920);
      },
      texture,
      update: draw
    };
  }

  function createTextureBinding(portal, config) {
    if (config.type === 'terminal') return createTerminalTextureBinding(portal, config);
    if (config.type === 'iframe') return createIframeTextureBinding(portal, config);

    const texture = new THREE.HTMLTexture(portal);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    return {
      dispose: () => texture.dispose(),
      texture,
      update: () => {
        texture.needsUpdate = true;
      },
      powerOff: () => {
        texture.needsUpdate = true;
      },
      powerOn: () => {
        texture.needsUpdate = true;
      }
    };
  }

  function fitGeometryUvToTexture(mesh, config) {
    const sourceUv = mesh.geometry?.attributes?.uv;
    if (!sourceUv) return;

    const geometry = mesh.geometry.clone();
    const uv = geometry.attributes.uv;
    const min = new THREE.Vector2(Infinity, Infinity);
    const max = new THREE.Vector2(-Infinity, -Infinity);

    for (let index = 0; index < uv.count; index += 1) {
      min.x = Math.min(min.x, uv.getX(index));
      min.y = Math.min(min.y, uv.getY(index));
      max.x = Math.max(max.x, uv.getX(index));
      max.y = Math.max(max.y, uv.getY(index));
    }

    const size = new THREE.Vector2(Math.max(max.x - min.x, 0.0001), Math.max(max.y - min.y, 0.0001));
    for (let index = 0; index < uv.count; index += 1) {
      let u = (uv.getX(index) - min.x) / size.x;
      let v = (uv.getY(index) - min.y) / size.y;

      if (config.textureFlipX) u = 1 - u;
      if (config.textureFlipY) v = 1 - v;

      uv.setXY(index, u, v);
    }

    uv.needsUpdate = true;
    mesh.geometry = geometry;
  }

  function applyHTMLTexture(model, portal, config) {
    const textureBinding = createTextureBinding(portal, config);
    const { texture } = textureBinding;
    const textureTarget = config.textureObjectName ? model.getObjectByName(config.textureObjectName) : model;
    const targetRoot = textureTarget || model;
    const allowObjectMatch = Boolean(textureTarget && config.textureObjectName);

    let applied = false;
    targetRoot.traverse((child) => {
      if (!child.isMesh) return;

      const materials = Array.isArray(child.material) ? child.material : [child.material];
      let childChanged = false;
      const nextMaterials = materials.map((material) => {
        const isMaterialMatch = !config.textureMaterialName || material?.name === config.textureMaterialName;
        if (!material || (!allowObjectMatch && !isMaterialMatch)) return material;

        const screenMaterial = material.clone();
        screenMaterial.map = texture;
        screenMaterial.color?.set(0xffffff);
        screenMaterial.side = THREE.DoubleSide;
        if ('toneMapped' in screenMaterial) screenMaterial.toneMapped = false;
        screenMaterial.needsUpdate = true;
        childChanged = true;
        applied = true;
        return screenMaterial;
      });

      if (childChanged) {
        fitGeometryUvToTexture(child, config);
        child.material = Array.isArray(child.material) ? nextMaterials : nextMaterials[0];
      }
    });

    if (!applied && config.textureObjectName) {
      model.traverse((child) => {
        if (applied || !child.isMesh) return;
        if (child.name !== config.textureObjectName && child.geometry?.name !== config.textureObjectName) return;

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        const nextMaterials = materials.map((material) => {
          if (!material) return material;

          const screenMaterial = material.clone();
          screenMaterial.map = texture;
          screenMaterial.color?.set(0xffffff);
          screenMaterial.side = THREE.DoubleSide;
          if ('toneMapped' in screenMaterial) screenMaterial.toneMapped = false;
          screenMaterial.needsUpdate = true;
          applied = true;
          return screenMaterial;
        });

        if (applied) {
          fitGeometryUvToTexture(child, config);
          child.material = Array.isArray(child.material) ? nextMaterials : nextMaterials[0];
        }
      });
    }

    if (!applied) {
      textureBinding.dispose();
      throw new Error(`Missing screen texture target/material: ${config.textureObjectName || '*'} / ${config.textureMaterialName}`);
    }

    return textureBinding;
  }

  function createScreenInstance(model, config) {
    const portal = screenPortals.find((element) => element.id === config.elementId);
    if (!portal) {
      throw new Error(`Missing screen portal element: #${config.elementId}`);
    }

    const target = model.getObjectByName(config.parentName) || model;
    portal.style.width = `${config.pixelWidth}px`;
    portal.style.height = `${config.pixelHeight}px`;
    const textureBinding = config.textureMaterialName ? applyHTMLTexture(model, portal, config) : null;
    const texture = textureBinding?.texture || null;
    const object = texture && config.type !== 'iframe' ? null : new CSS3DObject(portal);
    const localMatrix = new THREE.Matrix4();

    portal.classList.toggle('is-material-backed', Boolean(texture && config.hideCssOverlay));

    if (object) {
      object.scale.set(
        config.width / config.pixelWidth,
        config.height / config.pixelHeight,
        1
      );
      cssScene.add(object);
    }

    localMatrix.compose(
      config.position,
      new THREE.Quaternion().setFromEuler(config.rotation),
      object?.scale || new THREE.Vector3(1, 1, 1)
    );

    return {
      config,
      cameraDirection: new THREE.Vector3(),
      localMatrix,
      normal: new THREE.Vector3(),
      object,
      portal,
      target,
      textureBinding,
      terminalTicker: config.type === 'terminal' ? createTerminalTicker(portal, config, textureBinding) : null,
      texture,
      worldMatrix: new THREE.Matrix4(),
      worldPosition: new THREE.Vector3(),
      worldQuaternion: new THREE.Quaternion(),
      worldScale: new THREE.Vector3()
    };
  }

  function setup(model) {
    screens.forEach((screen) => {
      if (screen.terminalTicker) window.clearInterval(screen.terminalTicker);
      if (screen.textureBinding) screen.textureBinding.dispose();
      if (screen.object) cssScene.remove(screen.object);
    });
    screens = SCREEN_PLANES.map((config) => createScreenInstance(model, config));
    focusScreen = screens.find((screen) => screen.config.focusTarget) || screens[0] || null;
  }

  function powerOff() {
    screens.forEach((screen) => {
      screen.portal.classList.remove('is-powered-on');
      screen.textureBinding?.powerOff();
    });
  }

  function powerOn() {
    screens.forEach((screen) => {
      screen.portal.classList.add('is-powered-on');
      screen.textureBinding?.powerOn();
    });
  }

  function update() {
    screens.forEach((screen) => {
      screen.target.updateWorldMatrix(true, false);
      screen.worldMatrix.multiplyMatrices(screen.target.matrixWorld, screen.localMatrix);
      screen.worldMatrix.decompose(screen.worldPosition, screen.worldQuaternion, screen.worldScale);

      if (screen.object) {
        screen.object.position.copy(screen.worldPosition);
        screen.object.quaternion.copy(screen.worldQuaternion);
        screen.object.scale.copy(screen.worldScale);
      }

      screen.normal.set(0, 0, 1).applyQuaternion(screen.worldQuaternion).normalize();
      screen.cameraDirection.subVectors(camera.position, screen.worldPosition).normalize();
      screen.portal.classList.toggle('is-facing-away', screen.normal.dot(screen.cameraDirection) < 0.05);
      if (screen.textureBinding?.isAnimating) {
        screen.textureBinding.update();
      }
    });
  }

  function getFocusPosition(target) {
    if (!focusScreen) return target;

    focusViewDirection
      .copy(focusScreen.normal)
      .multiplyScalar(focusScreen.normal.dot(focusScreen.cameraDirection) >= 0 ? 1 : -1);
    return target.copy(focusScreen.worldPosition).addScaledVector(focusViewDirection, 2.55);
  }

  return {
    getFocusPosition,
    get position() {
      return focusScreen?.worldPosition || fallbackPosition;
    },
    powerOff,
    powerOn,
    setup,
    update
  };
}
