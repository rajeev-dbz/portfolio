// Apply the saved appearance before the stylesheet loads.
(function () {
 let saved='light';try{saved=localStorage.getItem('rk-portfolio-theme')==='dark'?'dark':'light';}catch(_){}
 document.documentElement.dataset.theme=saved;
 function state(){const dark=document.documentElement.dataset.theme==='dark';return {dark,icon:dark?'☀':'☾',text:t(dark?'Light mode':'Dark mode'),title:t(dark?'Switch to light mode':'Switch to dark mode')};}
 window.themeControl=function(){const s=state();return `<div class="appearance-controls">${languageControl()}<button type="button" class="theme-toggle" data-theme-toggle aria-label="${s.title}" title="${s.title}"><span aria-hidden="true">${s.icon}</span><span>${s.text}</span></button></div>`;};
 document.addEventListener('click',event=>{if(!event.target.closest('[data-theme-toggle]'))return;const next=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=next;try{localStorage.setItem('rk-portfolio-theme',next);}catch(_){}const s=state();document.querySelectorAll('[data-theme-toggle]').forEach(button=>{button.setAttribute('aria-label',s.title);button.title=s.title;button.innerHTML=`<span aria-hidden="true">${s.icon}</span><span>${s.text}</span>`;});});
})();
