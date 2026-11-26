# DIMISI Learning · Cipher Academy
A React and strict TypeScript course dashboard using TanStack Router. Includes sequential lessons, milestones, a video player with resume, and lesson-file previews and downloads. Video and file requests are served by the TypeScript Worker.

## Local development
Use Node.js 24. Run `npm ci`, then `npm run dev` and open http://localhost:4173. Run `npm run build` for strict type checking and the production Worker bundle at `dist/server/index.js`.

## Course data
The two course outlines are in `src/data`. The public catalog includes previously published media IDs. To use your private videos and files, set `COURSE_ASSETS_DIR` to a directory containing matching `cybersecurity.json` and `bounty.json` manifests before running dev or build. The chosen manifests are embedded in the generated bundle.
