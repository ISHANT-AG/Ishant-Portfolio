import { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import './practice.css';

const recommendations = 'https://www.linkedin.com/in/ishant-agarwal-266b22364/details/recommendations/';
const foundersTable = 'https://www.linkedin.com/feed/update/urn:li:activity:7479411279942590464/';

const liveSessions = [
  {
    title: 'Character Consistency & AI Video',
    topic: 'Narrative AI Filmmaking',
    description: 'Guiding corporate professionals on maintaining character likeness and style across three distinct scenes in a 24-second AI film prompt sequence.',
    image: '/assets/clapingo-live-session.webp',
    label: 'Session 01 · Live prompt architecture',
  },
  {
    title: 'Professional Headshot Prompt Engineering',
    topic: 'Visual Identity Preservation',
    description: 'Demonstrating structured Google Docs prompt architecture to preserve facial contours, studio lighting, and wardrobe in generative profile imagery.',
    image: '/assets/clapingo-session-headshot.webp',
    label: 'Session 02 · Identity prompts & assignments',
  },
  {
    title: 'Presentation & Deck Architecture using AI',
    topic: 'Executive Storytelling',
    description: 'Live hands-on practice session teaching senior executives how to transform raw outlines into production-ready slide decks with AI.',
    image: '/assets/clapingo-session-ppt.webp',
    label: 'Session 03 · Live practice & Q&A',
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
  return (
    <section className="practice-band practice-people" id="people" aria-labelledby="people-title">
      <div className="practice-shell">
        <h2 className="practice-section-label" id="people-title">Working with me</h2>
        <figure className="practice-quote">
          <blockquote>“Consistently delivering high-quality work at an <em>exceptional speed.</em>”</blockquote>
          <figcaption>
            <div><strong>Sameer Agrawal</strong><span>Founder &amp; CEO, Clapingo · My direct manager</span></div>
            <a className="practice-link" href={recommendations} target="_blank" rel="noreferrer">Read his recommendation <ArrowUpRight size={16}/></a>
          </figcaption>
        </figure>
        <div className="practice-pace">
          <h3>One day to deliver 200 videos.</h3>
          <p>I had a week to research, select and organize 200 YouTube videos for my team. I delivered the collection in Drive within a day.</p>
        </div>
        <div className="practice-references">
          <a href={recommendations} target="_blank" rel="noreferrer"><span><strong>Avishek Bhattacharjee</strong><small>Founder &amp; CEO, Nutaan AI</small></span><span>On understanding a brief <ArrowUpRight size={14}/></span></a>
          <a href={recommendations} target="_blank" rel="noreferrer"><span><strong>Parth Gattani</strong><small>Vice President, J.P. Morgan</small></span><span>On teamwork <ArrowUpRight size={14}/></span></a>
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
            <span className="practice-eyebrow">AI Trainer &amp; Lead Creative Developer · Clapingo</span>
            <h2 className="practice-heading" id="teaching-title">Teaching AI <br/><em>at Clapingo.</em></h2>
            <p className="practice-lead">
              As an AI Trainer at Clapingo, I conduct regular live training sessions, teaching working professionals, senior executives, and leaders how to integrate generative AI into their daily work.
            </p>
            <div className="teaching-metrics">
              <div className="metric-card">
                <span className="metric-number">200+</span>
                <strong className="metric-label">Premium learners per cohort</strong>
                <small>Corporate professionals aged 50+ &amp; industry leaders</small>
              </div>
              <div className="metric-card">
                <span className="metric-number">100%</span>
                <strong className="metric-label">Practical, graded assignments</strong>
                <small>Curriculum &amp; prompts designed by me</small>
              </div>
            </div>
            <p>
              Beyond live lectures, I design the curriculum and structured assignments — from writing precision prompt systems to building 10-slide presentation decks and producing multi-scene AI videos.
            </p>
          </div>

          <div className="practice-session-stage">
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
                  <a href="#gallery" className="course-explore-link">
                    Explore in gallery <ArrowUpRight size={14} />
                  </a>
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

export function About() {
  return (
    <section className="practice-band practice-about" id="about" aria-labelledby="about-title">
      <div className="practice-shell practice-about-grid">
        <div>
          <h2 className="practice-heading" id="about-title">I started in <br/><em>a print shop.</em></h2>
          <p className="practice-location">Jaipur, India · B.Tech Computer Science, VIT Bhopal</p>
        </div>
        <div className="practice-history">
          <p>From December 2020 to January 2023, I worked with walk-in customers and prepared their designs for print. I still like taking a brief all the way through to something people can use.</p>
          <p>Since then, I’ve made 2,000+ commercial assets, including thumbnails, campaign creative and publications, across India, the US and Dubai.</p>
          <dl className="practice-path">
            <div><dt>Early roles</dt><dd>Internshala, TravelBug Goa, Tecosys (US) and Team India Properties (Dubai).</dd></div>
            <div><dt>Clapingo</dt><dd>I joined as a design intern in July 2025, then moved into creative technology and development. I became Lead Creative Developer in November 2026.</dd></div>
            <div><dt>On campus</dt><dd>Incubation Team Co-Lead and Newsletter Head at VIT Bhopal Startup Club. I also organized and hosted The Founders’ Table 2026.<br/><a className="practice-link" href={foundersTable} target="_blank" rel="noreferrer">View the event post <ArrowUpRight size={15}/></a></dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}
