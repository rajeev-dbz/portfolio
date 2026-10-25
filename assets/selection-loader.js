// Load only the independent public project keys named in this URL.
(async function(){
 const target=document.getElementById('public-portfolio');
 const fail=message=>{target.textContent=message;};
 const raw=new URLSearchParams(location.search).get('projects');
 if(!raw){fail('Please open the selected project link provided with your application.');return;}
 const keys=raw.split(',');
 if(keys.length>30||keys.some(k=>!/^[a-z0-9][a-z0-9-]{0,99}$/.test(k))||new Set(keys).size!==keys.length){fail('This project selection is invalid. Please request a new link.');return;}
 try{
  const projects=await Promise.all(keys.map(async key=>{
   const response=await fetch('./'+encodeURIComponent(key)+'/selection.js',{cache:'no-cache'});
   if(!response.ok)throw new Error('missing');
   const source=await response.text(),prefix='window.PORTFOLIO_SELECTION=';
   if(!source.startsWith(prefix))throw new Error('invalid');
   const selection=JSON.parse(source.slice(prefix.length).trim().replace(/;$/,''));
   if(!Array.isArray(selection.projects)||selection.projects.length!==1)throw new Error('not independent');
   const project=selection.projects[0];
   if(typeof project.id!=='string'||!Array.isArray(project.attachments))throw new Error('invalid');
   const asset=path=>{
    if(typeof path!=='string'||!path.startsWith('files/')||path.split('/').some(part=>!part||part==='.'||part==='..'||part.includes('\\')||part.includes(':')))throw new Error('invalid asset');
    return key+'/'+path;
   };
   return {...project,coverImage:project.coverImage?asset(project.coverImage):null,attachments:project.attachments.map(a=>({...a,path:asset(a.path)}))};
  }));
  if(new Set(projects.map(p=>p.id)).size!==projects.length)throw new Error('duplicate project');
  window.PORTFOLIO_SELECTION={label:projects.length===1?projects[0].title:'Selected Engineering Projects',projects};
  const script=document.createElement('script');script.src='./assets/portfolio.js?v=selection-links-1';script.onerror=()=>fail('Unable to load this portfolio. Please refresh.');document.body.appendChild(script);
 }catch{fail('One or more selected projects are unavailable. Please check the link or ask for an updated selection.');}
})();
