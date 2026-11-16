# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
MentiSphere is a viewer of real brain anatomy: fsLR 32k and fsaverage cortical surfaces colored by several atlases, and real subcortical meshes. A command-line tool, `menti`, resolves region names and coordinates to atlas parcels and produces links and snapshots of exact views. It can overlay the user's own result files, read from local paths. Function information comes only from cited sources.

Licensed atlas files and all user data live in a local folder outside git (`$MENTI_DATA`). See `docs/DATA.md`. The 12 proxy regions in the current frontend are replaced as the plan in `docs/PROJECT_PLAN.md` proceeds.

## Development Commands

### Initial Setup
```bash
# Install dependencies
npm install
cd backend && pip install -r requirements.txt

# Start development servers
npm run dev  # Runs both frontend (port 3000) and backend (port 8000)
```

### Frontend Commands
```bash
cd frontend
npm run dev        # Start Vite dev server on port 3000
npm run build      # Build for production
npm run typecheck  # Run TypeScript type checking
npm run lint       # Run ESLint
```

### Backend Commands
```bash
cd backend
python main.py              # Start FastAPI server on port 8000
pytest                      # Run tests
python -m pytest -v         # Run tests with verbose output
```

## Architecture

### Frontend Structure
- **React + TypeScript** with Vite
- **Three.js/React-Three-Fiber** for 3D rendering
- **Zustand** for state management
- **TailwindCSS** for styling
- Components in `frontend/src/components/`:
  - `BrainViewer/`: 3D brain mesh rendering and interaction
  - `InfoPanel/`: Display region information and citations
  - `SearchBar/`: Brain region and function search

### Backend Structure
- **FastAPI** with async support
- **Main entry**: `backend/main.py`
- API routers in `backend/api/routers/`
- Data processing in `backend/data_processing/`
- Models in `backend/api/models/`

### Data Pipeline
1. **Atlas Processing**: NIfTI → 3D meshes → glTF format
2. **Metadata**: Region descriptions, functions, citations
3. **Search Index**: Text embeddings for semantic search

## Key Implementation Priorities

### Phase 1 (MVP)
1. Basic 3D sphere placeholder for brain visualization
2. Click interaction to select regions
3. Static JSON data for brain regions
4. Basic text search functionality
5. Info panel showing region details

### Phase 2
1. License-gated source manifest and data guard
2. Real fsLR surfaces with Schaefer 2018, HCP-MMP 1.0 and DKT labels
3. Frontend on the real surface with atlas switch and view state in the URL
4. `menti resolve / at / show / serve` with a region catalog and cited aliases

### Phase 3
1. Subcortical meshes (Tian S4, Harvard-Oxford, FreeSurfer aseg)
2. `menti snap` (headless PNG of a view)
3. Overlays of local result files (parcel tables, CIFTI, GIFTI)
4. Cited function content
5. Volume atlases projected to the surface, and fsaverage

## Data Sources
- Surfaces and atlases: HCP S1200 fsLR 32k, fsaverage, HCP-MMP 1.0, Desikan-Killiany/DKT, Schaefer 2018, Harvard-Oxford, Julich-Brain, Brodmann, Tian S4
- **NeuroNames**: Standardized nomenclature
- **Neurosynth**: Function-region associations
- Every source is listed in `pipeline/sources.yaml` with its license and citation, and is built only after its terms are audited.

## Performance Targets
- Initial load: <3 seconds
- 3D interaction: 60fps
- Search response: <200ms
- Mobile memory: <100MB

## Scientific Accuracy Requirements
- All region functions must include citations
- Never generate fictional brain region data
- Use authoritative sources only (BrainInfo, Neurosynth)
- Include uncertainty indicators where appropriate

## API Endpoints (Planned)
```
GET /api/regions           # List all brain regions
GET /api/regions/{id}      # Get specific region details
GET /api/search           # Search regions by text
GET /api/models/{atlas}/manifest  # Get 3D model paths
GET /api/atlases          # List available atlases
```

## Testing Approach
- Frontend: Component tests with React Testing Library
- Backend: pytest with async support
- E2E: Playwright for critical user flows
- Visual: Three.js rendering consistency

## Current Status
✅ Basic project structure created
✅ Frontend setup with React + Three.js
✅ Backend setup with FastAPI
✅ Basic 3D viewer component (placeholder sphere)
✅ License-gated source manifest and data guard (CI)
⏳ Real surface pipeline and label arrays
⏳ `menti` CLI
⏳ Overlays, function content

---

## 📝 Project Memory Log

This section maintains a living record of important decisions, implementations, and learnings. Update after major features, architectural decisions, challenges, or work sessions.

### [2025-01-23] - Initial Project Setup

#### What Changed
- Created MentiSphere project structure with frontend/backend separation
- Set up React + Three.js frontend with basic 3D sphere placeholder
- Initialized FastAPI backend with health check endpoints
- Established component structure: BrainViewer, InfoPanel, SearchBar

#### Key Decisions
- **Chose React-Three-Fiber over vanilla Three.js**: Better React integration and declarative 3D scene management
- **Monorepo with npm workspaces**: Simplified dependency management between frontend/backend
- **Start with static JSON before database**: Faster MVP iteration, easier testing
- **Single atlas (Brainnetome) first** (superseded): Reduced complexity for initial implementation
- **Vite over Create React App**: Faster builds and better TypeScript support

#### Challenges & Solutions
- **Challenge**: Scope creep with multiple atlases and complex features
- **Solution**: Phased approach - MVP with placeholder, then real data, then advanced features
- **Challenge**: Performance requirements (60fps, <3s load)
- **Solution**: Plan for progressive enhancement, LOD system, and lazy loading from the start

#### Patterns Established
- Component structure in `frontend/src/components/[ComponentName]/`
- API routes follow RESTful conventions `/api/[resource]`
- Separation of concerns: rendering (BrainViewer), data (InfoPanel), interaction (SearchBar)

#### Next Steps
- Implement real brain mesh loading from glTF files
- Create mock JSON data for brain regions
- Add state management with Zustand
- Implement region click detection with raycasting

---

### Template for Future Updates
```markdown
### [DATE] - [TOPIC/FEATURE]

#### What Changed
- [List concrete implementations]

#### Key Decisions
- [Decision]: [Reasoning]

#### Challenges & Solutions
- **Challenge**: [Description]
- **Solution**: [How it was resolved]

#### Patterns Established/Learned
- [What worked well]
- [What to avoid]

#### Next Steps
- [Immediate priorities]
```