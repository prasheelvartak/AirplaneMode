/**
 * Smart Ingestion Engine for AirplaneMode
 * Parses raw confirmation email text, PDF e-tickets, and screenshot images (PNG/JPEG)
 * into structured flight records with instant preview & logbook import.
 */

import { lookupFlightSchedule } from '../data/flightSchedules.js';
import { getAirport, calculateDistance } from '../data/airports.js';
import { AIRLINES, extractAirlineCode, extractAircraftCode } from '../data/aircraft.js';
import { SEAT_TYPES, FLIGHT_CLASSES, FLIGHT_REASONS, parseDurationMinutes, formatMinutes } from './parser.js';

export class SmartIngestEngine {
  constructor(store, app) {
    this.store = store;
    this.app = app;
    this.extractedFlights = [];
    this.geminiApiKey = localStorage.getItem('airplanemode_gemini_key') || '';
  }

  setApiKey(key) {
    this.geminiApiKey = key.trim();
    if (this.geminiApiKey) {
      localStorage.setItem('airplanemode_gemini_key', this.geminiApiKey);
    } else {
      localStorage.removeItem('airplanemode_gemini_key');
    }
  }

  getApiKey() {
    return this.geminiApiKey || localStorage.getItem('airplanemode_gemini_key') || '';
  }

  /**
   * Parse Raw Pasted Text / Email confirmation
   */
  async parseText(rawText) {
    if (!rawText || rawText.trim().length === 0) {
      throw new Error('Please paste your flight confirmation or booking email text.');
    }

    const key = this.getApiKey();
    if (key) {
      try {
        return await this.parseWithGeminiAI(rawText, null);
      } catch (err) {
        console.warn('Gemini AI parse failed, falling back to heuristic regex parser:', err);
        return this.parseWithHeuristics(rawText);
      }
    } else {
      return this.parseWithHeuristics(rawText);
    }
  }

  /**
   * Parse an uploaded Image file (Screenshot PNG/JPEG)
   */
  async parseImageFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result;
        const mime = file.type && file.type.startsWith('image/') ? file.type : 'image/jpeg';

        // 1. Try Vercel Serverless Function /api/extract first
        try {
          const srvRes = await fetch('/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64Data, mimeType: mime })
          });
          if (srvRes.ok) {
            const data = await srvRes.json();
            if (data.flights && data.flights.length > 0) {
              resolve(this.normalizeExtractedFlights(data.flights));
              return;
            }
          }
        } catch (e) {
          // Server endpoint not available, fallback to client-side
        }

        // 2. Try User's Client-Side Gemini Key (if configured)
        const key = this.getApiKey();
        if (key) {
          try {
            const flights = await this.parseWithGeminiAI(null, { mimeType: mime, dataUrl: base64Data });
            resolve(flights);
            return;
          } catch (err) {
            console.warn('Client Gemini AI parse failed, falling back to in-browser OCR:', err);
          }
        }

        // 3. In-Browser Zero-Key Optical OCR (Tesseract WebAssembly)
        if (window.Tesseract) {
          try {
            const ocrResult = await window.Tesseract.recognize(base64Data, 'eng');
            const ocrText = ocrResult?.data?.text || '';
            if (ocrText.trim().length > 0) {
              const flights = this.parseWithHeuristics(ocrText);
              resolve(flights);
              return;
            }
          } catch (ocrErr) {
            console.warn('Tesseract OCR error:', ocrErr);
          }
        }

        if (!key) {
          reject(new Error('API_KEY_REQUIRED'));
        } else {
          reject(new Error('Could not detect flight details from this screenshot.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Parse an uploaded PDF file (E-ticket / Boarding pass)
   */
  async parsePdfFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const textContent = reader.result;
        const cleanText = textContent.replace(/[^\x20-\x7E\n\r]/g, ' ');

        // 1. Try Vercel Serverless Function
        try {
          const srvRes = await fetch('/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: cleanText })
          });
          if (srvRes.ok) {
            const data = await srvRes.json();
            if (data.flights && data.flights.length > 0) {
              resolve(this.normalizeExtractedFlights(data.flights));
              return;
            }
          }
        } catch (e) {}

        // 2. Try User's Client Gemini Key
        const key = this.getApiKey();
        if (key) {
          try {
            const flights = await this.parseWithGeminiAI(cleanText, null);
            resolve(flights);
            return;
          } catch (e) {
            resolve(this.parseWithHeuristics(cleanText));
            return;
          }
        }

        // 3. Fast Heuristic Parser
        try {
          resolve(this.parseWithHeuristics(cleanText));
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read PDF file.'));
      reader.readAsBinaryString(file);
    });
  }

  /**
   * Call Gemini API with dynamic model discovery & robust fallbacks
   */
  async parseWithGeminiAI(textPrompt, imageObj) {
    const key = this.getApiKey();
    if (!key) throw new Error('No Gemini API key provided');

    // Dynamically discover supported models or try modern flash tier
    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-3.6-flash',
      'gemini-3.7-flash',
      'gemini-flash-latest',
      'gemini-2.0-flash',
      'gemini-pro-latest'
    ];

    const parts = [];
    const systemPrompt = `
      You are an expert flight itinerary and boarding pass parser.
      Extract ALL flight segments from the provided text or image into a clean JSON array.
      Schema for each flight segment:
      {
        "date": "YYYY-MM-DD",
        "flightNumber": "e.g. AA50, BA139, 6E2113",
        "fromCode": "3-letter IATA code e.g. DFW, LHR, JFK",
        "toCode": "3-letter IATA code e.g. LHR, BOM, LAX",
        "depTime": "HH:MM:SS or HH:MM",
        "arrTime": "HH:MM:SS or HH:MM",
        "duration": "HH:MM:SS (optional)",
        "airline": "Airline name e.g. American Airlines",
        "aircraft": "Aircraft model if mentioned e.g. Boeing 777-300ER",
        "seat": "Seat number e.g. 17A (optional)",
        "flightClass": "Economy, Business, First, or Premium Economy",
        "note": "Any confirmation reference e.g. PNR: XYZ123"
      }
      Return ONLY a JSON array of flight objects: [{"date": ...}, ...]
    `;

    if (imageObj) {
      const base64Pure = imageObj.dataUrl.split(',')[1];
      parts.push({
        inline_data: {
          mime_type: imageObj.mimeType || 'image/jpeg',
          data: base64Pure
        }
      });
      parts.push({ text: systemPrompt + "\nExtract flight details from this boarding pass/booking screenshot." });
    } else {
      parts.push({ text: systemPrompt + "\nInput Text:\n" + textPrompt });
    }

    let lastErr = null;
    for (const model of candidateModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });

        const data = await res.json();
        if (res.ok && data.candidates && data.candidates.length > 0) {
          let raw = data.candidates[0].content.parts[0].text.trim();
          if (raw.startsWith('```')) {
            raw = raw.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/i, '').trim();
          }
          const parsed = JSON.parse(raw);
          const flightList = Array.isArray(parsed) ? parsed : (parsed.flights || [parsed]);
          return this.normalizeExtractedFlights(flightList);
        } else {
          lastErr = data.error?.message || `HTTP ${res.status}`;
        }
      } catch (err) {
        lastErr = err.message;
      }
    }

    throw new Error(lastErr || 'Could not parse flight details with Gemini AI.');
  }

  /**
   * Fast Local Heuristic Regex Parser (Works 100% offline with zero API key)
   */
  parseWithHeuristics(text) {
    const flights = [];
    const lines = text.split('\n');

    // Regex patterns
    const flightNumRegex = /\b([A-Z0-9]{2})\s*([0-9]{1,4})\b/g;
    const iataRegex = /\b([A-Z]{3})\b/g;
    const dateRegex = /\b(20\d{2}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+20\d{2})\b/gi;
    const timeRegex = /\b([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?\b/g;
    const seatRegex = /\b([0-9]{1,2}[A-K])\b/i;

    // Find all flight numbers
    let fnMatch;
    const foundFlightNumbers = [];
    while ((fnMatch = flightNumRegex.exec(text)) !== null) {
      const full = `${fnMatch[1]}${fnMatch[2]}`;
      if (!['PM', 'AM', 'OK', 'NO', 'US', 'UK', 'ID'].includes(fnMatch[1])) {
        foundFlightNumbers.push(full);
      }
    }

    // Find all 3-letter IATA candidates
    const iataCandidates = [];
    let iMatch;
    while ((iMatch = iataRegex.exec(text)) !== null) {
      const code = iMatch[1];
      if (getAirport(code)) {
        iataCandidates.push(code);
      }
    }

    // Dates
    const dates = [];
    let dMatch;
    while ((dMatch = dateRegex.exec(text)) !== null) {
      try {
        const d = new Date(dMatch[1]);
        if (!isNaN(d.getTime())) {
          dates.push(d.toISOString().split('T')[0]);
        }
      } catch (e) {}
    }

    // Seat
    const sMatch = text.match(seatRegex);
    const seat = sMatch ? sMatch[1].toUpperCase() : '';

    if (foundFlightNumbers.length > 0) {
      for (let i = 0; i < foundFlightNumbers.length; i++) {
        const fn = foundFlightNumbers[i];
        const schedule = lookupFlightSchedule(fn);
        
        let fromCode = iataCandidates[i * 2] || schedule?.from || 'DFW';
        let toCode = iataCandidates[i * 2 + 1] || schedule?.to || 'LHR';
        let date = dates[i] || dates[0] || new Date().toISOString().split('T')[0];

        flights.push({
          date,
          flightNumber: fn,
          fromCode,
          toCode,
          depTime: schedule?.depTime || '12:00:00',
          arrTime: schedule?.arrTime || '18:00:00',
          duration: schedule?.duration || '06:00:00',
          airline: schedule?.airline || (AIRLINES[fn.slice(0, 2)] ? AIRLINES[fn.slice(0, 2)].name : 'Commercial Airline'),
          aircraft: schedule?.aircraft || 'Boeing 777 / Airbus A350',
          seat: seat || '12A',
          flightClass: 'Economy',
          note: 'Imported via Smart Import'
        });
      }
    } else if (iataCandidates.length >= 2) {
      // Found airports but no clear flight number
      flights.push({
        date: dates[0] || new Date().toISOString().split('T')[0],
        flightNumber: 'FL' + Math.floor(100 + Math.random() * 900),
        fromCode: iataCandidates[0],
        toCode: iataCandidates[1],
        depTime: '12:00:00',
        arrTime: '16:00:00',
        duration: '04:00:00',
        airline: 'Commercial Flight',
        aircraft: 'Airbus A320',
        seat: seat || '',
        flightClass: 'Economy',
        note: 'Imported via Smart Import'
      });
    }

    if (flights.length === 0) {
      throw new Error('Could not detect flight numbers or airport codes in the pasted text. Please check the content or enter your Gemini API key for deep extraction.');
    }

    return this.normalizeExtractedFlights(flights);
  }

  /**
   * Normalize and enhance extracted flight segments with coordinates, distances, and airport metadata
   */
  normalizeExtractedFlights(flights) {
    return flights.map((f, idx) => {
      const fromCode = (f.fromCode || 'DFW').toUpperCase().trim();
      const toCode = (f.toCode || 'LHR').toUpperCase().trim();
      const fromAp = getAirport(fromCode) || { code: fromCode, name: fromCode, city: fromCode, country: '', countryCode: '', lat: 0, lon: 0 };
      const toAp = getAirport(toCode) || { code: toCode, name: toCode, city: toCode, country: '', countryCode: '', lat: 0, lon: 0 };
      
      let distKm = 0;
      let distMi = 0;
      let distNm = 0;
      if (fromAp.lat && toAp.lat) {
        const d = calculateDistance(fromAp.lat, fromAp.lon, toAp.lat, toAp.lon);
        distKm = d.km;
        distMi = d.mi;
        distNm = d.nm;
      } else {
        distKm = f.distanceKm || 3500;
        distMi = Math.round(distKm * 0.621371);
        distNm = Math.round(distKm * 0.539957);
      }

      // Duration calculation
      let durationRaw = f.duration || f.durationRaw || '';
      let durationMins = parseDurationMinutes(durationRaw);
      if (durationMins === 0 && distKm > 0) {
        durationMins = Math.round((distKm / 780) * 60 + 30);
        durationRaw = formatMinutes(durationMins);
      }

      // Class mapping
      let flightClassNum = 1;
      const fc = String(f.flightClass || '').toLowerCase();
      if (fc.includes('4') || fc.includes('first')) flightClassNum = 4;
      else if (fc.includes('3') || fc.includes('biz') || fc.includes('business')) flightClassNum = 3;
      else if (fc.includes('2') || fc.includes('prem')) flightClassNum = 2;
      else if (fc.includes('1') || fc.includes('eco')) flightClassNum = 1;

      const flightNum = (f.flightNumber || 'FL' + Math.floor(100 + Math.random() * 900)).toUpperCase().replace(/\s+/g, '');
      const airlineCode = extractAirlineCode(f.airline || flightNum.slice(0, 2)) || flightNum.slice(0, 2);
      const airlineRaw = f.airline || (AIRLINES[airlineCode] ? AIRLINES[airlineCode].name : 'Commercial Airline');
      const aircraftRaw = f.aircraft || f.aircraftRaw || 'Airbus A320 / Boeing 737';
      const aircraftCode = extractAircraftCode(aircraftRaw);

      const seatNum = f.seat || f.seatNumber || '';
      let seatType = 0;
      if (seatNum) {
        const lastChar = seatNum.slice(-1).toUpperCase();
        if (['A', 'F', 'K'].includes(lastChar)) seatType = 1; // Window
        else if (['B', 'E', 'J'].includes(lastChar)) seatType = 2; // Middle
        else if (['C', 'D', 'G', 'H'].includes(lastChar)) seatType = 3; // Aisle
      }

      const dateStr = f.date || new Date().toISOString().split('T')[0];

      return {
        id: `fl_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 6)}`,
        date: dateStr,
        flightNumber: flightNum,
        fromRaw: fromAp.city ? `${fromAp.city} (${fromCode})` : fromCode,
        toRaw: toAp.city ? `${toAp.city} (${toCode})` : toCode,
        fromCode: fromCode,
        toCode: toCode,
        fromAirport: fromAp,
        toAirport: toAp,
        depTime: f.depTime || '10:00:00',
        arrTime: f.arrTime || '18:00:00',
        durationRaw: durationRaw,
        durationMinutes: durationMins,
        distanceKm: Math.round(distKm),
        distanceMiles: Math.round(distMi),
        distanceNm: Math.round(distNm),
        airlineRaw: airlineRaw,
        airlineCode: airlineCode,
        aircraftRaw: aircraftRaw,
        aircraftCode: aircraftCode,
        registration: f.registration || '',
        seatNumber: seatNum,
        seatType: seatType,
        seatTypeLabel: SEAT_TYPES[seatType] || "Unspecified",
        flightClass: flightClassNum,
        flightClassLabel: FLIGHT_CLASSES[flightClassNum] || "Economy",
        flightReason: 1,
        flightReasonLabel: FLIGHT_REASONS[1] || "Leisure",
        note: f.note || 'Imported via Smart Import',
        isFuture: new Date(dateStr).getTime() > Date.now()
      };
    });
  }

  /**
   * Commit confirmed extracted flights to the active FlightStore
   */
  importFlights(flightsToImport) {
    if (!flightsToImport || flightsToImport.length === 0) return 0;
    const currentFlights = this.store.getFlights();
    const updated = [...flightsToImport, ...currentFlights];
    this.store.setFlights(updated);
    return flightsToImport.length;
  }
}
