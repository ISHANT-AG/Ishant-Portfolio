import { ArrowUpRight, Plus } from 'lucide-react';
import './practice.css';

const recommendations = 'https://www.linkedin.com/in/ishant-agarwal-266b22364/details/recommendations/';
const foundersTable = 'https://www.linkedin.com/feed/update/urn:li:activity:7479411279942590464/';
const recordedCourses = [
  'AI Image Formula to Unlock Unlimited Ideas',
  'The AI Presentation Edge',
  'The Prompt Engineering Mastery Program',
  'Video Using AI — Phase 1',
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
  return (
    <section className="practice-band practice-teaching" id="teaching" aria-labelledby="teaching-title">
      <div className="practice-shell practice-teaching-grid">
        <div className="practice-teaching-copy">
          <h2 className="practice-heading" id="teaching-title">Teaching AI <br/><em>at Clapingo.</em></h2>
          <p>In one live class, I took a character reference and showed the group how to carry it through three scenes of a 24-second AI film.</p>
          <p>My first two sessions each drew 200+ participants, including corporate professionals aged 50 and up.</p>
        </div>
        <figure className="practice-session">
          <a href="/assets/clapingo-live-session.webp" target="_blank" rel="noreferrer" aria-label="Enlarge the actual live session image">
            <img src="/assets/clapingo-live-session.webp" width="1600" height="868" loading="lazy" alt="Ishant teaching on camera alongside the shared character sheet and three-scene video prompt."/>
          </a>
          <figcaption><span>Live class · Character consistency and AI video</span><a className="practice-link" href="/assets/clapingo-live-session.webp" target="_blank" rel="noreferrer" aria-label="View the full-size teaching image">Enlarge <ArrowUpRight size={14}/></a></figcaption>
        </figure>
        <div className="practice-curriculum">
          <h3>Four recorded courses</h3>
          <div>
            <p>I wrote the lessons, built the decks and screen demos, and edited the final videos. The on-screen presenter and voiceover were AI-generated.</p>
            <details><summary><span>Course titles</span><Plus size={16} aria-hidden="true"/></summary>
              <ol>{recordedCourses.map(title => <li key={title}>{title}</li>)}</ol>
            </details>
            <p className="practice-in-progress">I’m also developing Clapingo’s AI Growth &amp; Automation Programme, which pairs live teaching with guided practice and assignments.</p>
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
