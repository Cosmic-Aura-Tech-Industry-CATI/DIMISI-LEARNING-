# DIMISI Learning · Cipher Academy

The learning panel includes an anime-inspired course dashboard, an in-page video player, lesson-file previews and downloads, sequential milestones, and browser-local playback progress.

## Run locally

Use Node.js 24. There are no package dependencies. Run `npm run dev` and open http://localhost:4173. To generate the deployable Worker at `dist/server/index.js`, run `npm run build`.

## Course assets

The default build uses the existing public video catalog in `catalog/videos.txt`. Each section begins with its track and section key (for example, `0-1`), followed by one video file ID and title per line. `catalog/files.json` maps section keys and the `shared` key to arrays of file ID and filename pairs.

For the full course, point `COURSE_ASSETS_DIR` at a directory containing your own `videos.txt` and `files.json` before starting or building. The build embeds the chosen catalog into its output. The Worker serves videos and files through same-origin routes.
