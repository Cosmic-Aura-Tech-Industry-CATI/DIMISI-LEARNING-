const library='https://drive.google.com/drive/folders/14V84ekksm2T1X9JlZr6X9fHboiOpd5Fw';
const tracks=[
['Security foundations','Complete Ethical Hacking Bootcamp 2021 – Zero to Mastery',[
'Course introduction|Describe the systems you want to protect and record your learning goals.',
'Lab setup|Document the boundary between your learning environment and everyday devices.',
'Linux operating system|Practice navigating directories, managing files and explaining when elevated privileges are needed.',
'Reconnaissance awareness|List the public information your own project intentionally exposes.',
'Scanning concepts|Explain how a service inventory helps a defender recognize unexpected changes.',
'Port inventory with Python|Read a saved service inventory and summarize its entries by port.',
'Vulnerability analysis|Prioritize a sample finding by exposure, likely impact and available fixes.',
'Understanding access risks|Identify a control that limits the impact of a compromised user account.',
'SMBGhost case study|Write a short historical case note on affected assets and patch management.',
'Malware categories|Compare the behaviors defenders associate with viruses and trojans.',
'Post-compromise indicators|Identify the logs you would preserve during a suspected incident.',
'Backdoor detection|Describe how you would review unexpected persistent access.',
'Web application security|Review one application route and document its authentication and authorization requirements.',
'Network trust|Explain how a client verifies the identity of a server.',
'Network traffic integrity|Explain how a defender might recognize an unexpected change to traffic in transit.',
'Wireless security|Review your own wireless network configuration and document your security choices.',
'Next steps|Identify a topic you want to revisit after the Python modules.',
'Python basics|Create a short script that counts entries in a sample log.',
'Intermediate Python|Refactor your log summary into functions with clear inputs and outputs.',
'Python error handling|Handle missing files and malformed records in your script.',
'Python file I/O|Read a local sample log and write a separate summary report.',
'Bootcamp review|Review the bonus materials and record three concepts you can explain.']],
['Python for security','Learn Python & Ethical Hacking From Scratch',[
'Python track introduction|Choose a defensive question you could answer using local data.',
'Python basics and MAC addresses|Explain where a MAC address appears in a local network inventory.',
'Algorithm design|Describe the inputs, checks and outputs of an address-format validator.',
'Network inventory|Compare two saved device lists and identify new entries.',
'ARP trust risks|Explain the relationship between IP addresses and hardware addresses.',
'Packet interpretation|Identify protocol fields in a sample packet provided by your course.',
'DNS integrity|Describe why a surprising DNS answer deserves investigation.',
'File integrity|Compare known-good file hashes against a saved inventory.',
'Web content integrity|Record how a change in a served page could be detected.',
'HTTPS protections|Explain the role of certificate verification in protecting traffic.',
'ARP spoof detection|Review a saved table for unexpected changes in address mappings.',
'Malware awareness|Distinguish a suspicious behavior from a conclusion that malware is present.',
'Keylogger awareness|Identify the types of information exposed by unauthorized input monitoring.',
'Unauthorized remote access|Review a fictional incident and identify the evidence needed to confirm access.',
'Software provenance|Record how you would verify the origin of a downloaded package.',
'Web application review|Sketch a request flow and label the authorization checks.',
'Website structure|Map the public pages of your own application from its routing configuration.',
'Login protection|Document how your application handles repeated failed sign-ins.',
'Vulnerability triage|Review a sample finding and record its evidence, owner and remediation.',
'Python track review|Summarize one defensive Python project and its limitations.']],
['Advanced security analysis','Advanced White Hat Hacking',[
'Advanced track introduction|Define the scope of a security review and the questions it should answer.',
'Getting organized|Create a findings register with evidence, impact, owner and status.',
'Scanning results|Read an existing assessment report and identify which items require verification.',
'Data acquisition|Create an evidence inventory recording source, time and handling history.',
'Metasploit in context|Explain how defenders interpret findings from an authorized assessment report.',
'Web testing|Review the access-control assumptions in a route from your own application.',
'Reverse engineering concepts|Distinguish static observations from behavior observed at runtime.',
'Fuzzing concepts|Describe how unexpected inputs can reveal validation problems and what a useful report contains.',
'Extending your learning|Write a final review covering findings, fixes and how you would verify each fix.']]];
const sections=tracks.flatMap(([title,folder,lessons],t)=>lessons.map((line,i)=>{const [name,goal]=line.split('|');return {name,goal,t,i,folder}}));
const key='cipher-academy-sequence-v1',total=sections.length;
function read(){try{const v=Number(localStorage.getItem(key));return Number.isInteger(v)&&v>=0&&v<=total?v:0}catch{return 0}}
let done=read(),expanded=sections[done]?.t??2,selected=-1,storageOK=true;
const page=document.querySelector('#page'),dlg=document.querySelector('dialog');
const count=t=>sections.filter((s,i)=>i<done&&s.t===t).length;
const status=t=>count(t)===tracks[t][2].length?'Completed':sections[done]?.t===t?'Current':'Locked';
function courseCards(){return tracks.map(([title,folder,ls],t)=>`<article class="card ${status(t)==='Current'?'current':''}"><button class="track" data-track="${t}" aria-expanded="${expanded===t}"><span class="badge">0${t+1}</span><span class="track-title"><strong>${title}</strong><small>${ls.length} sections · Milestone ${t+1}</small></span><span class="status">${status(t)}</span><span aria-hidden="true">${expanded===t?'−':'+'}</span></button>${expanded===t?sections.map((s,i)=>s.t!==t?'':`<button class="track lesson" data-open="${i}" ${i>done?'disabled':''}><span class="muted">${String(s.i+1).padStart(2,'0')}</span><span>${s.name}</span><span class="end" style="margin-left:auto">${i<done?'✓ Done':i===done?'Open section':'Locked'}</span></button>`).join(''):''}</article>`).join('')}
function render(){const view=['milestones','resources'].includes(location.hash.slice(1))?location.hash.slice(1):'path';const title={path:'Learning path',milestones:'Milestones',resources:'Course resources'}[view];document.querySelector('#crumb').textContent=title;document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+view));let pct=Math.round(done/total*100),earned=tracks.filter((_,i)=>status(i)==='Completed').length;
if(view==='path'){page.innerHTML=`<section class="hero"><canvas aria-hidden="true"></canvas><div class="eyebrow">⚑　GUIDED LEARNING PATH</div><h1>Cybersecurity<br>learning path</h1><p>Build your security skills, one milestone at a time.</p><button class="btn" data-open="${Math.min(done,total-1)}">▷　${done===total?'Review final section':done?'Continue learning':'Start learning'}</button></section><div class="stats">${[['◴',pct+'%','Overall progress'],['▤',done+' / '+total,'Sections complete'],['⚑',earned+' / 3','Milestones earned']].map(([ic,v,l])=>`<div class="stat"><div class="icon">${ic}</div><div><strong>${v}</strong><small>${l}</small></div></div>`).join('')}</div><div class="sectionhead"><h2>Course curriculum</h2><span>3 tracks · 51 sections</span></div>${courseCards()}`;terrain()}else if(view==='milestones'){page.innerHTML='<h1>Milestones</h1><p class="note">Complete every section in a track to earn its milestone.</p>'+tracks.map(([title,f,ls],t)=>`<section class="panel"><div class="tag">MILESTONE 0${t+1} · ${status(t).toUpperCase()}</div><h2>${title}</h2><p>${count(t)} of ${ls.length} sections complete</p><div class="bar"><i style="width:${100*count(t)/ls.length}%"></i></div><p><button class="btn" data-show="${t}">View track</button></p></section>`).join('')}else{page.innerHTML='<h1>Course resources</h1><p class="note">The original videos, subtitles and supporting files are in the shared Drive folder.</p>'+tracks.map(([title,f,ls],t)=>`<section class="panel"><div class="tag">TRACK 0${t+1}</div><h2>${f}</h2><p>${ls.length} numbered sections</p><a href="${library}" target="_blank" rel="noopener">Open course library ↗</a></section>`).join('')}if(!storageOK)page.insertAdjacentHTML('afterbegin','<p role="alert">Browser storage is unavailable. Progress will last for this visit only.</p>')}
function detail(i){if(!sections[i]||i>done)return;selected=i;const s=sections[i];document.querySelector('#detail').innerHTML=`<p class="tag">TRACK 0${s.t+1} · SECTION ${s.i+1}</p><h2>${s.name}</h2><div id="sectionMedia"></div><section class="checkpoint"><h3>Learning checkpoint</h3><p>${s.goal}</p>${i===done?`<button class="btn" id="complete">Mark section complete</button>`:'<p>✓ Section completed</p>'}</section>`;mountPlayer(document.querySelector('#sectionMedia'),s);if(!dlg.open)dlg.showModal()}
page.onclick=e=>{const b=e.target.closest('button');if(!b)return;if('open'in b.dataset)detail(+b.dataset.open);if('track'in b.dataset){const t=+b.dataset.track;expanded=expanded===t?-1:t;render()}if('show'in b.dataset){expanded=+b.dataset.show;location.hash='path'}};
dlg.onclick=e=>{if(e.target.id!=='complete'||selected!==done)return;const prev=sections[done].t;done++;try{localStorage.setItem(key,String(done))}catch{storageOK=false}expanded=sections[done]?.t??2;render();const milestone=sections[done]?.t!==prev;document.querySelector('#detail').innerHTML=`<p class="tag">${milestone?'MILESTONE EARNED':'PROGRESS UPDATED'}</p><h2>${milestone?tracks[prev][0]+' complete':'Section complete'}</h2><p>${done} of ${total} sections complete.</p><button class="btn" id="next">${done<total?'Continue to next section':'View milestones'}</button>`;document.querySelector('#next').onclick=()=>{if(done<total)detail(done);else{dlg.close();location.hash='milestones'}}};
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0)});window.addEventListener('storage',e=>{if(e.key===key){done=read();expanded=sections[done]?.t??2;dlg.close();render()}});
function terrain(){const c=page.querySelector('canvas');if(!c)return;const w=c.clientWidth,h=c.clientHeight,dpr=Math.min(devicePixelRatio,2);c.width=w*dpr;c.height=h*dpr;const g=c.getContext('2d');if(!g)return;g.scale(dpr,dpr);function point(x,y){let z=0;for(const [a,b,s,k] of [[.5,.48,.10,.32],[.73,.56,.12,.67],[.96,.52,.12,.42],[.87,.2,.09,.23]])z+=k*Math.exp(-((x-a)**2+(y-b)**2)/s**2);return [x*w+(y-.5)*w*.15,h*(.09+y*.98-z*.69)]}g.strokeStyle='#709259';g.lineWidth=.72;for(let j=0;j<=44;j++){g.beginPath();for(let i=0;i<=105;i++){const p=point(i/95,j/44);if(i)g.lineTo(...p);else g.moveTo(...p)}g.stroke()}g.strokeStyle='#4c6e47';for(let i=0;i<=105;i++){g.beginPath();for(let j=0;j<=44;j++){const p=point(i/95,j/44);if(j)g.lineTo(...p);else g.moveTo(...p)}g.stroke()}const [x,y]=point(.73,.56);g.strokeStyle='#d2ff94';g.fillStyle='#c7f78c';g.lineWidth=1.8;g.beginPath();g.moveTo(x,y);g.lineTo(x,y-31);g.stroke();g.beginPath();g.moveTo(x,y-31);g.lineTo(x+21,y-27);g.lineTo(x,y-18);g.fill();g.beginPath();g.ellipse(x,y,6,2.7,0,0,Math.PI*2);g.stroke()}
window.addEventListener('resize',terrain);render();

dlg.addEventListener('close',()=>document.querySelector('#detail').replaceChildren());
