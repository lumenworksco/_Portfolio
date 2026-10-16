# Portfolio Hub

[![Deploy](https://github.com/lumenworksco/Portfolio/actions/workflows/deploy.yml/badge.svg)](https://github.com/lumenworksco/Portfolio/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss&logoColor=white)

Personal hub for [braunf.com](https://braunf.com): a Pokémon-style project selector that links out to my projects, research, music and contact details.

## Pages

| Route | Description |
| --- | --- |
| `/` | Project selector hub with WebGL aurora background |
| `/portfolio` | Selected projects |
| `/research` | Papers and research work |
| `/pokedex` | Pokédex-style overview of skills and achievements |
| `/terminal` | Interactive terminal |
| `/music` | Chiptune beats and a pocket-operator style sequencer |
| `/now` | What I'm currently working on |
| `/contact` | Contact and social links |

The home page also shows live GitHub and Hugging Face activity, fetched client-side from their public APIs.

## Tech Stack

- **Framework:** Next.js 16 (App Router, static export), React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **Animation:** Framer Motion, WebGL aurora via [ogl](https://github.com/oframe/ogl)
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
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
  app/         Routes (one folder per page) and global styles
  components/  Page components and UI primitives
  data/        Achievements and beat definitions
  lib/         Hooks and UI sound effects
public/        Open Graph image and audio assets
```

## Deployment

Pushes to `master` build and deploy to [braunf.com](https://braunf.com) through GitHub Actions (`.github/workflows/deploy.yml`). The domain is configured in `CNAME`.

## License

Code is released under the [MIT License](LICENSE). Personal content (text, photos, music and other media) is © Florian Braun, all rights reserved.
