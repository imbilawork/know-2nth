# CLAUDE.md — know.2nth.ai

## What this is

**know.2nth.ai** is the knowledge portal and skills tree browser for 2nth.ai. It serves structured knowledge that humans read and AI agents consume as operational context. Every skill node is simultaneously an explainer (for humans), a context document (for agents), and an operational guide (for agent-managed infrastructure).

This is part of the broader 2nth.ai ecosystem:
- **2nth.ai** — the framework and GTM site (Human + AI = 2ⁿ)
- **2nth.io** — compute infrastructure layer
- **know.2nth.ai** — knowledge portal and skills tree (this project)
- **imbila.ai** — parent consultancy brand

## Project structure

```
know-2nth/
├── CLAUDE.md              # This file
├── index.html             # Portal landing page
├── explainers/            # Individual skill node pages
│   ├── infra/             # Infrastructure domain
│   ├── ai/                # AI & ML domain
│   ├── security/          # Security & Identity domain
│   ├── data/              # Data & Observability domain
│   ├── business/          # Business Operations domain
│   └── professional/      # Professional Services domain
├── assets/
│   ├── css/               # Shared styles if extracted
│   └── img/               # Logos, favicons, og-images
└── api/                   # Cloudflare Workers for agent context API
    └── context/           # Returns skill nodes as structured JSON/MD
```

## Design system

### Fonts
- **Outfit** — headings and body text (weights: 300, 400, 500, 600, 700, 800)
- **JetBrains Mono** — code, labels, section markers, badges, nav brand
- Never use Inter, Roboto, Arial, or system defaults as primary

### Colour palette (CSS variables)
| Token | Dark value | Usage |
|-------|-----------|-------|
| `--ink` | `#0B1120` | Page background |
| `--navy` | `#121D33` | Raised surfaces |
| `--blue` | `#2563EB` | Primary accent |
| `--blue-glow` | `#3B82F6` | Primary accent (lighter) |
| `--sky` | `#38BDF8` | Secondary accent, links |
| `--paper` | `#F8FAFC` | Text on dark |
| `--slate` | `#94A3B8` | Secondary text |
| `--warm` | `#F59E0B` | Business/partner accent |
| `--green` | `#10B981` | Security/open tier accent |
| `--violet` | `#8B5CF6` | AI/ML domain accent |
| `--rose` | `#F43F5E` | Professional services accent |

### Domain colour mapping
- Infrastructure → blue
- AI & ML → violet
- Security & Identity → green
- Data & Observability → sky
- Business Operations → warm/amber
- Professional Services → rose

### Theme
- Dark mode is default (`data-theme="dark"`)
- Light mode toggle available, persists via localStorage
- All colours through CSS custom properties — never hardcode hex in HTML

### Component patterns
- **Section labels**: JetBrains Mono, 11px, uppercase, leterspacing 2px, sky colour. Format: `01 · Section Name`
- **Cards**: `var(--bg-card)` background, backdrop-filter blur, 1px border, 20px radius, hover lift + border glow
- **Pills/badges**: JetBrains Mono, 10-11px, pill radius, domain-coloured background
- **Buttons**: Outfit font, pill radius, primary = blue gradient, ghost = transparent + border
- **Fade-in**: `.fade-up` class with IntersectionObserver, 24px translate, 0.6s ease

### Radii
- `--radius-sm`: 8px
- `--radius-md`: 12px
- `--radius-lg`: 20px
- `--radius-pill`: 100px

## Explainer pages

Individual skill nodes follow the **imbila-explainer** pattern adapted for 2nth.ai branding:

### Key differences from imbila.ai explainers
- Nav brand: `know.2nth.ai` not `Imbila.AI`
- Colour system: blue/sky/ink palette, not honey accent
- Font: Outfit + JetBrains Mono, not DM Sans
- Footer links: 2nth.ai, imbila.ai, 2nth.io
- Section 08 becomes "2ⁿ Perspective" — how this skill compounds in the tree, what it connects to, how agents use it
- Agent context callout: each explainer should include a "Load this context" section or download for agent consumption

### Section pattern for explainers
```
01 · What Is [Topic]        — Definition, problem it solves, flow diagram
02 · Why It Matters          — Stats, adoption, key numbers
03 · How It Works            — Core concepts (3-5), code examples
04 · The Ecosystem           — Related tools, comparison table
05 · Use Cases               — Real-world applications as card grid
06 · Evolution               — Timeline from origin to current
07 · Decision Guide          — "Use when" vs "Skip when"
08 · 2ⁿ Perspective          — How this node connects, compounds, agent usage
09 · Resources               — Official links, sources, agent context download
```

## Three-tier access model

| Tier | Gate | Content |
|------|------|---------|
| **Explore** (Open) | None | All technology explainers, framework overviews, decision guides |
| **Build** (Member) | Email signup | Operational skill nodes, context bundles, deployment templates, learning paths |
| **Compound** (Partner) | Contact/invite | Private branches, co-branded nodes, institutional knowledge capture |

## Deployment

- **Hosting**: Cloudflare Pages (static site)
- **Domain**: `know.2nth.ai` subdomain
- **Auth**: Cloudflare Access for member tier gating
- **Agent API**: Cloudflare Workers at `/api/context/[domain]/[skill]` — returns skill node as structured markdown or JSON
- **Repo**: GitHub under imbilawork org

## Content voice

Same as imbila.ai voice system:
- Sharp, experienced colleague — not a corporate brochure
- Anti-hype: no "cutting-edge", "revolutionary", "paradigm shift"
- Honest decision guides — tell people when NOT to use the technology
- South African voice — natural, not performative
- Technical depth without jargon gatekeeping

## Agent context format

When serving content to agents (via API or download), each skill node should include:

```markdown
# [Skill Name]
## Domain: [domain]
## Connects to: [list of related skill nodes]
## Last updated: [date]

### What this is
[1-2 sentence definition]

### Key concepts
[Structured list of core concepts with brief explanations]

### Operational patterns
[Deployment, configuration, and integration patterns]

### Connection map
[How this skill interacts with adjacent nodes in the tree]

### Decision context
[When to use, when to skip, key tradeoffs]
```

## Commands

```bash
# Local dev
npx serve .                          # Serve locally for preview

# Deploy (once repo + Pages configured)
git add -A && git commit -m "msg"
git push origin main                 # Cloudflare Pages auto-deploys

# Create new explainer
# Use Claude with imbila-explainer skill adapted for 2nth branding
# Save to explainers/[domain]/[topic].html
```

## Current state (April 2025)

- [x] Landing page built (index.html)
- [ ] Domain browse pages
- [ ] Individual explainer pages migrated/adapted from imbila pattern
- [ ] Cloudflare Pages deployment
- [ ] Cloudflare Access for member tier
- [ ] Agent context API (Workers)
- [ ] Content manifest (JSON index of all skill nodes)
- [ ] Signup flow
- [ ] Search
- **Target**: May 1, 2025 go-live with landing page + initial explainers in Explore tier
