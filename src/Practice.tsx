import { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import './practice.css';

const foundersTable = 'https://www.linkedin.com/feed/update/urn:li:activity:7479411279942590464/';
const testimonials = [
  {
    id: 'sameer-vit', name: 'Sameer Agrawal', shortName: 'VIT talk', role: 'Founder & CEO, Clapingo',
    companies: [{name: 'Clapingo', logo: 'clapingo.webp'}],
    mark: '/assets/recommendations/sameer-mark.webp',
    background: 'I hosted The Founders’ Table at VIT Bhopal. Sameer joined virtually as a guest speaker and spoke to the audience about my work at Clapingo.',
    profile: 'sameer-agrawal-945927108',
    quote: 'If you have to learn AI, go to Ishant.',
    video: '/assets/recommendations/vit-talk.mp4',
    fullText: foundersTable,
  },
  {
    companies: [{'name': 'J.P. Morgan', 'logo': 'jpmorgan.png'}, {name: 'Barclays', logo: 'barclays.png'}],
    background: 'Previously worked in equity derivatives at Barclays.',
    id: 'parth', name: 'Parth Gattani', role: 'Vice President, Platforms and Structuring · J.P. Morgan',
    profile: 'parth-gattani-3240a917',
    quote: 'Ishant is great team player and has very sincere approach towards learning new things. with passion in tech he will excel in computer science',
  },
  {
    companies: [{'name': 'Clapingo', 'logo': 'clapingo.webp'}, {name: 'L&T Construction', logo: 'lt.png'}, {name: 'Coal India', logo: 'coalindia.svg'}],
    background: 'Before founding Clapingo, Sameer spent a year at L&T and six years at Coal India.',
    id: 'sameer', name: 'Sameer Agrawal', role: 'Founder & CEO, Clapingo',
    profile: 'sameer-agrawal-945927108',
    quote: 'At just 18, he impressed us not only with his skills but also with the maturity and drive he brought to the team. With his background in design, Ishant contributed significantly as a Designer and Editor, consistently delivering high-quality work at an exceptional speed.',
  },
  {
    companies: [{'name': 'Nutaan AI', 'logo': 'nutaan.png'}, {'name': 'Tecosys AI', 'logo': 'tecosys.webp'}],
    background: 'Also founded Tecosys AI, where he served as CEO.',
    id: 'avishek', name: 'Avishek Bhattacharjee', role: 'Founder & CEO, Nutaan AI',
    profile: 'wbavishek',
    quote: 'He listens deeply, understands requirements perfectly, and consistently delivers work that reflects true expertise in his craft. Beyond design skills, he is a strong team player — dependable, collaborative, and highly suited for the fast-paced environment of a startup.',
  },
  {
    companies: [{name: 'Life Insurance Corporation of India', logo: 'lic.webp'}],
    background: 'I taught Ajanta how to turn documents and screenshots into narrated tutorials with subtitles.',
    id: 'ajanta', name: 'R. Ajanta', shortName: 'Ajanta', tabMark: '/assets/recommendations/lic-tab.webp', role: 'Senior Product Manager, LIC · One-to-one client',
    mark: '/client-logos/lic.webp', fullText: '/assets/recommendations/ajanta.html',
    quote: 'In the first session he described what should my workflow is and how I should go about it. That clarity and insight, whatever Ishan Sir said, has given me a different direction for creating the tutorial videos.',
  },
  {
    companies: [{'name': 'Tecosys AI', 'logo': 'tecosys.webp'}, {'name': 'CYNERZA', 'logo': 'cynerza.png'}],
    background: 'Also co-founded CYNERZA.',
    id: 'haraprasad', name: 'Haraprasad Hota', role: 'Co-Founder & CTO, Tecosys AI',
    profile: 'haraprasad-hota',
    quote: 'His ability to quickly understand requirements, pay attention to detail, and bring innovative ideas into visual storytelling has made a significant impact on our projects.',
  },
];

const liveSessions = [
  {
    title: 'Teaching AI Video & Consistency',
    topic: 'Example Live Class · Generative Video',
    description: 'An example of how I teach generative AI video pipelines live on screen, guiding corporate professionals through prompt logic and multi-scene character consistency.',
    image: '/assets/clapingo-live-session.webp',
    label: 'Example Session 01 · Live video pipelines',
  },
  {
    title: 'Teaching Prompt Logic & Architecture',
    topic: 'Example Live Class · Enterprise Prompts',
    description: 'An example of teaching structured prompt architecture live on screen, showing learners from top global firms how to direct AI models with precision.',
    image: '/assets/clapingo-session-headshot.webp',
    label: 'Example Session 02 · Identity & prompt systems',
  },
  {
    title: 'Teaching AI Presentation Workflows',
    topic: 'Example Live Class · Executive Tools',
    description: 'An example of live interactive coaching, showing senior executives and leaders how to integrate AI presentation tools into their day-to-day workflow.',
    image: '/assets/clapingo-session-ppt.webp',
    label: 'Example Session 03 · Executive presentation decks',
  },
];

const learnerLogos = [
  { name: 'Google', file: '/assets/learners/google.svg' },
  { name: 'Microsoft', file: '/assets/learners/microsoft.svg' },
  { name: 'IBM', file: '/assets/learners/ibm.svg' },
  { name: 'Cisco', file: '/assets/learners/cisco.svg' },
  { name: 'Accenture', file: '/assets/learners/accenture.svg' },
  { name: 'Infosys', file: '/assets/learners/infosys.svg' },
  { name: 'TCS', file: '/assets/learners/tcs.svg' },
  { name: 'HCLTech', file: '/assets/learners/hcl.svg' },
  { name: 'HP', file: '/assets/learners/hp.svg' },
];

const recordedCourses = [
  {
    id: 'explore-images',
    title: 'AI Image Formula to Unlock Unlimited Ideas',
    domain: 'Visual Synthesis & Art Direction',
    summary: 'A comprehensive deep-dive into lighting mechanics, camera optics, composition, and prompt grammar to turn rough ideas into publication-ready imagery.',
    image: '/assets/explore/images.webp',
    assignment: 'Brand campaign asset generation & prompt critique',
  },
  {
    id: 'explore-slides',
    title: 'The AI Presentation Edge',
    domain: 'Executive Slide Decks & Narrative',
    summary: 'Transforming unstructured thoughts into clear narrative arcs, executive slide layouts, and persuasive visual proposals with generative AI.',
    image: '/assets/explore/slides.webp',
    assignment: 'End-to-end 10-slide executive pitch deck creation',
  },
  {
    id: 'explore-prompts',
    title: 'The Prompt Engineering Mastery Program',
    domain: 'System Prompts & Logical Framing',
    summary: 'Deep-dive into multi-turn reasoning, role conditioning, few-shot prompting, and strict constraints to eliminate model hallucination.',
    image: '/assets/explore/prompts.webp',
    assignment: 'Corporate document automation & custom prompt systems',
  },
  {
    id: 'explore-video',
    title: 'Video Using AI — Phase 1',
    domain: 'Cinematic AI Video & Motion',
    summary: 'End-to-end production pipeline from character sheet turnarounds to multi-shot prompts, camera pacing, and final timeline editing.',
    image: '/assets/explore/video.webp',
    assignment: '30-second multi-scene narrative brand video',
  },
];

export function People() {
  const [index, setIndex] = useState(0);
  const person = testimonials[index];
  const move = (step: number) => setIndex(i => (i + step + testimonials.length) % testimonials.length);
  const asset = '/assets/recommendations/' + person.id;
  return (
    <section className="practice-band practice-people" id="people" aria-labelledby="people-title">
      <div className="practice-shell">
        <h2 className="voices-title" id="people-title">Backed by Leaders</h2>
        <div className="voices-layout">
          <div className="voices-profile">
            <img src={person.mark ?? asset + '-mark.webp'} alt={person.id === 'haraprasad' ? 'Tecosys AI logo' : ''} />
            <h3>{person.name}</h3><p>{person.role}</p>
            <ul className="voices-companies" aria-label="Company affiliations">
              {person.companies.map(company => <li key={company.name}>
                <img src={'/client-logos/' + company.logo} alt={company.name === 'Clapingo' ? company.name : ''} />
                {company.name !== 'Clapingo' && company.name}
              </li>)}
            </ul>
            <p>{person.background}</p>
            {person.profile && <a className="practice-link" href={'https://www.linkedin.com/in/' + person.profile + '/'} target="_blank" rel="noreferrer">LinkedIn profile <ArrowUpRight size={15}/></a>}
          </div>
          <div className="voices-panel">
            <blockquote aria-live="polite">“{person.quote}”</blockquote>
            {person.video && <video className="voices-video" src={person.video} controls playsInline preload="metadata" poster="/assets/recommendations/vit-talk.jpg"
              aria-label="Sameer Agrawal speaking at The Founders’ Table" />}
            <div className="voices-controls">
              <a className="practice-link" href={person.fullText ?? asset + '.webp'} target="_blank" rel="noreferrer">{person.video ? 'Watch on LinkedIn' : person.id === 'haraprasad' ? 'Read the signed letter' : 'Read the full recommendation'} <ArrowUpRight size={16}/></a>
              <div><button aria-label="Previous recommendation" onClick={() => move(-1)}>←</button>
              <button aria-label="Next recommendation" onClick={() => move(1)}>→</button></div>
            </div>
          </div>
          <div className="voices-picker" role="group" aria-label="Choose a recommendation">
            {testimonials.map((author, i) => <button key={author.id} aria-label={author.video ? author.name + ' at VIT' : author.name} aria-pressed={i === index} onClick={() => setIndex(i)}>
              <img src={author.tabMark ?? author.mark ?? '/assets/recommendations/' + author.id + '-mark.webp'} alt="" />{author.shortName ?? author.name.split(' ')[0]}
            </button>)}
            <span className="voices-more">+many more</span>
          </div>
        </div>
        <div className="practice-pace">
          <h3>One day to deliver 200 videos.</h3>
          <p>I had a week to research, select and organize 200 YouTube videos for my team. I delivered the collection in Drive within a day.</p>
        </div>
      </div>
    </section>
  );
}

export function Teaching() {
  const [activeSession, setActiveSession] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveSession((prev) => (prev + 1) % liveSessions.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <section className="practice-band practice-teaching" id="teaching" aria-labelledby="teaching-title">
      <div className="practice-shell">
        <div className="practice-teaching-grid">
          <div className="practice-teaching-copy">
            <div className="teaching-eyebrow-badge">
              <span className="teaching-live-pulse" aria-hidden="true" />
              <span>AI Trainer &amp; Lead Creative Developer</span>
            </div>
            <h2 className="practice-heading teaching-brand-heading" id="teaching-title">
              Teaching AI <br />
              <span className="heading-at-text">at</span>{' '}
              <span className="teaching-brand-pill" title="Clapingo">
                <img src="/client-logos/clapingo.webp" alt="Clapingo" />
              </span>
            </h2>
            <p className="practice-lead">
              As an AI Trainer at Clapingo, I conduct regular live training sessions, teaching working professionals, senior executives, and industry leaders how to understand and apply emerging technologies in their work.
            </p>
            <div className="teaching-metrics">
              <div className="metric-card metric-card-emerald">
                <span className="metric-number">200+</span>
                <strong className="metric-label">Premium learners per cohort</strong>
                <small>Corporate professionals aged 50+ &amp; industry leaders</small>
              </div>
              <div className="metric-card metric-card-purple">
                <span className="metric-number">100%</span>
                <strong className="metric-label">Practical, graded assignments</strong>
                <small>Curriculum &amp; prompts designed by me</small>
              </div>
            </div>
          </div>

          <div className="practice-session-stage">
            <div className="session-example-badge">
              <span className="example-badge-tag">EXAMPLE LIVE SESSIONS</span>
              <span className="example-badge-sub">Teaching people emerging technologies hands-on</span>
            </div>
            <figure
              className="practice-session"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="session-carousel-frame">
                {liveSessions.map((s, idx) => (
                  <a
                    key={s.image}
                    href={s.image}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Enlarge session ${idx + 1}`}
                    className={`session-slide ${activeSession === idx ? 'is-active' : ''}`}
                    tabIndex={activeSession === idx ? 0 : -1}
                  >
                    <img
                      src={s.image}
                      width="1024"
                      height="588"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      alt={`Live training session ${idx + 1} at Clapingo`}
                    />
                  </a>
                ))}
              </div>
              <figcaption className="session-caption-minimal">
                <div className="session-dots" role="tablist" aria-label="Session slides">
                  {liveSessions.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Jump to session ${i + 1}`}
                      className={`session-dot ${activeSession === i ? 'is-active' : ''}`}
                      onClick={() => setActiveSession(i)}
                    />
                  ))}
                </div>
                <a
                  className="practice-link"
                  href={liveSessions[activeSession].image}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="View full-size screenshot"
                >
                  Enlarge <ArrowUpRight size={14} />
                </a>
              </figcaption>
            </figure>

            {/* Sample Class Notes & Prompt Sheets */}
            <div className="teaching-notes-block">
              <div className="teaching-notes-header">
                <span className="notes-badge">CLASS MATERIALS</span>
                <h4>Sample Class Notes &amp; Prompt Sheets</h4>
                <p>Official reference guides and prompt sheets provided to learners after live practice sessions:</p>
              </div>
              <div className="teaching-notes-grid">
                <a href="/assets/notes-ai-images.pdf" target="_blank" rel="noreferrer" className="note-card">
                  <div className="note-card-preview">
                    <img src="/assets/notes-ai-images-preview.webp" alt="Create and edit images with AI class notes" loading="lazy" />
                  </div>
                  <div className="note-card-info">
                    <span className="note-meta">23 Nov 2026 · 5-Page Guide</span>
                    <strong>Create &amp; edit images with AI</strong>
                    <p>Headshot prompt sheet, car-wrap &amp; wallpaper styling, and thumbnail editing.</p>
                    <span className="note-action">Open Notes PDF <ArrowUpRight size={13} /></span>
                  </div>
                </a>

                <a href="/assets/notes-ai-presentations.pdf" target="_blank" rel="noreferrer" className="note-card">
                  <div className="note-card-preview">
                    <img src="/assets/notes-ai-presentations-preview.webp" alt="Presentations using AI class notes" loading="lazy" />
                  </div>
                  <div className="note-card-info">
                    <span className="note-meta">20 Nov 2026 · 7-Page Guide</span>
                    <strong>Presentations using AI (PPT S2)</strong>
                    <p>Outline generation in Gamma, Canva export, CSS brand extraction, and spreadsheet conversion.</p>
                    <span className="note-action">Open Notes PDF <ArrowUpRight size={13} /></span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Global Enterprise Learners Banner */}
        <div className="teaching-learners-banner">
          <div className="learners-banner-head">
            <span className="learners-badge">TRUSTED BY PROFESSIONALS</span>
            <h3>Learners from top companies across the globe</h3>
            <p>Thousands of working professionals and leaders from top industry enterprises learn AI and communication at Clapingo:</p>
          </div>
          <div className="learner-logos-grid" aria-label="Logos of top companies where learners work">
            {learnerLogos.map((logo) => (
              <div key={logo.name} className="learner-logo-pill" title={logo.name}>
                <img src={logo.file} alt={logo.name} loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        {/* Four Detailed Recorded Courses */}
        <div className="practice-courses-section">
          <div className="courses-section-header">
            <div>
              <span className="courses-badge">COMPREHENSIVE CURRICULUM</span>
              <h3>Four In-Depth Recorded Courses</h3>
            </div>
            <p>
              I authored the lessons, built the presentation decks and demo screens, created the student assignments, and directed the recorded video production across four distinct generative AI disciplines:
            </p>
          </div>

          <div className="courses-grid">
            {recordedCourses.map((c, idx) => (
              <article key={c.id} className="course-card">
                <div className="course-card-thumb">
                  <img src={c.image} alt={c.title} loading="lazy" />
                  <span className="course-number">0{idx + 1}</span>
                </div>
                <div className="course-card-body">
                  <span className="course-domain">{c.domain}</span>
                  <h4>{c.title}</h4>
                  <p>{c.summary}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="courses-footer">
            <p className="practice-in-progress">
              I’m also developing Clapingo’s advanced <strong>AI Growth &amp; Automation Programme</strong>, combining live masterclasses with guided multi-week practice and portfolio assignments.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const clapingoRoles = [
  { label: 'Creative Designer', detail: 'I joined Clapingo as a design intern in July 2025, designing graphics and editing videos for the team.' },
  { label: 'Creative Technologist', detail: 'I brought automation into my design work, building tools for repeatable tasks like creating thumbnails and blog images.' },
  { label: 'Creative Developer + Trainer', detail: 'I became Lead Creative Developer in November 2026. Alongside development, I teach professionals how to turn their own material into AI-assisted videos and presentations.' },
];

function ClapingoRoles() {
  const [selected, setSelected] = useState(clapingoRoles.length - 1);
  return <>
    <div className="career-tabs" role="tablist" aria-label="Roles at Clapingo">
      {clapingoRoles.map(({ label }, index) => (
        <button key={label} id={'career-tab-' + index} role="tab" aria-selected={index === selected}
          aria-controls={'career-panel-' + index} tabIndex={index === selected ? 0 : -1}
          onClick={() => setSelected(index)} onKeyDown={event => {
            const last = clapingoRoles.length - 1;
            const targets: Record<string, number> = { Home: 0, End: last, ArrowRight: (index + 1) % (last + 1), ArrowLeft: (index + last) % (last + 1) };
            if (!(event.key in targets)) return;
            event.preventDefault();
            const next = targets[event.key];
            setSelected(next);
            document.getElementById('career-tab-' + next)?.focus();
          }}>{label}</button>
      ))}
    </div>
    {clapingoRoles.map(({ label, detail }, index) => (
      <p key={label} role="tabpanel" id={'career-panel-' + index} aria-labelledby={'career-tab-' + index}
        tabIndex={0} hidden={selected !== index}>{detail}</p>
    ))}
  </>;
}

const milestones = [
  {
    title: 'My first briefs came across a counter',
    note: 'December 2020 – January 2023',
    text: 'At the print shop, customers told me what they needed. My job was to turn that conversation into a design ready for the press.',
    image: 'journey-press.webp', alt: 'Rainbow ink rolled across a letterpress',
  },
  {
    title: 'A brief from Dubai',
    note: 'Team India Properties',
    text: 'One of my early roles took me back to print, designing for Team India Properties in Dubai. I also worked with Internshala, TravelBug Goa and Tecosys in the US.',
    image: 'journey-dubai.webp', alt: 'Dubai skyline',
  },
  {
    title: 'From page spreads to thumbnails',
    note: '2,000+ commercial assets',
    text: 'A thumbnail has to read at a glance. A publication gives you room to tell a story. I’ve designed both, alongside campaign creative for audiences in India, the US and Dubai.',
    image: 'journey-palette.webp', alt: 'Colorful art supplies',
  },
  {
    title: 'Now Lead Creative Developer',
    showRoles: true,
    note: 'Clapingo · July 2025 onward',
    image: 'journey-keys.webp', alt: 'Playful keyboard caps beside a neon light',
  },
];

export function About() {
  return (
    <section className="practice-band practice-about" id="about" aria-labelledby="about-title">
      <div className="practice-shell">
        <header className="journey-header">
          <h2 className="practice-heading" id="about-title">I started in <em>a print shop.</em></h2>
          <p className="practice-location">Jaipur, India · B.Tech Computer Science, VIT Bhopal</p>
        </header>
        <ol className="journey">
          {milestones.map(({ title, text, note, image, alt, showRoles }) => (
            <li key={title}>
              <article className="journey-card">
                <figure className="journey-print">
                  <img src={'/assets/' + image} alt={alt} loading="lazy" />
                  
                </figure>
                <div className="journey-note">
                  <small>{note}</small>
                  <h3>{title}</h3>
                  {showRoles ? <ClapingoRoles /> : <p>{text}</p>}
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
