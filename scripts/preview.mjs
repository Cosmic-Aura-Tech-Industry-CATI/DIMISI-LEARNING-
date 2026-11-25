import './build.mjs';
import http from 'node:http';
import {Readable} from 'node:stream';
const {default:worker}=await import('../dist/server/index.js');
http.createServer(async(req,res)=>{
  try{
    const response=await worker.fetch(new Request('http://localhost'+req.url,{method:req.method,headers:req.headers}));
    res.writeHead(response.status,Object.fromEntries(response.headers));
    if(response.body) Readable.fromWeb(response.body).on('error',()=>res.destroy()).pipe(res);
    else res.end();
  }catch{if(!res.headersSent)res.writeHead(502);res.end();}
}).listen(Number(process.argv.includes('--port') ? process.argv[process.argv.indexOf('--port')+1] : process.env.PORT || 4173),'0.0.0.0');
