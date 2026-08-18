/* ==========================================================================
   AirplaneMode - Application Script (v1.1)
   ========================================================================== */

class FlightTrackerApp {
  constructor() {
    this.map = null;
    this.initMap();
  }

  initMap() {
    const mapElement = document.getElementById('flight-map-view');
    if (!mapElement) return;

    // Strict geographic bounds preventing dragging into blank outer space
    const southWest = L.latLng(-85, -180);
    const northEast = L.latLng(85, 180);
    const bounds = L.latLngBounds(southWest, northEast);

    this.map = L.map('flight-map-view', {
      center: [20, 0],
      zoom: 2.5,
      minZoom: 2,
      maxZoom: 18,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0, // Hard lock at boundary edges
      worldCopyJump: false,
      bounceAtZoomLimits: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
      noWrap: true,
      bounds: bounds
    }).addTo(this.map);
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
  }

  toggleMobileMapControls(show) {
    const card = document.getElementById('map-control-card');
    if (!card) return;
    if (typeof show === 'boolean') {
      card.classList.toggle('active', show);
    } else {
      card.classList.toggle('active');
    }
  }

  openImportModal() {
    alert('Import CSV feature');
  }

  openAddFlightModal() {
    alert('Log Flight feature');
  }

  onMapAirlineFilterChanged(val) {}
  clearMapAirlineFilter() {}
  setRouteColorMode(mode) {}
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new FlightTrackerApp();
});