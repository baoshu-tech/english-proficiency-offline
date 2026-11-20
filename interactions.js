const views = [...document.querySelectorAll('.view')];

function showView() {
  let key = location.hash.slice(1) || 'overview';
  if (!views.some(view => view.id === key)) {
    key = 'overview';
    history.replaceState(history.state, '', '#' + key);
  }
  for (const view of views) view.hidden = view.id !== key;
  for (const link of document.querySelectorAll('[data-view]')) {
    const active = link.dataset.view === key;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
}

window.addEventListener('hashchange', showView);
showView();

(()=>{const canvas=document.getElementById('curve-canvas'),path=document.getElementById('curve-trace'),track=document.getElementById('curve-track'),bead=document.getElementById('curve-bead'),nodes=[...canvas.querySelectorAll('.milestone')],motion=matchMedia('(prefers-reduced-motion: reduce)');let total=0,thresholds=[],fraction=0,raf=0,running=false,seen=false,inView=false,last=0,active=-1;const duration=10500;
function select(i,announce=false){if(i!==active){active=i;nodes.forEach((n,j)=>{n.classList.toggle('reached',j<=i);n.classList.toggle('active',j===i);n.setAttribute('aria-pressed',String(j===i))});}if(announce)document.getElementById('curve-announcement').textContent=nodes[i].getAttribute('aria-label');}
function paint(){if(!total)return;path.style.strokeDasharray=String(total);path.style.strokeDashoffset=String(total*(1-fraction));const p=path.getPointAtLength(total*fraction);bead.setAttribute('cx',p.x);bead.setAttribute('cy',p.y);let i=0;thresholds.forEach((t,j)=>{if(fraction>=t-.003)i=j});select(i);}
function layout(){if(!canvas.offsetWidth||canvas.closest('.view').hidden)return;const r=canvas.getBoundingClientRect(),vertical=false,pts=nodes.map(n=>{const b=n.querySelector('.milestone-dot').getBoundingClientRect();return{x:b.x+b.width/2-r.x,y:b.y+b.height/2-r.y}});let line='M '+pts[0].x+' '+pts[0].y;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];line+=vertical?' C '+a.x+' '+(a.y+(b.y-a.y)*.55)+' '+b.x+' '+(b.y-(b.y-a.y)*.55)+' '+b.x+' '+b.y:' C '+(a.x+(b.x-a.x)*.48)+' '+a.y+' '+(b.x-(b.x-a.x)*.48)+' '+b.y+' '+b.x+' '+b.y;}path.setAttribute('d',line);track.setAttribute('d',line);total=path.getTotalLength();thresholds=pts.map(q=>{let nearest=0,best=Infinity;for(let j=0;j<=600;j++){const p=path.getPointAtLength(total*j/600),dist=(p.x-q.x)**2+(p.y-q.y)**2;if(dist<best){best=dist;nearest=j/600}}return nearest});thresholds[0]=0;thresholds[5]=1;paint();}

function stop(){cancelAnimationFrame(raf);raf=0;running=false;last=0;}
function frame(now){if(!running)return;if(last)fraction=Math.min(1,fraction+(now-last)/duration);last=now;paint();if(fraction<1)raf=requestAnimationFrame(frame);else stop();}
function start(){stop();if(motion.matches||fraction>=1){paint();return;}running=true;last=0;raf=requestAnimationFrame(frame);}
nodes.forEach((n,i)=>{n.onclick=()=>{stop();layout();fraction=thresholds[i]||0;paint();select(i,true);seen=true;start()}});
new ResizeObserver(layout).observe(canvas);new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView){layout();if(!seen){seen=true;if(motion.matches)fraction=1;}if(!document.hidden)start()}else stop()},{threshold:.15}).observe(canvas);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(inView)start()});motion.addEventListener('change',()=>{stop();if(motion.matches){fraction=1;paint()}else if(inView)start()});layout();
})();

(()=>{const strip=document.querySelector('.pitch-strip'),curriculum=document.getElementById('curriculum'),orbit=document.getElementById('ability-orbit'),tiles=[...orbit.querySelectorAll('.ability-tile')],motion=matchMedia('(prefers-reduced-motion: reduce)');let angle=-Math.PI/2,frame=0,last=0,visible=false,paused=false,rx=0,ry=0,introElapsed=1300;const mobileOrbit=matchMedia("(max-width:760px)");
function flip(){if(curriculum.hidden)return;strip.classList.remove('is-flipping');void strip.offsetWidth;strip.classList.add('is-flipping')}
window.addEventListener('hashchange',flip);document.querySelector('[data-view="curriculum"]').addEventListener('click',()=>{if(!curriculum.hidden)flip()});flip();
function draw(){const entering=!motion.matches,p=entering?Math.min(1,introElapsed/1300):1,ease=1-Math.pow(1-p,3);tiles.forEach((tile,i)=>{const a=angle+i*Math.PI*2/tiles.length,x=Math.cos(a)*rx*ease,y=Math.sin(a)*ry*ease,tilt=(i%2?4:-4)*ease;tile.style.opacity=String(.2+.8*ease);tile.style.transform='translate(calc(-50% + '+x+'px), calc(-50% + '+y+'px)) rotate('+tilt+'deg) scale('+(.35+.65*ease)+')'})}
function size(){if(!orbit.offsetWidth)return;rx=(orbit.clientWidth-tiles[0].offsetWidth)/2-15;ry=(orbit.clientHeight-tiles[0].offsetHeight)/2-20;draw()}
function stop(){cancelAnimationFrame(frame);frame=0;last=0}
function tick(now){if(last){const delta=Math.min(now-last,64);if(introElapsed<1300)introElapsed=Math.min(1300,introElapsed+delta);else angle+=delta*Math.PI*2/65000}last=now;draw();frame=requestAnimationFrame(tick)}
function run(){stop();if(visible&&!paused&&!document.hidden&&!motion.matches)frame=requestAnimationFrame(tick)}
new ResizeObserver(size).observe(orbit);new IntersectionObserver(es=>{const nextVisible=es[0].isIntersecting;if(nextVisible&&!visible&&!motion.matches){introElapsed=0;angle=-Math.PI/2}visible=nextVisible;size();run()},{threshold:.1}).observe(orbit);document.addEventListener('visibilitychange',run);motion.addEventListener('change',()=>{draw();run()});mobileOrbit.addEventListener('change',()=>{introElapsed=1300;size();run()});size();
document.documentElement.classList.add('motion-ready');const fades=[...document.querySelectorAll('.dual-card')],observer=new IntersectionObserver(es=>{es.forEach(e=>e.target.classList.toggle('revealed',e.isIntersecting))},{threshold:.15});fades.forEach(e=>observer.observe(e));
})();

(()=>{const home=document.getElementById('overview'),hero=home.querySelector('.hero'),art=hero.querySelector('.art'),cards=[...home.querySelectorAll('.core-highlight')],motion=matchMedia('(prefers-reduced-motion: reduce)');let raf=0;document.documentElement.classList.add('home-motion');
function paint(){raf=0;if(home.hidden)return;const y=Math.max(0,Math.min(window.scrollY,hero.offsetTop+hero.offsetHeight));art.style.setProperty('--hero-bg-y','0px');art.style.setProperty('--hero-fg-y','0px')}
function scroll(){if(!raf)raf=requestAnimationFrame(paint)}
function enter(){if(home.hidden)return;home.classList.remove('home-enter');void home.offsetWidth;home.classList.add('home-enter');cards.forEach(c=>c.classList.remove('highlight-visible'));paint()}
const observer=new IntersectionObserver(entries=>{const entering=entries.filter(e=>e.isIntersecting);entering.forEach((e,i)=>{e.target.style.transitionDelay=(i*.32)+'s';e.target.classList.add('highlight-visible')});entries.filter(e=>!e.isIntersecting).forEach(e=>{e.target.style.transitionDelay='0s';e.target.classList.remove('highlight-visible')})},{threshold:.12});cards.forEach(c=>observer.observe(c));
window.addEventListener('hashchange',enter);motion.addEventListener('change',paint);enter();
})();

(()=>{const rail=document.getElementById('stage-carousel'),slides=[...rail.children],prev=document.getElementById('stage-prev'),next=document.getElementById('stage-next'),count=document.getElementById('stage-count'),motion=matchMedia('(prefers-reduced-motion: reduce)');let index=0;
function sync(){index=Math.max(0,Math.min(2,Math.round(rail.scrollLeft/(rail.clientWidth+24))));prev.disabled=index===0;next.disabled=index===2;count.textContent='0'+(index+1)+' / 03'}
function move(n){rail.scrollTo({left:(rail.clientWidth+24)*Math.max(0,Math.min(2,index+n)),behavior:motion.matches?'instant':'smooth'})}prev.onclick=()=>move(-1);next.onclick=()=>move(1);rail.addEventListener('scroll',sync,{passive:true});rail.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});sync();
})();

(()=>{const rail=document.getElementById('feedback-carousel'),slides=[...rail.children],prev=document.getElementById('feedback-prev'),next=document.getElementById('feedback-next'),count=document.getElementById('feedback-count'),motion=matchMedia('(prefers-reduced-motion: reduce)');let index=0,frame=0;
function paint(){frame=0;const step=rail.clientWidth+24;if(!step)return;const pos=rail.scrollLeft/step;index=Math.max(0,Math.min(slides.length-1,Math.round(pos)));prev.disabled=index===0;next.disabled=index===slides.length-1;count.textContent='0'+(index+1)+' / 05';slides.forEach((el,i)=>{const distance=pos-i,amount=Math.min(1,Math.abs(distance)),card=el.firstElementChild;el.style.zIndex=String(20-Math.round(amount*10));card.style.setProperty('--feedback-shift',motion.matches?'0px':(distance*step*.18)+'px');card.style.setProperty('--feedback-scale',motion.matches?1:1-amount*.045);card.style.setProperty('--feedback-blur',motion.matches?'0px':amount*7+'px')})}
function update(){if(!frame)frame=requestAnimationFrame(paint)}function move(n){rail.scrollTo({left:(rail.clientWidth+24)*Math.max(0,Math.min(slides.length-1,index+n)),behavior:motion.matches?'instant':'smooth'})}prev.onclick=()=>move(-1);next.onclick=()=>move(1);rail.addEventListener('scroll',update,{passive:true});rail.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});new ResizeObserver(update).observe(rail);window.addEventListener('hashchange',update);motion.addEventListener('change',update);paint();})();

document.querySelectorAll('.technique-fold').forEach(item=>item.addEventListener('toggle',()=>{if(item.open&&!matchMedia('(max-width:760px)').matches)document.querySelectorAll('.technique-fold').forEach(other=>{if(other!==item)other.open=false})}));

(()=>{const stats=document.querySelector('.hero .stats'),windows=[...stats.querySelectorAll('.count-window')],motion=matchMedia('(prefers-reduced-motion: reduce)');function set(final){windows.forEach(w=>{const strip=w.firstElementChild;strip.style.transition=final?'':'none';strip.style.transform='translateY(-'+(final?Number(w.dataset.target)*1.2:0)+'em)'})}new IntersectionObserver(es=>{if(es[0].isIntersecting){set(false);void stats.offsetWidth;requestAnimationFrame(()=>set(true))}},{threshold:.2}).observe(stats);})();

(()=>{const groups=[...document.querySelectorAll('.flip-card-group')];const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('flip-active');void e.target.offsetWidth;e.target.classList.add('flip-active')}else e.target.classList.remove('flip-active')}),{threshold:.12});groups.forEach(g=>observer.observe(g));})();

(()=>{const mobile=matchMedia('(max-width:760px)'),nav=document.querySelector('.mobile-bottom-nav');function active(){const key=location.hash.slice(1)||'overview';nav.querySelectorAll('a').forEach(a=>{if(a.dataset.mobileView===key)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')})}document.querySelectorAll('[data-mobile-section]').forEach(button=>button.addEventListener('click',()=>{const view=button.closest('.view');view.querySelectorAll('.mobile-sections button').forEach(b=>b.setAttribute('aria-selected',String(b===button)));view.querySelectorAll(':scope > .mobile-section').forEach(section=>section.classList.toggle('mobile-selected',section.id===button.dataset.mobileSection));if(mobile.matches){window.scrollTo({top:0,behavior:'instant'});window.dispatchEvent(new Event('resize'))}}));nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{if(location.hash===a.hash)window.scrollTo({top:0,behavior:'smooth'})}));window.addEventListener('hashchange',active);mobile.addEventListener('change',()=>{window.dispatchEvent(new Event('resize'))});active();})();

(()=>{const mq=matchMedia('(max-width:760px)');function update(){const items=[...document.querySelectorAll('.technique-fold')];items.forEach(e=>{if(mq.matches)e.removeAttribute('name');else e.setAttribute('name','learning-technique')});if(!mq.matches){let found=false;items.forEach(e=>{if(e.open){if(found)e.open=false;found=true}})}const current=document.querySelector('#information .information-closing.mobile-selected');if(mq.matches&&current)document.querySelector('[data-mobile-section="course-progress"]').click()}mq.addEventListener('change',update);update();const group=document.querySelector('.mobile-fee-cards');new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('flip-active',e.isIntersecting)),{threshold:.1}).observe(group);})();

(()=>{const glow=document.querySelector('.glow-red'),mobile=matchMedia('(max-width:760px)'),reduce=matchMedia('(prefers-reduced-motion: reduce)');let entry;function reveal(){if(!mobile.matches||reduce.matches||(location.hash&&location.hash!=='#overview'))return;entry?.cancel();entry=glow.animate([{transform:'translateX(180px)',opacity:0},{transform:'translateX(0)',opacity:.48}],{duration:1600,easing:'cubic-bezier(.22,.61,.36,1)'});}window.addEventListener('hashchange',reveal);reveal();})();

(()=>{const desktop=matchMedia('(min-width:761px)'),items=[...document.querySelectorAll('.technique-fold')],table=document.querySelector('#fee-standard>.scroll');items.forEach((e,i)=>e.style.setProperty('--tool-entry-order',i%6));const observer=new IntersectionObserver(entries=>{entries.forEach(e=>e.target.classList.toggle('desktop-motion-visible',desktop.matches&&e.isIntersecting))},{threshold:.12});[table,...items].forEach(e=>observer.observe(e));desktop.addEventListener('change',()=>{[table,...items].forEach(e=>{e.classList.remove('desktop-motion-visible');observer.unobserve(e);observer.observe(e)})});})();

(() => {
  const mobile = matchMedia('(max-width:760px)');
  const groups = document.querySelectorAll('#curriculum-mobile-0 > .grid, .toolbox-list');
  const cards = [];
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      entry.target.classList.toggle('mobile-fade-visible', mobile.matches && entry.isIntersecting);
    }
  }, { threshold: .12 });
  for (const group of groups) {
    [...group.children].forEach((card, index) => {
      card.style.setProperty('--mobile-fade-order', index % 4);
      cards.push(card);
      observer.observe(card);
    });
  }
  mobile.addEventListener('change', () => {
    for (const card of cards) {
      card.classList.remove('mobile-fade-visible');
      observer.unobserve(card);
      observer.observe(card);
    }
  });
})();

(()=>{const mobile=matchMedia('(max-width:760px)'),items=[...document.querySelectorAll('.stage-slide,#textbook-system .textbook-card')];const observer=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('mobile-content-revealed',mobile.matches&&e.isIntersecting)),{threshold:.06});items.forEach(e=>observer.observe(e));mobile.addEventListener('change',()=>items.forEach(e=>{e.classList.remove('mobile-content-revealed');observer.unobserve(e);observer.observe(e)}));})();

(()=>{const levels=document.getElementById('levels');if(!levels)return;const mobile=matchMedia('(max-width:760px)');[...levels.children].forEach((button,index)=>button.style.setProperty('--level-enter-order',index));const observer=new IntersectionObserver(entries=>entries.forEach(entry=>levels.classList.toggle('mobile-levels-visible',mobile.matches&&entry.isIntersecting)),{threshold:.1});observer.observe(levels);mobile.addEventListener('change',()=>{levels.classList.remove('mobile-levels-visible');observer.unobserve(levels);observer.observe(levels)});})();

(()=>{const mobile=matchMedia('(max-width:760px)'),nav=document.querySelector('.mobile-bottom-nav');function size(){if(nav&&mobile.matches)document.documentElement.style.setProperty('--main-nav-height',nav.getBoundingClientRect().height+'px')}if(nav)new ResizeObserver(size).observe(nav);size();document.querySelectorAll('[data-mobile-section]').forEach(button=>button.addEventListener('click',()=>{if(!mobile.matches)return;const menu=button.closest('.mobile-sections');menu.scrollTo({left:Math.max(0,button.offsetLeft-(menu.clientWidth-button.offsetWidth)/2),behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'})}));})();

(() => {
  const mobile = matchMedia('(max-width: 760px)');
  function resetSection() {
    if (!mobile.matches) return;
    const view = document.querySelector('.view:not([hidden])');
    view?.querySelector('.mobile-sections [data-mobile-section]')?.click();
  }
  window.addEventListener('hashchange', resetSection);
  document.querySelectorAll('[data-mobile-view]').forEach(link => {
    link.addEventListener('click', () => {
      if (location.hash === link.hash) resetSection();
    });
  });
  resetSection();
})();
