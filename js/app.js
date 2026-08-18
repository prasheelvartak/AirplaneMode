import { store } from './modules/storage.js';
import { FlightMap } from './modules/map.js';
import { calculateFlightStats } from './modules/stats.js';
import { FlightLogManager } from './modules/flights.js';
import { AircraftRegistryView } from './modules/aircraftView.js';
import { SmartIngestEngine } from './modules/smartIngest.js';
import { parseFlightradarCSV, exportToFlightradarCSV, SEAT_TYPES, FLIGHT_CLASSES, FLIGHT_REASONS } from './modules/parser.js';
import { AIRPORTS, getAirport, calculateDistance, extractAirportCode } from './data/airports.js';
import { AIRLINES, AIRCRAFT_MODELS, KNOWN_REGISTRATIONS, getAircraftInfo, extractAircraftCode, extractAirlineCode } from './data/aircraft.js';
import { lookupFlightSchedule } from './data/flightSchedules.js';

class SkyLogApp {
  constructor() {
    this.store = store;
    this.currentTab = 'map';
    this.map = new FlightMap('flight-map-view');
    this.flightManager = new FlightLogManager('flights-table-body', 'flights-pagination', this.store);
    this.aircraftView = new AircraftRegistryView('aircraft-registry-container');
    this.smartIngest = new SmartIngestEngine(this.store, this);
    
    this.editingFlightId = null;
    this.deferredPwaPrompt = null;
    this.activeSmartFile = null;
    this.activeSmartModalFile = null;
    this.setupGlobalHandlers();
  }

  init() {
    const settings = this.store.getSettings();
    const currentTheme = settings.theme || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    this.updateThemeButtonIcon(currentTheme);

    // Initialize map with current theme
    this.map.init(currentTheme);
    
    // Subscribe to store updates
    this.store.subscribe((flights, settings) => {
      this.onDataUpdated(flights, settings);
    });

    // Initial render
    this.onDataUpdated(this.store.getFlights(), settings);

    // Setup DOM Event Listeners
    this.attachEventListeners();
    this.setupAirportAutocomplete('flight-from-input', 'flight-from-suggestions');
    this.setupAirportAutocomplete('flight-to-input', 'flight-to-suggestions');
    this.setupFlightNumberAutofill();
    this.setupSmartIngestDropzones();

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(reg => {
          console.log('AirplaneMode PWA ServiceWorker registered');
        }).catch(err => {
          console.warn('PWA SW registration note:', err);
        });
      });
    }

    // PWA Install prompt listener
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this.deferredPwaPrompt = e;
      const nativeTrigger = document.getElementById('pwa-native-install-trigger');
      if (nativeTrigger) nativeTrigger.style.display = 'block';
    });
  }

  setupGlobalHandlers() {
    window.app = this;
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    this.updateThemeButtonIcon(newTheme);
    this.store.updateSettings({ theme: newTheme });
    this.map.setTheme(newTheme);
  }

  updateThemeButtonIcon(theme) {
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
      btn.innerHTML = theme === 'light' ? '🌙' : '☀️';
      btn.setAttribute('title', theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode');
    }
  }

  setAirportMetricMode(mode) {
    this.map.setAirportMetricMode(mode);
    document.querySelectorAll('.metric-mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
  }

  setRouteColorMode(mode) {
    this.map.setRouteColorMode(mode);
    document.querySelectorAll('.route-color-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
  }

  setMapBasemap(basemap) {
    this.map.setBasemap(basemap);
    document.querySelectorAll('.basemap-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.basemap === basemap);
    });
  }

  toggleMobileMapControls(forceState) {
    const overlay = document.getElementById('map-control-overlay');
    if (!overlay) return;
    if (typeof forceState === 'boolean') {
      overlay.classList.toggle('expanded', forceState);
    } else {
      overlay.classList.toggle('expanded');
    }
  }

  populateMapAirlineFilter(flights) {
    const select = document.getElementById('map-airline-select');
    if (!select) return;

    const currentVal = select.value;
    const airlineCounts = new Map();

    for (const f of flights) {
      const code = f.airlineCode || extractAirlineCode(f.airlineRaw) || 'Other';
      const name = f.airlineRaw ? f.airlineRaw.split('(')[0].trim() : code;
      const key = code !== 'Other' ? code : name;
      
      if (!airlineCounts.has(key)) {
        airlineCounts.set(key, { code: key, name: name, count: 0 });
      }
      airlineCounts.get(key).count++;
    }

    const sortedAirlines = Array.from(airlineCounts.values()).sort((a, b) => b.count - a.count);

    let html = `<option value="all">✈️ All Airlines (${flights.length} Flights)</option>`;
    for (const a of sortedAirlines) {
      html += `<option value="${a.code}">${a.name} (${a.count} flights)</option>`;
    }

    select.innerHTML = html;
    if (currentVal && Array.from(select.options).some(o => o.value === currentVal)) {
      select.value = currentVal;
    }
  }

  onMapAirlineFilterChanged(airlineVal) {
    this.map.setFilter({ airline: airlineVal });

    const clearBtn = document.getElementById('map-airline-clear-btn');
    const pillEl = document.getElementById('map-active-routes-pill');
    const mobilePillEl = document.getElementById('map-mobile-pill');
    const allFlights = this.store.getFlights();

    if (airlineVal === 'all') {
      if (clearBtn) clearBtn.style.display = 'none';
      if (pillEl) pillEl.textContent = `${allFlights.length} Flights`;
      if (mobilePillEl) mobilePillEl.textContent = `${allFlights.length} Flights`;
      this.map.fitAll();
    } else {
      if (clearBtn) clearBtn.style.display = 'inline';
      const count = allFlights.filter(f => (f.airlineCode === airlineVal || (f.airlineRaw && f.airlineRaw.includes(airlineVal)))).length;
      if (pillEl) pillEl.textContent = `${count} Flights`;
      if (mobilePillEl) mobilePillEl.textContent = `${count} Flights`;
      
      // Auto center map to filtered airline routes
      const activeAirports = [];
      for (const f of allFlights) {
        if (f.airlineCode === airlineVal || (f.airlineRaw && f.airlineRaw.includes(airlineVal))) {
          if (f.fromAirport && f.fromAirport.lat) activeAirports.push([f.fromAirport.lat, f.fromAirport.lon]);
          if (f.toAirport && f.toAirport.lat) activeAirports.push([f.toAirport.lat, f.toAirport.lon]);
        }
      }
      if (activeAirports.length > 0 && this.map.map) {
        this.map.map.fitBounds(L.latLngBounds(activeAirports).pad(0.15), { animate: true, duration: 0.8 });
      }
    }
  }

  clearMapAirlineFilter() {
    const select = document.getElementById('map-airline-select');
    if (select) select.value = 'all';
    this.onMapAirlineFilterChanged('all');
  }

  onDataUpdated(flights, settings) {
    // 1. Update Map & Airline Filter
    this.map.setFlights(flights);
    this.populateMapAirlineFilter(flights);

    // 2. Update Flight Log Manager
    this.flightManager.setFlights(flights);

    // 3. Update Aircraft Registry View
    this.aircraftView.setFlights(flights);

    // 4. Update Analytics View
    this.renderAnalytics(flights);

    // 5. Update Header Stats
    this.updateHeaderSummary(flights);
  }

  updateHeaderSummary(flights) {
    const stats = calculateFlightStats(flights);
    const flightCountEl = document.getElementById('stat-header-flights');
    const distEl = document.getElementById('stat-header-dist');
    const airtimeEl = document.getElementById('stat-header-airtime');
    const airportsEl = document.getElementById('stat-header-airports');

    if (flightCountEl) flightCountEl.textContent = stats.totalFlights.toLocaleString();
    if (distEl) distEl.textContent = `${stats.totalDistanceKm.toLocaleString()} km`;
    if (airtimeEl) airtimeEl.textContent = stats.totalAirTimeFormatted.split('(')[0].trim();
    if (airportsEl) airportsEl.textContent = stats.uniqueAirportsCount;
  }

  switchTab(tabId) {
    this.currentTab = tabId;
    
    // Update tab navigation buttons
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Update tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `tab-${tabId}`);
    });

    // Specific tab triggers
    if (tabId === 'map') {
      setTimeout(() => {
        if (this.map.map) {
          this.map.map.invalidateSize();
          this.map.render();
        }
      }, 100);
    }
  }

  renderAnalytics(flights) {
    const stats = calculateFlightStats(flights);

    // KPI Highlights
    const totalDistKm = document.getElementById('kpi-total-dist');
    const totalDistMi = document.getElementById('kpi-total-dist-mi');
    const totalFlights = document.getElementById('kpi-total-flights');
    const totalHours = document.getElementById('kpi-total-hours');
    const earthCirc = document.getElementById('kpi-earth-circ');
    const moonDist = document.getElementById('kpi-moon-dist');
    const uniqueCarriers = document.getElementById('kpi-unique-carriers');
    const uniqueCountries = document.getElementById('kpi-unique-countries');

    if (totalDistKm) totalDistKm.textContent = `${stats.totalDistanceKm.toLocaleString()} km`;
    if (totalDistMi) totalDistMi.textContent = `${stats.totalDistanceMiles.toLocaleString()} miles (${stats.totalFlights} flights)`;
    if (totalFlights) totalFlights.textContent = stats.totalFlights;
    if (totalHours) totalHours.textContent = stats.totalAirTimeFormatted;
    if (earthCirc) earthCirc.textContent = `${stats.earthCircumferences}x`;
    if (moonDist) moonDist.textContent = `${stats.moonDistancePercent}%`;
    if (uniqueCarriers) uniqueCarriers.textContent = stats.uniqueAirlinesCount;
    if (uniqueCountries) uniqueCountries.textContent = stats.uniqueCountriesCount;

    // Top Airlines Breakdown
    const airlinesContainer = document.getElementById('analytics-top-airlines');
    if (airlinesContainer) {
      if (stats.topAirlines.length === 0) {
        airlinesContainer.innerHTML = '<div class="empty-hint">No flight data available</div>';
      } else {
        const maxCount = stats.topAirlines[0].count || 1;
        airlinesContainer.innerHTML = stats.topAirlines.slice(0, 7).map((al, idx) => {
          const pct = ((al.count / stats.totalFlights) * 100).toFixed(1);
          const barWidth = Math.max((al.count / maxCount) * 100, 4);
          return `
            <div class="stat-bar-row">
              <div class="bar-header">
                <div class="carrier-name-cell">
                  <span class="rank-num">#${idx + 1}</span>
                  <span class="carrier-code-pill" style="background-color: ${al.color}22; color: ${al.color}; border-color: ${al.color}44">${al.code}</span>
                  <span class="carrier-title">${al.name}</span>
                </div>
                <div class="bar-values">
                  <strong>${al.count} flights</strong>
                  <span class="val-pct">(${pct}%)</span>
                </div>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width: ${barWidth}%; background-color: ${al.color}"></div>
              </div>
              <div class="bar-sub">${al.distanceKm.toLocaleString()} km flown</div>
            </div>
          `;
        }).join('');
      }
    }

    // Top Route Pairs
    const pairsContainer = document.getElementById('analytics-top-pairs');
    if (pairsContainer) {
      if (stats.topPairs.length === 0) {
        pairsContainer.innerHTML = '<div class="empty-hint">No route pairs recorded</div>';
      } else {
        pairsContainer.innerHTML = stats.topPairs.slice(0, 6).map((p, idx) => {
          return `
            <div class="pair-stat-card" onclick="window.app.filterByPair('${p.from}', '${p.to}')">
              <div class="pair-header">
                <span class="rank-badge">#${idx + 1}</span>
                <span class="pair-title">${p.fromAirport?.city || p.from} ⇄ ${p.toAirport?.city || p.to}</span>
                <span class="pair-count-badge">${p.count} flights</span>
              </div>
              <div class="pair-codes">
                <span class="code-box">${p.from}</span>
                <span class="arrow-bidir">⇄</span>
                <span class="code-box">${p.to}</span>
              </div>
              <div class="pair-meta">
                <span>Dist: ${p.distanceKm.toLocaleString()} km</span>
                <span>${p.outbound} out / ${p.inbound} in</span>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Top Visited Airports
    const airportsContainer = document.getElementById('analytics-top-airports');
    if (airportsContainer) {
      if (stats.topAirports.length === 0) {
        airportsContainer.innerHTML = '<div class="empty-hint">No airport data</div>';
      } else {
        airportsContainer.innerHTML = stats.topAirports.slice(0, 8).map((ap, idx) => {
          return `
            <div class="airport-stat-row" onclick="window.app.zoomMapTo('${ap.code}')">
              <div class="ap-rank">#${idx + 1}</div>
              <div class="ap-code-box">${ap.code}</div>
              <div class="ap-info">
                <strong>${ap.city}</strong>
                <small>${ap.name} • ${ap.country}</small>
              </div>
              <div class="ap-stats-right">
                <span class="total-ops">${ap.total}</span>
                <small class="ops-breakdown">(${ap.departures} dep, ${ap.arrivals} arr)</small>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Aircraft Types & Categories
    const categoriesContainer = document.getElementById('analytics-aircraft-categories');
    if (categoriesContainer) {
      const cats = stats.aircraftCategories;
      const total = stats.totalFlights || 1;
      categoriesContainer.innerHTML = `
        <div class="category-bars-grid">
          <div class="cat-card">
            <span class="cat-name">Widebody (Twin-Aisle / Heavy)</span>
            <span class="cat-val">${cats["Widebody"]} (${((cats["Widebody"] / total) * 100).toFixed(1)}%)</span>
            <div class="cat-bar"><div class="cat-fill bg-indigo" style="width: ${(cats["Widebody"] / total) * 100}%"></div></div>
          </div>
          <div class="cat-card">
            <span class="cat-name">Narrowbody (Single-Aisle)</span>
            <span class="cat-val">${cats["Narrowbody"]} (${((cats["Narrowbody"] / total) * 100).toFixed(1)}%)</span>
            <div class="cat-bar"><div class="cat-fill bg-cyan" style="width: ${(cats["Narrowbody"] / total) * 100}%"></div></div>
          </div>
          <div class="cat-card">
            <span class="cat-name">Regional Jets (CRJ / Embraer)</span>
            <span class="cat-val">${cats["Regional Jet"]} (${((cats["Regional Jet"] / total) * 100).toFixed(1)}%)</span>
            <div class="cat-bar"><div class="cat-fill bg-emerald" style="width: ${(cats["Regional Jet"] / total) * 100}%"></div></div>
          </div>
        </div>
      `;
    }

    // Top Airframes
    const topModelsContainer = document.getElementById('analytics-top-models');
    if (topModelsContainer) {
      topModelsContainer.innerHTML = stats.topAircraft.slice(0, 6).map((m, idx) => `
        <div class="model-stat-pill">
          <span class="m-rank">#${idx + 1}</span>
          <span class="m-name">${m.name}</span>
          <span class="m-count">${m.count}x</span>
        </div>
      `).join('');
    }

    // Cabin Class & Seat Preferences
    const classesContainer = document.getElementById('analytics-cabin-classes');
    if (classesContainer) {
      const total = stats.totalFlights || 1;
      const classes = stats.flightClasses;
      classesContainer.innerHTML = `
        <div class="donut-legend-grid">
          <div class="legend-item"><span class="dot bg-eco"></span> Economy: <strong>${classes[1]}</strong> (${((classes[1]/total)*100).toFixed(0)}%)</div>
          <div class="legend-item"><span class="dot bg-biz"></span> Business Class: <strong>${classes[3]}</strong> (${((classes[3]/total)*100).toFixed(0)}%)</div>
          <div class="legend-item"><span class="dot bg-first"></span> First Class: <strong>${classes[4]}</strong> (${((classes[4]/total)*100).toFixed(0)}%)</div>
          <div class="legend-item"><span class="dot bg-prem"></span> Premium Economy: <strong>${classes[2]}</strong> (${((classes[2]/total)*100).toFixed(0)}%)</div>
        </div>
      `;
    }

    const seatsContainer = document.getElementById('analytics-seat-preferences');
    if (seatsContainer) {
      const total = stats.totalFlights || 1;
      const seats = stats.seatTypes;
      seatsContainer.innerHTML = `
        <div class="donut-legend-grid">
          <div class="legend-item"><span class="dot bg-window"></span> Window: <strong>${seats[1]}</strong> (${((seats[1]/total)*100).toFixed(0)}%)</div>
          <div class="legend-item"><span class="dot bg-aisle"></span> Aisle: <strong>${seats[3]}</strong> (${((seats[3]/total)*100).toFixed(0)}%)</div>
          <div class="legend-item"><span class="dot bg-middle"></span> Middle: <strong>${seats[2]}</strong> (${((seats[2]/total)*100).toFixed(0)}%)</div>
          <div class="legend-item"><span class="dot bg-unspecified"></span> Unspecified: <strong>${seats[0]}</strong></div>
        </div>
      `;
    }

    // Yearly Timeline
    const timelineContainer = document.getElementById('analytics-yearly-timeline');
    if (timelineContainer) {
      if (stats.yearlyTimeline.length === 0) {
        timelineContainer.innerHTML = '<div class="empty-hint">No yearly history available</div>';
      } else {
        const maxYearCount = Math.max(...stats.yearlyTimeline.map(y => y.count)) || 1;
        timelineContainer.innerHTML = stats.yearlyTimeline.map(y => {
          const hPct = Math.max((y.count / maxYearCount) * 100, 8);
          return `
            <div class="timeline-bar-col" onclick="window.app.filterByYear('${y.year}')">
              <div class="t-val">${y.count}</div>
              <div class="t-bar-wrap">
                <div class="t-bar-fill" style="height: ${hPct}%"></div>
              </div>
              <div class="t-year">${y.year}</div>
              <div class="t-dist">${Math.round(y.distanceKm / 1000)}k km</div>
            </div>
          `;
        }).join('');
      }
    }

    // Flight Extremes
    const extremesContainer = document.getElementById('analytics-flight-extremes');
    if (extremesContainer) {
      extremesContainer.innerHTML = `
        <div class="extremes-grid">
          <div class="extreme-card">
            <span class="ex-lbl">Longest Flight (Distance)</span>
            <strong>${stats.longestFlightDist ? `${stats.longestFlightDist.fromCode} ➔ ${stats.longestFlightDist.toCode}` : '—'}</strong>
            <span class="ex-val">${stats.longestFlightDist ? `${stats.longestFlightDist.distanceKm.toLocaleString()} km (${stats.longestFlightDist.flightNumber})` : '—'}</span>
            <small>${stats.longestFlightDist?.note || ''}</small>
          </div>
          <div class="extreme-card">
            <span class="ex-lbl">Shortest Flight (Distance)</span>
            <strong>${stats.shortestFlightDist ? `${stats.shortestFlightDist.fromCode} ➔ ${stats.shortestFlightDist.toCode}` : '—'}</strong>
            <span class="ex-val">${stats.shortestFlightDist ? `${stats.shortestFlightDist.distanceKm.toLocaleString()} km (${stats.shortestFlightDist.flightNumber})` : '—'}</span>
          </div>
          <div class="extreme-card">
            <span class="ex-lbl">Longest Air Duration</span>
            <strong>${stats.longestFlightDur ? `${stats.longestFlightDur.fromCode} ➔ ${stats.longestFlightDur.toCode}` : '—'}</strong>
            <span class="ex-val">${stats.longestFlightDur ? `${stats.longestFlightDur.durationRaw} (${stats.longestFlightDur.flightNumber})` : '—'}</span>
          </div>
        </div>
      `;
    }
  }

  // --- Modal & Detail Views ---

  showFlightDetail(flightId) {
    const flight = this.store.getFlights().find(f => f.id === flightId);
    if (!flight) return;

    const modal = document.getElementById('flight-detail-modal');
    const content = document.getElementById('flight-detail-content');
    if (!modal || !content) return;

    const airlineInfo = AIRLINES[flight.airlineCode];
    const airlineColor = airlineInfo ? airlineInfo.color : '#38bdf8';
    const acInfo = getAircraftInfo(flight.aircraftRaw);

    content.innerHTML = `
      <div class="boarding-pass-card">
        <div class="pass-header" style="border-top-color: ${airlineColor}">
          <div class="pass-airline">
            <span class="pass-carrier-logo" style="background-color: ${airlineColor}">${flight.airlineCode || "✈"}</span>
            <div class="pass-carrier-names">
              <h3>${flight.airlineRaw || "Airlines"}</h3>
              <span>Flight ${flight.flightNumber}</span>
            </div>
          </div>
          <div class="pass-class-badge class-${flight.flightClass === 4 ? 'first' : flight.flightClass === 3 ? 'biz' : flight.flightClass === 2 ? 'prem' : 'eco'}">
            ${flight.flightClassLabel}
          </div>
        </div>

        <div class="pass-route-body">
          <div class="pass-route-station origin">
            <span class="station-code">${flight.fromCode}</span>
            <span class="station-city">${flight.fromAirport?.city || flight.fromRaw}</span>
            <span class="station-time">${flight.depTime || "—"}</span>
          </div>

          <div class="pass-route-middle">
            <div class="pass-duration-tag">⏳ ${flight.durationRaw || formatMinutes(flight.durationMinutes)}</div>
            <div class="flight-flightline">
              <span class="dot-start"></span>
              <span class="flight-line"></span>
              <span class="plane-icon">✈</span>
              <span class="dot-end"></span>
            </div>
            <div class="pass-dist-tag">${flight.distanceKm.toLocaleString()} km / ${flight.distanceMiles.toLocaleString()} mi</div>
          </div>

          <div class="pass-route-station dest">
            <span class="station-code">${flight.toCode}</span>
            <span class="station-city">${flight.toAirport?.city || flight.toRaw}</span>
            <span class="station-time">${flight.arrTime || "—"}</span>
          </div>
        </div>

        <div class="pass-details-grid">
          <div class="pass-grid-item">
            <span class="p-k">Date</span>
            <span class="p-v">${flight.date}</span>
          </div>
          <div class="pass-grid-item">
            <span class="p-k">Seat</span>
            <span class="p-v highlight">${flight.seatNumber ? `${flight.seatNumber} (${flight.seatTypeLabel})` : 'Unassigned'}</span>
          </div>
          <div class="pass-grid-item">
            <span class="p-k">Aircraft</span>
            <span class="p-v">${acInfo.name}</span>
          </div>
          <div class="pass-grid-item">
            <span class="p-k">Tail Number</span>
            <span class="p-v">${flight.registration ? `<strong class="text-cyan cursor-pointer" onclick="window.app.showRegistrationDetail('${flight.registration}')">${flight.registration}</strong>` : '—'}</span>
          </div>
          <div class="pass-grid-item">
            <span class="p-k">Purpose</span>
            <span class="p-v">${flight.flightReasonLabel}</span>
          </div>
          <div class="pass-grid-item">
            <span class="p-k">Status</span>
            <span class="p-v">${flight.isFuture ? '📅 Scheduled / Upcoming' : '✅ Completed'}</span>
          </div>
        </div>

        ${flight.note ? `
          <div class="pass-note-box">
            <span class="note-box-title">📝 Personal Note & Memory</span>
            <p class="note-box-text">${flight.note}</p>
          </div>
        ` : ''}

        <div class="pass-footer">
          <div class="pass-barcode">
            <span>||| | | |||| | ||| |||| | ||||| || | |||| ||| || | |||| ||</span>
          </div>
          <div class="pass-actions">
            <button class="btn btn-secondary btn-sm" onclick="window.app.openEditFlightModal('${flight.id}')">✏️ Edit Flight</button>
            <button class="btn btn-danger btn-sm" onclick="window.app.confirmDeleteFlight('${flight.id}')">🗑️ Delete</button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');
  }

  showRegistrationDetail(registration) {
    const reg = registration.toUpperCase();
    const meta = KNOWN_REGISTRATIONS[reg] || {
      model: "Commercial Jet",
      airline: "Commercial Airline",
      ageYears: "N/A",
      config: "Standard Configuration",
      msn: "N/A",
      deliveryDate: "Unknown"
    };

    const flightsOnTail = this.store.getFlights().filter(f => f.registration && f.registration.toUpperCase() === reg);
    const totalKm = flightsOnTail.reduce((sum, f) => sum + (f.distanceKm || 0), 0);

    const modal = document.getElementById('registration-modal');
    const content = document.getElementById('registration-modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="reg-modal-card">
        <div class="reg-modal-header">
          <div>
            <span class="reg-code-title">${reg}</span>
            <h3>${meta.model}</h3>
            <p>${meta.airline}</p>
          </div>
          <div class="reg-flights-badge">
            <span class="bf-val">${flightsOnTail.length}</span>
            <span class="bf-lbl">Flights Flown</span>
          </div>
        </div>

        <div class="reg-specs-grid">
          <div class="rs-cell">
            <span class="rs-k">Aircraft Age</span>
            <span class="rs-v">${meta.ageYears !== "N/A" ? `${meta.ageYears} years` : "—"}</span>
          </div>
          <div class="rs-cell">
            <span class="rs-k">Manufacturer Serial (MSN)</span>
            <span class="rs-v">${meta.msn}</span>
          </div>
          <div class="rs-cell">
            <span class="rs-k">First Delivery</span>
            <span class="rs-v">${meta.deliveryDate}</span>
          </div>
          <div class="rs-cell">
            <span class="rs-k">Cabin Configuration</span>
            <span class="rs-v">${meta.config}</span>
          </div>
          <div class="rs-cell">
            <span class="rs-k">Total Distance Flown</span>
            <span class="rs-v">${totalKm.toLocaleString()} km</span>
          </div>
        </div>

        <div class="reg-flight-history mt-4">
          <h4>Flights Flown on ${reg}:</h4>
          <div class="reg-flight-table-wrap">
            <table class="flight-table sub-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Flight #</th>
                  <th>Route</th>
                  <th>Duration</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                ${flightsOnTail.map(f => `
                  <tr>
                    <td>${f.date}</td>
                    <td><strong>${f.flightNumber}</strong></td>
                    <td>${f.fromCode} ➔ ${f.toCode}</td>
                    <td>${f.durationRaw}</td>
                    <td><small>${f.note || '—'}</small></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');
  }

  // --- Flight Form Modal (Add / Edit) ---

  openAddFlightModal() {
    this.editingFlightId = null;
    const modal = document.getElementById('flight-form-modal');
    const formTitle = document.getElementById('flight-form-title');
    const form = document.getElementById('flight-edit-form');
    if (!modal || !form) return;

    formTitle.textContent = "Log New Flight";
    form.reset();

    // Default to today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('form-date').value = today;
    document.getElementById('form-dist-preview').textContent = "—";

    const statusBadge = document.getElementById('form-flight-lookup-status');
    if (statusBadge) {
      statusBadge.className = 'lookup-status-badge';
      statusBadge.innerHTML = '';
    }

    modal.classList.add('active');
  }

  openEditFlightModal(flightId) {
    const flight = this.store.getFlights().find(f => f.id === flightId);
    if (!flight) return;

    this.editingFlightId = flightId;
    const modal = document.getElementById('flight-form-modal');
    const formTitle = document.getElementById('flight-form-title');
    if (!modal) return;

    formTitle.textContent = `Edit Flight ${flight.flightNumber}`;

    document.getElementById('form-date').value = flight.date || '';
    document.getElementById('form-flight-num').value = flight.flightNumber || '';
    document.getElementById('flight-from-input').value = flight.fromCode || '';
    document.getElementById('flight-to-input').value = flight.toCode || '';
    document.getElementById('form-dep-time').value = flight.depTime || '';
    document.getElementById('form-arr-time').value = flight.arrTime || '';
    document.getElementById('form-duration').value = flight.durationRaw || '';
    document.getElementById('form-airline').value = flight.airlineRaw || '';
    document.getElementById('form-aircraft').value = flight.aircraftRaw || '';
    document.getElementById('form-registration').value = flight.registration || '';
    document.getElementById('form-seat-num').value = flight.seatNumber || '';
    document.getElementById('form-seat-type').value = flight.seatType !== undefined ? flight.seatType : 0;
    document.getElementById('form-flight-class').value = flight.flightClass !== undefined ? flight.flightClass : 1;
    document.getElementById('form-flight-reason').value = flight.flightReason !== undefined ? flight.flightReason : 1;
    document.getElementById('form-note').value = flight.note || '';

    const statusBadge = document.getElementById('form-flight-lookup-status');
    if (statusBadge) {
      statusBadge.className = 'lookup-status-badge';
      statusBadge.innerHTML = '';
    }

    this.updateFormDistancePreview();

    // Close detail modal if open
    this.closeModal('flight-detail-modal');
    modal.classList.add('active');
  }

  triggerFlightAutofill(manual = false) {
    const flightNumInput = document.getElementById('form-flight-num');
    const statusBadge = document.getElementById('form-flight-lookup-status');
    if (!flightNumInput || !statusBadge) return;

    const val = flightNumInput.value.trim();
    if (!val || val.length < 2) {
      statusBadge.className = 'lookup-status-badge';
      statusBadge.innerHTML = '';
      return;
    }

    const match = lookupFlightSchedule(val, this.store.getFlights());
    if (match) {
      // Auto-fill matched details
      if (match.from) document.getElementById('flight-from-input').value = match.from;
      if (match.to) document.getElementById('flight-to-input').value = match.to;
      if (match.depTime) document.getElementById('form-dep-time').value = match.depTime;
      if (match.arrTime) document.getElementById('form-arr-time').value = match.arrTime;
      if (match.duration) document.getElementById('form-duration').value = match.duration;
      if (match.airline) document.getElementById('form-airline').value = match.airline;
      if (match.aircraft) document.getElementById('form-aircraft').value = match.aircraft;

      this.updateFormDistancePreview();

      statusBadge.className = 'lookup-status-badge active found';
      const srcLabel = match.source === 'flight_history' ? 'Your Past Logs' : 'Global Schedule DB';
      statusBadge.innerHTML = `⚡ <strong>Route Found (${srcLabel})</strong>: ${match.from} ➔ ${match.to} (${match.airline || 'Standard Route'})`;
    } else {
      statusBadge.className = 'lookup-status-badge active not-found';
      statusBadge.innerHTML = `ℹ️ Route not in database — please fill details manually.`;
    }
  }

  saveFlightFromForm(e) {
    e.preventDefault();

    const fromCode = extractAirportCode(document.getElementById('flight-from-input').value);
    const toCode = extractAirportCode(document.getElementById('flight-to-input').value);
    
    if (!fromCode || !toCode) {
      alert('Please enter valid Origin and Destination airport codes.');
      return;
    }

    const fromAirport = getAirport(fromCode);
    const toAirport = getAirport(toCode);

    const dist = calculateDistance(
      fromAirport ? fromAirport.lat : 0,
      fromAirport ? fromAirport.lon : 0,
      toAirport ? toAirport.lat : 0,
      toAirport ? toAirport.lon : 0
    );

    const dateStr = document.getElementById('form-date').value;
    const flightNum = document.getElementById('form-flight-num').value.trim() || '—';
    const depTime = document.getElementById('form-dep-time').value.trim();
    const arrTime = document.getElementById('form-arr-time').value.trim();
    let durationRaw = document.getElementById('form-duration').value.trim();
    
    let durationMins = 0;
    if (durationRaw) {
      const parts = durationRaw.split(':').map(Number);
      if (parts.length >= 2) durationMins = parts[0] * 60 + parts[1];
    }
    if (durationMins === 0 && dist.km > 0) {
      durationMins = Math.round((dist.km / 780) * 60 + 30);
      durationRaw = `${String(Math.floor(durationMins/60)).padStart(2,'0')}:${String(durationMins%60).padStart(2,'0')}:00`;
    }

    const airlineRaw = document.getElementById('form-airline').value.trim();
    const aircraftRaw = document.getElementById('form-aircraft').value.trim();
    const registration = document.getElementById('form-registration').value.trim().toUpperCase();
    const seatNum = document.getElementById('form-seat-num').value.trim().toUpperCase();
    const seatType = parseInt(document.getElementById('form-seat-type').value) || 0;
    const flightClass = parseInt(document.getElementById('form-flight-class').value) || 1;
    const flightReason = parseInt(document.getElementById('form-flight-reason').value) || 1;
    const note = document.getElementById('form-note').value.trim();

    const flightData = {
      date: dateStr,
      flightNumber: flightNum,
      fromRaw: `${fromAirport.city} (${fromCode}/${fromAirport.icao})`,
      toRaw: `${toAirport.city} (${toCode}/${toAirport.icao})`,
      fromCode: fromCode,
      toCode: toCode,
      fromAirport: fromAirport,
      toAirport: toAirport,
      depTime: depTime,
      arrTime: arrTime,
      durationRaw: durationRaw,
      durationMinutes: durationMins,
      distanceKm: dist.km,
      distanceMiles: dist.mi,
      distanceNm: dist.nm,
      airlineRaw: airlineRaw,
      airlineCode: extractAirlineCode(airlineRaw),
      aircraftRaw: aircraftRaw,
      aircraftCode: extractAircraftCode(aircraftRaw),
      registration: registration,
      seatNumber: seatNum,
      seatType: seatType,
      seatTypeLabel: SEAT_TYPES[seatType] || "Unspecified",
      flightClass: flightClass,
      flightClassLabel: FLIGHT_CLASSES[flightClass] || "Economy",
      flightReason: flightReason,
      flightReasonLabel: FLIGHT_REASONS[flightReason] || "Leisure",
      note: note,
      isFuture: new Date(dateStr).getTime() > Date.now()
    };

    if (this.editingFlightId) {
      this.store.updateFlight(this.editingFlightId, flightData);
    } else {
      flightData.id = `fl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      this.store.addFlight(flightData);
    }

    this.closeModal('flight-form-modal');
  }

  confirmDeleteFlight(flightId) {
    if (confirm('Are you sure you want to delete this flight entry?')) {
      this.store.deleteFlight(flightId);
      this.closeModal('flight-detail-modal');
    }
  }

  updateFormDistancePreview() {
    const fromCode = extractAirportCode(document.getElementById('flight-from-input').value);
    const toCode = extractAirportCode(document.getElementById('flight-to-input').value);
    const previewEl = document.getElementById('form-dist-preview');

    if (fromCode && toCode && AIRPORTS[fromCode] && AIRPORTS[toCode]) {
      const ap1 = AIRPORTS[fromCode];
      const ap2 = AIRPORTS[toCode];
      const dist = calculateDistance(ap1.lat, ap1.lon, ap2.lat, ap2.lon);
      if (previewEl) {
        previewEl.innerHTML = `✈️ Estimated Distance: <strong>${dist.km.toLocaleString()} km</strong> (${dist.mi.toLocaleString()} mi)`;
      }
    } else if (previewEl) {
      previewEl.textContent = "—";
    }
  }

  // --- Autocomplete Helper for Airport Inputs ---
  setupAirportAutocomplete(inputId, suggestionsId) {
    const input = document.getElementById(inputId);
    const suggestions = document.getElementById(suggestionsId);
    if (!input || !suggestions) return;

    input.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      if (q.length < 1) {
        suggestions.innerHTML = '';
        suggestions.classList.remove('active');
        return;
      }

      const matches = Object.entries(AIRPORTS).filter(([iata, ap]) => {
        return iata.toLowerCase().includes(q) ||
               ap.city.toLowerCase().includes(q) ||
               ap.name.toLowerCase().includes(q) ||
               ap.country.toLowerCase().includes(q) ||
               ap.icao.toLowerCase().includes(q);
      }).slice(0, 7);

      if (matches.length === 0) {
        suggestions.innerHTML = '<div class="sugg-item empty">No matching airport found</div>';
      } else {
        suggestions.innerHTML = matches.map(([iata, ap]) => `
          <div class="sugg-item" data-code="${iata}">
            <span class="sugg-code">${iata}</span>
            <div class="sugg-meta">
              <strong>${ap.city}</strong>
              <small>${ap.name} • ${ap.country}</small>
            </div>
          </div>
        `).join('');

        suggestions.querySelectorAll('.sugg-item').forEach(item => {
          item.addEventListener('click', () => {
            input.value = item.dataset.code;
            suggestions.innerHTML = '';
            suggestions.classList.remove('active');
            this.updateFormDistancePreview();
          });
        });
      }

      suggestions.classList.add('active');
      this.updateFormDistancePreview();
    });

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !suggestions.contains(e.target)) {
        suggestions.classList.remove('active');
      }
    });
  }

  // --- CSV Import & Export ---

  openImportModal() {
    const modal = document.getElementById('csv-import-modal');
    const previewContainer = document.getElementById('csv-import-preview');
    if (modal) {
      if (previewContainer) previewContainer.innerHTML = '';
      modal.classList.add('active');
    }
  }

  handleCSVFileSelected(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      this.parsedImportFlights = parseFlightradarCSV(text);
      this.renderCSVImportPreview(this.parsedImportFlights);
    };
    reader.readAsText(file);
  }

  renderCSVImportPreview(flights) {
    const container = document.getElementById('csv-import-preview');
    if (!container) return;

    if (flights.length === 0) {
      container.innerHTML = `<div class="alert alert-danger">Could not parse any valid flights from the CSV. Please ensure standard myflightradar24 format.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="import-preview-box">
        <div class="alert alert-success">
          ✅ Successfully parsed <strong>${flights.length} flights</strong>! Ready to import.
        </div>
        <div class="preview-table-wrap">
          <table class="flight-table sub-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Flight #</th>
                <th>Route</th>
                <th>Airline</th>
                <th>Aircraft</th>
                <th>Distance</th>
              </tr>
            </thead>
            <tbody>
              ${flights.slice(0, 5).map(f => `
                <tr>
                  <td>${f.date}</td>
                  <td><strong>${f.flightNumber}</strong></td>
                  <td>${f.fromCode} ➔ ${f.toCode}</td>
                  <td>${f.airlineCode || f.airlineRaw}</td>
                  <td>${f.aircraftCode || f.aircraftRaw}</td>
                  <td>${f.distanceKm.toLocaleString()} km</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ${flights.length > 5 ? `<div class="text-muted text-center p-2">+ ${flights.length - 5} more flights</div>` : ''}
        </div>
        <div class="import-mode-choice mt-3">
          <label><input type="radio" name="import-mode" value="replace" checked> Overwrite current log</label>
          <label class="ml-4"><input type="radio" name="import-mode" value="merge"> Merge with current flights</label>
        </div>
        <div class="modal-footer mt-4">
          <button class="btn btn-primary" onclick="window.app.confirmImport()">Import ${flights.length} Flights</button>
        </div>
      </div>
    `;
  }

  confirmImport() {
    if (!this.parsedImportFlights || this.parsedImportFlights.length === 0) return;
    const mode = document.querySelector('input[name="import-mode"]:checked')?.value || 'replace';
    this.store.importFlights(this.parsedImportFlights, mode);
    this.closeModal('csv-import-modal');
    alert(`Successfully imported ${this.parsedImportFlights.length} flights!`);
  }

  exportCSV() {
    const flights = this.store.getFlights();
    const csvContent = exportToFlightradarCSV(flights);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `myflightradar24_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportJSON() {
    const flights = this.store.getFlights();
    const jsonContent = JSON.stringify(flights, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `airplanemode_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  resetData() {
    if (confirm('Reset your flight log back to the starter demo dataset (2 flights)?')) {
      this.store.resetToSample();
    }
  }

  clearData() {
    if (confirm('Are you sure you want to clear all flights from your log? This cannot be undone unless you have a CSV backup.')) {
      this.store.clearAll();
    }
  }

  // --- Filtering Helpers ---

  filterByYear(year) {
    this.switchTab('flights');
    const select = document.getElementById('filter-year-select');
    if (select) select.value = year;
    this.flightManager.setYearFilter(year);
    this.map.setFilter({ year });
  }

  filterByPair(from, to) {
    this.switchTab('flights');
    const searchInput = document.getElementById('flight-search-input');
    if (searchInput) searchInput.value = `${from}`;
    this.flightManager.setSearch(`${from}`);
  }

  zoomMapTo(iataCode) {
    this.switchTab('map');
    this.map.zoomToAirport(iataCode);
  }

  clearSearchFilters() {
    const searchInput = document.getElementById('flight-search-input');
    const yearSelect = document.getElementById('filter-year-select');
    const classSelect = document.getElementById('filter-class-select');
    if (searchInput) searchInput.value = '';
    if (yearSelect) yearSelect.value = 'all';
    if (classSelect) classSelect.value = 'all';
    this.flightManager.setSearch('');
    this.flightManager.setYearFilter('all');
    this.flightManager.setClassFilter('all');
    this.map.setFilter({ year: 'all', search: '', airline: 'all', aircraft: 'all' });
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  // --- Event Listeners Attachment ---

  attachEventListeners() {
    // Navigation Tabs
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });

    // Global Search Input
    const searchInput = document.getElementById('flight-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        this.flightManager.setSearch(val);
        this.map.setFilter({ search: val });
      });
    }

    // Filter Year Select
    const yearSelect = document.getElementById('filter-year-select');
    if (yearSelect) {
      yearSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        this.flightManager.setYearFilter(val);
        this.map.setFilter({ year: val });
      });
    }

    // Filter Class Select
    const classSelect = document.getElementById('filter-class-select');
    if (classSelect) {
      classSelect.addEventListener('change', (e) => {
        this.flightManager.setClassFilter(e.target.value);
      });
    }

    // Flight Edit Form Submit
    const flightForm = document.getElementById('flight-edit-form');
    if (flightForm) {
      flightForm.addEventListener('submit', (e) => this.saveFlightFromForm(e));
    }

    // Live Flight Number Auto-Lookup on typing
    const flightNumInput = document.getElementById('form-flight-num');
    if (flightNumInput) {
      let autofillTimeout;
      flightNumInput.addEventListener('input', () => {
        clearTimeout(autofillTimeout);
        autofillTimeout = setTimeout(() => {
          this.triggerFlightAutofill(false);
        }, 350);
      });
    }

    // Drag and drop CSV upload
    const dropZone = document.getElementById('csv-drop-zone');
    const fileInput = document.getElementById('csv-file-input');
    if (dropZone && fileInput) {
      dropZone.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleCSVFileSelected(e.target.files[0]);
        }
      });
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
      });
      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
      });
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleCSVFileSelected(e.dataTransfer.files[0]);
        }
      });
    }

    // Modal Close buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });

    // Close modal when clicking outside content
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    });
  }

  // =========================================================================
  // Smart Ingestion Handlers (Screenshots, PDFs, Pasted Emails)
  // =========================================================================

  openSmartIngestModal() {
    const modal = document.getElementById('smart-ingest-modal');
    if (modal) {
      this.clearSmartModalFile();
      const resContainer = document.getElementById('smart-modal-extracted-results');
      if (resContainer) resContainer.style.display = 'none';
      modal.classList.add('active');
    }
  }

  openPwaInstallModal() {
    const modal = document.getElementById('pwa-install-modal');
    if (modal) modal.classList.add('active');
  }

  triggerNativePwaInstall() {
    if (this.deferredPwaPrompt) {
      this.deferredPwaPrompt.prompt();
      this.deferredPwaPrompt.userChoice.then(choice => {
        if (choice.outcome === 'accepted') {
          this.closeModal('pwa-install-modal');
        }
        this.deferredPwaPrompt = null;
      });
    }
  }

  setupSmartIngestDropzones() {
    // 1. In Tab IO
    const smartZone = document.getElementById('smart-file-zone');
    const smartInput = document.getElementById('smart-file-input');
    if (smartZone && smartInput) {
      smartZone.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') smartInput.click();
      });
      smartInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleSmartFileSelected(e.target.files[0], 'io');
        }
      });
      smartZone.addEventListener('dragover', (e) => { e.preventDefault(); smartZone.classList.add('drag-over'); });
      smartZone.addEventListener('dragleave', () => smartZone.classList.remove('drag-over'));
      smartZone.addEventListener('drop', (e) => {
        e.preventDefault();
        smartZone.classList.remove('drag-over');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleSmartFileSelected(e.dataTransfer.files[0], 'io');
        }
      });
    }

    // 2. In Modal
    const modalZone = document.getElementById('smart-modal-file-zone');
    const modalInput = document.getElementById('smart-modal-file-input');
    if (modalZone && modalInput) {
      modalZone.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') modalInput.click();
      });
      modalInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleSmartFileSelected(e.target.files[0], 'modal');
        }
      });
      modalZone.addEventListener('dragover', (e) => { e.preventDefault(); modalZone.classList.add('drag-over'); });
      modalZone.addEventListener('dragleave', () => modalZone.classList.remove('drag-over'));
      modalZone.addEventListener('drop', (e) => {
        e.preventDefault();
        modalZone.classList.remove('drag-over');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleSmartFileSelected(e.dataTransfer.files[0], 'modal');
        }
      });
    }
  }

  setSmartIngestMode(mode) {
    document.querySelectorAll('.smart-mode-tabs .smart-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.smartMode === mode);
    });
    const fileZone = document.getElementById('smart-file-zone');
    const textZone = document.getElementById('smart-text-zone');
    const dropIcon = document.getElementById('smart-drop-icon');
    const dropTitle = document.getElementById('smart-drop-title');
    const dropSub = document.getElementById('smart-drop-sub');
    const fileInput = document.getElementById('smart-file-input');

    if (mode === 'text') {
      if (fileZone) fileZone.style.display = 'none';
      if (textZone) textZone.style.display = 'block';
    } else {
      if (fileZone) fileZone.style.display = 'block';
      if (textZone) textZone.style.display = 'none';
      if (mode === 'image') {
        if (dropIcon) dropIcon.textContent = '📸';
        if (dropTitle) dropTitle.textContent = 'Drop Screenshot (PNG/JPG) here';
        if (dropSub) dropSub.textContent = 'or take a photo / select from photo library';
        if (fileInput) fileInput.accept = 'image/png,image/jpeg,image/webp';
      } else {
        if (dropIcon) dropIcon.textContent = '📄';
        if (dropTitle) dropTitle.textContent = 'Drop PDF E-Ticket or Boarding Pass here';
        if (dropSub) dropSub.textContent = 'or click to browse PDF files';
        if (fileInput) fileInput.accept = 'application/pdf';
      }
    }
  }

  setSmartModalMode(mode) {
    document.querySelectorAll('#smart-ingest-modal .smart-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.smartModalMode === mode);
    });
    const fileZone = document.getElementById('smart-modal-file-zone');
    const textZone = document.getElementById('smart-modal-text-zone');
    const fileInput = document.getElementById('smart-modal-file-input');

    if (mode === 'text') {
      if (fileZone) fileZone.style.display = 'none';
      if (textZone) textZone.style.display = 'block';
    } else {
      if (fileZone) fileZone.style.display = 'block';
      if (textZone) textZone.style.display = 'none';
      if (fileInput) fileInput.accept = mode === 'image' ? 'image/png,image/jpeg,image/webp' : 'application/pdf';
    }
  }

  handleSmartFileSelected(file, context = 'io') {
    if (!file) return;
    if (context === 'io') {
      this.activeSmartFile = file;
      const preview = document.getElementById('smart-file-preview');
      const imgEl = document.getElementById('smart-preview-img');
      const infoEl = document.getElementById('smart-preview-info');

      if (preview) preview.style.display = 'block';
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (imgEl) { imgEl.src = e.target.result; imgEl.style.display = 'block'; }
          if (infoEl) infoEl.textContent = `📸 ${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
        };
        reader.readAsDataURL(file);
      } else {
        if (imgEl) imgEl.style.display = 'none';
        if (infoEl) infoEl.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
      }
    } else {
      this.activeSmartModalFile = file;
      const preview = document.getElementById('smart-modal-preview');
      const imgEl = document.getElementById('smart-modal-preview-img');
      const infoEl = document.getElementById('smart-modal-preview-info');

      if (preview) preview.style.display = 'block';
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (imgEl) { imgEl.src = e.target.result; imgEl.style.display = 'block'; }
          if (infoEl) infoEl.textContent = `📸 ${file.name}`;
        };
        reader.readAsDataURL(file);
      } else {
        if (imgEl) imgEl.style.display = 'none';
        if (infoEl) infoEl.textContent = `📄 ${file.name}`;
      }
    }
  }

  clearSmartFile(e) {
    if (e) e.stopPropagation();
    this.activeSmartFile = null;
    const preview = document.getElementById('smart-file-preview');
    const input = document.getElementById('smart-file-input');
    if (preview) preview.style.display = 'none';
    if (input) input.value = '';
  }

  clearSmartModalFile() {
    this.activeSmartModalFile = null;
    const preview = document.getElementById('smart-modal-preview');
    const input = document.getElementById('smart-modal-file-input');
    if (preview) preview.style.display = 'none';
    if (input) input.value = '';
  }

  async runSmartIngest() {
    const btn = document.getElementById('smart-parse-btn');
    const resultsContainer = document.getElementById('smart-extracted-results');
    const activeTab = document.querySelector('.smart-mode-tabs .smart-tab-btn.active')?.dataset.smartMode || 'image';

    if (btn) { btn.disabled = true; btn.textContent = '🧠 Extracting flight details...'; }
    if (resultsContainer) { resultsContainer.style.display = 'block'; resultsContainer.innerHTML = '<div class="text-center p-3 text-cyan">Scanning itinerary & extracting flight segments...</div>'; }

    try {
      let extracted = [];
      if (activeTab === 'text') {
        const textVal = document.getElementById('smart-text-input')?.value || '';
        extracted = await this.smartIngest.parseText(textVal);
      } else if (activeTab === 'image') {
        if (!this.activeSmartFile) throw new Error('Please select or drop a flight screenshot (PNG/JPEG) first.');
        extracted = await this.smartIngest.parseImageFile(this.activeSmartFile);
      } else {
        if (!this.activeSmartFile) throw new Error('Please select or drop a PDF e-ticket first.');
        extracted = await this.smartIngest.parsePdfFile(this.activeSmartFile);
      }

      this.currentSmartExtracted = extracted;
      this.renderSmartResults(extracted, 'smart-extracted-results');
    } catch (err) {
      if (resultsContainer) {
        resultsContainer.innerHTML = `<div class="alert alert-danger">⚠️ ${err.message}</div>`;
      }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '✨ Extract Flight Details'; }
    }
  }

  async runSmartModalIngest() {
    const btn = document.getElementById('smart-modal-parse-btn');
    const resultsContainer = document.getElementById('smart-modal-extracted-results');
    const activeTab = document.querySelector('#smart-ingest-modal .smart-tab-btn.active')?.dataset.smartModalMode || 'image';

    if (btn) { btn.disabled = true; btn.textContent = '🧠 Extracting...'; }
    if (resultsContainer) { resultsContainer.style.display = 'block'; resultsContainer.innerHTML = '<div class="text-center p-3 text-cyan">Parsing flight details...</div>'; }

    try {
      let extracted = [];
      if (activeTab === 'text') {
        const textVal = document.getElementById('smart-modal-text-input')?.value || '';
        extracted = await this.smartIngest.parseText(textVal);
      } else if (activeTab === 'image') {
        if (!this.activeSmartModalFile) throw new Error('Please choose a screenshot first.');
        extracted = await this.smartIngest.parseImageFile(this.activeSmartModalFile);
      } else {
        if (!this.activeSmartModalFile) throw new Error('Please choose a PDF e-ticket first.');
        extracted = await this.smartIngest.parsePdfFile(this.activeSmartModalFile);
      }

      this.currentSmartExtracted = extracted;
      this.renderSmartResults(extracted, 'smart-modal-extracted-results');
    } catch (err) {
      if (resultsContainer) {
        resultsContainer.innerHTML = `<div class="alert alert-danger">⚠️ ${err.message}</div>`;
      }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '✨ Extract Flights'; }
    }
  }

  renderSmartResults(flights, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!flights || flights.length === 0) {
      container.innerHTML = `<div class="alert alert-danger">No flights detected.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="smart-results-card">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-white font-bold">🎉 Detected ${flights.length} Flight Segment${flights.length > 1 ? 's' : ''}</h4>
          <button class="btn btn-primary btn-sm" onclick="window.app.confirmAllSmartFlights('${containerId}')">
            ✅ Add ${flights.length} Flight${flights.length > 1 ? 's' : ''} to Logbook
          </button>
        </div>

        <div class="smart-flights-list">
          ${flights.map((f, idx) => `
            <div class="smart-flight-item glass-card mb-2 p-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="airline-badge font-bold">${f.airlineCode || '✈️'}</span>
                  <strong>${f.flightNumber}</strong>
                  <span class="text-muted text-xs">• ${f.date}</span>
                </div>
                <span class="badge class-eco">${f.flightClass === 3 ? 'Business' : f.flightClass === 4 ? 'First' : 'Economy'}</span>
              </div>
              <div class="smart-route-row flex items-center gap-3 my-2">
                <span class="station-code-sm font-bold text-cyan">${f.fromCode}</span>
                <span class="route-arrow text-amber">✈️ ➔</span>
                <span class="station-code-sm font-bold text-cyan">${f.toCode}</span>
                <span class="text-xs text-muted">(${f.distanceKm.toLocaleString()} km)</span>
              </div>
              <div class="flex items-center justify-between text-xs text-muted">
                <span>⏱️ ${f.depTime || '—'} ➔ ${f.arrTime || '—'}</span>
                <span>💺 Seat: <strong>${f.seatNumber || '—'}</strong></span>
                <span>🛩️ ${f.aircraftRaw || 'Airbus/Boeing'}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  confirmAllSmartFlights(containerId) {
    if (!this.currentSmartExtracted || this.currentSmartExtracted.length === 0) return;
    const count = this.smartIngest.importFlights(this.currentSmartExtracted);
    alert(`🎉 Successfully added ${count} flight${count > 1 ? 's' : ''} to your AirplaneMode logbook!`);
    
    // Close modal if open
    this.closeModal('smart-ingest-modal');
    
    // Clear container
    const container = document.getElementById(containerId);
    if (container) container.style.display = 'none';

    // Switch to flight log or map to view
    this.switchTab('flights');
  }

  toggleGeminiKeyPrompt() {
    const configEl = document.getElementById('smart-key-config');
    const input = document.getElementById('smart-gemini-key-input');
    if (configEl) {
      const isVisible = configEl.style.display === 'block';
      configEl.style.display = isVisible ? 'none' : 'block';
      if (!isVisible && input) {
        input.value = this.smartIngest.getApiKey();
      }
    }
  }

  saveGeminiKey() {
    const input = document.getElementById('smart-gemini-key-input');
    if (input) {
      this.smartIngest.setApiKey(input.value);
      alert('✅ Gemini API Key saved locally in your browser!');
      const configEl = document.getElementById('smart-key-config');
      if (configEl) configEl.style.display = 'none';
    }
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new SkyLogApp();
  window.app = app;
  app.init();
});
