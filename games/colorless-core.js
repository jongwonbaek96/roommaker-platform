/* ===== 색깔없는세상 공용 엔진 v2 =====
   - 세상은 흑백에서 시작한다. 미션을 풀수록 캐릭터와 세상이 그 색으로 물든다.
   - 미션형 인터랙션: 키패드 금고, 현장 탐색(핫스팟), 밸런스, 타이밍, 기억, 조립 등 */
(function(){
const G=window.GAME;
const root=document.documentElement.style;
root.setProperty('--bg',G.theme.bg);
root.setProperty('--card',G.theme.card||'#141416');
root.setProperty('--line',G.theme.line||'#28282c');
document.title='색깔없는세상 : '+G.title;
const $=s=>document.querySelector(s);
const stage=$('#stage');
const SKEY='cw_'+G.id;
const PKEY='cw_prism';
const ORDER=['R','Y','B','G','W'];
const LETTER={R:'P',Y:'R',B:'I',G:'S',W:'M'};
let S=load()||{i:0,keys:[]};
let timers=[];let gid=0;

function load(){try{return JSON.parse(localStorage.getItem(SKEY))}catch(e){return null}}
function save(){localStorage.setItem(SKEY,JSON.stringify(S))}
function clearTimers(){timers.forEach(t=>{clearInterval(t);clearTimeout(t);cancelAnimationFrame(t)});timers=[]}
function norm(s){return String(s).toLowerCase().replace(/[\s,\-:._!?~'"()]/g,'')}
function el(html){const d=document.createElement('div');d.innerHTML=html;return d}

/* ----- 채색 시스템: 진행도 = 물든 정도 ----- */
function prog(){return Math.min(S.i/G.puzzles.length,1)}
function accFor(p){
  const t=G.theme;
  if(t.s===0)return 'hsl(0,0%,'+Math.round(35+60*p)+'%)';
  return 'hsl('+t.h+','+Math.round(t.s*Math.max(p,.10))+'%,'+t.l+'%)';
}
function tint(){root.setProperty('--acc',accFor(prog()));}
function avatarSVG(p,w){
  gid++;const id='ag'+gid;const off=Math.round((1-p)*100);
  return '<svg viewBox="0 0 60 92" width="'+w+'" style="display:block;margin:0 auto">'+
  '<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1">'+
  '<stop offset="'+off+'%" stop-color="#4a4a4e"/><stop offset="'+off+'%" stop-color="'+accFor(Math.max(p,.25))+'"/>'+
  '</linearGradient></defs>'+
  '<circle cx="30" cy="15" r="11.5" fill="url(#'+id+')"/>'+
  '<path d="M30 29 C15 29 11 43 11 57 L15 90 L25 90 L27 62 L33 62 L35 90 L45 90 L49 57 C49 43 45 29 30 29 Z" fill="url(#'+id+')"/></svg>';
}
function header(){
  $('#hT').textContent='색깔없는세상 · '+G.short;
  const p=G.puzzles;
  $('#hP').innerHTML='<span style="vertical-align:middle;margin-right:8px">'+(S.i>=p.length?'CLEAR':('M '+String(S.i+1).padStart(2,'0')+'/'+p.length))+'</span><span class="havatar">'+avatarSVG(prog(),18)+'</span>';
  tint();
}
function render(html){clearTimers();stage.innerHTML=html;stage.style.animation='none';void stage.offsetWidth;stage.style.animation='';window.scrollTo(0,0)}

/* ---------- 화면 ---------- */
function startScreen(){
  header();
  const resume=S.i>0&&S.i<G.puzzles.length;
  render(`
   <div class="center" style="padding:8px 0 0">${avatarSVG(prog(),74)}</div>
   <h1 class="center">${G.title}</h1>
   <p class="center dim">${G.subtitle}</p>
   <div class="card small dim">${G.synopsis}</div>
   <div class="card small center">이 세상에는 색이 없다.<br>당신이 미션을 해결할 때마다 — <b class="acc">${G.short}</b>이 조금씩 물든다.</div>
   <div class="hintbox">⚠ 본 게임은 <b>어른을 위한 동화</b>이며, 무거운 주제를 은유적으로 다룹니다.${G.notice?'<br>'+G.notice:''}</div>
   <button class="btn" id="go">${resume?'이어서 하기 (MISSION '+(S.i+1)+')':'일기장을 펼친다'}</button>
   ${resume?'<button class="btn ghost" id="re">처음부터 다시</button>':''}
  `);
  $('#go').onclick=()=>{ if(S.i===0) diaryScreen(1); else puzzleScreen(); };
  const re=$('#re'); if(re) re.onclick=()=>{ if(confirm('진행 기록을 지우고 처음부터 시작할까요?')){S={i:0,keys:[]};save();startScreen();} };
}
function diaryScreen(chNum){
  header();
  const ch=G.chapters[chNum-1];
  render(`
   <p class="dim small">제${chNum}장 · 그림일기</p>
   <div class="paper gray">${ch.diary}<div class="pnum">- ${chNum}쪽 -</div></div>
   <button class="btn" id="go">${chNum===1?'이야기 속으로':'계속하기'}</button>
  `);
  $('#go').onclick=puzzleScreen;
}
function chapterEnd(chNum){
  header();
  const ch=G.chapters[chNum-1];
  const pct=Math.round(prog()*100);
  render(`
   <p class="dim small">제${chNum}장 · 일기 다시 읽기</p>
   <div class="paper">${ch.diary}<div class="pnum">- ${chNum}쪽 -</div></div>
   <div class="card"><p class="small dim">잉크가 스며들며, 같은 그림이 다르게 보인다.</p><p style="margin-top:6px">${ch.reveal}</p>
   <p class="small dim" style="margin-top:8px">획득한 열쇠말</p><span class="keytag">${ch.key}</span></div>
   <div class="card center">
     <div class="dripwrap">${avatarSVG(prog(),64)}</div>
     <p class="small" style="margin-top:6px"><b class="acc">${G.short}</b>이 <b class="acc">${pct}%</b> 물들었다</p>
   </div>
   <button class="btn" id="go">${chNum===5?'문 앞으로':'다음 장으로'}</button>
  `);
  $('#go').onclick=()=>{ if(chNum===5) puzzleScreen(); else diaryScreen(chNum+1); };
}
function puzzleScreen(){
  header();
  if(S.i>=G.puzzles.length){ending();return;}
  const P=G.puzzles[S.i];
  let hintUsed=0;
  let scene=(P.scene||'').replace('{KEYS}',S.keys.map(k=>'<span class="keytag">'+k+'</span>').join(''));
  render(`
   <div class="missionbar"><span class="mnum">MISSION ${String(S.i+1).padStart(2,'0')}</span><span class="dim small">${P.id} · 제${P.ch}장</span></div>
   <h2>${P.t}</h2>
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
  buildInteraction(P);
}
function wrong(msg){
  const wm=$('#wm');if(wm)wm.textContent=msg||'…아직 아니다.';
  stage.classList.remove('shake');void stage.offsetWidth;stage.classList.add('shake');
}
function solve(P){
  const ch=P.ch;
  const isChEnd=(S.i+1>=G.puzzles.length)||(G.puzzles[S.i+1]&&G.puzzles[S.i+1].ch!==ch);
  const last=S.i+1>=G.puzzles.length;
  if(isChEnd&&!last&&G.chapters[ch-1].key&&!S.keys.includes(G.chapters[ch-1].key))S.keys.push(G.chapters[ch-1].key);
  const nextP=Math.min((S.i+1)/G.puzzles.length,1);
  const ov=el(`<div class="overlay"><div class="card">
    <p class="acc" style="font-weight:700">✓ MISSION CLEAR — ${P.id}</p>
    <p style="margin-top:8px">${P.after||''}</p>
    <div class="center" style="margin-top:10px">${avatarSVG(nextP,44)}</div>
    <button class="btn" style="margin-top:14px" id="nx">계속</button></div></div>`);
  document.body.appendChild(ov);
  ov.querySelector('#nx').onclick=()=>{
    ov.remove();S.i++;save();header();
    if(last){ending();}
    else if(isChEnd){chapterEnd(ch);}
    else puzzleScreen();
  };
}
/* ---------- 인터랙션 ---------- */
function isNumericAnswer(P){return P.a&&P.a.some(x=>/^\d+$/.test(String(x)))}
function buildInteraction(P){
  const ia=$('#ia');
  const T=P.type;
  if(T==='text'&&isNumericAnswer(P)){ /* 키패드 금고 */
    const maxlen=Math.max(...P.a.filter(x=>/^\d+$/.test(String(x))).map(x=>String(x).length));
    let val='';
    ia.innerHTML=`<div class="kdisp" id="kd">${'·'.repeat(maxlen)}</div>
      <div class="kp">${[1,2,3,4,5,6,7,8,9,'C',0,'⌫'].map(k=>`<button data-k="${k}">${k}</button>`).join('')}</div>
      <button class="btn" id="ok" style="margin-top:12px">해제</button>`;
    const disp=()=>{$('#kd').textContent=val?val:'·'.repeat(maxlen)};
    ia.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{
      const k=b.dataset.k;
      if(k==='C')val='';else if(k==='⌫')val=val.slice(0,-1);
      else if(val.length<maxlen+2)val+=k;
      disp();
    });
    $('#ok').onclick=()=>{
      if(!val)return wrong('숫자를 입력하자.');
      if(P.a.some(a=>norm(a)===norm(val)))solve(P);else{wrong(P.wrongMsg||'잠금장치가 꿈쩍도 않는다.');val='';disp();}
    };
  }
  else if(T==='text'||T==='trick'||T==='free'){
    ia.innerHTML=`<input type="text" id="ans" placeholder="${P.ph||'정답 입력'}" autocomplete="off"><button class="btn" id="ok" style="margin-top:10px">확인</button>`;
    const go=()=>{
      const v=$('#ans').value.trim();
      if(!v)return wrong('무언가 입력해 보자.');
      if(T==='free')return solve(P);
      if(T==='trick'){
        const inp=$('#ans');let n=0;
        const iv=setInterval(()=>{n++;inp.value=P.trick.slice(0,n);if(n>=P.trick.length){clearInterval(iv);setTimeout(()=>solve(P),700);}},45);
        timers.push(iv);$('#ok').disabled=true;return;
      }
      if(P.a.some(a=>norm(a)===norm(v)))solve(P);else wrong(P.wrongMsg);
    };
    $('#ok').onclick=go;
    $('#ans').addEventListener('keydown',e=>{if(e.key==='Enter')go()});
  }
  else if(T==='hotspot'){ /* 현장 탐색 */
    ia.innerHTML='<div class="board" '+(P.dark?'style="background:#050507"':'')+'>'+
      P.items.map((o,i)=>`<button class="spot${o.glow?' glow':''}" style="left:${o.x}%;top:${o.y}%" data-i="${i}"><span>${o.t}</span><em>${o.lbl||''}</em></button>`).join('')+
      '</div><p class="dim small center" style="margin-top:8px">현장을 조사하라 — 대상을 직접 터치</p>';
    ia.querySelectorAll('.spot').forEach(b=>b.onclick=()=>{
      const o=P.items[+b.dataset.i];
      if(o.ok)solve(P);else wrong(o.msg||P.wrongMsg);
    });
  }
  else if(T==='choice'||T==='anychoice'){
    ia.innerHTML=P.opts.map((o,i)=>`<button class="opt" data-i="${i}">${o.t}</button>`).join('');
    ia.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
      const o=P.opts[+b.dataset.i];
      if(T==='anychoice'){ia.querySelectorAll('.opt').forEach(x=>x.classList.add('lock'));b.classList.add('sel');setTimeout(()=>solve(P),500);return;}
      if(o.ok)solve(P);else wrong(o.msg||P.wrongMsg);
    });
  }
  else if(T==='multi'){
    const need=P.items.filter(x=>x.ok).length;
    if(need===1){
      ia.innerHTML='<div class="itemgrid">'+P.items.map((o,i)=>`<button class="opt" data-i="${i}">${o.t}</button>`).join('')+'</div>';
      ia.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{P.items[+b.dataset.i].ok?solve(P):wrong(P.wrongMsg)});
    }else{
      ia.innerHTML='<div class="itemgrid">'+P.items.map((o,i)=>`<button class="opt" data-i="${i}">${o.t}</button>`).join('')+`</div><button class="btn" id="ok" style="margin-top:12px">선택 완료 (${need}개)</button>`;
      const sel=new Set();
      ia.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
        const i=+b.dataset.i;
        sel.has(i)?(sel.delete(i),b.classList.remove('sel')):(sel.add(i),b.classList.add('sel'));
      });
      $('#ok').onclick=()=>{
        if(sel.size!==need)return wrong(need+'개를 골라야 한다.');
        [...sel].every(i=>P.items[i].ok)?solve(P):wrong(P.wrongMsg);
      };
    }
  }
  else if(T==='order'){
    let picked=[];
    ia.innerHTML=`<div class="seqline" id="sq"><span class="dim small">순서대로 누르세요</span></div>
      <div class="itemgrid" style="margin-top:10px">${P.items.map((o,i)=>`<button class="opt" data-i="${i}">${o}</button>`).join('')}</div>
      <button class="btn ghost mini" id="rs" style="margin-top:10px">다시 놓기</button>`;
    const refresh=()=>{$('#sq').innerHTML=picked.length?picked.map(i=>'<span class="tok">'+P.items[i]+'</span>').join(''):'<span class="dim small">순서대로 누르세요</span>';};
    ia.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
      const i=+b.dataset.i;if(picked.includes(i))return;
      picked.push(i);b.classList.add('lock');refresh();
      if(picked.length===P.seq.length){
        if(picked.every((v,k)=>v===P.seq[k]))setTimeout(()=>solve(P),300);
        else{wrong(P.wrongMsg);setTimeout(()=>{picked=[];ia.querySelectorAll('.opt').forEach(x=>x.classList.remove('lock'));refresh();},600);}
      }
    });
    $('#rs').onclick=()=>{picked=[];ia.querySelectorAll('.opt').forEach(x=>x.classList.remove('lock'));refresh();};
  }
  else if(T==='pairs'){
    let li=null,done=0;
    ia.innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div>${P.left.map((t,i)=>`<button class="opt" data-l="${i}">${t}</button>`).join('')}</div>
      <div>${P.right.map((t,i)=>`<button class="opt" data-r="${i}">${t}</button>`).join('')}</div></div>`;
    ia.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{
      ia.querySelectorAll('[data-l]').forEach(x=>x.classList.remove('sel'));
      b.classList.add('sel');li=+b.dataset.l;
    });
    ia.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{
      if(li===null)return wrong('왼쪽을 먼저 고르세요.');
      if(P.map[li]===+b.dataset.r){
        b.classList.add('lock');
        const lb=ia.querySelector(`[data-l="${li}"]`);lb.classList.add('lock');lb.classList.remove('sel');
        li=null;done++;
        if(done===P.left.length)setTimeout(()=>solve(P),300);
      }else wrong(P.wrongMsg);
    });
  }
  else if(T==='memory'){
    const pads=P.pads||['🔴','🟡','🔵','🟢'];
    const seq=P.mseq;
    let input=[],playing=false;
    ia.innerHTML=`<div class="padgrid">${pads.map((p,i)=>`<button class="pad" data-i="${i}">${p}</button>`).join('')}</div>
      <button class="btn ghost mini" id="pl" style="margin-top:12px">▶ 패턴 다시 보기</button>`;
    const flash=async()=>{
      playing=true;input=[];
      for(const i of seq){
        await new Promise(r=>setTimeout(r,420));
        const b=ia.querySelector(`[data-i="${i}"]`);if(!b)return;b.classList.add('on');
        await new Promise(r=>setTimeout(r,340));b.classList.remove('on');
      }
      playing=false;
    };
    ia.querySelectorAll('.pad').forEach(b=>b.onclick=()=>{
      if(playing)return;
      const i=+b.dataset.i;b.classList.add('on');setTimeout(()=>b.classList.remove('on'),200);
      input.push(i);
      const k=input.length-1;
      if(input[k]!==seq[k]){wrong(P.wrongMsg||'패턴이 다르다. 다시 들어보자.');input=[];return;}
      if(input.length===seq.length)setTimeout(()=>solve(P),350);
    });
    $('#pl').onclick=()=>{if(!playing)flash()};
    setTimeout(flash,600);
  }
  else if(T==='timing'){
    const reps=P.reps||1,speed=P.speed||1.6,zw=P.zw||18;
    let pos=0,dir=1,hit=0;
    const zl=50-zw/2;
    ia.innerHTML=`<div class="trackwrap"><div class="zone" style="left:${zl}%;width:${zw}%"></div><div class="marker" id="mk"></div></div>
      <p class="center dim small" style="margin-top:8px" id="tc">성공 0 / ${reps}</p>
      <button class="btn" id="st" style="margin-top:8px">멈춰!</button>`;
    const mk=$('#mk');
    const loop=()=>{pos+=dir*speed;if(pos>=97||pos<=0)dir*=-1;mk.style.left=pos+'%';timers[0]=requestAnimationFrame(loop);};
    timers.push(requestAnimationFrame(loop));
    $('#st').onclick=()=>{
      if(pos>=zl&&pos<=zl+zw){hit++;$('#tc').textContent='성공 '+hit+' / '+reps;
        if(hit>=reps){cancelAnimationFrame(timers[0]);solve(P);}
      }else{hit=0;$('#tc').textContent='성공 0 / '+reps;wrong(P.wrongMsg||'놓쳤다! 처음부터.');}
    };
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
      v+=(Math.random()-.5)*wind; if(L)v-=1.1; if(R)v+=1.1;
      v*=.96; x+=v*dt*60;
      const W=bw.clientWidth;
      wk.style.left=(W/2-18+x)+'px';
      wk.style.transform='rotate('+(x*.6)+'deg)';
      if(Math.abs(x)>W*.22){alive=false;wrong(P.wrongMsg||'비틀! 넘어졌다. 다시.');
        setTimeout(()=>{if(!$('#wk'))return;x=0;v=0;t=0;alive=true;last=performance.now();timers.push(requestAnimationFrame(loop));},900);return;}
      t+=dt;const bt=$('#bt');if(bt)bt.textContent='버티기 '+t.toFixed(1)+' / '+dur+'초';
      if(t>=dur){solve(P);return;}
      timers.push(requestAnimationFrame(loop));
    };
    timers.push(requestAnimationFrame(loop));
  }
}
/* ---------- 엔딩 ---------- */
function ending(){
  header();
  let prism={};try{prism=JSON.parse(localStorage.getItem(PKEY))||{}}catch(e){}
  prism[G.colorKey]=LETTER[G.colorKey];
  localStorage.setItem(PKEY,JSON.stringify(prism));
  const got=ORDER.filter(k=>prism[k]).length;
  render(`
   <div class="doorwrap"><span class="door" id="dr">🚪</span></div>
   <div class="center">${avatarSVG(1,84)}<p class="small acc" style="margin-top:4px">100% — ${G.short}의 색이 완성되었다</p></div>
   <div class="card center"><p>${G.endText}</p></div>
   <div class="codecard">
     <p class="small dim">파이널 입장코드 조각</p>
     <div class="letter">${LETTER[G.colorKey]}</div>
     <div class="prismrow">${ORDER.map(k=>`<span class="${prism[k]?'got':''}">${prism[k]||'?'}</span>`).join('')}</div>
     <p class="small dim" style="margin-top:10px">${got>=5?'다섯 조각 완성! 파이널 <b>색깔있는세상</b> 입장 준비 완료.':'다섯 색의 문을 모두 열면 파이널이 무료로 열립니다. ('+got+'/5)'}</p>
     <p class="small dim" style="margin-top:4px">이 기기에 자동 저장되었습니다. 조각 글자는 따로 메모해도 좋아요.</p>
   </div>
   <div class="card center"><p class="small" style="font-family:'Gaegu';font-size:1.15rem">"${G.credit}"</p></div>
   ${G.endNotice?'<div class="hintbox">'+G.endNotice+'</div>':''}
   <button class="btn ghost" id="home">플랫폼으로 돌아가기</button>
   <button class="btn ghost" id="reset">기록 초기화</button>
  `);
  setTimeout(()=>{$('#dr').classList.add('open')},400);
  $('#home').onclick=()=>{location.href='../index.html'};
  $('#reset').onclick=()=>{if(confirm('이 게임의 진행 기록을 지울까요? (PRISM 조각은 유지)')){S={i:0,keys:[]};save();startScreen();}};
}
startScreen();
})();
