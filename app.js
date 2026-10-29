const $=s=>document.querySelector(s);const tabs=[...document.querySelectorAll('[data-tab]')];
function selectTab(key,focus=false){tabs.forEach(b=>{const active=b.dataset.tab===key;b.setAttribute('aria-selected',active);b.tabIndex=active?0:-1;if(active&&focus)b.focus()});$('#group-offer').setAttribute('aria-labelledby','tab-'+key);rollPrice($('#group-price'),key==='children'?12900:15600);$('#group-duration').textContent=(key==='children'?'75':'90')+' минут каждое занятие';$('#group-title').textContent=key==='children'?'Для детей 7–9 лет':key==='teens'?'Для школьников 10–18 лет':'Для взрослых';$('#audience').selectedIndex=key==='children'?0:key==='teens'?1:2}
tabs.forEach((b,i)=>{b.addEventListener('click',()=>selectTab(b.dataset.tab));b.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%3;if(e.key==='ArrowLeft')n=(i+2)%3;if(e.key==='Home')n=0;if(e.key==='End')n=2;if(n!==undefined){e.preventDefault();selectTab(tabs[n].dataset.tab,true)}})});
document.querySelectorAll('[data-program]').forEach(a=>a.addEventListener('click',()=>selectTab(a.dataset.program)));
document.querySelectorAll('[data-min]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-min]').forEach(x=>x.setAttribute('aria-pressed',x===b));rollPrice($('#individual-price'),{'45':2700,'60':3600,'90':5400}[b.dataset.min])}));
$('.menu').addEventListener('click',()=>{const open=$('.header nav').classList.toggle('open');$('.menu').setAttribute('aria-expanded',open);$('.menu').textContent=open?'Закрыть':'Меню'});document.querySelectorAll('.header nav a').forEach(a=>a.addEventListener('click',()=>{$('.header nav').classList.remove('open');$('.menu').setAttribute('aria-expanded','false');$('.menu').textContent='Меню'}));
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const priceTimers=new WeakMap();
function rollPrice(el,value){
 clearTimeout(priceTimers.get(el));const old=el.dataset.value||el.textContent.replace(/\D/g,'');el.dataset.value=String(value);
 const formatted=new Intl.NumberFormat('ru-RU').format(value);el.setAttribute('aria-label',formatted+' рублей');
 if(reduced.matches||old===String(value)){el.textContent=formatted;return}
 el.replaceChildren();let position=0;
 for(const char of formatted){const slot=document.createElement('span');slot.setAttribute('aria-hidden','true');if(!/\d/.test(char)){slot.className='price-space';slot.textContent=char;el.append(slot);continue}
 slot.className='digit-slot';const strip=document.createElement('span');strip.className='digit-strip';const target=Number(char)+20;
 for(let n=0;n<=target;n++){const digit=document.createElement('span');digit.textContent=n%10;strip.append(digit)}
 slot.append(strip);el.append(slot);strip.animate([{transform:'translateY(0)'},{transform:`translateY(-${target}em)`}],{duration:650+position++*65,easing:'cubic-bezier(.2,.65,.2,1)',fill:'forwards'});
 }
 priceTimers.set(el,setTimeout(()=>{el.textContent=formatted},1100));
}
for(const card of document.querySelectorAll('.program,.price-card')){
 let frame=0;card.addEventListener('pointermove',e=>{if(reduced.matches||!matchMedia('(hover: hover) and (pointer: fine)').matches)return;const r=card.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{card.style.setProperty('--mx',x*10+'px');card.style.setProperty('--my',y*8+'px');card.style.setProperty('--rx',-y*3+'deg');card.style.setProperty('--ry',x*3+'deg')})});card.addEventListener('pointerleave',()=>{cancelAnimationFrame(frame);['--mx','--my','--rx','--ry'].forEach(k=>card.style.removeProperty(k))});
}
const teacherPanels = new Map();
for (const details of document.querySelectorAll('.teacher-list details')) {
 const summary = details.querySelector('summary');
 let animation = null;
 let expanded = details.open;
 const close = () => {
  animation?.cancel();
  animation = null;
  expanded = false;
  details.open = false;
  details.style.overflow = '';
  summary.setAttribute('aria-expanded', 'false');
 };
 teacherPanels.set(details, close);
 summary.setAttribute('aria-expanded', String(expanded));
 summary.addEventListener('click', event => {
  event.preventDefault();
  const nextExpanded = !expanded;
  if (nextExpanded) {
   for (const [other, closeOther] of teacherPanels) {
    if (other !== details) closeOther();
   }
  }
  const start = details.getBoundingClientRect().height;
  animation?.cancel();
  animation = null;
  expanded = nextExpanded;
  summary.setAttribute('aria-expanded', String(expanded));
  if (reduced.matches) {
   details.open = expanded;
   details.style.overflow = '';
   return;
  }
  details.open = true;
  const end = expanded ? details.scrollHeight : summary.getBoundingClientRect().height;
  details.style.overflow = 'hidden';
  animation = details.animate([{height: start + 'px'}, {height: end + 'px'}], {
   duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)'
  });
  animation.onfinish = () => {
   details.open = expanded;
   details.style.overflow = '';
   animation = null;
  };
 });
}
const legal=$('#legal-dialog');document.querySelectorAll('[data-legal]').forEach(b=>b.addEventListener('click',()=>{$('#legal-title').textContent=b.dataset.legal==='privacy'?'Политика конфиденциальности':'Согласие на обработку данных';legal.showModal()}));legal.querySelector('.close').addEventListener('click',()=>legal.close());legal.addEventListener('click',e=>{if(e.target===legal){const r=legal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)legal.close()}});
$('#lead-form').addEventListener('submit',e=>{e.preventDefault();$('#form-status').textContent='Форма заполнена. Это демонстрация: заявка не отправлена, данные не сохраняются.'});
