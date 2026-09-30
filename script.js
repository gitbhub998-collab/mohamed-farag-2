const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);

const loader=$('#loader'), pct=$('#percent'), bar=$('#loading-bar');
let progress=0;
const loadTimer=setInterval(()=>{
  progress+=Math.floor(Math.random()*9)+5;
  if(progress>=100){progress=100;clearInterval(loadTimer);setTimeout(()=>loader.remove(),280)}
  pct.textContent=progress+'%';
  bar.style.width=progress+'%';
},55);

const currentYear=$('#currentYear');
if(currentYear) currentYear.textContent=new Date().getFullYear();

const menu=$('#menuPanel'), open=$('#menuButton'), close=$('#closeMenu');
const setMenuState=isOpen=>{
  menu.classList.toggle('open',isOpen);
  document.body.classList.toggle('menu-open',isOpen);
  menu.setAttribute('aria-hidden',String(!isOpen));
  open.setAttribute('aria-expanded',String(isOpen));
  open.setAttribute('aria-label',isOpen?'Close navigation menu':'Open navigation menu');
  menu.toggleAttribute('inert',!isOpen);
  if(isOpen) setTimeout(()=>close.focus(),350);
};
open.addEventListener('click',()=>setMenuState(!menu.classList.contains('open')));
close.addEventListener('click',()=>{setMenuState(false);open.focus()});
$$('[data-close]').forEach(a=>a.addEventListener('click',()=>{
  const target=document.querySelector(a.getAttribute('href'));
  setMenuState(false);
  if(target){target.tabIndex=-1;target.focus({preventScroll:true})}
}));
document.addEventListener('keydown',e=>{
  if(!menu.classList.contains('open')) return;
  if(e.key==='Escape'){setMenuState(false);open.focus();return}
  if(e.key!=='Tab') return;
  const focusable=menu.querySelectorAll('a[href],button:not([disabled])');
  if(!focusable.length) return;
  const first=focusable[0],last=focusable[focusable.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
});

$$('.service-head').forEach(btn=>btn.addEventListener('click',()=>{
  const isExpanded=btn.closest('.service-item').classList.toggle('active');
  btn.setAttribute('aria-expanded',String(isExpanded));
  document.getElementById(btn.getAttribute('aria-controls')).setAttribute('aria-hidden',String(!isExpanded));
}));

const preview=$('#previewImage');
let activeProjectRow=null;
let hoveredProjectRow=null;
let focusedProjectRow=null;
let preferredProjectRow=null;
let previewRequest=0;
const showProject=row=>{
  const request=++previewRequest;
  const src=row.dataset.image;
  if(!src){preview.classList.remove('show');preview.setAttribute('aria-hidden','true');activeProjectRow=null;return}
  activeProjectRow=row;
  const title=row.querySelector('h3')?.textContent.trim();
  preview.classList.remove('show');
  preview.setAttribute('aria-hidden','true');
  preview.alt=title?`${title} project`:'Technical project';
  const requestedImage=new Image();
  const showLoadedPreview=()=>{
    if(request!==previewRequest||activeProjectRow!==row)return;
    preview.src=src;
    preview.classList.add('show');
    preview.setAttribute('aria-hidden','false');
  };
  requestedImage.onload=showLoadedPreview;
  requestedImage.onerror=()=>{
    if(request===previewRequest&&activeProjectRow===row)preview.classList.remove('show');
  };
  requestedImage.src=src;
  if(requestedImage.complete&&requestedImage.naturalWidth>0)showLoadedPreview();
};
const hidePreview=()=>{
    if(!activeProjectRow)return;
  previewRequest++;
    activeProjectRow=null;
    preview.classList.remove('show');
    preview.setAttribute('aria-hidden','true');
};
const updatePreview=()=>{
  const row=preferredProjectRow||focusedProjectRow||hoveredProjectRow;
  if(row)showProject(row);
  else hidePreview();
};
$$('.work-row').forEach(row=>{
  const showOnClick=event=>{
    event.preventDefault();
    focusedProjectRow=row;
    preferredProjectRow=row;
    updatePreview();
    document.querySelector('.work-preview')?.scrollIntoView({
      behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',
      block:'nearest'
    });
  };
  row.addEventListener('mouseenter',()=>{hoveredProjectRow=row;preferredProjectRow=row;updatePreview()});
  row.addEventListener('mouseleave',()=>{hoveredProjectRow=null;if(preferredProjectRow===row)preferredProjectRow=focusedProjectRow;updatePreview()});
  row.addEventListener('focus',()=>{focusedProjectRow=row;preferredProjectRow=row;updatePreview()});
  row.addEventListener('blur',()=>{focusedProjectRow=null;if(preferredProjectRow===row)preferredProjectRow=hoveredProjectRow;updatePreview()});
  row.addEventListener('click',showOnClick);
});

const cursor=$('#cursor');
window.addEventListener('mousemove',e=>{if(cursor){cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px'}});
$$('a,button').forEach(el=>{
  el.addEventListener('mouseenter',()=>cursor?.classList.add('is-view'));
  el.addEventListener('mouseleave',()=>cursor?.classList.remove('is-view'));
});
$$('.work-row').forEach(el=>{
  el.addEventListener('mouseenter',()=>{if(cursor) cursor.querySelector('span').textContent='VIEW'});
});

const io=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('revealed');
      io.unobserve(entry.target);
    }
  });
},{threshold:.08,rootMargin:'0px 0px -40px 0px'});
$$('.reveal').forEach((el,i)=>{el.style.transitionDelay=Math.min((i%5)*55,220)+'ms';io.observe(el)});

let lastScroll=window.scrollY;
window.addEventListener('scroll',()=>{
  const now=window.scrollY;
  document.body.classList.toggle('scrolled',now>30);
  lastScroll=now;
},{passive:true});
