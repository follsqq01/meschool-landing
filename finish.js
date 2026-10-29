// Reveal independent editorial elements without overriding magnetic card transforms.
const revealTargets=document.querySelectorAll('.section-top,.life-card,.teacher-list article,.reasons article,.trial-copy,.booking,.facts>div,.faq>div,.contacts>div');
if('IntersectionObserver' in window&&!reduced.matches){
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}},{threshold:.10});
 revealTargets.forEach(el=>{el.classList.add('reveal');if(el.matches('.life-card,.teacher-list article,.facts>div')){const index=[...el.parentElement.children].indexOf(el);el.style.setProperty('--reveal-delay',Math.min(index*65,195)+'ms')}observer.observe(el)});
}
const tabBar=document.querySelector('.tabs');
if(tabBar){
 const marker=document.createElement('span');marker.className='tab-marker';marker.setAttribute('aria-hidden','true');tabBar.prepend(marker);tabBar.classList.add('has-marker');
 const moveMarker=()=>{const selected=tabBar.querySelector('[aria-selected="true"]');marker.style.width=selected.offsetWidth+'px';marker.style.height=selected.offsetHeight+'px';marker.style.transform=`translate(${selected.offsetLeft}px,${selected.offsetTop}px)`};
 tabBar.addEventListener('click',moveMarker);tabBar.addEventListener('keydown',()=>requestAnimationFrame(moveMarker));new ResizeObserver(moveMarker).observe(tabBar);document.fonts.ready.then(moveMarker);moveMarker();
 tabBar.querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',()=>{if(!reduced.matches)document.querySelector('#group-title').animate([{opacity:.35,translate:'0 6px'},{opacity:1,translate:'0 0'}],{duration:350,easing:'cubic-bezier(.2,.8,.2,1)'})}));
}
// Measure both states so answers animate smoothly, including when a click reverses the motion.
for(const details of document.querySelectorAll('.faq details')){
 const summary=details.querySelector('summary');let animation=null;let expanded=details.open;
 details.dataset.expanded=String(expanded);summary.setAttribute('aria-expanded',String(expanded));
 summary.addEventListener('click',event=>{
  event.preventDefault();expanded=!expanded;
  details.dataset.expanded=String(expanded);summary.setAttribute('aria-expanded',String(expanded));
  const start=details.getBoundingClientRect().height;
  if(animation){animation.onfinish=null;animation.cancel();animation=null}
  if(reduced.matches){details.open=expanded;return}
  details.open=true;
  const style=getComputedStyle(details);
  const closed=summary.getBoundingClientRect().height+parseFloat(style.paddingTop)+parseFloat(style.paddingBottom)+parseFloat(style.borderTopWidth)+parseFloat(style.borderBottomWidth);
  const end=expanded?details.getBoundingClientRect().height:closed;
  animation=details.animate([{height:start+'px'},{height:end+'px'}],{duration:380,easing:'cubic-bezier(.22,1,.36,1)'});
  animation.onfinish=()=>{details.open=expanded;animation=null};
 });
}
