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
const page=document.querySelector('#page'),dlg=document.querySelector('#lesson');
const count=t=>sections.filter((s,i)=>i<done&&s.t===t).length;
const status=t=>count(t)===tracks[t][2].length?'Completed':sections[done]?.t===t?'Current':'Locked';
let releasePlayer = () => {};
let lessonChanges = 0;
const sectionKey = s => s.t + '-' + (s.i + 1);
function resumeTarget() {
  const last = playbackProgress.lastSection();
  const i = sections.findIndex(s => sectionKey(s) === last);
  const clips = videoCatalog[last] || [];
  if (i >= 0 && i <= done && clips.some(c => !playbackProgress.record(c.id).done)) return i;
  return Math.min(done,total - 1);
}
function resumeInfo() {
  const index = resumeTarget();
  const id = sectionKey(sections[index]), clips = videoCatalog[id];
  if (!clips?.length || id !== playbackProgress.lastSection()) return '';
  const clip = clips[playbackProgress.startingIndex(id, clips)];
  const seconds = Math.floor(playbackProgress.record(clip.id).time);
  const time = seconds ? ' · ' + Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2,'0') : '';
  return '<small class="resume-info">Up next · ' + clip.title + time + '</small>';
}
function courseCards(){return tracks.map(([title,folder,ls],t)=>`<article class="card ${status(t)==='Current'?'current':''}"><button class="track" data-track="${t}" aria-expanded="${expanded===t}"><span class="badge">0${t+1}</span><span class="track-title"><strong>${title}</strong><small>${ls.length} sections · Milestone ${t+1}</small></span><span class="status">${status(t)}</span><span aria-hidden="true">${expanded===t?'−':'+'}</span></button>${expanded===t?sections.map((s,i)=>s.t!==t?'':`<button class="track lesson" data-open="${i}" ${i>done?'disabled':''}><span class="muted">${String(s.i+1).padStart(2,'0')}</span><span>${s.name}</span><span class="end" style="margin-left:auto">${i<done?'✓ Done':i===done?'Open section':'Locked'}</span></button>`).join(''):''}</article>`).join('')}
function renderCatalog() {
  const pct = Math.round(done / total * 100);
  const numberOfVideos = Object.values(videoCatalog).reduce((n, list) => n + list.length, 0);
  page.innerHTML = `<section class="catalog" aria-labelledby="catalog-title">
    <div class="catalog-head"><h1 id="catalog-title">Course catalog<span aria-hidden="true">.</span></h1><span class="catalog-count">1 course</span></div>
    <ul class="catalog-list"><li><a class="catalog-course" href="#path" aria-label="Open Cybersecurity course">
      <div class="cover-art"><img src="/cybersecurity.webp" alt="An illustrated rooftop courier overlooking a city beneath a vermilion sun" fetchpriority="high"></div>
      <div class="course-copy"><div class="course-format">VIDEO COURSE</div><h2>Cybersecurity</h2>
      <p>Explore Linux, Python and defensive security through guided lessons and hands-on checkpoints.</p>
      <div class="course-meta"><span>${tracks.length} tracks</span><span>${total} sections</span><span>${numberOfVideos} videos</span></div>
      <div class="course-progress"><div><span>Your progress</span><strong>${pct}%</strong></div><progress value="${done}" max="${total}" aria-label="Cybersecurity course progress"></progress></div>
      <span class="catalog-action">${done === total ? 'Review course' : (done || playbackProgress.lastSection()) ? 'Continue course' : 'Open course'}</span></div>
    </a></li></ul></section>`;
}
function render(){
  const route = location.hash.slice(1);
  const view = ['path','milestones','resources'].includes(route) ? route : 'catalog';
  const title = {catalog:'Course catalog',path:'Learning path',milestones:'Milestones',resources:'Course resources'}[view];
  document.body.classList.toggle('catalog-home',view === 'catalog');
  document.querySelectorAll('[data-course-nav]').forEach(link => link.hidden = view === 'catalog');
  document.title = title + ' · Cipher Academy';
  document.querySelector('#crumb').textContent=title;document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+view));let pct=Math.round(done/total*100),earned=tracks.filter((_,i)=>status(i)==='Completed').length;
if(view==='catalog'){renderCatalog()}else if(view==='path'){page.innerHTML=`<a class="catalog-back" href="#catalog">All courses</a><section class="hero anime-hero"><div class="eyebrow">CYBERSECURITY　/　LEARNING PATH</div><h1>Cybersecurity<br>learning path</h1><p>Study security foundations, Python and advanced analysis in three guided tracks.</p><button class="btn" data-open="${resumeTarget()}">▶　${done===total?'Review final section':(done || playbackProgress.lastSection())?'Resume learning':'Start learning'}</button>${resumeInfo()}</section><div class="stats">${[['◴',pct+'%','Overall progress'],['▤',done+' / '+total,'Sections complete'],['⚑',earned+' / 3','Milestones earned']].map(([ic,v,l])=>`<div class="stat"><div class="icon">${ic}</div><div><strong>${v}</strong><small>${l}</small></div></div>`).join('')}</div><div class="sectionhead"><h2>Course curriculum</h2><span>3 tracks · 51 sections</span></div>${courseCards()}`;}else if(view==='milestones'){page.innerHTML='<h1>Milestones</h1><p class="note">Complete every section in a track to earn its milestone.</p>'+tracks.map(([title,f,ls],t)=>`<section class="panel"><div class="tag">MILESTONE 0${t+1} · ${status(t).toUpperCase()}</div><h2>${title}</h2><p>${count(t)} of ${ls.length} sections complete</p><div class="bar"><i style="width:${100*count(t)/ls.length}%"></i></div><p><button class="btn" data-show="${t}">View track</button></p></section>`).join('')}else{page.innerHTML='<h1>Course resources</h1><p class="note">Preview or download the files for each section.</p>'+sections.map((s,i)=>courseFiles[sectionKey(s)]?.length && i<=done ? `<details class="panel resource-group"><summary>${s.name} <small>Track ${s.t+1} · Section ${s.i+1}</small></summary><div data-files="${sectionKey(s)}"></div></details>`:'').join('');page.querySelectorAll('[data-files]').forEach(el=>listFiles(el,courseFiles[el.dataset.files]))}if(view==='milestones')page.insertAdjacentHTML('beforeend','<section class="about"><h2>How milestones work</h2><p>Each milestone represents one track. Finish its sections to earn it. You can revisit completed lessons at any time.</p></section>');if(view==='path')page.insertAdjacentHTML('beforeend','<section class="about"><h2>About this learning path</h2><p>Work through each section in order. Finish every video in a section to unlock the next. Mark reading-only sections complete after reviewing their materials. Each finished track earns a milestone.</p></section>');if(view==='resources')page.insertAdjacentHTML('beforeend','<section class="panel"><h2>Shared course files</h2><div id="sharedFiles"></div></section>');if(view==='resources')listFiles(page.querySelector('#sharedFiles'),courseFiles.shared);if(!storageOK || !playbackProgress.persistent)page.insertAdjacentHTML('afterbegin','<p role="alert">Browser storage is unavailable. Progress will last for this visit only.</p>')}
function finishSection(index) {
  if (index !== done) return;
  done++;
  try { localStorage.setItem(key,String(done)); } catch { storageOK = false; }
  expanded = sections[done]?.t ?? 2;
  render();
}
function checkpoint(index, hasClips) {
  const section = sections[index];
  const complete = index < done;
  const milestone = complete && sections[index+1]?.t !== section.t;
  const action = complete
    ? `<p class="completion-note">✓ ${milestone ? 'Milestone earned · ' + tracks[section.t][0] : 'Section complete'}</p><button class="btn" id="next">${index+1 < total ? 'Continue to next section' : 'View milestones'}</button>`
    : hasClips ? '<p class="auto-note">Progress saves as you watch. Finish each video to unlock the next section.</p>' : '<button class="btn" id="complete">Mark section complete</button>';
  dlg.querySelector('.checkpoint').innerHTML = `<h3>Learning checkpoint</h3><p>${section.goal}</p>${action}`;
}
function detail(index) {
  if (!sections[index] || index > done) return;
  const request = ++lessonChanges;
  sceneTransition.go('Opening lesson', () => {
    if (request !== lessonChanges) return;
    releasePlayer();
    selected = index;
    const section = sections[index], clips = videoCatalog[sectionKey(section)] || [];
    if (clips.length && clips.every(c => playbackProgress.record(c.id).done)) finishSection(index);
    dlg.querySelector('#detail').innerHTML = `<p class="tag">TRACK 0${section.t+1} · SECTION ${section.i+1}</p><h2>${section.name}</h2><div id="sectionMedia"></div><section class="checkpoint" aria-live="polite"></section>`;
    checkpoint(index, clips.length);
    releasePlayer = mountPlayer(dlg.querySelector('#sectionMedia'), section, allWatched => {
      if (allWatched) { finishSection(index); checkpoint(index, true); }
    });
    if (!dlg.open) dlg.showModal();
    dlg.scrollTop = 0;
  });
}
page.onclick = event => {
  const button = event.target.closest('button');
  if (!button) return;
  if ('open' in button.dataset) detail(+button.dataset.open);
  if ('track' in button.dataset) {
    const track = +button.dataset.track;
    expanded = expanded === track ? -1 : track;
    render();
  }
  if ('show' in button.dataset) { expanded = +button.dataset.show; location.hash = 'path'; }
};
dlg.addEventListener('click', event => {
  if (event.target.id === 'complete') { finishSection(selected); checkpoint(selected, false); }
  if (event.target.id === 'next') {
    if (selected + 1 < total) detail(selected + 1);
    else { dlg.close(); location.hash='milestones'; }
  }
});
window.addEventListener('hashchange', () => {
  const label = {path:'Opening learning path',resources:'Opening resources',milestones:'Opening milestones'}[location.hash.slice(1)] || 'Opening catalog';
  if (dlg.open) dlg.close();
  sceneTransition.go(label, () => { render(); window.scrollTo(0,0); });
});
window.addEventListener('storage', event => {
  if (event.key === key || event.key === null) {
    done = read(); expanded = sections[done]?.t ?? 2; render();
    if (dlg.open && selected >= 0) checkpoint(selected, videoCatalog[sectionKey(sections[selected])]?.length);
  }
});
render();
dlg.addEventListener('close', () => {
  lessonChanges++;
  releasePlayer(); releasePlayer = () => {}; selected = -1;
  dlg.querySelector('#detail').replaceChildren();
  if (location.hash === '#path') render();
});
const menuDrawer = document.querySelector('#drawer');
document.querySelector('#menu').onclick = () => menuDrawer.showModal();
menuDrawer.addEventListener('click', event => {
  if (event.target.closest('a') || event.target === menuDrawer && event.clientX > menuDrawer.getBoundingClientRect().right) menuDrawer.close();
});
dlg.addEventListener('cancel', event => {
  const wide = dlg.querySelector('.wide-screen');
  if (wide) { event.preventDefault(); wide.querySelector('.expand').click(); }
});
