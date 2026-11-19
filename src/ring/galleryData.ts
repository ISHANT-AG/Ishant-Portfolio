import { ledger, projects, type Project } from '../data';

export type CategoryId = 'build' | 'design' | 'automate';

export type PlateId =
  | 'ffcs'
  | 'grip'
  | 'katosi'
  | 'ai-blog'
  | 'ai-thumb'
  | 'ai-n8n';

export type GalleryVisual =
  | {
      kind: 'image';
      src: string;
      alt: string;
      aspect?: string;
      objectPosition?: string;
      frameBg?: string;
    }
  | {
      kind: 'plate';
      plateId: PlateId;
      alt: string;
      captionBadge: string;
    };

export type GalleryItem = {
  id: string;
  categoryId: CategoryId;
  title: string;
  subtitle: string;
  year: string;
  role: string;
  summary: string;
  note?: string;
  projectId?: string;
  links: { label: string; url: string }[];
  visual: GalleryVisual;
  accent: string;
};

export type CategoryColorTheme = {
  tint: string;           // Primary identity color (ice blue, rose-violet, amber)
  edgeColor: string;      // Saturated glass edge & cut ends
  innerWall: string;      // Translucent colored glass inner surface
  glassHighlight: string; // Specular & Fresnel highlight tone
  reflectTint: string;    // Floor reflection tint
};

export type CategoryCover =
  | {
      type: 'image';
      src: string;
      videoSrc?: string;
      crop: { x: number; y: number; w: number; h: number };
      grade: 'cool-slate' | 'warm-dusk';
      tint: string;
    }
  | {
      type: 'optical';
      palette: [string, string, string];
      tint: string;
    };

export type GalleryCategory = {
  id: CategoryId;
  label: string;
  displayTitle: string;
  tagline: string;
  cover: CategoryCover;
  theme: CategoryColorTheme;
  items: GalleryItem[];
};

const byId = (id: string): Project => {
  const found = projects.find((p) => p.id === id);
  if (!found) throw new Error(`Missing project ${id}`);
  return found;
};

const webProject = byId('web');
const ffcsProject = byId('ffcs');
const sonyProject = byId('sony');
const fitProject = byId('fit');
const dubaiProject = byId('dubai');
const aiProject = byId('ai');

export const galleryCategories: GalleryCategory[] = [
  {
    id: 'build',
    label: 'BUILD',
    displayTitle: 'Build',
    tagline: 'Client websites, a semester planner and experiments in motion.',
    cover: {
      type: 'image',
      src: '/assets/ring-build.jpg',
      videoSrc: '/assets/ring-build.mp4',
      crop: { x: 0.0, y: 0.05, w: 1.0, h: 0.75 },
      grade: 'warm-dusk',
      tint: '#e8a0bf',
    },
    theme: {
      tint: '#e8a0bf', // Soft sunset mauve
      edgeColor: 'rgba(235, 195, 215, 0.40)',
      innerWall: 'rgba(230, 165, 190, 0.32)',
      glassHighlight: '#ffffff',
      reflectTint: '#e8a0bf',
    },
    items: [
      {
        id: 'build-codeista',
        categoryId: 'build',
        title: webProject.title,
        subtitle: `Codeista AI · one of ${ledger.length} commercial sites`,
        year: webProject.year,
        role: webProject.role,
        summary: webProject.intro,
        note: 'Codeista AI capture from shipped delivery; scope varies across engagements.',
        projectId: webProject.id,
        links: webProject.links,
        visual: {
          kind: 'image',
          src: '/assets/codeista.png',
          alt: 'Actual Codeista AI website — Think. Code. Build.',
          aspect: '16 / 9',
          frameBg: '#0c0820',
        },
        accent: '#3d3369',
      },
      {
        id: 'build-ffcs',
        categoryId: 'build',
        title: ffcsProject.title,
        subtitle: ffcsProject.subtitle,
        year: ffcsProject.year,
        role: ffcsProject.role,
        summary: ffcsProject.intro,
        note: ffcsProject.note,
        projectId: ffcsProject.id,
        links: ffcsProject.links,
        visual: {
          kind: 'plate',
          plateId: 'ffcs',
          alt: 'Illustrative timetable planning diagram for FFCS-Easy, co-built equally with Prisha Sharma',
          captionBadge: 'ILLUSTRATIVE CONCEPT PLATE',
        },
        accent: '#6f7ee0',
      },
      {
        id: 'build-sony',
        categoryId: 'build',
        title: sonyProject.title,
        subtitle: sonyProject.label,
        year: sonyProject.year,
        role: sonyProject.role,
        summary: sonyProject.intro,
        note: sonyProject.note,
        projectId: sonyProject.id,
        links: sonyProject.links,
        visual: {
          kind: 'image',
          src: '/assets/sony.jpg',
          alt: 'Sony WH-1000XM6 independent concept animation frame',
          aspect: '16 / 9',
          frameBg: '#0f1416',
        },
        accent: '#2c3c44',
      },
      {
        id: 'build-grip',
        categoryId: 'build',
        title: 'GRIP',
        subtitle: 'Interactive product concept',
        year: '2026',
        role: 'Solo · Creative development experiment',
        summary:
          'A bottle, a temperature state and tactile browser interaction — built as a focused motion and micro-interaction study.',
        note: 'Creative development experiment.',
        links: [{ label: 'Open GRIP live demo', url: 'https://grip-bottle.vercel.app' }],
        visual: {
          kind: 'plate',
          plateId: 'grip',
          alt: 'Authored visual study for the GRIP interactive product concept',
          captionBadge: 'CREATIVE EXPERIMENT',
        },
        accent: '#8da17d',
      },
      {
        id: 'build-katosi',
        categoryId: 'build',
        title: 'KATOSI',
        subtitle: 'Music & creative development',
        year: '2026',
        role: 'Code by Ishant · Review with Shivi',
        summary:
          'An atmospheric browser-native music experiment exploring orbital motion, spatial layout and quiet visual rhythm.',
        note: 'Code by me. Review with Shivi.',
        links: [{ label: 'Open KATOSI live demo', url: 'https://katosi-theta.vercel.app' }],
        visual: {
          kind: 'plate',
          plateId: 'katosi',
          alt: 'Authored visual study for the KATOSI creative development music experiment',
          captionBadge: 'CREATIVE EXPERIMENT',
        },
        accent: '#9173b0',
      },
    ],
  },
  {
    id: 'design',
    label: 'DESIGN',
    displayTitle: 'Design',
    tagline: 'Dubai property editorials and workout guides designed for follow-through.',
    cover: {
      type: 'image',
      src: '/assets/ring-design.jpg',
      videoSrc: '/assets/ring-design.mp4',
      crop: { x: 0.0, y: 0.05, w: 1.0, h: 0.82 },
      grade: 'warm-dusk',
      tint: '#dc6ebe',
    },
    theme: {
      tint: '#dc6ebe', // Rose-violet
      edgeColor: 'rgba(225, 160, 205, 0.40)',
      innerWall: 'rgba(220, 145, 195, 0.32)',
      glassHighlight: '#ffffff',
      reflectTint: '#dc6ebe',
    },
    items: [
      {
        id: 'design-fit-cover',
        categoryId: 'design',
        title: 'FitHappns — 15-Minute Blueprint',
        subtitle: fitProject.subtitle,
        year: fitProject.year,
        role: fitProject.role,
        summary: fitProject.intro,
        note: fitProject.note,
        projectId: fitProject.id,
        links: fitProject.links,
        visual: {
          kind: 'image',
          src: '/assets/fithappns-cover.webp',
          alt: 'FitHappns 15-minute busy professional workout guide cover',
          aspect: '4 / 5',
          frameBg: '#161414',
        },
        accent: '#6d323e',
      },
      {
        id: 'design-fit-plan',
        categoryId: 'design',
        title: 'FitHappns — Minimum-Action Plan',
        subtitle: 'Three action levels & if–then obstacle plans',
        year: fitProject.year,
        role: fitProject.role,
        summary: fitProject.points[1].text,
        note: fitProject.note,
        projectId: fitProject.id,
        links: [fitProject.links[0]],
        visual: {
          kind: 'image',
          src: '/assets/fithappns-plan.webp',
          alt: 'FitHappns minimum-action plan worksheet with Minimum, Standard and Bonus levels',
          aspect: '4 / 5',
          frameBg: '#f3f2ee',
        },
        accent: '#b47a6a',
      },
      {
        id: 'design-fit-restart',
        categoryId: 'design',
        title: 'FitHappns — The Restart Rule',
        subtitle: 'Returning after a missed day without resetting progress',
        year: fitProject.year,
        role: fitProject.role,
        summary: fitProject.points[2].text,
        note: fitProject.note,
        projectId: fitProject.id,
        links: [fitProject.links[0]],
        visual: {
          kind: 'image',
          src: '/assets/fithappns-restart.webp',
          alt: 'FitHappns restart rule worksheet',
          aspect: '4 / 5',
          frameBg: '#f3f2ee',
        },
        accent: '#8c5f58',
      },
      {
        id: 'design-dubai-cover',
        categoryId: 'design',
        title: 'Team India Properties — Dubai Edition',
        subtitle: dubaiProject.subtitle,
        year: dubaiProject.year,
        role: dubaiProject.role,
        summary: dubaiProject.intro,
        note: dubaiProject.note,
        projectId: dubaiProject.id,
        links: dubaiProject.links,
        visual: {
          kind: 'image',
          src: '/assets/dubai.webp',
          alt: 'Team India Properties August 2025 Dubai investor magazine cover',
          aspect: '3 / 4',
          frameBg: '#274d7a',
        },
        accent: '#58789e',
      },
      {
        id: 'design-dubai-spread',
        categoryId: 'design',
        title: 'Team India Properties — Flare Editorial',
        subtitle: 'Long-form real-estate publication hierarchy',
        year: dubaiProject.year,
        role: dubaiProject.role,
        summary: dubaiProject.points[0].text,
        note: dubaiProject.note,
        projectId: dubaiProject.id,
        links: dubaiProject.links,
        visual: {
          kind: 'image',
          src: '/assets/dubai-spread.webp',
          alt: 'Team India Properties Flare residential tower editorial spread',
          aspect: '3 / 4',
          frameBg: '#ece7df',
        },
        accent: '#b49276',
      },
    ],
  },
  {
    id: 'automate',
    label: 'EXPLORE',
    displayTitle: 'Explore',
    tagline: 'Inside my AI practice at Clapingo, from live video demos to tools for the content team.',
    cover: {
      type: 'image',
      src: '/assets/ring-explore.jpg',
      videoSrc: '/assets/ring-explore.mp4',
      crop: { x: 0.0, y: 0.08, w: 1.0, h: 0.78 },
      grade: 'cool-slate',
      tint: '#ffaf41',
    },
    theme: {
      tint: '#ffaf41', // Amber
      edgeColor: 'rgba(255, 205, 150, 0.40)',
      innerWall: 'rgba(255, 185, 110, 0.32)',
      glassHighlight: '#ffffff',
      reflectTint: '#ffaf41',
    },
    items: [
      {
        id: 'automate-blog-tool',
        categoryId: 'automate',
        title: 'Clapingo AI Blog Image Tool',
        subtitle: aiProject.subtitle,
        year: aiProject.year,
        role: aiProject.role,
        summary: aiProject.intro,
        note: aiProject.note,
        projectId: aiProject.id,
        links: [aiProject.links[0]],
        visual: {
          kind: 'plate',
          plateId: 'ai-blog',
          alt: 'Illustrative workflow diagram of the Clapingo AI Blog Image Tool reducing daily blog-visual production from 120 to 15 minutes',
          captionBadge: 'ILLUSTRATIVE WORKFLOW DIAGRAM',
        },
        accent: '#7c6dc7',
      },
      {
        id: 'automate-thumbnail',
        categoryId: 'automate',
        title: 'Thumbnail Engine',
        subtitle: 'Brand-consistent YouTube visual production',
        year: aiProject.year,
        role: 'Solo · React, TypeScript & creative system design',
        summary:
          'A dedicated creative utility built to produce brand-consistent YouTube thumbnails quickly while keeping human framing and final editorial review in control.',
        note: 'Illustrative system overview; inspect the public repository for full implementation.',
        projectId: aiProject.id,
        links: [aiProject.links[1]],
        visual: {
          kind: 'plate',
          plateId: 'ai-thumb',
          alt: 'Illustrative composition plate for the Thumbnail Engine creative system',
          captionBadge: 'ILLUSTRATIVE SYSTEM PLATE',
        },
        accent: '#916ec2',
      },
      {
        id: 'automate-n8n',
        categoryId: 'automate',
        title: 'n8n Discovery & Lead Pipelines',
        subtitle: 'Connected workflows with structured handoffs',
        year: aiProject.year,
        role: 'Solo · n8n and Apify integration',
        summary:
          'I connected n8n and Apify to search Google Maps for businesses by category and location, remove duplicate entries and export the results to a spreadsheet.',
        note: 'Illustrative architecture diagram of described n8n workflows.',
        links: [{ label: 'See the n8n workflow', url: 'https://www.linkedin.com/feed/update/urn:li:activity:7511341739245391872/' }],
        visual: {
          kind: 'plate',
          plateId: 'ai-n8n',
          alt: 'Illustrative pipeline architecture for n8n business discovery, deduplication and lead handoff workflows',
          captionBadge: 'ILLUSTRATIVE PIPELINE DIAGRAM',
        },
        accent: '#c47d78',
      },
    ],
  },
];
