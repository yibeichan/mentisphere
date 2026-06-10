# MentiSphere - Interactive 3D Brain Learning

An interactive web application for learning brain anatomy through 3D visualization, region search, and scientifically cited information.

> Current status: early scaffold. The app has a React/Three.js frontend and FastAPI backend, but the brain model, region data, search, and learning workflows are still planned/in progress. See the [project plan](docs/PROJECT_PLAN.md) for the roadmap.

## Vision

- **Interactive 3D Brain Model**: Explore cortical surface and deep brain structures.
- **Click-to-Learn**: Click a region to see location, function, related regions, and sources.
- **Surface Brain Mode**: Learn lobes, gyri, and atlas parcels from lateral/medial views.
- **Deep Region Mode**: Inspect hippocampus, amygdala, thalamus, basal ganglia, cerebellum, and brainstem.
- **Search And Quiz**: Find regions by anatomy or function, then practice recall.
- **Scientific Citations**: Tie educational claims to source references.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.12
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mentisphere.git
cd mentisphere

# Install dependencies
npm install
python3.12 -m venv .venv312
.venv312/bin/python -m pip install -r backend/requirements.txt

# Start development servers
npm run dev
```

Frontend will be available at http://localhost:3000
Backend API at http://localhost:8000

## 🏗️ Tech Stack

### Frontend
- React 18 with TypeScript
- Three.js / React-Three-Fiber for 3D graphics
- Zustand for state management
- TailwindCSS for styling
- Vite for bundling

### Backend
- FastAPI (Python)
- PostgreSQL (coming soon)
- Redis for caching (coming soon)
- Nibabel for neuroimaging data processing

## 📁 Project Structure

```
mentisphere/
├── frontend/          # React application
├── backend/           # FastAPI server
├── data/             # Brain atlas data and meshes
└── scripts/          # Data processing utilities
```

## 🗺️ Plan

The detailed build plan is in [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md). The immediate sprint is:

1. Fix dependency/dev setup.
2. Add shared region types and Zustand app state.
3. Add a small curated starter region dataset.
4. Connect 3D clicks, search, and the info panel end to end.
5. Add static FastAPI region/search endpoints.
6. Replace the placeholder sphere with simple selectable learning regions.
7. Add typecheck/build/API tests.

## 🎯 Roadmap

### Phase 1 (Current)
- [x] Basic 3D visualization
- [x] Project structure
- [ ] Runnable vertical slice
- [ ] Shared selection/search state
- [ ] Static starter region data
- [ ] Region selection updates info panel

### Phase 2
- [ ] Learning UX and quiz mode
- [ ] Search functionality
- [ ] Citation system
- [ ] Real surface brain assets

### Phase 3
- [ ] Deep brain region meshes
- [ ] Real Brainnetome or comparable atlas data
- [ ] Multiple atlas support
- [ ] Advanced visualizations
- [ ] Performance optimizations
- [ ] Mobile/tablet support

## 📚 Data Sources

- **Brainnetome Atlas**: High-resolution brain parcellation
- **NeuroNames**: Standardized neuroanatomical nomenclature
- **Neurosynth**: Meta-analyses of brain function

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Brainnetome Center, Chinese Academy of Sciences
- BrainInfo/NeuroNames project
- Neurosynth team
