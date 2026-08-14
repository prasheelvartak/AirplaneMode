/**
 * Flight Log Explorer, Search, Filter, and CRUD Operations
 */
import { AIRPORTS, getAirport, calculateDistance, extractAirportCode } from '../data/airports.js';
import { AIRLINES, AIRCRAFT_MODELS, getAircraftInfo, extractAircraftCode, extractAirlineCode } from '../data/aircraft.js';
import { SEAT_TYPES, FLIGHT_CLASSES, FLIGHT_REASONS, formatMinutes, formatMinutesHuman } from './parser.js';

export class FlightLogManager {
  constructor(tableContainerId, paginationContainerId, store) {
    this.tableContainerId = tableContainerId;
    this.paginationContainerId = paginationContainerId;
    this.store = store;
    
    this.flights = [];
    this.filteredFlights = [];
    
    this.searchQuery = '';
    this.selectedYear = 'all';
    this.selectedClass = 'all';
    this.selectedReason = 'all';
    this.selectedAirline = 'all';
    
    this.sortColumn = 'date';
    this.sortAsc = false;
    
    this.currentPage = 1;
    this.pageSize = 20;
  }

  setFlights(flights) {
    this.flights = flights;
    this.applyFilters();
  }

  setSearch(query) {
    this.searchQuery = query.toLowerCase().trim();
    this.currentPage = 1;
    this.applyFilters();
  }

  setYearFilter(year) {
    this.selectedYear = year;
    this.currentPage = 1;
    this.applyFilters();
  }

  setClassFilter(cls) {
    this.selectedClass = cls;
    this.currentPage = 1;
    this.applyFilters();
  }

  setAirlineFilter(airline) {
    this.selectedAirline = airline;
    this.currentPage = 1;
    this.applyFilters();
  }

  setSort(column) {
    if (this.sortColumn === column) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortColumn = column;
      this.sortAsc = (column === 'flightNumber' || column === 'fromCode');
    }
    this.applySort();
    this.render();
  }

  applyFilters() {
    this.filteredFlights = this.flights.filter(f => {
      // Year filter
      if (this.selectedYear !== 'all') {
        if (this.selectedYear === 'future') {
          if (!f.isFuture) return false;
        } else {
          const year = new Date(f.date).getFullYear().toString();
          if (year !== this.selectedYear) return false;
        }
      }

      // Class filter
      if (this.selectedClass !== 'all') {
        if (f.flightClass.toString() !== this.selectedClass) return false;
      }

      // Airline filter
      if (this.selectedAirline !== 'all') {
        if (f.airlineCode !== this.selectedAirline && f.airlineRaw !== this.selectedAirline) return false;
      }

      // Search query
      if (this.searchQuery) {
        const q = this.searchQuery;
        const noteMatch = f.note && f.note.toLowerCase().includes(q);
        const flightMatch = f.flightNumber && f.flightNumber.toLowerCase().includes(q);
        const fromMatch = (f.fromCode && f.fromCode.toLowerCase().includes(q)) || (f.fromAirport && f.fromAirport.city.toLowerCase().includes(q));
        const toMatch = (f.toCode && f.toCode.toLowerCase().includes(q)) || (f.toAirport && f.toAirport.city.toLowerCase().includes(q));
        const airlineMatch = f.airlineRaw && f.airlineRaw.toLowerCase().includes(q);
        const aircraftMatch = f.aircraftRaw && f.aircraftRaw.toLowerCase().includes(q);
        const regMatch = f.registration && f.registration.toLowerCase().includes(q);
        const seatMatch = f.seatNumber && f.seatNumber.toLowerCase().includes(q);

        if (!noteMatch && !flightMatch && !fromMatch && !toMatch && !airlineMatch && !aircraftMatch && !regMatch && !seatMatch) {
          return false;
        }
      }

      return true;
    });

    this.applySort();
    this.render();
  }

  applySort() {
    this.filteredFlights.sort((a, b) => {
      let valA, valB;
      switch (this.sortColumn) {
        case 'date':
          valA = new Date(a.date).getTime() || 0;
          valB = new Date(b.date).getTime() || 0;
          break;
        case 'flightNumber':
          valA = a.flightNumber || '';
          valB = b.flightNumber || '';
          break;
        case 'fromCode':
          valA = a.fromCode || '';
          valB = b.fromCode || '';
          break;
        case 'toCode':
          valA = a.toCode || '';
          valB = b.toCode || '';
          break;
        case 'distanceKm':
          valA = a.distanceKm || 0;
          valB = b.distanceKm || 0;
          break;
        case 'durationMinutes':
          valA = a.durationMinutes || 0;
          valB = b.durationMinutes || 0;
          break;
        case 'airline':
          valA = a.airlineRaw || '';
          valB = b.airlineRaw || '';
          break;
        case 'aircraft':
          valA = a.aircraftRaw || '';
          valB = b.aircraftRaw || '';
          break;
        default:
          valA = new Date(a.date).getTime() || 0;
          valB = new Date(b.date).getTime() || 0;
      }

      if (valA < valB) return this.sortAsc ? -1 : 1;
      if (valA > valB) return this.sortAsc ? 1 : -1;
      return 0;
    });
  }

  render() {
    const tableContainer = document.getElementById(this.tableContainerId);
    const paginationContainer = document.getElementById(this.paginationContainerId);
    if (!tableContainer) return;

    const total = this.filteredFlights.length;
    const totalPages = Math.ceil(total / this.pageSize) || 1;
    if (this.currentPage > totalPages) this.currentPage = totalPages;

    const startIdx = (this.currentPage - 1) * this.pageSize;
    const pageFlights = this.filteredFlights.slice(startIdx, startIdx + this.pageSize);

    // Update count indicator
    const countBadge = document.getElementById('flight-filtered-count');
    if (countBadge) {
      countBadge.textContent = `${total} flight${total === 1 ? '' : 's'}`;
    }

    const sortIcon = (col) => {
      if (this.sortColumn !== col) return '<span class="sort-icon dim">⇅</span>';
      return this.sortAsc ? '<span class="sort-icon">▲</span>' : '<span class="sort-icon">▼</span>';
    };

    if (total === 0) {
      tableContainer.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-icon">✈️</div>
          <h3>No Flights Found</h3>
          <p>No flights matched your current search filters or query.</p>
          <button class="btn btn-secondary mt-3" onclick="window.app.clearSearchFilters()">Reset Filters</button>
        </div>
      `;
      if (paginationContainer) paginationContainer.innerHTML = '';
      return;
    }

    tableContainer.innerHTML = `
      <table class="flight-table">
        <thead>
          <tr>
            <th class="cursor-pointer" onclick="window.app.flightManager.setSort('date')">Date ${sortIcon('date')}</th>
            <th class="cursor-pointer" onclick="window.app.flightManager.setSort('flightNumber')">Flight ${sortIcon('flightNumber')}</th>
            <th class="cursor-pointer" onclick="window.app.flightManager.setSort('fromCode')">Origin ${sortIcon('fromCode')}</th>
            <th></th>
            <th class="cursor-pointer" onclick="window.app.flightManager.setSort('toCode')">Destination ${sortIcon('toCode')}</th>
            <th class="cursor-pointer" onclick="window.app.flightManager.setSort('airline')">Airline ${sortIcon('airline')}</th>
            <th class="cursor-pointer" onclick="window.app.flightManager.setSort('aircraft')">Aircraft ${sortIcon('aircraft')}</th>
            <th class="cursor-pointer" onclick="window.app.flightManager.setSort('distanceKm')">Distance ${sortIcon('distanceKm')}</th>
            <th class="cursor-pointer" onclick="window.app.flightManager.setSort('durationMinutes')">Duration ${sortIcon('durationMinutes')}</th>
            <th>Seat / Class</th>
            <th>Notes</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${pageFlights.map(f => {
            const isFuture = f.isFuture;
            const classBadgeClass = f.flightClass === 4 ? 'class-first' : f.flightClass === 3 ? 'class-biz' : f.flightClass === 2 ? 'class-prem' : 'class-eco';
            const airlineInfo = AIRLINES[f.airlineCode];
            const airlineColor = airlineInfo ? airlineInfo.color : '#38bdf8';

            return `
              <tr class="flight-table-row ${isFuture ? 'row-future' : ''}" onclick="window.app.showFlightDetail('${f.id}')">
                <td class="cell-date">
                  <span class="flight-date-val">${f.date}</span>
                  ${isFuture ? '<span class="badge-future">Scheduled</span>' : ''}
                </td>
                <td class="cell-flightno">
                  <strong class="flight-num-badge">${f.flightNumber}</strong>
                </td>
                <td class="cell-airport">
                  <div class="ap-cell">
                    <span class="ap-code">${f.fromCode}</span>
                    <span class="ap-city">${f.fromAirport?.city || f.fromRaw}</span>
                  </div>
                </td>
                <td class="cell-arrow">➔</td>
                <td class="cell-airport">
                  <div class="ap-cell">
                    <span class="ap-code">${f.toCode}</span>
                    <span class="ap-city">${f.toAirport?.city || f.toRaw}</span>
                  </div>
                </td>
                <td class="cell-airline">
                  <div class="airline-pill" style="border-left-color: ${airlineColor}">
                    <span>${f.airlineCode || f.airlineRaw}</span>
                  </div>
                </td>
                <td class="cell-aircraft">
                  <span class="aircraft-chip" title="${f.aircraftRaw}">${f.aircraftCode || f.aircraftRaw || '—'}</span>
                  ${f.registration ? `<span class="tail-chip">${f.registration}</span>` : ''}
                </td>
                <td class="cell-dist">
                  <span class="dist-val">${f.distanceKm.toLocaleString()} km</span>
                </td>
                <td class="cell-dur">
                  <span class="dur-val">${f.durationRaw || formatMinutes(f.durationMinutes)}</span>
                </td>
                <td class="cell-class">
                  <div class="seat-class-stack">
                    <span class="badge-class ${classBadgeClass}">${f.flightClassLabel}</span>
                    ${f.seatNumber ? `<span class="badge-seat">${f.seatNumber} (${f.seatTypeLabel})</span>` : ''}
                  </div>
                </td>
                <td class="cell-notes">
                  <span class="note-snippet" title="${f.note || ''}">${f.note || '—'}</span>
                </td>
                <td class="cell-actions text-right" onclick="event.stopPropagation()">
                  <button class="btn-icon" title="View Boarding Pass" onclick="window.app.showFlightDetail('${f.id}')">🎫</button>
                  <button class="btn-icon" title="Edit Flight" onclick="window.app.openEditFlightModal('${f.id}')">✏️</button>
                  <button class="btn-icon btn-danger-icon" title="Delete Flight" onclick="window.app.confirmDeleteFlight('${f.id}')">🗑️</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;

    // Render Pagination Controls
    if (paginationContainer) {
      if (totalPages <= 1) {
        paginationContainer.innerHTML = `
          <div class="pagination-info">Showing all ${total} flights</div>
        `;
      } else {
        paginationContainer.innerHTML = `
          <div class="pagination-wrapper">
            <div class="pagination-info">Showing ${startIdx + 1}–${Math.min(startIdx + this.pageSize, total)} of ${total} flights</div>
            <div class="pagination-buttons">
              <button class="btn btn-sm" ${this.currentPage === 1 ? 'disabled' : ''} onclick="window.app.flightManager.setPage(${this.currentPage - 1})">◀ Prev</button>
              <span class="page-current">Page ${this.currentPage} of ${totalPages}</span>
              <button class="btn btn-sm" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="window.app.flightManager.setPage(${this.currentPage + 1})">Next ▶</button>
            </div>
          </div>
        `;
      }
    }
  }

  setPage(page) {
    this.currentPage = page;
    this.render();
  }
}
