// Owner identity shown on public and reviewer portfolio home pages.
window.PORTFOLIO_PROFILE={
 name:'Rajeev Krishnan',
 degrees:[
  {degree:'MSc Electromobility – ACES',university:'FAU Erlangen-Nürnberg',monogram:'FAU',logo:'fau.svg'},
  {degree:'BE Mechanical Engineering',university:'Anna University',monogram:'AU',logo:'anna-university.png'}
 ]
};
(function(){
 const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 // logoBase: folder holding logo files, e.g. '/profile/' (server) or '../assets/profile/' (GitHub Pages).
 window.profileBlock=function(logoBase=''){const p=window.PORTFOLIO_PROFILE;if(!p)return '';return `<section class="profile-block" aria-label="${safe(p.name)}"><p class="profile-name">${safe(p.name)}</p><ul class="profile-degrees">${p.degrees.map(d=>`<li><span class="profile-logo">${d.logo?`<img src="${safe(logoBase+d.logo)}" alt="">`:`<b aria-hidden="true">${safe(d.monogram)}</b>`}</span><span><strong>${safe(d.degree)}</strong><small>${safe(d.university)}</small></span></li>`).join('')}</ul></section>`;};
 // The trusted brand mark opens the details card on hover (pointer devices), keyboard focus or click/tap.
 window.profileMenu=function(logoBase,mark){const p=window.PORTFOLIO_PROFILE;if(!p)return mark;return `<div class="profile-menu"><button type="button" class="profile-trigger" aria-expanded="false" aria-haspopup="true" aria-label="${safe(p.name)}">${mark}</button><div class="profile-popover">${profileBlock(logoBase)}</div></div>`;};
 document.addEventListener('click',event=>{const trigger=event.target.closest('.profile-trigger');document.querySelectorAll('.profile-menu.open').forEach(menu=>{if(!trigger||menu!==trigger.parentElement){menu.classList.remove('open');menu.firstElementChild.setAttribute('aria-expanded','false');}});if(trigger){const open=trigger.parentElement.classList.toggle('open');trigger.setAttribute('aria-expanded',String(open));}});
 document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;document.querySelectorAll('.profile-menu.open').forEach(menu=>{menu.classList.remove('open');menu.firstElementChild.setAttribute('aria-expanded','false');});});
 window.profileFooter=function(){const p=window.PORTFOLIO_PROFILE;if(!p)return t('RAJEEV · SELECTED ENGINEERING WORK');return [p.name,...p.degrees.map(d=>d.degree)].map(safe).join(' · ').toUpperCase();};
})();
