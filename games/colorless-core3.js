/* ===== 색깔없는세상 엔진 v4 =====
   - v3: AI 삽화(흑백→채색), 단서 수첩, 장치형 미션(mixer/tuner/dial/maze/restore/slidepuzzle/assemble/pack/terminal)
   - v4: 해맑음 봉인 — 장 클리어는 채색만, 진실은 엔딩 리빌 몽타주(revealSeq)에서 일괄 공개 */
(function(){
const G=window.GAME;
const root=document.documentElement.style;
root.setProperty('--bg',G.theme.bg);
root.setProperty('--card',G.theme.card||'#141416');
root.setProperty('--line',G.theme.line||'#28282c');
document.title='색깔없는세상 : '+G.title;
const $=s=>document.querySelector(s);
const stage=$('#stage');
const SKEY='cw3_'+G.id;
const PKEY='cw_prism';
const ORDER=['R','Y','B','G','W'];
const LETTER={R:'P',Y:'R',B:'I',G:'S',W:'M'};
let S=load()||{i:0,keys:[],notes:[]};
if(!S.notes)S.notes=[];
let timers=[];let gid=0;

function load(){try{return JSON.parse(localStorage.getItem(SKEY))}catch(e){return null}}
function save(){localStorage.setItem(SKEY,JSON.stringify(S))}
function clearTimers(){timers.forEach(t=>{clearInterval(t);clearTimeout(t);cancelAnimationFrame(t)});timers=[]}
function norm(s){return String(s).toLowerCase().replace(/[\s,\-:._!?~'"()]/g,'')}
function el(html){const d=document.createElement('div');d.innerHTML=html;return d}
function img(src,cls){return src?'<img class="illust '+(cls||'')+'" src="'+src+'" alt="">':''}

/* ---- 채색 시스템 ---- */
function prog(){return Math.min(S.i/G.puzzles.length,1)}
function accFor(p){const t=G.theme;
  if(t.s===0)return 'hsl(0,0%,'+Math.round(35+60*p)+'%)';
  return 'hsl('+t.h+','+Math.round(t.s*Math.max(p,.10))+'%,'+t.l+'%)';}
function tint(){root.setProperty('--acc',accFor(prog()));}
function avatarSVG(p,w){gid++;const id='ag'+gid;const off=Math.round((1-p)*100);
  return '<svg viewBox="0 0 60 92" width="'+w+'" style="display:block;margin:0 auto"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="'+off+'%" stop-color="#4a4a4e"/><stop offset="'+off+'%" stop-color="'+accFor(Math.max(p,.25))+'"/></linearGradient></defs><circle cx="30" cy="15" r="11.5" fill="url(#'+id+')"/><path d="M30 29 C15 29 11 43 11 57 L15 90 L25 90 L27 62 L33 62 L35 90 L45 90 L49 57 C49 43 45 29 30 29 Z" fill="url(#'+id+')"/></svg>';}
function header(){
  $('#hT').textContent='색깔없는세상 · '+G.short;
  $('#hP').innerHTML='<span style="margin-right:8px">'+(S.i>=G.puzzles.length?'CLEAR':('M '+String(S.i+1).padStart(2,'0')+'/'+G.puzzles.length))+'</span><span class="havatar">'+avatarSVG(prog(),18)+'</span>';
  tint();
}
function render(html){clearTimers();stage.innerHTML=html;stage.style.animation='none';void stage.offsetWidth;stage.style.animation='';window.scrollTo(0,0);mountNotesBtn();}

/* ---- 단서 수첩 ---- */
const NLABEL=G.notesLabel||'단서';
function mountNotesBtn(){
  if($('#nb'))return;
  const b=el('<button class="notesbtn" id="nb">📔 '+NLABEL+' '+S.notes.length+'</button>').firstChild;
  document.body.appendChild(b);
  b.onclick=showNotes;
}
function refreshNotesBtn(){const b=$('#nb');if(b)b.textContent='📔 '+NLABEL+' '+S.notes.length;}
function addNote(n){if(!n)return false;if(S.notes.some(x=>x.t===n.t))return false;S.notes.push(n);save();refreshNotesBtn();return true;}
function showNotes(){
  const ov=el('<div class="overlay"><div class="card" style="max-height:76vh;overflow-y:auto"><h2>📔 '+NLABEL+'</h2><div class="noteslist" style="margin-top:10px">'+
   (S.notes.length?S.notes.map(n=>'<div class="noteitem"><b>'+n.t+'</b><p>'+n.b+'</p></div>').join(''):'<p class="dim small">아직 모은 것이 없어! 미션을 풀면 여기에 쌓여.</p>')+
   '</div><button class="btn" id="nc" style="margin-top:8px">닫기</button></div></div>');
  document.body.appendChild(ov);
  ov.querySelector('#nc').onclick=()=>ov.remove();
}

/* ---- 화면 ---- */
function startScreen(){
  header();
  const resume=S.i>0&&S.i<G.puzzles.length;
  render(`
   ${img(G.assets+'title.webp')}
   <h1 class="center">${G.title}</h1>
   <p class="center dim">${G.subtitle}</p>
   <div class="card small dim">${G.synopsis}</div>
   <div class="card small center">이 세상에는 색이 없어.<br>미션을 하나 풀 때마다 — <b class="acc">${G.short}</b>이 조금씩 물들어!<br><span class="dim">📔 모은 것들은 ${NLABEL}에 차곡차곡 저장돼.</span></div>
   <div class="hintbox">⚠ 본 게임은 <b>어른을 위한 동화</b>입니다.${G.notice?'<br>'+G.notice:''}</div>
   <button class="btn" id="go">${resume?'이어서 하기 (MISSION '+(S.i+1)+')':'일기장을 펼친다'}</button>
   ${resume?'<button class="btn ghost" id="re">처음부터 다시</button>':''}
  `);
  $('#go').onclick=()=>{ if(S.i===0) diaryScreen(1); else puzzleScreen(); };
  const re=$('#re'); if(re) re.onclick=()=>{ if(confirm('진행 기록을 지우고 처음부터 시작할까요?')){S={i:0,keys:[],notes:[]};save();refreshNotesBtn();startScreen();} };
}
function diaryScreen(chNum){
  header();
  const ch=G.chapters[chNum-1];
  render(`
   <p class="dim small">제${chNum}장 · 그림일기</p>
   ${img(ch.img)}
   <div class="paper gray">${ch.diary}<div class="pnum">- ${chNum}쪽 -</div></div>
   <button class="btn" id="go">${chNum===1?'이야기 속으로':'계속하기'}</button>
  `);
  $('#go').onclick=puzzleScreen;
}
function chapterEnd(chNum){
  header();
  const ch=G.chapters[chNum-1];
  const pct=Math.round(prog()*100);
  const happy=ch.happy||ch.reveal||'';
  render(`
   <p class="dim small">제${chNum}장 끝!</p>
   ${img(ch.img)}
   <div class="paper">${ch.diary}<div class="pnum">- ${chNum}쪽 -</div></div>
   <div class="card"><p class="small acc">🖍️ 일기가 예쁘게 물들었어!</p><p style="margin-top:6px">${happy}</p>
   <p class="small dim" style="margin-top:8px">오늘의 낱말</p><span class="keytag">${ch.key}</span></div>
   <div class="card center"><div class="dripwrap">${avatarSVG(prog(),64)}</div>
   <p class="small" style="margin-top:6px"><b class="acc">${G.short}</b>이 <b class="acc">${pct}%</b> 물들었다</p></div>
   <button class="btn" id="go">${chNum===5?'문 앞으로':'다음 장으로'}</button>
  `);
  setTimeout(()=>{const im=stage.querySelector('.illust');if(im)im.classList.add('tinted');},350);
  $('#go').onclick=()=>{ if(chNum===5) puzzleScreen(); else diaryScreen(chNum+1); };
}
/* ---- v4: 엔딩 리빌 몽타주 ---- */
function revealSeq(i){
  header();
  const R=G.reveal;
  if(i>=R.cuts.length){revealFinal();return;}
  const c=R.cuts[i];
  render(`
   <p class="dim small">일기를 처음부터 다시 읽어 볼까? · ${i+1} / ${R.cuts.length}</p>
   ${img(c.img,'tinted')}
   <div class="paper" style="text-align:center">${c.kid}</div>
   <div class="card center truthcap" id="tc2"><p>${c.truth}</p></div>
   <button class="btn" id="go" style="visibility:hidden">계속 읽는다</button>
  `);
  setTimeout(()=>{const t=$('#tc2');if(t)t.classList.add('show');},1400);
  setTimeout(()=>{const b=$('#go');if(b)b.style.visibility='visible';},2200);
  $('#go').onclick=()=>revealSeq(i+1);
}
function revealFinal(){
  header();
  const R=G.reveal;
  render(`
   ${img(R.img,'tinted')}
   <div class="card center truthcap" id="l1"><p style="font-size:1.05rem">${R.line1}</p></div>
   <div class="card center truthcap" id="l2"><p class="acc" style="font-family:'Gaegu';font-size:1.25rem">${R.line2}</p></div>
   <button class="btn" id="go" style="visibility:hidden">문을 연다</button>
  `);
  setTimeout(()=>{const x=$('#l1');if(x)x.classList.add('show');},900);
  setTimeout(()=>{const x=$('#l2');if(x)x.classList.add('show');},2400);
  setTimeout(()=>{const b=$('#go');if(b)b.style.visibility='visible';},3000);
  $('#go').onclick=ending;
}
function puzzleScreen(){
  header();
  if(S.i>=G.puzzles.length){ending();return;}
  const P=G.puzzles[S.i];
  let hintUsed=0;
  let scene=(P.scene||'').replace('{KEYS}',S.keys.map(k=>'<span class="keytag">'+k+'</span>').join(''));
  render(`
   <div class="missionbar"><span class="mnum">${P.kind==='Q'?'QUIZ':'MISSION'} ${String(S.i+1).padStart(2,'0')}</span><span class="dim small">${P.id} · 제${P.ch}장</span></div>
   <h2>${P.t}</h2>
   ${img(P.img,'dim')}
   ${scene?'<div class="scene">'+scene+'</div>':''}
   <p class="q"><span class="objtag">목표</span> ${P.q}</p>
   <div id="ia"></div>
   <p class="wrongmsg" id="wm"></p>
   <div id="hb"></div>
   <button class="btn ghost mini" id="hbtn">힌트 보기 (${(P.hints||[]).length})</button>
   <div class="prog"><i style="width:${S.i/G.puzzles.length*100}%"></i></div>
  `);
  $('#hbtn').onclick=()=>{
    if(hintUsed>=(P.hints||[]).length)return;
    const d=document.createElement('div');d.className='hintbox';d.style.marginBottom='8px';
    d.textContent='💡 힌트 '+(hintUsed+1)+': '+P.hints[hintUsed];
    $('#hb').appendChild(d);hintUsed++;
    if(hintUsed>=P.hints.length)$('#hbtn').style.display='none';
  };
  build(P);
}
function wrong(msg){const wm=$('#wm');if(wm)wm.textContent=msg||'…음, 다시 해 보자!';
  stage.classList.remove('shake');void stage.offsetWidth;stage.classList.add('shake');}
function solve(P){
  const ch=P.ch;
  const isChEnd=(S.i+1>=G.puzzles.length)||(G.puzzles[S.i+1]&&G.puzzles[S.i+1].ch!==ch);
  const last=S.i+1>=G.puzzles.length;
  if(isChEnd&&!last&&G.chapters[ch-1].key&&!S.keys.includes(G.chapters[ch-1].key))S.keys.push(G.chapters[ch-1].key);
  const gotNote=addNote(P.note);
  const nextP=Math.min((S.i+1)/G.puzzles.length,1);
  const ov=el(`<div class="overlay"><div class="card">
    <p class="acc" style="font-weight:700">✓ ${P.kind==='Q'?'QUIZ':'MISSION'} CLEAR — ${P.id}</p>
    <p style="margin-top:8px">${P.after||''}</p>
    ${gotNote?'<div class="notenew">📔 '+NLABEL+'에 쏙! — <b>'+P.note.t+'</b><br><span class="dim">'+P.note.b+'</span></div>':''}
    <div class="center" style="margin-top:10px">${avatarSVG(nextP,44)}</div>
    <button class="btn" style="margin-top:14px" id="nx">계속</button></div></div>`);
  document.body.appendChild(ov);
  ov.querySelector('#nx').onclick=()=>{
    ov.remove();S.i++;save();header();
    if(last){G.reveal?revealSeq(0):ending();}else if(isChEnd){chapterEnd(ch);}else puzzleScreen();
  };
}

/* ---- 인터랙션 ---- */
function isNum(P){return P.a&&P.a.some(x=>/^\d+$/.test(String(x)))}
function textCheck(P,v){return P.a.some(a=>norm(a)===norm(v))}
function inputRow(ph){return '<input type="text" id="ans" placeholder="'+(ph||'정답 입력')+'" autocomplete="off"><button class="btn" id="ok" style="margin-top:10px">확인</button>'}
function bindText(P,onOk){
  const go=()=>{const v=$('#ans').value.trim();
    if(!v)return wrong('무언가 입력해 보자!');
    if(textCheck(P,v))onOk();else wrong(P.wrongMsg);};
  $('#ok').onclick=go;$('#ans').addEventListener('keydown',e=>{if(e.key==='Enter')go()});
}
function build(P){
  const ia=$('#ia');const T=P.type;
  if(T==='text'&&isNum(P)){
    const maxlen=Math.max(...P.a.filter(x=>/^\d+$/.test(String(x))).map(x=>String(x).length));
    let val='';
    ia.innerHTML=`<div class="device"><div class="dhead"><span>KEYPAD</span><span class="lamp">●</span></div>
      <div class="kdisp" id="kd">${'·'.repeat(maxlen)}</div>
      <div class="kp">${[1,2,3,4,5,6,7,8,9,'C',0,'⌫'].map(k=>`<button data-k="${k}">${k}</button>`).join('')}</div>
      <button class="btn" id="ok" style="margin-top:12px">확인</button></div>`;
    const disp=()=>{$('#kd').textContent=val?val:'·'.repeat(maxlen)};
    ia.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const k=b.dataset.k;
      if(k==='C')val='';else if(k==='⌫')val=val.slice(0,-1);else if(val.length<maxlen+2)val+=k;disp();});
    $('#ok').onclick=()=>{if(!val)return wrong('숫자를 눌러 보자!');
      if(textCheck(P,val))solve(P);else{wrong(P.wrongMsg||'음… 아닌가 봐! 다시!');val='';disp();}};
  }
  else if(T==='text'||T==='free'||T==='trick'){
    ia.innerHTML=inputRow(P.ph);
    if(T==='free'){$('#ok').onclick=()=>{$('#ans').value.trim()?solve(P):wrong('무언가 적어 보자!')};return;}
    if(T==='trick'){$('#ok').onclick=()=>{const v=$('#ans').value.trim();if(!v)return wrong('무언가 적어 보자!');
      const inp=$('#ans');let n=0;$('#ok').disabled=true;
      const iv=setInterval(()=>{n++;inp.value=P.trick.slice(0,n);if(n>=P.trick.length){clearInterval(iv);setTimeout(()=>solve(P),700);}},45);
      timers.push(iv);};return;}
    bindText(P,()=>solve(P));
  }
  else if(T==='mixer'){
    ia.innerHTML=`<div class="device"><div class="dhead"><span>COLOR MIXER</span><span class="lamp">●</span></div>
      ${P.sliders.map((s,i)=>`<div class="mixrow"><label>${s.l}</label><input type="range" min="0" max="100" step="${s.step||5}" value="${s.v||50}" data-i="${i}"><span class="mv" id="mv${i}">${s.v||50}</span></div>`).join('')}
      <div class="mixview" id="mx"></div>
      <button class="btn" id="ok" style="margin-top:12px">배합 확정!</button></div>`;
    const vals=P.sliders.map(s=>s.v||50);
    const paint=()=>{const [r,w,b]=vals;$('#mx').style.background='hsl('+(G.theme.h||0)+','+Math.min(r,100)+'%,'+Math.max(18,Math.min(70,w+b/2))+'%)';};
    ia.querySelectorAll('input[type=range]').forEach(sl=>sl.oninput=()=>{vals[+sl.dataset.i]=+sl.value;$('#mv'+sl.dataset.i).textContent=sl.value;paint();});
    paint();
    $('#ok').onclick=()=>{
      const tol=P.tol||5;
      P.targets.every((t,i)=>Math.abs(vals[i]-t)<=tol)?solve(P):wrong(P.wrongMsg||'음, 색이 조금 달라! 레시피를 다시 보자!');
    };
  }
  else if(T==='tuner'){
    ia.innerHTML=`<div class="device"><div class="dhead"><span>TUNER</span><span class="lamp">●</span></div>
      <canvas class="tunerwave" id="cv" width="640" height="150"></canvas>
      <div class="mixrow"><label>주파수</label><input type="range" min="1" max="99" value="50" id="fq"><span class="mv" id="fv">50</span></div>
      <p class="center dim small" id="ts">두 파형을 겹쳐 보자!</p>
      <div id="reveal"></div></div>`;
    const cv=$('#cv'),ctx=cv.getContext('2d');
    let f=50,matched=false;
    const draw=()=>{ctx.clearRect(0,0,640,150);
      const acc=getComputedStyle(document.documentElement).getPropertyValue('--acc');
      const wave=(freq,color)=>{ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=2;
        for(let x=0;x<640;x++){const y=75+Math.sin((x/640)*Math.PI*2*(freq/8))*46;x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();};
      wave(P.target,'#55555a');wave(f,acc.trim()||'#fff');};
    draw();
    $('#fq').oninput=e=>{if(matched)return;f=+e.target.value;$('#fv').textContent=f;draw();
      const d=Math.abs(f-P.target);
      $('#ts').textContent=d===0?'⚡ 일치!':(d<=3?'거의 다 왔어…!':(d<=10?'가까워지고 있어!':'두 파형을 겹쳐 보자!'));
      if(d===0){matched=true;
        $('#reveal').innerHTML='<div class="notenew">'+P.reveal+'</div>'+(P.a?inputRow(P.ph):'<button class="btn" id="ok" style="margin-top:10px">확인</button>');
        if(P.a)bindText(P,()=>solve(P));else $('#ok').onclick=()=>solve(P);
      }};
  }
  else if(T==='dial'){
    const code=String(P.code);const n=code.length;
    const sym=P.symbols||['0','1','2','3','4','5','6','7','8','9'];
    const cur=Array(n).fill(0);
    ia.innerHTML=`<div class="device"><div class="dhead"><span>DIAL · ${n}링</span><span class="lamp">●</span></div>
      <div class="dialrow">${cur.map((_,i)=>`<div class="dialring"><button data-u="${i}">▲</button><div class="dv" id="dv${i}">${sym[0]}</div><button data-d="${i}">▼</button></div>`).join('')}</div>
      <button class="btn" id="ok">열기!</button></div>`;
    const upd=i=>{$('#dv'+i).textContent=sym[cur[i]]};
    ia.querySelectorAll('[data-u]').forEach(b=>b.onclick=()=>{const i=+b.dataset.u;cur[i]=(cur[i]+1)%sym.length;upd(i);});
    ia.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{const i=+b.dataset.d;cur[i]=(cur[i]+sym.length-1)%sym.length;upd(i);});
    $('#ok').onclick=()=>{cur.map(c=>sym[c]).join('')===code?solve(P):wrong(P.wrongMsg||'딸깍… 안 열리네! 다시!');};
  }
  else if(T==='maze'){
    const g=P.grid.map(r=>r.split(''));
    const H=g.length,W=g[0].length;
    let pos,goal,moves=0;
    g.forEach((r,y)=>r.forEach((c,x)=>{if(c==='S')pos=[y,x];if(c==='E')goal=[y,x];}));
    const start=[...pos];
    ia.innerHTML=`<div class="mazegrid" id="mg" style="grid-template-columns:repeat(${W},1fr)"></div>
      <p class="center dim small" id="ms" style="margin-top:8px">${P.legend||''}</p>
      <div class="mazepad">
        <span class="blank"></span><button data-m="0,-1">▲</button><span class="blank"></span>
        <button data-m="-1,0">◀</button><button data-m="1,0">▶</button><button data-m="0,1">▼</button>
      </div>`;
    const watchOn=()=>P.phase?(Math.floor(moves/2)%2===0):true;
    const draw=()=>{
      $('#mg').innerHTML=g.map((r,y)=>r.map((c,x)=>{
        let cls='mz',ico='';
        if(c==='#'){cls+=' wall';}
        if(c==='L'){cls+=' lamp';ico='💡';}
        if(c==='W'){cls+=' watch';ico=watchOn()?'👁':'😴';}
        if(y===goal[0]&&x===goal[1]){cls+=' goal';ico='🚪';}
        if(y===pos[0]&&x===pos[1]){cls+=' me';ico='🚶';}
        return '<div class="'+cls+'">'+ico+'</div>';
      }).join('')).join('');
    };
    draw();
    ia.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{
      const [dx,dy]=b.dataset.m.split(',').map(Number);
      const ny=pos[0]+dy,nx=pos[1]+dx;
      if(ny<0||nx<0||ny>=H||nx>=W)return;
      const c=g[ny][nx];
      if(c==='#'||c==='L'){wrong(P.lampMsg||'그쪽은 못 지나가!');return;}
      moves++;
      if(c==='W'&&watchOn()){pos=[...start];moves=0;wrong(P.watchMsg||'들켰다! 다시 숨자!');draw();return;}
      pos=[ny,nx];draw();
      if(pos[0]===goal[0]&&pos[1]===goal[1])setTimeout(()=>solve(P),250);
    });
  }
  else if(T==='restore'){
    ia.innerHTML=`<div class="scratchwrap"><div class="under">${P.under}</div><canvas id="sc" height="150"></canvas></div>
      <p class="center dim small" style="margin-top:6px">${P.rubMsg||'문질러 보자!'}</p><div id="inp"></div>`;
    const cv=$('#sc');
    const w=cv.parentElement.clientWidth||340;cv.width=w;
    const ctx=cv.getContext('2d');
    ctx.fillStyle=P.fog||'#3a3a40';ctx.fillRect(0,0,w,150);
    let down=false,revealed=false;
    const erase=(x,y)=>{ctx.globalCompositeOperation='destination-out';ctx.beginPath();ctx.arc(x,y,22,0,7);ctx.fill();};
    const check=()=>{if(revealed)return;
      const d=ctx.getImageData(0,0,w,150).data;let clear=0;
      for(let i=3;i<d.length;i+=64)if(d[i]===0)clear++;
      if(clear/(d.length/64)>0.55){revealed=true;
        if(P.a){$('#inp').innerHTML=inputRow(P.ph);bindText(P,()=>solve(P));}
        else setTimeout(()=>solve(P),400);
      }};
    const xy=e=>{const r=cv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];};
    cv.addEventListener('pointerdown',e=>{down=true;erase(...xy(e));});
    cv.addEventListener('pointermove',e=>{if(down){erase(...xy(e));}});
    cv.addEventListener('pointerup',()=>{down=false;check();});
    cv.addEventListener('pointerleave',()=>{if(down){down=false;check();}});
  }
  else if(T==='slidepuzzle'){
    let tiles=[...P.tiles];
    const solvedKey=P.tiles.join('|');
    for(let k=0;k<120;k++){
      const h=tiles.indexOf(null);
      const opts=[h-3,h+3,h%3>0?h-1:-1,h%3<2?h+1:-1].filter(x=>x>=0&&x<9);
      const pick=opts[Math.floor(Math.random()*opts.length)];
      [tiles[h],tiles[pick]]=[tiles[pick],tiles[h]];
    }
    ia.innerHTML='<div class="puzz9" id="pz"></div><p class="center dim small" style="margin-top:6px">'+(P.pzMsg||'조각을 밀어서 원래대로!')+'</p><div id="inp"></div>';
    let done=false;
    const draw=()=>{
      $('#pz').innerHTML=tiles.map((t,i)=>'<button data-i="'+i+'" class="'+(t===null?'hole':'')+'">'+(t===null?'':t)+'</button>').join('');
      $('#pz').querySelectorAll('button').forEach(b=>b.onclick=()=>{
        if(done)return;
        const i=+b.dataset.i,h=tiles.indexOf(null);
        const adj=(Math.abs(i-h)===3)||(Math.abs(i-h)===1&&Math.floor(i/3)===Math.floor(h/3));
        if(!adj)return;
        [tiles[i],tiles[h]]=[tiles[h],tiles[i]];draw();
        if(tiles.join('|')===solvedKey){done=true;
          if(P.a){$('#inp').innerHTML='<div class="notenew">'+(P.reveal||'완성!')+'</div>'+inputRow(P.ph);bindText(P,()=>solve(P));}
          else setTimeout(()=>solve(P),400);
        }
      });
    };
    draw();
  }
  else if(T==='assemble'){
    const chosen=Array(P.slots.length).fill(null);
    let selItem=null;
    ia.innerHTML=`<div class="slots" id="sl">${P.slots.map((s,i)=>`<div class="slot" data-s="${i}"><b>${s}</b><span id="sv${i}">비어 있음</span></div>`).join('')}</div>
      <div class="itemgrid" id="it">${P.items.map((o,i)=>`<button class="opt" data-i="${i}">${o.t}</button>`).join('')}</div>
      <button class="btn" id="ok" style="margin-top:12px">이걸로 결정!</button>`;
    ia.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{
      ia.querySelectorAll('[data-i]').forEach(x=>x.classList.remove('sel'));
      b.classList.add('sel');selItem=+b.dataset.i;});
    ia.querySelectorAll('[data-s]').forEach(sd=>sd.onclick=()=>{
      if(selItem===null)return wrong('아이템을 먼저 골라 보자!');
      const si=+sd.dataset.s;chosen[si]=selItem;
      sd.classList.add('filled');$('#sv'+si).textContent=P.items[selItem].t;
      selItem=null;ia.querySelectorAll('[data-i]').forEach(x=>x.classList.remove('sel'));});
    $('#ok').onclick=()=>{
      if(chosen.some(c=>c===null))return wrong('빈 칸이 있어!');
      chosen.every((c,si)=>P.items[c].slot===si)?solve(P):wrong(P.wrongMsg||'음, 이 조합은 아니야!');
    };
  }
  else if(T==='pack'){
    const sel=new Set();
    const need=P.items.filter(x=>x.ok).length;
    ia.innerHTML=`<div class="itemgrid">${P.items.map((o,i)=>`<button class="opt" data-i="${i}">${o.t}<br><span class="dim small">${o.w}kg</span></button>`).join('')}</div>
      <p class="weightbar" id="wb">0.0 / ${P.maxw}kg</p>
      <button class="btn" id="ok" style="margin-top:10px">가방 잠그기!</button>`;
    const wsum=()=>[...sel].reduce((a,i)=>a+P.items[i].w,0);
    ia.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
      const i=+b.dataset.i;
      sel.has(i)?(sel.delete(i),b.classList.remove('sel')):(sel.add(i),b.classList.add('sel'));
      const w=wsum();const wb=$('#wb');
      wb.textContent=w.toFixed(1)+' / '+P.maxw+'kg';
      wb.classList.toggle('over',w>P.maxw);});
    $('#ok').onclick=()=>{
      if(wsum()>P.maxw)return wrong('가방이 빵빵해서 안 잠겨! 무게를 줄이자!');
      if(sel.size!==need)return wrong('가져갈 건 '+need+'개야!');
      [...sel].every(i=>P.items[i].ok)?solve(P):wrong(P.wrongMsg);
    };
  }
  else if(T==='terminal'){
    let step=0;
    ia.innerHTML=`<div class="device"><div class="dhead"><span>${P.dev||'TERMINAL'}</span><span class="lamp">●</span></div>
      <div class="termlog" id="tl"></div>${inputRow(P.ph)}</div>`;
    const log=(m,cls)=>{const t=$('#tl');t.innerHTML+=(cls?'<span class="'+cls+'">':'')+m+(cls?'</span>':'')+'\n';t.scrollTop=t.scrollHeight;};
    log(P.steps[0].prompt);
    const go=()=>{
      const v=$('#ans').value.trim();if(!v)return;
      const st=P.steps[step];
      if(st.a.some(a=>norm(a)===norm(v))){
        log('> '+v);log(st.ok||'…좋아!','ok');$('#ans').value='';
        step++;
        if(step>=P.steps.length){setTimeout(()=>solve(P),500);}
        else log(P.steps[step].prompt);
      }else{log('> '+v);log(st.no||'…음, 아닌가 봐!','no');$('#ans').value='';wrong('');}
    };
    $('#ok').onclick=go;$('#ans').addEventListener('keydown',e=>{if(e.key==='Enter')go()});
  }
  else if(T==='hotspot'){
    ia.innerHTML='<div class="board" '+(P.dark?'style="background:#050507"':'')+'>'+
      P.items.map((o,i)=>`<button class="spot${o.glow?' glow':''}" style="left:${o.x}%;top:${o.y}%" data-i="${i}"><span>${o.t}</span><em>${o.lbl||''}</em></button>`).join('')+
      '</div><p class="dim small center" style="margin-top:8px">직접 터치해서 찾아 보자!</p>';
    ia.querySelectorAll('.spot').forEach(b=>b.onclick=()=>{const o=P.items[+b.dataset.i];o.ok?solve(P):wrong(o.msg||P.wrongMsg);});
  }
  else if(T==='choice'||T==='anychoice'){
    ia.innerHTML=P.opts.map((o,i)=>`<button class="opt" data-i="${i}">${o.t}</button>`).join('');
    ia.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
      const o=P.opts[+b.dataset.i];
      if(T==='anychoice'){ia.querySelectorAll('.opt').forEach(x=>x.classList.add('lock'));b.classList.add('sel');setTimeout(()=>solve(P),500);return;}
      if(o.ok)solve(P);else wrong(o.msg||P.wrongMsg);});
  }
  else if(T==='multi'){
    const need=P.items.filter(x=>x.ok).length;
    ia.innerHTML='<div class="itemgrid">'+P.items.map((o,i)=>`<button class="opt" data-i="${i}">${o.t}</button>`).join('')+
      (need>1?`</div><button class="btn" id="ok" style="margin-top:12px">선택 완료! (${need}개)</button>`:'</div>');
    if(need===1){ia.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{P.items[+b.dataset.i].ok?solve(P):wrong(P.wrongMsg)});}
    else{const sel=new Set();
      ia.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;
        sel.has(i)?(sel.delete(i),b.classList.remove('sel')):(sel.add(i),b.classList.add('sel'));});
      $('#ok').onclick=()=>{if(sel.size!==need)return wrong(need+'개를 골라야 해!');
        [...sel].every(i=>P.items[i].ok)?solve(P):wrong(P.wrongMsg);};}
  }
  else if(T==='order'){
    let picked=[];
    ia.innerHTML=`<div class="seqline" id="sq"><span class="dim small">순서대로 눌러 보자!</span></div>
      <div class="itemgrid" style="margin-top:10px">${P.items.map((o,i)=>`<button class="opt" data-i="${i}">${o}</button>`).join('')}</div>
      <button class="btn ghost mini" id="rs" style="margin-top:10px">다시 놓기</button>`;
    const refresh=()=>{$('#sq').innerHTML=picked.length?picked.map(i=>'<span class="tok">'+P.items[i]+'</span>').join(''):'<span class="dim small">순서대로 눌러 보자!</span>';};
    ia.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
      const i=+b.dataset.i;if(picked.includes(i))return;
      picked.push(i);b.classList.add('lock');refresh();
      if(picked.length===P.seq.length){
        if(picked.every((v,k)=>v===P.seq[k]))setTimeout(()=>solve(P),300);
        else{wrong(P.wrongMsg);setTimeout(()=>{picked=[];ia.querySelectorAll('.opt').forEach(x=>x.classList.remove('lock'));refresh();},600);}
      }});
    $('#rs').onclick=()=>{picked=[];ia.querySelectorAll('.opt').forEach(x=>x.classList.remove('lock'));refresh();};
  }
  else if(T==='pairs'){
    let li=null,done=0;
    ia.innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div>${P.left.map((t,i)=>`<button class="opt" data-l="${i}">${t}</button>`).join('')}</div>
      <div>${P.right.map((t,i)=>`<button class="opt" data-r="${i}">${t}</button>`).join('')}</div></div>`;
    ia.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{ia.querySelectorAll('[data-l]').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');li=+b.dataset.l;});
    ia.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{
      if(li===null)return wrong('왼쪽을 먼저 골라 보자!');
      if(P.map[li]===+b.dataset.r){b.classList.add('lock');
        const lb=ia.querySelector(`[data-l="${li}"]`);lb.classList.add('lock');lb.classList.remove('sel');
        li=null;done++;if(done===P.left.length)setTimeout(()=>solve(P),300);
      }else wrong(P.wrongMsg);});
  }
  else if(T==='memory'){
    const pads=P.pads||['🔴','🟡','🔵','🟢'];const seq=P.mseq;
    let input=[],playing=false;
    ia.innerHTML=`<div class="padgrid">${pads.map((p,i)=>`<button class="pad" data-i="${i}">${p}</button>`).join('')}</div>
      <button class="btn ghost mini" id="pl" style="margin-top:12px">▶ 다시 보기</button>`;
    const flash=async()=>{playing=true;input=[];
      for(const i of seq){await new Promise(r=>setTimeout(r,420));
        const b=ia.querySelector(`[data-i="${i}"]`);if(!b)return;b.classList.add('on');
        await new Promise(r=>setTimeout(r,340));b.classList.remove('on');}
      playing=false;};
    ia.querySelectorAll('.pad').forEach(b=>b.onclick=()=>{
      if(playing)return;
      const i=+b.dataset.i;b.classList.add('on');setTimeout(()=>b.classList.remove('on'),200);
      input.push(i);const k=input.length-1;
      if(input[k]!==seq[k]){wrong(P.wrongMsg||'앗, 순서가 달라! 다시 보자!');input=[];return;}
      if(input.length===seq.length)setTimeout(()=>solve(P),350);});
    $('#pl').onclick=()=>{if(!playing)flash()};
    setTimeout(flash,600);
  }
  else if(T==='timing'){
    const reps=P.reps||1,speed=P.speed||1.6,zw=P.zw||18;
    let pos=0,dir=1,hit=0;const zl=50-zw/2;
    ia.innerHTML=`<div class="trackwrap"><div class="zone" style="left:${zl}%;width:${zw}%"></div><div class="marker" id="mk"></div></div>
      <p class="center dim small" style="margin-top:8px" id="tc">성공 0 / ${reps}</p>
      <button class="btn" id="st" style="margin-top:8px">지금!</button>`;
    const mk=$('#mk');
    const loop=()=>{pos+=dir*speed;if(pos>=97||pos<=0)dir*=-1;mk.style.left=pos+'%';timers[0]=requestAnimationFrame(loop);};
    timers.push(requestAnimationFrame(loop));
    $('#st').onclick=()=>{
      if(pos>=zl&&pos<=zl+zw){hit++;$('#tc').textContent='성공 '+hit+' / '+reps;
        if(hit>=reps){cancelAnimationFrame(timers[0]);solve(P);}}
      else{hit=0;$('#tc').textContent='성공 0 / '+reps;wrong(P.wrongMsg||'앗, 놓쳤다! 다시!');}};
  }
  else if(T==='balance'){
    const dur=P.dur||8,wind=P.wind||0.5;
    let x=0,v=0,t=0,alive=true,L=false,R=false,last=performance.now();
    ia.innerHTML=`<div class="balwrap"><div class="balzone"></div><span class="walker" id="wk">🚶</span></div>
      <p class="center dim small" style="margin-top:8px" id="bt">버티기 0.0 / ${dur}초</p>
      <div class="balbtns"><button id="bl">◀</button><button id="br">▶</button></div>`;
    const wk=$('#wk'),bw=ia.querySelector('.balwrap');
    const press=(elm,set)=>{elm.addEventListener('pointerdown',ev=>{ev.preventDefault();set(true)});
      ['pointerup','pointerleave','pointercancel'].forEach(e=>elm.addEventListener(e,()=>set(false)));};
    press($('#bl'),s=>L=s);press($('#br'),s=>R=s);
    const loop=(now)=>{
      if(!alive)return;
      const dt=Math.min((now-last)/1000,.05);last=now;
      v+=(Math.random()-.5)*wind;if(L)v-=1.1;if(R)v+=1.1;
      v*=.96;x+=v*dt*60;
      const W2=bw.clientWidth;
      wk.style.left=(W2/2-18+x)+'px';wk.style.transform='rotate('+(x*.6)+'deg)';
      if(Math.abs(x)>W2*.22){alive=false;wrong(P.wrongMsg||'비틀! 넘어졌다! 다시!');
        setTimeout(()=>{if(!$('#wk'))return;x=0;v=0;t=0;alive=true;last=performance.now();timers.push(requestAnimationFrame(loop));},900);return;}
      t+=dt;const bt=$('#bt');if(bt)bt.textContent='버티기 '+t.toFixed(1)+' / '+dur+'초';
      if(t>=dur){solve(P);return;}
      timers.push(requestAnimationFrame(loop));};
    timers.push(requestAnimationFrame(loop));
  }
}
/* ---- 엔딩 ---- */
function ending(){
  header();
  let prism={};try{prism=JSON.parse(localStorage.getItem(PKEY))||{}}catch(e){}
  prism[G.colorKey]=LETTER[G.colorKey];
  localStorage.setItem(PKEY,JSON.stringify(prism));
  const got=ORDER.filter(k=>prism[k]).length;
  render(`
   ${img(G.assets+'ending.webp','tinted')}
   <div class="center">${avatarSVG(1,84)}<p class="small acc" style="margin-top:4px">100% — ${G.short}의 색이 완성되었다</p></div>
   <div class="card center"><p>${G.endText}</p></div>
   <div class="codecard">
     <p class="small dim">파이널 입장코드 조각</p>
     <div class="letter">${LETTER[G.colorKey]}</div>
     <div class="prismrow">${ORDER.map(k=>`<span class="${prism[k]?'got':''}">${prism[k]||'?'}</span>`).join('')}</div>
     <p class="small dim" style="margin-top:10px">${got>=5?'다섯 조각 완성! 파이널 <b>색깔있는세상</b> 입장 준비 완료.':'다섯 색의 문을 모두 열면 파이널이 무료로 열립니다. ('+got+'/5)'}</p>
   </div>
   <div class="card center"><p class="small" style="font-family:'Gaegu';font-size:1.15rem">"${G.credit}"</p></div>
   ${G.endNotice?'<div class="hintbox">'+G.endNotice+'</div>':''}
   <button class="btn ghost" id="home">플랫폼으로 돌아가기</button>
   <button class="btn ghost" id="reset">기록 초기화</button>
  `);
  $('#home').onclick=()=>{location.href='../index.html'};
  $('#reset').onclick=()=>{if(confirm('이 게임의 진행 기록을 지울까요? (PRISM 조각은 유지)')){S={i:0,keys:[],notes:[]};save();refreshNotesBtn();startScreen();}};
}
startScreen();
})();
