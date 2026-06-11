# MentiSphere Project Plan

## Product Goal

Build an interactive learning app for human brain anatomy, centered on two linked 3D views:

- A surface brain for learning cortical lobes, gyri, and atlas parcels.
- A whole/deep brain view for learning subcortical structures and region relationships.

The app should help a learner answer four questions quickly:

1. Where is this brain region?
2. What does it roughly do?
3. What other regions is it near or commonly discussed with?
4. What source supports this claim?

The first usable version should prioritize learning flow and trustworthy data over atlas completeness.

## Current State

The repository is an early scaffold.

- Frontend: React, TypeScript, Vite, Tailwind, React Three Fiber.
- Backend: FastAPI with root and health endpoints.
- 3D viewer: placeholder sphere only.
- Search: input UI only; no results or API.
- Info panel: local empty state; not connected to viewer clicks.
- Data directories exist but are empty.
- Build cannot currently be verified until dependencies are installed.

## Product Principles

- Make the first screen the actual learning tool, not a landing page.
- Show anatomy directly and clearly; avoid purely decorative 3D.
- Keep region claims conservative. Use "associated with" unless a source supports stronger wording.
- Every educational claim about function should have a source.
- Prefer a small, correct atlas subset over broad but unreliable coverage.
- Keep interaction fast: click, search, rotate, isolate, and compare should feel immediate.

## Technical Direction

Keep React Three Fiber as the main interactive renderer because the current app already uses it and it supports custom learning UI well.

Use a data pipeline to convert neuroimaging assets into web-friendly files:

- Source atlas volumes or surfaces: NIfTI, FreeSurfer, Workbench, GIFTI, or CIFTI where appropriate.
- Processing: Python with `nibabel`, `scikit-image` marching cubes, and `trimesh`.
- Browser assets: `glb`/`gltf`, ideally Draco-compressed when meshes become large.
- Metadata: JSON first, database later.

NiiVue is worth revisiting later for raw neuroimaging-format viewing, but it should not replace the custom React Three Fiber learning surface unless the project shifts toward clinical/research image inspection.

## Data Strategy

### MVP Data

Start with a curated static set of high-value educational regions:

- Frontal lobe
- Parietal lobe
- Temporal lobe
- Occipital lobe
- Cerebellum
- Brainstem
- Thalamus
- Basal ganglia
- Hippocampus
- Amygdala
- Insula
- Corpus callosum

Each region should include:

- `id`
- `name`
- `category`
- `hemisphere` when applicable
- `summary`
- `functions`
- `nearbyRegions`
- `searchTerms`
- `citations`
- `modelRef` or `meshObjectName`

### Atlas Data

Brainnetome is a strong candidate for a later atlas layer because it provides 246 bilateral subregions and connectivity-oriented parcellation. However, the Brainnetome site/NITRC listing describes non-commercial use terms with attribution/share-alike expectations and separate commercial licensing. Before bundling Brainnetome assets in a public app, confirm the intended distribution and license constraints.

Practical sequence:

1. Educational starter regions with hand-curated metadata and simple meshes.
2. Surface cortex assets from a permissive or clearly licensed source.
3. Brainnetome or another detailed atlas as an optional advanced layer.

## Milestones

### Milestone 1: Runnable Vertical Slice

Goal: make the existing scaffold a working learning loop.

Frontend tasks:

- Install dependencies and create lockfiles.
- Fix TypeScript errors and unused variables.
- Add Zustand store for:
  - selected region
  - hovered region
  - search query
  - active view mode
  - active atlas/layer
- Add static region metadata under `frontend/src/data/regions.ts` or shared JSON.
- Connect `BrainViewer`, `SearchBar`, and `InfoPanel` through shared state.
- Replace the single placeholder sphere with distinct placeholder region meshes or labeled selectable primitives.
- Add hover highlight, selected highlight, and camera focus behavior.

Backend tasks:

- Add region endpoints backed by static JSON:
  - `GET /api/regions`
  - `GET /api/regions/{id}`
  - `GET /api/search?q=...`
- Fix root npm workspace/dev script so frontend and backend can start cleanly.

Acceptance criteria:

- `npm run dev` starts the app.
- A learner can search for "memory", click hippocampus, and see region information.
- Clicking a 3D object updates the info panel.
- Hover and selected states are visually distinct.
- Frontend typecheck/build passes.
- Backend health and region endpoints pass basic tests.

### Milestone 2: Learning UX

Goal: make the app useful for studying, not just viewing.

Tasks:

- Add view controls:
  - surface brain
  - deep structures
  - both
  - left/right/bilateral
- Add camera presets:
  - left lateral
  - right lateral
  - medial
  - superior
  - anterior
  - posterior
- Add search result keyboard navigation.
- Add region comparison panel.
- Add "related regions" navigation.
- Add basic quiz mode:
  - prompt: "Find the amygdala"
  - click target
  - immediate feedback
  - next prompt

Acceptance criteria:

- Users can complete a 10-question region-finding quiz.
- Search can find regions by name and function terms.
- The UI works on desktop and tablet-sized screens.
- No major text overlap or canvas layout breakage.

### Milestone 3: Real Surface Brain

Goal: replace placeholder cortex with anatomically meaningful surface assets.

Tasks:

- Choose a surface data source and verify license.
- Convert left/right cortical surfaces to web assets.
- Add manifest files that map mesh objects or vertex labels to region IDs.
- Implement surface parcel highlighting.
- Add cortex transparency and isolate controls.
- Add mesh loading states and errors.

Acceptance criteria:

- Left and right cortical surfaces load in the browser.
- Clicking a visible parcel selects the correct region.
- App remains interactive on a typical laptop.
- Surface and metadata IDs are validated by tests/scripts.

### Milestone 4: Deep Brain Structures

Goal: teach subcortical anatomy in context with the cortical surface.

Tasks:

- Convert selected subcortical atlas labels into meshes.
- Add deep-region layer toggles.
- Add clipping or cortex opacity controls so deep regions are inspectable.
- Add labels/tooltips that do not obscure the model.

Acceptance criteria:

- Hippocampus, amygdala, thalamus, basal ganglia, cerebellum, and brainstem are visible/selectable.
- Learners can isolate one structure or show it in context.
- Mesh sizes remain reasonable for web loading.

### Milestone 5: Scientific Metadata

Goal: make the content trustworthy and maintainable.

Tasks:

- Define citation schema.
- Add source fields to every function claim.
- Add validation script that fails when a region lacks citations.
- Add source-quality labels:
  - anatomy reference
  - review
  - meta-analysis
  - atlas documentation
- Avoid unsupported "region causes function" language.

Acceptance criteria:

- Every displayed function claim links to at least one citation.
- Metadata validation runs in CI.
- The app can display uncertainty or caveats where appropriate.

### Milestone 6: Performance And Polish

Goal: make the app feel stable enough for repeated use.

Tasks:

- Add mesh compression and lazy loading.
- Add loading skeletons for data/model fetches.
- Add Playwright tests for:
  - app loads
  - canvas is nonblank
  - search selects a region
  - quiz flow works
- Add responsive layout for mobile/tablet.
- Add analytics-free local progress tracking if desired.

Acceptance criteria:

- Initial load target: under 3 seconds on a normal development machine after assets are cached.
- 3D interaction target: visually smooth during rotate/zoom.
- Core user paths covered by automated tests.

## Suggested File Layout

```text
frontend/src/
  components/
    BrainViewer/
    Controls/
    InfoPanel/
    QuizPanel/
    SearchBar/
  data/
    citations.ts
    regions.ts
  store/
    brainStore.ts
  types/
    brain.ts

backend/
  api/
    routers/
      regions.py
      search.py
      atlases.py
    models/
      region.py

scripts/
  data_pipeline/
    convert_nifti_to_meshes.py
    convert_surface_to_glb.py
    validate_region_metadata.py

data/
  atlases/
  meshes/
  metadata/
    regions.json
```

## Immediate Next Sprint

Do these first:

1. Fix dependency/dev setup.
2. Add shared region types and Zustand store.
3. Add 12 starter regions with citations.
4. Wire click/search/info panel end to end.
5. Replace the sphere with simple selectable learning regions.
6. Add backend static region/search endpoints.
7. Add basic build/typecheck/API tests.

This produces the first complete learning loop before investing in full atlas conversion.

## Naming

Current name: **MentiSphere**

Strengths:

- Sounds like a learning product, not just a research tool.
- "Sphere" hints at 3D exploration.
- Distinct enough to be memorable.

Weaknesses:

- "Menti" may read as mental health, mentoring, or general mind content rather than neuroanatomy.
- It does not immediately say "brain atlas" or "brain regions".
- It may feel softer than the scientific/educational direction of the app.

Recommendation:

Keep **MentiSphere** as a working name for now, but consider renaming before public release if the target audience is students, researchers, or clinicians who need immediate clarity.

Better name directions:

- **NeuroSphere**: closest upgrade; clearer brain association while preserving the 3D idea.
- **Cortex Atlas**: very clear, but narrower because the app also covers deep regions.
- **BrainRegion Atlas**: plain and searchable, less brand-like.
- **NeuroVista**: broad, visual, and learning-oriented.
- **Cerebra3D**: direct 3D brain signal, slightly product-like.
- **Atlas Cortex**: polished, but cortex-biased.
- **NeuroMap 3D**: descriptive and easy to understand.

Best practical choice right now:

- Use **MentiSphere** internally during development.
- Revisit naming after Milestone 2, once the product identity is clearer.
- If choosing today, use **NeuroSphere** for a broader public learning tool or **NeuroMap 3D** for a more explicit educational tool.

Before final branding, check domain availability, package-name availability, search collisions, and trademark risk.
