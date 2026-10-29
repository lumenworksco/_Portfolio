# Portfolio Hub

[![Deploy](https://github.com/lumenworksco/_Portfolio/actions/workflows/deploy.yml/badge.svg)](https://github.com/lumenworksco/_Portfolio/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss&logoColor=white)

Personal hub for [braunf.com](https://braunf.com): a WebGL glass orb that opens chapters of my life, with links out to my projects, research, music, photos and contact details, plus a Pokémon-style Pokédex of achievements, which also holds the doors to Beats and the photo portfolio.

## Pages

| Route | Description |
| --- | --- |
| `/` | A WebGL glass orb. Click it to browse seven chapters of my life (school years, studies, building, research, work, off duty, say hello). Two trading cards lead to the projects and research sites, and a red Pokédex button and a Contact button sit at the edges. |
| `/classic` | The earlier home page, a Pokémon-style start menu with a WebGL aurora background. Kept for now, set to `noindex` |
| `/agent` | Redirects to `/` (the orb used to live here) |
| `/research` | Redirects to [research.braunf.com](https://research.braunf.com), where the papers and the Mabushi Lab engineering work now live together |
| `/pokedex` | Pokémon start-menu themed Pokédex with two tabs: the searchable, filterable list of achievements (hackathons, awards, education, certifications) and **Now**, the current focus areas with live GitHub and Hugging Face activity (`/pokedex#now`). Two devices on the left edge open Beats (`/music`) and the photo portfolio |
| `/terminal` | Interactive terminal with commands |
| `/music` | Loops made on a Teenage Engineering PO-33 K.O.!, as a PO-33-style device: LCD, printed buttons and a 4x4 key bank that plays them |
| `/now` | Redirects to `/pokedex#now` |
| `/contact` | Email and project links |

The Pokédex's Now tab shows live GitHub (and, on the Now tab, Hugging Face) activity, fetched client-side from public APIs.

## Related sites

Each of these is its own static site in its own repository.

| Site | What it is |
| --- | --- |
| [research.braunf.com](https://research.braunf.com) | Mabushi Lab: research papers first, open-source ESP32 hardware alongside |
| [projects.braunf.com](https://projects.braunf.com) | Lumen Studio: my personal projects portfolio |
| [cc.braunf.com](https://cc.braunf.com) | CalmCampus |
| [data.braunf.com](https://data.braunf.com) | DataCamp credentials |

## Tech Stack

- **Framework:** Next.js 16 (App Router, static export), React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **Animation:** Framer Motion, WebGL via [ogl](https://github.com/oframe/ogl) (the aurora background and the GLSL orb shader)
- **Icons:** lucide-react
- **Hosting:** GitHub Pages with a custom domain

## Getting Started

Requires Node.js 20+.

```sh
npm install
npm run dev     # http://localhost:3000
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Build the static site into `out/` |
| `npm start` | Serve a production build (`npm run build` first) |
| `npm run lint` | Run ESLint |

## The orb (`/`)

`src/components/agent/Ball.tsx` renders a full-canvas GLSL fragment shader (`ballShader.ts`) with ogl: a glass sphere with domain-warped pastel flow, a thin-film rim and a glow. It drifts on its own, leans toward the cursor, swirls near it and pops on click, and falls back to a CSS gradient ball when WebGL2 is unavailable. Each chapter in `src/data/lifeChapters.ts` supplies a colour palette that the orb blends to, plus the cards shown beside it. Every statement there comes from content already published on the sites.

Parked for later: an offline question-answering assistant (`src/lib/agentEngine.ts`, `src/data/agentKnowledge.ts`) and an earlier plasma-orb with shape morphing (`OrbGL.tsx`, `orbShader.ts`, `AgentOrb.tsx`, `Orb.tsx`). The page no longer uses them, but they stay in the repo and in history.

## Project Structure

```
src/
  app/         Routes (one folder per page) and global styles
  components/  Page components, UI primitives and the orb (components/agent)
  data/        Achievements, beat definitions, agent notes and life chapters
  lib/         Hooks, UI sound effects and the assistant engine
public/        Open Graph image, audio assets and the collector-card images
```

## Deployment

Pushes to `master` build and deploy to [braunf.com](https://braunf.com) through GitHub Actions (`.github/workflows/deploy.yml`). The domain is configured in `CNAME`.

## License

Code is released under the [MIT License](LICENSE). Personal content (text, photos, music and other media) is © Florian Braun, all rights reserved.
