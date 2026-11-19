import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react';
import { ledger } from './data';
import './selected-work.css';

type Props = { onOpen: (id: string) => void };

function Publication({ dubai = false }: { dubai?: boolean }) {
  return <span className={'folio-prints ' + (dubai ? 'is-dubai' : '')}>
    <img loading="lazy" src={dubai ? '/assets/dubai-spread.webp' : '/assets/fithappns-plan.webp'} alt="" />
    <img loading="lazy" src={dubai ? '/assets/dubai.webp' : '/assets/fithappns-cover.webp'} alt={dubai ? 'Team India Properties investor magazine cover' : 'FitHappns workout guide cover'} />
  </span>;
}

export function Work({onOpen}: Props) {
  return <section id="work" className="folio-work section">
    <div className="folio-head"><h2>Selected <em>work.</em></h2><p>Client websites, editorial design, and tools I use in production.</p></div>
    <div className="folio-pair">
      <button className="folio-case" onClick={()=>onOpen('web')}>
        <span className="folio-web"><img src="/assets/codeista.png" loading="lazy" alt="Codeista AI homepage" /></span>
        <span className="folio-caption"><span><strong>Codeista AI</strong><small>Website design, development & lead capture</small></span><ArrowUpRight /></span>
      </button>
      <button className="folio-case" onClick={()=>onOpen('fit')}>
        <Publication/><span className="folio-caption"><span><strong>FitHappns</strong><small>Workshop narrative & behaviour-led resources</small></span><ArrowUpRight /></span>
      </button>
    </div>
    <button className="folio-system" onClick={()=>onOpen('ai')}>
      <span className="folio-system-text"><strong>Clapingo’s blog image tool</strong><span>I built a TypeScript workflow for generating and reviewing daily blog visuals.</span><u>Explore the system <ArrowUpRight size={16}/></u></span>
      <span className="folio-clock"><span>120 <ArrowRight aria-hidden="true"/> 15</span><small>Minutes per day · reported production time</small></span>
    </button>
    <div className="folio-pair folio-secondary">
      <button className="folio-case" onClick={()=>onOpen('dubai')}><Publication dubai/><span className="folio-caption"><span><strong>Team India Properties</strong><small>Investor publications & campaigns · Dubai</small></span><ArrowUpRight/></span></button>
      <button className="folio-case folio-ffcs" onClick={()=>onOpen('ffcs')}><span className="folio-semester"><span>FFCS-Easy</span><b>2,500+</b><small>users during FFCS week, team-reported</small></span><span className="folio-caption"><span><strong>A better way to plan a semester</strong><small>Built in equal partnership with Prisha Sharma</small></span><ArrowUpRight/></span></button>
    </div>
    <details className="folio-ledger"><summary>Commercial website index <span>{ledger.length} sites <ChevronDown size={18}/></span></summary>
      <div>{ledger.map(([name,domain])=><a key={domain} href={'https://'+domain} target="_blank" rel="noreferrer"><strong>{name}</strong><small>{domain}</small><ArrowUpRight size={17}/></a>)}</div>
    </details>
  </section>;
}

export function Playground({onOpen}: Props) {
  return <section id="playground" className="folio-lab section">
    <div className="folio-head"><h2>Creative <em>lab.</em></h2><p>Independent experiments in sound, motion, and physical products.</p></div>
    <article className="folio-sony">
      <img src="/assets/sony.jpg" alt="Headphones in the Sony WH-1000XM6 scroll-driven concept" loading="lazy"/>
      <div><h3>Sound,<br/><em>in motion.</em></h3><p>Sony WH-1000XM6 · Independent concept</p><div><a href="https://sony-headphone-1000.vercel.app/" target="_blank" rel="noreferrer">Live demo <ArrowUpRight size={15}/></a><button onClick={()=>onOpen('sony')}>Case study <ArrowRight size={15}/></button></div></div>
    </article>
    <div className="folio-experiments">
      <a href="https://grip-bottle.vercel.app" target="_blank" rel="noreferrer"><strong>GRIP Bottle</strong><span>Interactive temperature simulator</span><ArrowUpRight/></a>
      <a href="https://katosi-theta.vercel.app" target="_blank" rel="noreferrer"><strong>KATOSI</strong><span>3D music experience · Code by Ishant, review by Shivi</span><ArrowUpRight/></a>
    </div>
  </section>;
}
