# CLAUDE.md — know.2nth.ai

## What this is

**know.2nth.ai** is the public knowledge tree for the 2nth.ai ecosystem — a static HTML portal of explainer "leaves" grouped under top-level domains. Every leaf is both a human-readable reference and an agent-consumable context document.

Sibling sites in the ecosystem:
- **2nth.ai** — framework / GTM site (Human + AI = 2ⁿ)
- **dev.2nth.ai** — partner / Gridline / openBUILD AI source content (Construction domain pulls from here)
- **2nth.io** — compute infrastructure layer
- **imbila.ai** — parent consultancy brand

## Repo & deploy

- **GitHub**: `2nth-ai/know-2nth` (default branch `main`)
- **Hosting**: Cloudflare Pages, project `know-2nth`, custom domain `know.2nth.ai`
- **Deploy is manual.** The Pages project is NOT wired to GitHub — `git push` does not deploy. Production updates only happen when someone runs `npx wrangler pages deploy . --project-name=know-2nth --branch=main` from the repo root.
- **Implication**: git and prod can drift in both directions. Uncommitted local files will deploy; committed files won't ship until the wrangler command is run. After every PR merge, pull main and run the deploy.

## Repo layout

```
know-2nth/
├── CLAUDE.md
├── index.html                # root: 12 top-level domain cards
├── about.html                # access model + how the site works
├── join.html                 # HubSpot signup form (soft conversion play)
├── gate.js                   # tier-gate hook, loaded on every leaf, currently inert
├── og-image.jpg              # 1200×630 OG / Twitter card
├── og-image.svg              # source for the OG image
├── _redirects                # Cloudflare Pages redirects
├── google-adk-explainer.md   # canonical source markdown for ADK leaf (PR #17)
└── explainers/
    ├── agents/        # Frameworks, Protocols, Models, Inference (the strategic priority)
    ├── biz/           # ERP, CRM, HR — has erp/ and crm/ sub-hubs
    ├── construction/  # openBIM + Gridline / openBUILD AI partner-anchored
    ├── data/          # analytics/, warehousing/, engineering/ sub-hubs
    ├── design/        # tokens, components, motion, AI-assisted design
    ├── partners/      # co-branded leaves (no hub yet, not on root grid)
    ├── people/        # coaching, leadership, typologies/
    └── tech/          # cloudflare/, google/, microsoft/, frappe/, runtime/, android-hce/, embedded/, frameworks/
```

Five additional domains exist on the root grid as cards but have **no folder yet**: `edu`, `fin`, `health`, `iot`, `leg`. Building any of them out means: create `explainers/<domain>/index.html` hub, ship at least one Live leaf, then the root card becomes meaningful.

## How leaves are built

- **Static HTML, no build step, no framework.** Every leaf is a self-contained `.html` with its CSS duplicated inline at the top. Deliberate — keeps each leaf independent and editable directly.
- **To author a new leaf**: copy a similar existing leaf as a template, then rewrite the body. Examples by type:
  - Framework topic → `explainers/agents/langgraph.html`
  - Model topic → `explainers/agents/claude.html`
  - Inference / serving → `explainers/agents/vllm.html`
  - Cloud product → `explainers/tech/cloudflare/workers.html`
- **Leaf section pattern** (7–9 numbered sections, varies by topic):
  - `01 · What it is` — definition, problem solved
  - `02 · How it works` / `vs alternatives` — concepts, comparison
  - `03–05 · Ecosystem / Use cases / Pricing reality` — domain-appropriate
  - `0N · Decision guide` — use when / skip when
  - `0N · South African context` — SA delivery framing
  - `0N · Connections` — links elsewhere in the tree
  - `0N · Resources` — primary sources only
- **Section labels**: JetBrains Mono, 11px, uppercase, 2px letter-spacing, sky colour. Format: `01 · Section name`.

## Hubs and stubs

Hubs (`explainers/<domain>/index.html` and sub-hubs) list their leaves as cards. Two patterns coexist:

- `svc-card` / `svc-card soon` — used by `agents`, `tech/*`, `construction`, `design`
- `hub-card` / `leaf-card` (with `soon` variant) — used by `biz`, `data`, `people`, `tech` (root)

Both work; pick whichever the surrounding hub uses. **Stubs use the `soon` modifier**; flipping a stub to Live = swap `<div class="…-card soon">` for `<a href="…" class="…-card">`. After flipping, bump any "N Live" count in the hub heading and on the matching root domain card.

## Design system

### Fonts (loaded from Google Fonts)
- **Outfit** — body, headings (300, 400, 500, 600, 700, 800)
- **JetBrains Mono** — code, labels, badges, nav brand

### Theme
- Dark mode is default (`data-theme="dark"`)
- Light mode toggle persists via localStorage
- All colours come from CSS custom properties — never hardcode hex in body markup. Define new tokens at `:root` if needed.

### Colour tokens (in `:root`)
| Token | Value | Used for |
|---|---|---|
| `--ink` | `#0B1120` | page bg (dark) |
| `--ink-deep` | `#060A14` | code-block bg |
| `--navy` | `#121D33` | raised surfaces |
| `--blue` / `--blue-glow` | `#2563EB` / `#3B82F6` | primary accent (tech) |
| `--sky` / `--sky-muted` | `#38BDF8` / `#7DD3FC` | secondary accent (data) |
| `--paper` / `--mist` / `--slate` | `#F8FAFC` / `#E2E8F0` / `#94A3B8` | text on dark |
| `--green` (+ `--green-soft`) | `#10B981` | fin / success |
| `--warm` (+ `--warm-soft`) | `#F59E0B` | biz / edu |
| `--violet` (+ `--violet-soft`) | `#8B5CF6` | health / design |
| `--rose` (+ `--rose-soft`) | `#F43F5E` | leg / people |

### Domain → accent mapping (root index)
| Domain | Accent |
|---|---|
| tech | `--blue` |
| biz, edu | `--warm` |
| data, iot | `--sky` |
| fin | `--green` |
| leg, people | `--rose` |
| health, design | `--violet` |
| construction | `#EA580C` (custom orange) |
| agents | `#6366F1` (custom indigo) |

### Component patterns
- **Cards**: `var(--bg-card)` background, `backdrop-filter: blur(10px)`, 1px border, 20px radius (`--radius-lg`), hover lift + border glow.
- **Pills / badges**: JetBrains Mono, 10–11px, pill radius (`--radius-pill: 100px`), domain-coloured background.
- **Buttons**: Outfit, pill radius. Primary = blue→sky gradient. Ghost = transparent + 1px border.
- **Fade-in**: `.fade-up` with IntersectionObserver, ~24px translate, 0.6s ease.

## Tier-gating: currently inert

Per PR #15, **all content is open**. `gate.js` is loaded on every leaf (~95 files) but does nothing because no element on the site carries `data-tier="member"`. The hook is wired to set a `2nth-know-member` localStorage flag on successful HubSpot form submit (typically from `/join.html`).

**Don't add new `data-tier="member"` attributes when authoring leaves** — they will silently do nothing now and create cleanup work later. Re-gating is a Phase 2 decision tied to magic-link auth; until then, the conversion play is the `/join` form for tracking who's reading.

## Voice

Same voice system as imbila.ai:
- Sharp, experienced colleague — not a corporate brochure
- Anti-hype: no "cutting-edge", "revolutionary", "paradigm shift"
- Honest decision guides — surface when a technology is the wrong choice, not just when it's the right one
- South African voice — natural, not performative
- Technical depth without jargon gatekeeping
- Sources-validated: cite primary sources only in the Resources section

### Third-person, impersonal — no "you / we / I"

All user-facing HTML content (leaves, hubs, root index, validation memos) is written in **third-person, impersonal voice**. Don't use `you`, `your`, `yours`, `we`, `our`, `ours`, `us`, `I`, `i'm`, `i've`, `i'll` in any rendered body copy. Code comments inside `<pre class="code">` blocks count as content — same rule.

Exempt: commit messages, PR bodies, `CLAUDE.md`, the `*.md` source-of-truth files at the repo root (e.g. `sa-llm-residency-validation.md`, `google-adk-explainer.md`). Those are working documents, not site content.

How to rephrase the common patterns:

| ❌ Don't write | ✅ Write |
|---|---|
| If you're on Salesforce... | For teams on Salesforce... / Salesforce-bound deployments... |
| You'll want to... | The right pattern is... / Production deployments typically... |
| We recommend... | The 2nth recommendation is... / The 2nth default for new builds is... |
| We've found... | Production evidence suggests... / The pattern from PRs #17–#25 is... |
| Your business... | A business... / The business... / The customer org... |
| Confirm with your team... | Confirm with the team that owns the workload... |

Some leaves cover topics where second-person feels structurally natural — typology / coaching / personality frameworks (`people/typologies/enneagram` is the obvious case). The rule still applies: rephrase as "the person being typed" / "the reader" / "the practitioner" rather than dropping into "you". The friction is intentional — it forces tighter writing.

When auditing an existing leaf for compliance:

```bash
grep -ciE "\b(you|your|yours|we|our|ours|us)\b" explainers/<path>/<leaf>.html
```

Non-zero count means there's work to do.

## Content review cycle

Every leaf carries a **`Last reviewed`** stamp in its footer and is tagged into one of three cadence tiers. Stale-content drift (the kind that produced the SA residency corrections) becomes visible instead of silent.

### The footer stamp

Just before `</footer>`, every leaf includes:

```html
<p class="footer-meta">
  Last reviewed: <time datetime="2026-05-15">2026-05-15</time> · Tier: hot
</p>
```

Three tiers, three cadences. Each tier has typical members; assign new leaves at authoring time.

| Tier | Cadence | Typical members |
|---|---|---|
| **hot** | quarterly | AI vendors with fast-moving products — Claude, GPT, Gemini, ADK, AgentForce, MCP, Skills, A2A, Bedrock, Azure OpenAI, vLLM, Ollama, OpenRouter, anything frontier-model-touching |
| **warm** | semi-annual | Platforms moving at quarterly cadence — Salesforce, HubSpot, Tableau, Data Cloud, MuleSoft, Cloudflare services, BigQuery, ClickHouse, Postgres at the SaaS layer |
| **cool** | annual | Mature foundational tech — Frappe framework, Postgres at the DB layer, design patterns, openBIM, Enneagram, NHBRC documentation patterns |

### Trigger events that force an out-of-cycle review

A leaf must be reviewed (and its `Last reviewed` date bumped) when any of these happen, regardless of where it sits in its cadence:

- Major vendor announcement — new SKU, GA, pricing change, region launch, deprecation
- User-flagged inaccuracy
- Major version bump on a referenced product (e.g. AgentForce 3 → 4)
- New leaf authoring that contradicts an existing one — fix both, then bump both stamps

### When a review surfaces corrections

Corrections worth surfacing publicly become **validation memos** following the `sa-llm-residency-validation` pattern:

1. Author a markdown source at the repo root: `<topic>-validation.md`
2. Render as a styled HTML page at the repo root: `<topic>-validation.html` (rose accent, "Validation" eyebrow, diff-card pattern for before/after replacements)
3. Apply the line edits to the affected leaves and bump their `Last reviewed` dates
4. Feature on root `index.html` "From the tree" with the Validation card pattern (rose left-border, `Update · YYYY-MM-DD` tier-tag, link to the rendered HTML)

Minor corrections (typos, broken links, model-version refresh) just bump the leaf's `Last reviewed` date — no memo, no home-page card.

### What's deferred (not built yet)

- A `/changelog.html` page that lists recent reviews + validation memos chronologically
- A script (`npm run review-due` or similar) that scans every leaf's `Last reviewed` date and flags leaves overdue for their tier
- A pre-commit / CI hook that warns when a touched leaf hasn't been reviewed inside its cadence window

These belong to a future Phase D once the per-leaf stamps are in place site-wide.

## Daily workflow

The shipping pattern from the PR #17–#25 batch is **one git worktree per feature**, off `origin/main`, so the main checkout stays clean and multiple Claude Code terminals can run different features in parallel without colliding.

```bash
# From the main checkout, on main
git fetch origin main
git worktree add ../know-2nth-<short> -b chore/<feature> origin/main
cd ../know-2nth-<short>

# Work, commit specific files (avoid -A — keeps secrets out)
git add explainers/<path>/<file>.html
git commit -m "Author <topic> leaf"
git push -u origin chore/<feature>

# Open and merge the PR
gh pr create --base main --head chore/<feature> --title "…" --body "…"
gh pr merge <PR#> --squash --delete-branch

# Clean up the worktree
cd ../know-2nth          # or wherever the main checkout lives on this Mac
git worktree remove ../know-2nth-<short>
git branch -D chore/<feature>
git pull origin main

# Deploy (manual)
npx wrangler pages deploy . --project-name=know-2nth --branch=main
```

The local path of the main checkout varies per machine. On the primary Mac it's `~/2nth/know.2nth`; the `know-2nth-setup.html` reference doc at the repo's parent directory documents the canonical setup for that machine.

## Common operations

- **Add a leaf to an existing domain**: copy a similar leaf → rewrite hero + sections + meta → flip the matching `soon` card on the domain hub to Live → bump Live count on the hub and on the root domain card if shown → worktree → PR → merge → deploy.
- **Add a new top-level domain**: pick a unique colour + emoji → add CSS rule for `.domain-card[data-domain="X"]` in root `index.html` → add the card to `.domains-grid` → bump "N domains" count in the section title → build `explainers/X/index.html` hub → ship at least one Live leaf so the domain isn't empty on launch.
- **Author from source markdown**: when a `*-explainer.md` file lands in the repo root (like `google-adk-explainer.md`), it's the canonical source — mine it for the rendered HTML leaf and preserve the primary-source-only discipline.
- **OG / Twitter meta sweep**: every leaf needs the standard `og:title / og:description / og:image / twitter:card / twitter:title / twitter:description / twitter:image` block. The site's OG image is `/og-image.jpg` (source: `/og-image.svg`).

## Pre-deploy sanity check

```bash
git pull origin main && git log --oneline -3 && git status --short
```

Confirm latest commit is the one just merged, working tree is clean, on `main`. Then `npx wrangler pages deploy …`.

## What's NOT in this repo

- The other 2nth-ai sites (`2nth.ai`, `dev.2nth.ai`, `agents.2nth.ai`, `clients.2nth.ai`, `skills.2nth.ai`, `2nth-skills.pages.dev`) are separate repos with their own deploy flows.
- There is no agent-context API (`/api/context/…`) and no Workers in this repo. If a structured-export endpoint is added later, document it here.
