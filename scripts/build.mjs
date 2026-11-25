import {mkdir,readFile,writeFile} from 'node:fs/promises';
const pages={};
for(const [name,type] of Object.entries({'index.html':'text/html','app.js':'text/javascript','progress.js':'text/javascript','motion.js':'text/javascript','vendor/sakuga-core.js':'text/javascript','style.css':'text/css','videos.js':'text/javascript'})){
  pages['/'+name]=[type,await readFile('public/'+name,'utf8')];
}
pages['/cybersecurity.webp']=['image/webp',(await readFile('public/cybersecurity.webp')).toString('base64')];
pages['/']=pages['/index.html'];
const sourceDirectory = process.env.COURSE_ASSETS_DIR || 'catalog';
const rows = await readFile(sourceDirectory + '/videos.txt','utf8');
const fileSource = await readFile(sourceDirectory + '/files.json','utf8');
const catalog = JSON.parse(fileSource);
pages['/catalog.js'] = ['text/javascript','window.courseVideoRows=' + JSON.stringify(rows) + ';'];
pages['/files.js'] = ['text/javascript','const courseFiles=' + JSON.stringify(catalog) + ';'];
const ids = [...rows.matchAll(/^([\w-]{24,}) /gm)].map(match => match[1]);
const lessonFiles=Object.fromEntries(Object.values(catalog).flat());
await mkdir('dist/server',{recursive:true});
await writeFile('dist/server/index.js','const pages='+JSON.stringify(pages)+';\nconst mediaIds=new Set('+JSON.stringify(ids)+');\n'+'const lessonFiles='+JSON.stringify(lessonFiles)+';\n'+await readFile('worker.mjs','utf8'));
