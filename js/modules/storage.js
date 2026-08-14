/**
 * Reactive Storage & State Management
 */
import { SAMPLE_CSV } from '../data/sampleFlights.js';
import { parseFlightradarCSV } from './parser.js';

const STORAGE_KEY = 'airplanemode_flights_v1';
const SETTINGS_KEY = 'airplanemode_settings_v1';

export class FlightStore {
  constructor() {
    this.flights = [];
    this.listeners = [];
    this.settings = {
      distanceUnit: 'km', // 'km' or 'mi'
      theme: 'dark',
      mapStyle: 'dark' // 'dark' or 'satellite'
    };
    this.init();
  }

  init() {
    // Load settings
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }
    } catch (e) {
      console.warn('Could not load settings from storage', e);
    }

    // Load flights
    try {
      const savedFlights = localStorage.getItem(STORAGE_KEY);
      if (savedFlights) {
        this.flights = JSON.parse(savedFlights);
      } else {
        // First time initialization: populate with sample data
        this.flights = parseFlightradarCSV(SAMPLE_CSV);
        this.save();
      }
    } catch (e) {
      console.warn('Could not load flights from storage, loading default', e);
      this.flights = parseFlightradarCSV(SAMPLE_CSV);
      this.save();
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.flights, this.settings);
      } catch (e) {
        console.error('Error in store listener', e);
      }
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.flights));
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.error('Could not save to localStorage', e);
    }
    this.notify();
  }

  getFlights() {
    return this.flights;
  }

  getSettings() {
    return this.settings;
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.save();
  }

  addFlight(flight) {
    this.flights.unshift(flight);
    // Keep sorted by date
    this.flights.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.save();
  }

  updateFlight(id, updatedData) {
    const idx = this.flights.findIndex(f => f.id === id);
    if (idx !== -1) {
      this.flights[idx] = { ...this.flights[idx], ...updatedData };
      this.flights.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.save();
    }
  }

  deleteFlight(id) {
    this.flights = this.flights.filter(f => f.id !== id);
    this.save();
  }

  importFlights(newFlights, mode = 'replace') {
    if (mode === 'replace') {
      this.flights = newFlights;
    } else {
      // Merge mode
      const existingKeys = new Set(this.flights.map(f => `${f.date}_${f.flightNumber}_${f.fromCode}_${f.toCode}`));
      for (const nf of newFlights) {
        const key = `${nf.date}_${nf.flightNumber}_${nf.fromCode}_${nf.toCode}`;
        if (!existingKeys.has(key)) {
          this.flights.push(nf);
          existingKeys.add(key);
        }
      }
    }
    this.flights.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.save();
  }

  resetToSample() {
    this.flights = parseFlightradarCSV(SAMPLE_CSV);
    this.save();
  }

  clearAll() {
    this.flights = [];
    this.save();
  }
}

export const store = new FlightStore();
