import Lenis from 'lenis';
import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { ArrowUpRight, ArrowRight, ArrowDown, Copy, Check, X, Mail, Workflow, Pause, Play } from 'lucide-react';
import { projects, tools, type Project } from './data';
import Mind from './Mind';
import { People, Teaching, About } from './Practice';
function Github({size=18}:{size?:number}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M9 19c-4 1-4-2-6-2m12 5v-3.5c0-1-.1-1.5-.6-2 3.1-.4 6.6-1.5 6.6-7A5.4 5.4 0 0 0 19.5 6a5 5 0 0 0-.1-3.5S18.2 2 15.8 4a13 13 0 0 0-7.6 0C5.8 2 4.6 2.5 4.6 2.5A5 5 0 0 0 4.5 6 5.4 5.4 0 0 0 3 9.5c0 5.5 3.5 6.6 6.6 7-.5.5-.6 1-.6 2V22"/></svg>}
function Linkedin({size=18}:{size?:number}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 10v7m0-10v.2M11 17v-7m0 3c0-4 6-4 6 0v4"/></svg>}
const Ring=lazy(()=>import('./Ring'));
const linkedin='https://www.linkedin.com/in/ishant-agarwal-266b22364/';
const github='https://github.com/ISHANT-AG';
const email='agarwalishant690@gmail.com';

function ProjectArt({project,large=false}:{project:Project;large?:boolean}){
 return <div className={`project-art art-${project.id} ${large?'large':''}`} style={{background:project.color,color:project.ink}}>
  <span className="art-label">{project.label}</span>
  {project.id==='web'?<div className="site-capture"><div className="capture-bar"><i/><i/><i/><span>codeistaai.com</span></div><img src="/assets/codeista.png" alt="Actual Codeista AI website — Think. Code. Build." loading="lazy"/></div>:
   project.id==='ffcs'?<div className="ffcs-art"><div className="ffcs-top"><span>ffcs<span className="purple">easy.</span></span><span className="tiny-dot"/></div><h3>Your semester.<br/>Your way.</h3><div className="mini-timetable">{Array.from({length:25},(_,i)=><span key={i} className={`slot slot-${i%6}`}>{[1,4,7,11,14,17,20,23].includes(i)?['MAT','CSE','PHY'][i%3]:''}</span>)}</div><span className="ffcs-note">Built together. Used by students.</span></div>:
   project.id==='ai'?<div className="ai-art"><Workflow size={48} strokeWidth={1}/><h3>Less repetitive.<br/>More creative.</h3><div className="art-times">120 <ArrowRight size={36}/> 15<span>minutes</span></div></div>:
   <div className="artifact-image"><img src={project.image} loading="lazy" alt={project.id==='fit'?'FitHappns 15-minute workout guide, actual cover':project.id==='dubai'?'Team India Properties investor magazine, actual cover':'Headphone concept animation frame'}/></div>}
  <span className="art-index">{project.year} / {project.id==='sony'?'INDEPENDENT CONCEPT':'SELECTED WORK'}</span>
 </div>
}
function CaseStudy({project,onClose}:{project:Project|null;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{if(!project)return;const d=dialog.current!;d.showModal();const prev=document.body.style.overflow;document.body.style.overflow='hidden';d.scrollTop=0;return()=>{d.close();document.body.style.overflow=prev;};},[project]);
 if(!project)return null;
 return <dialog ref={dialog} className="case-dialog" data-lenis-prevent="true" aria-labelledby="case-title" onCancel={onClose} onClick={e=>{if(e.target===dialog.current)onClose()}}><article><div className="case-top"><span className="eyebrow">SELECTED WORK / {project.year}</span><button className="circle-button" onClick={onClose} aria-label="Close case study"><X size={22}/></button></div><div className="case-heading"><span className="eyebrow">{project.category}</span><h2 id="case-title">{project.title}</h2><p>{project.subtitle}</p></div><ProjectArt project={project} large/><div className="case-body"><div className="case-role"><span className="eyebrow">MY ROLE</span><p>{project.role}</p></div><p className="case-intro">{project.intro}</p>{project.points.map((p,i)=><section className="case-point" key={p.title}><span className="eyebrow">0{i+1}</span><div><h3>{p.title}</h3><p>{p.text}</p></div></section>)}{project.id==='fit'&&<div className="case-spreads"><figure><img src="/assets/fithappns-plan.webp" alt="Minimum-action plan with three action levels and if–then plans"/><figcaption>Make the next action specific.</figcaption></figure><figure><img src="/assets/fithappns-restart.webp" alt="Restart rule explaining how to continue after a missed day"/><figcaption>Make returning feel possible.</figcaption></figure></div>}{project.id==='dubai'&&<img className="case-spread" src="/assets/dubai-spread.webp" alt="Actual Team India Properties editorial page"/>}{project.links.length>0&&<div className="case-links">{project.links.map(l=><a className="pill-button" href={l.url} key={l.url} target="_blank" rel="noreferrer">{l.label}<ArrowUpRight size={16}/></a>)}</div>}{project.note&&<p className="evidence-note">{project.note}</p>}<button className="text-link" onClick={onClose}>Back to the portfolio <ArrowRight size={18}/></button></div></article></dialog>
}
function Keyboard(){
 const [active,setActive]=useState(3);const section=useRef<HTMLElement>(null);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.altKey||e.ctrlKey||e.metaKey||(e.target as HTMLElement)?.closest('input,textarea,dialog,[contenteditable=true]')||document.querySelector('dialog[open], [aria-modal=true]'))return;const b=section.current?.getBoundingClientRect();if(!b||b.top>innerHeight*.8||b.bottom<0)return;const n=tools.findIndex(t=>t.key===e.key.toLowerCase());if(n>=0){e.preventDefault();setActive(n)}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[]);
 function tiltKeyboard(event: React.PointerEvent<HTMLDivElement>) {
   if (event.pointerType !== 'mouse') return;
   const stage = event.currentTarget;
   const rect = stage.getBoundingClientRect();
   stage.style.setProperty('--tilt-x', ((0.5 - (event.clientY - rect.top) / rect.height) * 8) + 'deg');
   stage.style.setProperty('--tilt-y', (((event.clientX - rect.left) / rect.width - 0.5) * 10) + 'deg');
 }
 return <section ref={section} className="stack-section" id="stack"><div className="section stack-inner"><header className="section-heading"><div><h2>Inside my <em>toolkit.</em></h2></div><p>Choose a tool to see where I used it.<br/><span className="keyboard-hint">Press the shortcut shown on any key.</span></p></header><div className="keyboard-stage" onPointerMove={tiltKeyboard} onPointerLeave={event => {
   event.currentTarget.style.removeProperty('--tilt-x');
   event.currentTarget.style.removeProperty('--tilt-y');
 }}><div className="keyboard" role="group" aria-label="Interactive tools keyboard">{tools.map((t,i)=><button key={t.name} aria-label={t.name} title={t.name} className={`tool-key ${active===i?'active':''}`} aria-pressed={active===i} onPointerEnter={event => { if (event.pointerType === "mouse") setActive(i); }} onFocus={()=>setActive(i)} onClick={()=>setActive(i)} style={{'--key-color':t.color} as React.CSSProperties}><span className="key-number">{t.key.toUpperCase()}</span><img className="tool-logo" src={t.logo} alt=""/><span className="key-name">{t.name}</span></button>)}</div></div><div className="tool-detail" aria-live="polite"><span className="tool-detail-index">{tools[active].key.padStart(2,'0')} /</span><div><span className="eyebrow">{tools[active].group}</span><h3>{tools[active].name}</h3><p>{tools[active].description}</p></div></div><Contributions/></div></section>
}
function Contributions(){
 const activityUrl = github + '#js-contribution-activity';
 return <div className="contributions">
   <div className="contribution-heading"><h3>GitHub activity<span className="green">.</span></h3><a className="text-link" href={activityUrl} target="_blank" rel="noreferrer"><Github size={17}/> View on GitHub <ArrowUpRight size={16}/></a></div>
   <div style={{overflowX:'auto'}}><a href={activityUrl} target="_blank" rel="noreferrer"><img loading="lazy" src="/github-calendar.png" alt="Ishant Agarwal’s contribution calendar, captured from GitHub. Open GitHub for individual days." style={{display:'block',width:'100%',minWidth:650,height:'auto'}}/></a></div>
   <div className="repo-links"><a href={`${github}/FFCS-Easy`} target="_blank" rel="noreferrer">FFCS-Easy <ArrowUpRight size={15}/></a><a href={`${github}/AI-Blog-Image-Automation-Tool`} target="_blank" rel="noreferrer">AI Blog Image Tool <ArrowUpRight size={15}/></a><a href={`${github}/SONY-HEADPHONE`} target="_blank" rel="noreferrer">SONY-HEADPHONE <ArrowUpRight size={15}/></a></div></div>
}
const featuredClients = [
  ['LIC','lic.webp'], ['Clapingo','clapingo.webp'], ['Tecosys','tecosys.webp'],
  ['Team India Properties',''], ['FitHappns','fithappns-wordmark.png'], ['Travel Bug Goa','travelbug.webp'],
  ['ScribeAI','scribe-ai.webp'], ['Internshala','internshala.svg'],
];
const clientMarks = [
  ['Wealthymize','wealth-full.webp'],
  ['Zenovix Technologies','zenovix.webp'], ['Codeista AI','codeista.svg'], ['Adviora Consulting','adviora.webp'],
  ['Central Filings','central-light.webp'], ['Llarron','llarron.webp'], ['Ralsha','ralsha.webp'],
  ['JIB Solar','jib.webp'], ['Noble Care','noble.webp'], ['Dhrugo','dhrugo.webp'],
  ['Upskillbee','upskill.svg'], ['K2WFinance','k2.webp'],
  ['Krazlo','krazlo.webp'], ['S8 Analytics','s8.webp'], ['Lalima','lalima.webp'],
];

function ClientStrip({motion}:{motion:boolean}) {
  const [paused,setPaused]=useState(false);
  return <section id="clients" className="client-strip" aria-label="Selected clients and teams" data-motion={motion}>
    <header><span>Selected clients &amp; teams</span>{motion && <button type="button" aria-label={paused?'Resume logo animation':'Pause logo animation'} onClick={()=>setPaused(!paused)}>{paused?<Play size={15}/>:<Pause size={15}/>}</button>}</header>
    <ul className="featured-clients" aria-label="Featured clients and teams">{featuredClients.map(([name,file])=><li key={name}>{file?<img src={'/client-logos/'+file} alt={name}/>:<strong>{name}</strong>}{name==='Tecosys'&&<span aria-hidden="true">Tecosys</span>}</li>)}</ul>
    <div className="client-window"><div className="client-track" data-paused={paused}>
      {[0,1].map(copy=><ul key={copy} aria-hidden={copy===1 || undefined}>{clientMarks.map(([name,file])=><li key={name}>
        {file?<img className={['Codeista AI','Wealthymize'].includes(name)?'on-ink':''} src={'/client-logos/'+file} alt={name} title={name}/>:<strong>{name}</strong>}
        {name==='Upskillbee'&&<span aria-hidden="true">{name}</span>}
      </li>)}</ul>)}
    </div></div>
  </section>
}

export default function App(){
 const [projectId,setProjectId]=useState<string|null>(null);const [motion,setMotion]=useState(()=>!window.matchMedia('(prefers-reduced-motion: reduce)').matches);const [copied,setCopied]=useState(false);const [copyError,setCopyError]=useState(false);
 useEffect(() => {
   if (!motion || projectId) return;
   const scroll = new Lenis({
     autoRaf: true,
     lerp: 0.10,
     duration: 1.2,
     smoothWheel: true,
     wheelMultiplier: 1.0,
     touchMultiplier: 1.8,
     prevent: (node) =>
       !!node.closest('[aria-modal="true"], dialog[open], .ring-canvas-host, [data-lenis-prevent]'),
   });
   (window as any).__lenis = scroll;

   const handleAnchorClick = (e: MouseEvent) => {
     const target = (e.target as HTMLElement)?.closest('a');
     if (!target) return;
     const href = target.getAttribute('href');
     if (href && href.startsWith('#') && href.length > 1) {
       const dest = document.querySelector(href);
       if (dest) {
         e.preventDefault();
         scroll.scrollTo(dest as HTMLElement, {
           offset: href === '#gallery' ? 0 : -32,
           duration: 1.2,
         });
         history.pushState(null, '', href);
       }
     }
   };
   document.addEventListener('click', handleAnchorClick);

   return () => {
     document.removeEventListener('click', handleAnchorClick);
     scroll.destroy();
     delete (window as any).__lenis;
   };
 }, [motion, projectId]);
 useEffect(()=>{document.documentElement.dataset.motion=String(motion)},[motion]);
 useEffect(()=>{const q=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setMotion(!q.matches);q.addEventListener('change',update);return()=>q.removeEventListener('change',update)},[]);

 async function copyEmail(){try{await navigator.clipboard.writeText(email);setCopied(true);setCopyError(false);setTimeout(()=>setCopied(false),2200)}catch{setCopyError(true)}}
 return <>
  <a className="skip-link" href="#gallery">Skip to work gallery</a>
  <header className="site-header">
    <a href="#top" className="wordmark"><span className="ia-mark" aria-hidden="true">ia.</span>Ishant Agarwal</a>
    <nav aria-label="Main navigation"><a href="#gallery">Work</a><a href="#about">About</a><a href="#contact" className="nav-contact">Let’s talk <ArrowUpRight size={14}/></a></nav>
  </header>
  <main id="top">
    <section className="studio-hero" aria-labelledby="intro-title">
      <div className="studio-intro">
        <h1 id="intro-title">A designer’s eye.<br/><em>A developer’s hands.</em></h1>
        <p>I’m Ishant, Lead Creative Developer at <strong>Clapingo.</strong><br/>I design websites, build them, and automate the work behind them.</p>
        <a className="studio-cta" href="#gallery">Explore my work <ArrowDown size={15}/></a>
      </div>
      <div className="studio-stage">
        <div className="studio-origin"><span>Based in</span><strong>Jaipur, India</strong><p>Working across India,<br/>the US and Dubai.</p></div>
        <div className="studio-portrait"><img className="portrait" src="/assets/ishant-portrait.webp" width="640" height="700" alt="Ishant Agarwal" fetchPriority="high"/><Mind motion={motion}/></div>
        <button className="studio-sample" onClick={()=>setProjectId('dubai')} aria-label="Open the Team India Properties editorial case study"><span className="sample-prints"><img src="/assets/dubai-spread.webp" alt=""/><img src="/assets/dubai.webp" alt=""/></span><span>Dubai, in print <ArrowUpRight size={14}/></span></button>
      </div>
      <div className="studio-foot"><span>Design · Development · AI</span><a href="#gallery">Selected case studies <ArrowDown size={14}/></a></div>
    </section>
    <Suspense fallback={<section id="gallery" className="ring-loading" aria-label="Work gallery"><a href="#gallery">Browse selected projects ↓</a></section>}><Ring motion={motion} onOpen={setProjectId}/></Suspense>
    <ClientStrip motion={motion}/>
    <Keyboard/><People/><Teaching/><About/></main><footer id="contact"><div className="section footer-inner"><a className="contact-headline" href={`mailto:${email}`}>Have a project<br/><em>in mind?</em><ArrowUpRight/></a><div className="contact-bottom"><div><a href={`mailto:${email}`}>{email}</a><button className="copy-button" onClick={copyEmail} aria-label="Copy email address">{copied?<Check size={16}/>:<Copy size={16}/>}</button><span className="copy-status" role="status">{copied?'Copied!':copyError?'Please select the email to copy.':''}</span></div><div className="social-links"><a href={linkedin} target="_blank" rel="noreferrer"><Linkedin size={16}/>LinkedIn <ArrowUpRight size={14}/></a><a href={github} target="_blank" rel="noreferrer"><Github size={16}/>GitHub <ArrowUpRight size={14}/></a><a href={`mailto:${email}`}><Mail size={16}/>Email <ArrowUpRight size={14}/></a></div></div><div className="footer-colophon"><span>© {new Date().getFullYear()} Ishant Agarwal</span><button onClick={()=>setMotion(!motion)} aria-pressed={motion}>{motion?<Pause size={12}/>:<Play size={12}/>} Motion {motion?'on':'off'}</button><a href="#top">Back to top ↑</a></div></div></footer><CaseStudy project={projects.find(p=>p.id===projectId)||null} onClose={()=>setProjectId(null)}/></>
}
