import { mkdir, readFile, writeFile } from "node:fs/promises";
import { build } from "esbuild";

import { resolve } from "node:path";
const catalogDir = resolve(process.env.COURSE_ASSETS_DIR || "src/data");
const client = await build({
  entryPoints: ["src/main.tsx"],
  plugins: [{name:"course-catalog",setup(builder){
    builder.onResolve({filter:/^\.\/data\/(cybersecurity|bounty)\.json$/}, args => ({path:resolve(catalogDir,args.path.slice(7))}));
  }}],
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  minify: true,
  write: false,
  define: { "process.env.NODE_ENV": '"production"' },
});
const pages = { "/app.js": ["text/javascript", client.outputFiles[0].text] };
for (const [name, mime] of Object.entries({
  "index.html": "text/html",
  "style.css": "text/css",
  "vendor/sakuga-core.js": "text/javascript",
  "cybersecurity.webp": "image/webp",
})) {
  pages["/" + name] = [
    mime,
    await readFile("public/" + name, mime === "image/webp" ? "base64" : "utf8"),
  ];
}
pages["/"] = pages["/index.html"];
const cyber = JSON.parse(await readFile(resolve(catalogDir,"cybersecurity.json"), "utf8"));
const bounty = JSON.parse(await readFile(resolve(catalogDir,"bounty.json"), "utf8"));
const sections = [...cyber.tracks, ...bounty].flatMap((t) => t.sections);
const ids = sections.flatMap((s) => s.videos.map((v) => v.id));
if (
  ids.some((id) => !/^[-\w]{24,}$/.test(id)) ||
  new Set(ids).size !== ids.length
)
  throw Error("Invalid video catalog");
const files = Object.fromEntries([
  ...cyber.shared,
  ...sections.flatMap((s) => s.files),
]);
const worker = await build({
  entryPoints: ["server/worker.ts"],
  bundle: true,
  format: "esm",
  target: "es2022",
  write: false,
});
await mkdir("dist/server", { recursive: true });


await writeFile(
  "dist/server/index.js",
  `const pages=${JSON.stringify(pages)};\nconst mediaIds=new Set(${JSON.stringify(ids)});\nconst lessonFiles=${JSON.stringify(files)};\n` +
    worker.outputFiles[0].text,
);
