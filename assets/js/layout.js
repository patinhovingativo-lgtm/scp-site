// assets/js/layout.js — v5
// Auto-detects bot URL from localStorage — no manual ID config
// ── Mobile sidebar toggle (global) ───────────────────────────
function toggleMobSidebar(){
  const sb=document.querySelector('.sidebar');
  const ov=document.getElementById('mobOverlay');
  if(!sb)return;
  sb.classList.toggle('mob-open');
  if(ov)ov.classList.toggle('open');
}


// ── SECURITY helpers ─────────────────────────────────────────
window.sanitize = function(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
};


function getBase(){
  const p=window.location.pathname;
  const s=p.replace(/\/index\.html$/,'').replace(/\/$/,'');
  const segs=s.split('/').filter(Boolean);
  // Works with GitHub Pages subpath (e.g. /scp-site/departments/ds/)
  // Detect depth by known folder names
  const deep2=['departments'];
  const deep1=['pages','apply','admin','ai'];
  if(deep2.some(k=>segs.includes(k))) return'../../';
  if(deep1.some(k=>segs.includes(k))) return'../';
  return './';
}

function getBotUrl(){return localStorage.getItem('bot_url')||'';}
function getSession(){try{return JSON.parse(localStorage.getItem('scp_session')||'null');}catch{return null;}}
function getAdminToken(){return sessionStorage.getItem('admin_token')||'';}

function injectHeader(active=''){
  const B=getBase();
  const now=new Date();
  const date=now.toLocaleDateString('en-US',{month:'2-digit',day:'2-digit',year:'numeric'});

  const nav=[
    {h:`${B}index.html`,l:'HOME',k:'home'},
    {h:`${B}pages/hierarchy.html`,l:'HIERARCHY',k:'hierarchy'},
    {h:`${B}pages/divisions.html`,l:'DIVISIONS',k:'divisions'},
    // SCP Database removed — content moved to DC department
    {h:`${B}pages/ethics.html`,l:'CODE OF ETHICS',k:'ethics'},
    {h:`${B}pages/rules.html`,l:'RULES',k:'rules'},
    {h:`${B}ai/index.html`,l:'⬡ DR-07 AI',k:'ai'},
    {h:`${B}apply/level0.html`,l:'APPLY',k:'apply'},
  ];

  const navHTML=nav.map(n=>`<a href="${n.h}" class="ni${active===n.k?' on':''}">${n.l}</a>`).join('')+
    `<span class="nav-sep"></span>
     <a href="${B}admin/index.html" class="ni${active==='admin'?' on':''}">⚙ ADMIN</a>
     <a href="${B}verify.html" class="ni" id="authBtn">🔑 LOGIN</a>`;

  document.body.insertAdjacentHTML('afterbegin',`
    <div class="mob-sidebar-overlay" id="mobOverlay" onclick="toggleMobSidebar()"></div>
    <header class="site-hdr">
      <div class="hdr-top">
        <div class="hdr-logo">⬡</div>
        <div class="hdr-title">
          <h1>SCP FOUNDATION — SITE-07 INTRANET</h1>
          <div class="sub">SECURE · CONTAIN · PROTECT — RESTRICTED ACCESS</div>
        </div>
        <div class="hdr-meta">
          <div class="clr" id="hClr">CLEARANCE: ---</div>
          <div id="hUser">NOT AUTHENTICATED</div>
          <div id="hClock">${date}</div>
        </div>
      </div>
      <nav class="site-nav">
        <button class="mob-menu-btn" onclick="toggleMobSidebar()" title="Menu" style="display:none;background:none;border:none;color:#c8d4ff;font-size:18px;padding:5px 8px;cursor:pointer">&#9776;</button>
        ${navHTML}
      </nav>
    </header>
    <div class="ticker-wrap">
      <div class="ticker">
        ★ SITE-07 INTRANET — AUTHORIZED PERSONNEL ONLY &nbsp;&nbsp;
        ★ ALL ACTIVITY IS LOGGED AND MONITORED &nbsp;&nbsp;
        ★ CONTAINMENT STATUS: NOMINAL &nbsp;&nbsp;
        ★ LORE UNDER DEVELOPMENT — ENTRIES MARKED [PENDING] &nbsp;&nbsp;
        ★ RECRUITMENT OPEN — APPLY NOW &nbsp;&nbsp;
        ★ ASK DR-07 AI FOR HELP &nbsp;&nbsp;
      </div>
    </div>
  `);

  // Show hamburger on mobile
  function checkMobile(){
    const btn=document.querySelector('.mob-menu-btn');
    if(btn)btn.style.display=window.innerWidth<=768?'block':'none';
  }
  checkMobile();
  window.addEventListener('resize',checkMobile);

  setInterval(()=>{
    const t=new Date().toLocaleTimeString('en-US',{hour12:false});
    const el=document.getElementById('hClock');
    if(el)el.textContent=`${date}  ${t}`;
  },1000);

  const s=getSession();
  if(s?.discord_id){
    const lvN=['LEVEL-0','LEVEL-1','LEVEL-2','LEVEL-3','LEVEL-4','LEVEL-5'];
    const lv=s.clearance||0;
    document.getElementById('hUser').textContent=s.username||'AUTHENTICATED';
    document.getElementById('hClr').textContent=`CLEARANCE: ${lvN[lv]||'NONE'}`;
    const btn=document.getElementById('authBtn');
    if(btn){btn.textContent='🔓 LOGOUT';btn.href='#';btn.onclick=(e)=>{e.preventDefault();localStorage.removeItem('scp_session');location.reload();};}
  }
}

function injectFooter(){
  document.body.insertAdjacentHTML('beforeend',`
    <footer class="site-foot">
      SCP FOUNDATION — SITE-07 INTRANET &nbsp;|&nbsp; v5.0 &nbsp;|&nbsp;
      <a href="https://discord.gg/pNzRGbmZ" target="_blank">DISCORD</a> &nbsp;|&nbsp;
      <a href="https://www.roblox.com/communities/861318854" target="_blank">ROBLOX GROUP</a> &nbsp;|&nbsp;
      NOT AFFILIATED WITH THE SCP WIKI FOUNDATION
    </footer>
    <div class="status-bar">
      <span id="stUser">USER: ANONYMOUS</span>
      <span id="stLvl">CLEARANCE: NONE</span>
      <span>SITE-07</span>
    </div>
  `);
  const s=getSession();
  if(s){
    const lvN=['LVL-0','LVL-1','LVL-2','LVL-3','LVL-4','LVL-5'];
    document.getElementById('stUser').textContent=`USER: ${s.username||'?'}`;
    document.getElementById('stLvl').textContent=`CLEARANCE: ${lvN[s.clearance||0]||'NONE'}`;
  }
}

// ── Sidebar builder ───────────────────────────────────────────
function buildSidebar(sections){
  const sb=document.querySelector('.sidebar');
  if(!sb)return;
  sb.innerHTML='';
  sections.forEach(sec=>{
    const d=document.createElement('div');
    d.className='sb-sec';
    d.innerHTML=`<div class="sb-hd">${sec.title}</div>`+
      sec.links.map(l=>`<a href="${l.href}" class="sb-a${l.active?' on':''}">${l.label}</a>`).join('');
    sb.appendChild(d);
  });
}
