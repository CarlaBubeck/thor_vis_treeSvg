# THOR Visualization — Tree SVG

Interactive data visualization prototype that compares CO2 efficiency across transport scenarios, using a dynamic tree metaphor to encode values through size and color.

---

## What It Does

The application presents **passenger transport CO2 efficiency** data (measured as *Passengers per 1000 kg CO2*) across two scenarios, each containing 5 distinct cases. Users select a case from an interactive bar chart; a tree SVG responds by scaling its size and shifting its color along a brown-to-green spectrum — smaller and browner for low-efficiency cases, taller and greener for high-efficiency ones.

The visualization is designed for iframe embedding in a survey tool (PT-Survey / LimeSurvey), and communicates the selected case to its parent frame via `postMessage`.

---

## Project Structure

```
thor_vis_treeSvg/
├── src/
│   ├── index.html              # HTML shell
│   ├── index.mjs               # Core application logic
│   ├── styles.css              # Layout and visual styling
│   ├── tree.svg           # SVG tree template
│   ├── (barchart.mjs)          # Alternative bar chart module (old design / unused)
│   ├── (radialchart.mjs)       # Radial/polar chart module (old design / unused)
│   ├── bg_s1.png               # Background image for scenario 1
│   ├── bg_s2.png               # Background image for scenario 2
│   └── data/
│       ├── data_scenario_1.json
│       ├── data_scenario_2.json
│       ├── data_scenario_3.json  # (additional data / unused)
│       ├── data_scenario_4.json  # (additional data / unused)
│       └── data_scenario_5.json  # (additional data / unused)
├── package.json
├── .eslintrc.json
└── README.md
```

---

## Tech Stack

| Layer | Tool |
|---|---|
| Language | Vanilla JavaScript |
| Visualization | D3.js |
| Styling | CSS3 |
| Data | JSON files |
| Deployment | GitHub Pages (push to `main`) |

No framework or component library for minimal dependencies and keeping it simple.

---

## How It Works

### Startup

`initApp()` reads  URL parameters on load:
- `?dataset=1` or `?dataset=2` — which scenario to display
- `?selected=N` — for display of a second tree, defines which value to display (= which tree was selected in the previous round)

Both scenario datasets are fetched in parallel; the background image switches to match the active dataset.

### Layout

The page is split into two side-by-side panels on the lower right side:

- **Tree Grid**: displays the animated SVG tree
- **Bar Interaction**: displays the clickable bar chart

The rest of the dashboard is not interactive and displayed via the background image.

### Bar Chart (`drawBarChartWithPreview`)

An SVG bar chart rendered with D3, showing all 5 cases side by side. Each bar is styled with a distinct color from a pre-defined blue-purple palette (```bar_colors```). A secondary row of "traffic light" indicators (red → yellow → green, mapped to the 0–150 value range) appears beneath the bars. On load, the highest-value case is selected by default.

### Tree Visualization (`drawFinalTreeOnly`)

The SVG tree (`tree.svg`) is loaded as an inline SVG and manipulated directly:

- **Size** scales linearly with the selected value (range: ~20–220px width; max height capped at 50vh)
- **Color** transitions from brown (`#6b3c04`) to green (`#2a9c07`) as values increase
- Different SVG path groups within the tree are each mapped to their own color sub-scale (trunk, main canopy, shading layers)
- Transitions animate over 100–300ms for smooth visual feedback

### Interaction Loop

1. User clicks a bar
2. Selected case index updates
3. Tree re-renders with new size and color (animated)
4. URL `?selected=N` parameter updates (preserves state on refresh)
5. `window.parent.postMessage({ selectedCase: N })` sends selected case to iframe parent

---

## Data Format

Each scenario file contains an array of 5 objects:

```json
[
  { "case": 1, "value": 53 },
  { "case": 2, "value": 37 },
  ...
]
```

Values represent **passengers per 1000 kg CO2**. The visualization maps the full range 0–150.

---

## URLs

| URL | Description |
|---|---|
| `/src/index.html?dataset=1` | Scenario 1 |
| `/src/index.html?dataset=2` | Scenario 2 |


Deployed prototype: [carlabubeck.github.io/thor_vis_treeSvg](https://carlabubeck.github.io/thor_vis_treeSvg/src/index.html?dataset=1)

---

## Development

Dev Preview: 
- Install Live Server (VSC plugin for local development server)
- Right-click `index.html` -> "Open with Live Server"

---

## Deployment

Push to `main` branch to deploy via GitHub Pages.

[Deployed Prototype](https://carlabubeck.github.io/thor_vis_treeSvg/src/index.html?dataset=1)

---

## Embedding

The app can be used as an iframe inside another application (e.g. survey platform). To embed it and listen for selections:

```html
<iframe src="/src/index.html?dataset=1"></iframe>

<script>
  window.addEventListener('message', (e) => {
    console.log('Selected case:', e.data.choiceValue);
  });
</script>
```

---

## PT Survey setup

- Embed prototype via iFrame on a dedicated survey page (see above) [s1interaction] [s2interaction]
- Place input element on the same survey page [s1value] [s2value]
  - Hide element via custom CSS class
  - Assign recorded value from eventListener to that element (```hiddenInput.value = choice```)
- Record order of scenarios [orderCMark1] [orderCMark2]
  - Use LimeSurvey equation (```if(is_empty(orderCMark2.NAOK), "1first_", "1second_")```)

---

## Inactive Features

- **`barchart.mjs`** — an alternative bar chart implementation with integrated SVG trees; not connected to the main app
- **`radialchart.mjs`** — a polar/radial chart with hourly data breakdown; not integrated
- **Scenarios 3–5** — data files exist but are not loaded by the application yet
- **Multi-tree display** — commented-out code for earlier design showing multiple trees simultaneously

---




