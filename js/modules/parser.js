/**
 * Robust CSV & Flight Data Parser / Serializer for myflightradar24 format
 */
import { extractAirportCode, getAirport, calculateDistance } from '../data/airports.js';
import { extractAirlineCode, extractAircraftCode } from '../data/aircraft.js';

export const SEAT_TYPES = {
  0: "Unspecified",
  1: "Window",
  2: "Middle",
  3: "Aisle"
};

export const FLIGHT_CLASSES = {
  0: "Unspecified",
  1: "Economy",
  2: "Premium Economy",
  3: "Business",
  4: "First Class"
};

export const FLIGHT_REASONS = {
  0: "Other",
  1: "Leisure",
  2: "Business",
  3: "Crew / Non-rev"
};

/**
 * Parses CSV lines accurately handling quoted strings containing commas, quotes, and newlines.
 */
export function parseCSV(text) {
  const lines = [];
  let row = [];
  let inQuotes = false;
  let currentVal = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(currentVal.trim());
      currentVal = '';
      if (row.some(val => val.length > 0)) {
        lines.push(row);
      }
      row = [];
    } else {
      currentVal += char;
    }
  }

  if (currentVal.length > 0 || row.length > 0) {
    row.push(currentVal.trim());
    if (row.some(val => val.length > 0)) {
      lines.push(row);
    }
  }

  return lines;
}

/**
 * Calculates duration in minutes from HH:MM:SS or HH:MM string
 */
export function parseDurationMinutes(durationStr) {
  if (!durationStr) return 0;
  const parts = String(durationStr).trim().split(':').map(Number);
  if (parts.length >= 2) {
    const hours = parts[0] || 0;
    const minutes = parts[1] || 0;
    return hours * 60 + minutes;
  }
  return 0;
}

/**
 * Formats minutes to HH:MM format
 */
export function formatMinutes(mins) {
  if (!mins && mins !== 0) return "--:--";
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Formats minutes to human readable string (e.g. "9h 10m")
 */
export function formatMinutesHuman(mins) {
  if (!mins && mins !== 0) return "0m";
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Converts a raw CSV string to structured Flight objects
 */
export function parseFlightradarCSV(csvText) {
  const rows = parseCSV(csvText.trim());
  if (rows.length < 2) return [];

  // Parse header
  const header = rows[0].map(col => col.toLowerCase().replace(/['"]/g, '').trim());
  
  // Find column indexes
  const colIndex = {
    date: header.findIndex(h => h.includes('date')),
    flightNum: header.findIndex(h => h.includes('flight number') || h.includes('flight_number') || h === 'flight'),
    from: header.findIndex(h => h === 'from' || h.includes('origin') || h.includes('dep')),
    to: header.findIndex(h => h === 'to' || h.includes('dest') || h.includes('arr')),
    depTime: header.findIndex(h => h.includes('dep time') || h.includes('departure')),
    arrTime: header.findIndex(h => h.includes('arr time') || h.includes('arrival')),
    duration: header.findIndex(h => h.includes('duration') || h.includes('flight time')),
    airline: header.findIndex(h => h.includes('airline') || h.includes('carrier')),
    aircraft: header.findIndex(h => h.includes('aircraft') || h.includes('plane')),
    registration: header.findIndex(h => h.includes('registration') || h.includes('tail')),
    seatNum: header.findIndex(h => h.includes('seat number') || h.includes('seat_number') || h === 'seat'),
    seatType: header.findIndex(h => h.includes('seat type') || h.includes('seat_type')),
    flightClass: header.findIndex(h => h.includes('class')),
    flightReason: header.findIndex(h => h.includes('reason')),
    note: header.findIndex(h => h.includes('note') || h.includes('comment')),
    depId: header.findIndex(h => h.includes('dep_id')),
    arrId: header.findIndex(h => h.includes('arr_id')),
    airlineId: header.findIndex(h => h.includes('airline_id')),
    aircraftId: header.findIndex(h => h.includes('aircraft_id'))
  };

  const flights = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0 || row.every(val => !val)) continue;

    const fromRaw = colIndex.from !== -1 ? row[colIndex.from] : '';
    const toRaw = colIndex.to !== -1 ? row[colIndex.to] : '';
    if (!fromRaw && !toRaw) continue;

    const fromCode = extractAirportCode(fromRaw);
    const toCode = extractAirportCode(toRaw);

    const fromAirport = getAirport(fromCode);
    const toAirport = getAirport(toCode);

    // Calculate distance
    const dist = calculateDistance(
      fromAirport ? fromAirport.lat : 0,
      fromAirport ? fromAirport.lon : 0,
      toAirport ? toAirport.lat : 0,
      toAirport ? toAirport.lon : 0
    );

    const durationRaw = colIndex.duration !== -1 ? row[colIndex.duration] : '';
    let durationMins = parseDurationMinutes(durationRaw);
    
    // Fallback duration estimate based on distance if not provided (~800 km/h + 30 min taxi/climb)
    if (durationMins === 0 && dist.km > 0) {
      durationMins = Math.round((dist.km / 780) * 60 + 30);
    }

    const airlineRaw = colIndex.airline !== -1 ? row[colIndex.airline] : '';
    const aircraftRaw = colIndex.aircraft !== -1 ? row[colIndex.aircraft] : '';
    const dateStr = colIndex.date !== -1 ? row[colIndex.date] : '';
    const flightNum = colIndex.flightNum !== -1 ? row[colIndex.flightNum] : '';
    const registration = colIndex.registration !== -1 ? row[colIndex.registration] : '';
    const seatNumber = colIndex.seatNum !== -1 ? row[colIndex.seatNum] : '';
    const seatType = colIndex.seatType !== -1 ? parseInt(row[colIndex.seatType]) || 0 : 0;
    const flightClass = colIndex.flightClass !== -1 ? parseInt(row[colIndex.flightClass]) || 0 : 0;
    const flightReason = colIndex.flightReason !== -1 ? parseInt(row[colIndex.flightReason]) || 0 : 0;
    const note = colIndex.note !== -1 ? row[colIndex.note] : '';

    const flightObj = {
      id: `fl_${Date.now()}_${r}_${Math.random().toString(36).substr(2, 6)}`,
      date: dateStr,
      flightNumber: flightNum || "—",
      fromRaw: fromRaw,
      toRaw: toRaw,
      fromCode: fromCode,
      toCode: toCode,
      fromAirport: fromAirport,
      toAirport: toAirport,
      depTime: colIndex.depTime !== -1 ? row[colIndex.depTime] : '',
      arrTime: colIndex.arrTime !== -1 ? row[colIndex.arrTime] : '',
      durationRaw: durationRaw || formatMinutes(durationMins),
      durationMinutes: durationMins,
      distanceKm: dist.km,
      distanceMiles: dist.mi,
      distanceNm: dist.nm,
      airlineRaw: airlineRaw,
      airlineCode: extractAirlineCode(airlineRaw),
      aircraftRaw: aircraftRaw,
      aircraftCode: extractAircraftCode(aircraftRaw),
      registration: registration || "",
      seatNumber: seatNumber || "",
      seatType: seatType,
      seatTypeLabel: SEAT_TYPES[seatType] || "Unspecified",
      flightClass: flightClass,
      flightClassLabel: FLIGHT_CLASSES[flightClass] || "Unspecified",
      flightReason: flightReason,
      flightReasonLabel: FLIGHT_REASONS[flightReason] || "Other",
      note: note || "",
      depId: colIndex.depId !== -1 ? row[colIndex.depId] : '',
      arrId: colIndex.arrId !== -1 ? row[colIndex.arrId] : '',
      airlineId: colIndex.airlineId !== -1 ? row[colIndex.airlineId] : '',
      aircraftId: colIndex.aircraftId !== -1 ? row[colIndex.aircraftId] : '',
      isFuture: new Date(dateStr).getTime() > Date.now()
    };

    flights.push(flightObj);
  }

  // Sort chronologically by date descending by default
  flights.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return flights;
}

/**
 * Exports flights back to myflightradar24 standard CSV format
 */
export function exportToFlightradarCSV(flights) {
  const headers = [
    'Date',
    '"Flight number"',
    'From',
    'To',
    '"Dep time"',
    '"Arr time"',
    'Duration',
    'Airline',
    'Aircraft',
    'Registration',
    '"Seat number"',
    '"Seat type"',
    '"Flight class"',
    '"Flight reason"',
    'Note',
    'Dep_id',
    'Arr_id',
    'Airline_id',
    'Aircraft_id'
  ];

  const rows = [headers.join(',')];

  for (const f of flights) {
    const row = [
      f.date || '',
      f.flightNumber || '',
      `"${f.fromRaw || f.fromAirport?.name || f.fromCode}"`,
      `"${f.toRaw || f.toAirport?.name || f.toCode}"`,
      f.depTime || '',
      f.arrTime || '',
      f.durationRaw || '',
      `"${f.airlineRaw || ''}"`,
      `"${f.aircraftRaw || ''}"`,
      f.registration || '',
      f.seatNumber || '',
      f.seatType !== undefined ? f.seatType : 0,
      f.flightClass !== undefined ? f.flightClass : 0,
      f.flightReason !== undefined ? f.flightReason : 0,
      f.note ? `"${f.note.replace(/"/g, '""')}"` : '',
      f.depId || '',
      f.arrId || '',
      f.airlineId || '',
      f.aircraftId || ''
    ];
    rows.push(row.join(','));
  }

  return rows.join('\n');
}
