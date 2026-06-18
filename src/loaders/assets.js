import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { SCENE_MODELS, SCREEN_PLANES } from '../portfolio-config.js';
import { publicPath } from '../public-path.js';
import { applyModelMaterials, placeModelInScene } from '../scene/model.js';

export function createAssetLoader({ computerRoot, environmentMap, screenFrames, rippleController, screenController, ui, audio }) {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(publicPath('draco/'));
  const loadedModels = new Map();

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  function loadModel({ path, placement, material }, progressStart, progressEnd) {
    return new Promise((resolve, reject) => {
      gltfLoader.load(
        path,
        (gltf) => {
          const model = gltf.scene;
          applyModelMaterials(model, material, environmentMap);
          placeModelInScene(model, placement);
          computerRoot.add(model);
          ui.updateProgress(progressEnd);
          resolve(model);
        },
        (event) => {
          if (event.lengthComputable) {
            ui.updateProgress(progressStart + (event.loaded / event.total) * (progressEnd - progressStart));
          }
        },
        reject
      );
    });
  }

  async function loadSceneModels() {
    loadedModels.clear();
    const startProgress = 32;
    const endProgress = 82;
    const progressSpan = (endProgress - startProgress) / SCENE_MODELS.length;

    for (const [index, modelConfig] of SCENE_MODELS.entries()) {
      const progressStart = startProgress + progressSpan * index;
      const progressEnd = progressStart + progressSpan;
      ui.appendBootLine(`OK  loading model ${modelConfig.path}`);
      const model = await loadModel(modelConfig, progressStart, progressEnd);
      loadedModels.set(modelConfig.id, model);
    }

    const computerModel = loadedModels.get('computer');
    if (computerModel) {
      screenController.setup(computerModel);
      rippleController.setup(computerModel);
    }
  }

  function loadIframe() {
    const iframeScreens = SCREEN_PLANES.filter((screen) => screen.type === 'iframe');

    const frameLoads = iframeScreens.map((screen) => {
      const frame = screenFrames.find((element) => element.id === screen.frameId);
      if (!frame) {
        throw new Error(`Missing screen iframe element: #${screen.frameId}`);
      }

      return new Promise((resolve) => {
        const settle = () => {
          frame.removeEventListener('load', settle);
          resolve();
        };

        frame.addEventListener('load', settle, { once: true });
        frame.src = screen.url;
      });
    });

    return Promise.all(frameLoads).then(() => {
      ui.updateProgress(96);
    });
  }

  async function bootApplication() {
    ui.appendBootLine('C:\\PORTFOLIO> boot /sequence');
    ui.appendBootLine('OK  loading html/css/js shell');
    await ui.waitForAppShell();

    ui.appendBootLine('OK  loading fonts');
    await ui.waitForFonts();

    await loadSceneModels();

    ui.appendBootLine('OK  buffering background music');
    await audio.load();
    ui.updateProgress(88);

    ui.appendBootLine('OK  linking screen content');
    await loadIframe();

    ui.unlockEnter();
  }

  return {
    bootApplication,
    getModel: (id) => loadedModels.get(id) || null
  };
}
