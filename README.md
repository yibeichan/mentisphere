# MentiSphere

Interactive 3D brain learning app for exploring brain regions, practicing recall, and reading concise source-backed anatomy notes.

MentiSphere is currently an early learning-tool prototype. It has a working React/Three.js frontend, a FastAPI backend, shared starter region metadata, search, region details, camera/view controls, and quiz mode. The 3D anatomy is still a simplified educational proxy; real cortical surface and atlas meshes are planned.

![MentiSphere showing hippocampus search and region details](docs/images/mentisphere-preview.png)

## What Works Today

- Interactive 3D brain-region proxies with hover and selection states.
- Search by region name, anatomy term, or associated function.
- Region details with summaries, related regions, functions, and citations.
- Surface/deep/both view filters.
- Camera presets for common perspectives.
- Quiz mode for practicing region localization.
- FastAPI endpoints for region listing, lookup, and search.
- CI for frontend build/lint/typecheck and backend tests.
- Browser smoke tests for the main learning flows.

## Roadmap

- Expand the starter region set and quiz bank.
- Improve metadata validation and citation quality.
- Add real surface-brain assets.
- Add deep-structure meshes from a verified atlas source.
- Deploy a public preview.

See [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md) for the detailed plan.

## Tech Stack

Frontend:

- React 18
- TypeScript
- Vite
- Three.js / React Three Fiber
- Drei
- Zustand
- Tailwind CSS

Backend:

- FastAPI
- Pydantic
- Pytest
- Python 3.12

Data/tooling:

- Shared region metadata in [data/metadata/regions.json](data/metadata/regions.json)
- Planned neuroimaging pipeline with `nibabel`, `trimesh`, and related scientific Python tools

## Repository Layout

```text
mentisphere/
  backend/              FastAPI API and backend tests
  data/metadata/        Shared starter region metadata
  docs/                 Planning and architecture notes
  frontend/             React/Vite frontend
  scripts/              Future data-pipeline scripts
```

## Requirements

- Node.js 20 recommended
- npm
- Python 3.12

## Setup

```bash
npm install
python3.12 -m venv .venv312
.venv312/bin/python -m pip install -r backend/requirements.txt
```

## Development

Start both frontend and backend:

```bash
npm run dev
```

Local URLs:

- Frontend: http://127.0.0.1:3000
- Backend: http://127.0.0.1:8000

Useful commands:

```bash
npm run typecheck --workspace=frontend
npm run lint --workspace=frontend
npm run build --workspace=frontend
cd backend && ../.venv312/bin/python -m pytest
```

## API

Current endpoints:

```text
GET /api/health
GET /api/regions
GET /api/regions/{region_id}
GET /api/search?q=memory
```

## Data Notes

The current region metadata is a small educational starter set, not a complete anatomical atlas. Functional descriptions are deliberately conservative and should be treated as learning summaries, not medical advice.

Before bundling detailed atlas assets such as Brainnetome-derived data, verify license and redistribution requirements.

## Status

This project is not ready for clinical, diagnostic, or research use. It is a learning-oriented prototype under active development.

## Security

Please report suspected vulnerabilities privately. See [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).
