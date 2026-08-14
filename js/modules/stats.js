/**
 * Deep Flight Analytics & Statistical Aggregation Engine
 */
import { AIRLINES, AIRCRAFT_MODELS, getAircraftInfo } from '../data/aircraft.js';
import { formatMinutesHuman } from './parser.js';

export function calculateFlightStats(flights, unit = 'km') {
  if (!flights || flights.length === 0) {
    return getEmptyStats();
  }

  let totalDistKm = 0;
  let totalDistMiles = 0;
  let totalMinutes = 0;
  
  const airlinesMap = new Map();
  const pairsMap = new Map();
  const airportsMap = new Map();
  const countriesSet = new Set();
  const aircraftModelsMap = new Map();
  const aircraftCategoriesMap = { "Widebody": 0, "Narrowbody": 0, "Regional Jet": 0, "Other": 0 };
  const seatTypeMap = { 1: 0, 2: 0, 3: 0, 0: 0 };
  const flightClassMap = { 1: 0, 2: 0, 3: 0, 4: 0, 0: 0 };
  const flightReasonMap = { 1: 0, 2: 0, 3: 0, 0: 0 };
  const yearlyMap = new Map();
  const monthlyMap = Array(12).fill(0);
  const tailNumbersMap = new Map();

  let longestFlightDist = null;
  let shortestFlightDist = null;
  let longestFlightDur = null;

  for (const f of flights) {
    totalDistKm += f.distanceKm || 0;
    totalDistMiles += f.distanceMiles || 0;
    totalMinutes += f.durationMinutes || 0;

    // Extremes
    if (f.distanceKm > 0) {
      if (!longestFlightDist || f.distanceKm > longestFlightDist.distanceKm) longestFlightDist = f;
      if (!shortestFlightDist || f.distanceKm < shortestFlightDist.distanceKm) shortestFlightDist = f;
    }
    if (f.durationMinutes > 0) {
      if (!longestFlightDur || f.durationMinutes > longestFlightDur.durationMinutes) longestFlightDur = f;
    }

    // Airlines
    const airlineName = f.airlineRaw || "Unknown Airline";
    const airlineCode = f.airlineCode || "—";
    if (!airlinesMap.has(airlineName)) {
      airlinesMap.set(airlineName, {
        name: airlineName,
        code: airlineCode,
        count: 0,
        distanceKm: 0,
        distanceMiles: 0,
        durationMinutes: 0,
        color: (AIRLINES[airlineCode] && AIRLINES[airlineCode].color) || "#38bdf8"
      });
    }
    const aEntry = airlinesMap.get(airlineName);
    aEntry.count++;
    aEntry.distanceKm += f.distanceKm || 0;
    aEntry.distanceMiles += f.distanceMiles || 0;
    aEntry.durationMinutes += f.durationMinutes || 0;

    // Route Pairs (Bidirectional consolidation)
    if (f.fromCode && f.toCode) {
      const pairKey = [f.fromCode, f.toCode].sort().join(' ↔ ');
      if (!pairsMap.has(pairKey)) {
        pairsMap.set(pairKey, {
          pair: pairKey,
          from: [f.fromCode, f.toCode].sort()[0],
          to: [f.fromCode, f.toCode].sort()[1],
          fromAirport: f.fromAirport,
          toAirport: f.toAirport,
          count: 0,
          outbound: 0,
          inbound: 0,
          distanceKm: f.distanceKm || 0,
          distanceMiles: f.distanceMiles || 0
        });
      }
      const pEntry = pairsMap.get(pairKey);
      pEntry.count++;
      if (f.fromCode === pEntry.from) pEntry.outbound++;
      else pEntry.inbound++;

      // Airports & Countries
      trackAirport(airportsMap, f.fromCode, f.fromAirport, 'departure');
      trackAirport(airportsMap, f.toCode, f.toAirport, 'arrival');
      if (f.fromAirport && f.fromAirport.country) countriesSet.add(f.fromAirport.country);
      if (f.toAirport && f.toAirport.country) countriesSet.add(f.toAirport.country);
    }

    // Aircraft Types & Categories
    const acInfo = getAircraftInfo(f.aircraftRaw);
    const modelName = acInfo.name || f.aircraftRaw || "Unspecified";
    if (!aircraftModelsMap.has(modelName)) {
      aircraftModelsMap.set(modelName, {
        name: modelName,
        code: acInfo.code || f.aircraftCode || "—",
        category: acInfo.category || "Commercial Jet",
        count: 0
      });
    }
    aircraftModelsMap.get(modelName).count++;

    // Category aggregation
    if (acInfo.category && acInfo.category.includes("Widebody")) aircraftCategoriesMap["Widebody"]++;
    else if (acInfo.category && acInfo.category.includes("Narrowbody")) aircraftCategoriesMap["Narrowbody"]++;
    else if (acInfo.category && acInfo.category.includes("Regional")) aircraftCategoriesMap["Regional Jet"]++;
    else aircraftCategoriesMap["Other"]++;

    // Tail registrations
    if (f.registration) {
      const reg = f.registration.trim().toUpperCase();
      if (!tailNumbersMap.has(reg)) {
        tailNumbersMap.set(reg, { registration: reg, count: 0, aircraft: f.aircraftRaw, airline: f.airlineRaw });
      }
      tailNumbersMap.get(reg).count++;
    }

    // Cabin Class & Seat Type & Reason
    if (f.seatType !== undefined && seatTypeMap[f.seatType] !== undefined) seatTypeMap[f.seatType]++;
    if (f.flightClass !== undefined && flightClassMap[f.flightClass] !== undefined) flightClassMap[f.flightClass]++;
    if (f.flightReason !== undefined && flightReasonMap[f.flightReason] !== undefined) flightReasonMap[f.flightReason]++;

    // Yearly & Monthly Breakdown
    if (f.date) {
      const d = new Date(f.date);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        if (!yearlyMap.has(year)) {
          yearlyMap.set(year, { year, count: 0, distanceKm: 0, distanceMiles: 0, minutes: 0 });
        }
        const yEntry = yearlyMap.get(year);
        yEntry.count++;
        yEntry.distanceKm += f.distanceKm || 0;
        yEntry.distanceMiles += f.distanceMiles || 0;
        yEntry.minutes += f.durationMinutes || 0;

        const month = d.getMonth();
        monthlyMap[month]++;
      }
    }
  }

  // Convert and sort top lists
  const topAirlines = Array.from(airlinesMap.values())
    .sort((a, b) => b.count - a.count);

  const topPairs = Array.from(pairsMap.values())
    .sort((a, b) => b.count - a.count);

  const topAirports = Array.from(airportsMap.values())
    .sort((a, b) => b.total - a.total);

  const topAircraft = Array.from(aircraftModelsMap.values())
    .sort((a, b) => b.count - a.count);

  const topRegistrations = Array.from(tailNumbersMap.values())
    .sort((a, b) => b.count - a.count);

  const yearlyTimeline = Array.from(yearlyMap.values())
    .sort((a, b) => a.year - b.year);

  // Time formatting
  const totalDays = (totalMinutes / (60 * 24)).toFixed(1);
  const totalHours = Math.floor(totalMinutes / 60);
  const remMinutes = totalMinutes % 60;

  // Earth and Moon equivalents
  const earthCircumferences = (totalDistKm / 40075).toFixed(2);
  const moonDistancePercent = ((totalDistKm / 384400) * 100).toFixed(1);

  return {
    totalFlights: flights.length,
    totalDistanceKm: totalDistKm,
    totalDistanceMiles: totalDistMiles,
    totalAirMinutes: totalMinutes,
    totalAirTimeFormatted: `${totalHours}h ${remMinutes}m (${totalDays} days)`,
    earthCircumferences,
    moonDistancePercent,
    uniqueAirportsCount: airportsMap.size,
    uniqueAirlinesCount: airlinesMap.size,
    uniqueAircraftCount: aircraftModelsMap.size,
    uniqueCountriesCount: countriesSet.size,
    uniquePlanesCount: tailNumbersMap.size,
    topAirlines,
    topPairs,
    topAirports,
    topAircraft,
    topRegistrations,
    aircraftCategories: aircraftCategoriesMap,
    seatTypes: seatTypeMap,
    flightClasses: flightClassMap,
    flightReasons: flightReasonMap,
    yearlyTimeline,
    monthlyDistribution: monthlyMap,
    longestFlightDist,
    shortestFlightDist,
    longestFlightDur
  };
}

function trackAirport(map, code, airportObj, type) {
  if (!code) return;
  if (!map.has(code)) {
    map.set(code, {
      code,
      name: airportObj ? airportObj.name : code,
      city: airportObj ? airportObj.city : code,
      country: airportObj ? airportObj.country : "Unknown",
      countryCode: airportObj ? airportObj.countryCode : "??",
      departures: 0,
      arrivals: 0,
      total: 0
    });
  }
  const entry = map.get(code);
  if (type === 'departure') entry.departures++;
  if (type === 'arrival') entry.arrivals++;
  entry.total++;
}

function getEmptyStats() {
  return {
    totalFlights: 0,
    totalDistanceKm: 0,
    totalDistanceMiles: 0,
    totalAirMinutes: 0,
    totalAirTimeFormatted: "0h 0m",
    earthCircumferences: "0",
    moonDistancePercent: "0",
    uniqueAirportsCount: 0,
    uniqueAirlinesCount: 0,
    uniqueAircraftCount: 0,
    uniqueCountriesCount: 0,
    uniquePlanesCount: 0,
    topAirlines: [],
    topPairs: [],
    topAirports: [],
    topAircraft: [],
    topRegistrations: [],
    aircraftCategories: { "Widebody": 0, "Narrowbody": 0, "Regional Jet": 0, "Other": 0 },
    seatTypes: { 1: 0, 2: 0, 3: 0, 0: 0 },
    flightClasses: { 1: 0, 2: 0, 3: 0, 4: 0, 0: 0 },
    flightReasons: { 1: 0, 2: 0, 3: 0, 0: 0 },
    yearlyTimeline: [],
    monthlyDistribution: Array(12).fill(0),
    longestFlightDist: null,
    shortestFlightDist: null,
    longestFlightDur: null
  };
}
