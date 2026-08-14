# ✈️ AirplaneMode — Personal Flight Intelligence & Route Analytics

**AirplaneMode** is an interactive, dark/light luxury flight tracking and route intelligence web application. Designed for frequent flyers, aviation enthusiasts, and travelers to visualize great-circle routes, analyze fleet statistics, and import/export `myflightradar24` logbooks.

![AirplaneMode Banner](https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 Key Features

- **🌐 Interactive Global Route Map**: Great circle geodesic curved flight arcs with glow thickness dynamically scaled by flight frequency, pulse markers on top airport hubs, custom tooltips, and real-time carrier color coding.
- **📊 Deep Aviation Analytics**:
  - **KPIs**: Total distance (km & miles), total hours flown, Earth circumferences, lunar distance percentage.
  - **Top Airlines**: Real-time progress bars with official airline branding colors.
  - **Top Route Pairs**: Consolidated bidirectional route statistics (e.g. `DFW ⇄ LHR`, `BOM ⇄ LHR`).
  - **Top Visited Airports**: Ranked departures and arrivals with instant pan-to-map controls.
  - **Fleet Breakdown**: Widebody vs Narrowbody vs Regional Jets distribution + most flown airframe models.
  - **Cabin & Seat Preferences**: Economy, Business, First, Premium Economy; Window vs Aisle distributions.
  - **Yearly & Monthly Timeline**: Multi-year travel trends from 2020 through 2026 with filter integration.
- **✈️ Intelligent Flight Number Autofill Engine**: Type any standard flight number (e.g., `AA50`, `BA139`, `6E2113`, `VS354`, `FR2537`, `EY019`, `DL1610`) to automatically populate Origin, Destination, Departure/Arrival times, Airline, Aircraft model, and Great Circle distance. Also recalls routes from your past flight logs!
- **🛩️ Plane & Fleet History Registry**: Look up individual tail registrations (e.g., `N722AN`, `VT-TQN`, `G-LCAA`, `N845MD`, `G-YMMJ`) to view serial numbers (MSN), estimated age, cabin layouts, and your flight history on that exact airframe.
- **📥 Universal myflightradar24 CSV Importer/Exporter**: Drag-and-drop CSV import with overwrite or merge modes, one-click CSV export, and full JSON backups.
- **☀️ Daylight / Cockpit Obsidian Themes**: Dynamic map basemap switching (CartoDB Dark Matter ⇄ CartoDB Positron Daylight) with high-contrast badge rendering.
- **🔒 100% Privacy & Local-First**: Zero backend tracking. All flights and memories stay securely in your browser (`localStorage`).

---

## 🚀 Instant Deployment (Vercel / GitHub Pages)

### Deploy to Vercel in 1 Click:
1. Create a new repository on GitHub: `airplane-mode`
2. Push or upload the project files (`index.html`, `styles/`, `js/`, `vercel.json`).
3. Import the repository into [Vercel](https://vercel.com/new) and click **Deploy**.
4. Vercel will instantly generate a live URL (e.g. `https://airplane-mode.vercel.app`).

---

## 🛠️ Local Development

To run locally without any dependencies or build steps:
```bash
python -m http.server 8080
```
Open [http://localhost:8080](http://localhost:8080) in your browser.
