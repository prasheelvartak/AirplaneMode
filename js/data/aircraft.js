/**
 * Aircraft & Airline Specifications & Registration Registry
 */

export const AIRCRAFT_MODELS = {
  // --- Boeing Widebody ---
  "B77W": { name: "Boeing 777-300ER", manufacturer: "Boeing", category: "Widebody", engines: "2x GE90-115B", rangeKm: 13650, cruiseKnots: 490, typicalSeats: "300 - 396" },
  "B772": { name: "Boeing 777-200", manufacturer: "Boeing", category: "Widebody", engines: "2x GE90 / PW4000 / Trent 800", rangeKm: 9700, cruiseKnots: 490, typicalSeats: "280 - 312" },
  "B77E": { name: "Boeing 777-200ER", manufacturer: "Boeing", category: "Widebody", engines: "2x GE90-94B / Trent 895", rangeKm: 13080, cruiseKnots: 490, typicalSeats: "280 - 314" },
  "B773": { name: "Boeing 777-300", manufacturer: "Boeing", category: "Widebody", engines: "2x Trent 892 / PW4098", rangeKm: 11135, cruiseKnots: 490, typicalSeats: "300 - 368" },
  "B777": { name: "Boeing 777 Family", manufacturer: "Boeing", category: "Widebody", engines: "2x High-bypass Turbofan", rangeKm: 12000, cruiseKnots: 490, typicalSeats: "300 - 350" },
  "B788": { name: "Boeing 787-8 Dreamliner", manufacturer: "Boeing", category: "Widebody", engines: "2x GEnx-1B / Trent 1000", rangeKm: 13620, cruiseKnots: 488, typicalSeats: "214 - 250" },
  "B789": { name: "Boeing 787-9 Dreamliner", manufacturer: "Boeing", category: "Widebody", engines: "2x GEnx-1B / Trent 1000", rangeKm: 14140, cruiseKnots: 488, typicalSeats: "280 - 296" },
  "B78X": { name: "Boeing 787-10 Dreamliner", manufacturer: "Boeing", category: "Widebody", engines: "2x GEnx-1B / Trent 1000", rangeKm: 11910, cruiseKnots: 488, typicalSeats: "330 - 360" },
  "B744": { name: "Boeing 747-400", manufacturer: "Boeing", category: "Widebody", engines: "4x CF6-80C2 / RB211", rangeKm: 13450, cruiseKnots: 493, typicalSeats: "416 - 524" },
  "B763": { name: "Boeing 767-300ER", manufacturer: "Boeing", category: "Widebody", engines: "2x CF6-80C2 / PW4060", rangeKm: 11070, cruiseKnots: 470, typicalSeats: "218 - 269" },

  // --- Boeing Narrowbody ---
  "B738": { name: "Boeing 737-800", manufacturer: "Boeing", category: "Narrowbody", engines: "2x CFM56-7B", rangeKm: 5765, cruiseKnots: 453, typicalSeats: "160 - 189" },
  "B739": { name: "Boeing 737-900", manufacturer: "Boeing", category: "Narrowbody", engines: "2x CFM56-7B", rangeKm: 5460, cruiseKnots: 453, typicalSeats: "177 - 204" },
  "B38M": { name: "Boeing 737 MAX 8", manufacturer: "Boeing", category: "Narrowbody", engines: "2x CFM LEAP-1B", rangeKm: 6570, cruiseKnots: 453, typicalSeats: "162 - 189" },
  "B39M": { name: "Boeing 737 MAX 9", manufacturer: "Boeing", category: "Narrowbody", engines: "2x CFM LEAP-1B", rangeKm: 6570, cruiseKnots: 453, typicalSeats: "178 - 220" },
  "B73X": { name: "Boeing 737 Family", manufacturer: "Boeing", category: "Narrowbody", engines: "2x Turbofan", rangeKm: 5500, cruiseKnots: 450, typicalSeats: "150 - 189" },

  // --- Airbus Widebody ---
  "A380": { name: "Airbus A380-800", manufacturer: "Airbus", category: "Widebody (Superjumbo)", engines: "4x Trent 900 / GP7200", rangeKm: 14800, cruiseKnots: 487, typicalSeats: "450 - 615" },
  "A35K": { name: "Airbus A350-1000", manufacturer: "Airbus", category: "Widebody", engines: "2x Trent XWB-97", rangeKm: 16100, cruiseKnots: 488, typicalSeats: "350 - 410" },
  "A359": { name: "Airbus A350-900", manufacturer: "Airbus", category: "Widebody", engines: "2x Trent XWB-84", rangeKm: 15000, cruiseKnots: 488, typicalSeats: "300 - 350" },
  "A333": { name: "Airbus A330-300", manufacturer: "Airbus", category: "Widebody", engines: "2x Trent 700 / CF6-80E1", rangeKm: 11750, cruiseKnots: 470, typicalSeats: "277 - 375" },
  "A339": { name: "Airbus A330-900neo", manufacturer: "Airbus", category: "Widebody", engines: "2x Trent 7000", rangeKm: 13334, cruiseKnots: 470, typicalSeats: "287 - 310" },

  // --- Airbus Narrowbody ---
  "A321": { name: "Airbus A321-200", manufacturer: "Airbus", category: "Narrowbody", engines: "2x CFM56-5B / V2500", rangeKm: 5950, cruiseKnots: 447, typicalSeats: "185 - 220" },
  "A21N": { name: "Airbus A321neo / A321LR", manufacturer: "Airbus", category: "Narrowbody", engines: "2x CFM LEAP-1A / PW1100G", rangeKm: 7400, cruiseKnots: 447, typicalSeats: "180 - 240" },
  "A320": { name: "Airbus A320-200", manufacturer: "Airbus", category: "Narrowbody", engines: "2x CFM56-5B / V2500", rangeKm: 6100, cruiseKnots: 447, typicalSeats: "150 - 180" },
  "A20N": { name: "Airbus A320neo", manufacturer: "Airbus", category: "Narrowbody", engines: "2x CFM LEAP-1A / PW1100G", rangeKm: 6500, cruiseKnots: 447, typicalSeats: "150 - 186" },
  "A319": { name: "Airbus A319", manufacturer: "Airbus", category: "Narrowbody", engines: "2x CFM56-5B / V2500", rangeKm: 6950, cruiseKnots: 447, typicalSeats: "124 - 156" },
  "A19N": { name: "Airbus A319neo", manufacturer: "Airbus", category: "Narrowbody", engines: "2x CFM LEAP-1A / PW1100G", rangeKm: 6850, cruiseKnots: 447, typicalSeats: "140 - 160" },
  "BCS1": { name: "Airbus A220-100", manufacturer: "Airbus (Bombardier)", category: "Narrowbody", engines: "2x PW1500G", rangeKm: 6390, cruiseKnots: 447, typicalSeats: "100 - 120" },
  "BCS3": { name: "Airbus A220-300", manufacturer: "Airbus (Bombardier)", category: "Narrowbody", engines: "2x PW1500G", rangeKm: 6297, cruiseKnots: 447, typicalSeats: "130 - 160" },

  // --- Regional Jets ---
  "CRJ7": { name: "Bombardier CRJ-700", manufacturer: "Bombardier / MHI", category: "Regional Jet", engines: "2x CF34-8C5", rangeKm: 2796, cruiseKnots: 447, typicalSeats: "65 - 78" },
  "CRJ9": { name: "Bombardier CRJ-900", manufacturer: "Bombardier / MHI", category: "Regional Jet", engines: "2x CF34-8C5", rangeKm: 2876, cruiseKnots: 447, typicalSeats: "76 - 90" },
  "E145": { name: "Embraer ERJ-145", manufacturer: "Embraer", category: "Regional Jet", engines: "2x AE 3007", rangeKm: 2870, cruiseKnots: 447, typicalSeats: "50" },
  "E190": { name: "Embraer ERJ-190", manufacturer: "Embraer", category: "Regional Jet", engines: "2x GE CF34-10E", rangeKm: 4445, cruiseKnots: 447, typicalSeats: "96 - 114" },
  "E75L": { name: "Embraer 175 (Enhanced)", manufacturer: "Embraer", category: "Regional Jet", engines: "2x GE CF34-8E", rangeKm: 3982, cruiseKnots: 447, typicalSeats: "76" },
  "E75S": { name: "Embraer 175 (Standard)", manufacturer: "Embraer", category: "Regional Jet", engines: "2x GE CF34-8E", rangeKm: 3982, cruiseKnots: 447, typicalSeats: "76" }
};

/**
 * Registration Tail Database (prepopulated with planes from user flights)
 */
export const KNOWN_REGISTRATIONS = {
  "N722AN": { model: "Boeing 777-323(ER)", airline: "American Airlines", msn: "31548", deliveryDate: "2013-05-10", ageYears: 13, config: "F8 J52 W28 Y216" },
  "N721AN": { model: "Boeing 777-323(ER)", airline: "American Airlines", msn: "31547", deliveryDate: "2013-04-18", ageYears: 13, config: "F8 J52 W28 Y216" },
  "N723AN": { model: "Boeing 777-323(ER)", airline: "American Airlines", msn: "31549", deliveryDate: "2013-06-25", ageYears: 13, config: "F8 J52 W28 Y216" },
  "N725AN": { model: "Boeing 777-323(ER)", airline: "American Airlines", msn: "31551", deliveryDate: "2013-11-20", ageYears: 12, config: "F8 J52 W28 Y216" },
  "N729AN": { model: "Boeing 777-323(ER)", airline: "American Airlines", msn: "31555", deliveryDate: "2014-04-30", ageYears: 12, config: "F8 J52 W28 Y216" },
  "N845MD": { model: "Boeing 787-9 Dreamliner", airline: "American Airlines", msn: "66009", deliveryDate: "2020-01-15", ageYears: 6, config: "J30 W21 Y234" },
  "N145AN": { model: "Airbus A321-231", airline: "American Airlines", msn: "6472", deliveryDate: "2015-02-12", ageYears: 11, config: "F20 Y170" },
  "N902AA": { model: "Airbus A321-231", airline: "American Airlines", msn: "5822", deliveryDate: "2013-11-05", ageYears: 12, config: "F20 Y170" },
  "N917UY": { model: "Airbus A321-211", airline: "American Airlines", msn: "6256", deliveryDate: "2014-09-17", ageYears: 11, config: "F20 Y170" },
  "N579UW": { model: "Airbus A321-211", airline: "American Airlines", msn: "5995", deliveryDate: "2014-03-28", ageYears: 12, config: "F20 Y170" },
  "N962AN": { model: "Boeing 737-823", airline: "American Airlines", msn: "31162", deliveryDate: "2015-08-10", ageYears: 11, config: "F16 Y156" },
  "N996NN": { model: "Boeing 737-823", airline: "American Airlines", msn: "33240", deliveryDate: "2016-04-20", ageYears: 10, config: "F16 Y156" },
  "N8674B": { model: "Boeing 737-8H4", airline: "Southwest Airlines", msn: "36968", deliveryDate: "2016-01-14", ageYears: 10, config: "Y175" },
  "N301NB": { model: "Airbus A319-114", airline: "Delta Air Lines", msn: "986", deliveryDate: "1999-05-27", ageYears: 27, config: "F12 W18 Y102" },
  "G-LCAA": { model: "Embraer ERJ-190SR", airline: "British Airways (BA CityFlyer)", msn: "19000301", deliveryDate: "2009-10-09", ageYears: 16, config: "Y98" },
  "G-LCYZ": { model: "Embraer ERJ-190SR", airline: "British Airways (BA CityFlyer)", msn: "19000632", deliveryDate: "2013-05-30", ageYears: 13, config: "Y98" },
  "G-YMMJ": { model: "Boeing 777-236(ER)", airline: "British Airways", msn: "30311", deliveryDate: "2001-04-12", ageYears: 25, config: "Club Suites / W / Y" },
  "VT-TQN": { model: "Airbus A320-251N (neo)", airline: "Vistara", msn: "9130", deliveryDate: "2019-09-24", ageYears: 6, config: "J8 W24 Y132" }
};

/**
 * Extracts clean aircraft code from string e.g. "Boeing 777-300ER (B77W)" -> "B77W"
 */
export function extractAircraftCode(aircraftStr) {
  if (!aircraftStr) return "";
  const str = String(aircraftStr).trim();
  const match = str.match(/\(([A-Z0-9]{3,4})\)/i);
  if (match) return match[1].toUpperCase();
  
  if (/^[A-Z0-9]{3,4}$/i.test(str)) {
    return str.toUpperCase();
  }
  
  for (const [code, info] of Object.entries(AIRCRAFT_MODELS)) {
    if (str.toLowerCase().includes(info.name.toLowerCase())) return code;
  }
  return str;
}

/**
 * Returns aircraft model metadata
 */
export function getAircraftInfo(aircraftStr) {
  const code = extractAircraftCode(aircraftStr);
  if (AIRCRAFT_MODELS[code]) {
    return { ...AIRCRAFT_MODELS[code], code };
  }
  return {
    code: code || "UNK",
    name: aircraftStr || "Unspecified Aircraft",
    manufacturer: "Various",
    category: "Commercial Jet",
    engines: "Turbofan",
    rangeKm: 5000,
    cruiseKnots: 450,
    typicalSeats: "N/A"
  };
}

/**
 * Airline brand colors and names
 */
export const AIRLINES = {
  "AA": { name: "American Airlines", color: "#0078d2", logoBg: "#0078d2", flag: "🇺🇸" },
  "BA": { name: "British Airways", color: "#eb2226", logoBg: "#075aaa", flag: "🇬🇧" },
  "VS": { name: "Virgin Atlantic", color: "#e10a0a", logoBg: "#c40000", flag: "🇬🇧" },
  "6E": { name: "IndiGo", color: "#002060", logoBg: "#002b80", flag: "🇮🇳" },
  "AI": { name: "Air India", color: "#d9232a", logoBg: "#b31b21", flag: "🇮🇳" },
  "UK": { name: "Vistara", color: "#4f1636", logoBg: "#4f1636", flag: "🇮🇳" },
  "FR": { name: "Ryanair", color: "#003580", logoBg: "#003580", flag: "🇮🇪" },
  "WN": { name: "Southwest Airlines", color: "#304cb2", logoBg: "#d99b26", flag: "🇺🇸" },
  "DL": { name: "Delta Air Lines", color: "#e01933", logoBg: "#002855", flag: "🇺🇸" },
  "AS": { name: "Alaska Airlines", color: "#01426a", logoBg: "#01426a", flag: "🇺🇸" },
  "B6": { name: "JetBlue Airways", color: "#00205b", logoBg: "#003882", flag: "🇺🇸" },
  "U2": { name: "easyJet", color: "#ff6600", logoBg: "#ff6600", flag: "🇬🇧" },
  "KL": { name: "KLM Royal Dutch Airlines", color: "#00a1de", logoBg: "#00a1de", flag: "🇳🇱" },
  "EY": { name: "Etihad Airways", color: "#bd9b60", logoBg: "#bd9b60", flag: "🇦🇪" },
  "QR": { name: "Qatar Airways", color: "#5c0632", logoBg: "#5c0632", flag: "🇶🇦" },
  "TP": { name: "TAP Air Portugal", color: "#78b82a", logoBg: "#174a26", flag: "🇵🇹" },
  "AT": { name: "Royal Air Maroc", color: "#c11030", logoBg: "#c11030", flag: "🇲🇦" },
  "OS": { name: "Austrian Airlines", color: "#d81e05", logoBg: "#d81e05", flag: "🇦🇹" },
  "SG": { name: "SpiceJet", color: "#ed1c24", logoBg: "#ed1c24", flag: "🇮🇳" },
  "IX": { name: "Air India Express", color: "#f26522", logoBg: "#f26522", flag: "🇮🇳" },
  "I5": { name: "AirAsia India", color: "#ff0000", logoBg: "#ff0000", flag: "🇮🇳" },
  "FD": { name: "Thai AirAsia", color: "#ed1c24", logoBg: "#ed1c24", flag: "🇹🇭" },
  "SL": { name: "Thai Lion Air", color: "#f44336", logoBg: "#f44336", flag: "🇹🇭" },
  "VZ": { name: "VietJet Air", color: "#e31837", logoBg: "#e31837", flag: "🇻🇳" }
};

export function extractAirlineCode(airlineStr) {
  if (!airlineStr) return "";
  const str = String(airlineStr).trim();
  const match = str.match(/\(([A-Z0-9]{2})\/[A-Z0-9]{3}\)/i);
  if (match) return match[1].toUpperCase();

  const match2 = str.match(/\(([A-Z0-9]{2})\)/i);
  if (match2) return match2[1].toUpperCase();

  if (/^[A-Z0-9]{2}$/i.test(str)) return str.toUpperCase();

  for (const [code, info] of Object.entries(AIRLINES)) {
    if (str.toLowerCase().includes(info.name.toLowerCase())) return code;
  }
  return "";
}
