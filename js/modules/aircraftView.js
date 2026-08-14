/**
 * Aircraft & Plane History Registry Module
 */
import { AIRCRAFT_MODELS, KNOWN_REGISTRATIONS, getAircraftInfo, extractAircraftCode } from '../data/aircraft.js';
import { AIRPORTS } from '../data/airports.js';

export class AircraftRegistryView {
  constructor(containerId) {
    this.containerId = containerId;
    this.flights = [];
  }

  setFlights(flights) {
    this.flights = flights;
    this.render();
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // Collect all unique aircraft types & registrations from user flights
    const typesMap = new Map();
    const regMap = new Map();

    for (const f of this.flights) {
      const code = extractAircraftCode(f.aircraftRaw) || "UNK";
      const info = getAircraftInfo(f.aircraftRaw);
      
      if (!typesMap.has(code)) {
        typesMap.set(code, {
          code,
          info,
          flightCount: 0,
          totalDistanceKm: 0,
          totalDistanceMiles: 0,
          airlines: new Set(),
          flights: []
        });
      }
      const tEntry = typesMap.get(code);
      tEntry.flightCount++;
      tEntry.totalDistanceKm += f.distanceKm || 0;
      tEntry.totalDistanceMiles += f.distanceMiles || 0;
      if (f.airlineRaw) tEntry.airlines.add(f.airlineCode || f.airlineRaw);
      tEntry.flights.push(f);

      // Tail registration tracking
      if (f.registration) {
        const reg = f.registration.trim().toUpperCase();
        if (!regMap.has(reg)) {
          const known = KNOWN_REGISTRATIONS[reg] || {
            model: f.aircraftRaw,
            airline: f.airlineRaw,
            ageYears: "N/A",
            config: "Standard Config",
            msn: "N/A",
            deliveryDate: "Unknown"
          };
          regMap.set(reg, {
            registration: reg,
            meta: known,
            flightCount: 0,
            totalDistanceKm: 0,
            totalDistanceMiles: 0,
            flights: []
          });
        }
        const rEntry = regMap.get(reg);
        rEntry.flightCount++;
        rEntry.totalDistanceKm += f.distanceKm || 0;
        rEntry.totalDistanceMiles += f.distanceMiles || 0;
        rEntry.flights.push(f);
      }
    }

    const sortedTypes = Array.from(typesMap.values()).sort((a, b) => b.flightCount - a.count);
    const sortedRegs = Array.from(regMap.values()).sort((a, b) => b.flightCount - a.count);

    container.innerHTML = `
      <div class="aircraft-view-wrapper">
        <div class="section-intro">
          <div>
            <h2 class="section-title">Aircraft Registry & Fleet History</h2>
            <p class="section-sub">Detailed engineering specs, fleet breakdown, and individual airframe registration tracking.</p>
          </div>
          <div class="fleet-kpis">
            <div class="fleet-kpi-chip">
              <span class="val">${sortedTypes.length}</span>
              <span class="lbl">Aircraft Models</span>
            </div>
            <div class="fleet-kpi-chip">
              <span class="val">${sortedRegs.length}</span>
              <span class="lbl">Logged Tail Numbers</span>
            </div>
          </div>
        </div>

        <!-- Section: Individual Plane Registrations Flown -->
        <div class="registry-group">
          <div class="group-header">
            <h3>🛩️ Specific Airframes & Registrations Logged (${sortedRegs.length})</h3>
            <p>Individual aircraft tails recorded across your flight log with history & age specifications.</p>
          </div>
          <div class="registrations-grid">
            ${sortedRegs.map(r => `
              <div class="reg-card" onclick="window.app.showRegistrationDetail('${r.registration}')">
                <div class="reg-card-header">
                  <span class="reg-tail-badge">${r.registration}</span>
                  <span class="reg-count-tag">${r.flightCount} Flight${r.flightCount > 1 ? 's' : ''}</span>
                </div>
                <div class="reg-aircraft-name">${r.meta.model}</div>
                <div class="reg-airline-name">${r.meta.airline}</div>
                <div class="reg-meta-row">
                  <div class="meta-item">
                    <span class="m-lbl">Age</span>
                    <span class="m-val">${r.meta.ageYears !== "N/A" ? `${r.meta.ageYears} yrs` : "—"}</span>
                  </div>
                  <div class="meta-item">
                    <span class="m-lbl">MSN</span>
                    <span class="m-val">${r.meta.msn || "—"}</span>
                  </div>
                  <div class="meta-item">
                    <span class="m-lbl">Total Dist</span>
                    <span class="m-val">${r.totalDistanceKm.toLocaleString()} km</span>
                  </div>
                </div>
                <div class="reg-routes-preview">
                  ${r.flights.map(f => `<span class="route-pill">${f.fromCode}→${f.toCode}</span>`).slice(0, 3).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Section: Aircraft Models Breakdown -->
        <div class="registry-group mt-6">
          <div class="group-header">
            <h3>✈️ Aircraft Models & Types Flown (${sortedTypes.length})</h3>
            <p>Comprehensive specifications, cabin configurations, and flight metrics for each model.</p>
          </div>
          <div class="models-grid">
            ${sortedTypes.map(t => `
              <div class="model-card">
                <div class="model-card-top">
                  <div class="model-category-tag">${t.info.category || "Commercial Jet"}</div>
                  <span class="model-count-tag">${t.flightCount} Flights (${((t.flightCount / this.flights.length) * 100).toFixed(1)}%)</span>
                </div>
                <h4 class="model-title">${t.info.name}</h4>
                <div class="model-code-chip">${t.code}</div>
                
                <div class="model-specs-grid">
                  <div class="spec-cell">
                    <span class="spec-k">Manufacturer</span>
                    <span class="spec-v">${t.info.manufacturer}</span>
                  </div>
                  <div class="spec-cell">
                    <span class="spec-k">Engines</span>
                    <span class="spec-v">${t.info.engines}</span>
                  </div>
                  <div class="spec-cell">
                    <span class="spec-k">Max Range</span>
                    <span class="spec-v">${t.info.rangeKm ? `${t.info.rangeKm.toLocaleString()} km` : "N/A"}</span>
                  </div>
                  <div class="spec-cell">
                    <span class="spec-k">Typical Seats</span>
                    <span class="spec-v">${t.info.typicalSeats || "N/A"}</span>
                  </div>
                </div>

                <div class="model-airlines-used">
                  <span class="used-lbl">Airlines:</span>
                  <span class="used-val">${Array.from(t.airlines).join(', ') || "N/A"}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
}
