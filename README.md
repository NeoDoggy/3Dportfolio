# NeoDoggy 3D Portfolio

Pure Three.js portfolio shell with a retro CLI loading screen, a 3D computer scene, and an interactive CSS3D iframe attached to the monitor mesh.

## Where to Put Your Files

- Main computer mesh: `public/models/computer.glb`
- Extra mesh files: `public/models/`
- Draco decoder files, only if your GLB needs them: `public/draco/`
- Existing 2D portfolio build: replace `public/portfolio/` with your exported static files
- Hosted 2D portfolio URL: set `VITE_PORTFOLIO_URL` in `.env`

The default model path is configured in `src/portfolio-config.js` and can be overridden with:

```env
VITE_COMPUTER_MODEL=/models/my-computer.glb
```

## Run Locally

```bash
nvm use
npm install
npm run dev
```

Then open the local URL printed by Vite.

The project targets Node 20.19+ / 22+ because modern Vite requires it. In WSL, use the included `.nvmrc` with `nvm use` if you manage Node through nvm.

## Integrating Your 3D Computer

1. Export the computer as `.glb` or `.gltf`.
2. Put it in `public/models/`.
3. Either name it `computer.glb`, or update `VITE_COMPUTER_MODEL`.
4. Start the site and adjust `SCREEN_PLANE` in `src/portfolio-config.js`.

`SCREEN_PLANE` attaches the iframe to the named monitor mesh in `computer.glb`. If the iframe is slightly off, tune `position`, `rotation`, `width`, and `height` there. The current parent target is:

```js
SM_Computer_B_Monitor.mo_MI_Computer_B_0.001
```

## Integrating Your 2D Portfolio

For a local static portfolio, copy its production build into `public/portfolio/` so this file exists:

```text
public/portfolio/index.html
```

For a deployed portfolio, create `.env` from `.env.example` and set:

```env
VITE_PORTFOLIO_URL=https://www.neodoggy.org
```

Some websites block iframe embedding with security headers. If your hosted 2D site does not appear, use the local static-build option or adjust the original site's `X-Frame-Options` / `Content-Security-Policy` settings.

## Notes

This project keeps the 3D rendering path simple and fast: Three.js renders the room and computer mesh, while Three's CSS3DRenderer keeps the portfolio as a real iframe attached to the monitor in 3D space. That means your original 2D site stays clickable and does not need to be converted into a texture.

When running in WSL, start Vite from the same folder you are editing. For this workspace that is usually:

```bash
cd /mnt/d/git/3Dportfolio
npm run dev
```
