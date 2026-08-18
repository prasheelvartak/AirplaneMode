/**
 * Interactive Global Map & Great Circle Arc Visualizer
 * Powered by Leaflet & Geodesic Arc Math
 */
import { AIRPORTS, getAirport, getGreatCircleArc } from '../data/airports.js';
import { AIRLINES } from '../data/aircraft.js';

export class FlightMap {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.tileLayer = null;
    this.routeLayerGroup = null;
    this.airportLayerGroup = null;
    this.currentTheme = 'dark';
    this.currentBasemap = 'dark'; // 'dark', 'light', 'osm'
    this.routeColorMode = 'airline'; // 'airline', 'cyan', 'frequency'
    this.airportMetricMode = 'detailed'; // 'detailed', 'departures'
    this.activeFilter = {
      year: 'all',
      airline: 'all',
      aircraft: 'all',
      search: ''
    };
    this.flights = [];
    this.isInitialized = false;
  }

  init(initialTheme = 'dark') {
    if (this.isInitialized || !document.getElementById(this.containerId)) return;
    this.currentTheme = initialTheme;
    this.currentBasemap = initialTheme === 'light' ? 'light' : 'dark';

    // Initialize Leaflet map with bounded global view (locks world bounds, zero black void)
    this.map = L.map(this.containerId, {
      center: [25, 0],
      zoom: 2.2,
      minZoom: 1.9,
      maxZoom: 12,
      maxBounds: [[-85, -180], [85, 180]],
      maxBoundsViscosity: 1.0,
      worldCopyJump: false,
      zoomControl: false,
      attributionControl: false
    });

    this.tileLayer = L.tileLayer(this.getTileUrl(this.currentBasemap), {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Layer groups for clean updates
    this.routeLayerGroup = L.layerGroup().addTo(this.map);
    this.airportLayerGroup = L.layerGroup().addTo(this.map);

    this.isInitialized = true;
    
    // Invalidate size on window resize
    window.addEventListener('resize', () => {
      if (this.map) this.map.invalidateSize();
    });
  }

  getTileUrl(basemap) {
    switch (basemap) {
      case 'light':
        return 'https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png';
      case 'osm':
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      case 'dark':
      default:
        return 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png';
    }
  }

  setTheme(theme) {
    this.currentTheme = theme;
    this.currentBasemap = theme === 'light' ? 'light' : 'dark';
    if (!this.map || !this.tileLayer) return;

    this.tileLayer.setUrl(this.getTileUrl(this.currentBasemap));
    this.render();
  }

  setBasemap(basemap) {
    this.currentBasemap = basemap;
    if (!this.map || !this.tileLayer) return;
    this.tileLayer.setUrl(this.getTileUrl(basemap));
  }

  setRouteColorMode(mode) {
    this.routeColorMode = mode;
    this.render();
  }

  setAirportMetricMode(mode) {
    this.airportMetricMode = mode;
    this.render();
  }

  setFlights(flights) {
    this.flights = flights;
    this.render();
  }

  setFilter(filter) {
    this.activeFilter = { ...this.activeFilter, ...filter };
    this.render();
  }

  render() {
    if (!this.isInitialized || !this.map) return;

    this.routeLayerGroup.clearLayers();
    this.airportLayerGroup.clearLayers();

    // Filter flights according to active filter
    const filteredFlights = this.flights.filter(f => {
      if (this.activeFilter.year !== 'all') {
        const flightYear = new Date(f.date).getFullYear().toString();
        if (flightYear !== this.activeFilter.year) return false;
      }
      if (this.activeFilter.airline !== 'all') {
        const matchesAirline = f.airlineCode === this.activeFilter.airline || 
          (f.airlineRaw && f.airlineRaw.includes(this.activeFilter.airline));
        if (!matchesAirline) return false;
      }
      if (this.activeFilter.aircraft !== 'all' && f.aircraftCode !== this.activeFilter.aircraft) {
        return false;
      }
      if (this.activeFilter.search) {
        const q = this.activeFilter.search.toLowerCase();
        const matches = 
          (f.flightNumber && f.flightNumber.toLowerCase().includes(q)) ||
          (f.fromCode && f.fromCode.toLowerCase().includes(q)) ||
          (f.toCode && f.toCode.toLowerCase().includes(q)) ||
          (f.fromAirport && f.fromAirport.city.toLowerCase().includes(q)) ||
          (f.toAirport && f.toAirport.city.toLowerCase().includes(q)) ||
          (f.airlineRaw && f.airlineRaw.toLowerCase().includes(q)) ||
          (f.note && f.note.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });

    // Aggregate routes to determine route frequency & styles
    const routeMap = new Map();
    const airportStats = new Map();

    for (const f of filteredFlights) {
      if (!f.fromCode || !f.toCode) continue;

      const fromAp = getAirport(f.fromCode);
      const toAp = getAirport(f.toCode);

      if (!fromAp || !toAp || (!fromAp.lat && !fromAp.lon) || (!toAp.lat && !toAp.lon)) continue;

      // Bidirectional route key for visual consolidation
      const routeKey = [f.fromCode, f.toCode].sort().join('-');
      
      if (!routeMap.has(routeKey)) {
        routeMap.set(routeKey, {
          fromCode: f.fromCode,
          toCode: f.toCode,
          fromAirport: fromAp,
          toAirport: toAp,
          count: 0,
          flights: [],
          distanceKm: f.distanceKm,
          distanceMiles: f.distanceMiles
        });
      }
      const rEntry = routeMap.get(routeKey);
      rEntry.count++;
      rEntry.flights.push(f);

      // Airport operations stats
      if (!airportStats.has(f.fromCode)) airportStats.set(f.fromCode, { code: f.fromCode, airport: fromAp, deps: 0, arrs: 0, total: 0 });
      if (!airportStats.has(f.toCode)) airportStats.set(f.toCode, { code: f.toCode, airport: toAp, deps: 0, arrs: 0, total: 0 });

      airportStats.get(f.fromCode).deps++;
      airportStats.get(f.fromCode).total++;
      airportStats.get(f.toCode).arrs++;
      airportStats.get(f.toCode).total++;
    }

    // Render Routes (Curved Great Circles)
    const boundsCoords = [];

    for (const [key, r] of routeMap.entries()) {
      const arcPoints = getGreatCircleArc(
        r.fromAirport.lat, r.fromAirport.lon,
        r.toAirport.lat, r.toAirport.lon,
        45
      );

      // Scale line weight and opacity by frequency
      const weight = Math.min(1.5 + Math.log2(r.count + 1) * 1.5, 6);
      const opacity = Math.min(0.4 + (r.count / 20) * 0.5, 0.95);
      
      // Determine route color based on selected routeColorMode
      let primaryColor = '#38bdf8'; // Default cyan
      if (this.routeColorMode === 'airline') {
        if (r.flights[0] && r.flights[0].airlineCode && AIRLINES[r.flights[0].airlineCode]) {
          primaryColor = AIRLINES[r.flights[0].airlineCode].color || '#38bdf8';
        }
      } else if (this.routeColorMode === 'frequency') {
        if (r.count >= 8) primaryColor = '#f59e0b'; // Gold for ultra-frequent
        else if (r.count >= 3) primaryColor = '#a855f7'; // Purple for moderate
        else primaryColor = '#38bdf8'; // Cyan for standard
      } else {
        primaryColor = '#38bdf8';
      }

      // Outer glow line
      const glowPolyline = L.polyline(arcPoints, {
        color: primaryColor,
        weight: weight + 3,
        opacity: 0.18,
        smoothFactor: 1,
        lineCap: 'round'
      });

      // Core crisp path
      const polyline = L.polyline(arcPoints, {
        color: primaryColor,
        weight: weight,
        opacity: opacity,
        smoothFactor: 1,
        className: 'geodesic-flight-arc'
      });

      // Popup Content
      const popupHtml = `
        <div class="map-popup-card">
          <div class="map-popup-header">
            <span class="route-badge">${r.fromAirport.city} (${r.fromCode}) ➔ ${r.toAirport.city} (${r.toCode})</span>
          </div>
          <div class="map-popup-stats">
            <div class="popup-stat">
              <span class="stat-lbl">Flights Flown</span>
              <span class="stat-val highlight">${r.count}x</span>
            </div>
            <div class="popup-stat">
              <span class="stat-lbl">Distance</span>
              <span class="stat-val">${r.distanceKm.toLocaleString()} km (${r.distanceMiles.toLocaleString()} mi)</span>
            </div>
          </div>
          <div class="map-popup-flights">
            <div class="popup-flights-title">Recent Flights:</div>
            <div class="popup-flight-list">
              ${r.flights.slice(0, 4).map(f => `
                <div class="popup-flight-row">
                  <span class="flight-date">${f.date}</span>
                  <span class="flight-no">${f.flightNumber}</span>
                  <span class="flight-carrier">${f.airlineCode || f.airlineRaw}</span>
                  <span class="flight-dur">${f.durationRaw}</span>
                </div>
              `).join('')}
              ${r.flights.length > 4 ? `<div class="popup-more">+ ${r.flights.length - 4} more flights</div>` : ''}
            </div>
          </div>
        </div>
      `;

      polyline.bindPopup(popupHtml, { className: 'custom-map-popup' });
      glowPolyline.bindPopup(popupHtml, { className: 'custom-map-popup' });

      // Hover effects
      polyline.on('mouseover', function() {
        this.setStyle({ weight: weight + 2.5, opacity: 1, color: '#f59e0b' });
      });
      polyline.on('mouseout', function() {
        this.setStyle({ weight: weight, opacity: opacity, color: primaryColor });
      });

      this.routeLayerGroup.addLayer(glowPolyline);
      this.routeLayerGroup.addLayer(polyline);

      boundsCoords.push([r.fromAirport.lat, r.fromAirport.lon]);
      boundsCoords.push([r.toAirport.lat, r.toAirport.lon]);
    }

    // Render Airport Markers
    for (const [code, stat] of airportStats.entries()) {
      const ap = stat.airport;
      if (!ap || (!ap.lat && !ap.lon)) continue;

      // Scale marker radius by operations or departures depending on mode
      const metricVal = this.airportMetricMode === 'departures' ? stat.deps : stat.total;
      const radius = Math.min(4 + Math.log2(metricVal + 1) * 2.8, 14);
      const isHub = stat.deps >= 10 || stat.total >= 15;

      // Outer ripple / ring marker
      const ringMarker = L.circleMarker([ap.lat, ap.lon], {
        radius: radius + 3,
        color: isHub ? '#f59e0b' : '#38bdf8',
        weight: 1.5,
        opacity: 0.4,
        fillColor: 'transparent',
        fillOpacity: 0
      });

      // Core airport marker
      const marker = L.circleMarker([ap.lat, ap.lon], {
        radius: radius,
        fillColor: isHub ? '#f59e0b' : '#38bdf8',
        color: '#ffffff',
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.85
      });

      const roleBadge = stat.deps > stat.arrs && stat.deps >= 10
        ? '<span class="role-badge hub">🏠 Home Hub</span>'
        : stat.deps > 0 && stat.arrs > 0
          ? '<span class="role-badge transit">🔄 Transit & Hub</span>'
          : '<span class="role-badge dest">📍 Destination</span>';

      const airportPopup = `
        <div class="map-popup-card airport-card">
          <div class="map-popup-header">
            <div class="flex justify-between items-center">
              <span class="airport-code-badge">${code}</span>
              ${roleBadge}
            </div>
            <div class="airport-titles mt-1">
              <strong>${ap.city}</strong>
              <small>${ap.name}</small>
              <span class="country-tag">${ap.country}</span>
            </div>
          </div>
          <div class="map-popup-stats">
            <div class="popup-stat">
              <span class="stat-lbl">Departures Flown</span>
              <span class="stat-val highlight">${stat.deps}</span>
            </div>
            <div class="popup-stat">
              <span class="stat-lbl">Arrivals Logged</span>
              <span class="stat-val">${stat.arrs}</span>
            </div>
            <div class="popup-stat" style="grid-column: span 2; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 4px;">
              <span class="stat-lbl">Total Operations (Touchdowns)</span>
              <span class="stat-val">${stat.total} flights involved</span>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(airportPopup, { className: 'custom-map-popup' });
      ringMarker.bindPopup(airportPopup, { className: 'custom-map-popup' });

      // Disambiguated Hover tooltip: Shows both Departures and Arrivals clearly!
      let tooltipContent = '';
      if (this.airportMetricMode === 'departures') {
        tooltipContent = `<strong>${code}</strong> - ${ap.city} • <strong>${stat.deps} Departures</strong>`;
      } else {
        tooltipContent = `<strong>${code}</strong> (${ap.city}): <strong>${stat.deps} Dep</strong> • <strong>${stat.arrs} Arr</strong> (${stat.total} total visits)`;
      }

      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        className: 'custom-map-tooltip',
        offset: [0, -radius]
      });

      this.airportLayerGroup.addLayer(ringMarker);
      this.airportLayerGroup.addLayer(marker);
    }
  }

  fitAll() {
    if (!this.map) return;
    const activeAirports = [];
    for (const f of this.flights) {
      if (f.fromAirport && f.fromAirport.lat) activeAirports.push([f.fromAirport.lat, f.fromAirport.lon]);
      if (f.toAirport && f.toAirport.lat) activeAirports.push([f.toAirport.lat, f.toAirport.lon]);
    }
    if (activeAirports.length > 0) {
      this.map.fitBounds(L.latLngBounds(activeAirports).pad(0.15), { animate: true, duration: 1 });
    }
  }

  zoomToAirport(iataCode) {
    const ap = getAirport(iataCode);
    if (ap && ap.lat && this.map) {
      this.map.flyTo([ap.lat, ap.lon], 6, { duration: 1.2 });
    }
  }
}
