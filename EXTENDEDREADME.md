# THOR Visualization — Tree SVG

An interactive data visualization prototype that compares CO2 efficiency across transport scenarios, using a dynamic tree metaphor to encode value through size and color.

---

## What It Does

The application presents **passenger transport CO2 efficiency** data (measured as *Passengers per 1000 kg CO2*) across two scenarios, each containing 5 distinct cases. Users select a case from an interactive bar chart; a tree SVG responds by scaling its size and shifting its color along a brown-to-green spectrum — smaller and browner for low-efficiency cases, taller and greener for high-efficiency ones.

The visualization is designed for iframe embedding (e.g. in a larger dashboard or presentation), and communicates the selected case to its parent frame via `postMessage`.

---

## Project Structure

```
thor_vis_treeSvg/
├── src/
│   ├── index.html              # HTML shell
│   ├── index.mjs               # Core application logic
│   ├── styles.css              # Layout and visual styling
│   ├── newtreev2.svg           # SVG tree template
│   ├── barchart.mjs            # Alternative bar chart module (unused)
│   ├── radialchart.mjs         # Radial/polar chart module (unused)
│   ├── bg_s1.png               # Background image for scenario 1
│   ├── bg_s2.png               # Background image for scenario 2
│   ├── bg02.png                # Additional background image
│   └── data/
│       ├── data_scenario_1.json
│       ├── data_scenario_2.json
│       ├── data_scenario_3.json  # Available, not yet loaded
│       ├── data_scenario_4.json  # Available, not yet loaded
│       └── data_scenario_5.json  # Available, not yet loaded
├── package.json
├── .eslintrc.json
└── README.md
```

---

## Tech Stack

| Layer | Tool |
|---|---|
| Language | Vanilla JavaScript (ES Modules) |
| Visualization | D3.js 7.9.0 |
| Bundler | Parcel 2 |
| Styling | CSS3 (Flexbox, transitions) |
| Data | JSON |
| Linting | ESLint + Babel parser |
| Deployment | GitHub Pages (push to `main`) |

No framework. No component library. Minimal dependencies.

---

## How It Works

### Startup

`initApp()` reads two URL parameters on load:

- `?dataset=1` or `?dataset=2` — which scenario to display
- `?selected=N` — pre-selects a case (for bookmarking or iframe handoff)

Both scenario datasets are fetched in parallel; the background image switches to match the active dataset.

### Layout

The page is split into two side-by-side panels:

- **Left — Tree Grid**: displays the animated SVG tree
- **Right — Bar Interaction**: displays the clickable bar chart

### Bar Chart (`drawBarChartWithPreview`)

An SVG bar chart rendered with D3, showing all 5 cases side by side. Each bar is styled with a distinct color from a blue-purple palette. A secondary row of "traffic light" indicators (red → yellow → green, mapped to the 0–150 value range) appears beneath the bars. On load, the highest-value case is selected by default.

### Tree Visualization (`drawFinalTreeOnly`)

The SVG tree (`newtreev2.svg`) is loaded as an inline SVG and manipulated directly:

- **Size** scales linearly with the selected value (range: ~20–220px width; max height capped at 50vh)
- **Color** transitions from brown (`#6b3c04`) to green (`#2a9c07`) as values increase
- Different SVG path groups within the tree are each mapped to their own color sub-scale (trunk, main canopy, shading layers)
- Transitions animate over 100–300ms for smooth visual feedback

### Interaction Loop

1. User clicks a bar
2. Selected case index updates
3. Tree re-renders with new size and color (animated)
4. URL `?selected=N` parameter updates (preserves state on refresh)
5. `window.parent.postMessage({ selectedCase: N })` fires for iframe parent communication

---

## Data Format

Each scenario file contains an array of 5 objects:

```json
[
  { "case": 1, "value": 53 },
  { "case": 2, "value": 37 },
  { "case": 3, "value": 78 },
  { "case": 4, "value": 134 },
  { "case": 5, "value": 97 }
]
```

Values represent **passengers per 1000 kg CO2**. The visualization maps the full range 0–150.

---

## URLs

| URL | Description |
|---|---|
| `/src/index.html` | Default view (scenario 1) |
| `/src/index.html?dataset=1` | Scenario 1 explicitly |
| `/src/index.html?dataset=2` | Scenario 2 |
| `/src/index.html?dataset=1&selected=3` | Scenario 1, case 3 pre-selected |

Deployed prototype: [carlabubeck.github.io/thor_vis_treeSvg](https://carlabubeck.github.io/thor_vis_treeSvg/src/index.html)

---

## Development

```bash
yarn install
yarn start       # dev server with hot reload (Parcel)
yarn build       # production bundle
```

Push to `main` to deploy via GitHub Pages.

---

## Inactive / In-Progress Features

- **`barchart.mjs`** — an alternative bar chart implementation with integrated SVG trees; not connected to the main app
- **`radialchart.mjs`** — a polar/radial chart with hourly data breakdown; not integrated
- **Scenarios 3–5** — data files exist but are not loaded by the application yet
- **Multi-tree display** — commented-out code suggests an earlier design showing multiple trees simultaneously

---

## Embedding

The app is iframe-ready. To embed it and listen for selections:

```html
<iframe src="/src/index.html?dataset=1" id="vis"></iframe>

<script>
  window.addEventListener('message', (e) => {
    console.log('Selected case:', e.data.selectedCase);
  });
</script>
```

To drive a pre-selection from the parent:

```
/src/index.html?dataset=1&selected=3
```
