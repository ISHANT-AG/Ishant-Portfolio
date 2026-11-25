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

function websiteItem(id: string, name: string, url: string, cover: string): GalleryItem {
  return {
    id: 'build-' + id, categoryId: 'build', title: name, subtitle: name, year: '', role: '', summary: '',
    links: [{ label: 'Visit website', url }],
    visual: { kind: 'image', src: '/assets/explore-sites/' + cover, alt: name + ' website', aspect: '16 / 10' },
    accent: '#292726',
  };
}

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
        id: 'build-katosi',
        categoryId: 'build',
        title: 'KATOSI',
        subtitle: 'Music & creative development',
        year: '2026',
        role: 'Code by Ishant · Review with Shivi',
        summary:
          'An atmospheric browser-native music experiment exploring orbital motion, spatial layout and quiet visual rhythm.',
        note: 'Code by me. Review with Shivi.',
        links: [{ label: "Visit website", url: "https://katosi-theta.vercel.app/" }],
        visual: { kind: "image", src: "/assets/explore-sites/katosi-theta.webp", alt: "KATOSI homepage", aspect: "16 / 10" },
        accent: '#9173b0',
      },
      websiteItem("cloth-studio-sigma", "Cloth Studio", "https://cloth-studio-sigma.vercel.app/", "cloth-studio-sigma.webp"),
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
        links: [{ label: "Visit website", url: "https://grip-bottle.vercel.app/" }],
        visual: { kind: "image", src: "/assets/explore-sites/grip-bottle.webp", alt: "GRIP Bottle homepage", aspect: "16 / 10" },
        accent: '#8da17d',
      },
      websiteItem("clapingo", "Clapingo \u00b7 Contributed", "https://clapingo.com/", "clapingo.webp"),
      websiteItem("c2c", "Clapingo C2C Admin", "https://c2c.clapingo.com/admin", "c2c.webp"),
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
          kind: 'image',
          src: '/assets/explore-sites/ffcs-easy.webp',
          alt: 'FFCS-Easy semester planner opening screen with Pick, Plan, Register',
          aspect: '16 / 10',
        },
        accent: '#6f7ee0',
      },
      websiteItem("fithappns", "FitHappns", "https://www.fithappns.com/ggl", "fithappns.webp"),
      websiteItem("centralfilings", "Central Filings", "https://www.centralfilings.com/", "centralfilings.webp"),
      websiteItem("zenovixtechnologies", "Zenovix Technologies", "https://www.zenovixtechnologies.com/", "zenovixtechnologies.webp"),
      websiteItem("jibsolar", "JIB Solar", "https://www.jibsolar.in/", "jibsolar.webp"),
      websiteItem("digitaldilight", "Digital Dilight", "https://www.digitaldilight.com/", "digitaldilight.webp"),
      websiteItem("k2wfinance", "K2W Finance", "https://www.k2wfinance.com/", "k2wfinance.webp"),
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
        links: [{ label: "Visit website", url: "https://sony-headphone-1000.vercel.app/" }, ...sonyProject.links],
        visual: { kind: "image", src: "/assets/explore-sites/sony-headphone-1000.webp", alt: "Sony WH-1000XM6 homepage", aspect: "16 / 10" },
        accent: '#2c3c44',
      },
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
        links: [{ label: "Visit website", url: "https://www.codeistaai.com/" }, ...webProject.links],
        visual: { kind: "image", src: "/assets/explore-sites/codeistaai.webp", alt: "Codeista AI homepage", aspect: "16 / 10" },
        accent: '#3d3369',
      },
      websiteItem("dhrugo", "Dhrugo", "https://dhrugo.com/", "dhrugo.webp"),
      websiteItem("s8analytics", "S8 Analytics", "https://www.s8analytics.com/", "s8analytics.webp"),
      websiteItem("skorsi", "Skorsi", "https://www.skorsi.com/", "skorsi.webp"),
      websiteItem("llarron", "Llarron", "https://www.llarron.com/", "llarron.webp"),
      websiteItem("ralsha", "Ralsha", "https://www.ralsha.com/", "ralsha.webp"),
      websiteItem("noblecare4u", "Noble Care", "https://www.noblecare4u.com/", "noblecare4u.webp"),
      websiteItem("advioraconsulting", "Adviora Consulting", "https://www.advioraconsulting.com/", "advioraconsulting.webp"),
      websiteItem("eazyvegan", "EazyVegan", "https://eazyvegan.lovable.app/", "eazyvegan.webp"),
      websiteItem("rishuslay", "Rishu Aggarwal \u00b7 Portfolio", "https://rishuslay.vercel.app/", "rishuslay.webp"),
    ],
  },
  {
    id: 'design',
    label: 'DESIGN',
    displayTitle: 'Design',
    tagline: 'Brand identities, campaign posters, AI product visuals and editorial design.',
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
        "id": "canva-grand-prix",
        "categoryId": "design",
        "title": "Spanish Grand Prix · Max vs Lewis",
        "subtitle": "Event signage",
        "year": "",
        "role": "Graphic design",
        "summary": "Spanish Grand Prix · Max vs Lewis",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/grand-prix.webp",
          "alt": "Spanish Grand Prix · Max vs Lewis — Event signage",
          "aspect": "357 / 715"
        },
        "accent": "#292726"
      },
      {
        "id": "design-synergy-standee",
        "categoryId": "design",
        "title": "Startup Synergy · Event standee",
        "subtitle": "Event signage",
        "year": "",
        "role": "Graphic design",
        "summary": "A tall print standee presents the two-day Startup Synergy event programme.",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/synergy-standee.webp",
          "alt": "A tall print standee presents the two-day Startup Synergy event programme.",
          "aspect": "1100 / 2200"
        },
        "accent": "#292726"
      },
      {
        "id": "canva-ffcs-launch",
        "categoryId": "design",
        "title": "Your Timetable, Your Way",
        "subtitle": "FFCS Easy · Product launch",
        "year": "",
        "role": "Graphic design",
        "summary": "A vertical launch poster uses a timetable preview to show how students can plan their week.",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/ffcs-launch.webp",
          "alt": "A vertical launch poster uses a timetable preview to show how students can plan their week.",
          "aspect": "1080 / 1920"
        },
        "accent": "#292726"
      },
      {
        "id": "archive-stock-market-ai",
        "categoryId": "design",
        "title": "Stock Market Using AI",
        "subtitle": "Clapingo · Workshop poster",
        "year": "",
        "role": "Workshop poster",
        "summary": "A tall event poster pairs the workshop speaker with a stock chart and registration details.",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/stock-market-ai.webp",
          "alt": "A tall event poster pairs the workshop speaker with a stock chart and registration details.",
          "aspect": "1013 / 1800"
        },
        "accent": "#292726"
      },
      {
        "id": "design-dhrugo-solar",
        "categoryId": "design",
        "title": "Smart Solar Solutions",
        "subtitle": "Solar campaign",
        "year": "",
        "role": "Graphic design",
        "summary": "Dhrugo’s rooftop solar flyer combines installations, benefits and a QR code.",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/dhrugo-solar.webp",
          "alt": "Dhrugo’s rooftop solar flyer combines installations, benefits and a QR code.",
          "aspect": "1489 / 2106"
        },
        "accent": "#292726"
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
          aspect: '388 / 548',
          frameBg: '#274d7a',
        },
        accent: '#58789e',
      },
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
          aspect: '952 / 1348',
          frameBg: '#161414',
        },
        accent: '#6d323e',
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
          aspect: '2122 / 3000',
          frameBg: '#ece7df',
        },
        accent: '#b49276',
      },
      {
        "id": "canva-claude-chatgpt",
        "categoryId": "design",
        "title": "Claude vs ChatGPT",
        "subtitle": "Clapingo · Editorial cover",
        "year": "",
        "role": "Graphic design",
        "summary": "Green and coral illustrations introduce a practical comparison of two AI tools.",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/claude-chatgpt.webp",
          "alt": "Green and coral illustrations introduce a practical comparison of two AI tools.",
          "aspect": "3375 / 4500"
        },
        "accent": "#292726"
      },
      {
        "id": "design-rang-collage",
        "categoryId": "design",
        "title": "Rang & Ruckus · Phase 1",
        "subtitle": "Campus events",
        "year": "",
        "role": "Graphic design",
        "summary": "A red and yellow collage combines festival lettering, illustrations and event details.",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/rang-collage.webp",
          "alt": "A red and yellow collage combines festival lettering, illustrations and event details.",
          "aspect": "3375 / 4219"
        },
        "accent": "#292726"
      },
      {
        "id": "poster-mahabaleshwar",
        "categoryId": "design",
        "title": "Mahabaleshwar",
        "subtitle": "Travel Bug Goa",
        "year": "",
        "role": "Poster design",
        "summary": "A hillside photograph and a green headline introduce the destination.",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/mahabaleshwar.webp",
          "alt": "A hillside photograph and a green headline introduce the destination.",
          "aspect": "1600 / 2000"
        },
        "accent": "#292726"
      },
      {
        "id": "poster-founders-table",
        "categoryId": "design",
        "title": "The Founders’ Table",
        "subtitle": "VIT Bhopal Startup Club",
        "year": "",
        "role": "Poster design",
        "summary": "A blue-toned speaker poster featuring Clapingo founder Sameer Agrawal.",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/founders-table.webp",
          "alt": "A blue-toned speaker poster featuring Clapingo founder Sameer Agrawal.",
          "aspect": "1600 / 2000"
        },
        "accent": "#292726"
      },
      {
        "id": "design-ai-tools",
        "categoryId": "design",
        "title": "25+ AI Tools in 3 Hours",
        "subtitle": "AI workshops",
        "year": "",
        "role": "Graphic design",
        "summary": "A Clapingo ad placing AI tool icons above a cropped portrait.",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/ai-tools.webp",
          "alt": "A Clapingo ad placing AI tool icons above a cropped portrait.",
          "aspect": "1875 / 1875"
        },
        "accent": "#292726"
      },
      {
        "id": "canva-claude-professionals",
        "categoryId": "design",
        "title": "Claude Workshop for Professionals",
        "subtitle": "Clapingo · Workshop campaign",
        "year": "",
        "role": "Graphic design",
        "summary": "An orange headline panel and a small robot introduce a workshop for working professionals.",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/claude-professionals.webp",
          "alt": "An orange headline panel and a small robot introduce a workshop for working professionals.",
          "aspect": "3375 / 3375"
        },
        "accent": "#292726"
      },
      {
        "id": "canva-senior-developer",
        "categoryId": "design",
        "title": "Still a Senior Developer?",
        "subtitle": "Career campaign",
        "year": "",
        "role": "Graphic design",
        "summary": "Still a Senior Developer?",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/senior-developer.webp",
          "alt": "Still a Senior Developer? — Career campaign",
          "aspect": "3375 / 3375"
        },
        "accent": "#292726"
      },
      {
        "id": "design-skyhills-sale",
        "categoryId": "design",
        "title": "Skyhills 3",
        "subtitle": "Dubai real estate",
        "year": "",
        "role": "Graphic design",
        "summary": "Team India Properties sales campaign for Skyhills 3.",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/skyhills-sale.webp",
          "alt": "Team India Properties sales campaign for Skyhills 3.",
          "aspect": "1600 / 1600"
        },
        "accent": "#292726"
      },
      {
        "id": "poster-rang-ruckus",
        "categoryId": "design",
        "title": "Rang & Ruckus",
        "subtitle": "VIT Bhopal Startup Club",
        "year": "",
        "role": "Poster design",
        "summary": "Red stage curtains frame the event title and illustrated characters.",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/rang-ruckus.webp",
          "alt": "Red stage curtains frame the event title and illustrated characters.",
          "aspect": "1800 / 1800"
        },
        "accent": "#292726"
      },
      {
        "id": "poster-opus",
        "categoryId": "design",
        "title": "The Opus Residence",
        "subtitle": "Team India Properties",
        "year": "",
        "role": "Poster design",
        "summary": "Oversized serif lettering overlays the tower against the blue city skyline.",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/opus.webp",
          "alt": "Oversized serif lettering overlays the tower against the blue city skyline.",
          "aspect": "1800 / 1800"
        },
        "accent": "#292726"
      },
      {
        "id": "design-beachfront",
        "categoryId": "design",
        "title": "Jacob & Co. Beachfront",
        "subtitle": "Team India Properties",
        "year": "",
        "role": "Property campaign",
        "summary": "Beachfront property campaign artwork for Team India Properties.",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/beachfront.webp",
          "alt": "Beachfront property campaign artwork for Team India Properties.",
          "aspect": "1800 / 1800"
        },
        "accent": "#292726"
      },
      {
        "id": "archive-chocolate-cone",
        "categoryId": "design",
        "title": "Chocolate in orbit",
        "subtitle": "AI product visual",
        "year": "",
        "role": "AI product visual",
        "summary": "A chocolate cone sits inside a ring of chocolate and scattered nuts.",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/chocolate-cone.webp",
          "alt": "A chocolate cone sits inside a ring of chocolate and scattered nuts.",
          "aspect": "820 / 820"
        },
        "accent": "#292726"
      },
      {
        "id": "canva-venture-certificate",
        "categoryId": "design",
        "title": "Venture.AI 2026",
        "subtitle": "Certificate design",
        "year": "",
        "role": "Graphic design",
        "summary": "Venture.AI 2026",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/venture-certificate.webp",
          "alt": "Venture.AI 2026 — Certificate design",
          "aspect": "1010 / 715"
        },
        "accent": "#292726"
      },
      {
        "id": "canva-smai-certificate",
        "categoryId": "design",
        "title": "Certificate of Participation",
        "subtitle": "Certificate design",
        "year": "",
        "role": "Graphic design",
        "summary": "Certificate of Participation",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/smai-certificate.webp",
          "alt": "Certificate of Participation — Certificate design",
          "aspect": "839 / 592"
        },
        "accent": "#292726"
      },
      {
        "id": "archive-nutaan-editorial",
        "categoryId": "design",
        "title": "You Create. Nutaan Accelerates.",
        "subtitle": "Nutaan · Editorial visual",
        "year": "",
        "role": "Editorial visual",
        "summary": "A blue silhouette and a stack of service labels illustrate Nutaan’s offering.",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/nutaan-editorial.webp",
          "alt": "A blue silhouette and a stack of service labels illustrate Nutaan’s offering.",
          "aspect": "1076 / 717"
        },
        "accent": "#292726"
      },
      {
        "id": "design-aether-desert",
        "categoryId": "design",
        "title": "Aether · Desert",
        "subtitle": "Perfume campaign",
        "year": "",
        "role": "Product visual",
        "summary": "Black Aether perfume bottle resting in golden sand",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/aether-desert.webp",
          "alt": "Black Aether perfume bottle resting in golden sand",
          "aspect": "1408 / 768"
        },
        "accent": "#292726"
      },
      {
        "id": "design-aether-studio",
        "categoryId": "design",
        "title": "Aether · Studio",
        "subtitle": "Perfume campaign",
        "year": "",
        "role": "Product visual",
        "summary": "Hands holding the Aether Essence of Void perfume bottle",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/aether-studio.webp",
          "alt": "Hands holding the Aether Essence of Void perfume bottle",
          "aspect": "2784 / 1536"
        },
        "accent": "#292726"
      },
      {
        "id": "canva-portfolio-banner",
        "categoryId": "design",
        "title": "Building with Code, Designing with Intent",
        "subtitle": "Personal identity · LinkedIn banner",
        "year": "",
        "role": "Graphic design",
        "summary": "An abstract violet ribbon links the headline on the left to Ishant’s signature on the right.",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/portfolio-banner.webp",
          "alt": "An abstract violet ribbon links the headline on the left to Ishant’s signature on the right.",
          "aspect": "1500 / 500"
        },
        "accent": "#292726"
      },
      {
        "id": "design-scribeai-mark",
        "categoryId": "design",
        "title": "ScribeAI",
        "subtitle": "Brand identity",
        "year": "",
        "role": "Brand identity",
        "summary": "ScribeAI logo design for a medical documentation product.",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/scribeai-mark.webp",
          "alt": "ScribeAI logo design for a medical documentation product.",
          "aspect": "1606 / 344"
        },
        "accent": "#292726"
      },
      {
        "id": "canva-career-banner",
        "categoryId": "design",
        "title": "Your Career, Future-Ready",
        "subtitle": "Channel identity",
        "year": "",
        "role": "Graphic design",
        "summary": "Your Career, Future-Ready",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/career-banner.webp",
          "alt": "Your Career, Future-Ready — Channel identity",
          "aspect": "1055 / 593"
        },
        "accent": "#292726"
      },
      {
        "id": "canva-ats-resume",
        "categoryId": "design",
        "title": "ATS Resume Generator",
        "subtitle": "YouTube thumbnails",
        "year": "",
        "role": "Graphic design",
        "summary": "ATS Resume Generator",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/ats-resume.webp",
          "alt": "ATS Resume Generator — YouTube thumbnails",
          "aspect": "1055 / 593"
        },
        "accent": "#292726"
      },
      {
        "id": "canva-video-phase-one",
        "categoryId": "design",
        "title": "Video Using AI · Phase 1",
        "subtitle": "AI course design",
        "year": "",
        "role": "Graphic design",
        "summary": "Video Using AI · Phase 1",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/video-phase-one.webp",
          "alt": "Video Using AI · Phase 1 — AI course design",
          "aspect": "1055 / 593"
        },
        "accent": "#292726"
      },
      {
        "id": "design-workshop-speaker",
        "categoryId": "design",
        "title": "30+ AI Tools in 2.5 Hours",
        "subtitle": "Workshop advertising",
        "year": "",
        "role": "Graphic design",
        "summary": "A horizontal workshop ad pairs a speaker portrait with a grid of AI tools.",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/workshop-speaker.webp",
          "alt": "A horizontal workshop ad pairs a speaker portrait with a grid of AI tools.",
          "aspect": "2400 / 1350"
        },
        "accent": "#292726"
      },
      {
        "id": "design-carevyn-mark",
        "categoryId": "design",
        "title": "Carevyn",
        "subtitle": "Brand identity",
        "year": "",
        "role": "Brand identity",
        "summary": "Carevyn symbol and wordmark in their horizontal arrangement.",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/carevyn-mark.webp",
          "alt": "Carevyn symbol and wordmark in their horizontal arrangement.",
          "aspect": "1800 / 1013"
        },
        "accent": "#292726"
      },
      {
        "id": "archive-fluent-talk",
        "categoryId": "design",
        "title": "Fluent Talk Tips",
        "subtitle": "Clapingo · YouTube thumbnail",
        "year": "",
        "role": "YouTube thumbnail",
        "summary": "Two speakers flank a bold yellow and red conversation headline.",
        "links": [],
        "visual": {
          "kind": "image",
          "src": "/assets/posters/fluent-talk.webp",
          "alt": "Two speakers flank a bold yellow and red conversation headline.",
          "aspect": "1152 / 648"
        },
        "accent": "#292726"
      },
    ],
  },
  {
    id: 'automate',
    label: 'EXPLORE',
    displayTitle: 'Explore',
    tagline: 'I make AI videos, work through questions live and build tools for the people producing the next one.',
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
        id: 'explore-live-video',
        categoryId: 'automate',
        title: 'From a character sheet to a 24-second film',
        subtitle: 'Clapingo · Live AI sessions',
        year: '',
        role: 'Live instructor',
        summary: 'I led two live AI sessions. In this demo, I showed working professionals how to keep a character consistent across three eight-second scenes, from the first image prompt to the animated clip.',
        links: [],
        visual: {
          kind: 'image',
          src: '/assets/clapingo-live-session.webp',
          alt: 'Ishant presenting the character-sheet and video prompt document during a live session',
        },
        accent: '#597467',
      },
      {
        id: 'explore-recorded-courses',
        categoryId: 'automate',
        title: 'Producing four paid AI courses',
        subtitle: 'Clapingo · Recorded courses',
        year: '',
        role: 'Solo course production',
        summary: 'I produced four recorded courses covering image generation, presentations, prompt engineering and video. I created the lessons and finished videos, using an AI presenter and generated voiceover.',
        links: [],
        visual: {
          kind: 'image',
          src: '/assets/posters/video-phase-one.webp',
          alt: 'Course artwork for Video Using AI, Phase 1',
        },
        accent: '#86639e',
      },
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
