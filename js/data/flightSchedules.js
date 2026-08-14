/**
 * Global Flight Route & Schedule Lookup Database
 * Maps standard flight numbers to typical routes, carriers, standard airframes, and times.
 */

export const KNOWN_FLIGHT_SCHEDULES = {
  // --- American Airlines ---
  "AA50": { from: "DFW", to: "LHR", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 777-300ER (B77W)", depTime: "15:15:00", arrTime: "06:25:00", duration: "09:10:00" },
  "AA21": { from: "LHR", to: "DFW", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 777-300ER (B77W)", depTime: "09:35:00", arrTime: "13:40:00", duration: "10:05:00" },
  "AA51": { from: "LHR", to: "DFW", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 777-300ER (B77W)", depTime: "08:20:00", arrTime: "12:50:00", duration: "11:30:00" },
  "AA78": { from: "DFW", to: "LHR", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 787-9 (B789)", depTime: "20:40:00", arrTime: "11:40:00", duration: "08:00:00" },
  "AA80": { from: "DFW", to: "LHR", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 787-9 (B789)", depTime: "19:00:00", arrTime: "10:00:00", duration: "08:00:00" },
  "AA20": { from: "DFW", to: "LHR", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 777-300ER (B77W)", depTime: "15:24:00", arrTime: "06:20:00", duration: "08:56:00" },
  "AA86": { from: "ORD", to: "LHR", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 787-9 (B789)", depTime: "17:00:00", arrTime: "06:50:00", duration: "07:50:00" },
  "AA103": { from: "LHR", to: "JFK", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 777-300ER (B77W)", depTime: "10:05:00", arrTime: "13:05:00", duration: "09:00:00" },
  "AA141": { from: "LHR", to: "JFK", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 777-200 (B772)", depTime: "19:15:00", arrTime: "22:23:00", duration: "08:08:00" },
  "AA136": { from: "LAX", to: "LHR", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 777-200 (B772)", depTime: "19:25:00", arrTime: "14:00:00", duration: "09:35:00" },
  "AA138": { from: "LAX", to: "LHR", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 777-300ER (B77W)", depTime: "23:33:00", arrTime: "18:00:00", duration: "09:27:00" },
  "AA139": { from: "LHR", to: "LAX", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 777-200ER (B77E)", depTime: "18:50:00", arrTime: "22:09:00", duration: "12:19:00" },
  "AA156": { from: "SEA", to: "LHR", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 777-200ER (B77E)", depTime: "22:11:00", arrTime: "16:05:00", duration: "08:54:00" },
  "AA173": { from: "LHR", to: "RDU", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 777-200 (B772)", depTime: "13:50:00", arrTime: "17:40:00", duration: "09:50:00" },
  "AA292": { from: "JFK", to: "DEL", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 777-300ER (B77W)", depTime: "20:30:00", arrTime: "21:30:00", duration: "16:00:00" },
  "AA293": { from: "DEL", to: "JFK", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 777-300ER (B77W)", depTime: "23:30:00", arrTime: "06:50:00", duration: "16:20:00" },
  "AA3182": { from: "DFW", to: "SBN", airline: "American Airlines (AA/AAL)", aircraft: "Bombardier CRJ-700 (CRJ7)", depTime: "18:45:00", arrTime: "22:13:00", duration: "02:28:00" },
  "AA3084": { from: "SBN", to: "DFW", airline: "American Airlines (AA/AAL)", aircraft: "Bombardier CRJ-700 (CRJ7)", depTime: "16:25:00", arrTime: "17:50:00", duration: "02:25:00" },
  "AA3289": { from: "SBN", to: "DFW", airline: "American Airlines (AA/AAL)", aircraft: "Bombardier CRJ-700 (CRJ7)", depTime: "07:40:00", arrTime: "09:10:00", duration: "02:30:00" },
  "AA3228": { from: "SBN", to: "DFW", airline: "American Airlines (AA/AAL)", aircraft: "Bombardier CRJ-700 (CRJ7)", depTime: "15:15:00", arrTime: "17:26:00", duration: "03:11:00" },
  "AA1959": { from: "DFW", to: "SAT", airline: "American Airlines (AA/AAL)", aircraft: "Airbus A320-200 (A320)", depTime: "17:16:00", arrTime: "18:18:00", duration: "01:02:00" },
  "AA1957": { from: "SAT", to: "DFW", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 737-800 (B738)", depTime: "12:34:00", arrTime: "13:44:00", duration: "01:10:00" },
  "AA2281": { from: "DFW", to: "SAT", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 737-800 (B738)", depTime: "22:42:00", arrTime: "23:45:00", duration: "01:03:00" },
  "AA3666": { from: "DFW", to: "CLL", airline: "American Airlines (AA/AAL)", aircraft: "Embraer ERJ-145 (E145)", depTime: "12:57:00", arrTime: "13:55:00", duration: "00:58:00" },
  "AA1241": { from: "DFW", to: "SEA", airline: "American Airlines (AA/AAL)", aircraft: "Airbus A321LR (A21N)", depTime: "18:50:00", arrTime: "20:59:00", duration: "04:09:00" },
  "AA1992": { from: "SEA", to: "DFW", airline: "American Airlines (AA/AAL)", aircraft: "Airbus A321-200 (A321)", depTime: "15:35:00", arrTime: "21:35:00", duration: "04:00:00" },
  "AA2769": { from: "DFW", to: "SEA", airline: "American Airlines (AA/AAL)", aircraft: "Airbus A321-200 (A321)", depTime: "10:40:00", arrTime: "12:57:00", duration: "04:17:00" },
  "AA2767": { from: "DFW", to: "SEA", airline: "American Airlines (AA/AAL)", aircraft: "Airbus A321 (A321)", depTime: "07:41:00", arrTime: "09:41:00", duration: "04:00:00" },
  "AA2405": { from: "DFW", to: "SEA", airline: "American Airlines (AA/AAL)", aircraft: "Airbus A321 (A321)", depTime: "12:26:00", arrTime: "14:00:00", duration: "03:34:00" },
  "AA813": { from: "SEA", to: "DFW", airline: "American Airlines (AA/AAL)", aircraft: "Airbus A321-200 (A321)", depTime: "23:59:00", arrTime: "05:30:00", duration: "03:44:00" },
  "AA431": { from: "DFW", to: "PHX", airline: "American Airlines (AA/AAL)", aircraft: "Airbus A321-200 (A321)", depTime: "10:54:00", arrTime: "11:22:00", duration: "02:28:00" },
  "AA1632": { from: "PHX", to: "DFW", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 737-800 (B738)", depTime: "15:30:00", arrTime: "20:00:00", duration: "02:30:00" },
  "AA2249": { from: "DFW", to: "PHX", airline: "American Airlines (AA/AAL)", aircraft: "Airbus A321 (A321)", depTime: "14:15:00", arrTime: "15:50:00", duration: "03:35:00" },
  "AA556": { from: "PHX", to: "DFW", airline: "American Airlines (AA/AAL)", aircraft: "Airbus A321 (A321)", depTime: "15:15:00", arrTime: "19:54:00", duration: "02:39:00" },
  "AA2881": { from: "DFW", to: "ORD", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 737-800 (B738)", depTime: "18:30:00", arrTime: "20:59:00", duration: "02:29:00" },
  "AA2738": { from: "ORD", to: "DFW", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 737-800 (B738)", depTime: "20:40:00", arrTime: "23:18:00", duration: "02:38:00" },
  "AA2812": { from: "DFW", to: "ORD", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 737-800 (B738)", depTime: "05:17:00", arrTime: "07:44:00", duration: "02:27:00" },
  "AA328": { from: "DFW", to: "ORD", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 737-800 (B738)", depTime: "10:00:00", arrTime: "12:21:00", duration: "02:21:00" },
  "AA1366": { from: "DFW", to: "BOS", airline: "American Airlines (AA/AAL)", aircraft: "Airbus A321 (A321)", depTime: "19:10:00", arrTime: "23:53:00", duration: "03:43:00" },
  "AA1148": { from: "BOS", to: "DFW", airline: "American Airlines (AA/AAL)", aircraft: "Airbus A321 (A321)", depTime: "18:10:00", arrTime: "21:21:00", duration: "04:11:00" },
  "AA1048": { from: "DFW", to: "BOS", airline: "American Airlines (AA/AAL)", aircraft: "Airbus A321 (A321)", depTime: "15:28:00", arrTime: "20:03:00", duration: "03:35:00" },
  "AA2527": { from: "BOS", to: "DFW", airline: "American Airlines (AA/AAL)", aircraft: "Airbus A321-200 (A321)", depTime: "06:00:00", arrTime: "09:50:00", duration: "04:50:00" },
  "AA470": { from: "DFW", to: "PHL", airline: "American Airlines (AA/AAL)", aircraft: "Airbus A321LR (A21N)", depTime: "10:21:00", arrTime: "14:30:00", duration: "03:09:00" },
  "AA808": { from: "PHL", to: "DFW", airline: "American Airlines (AA/AAL)", aircraft: "Airbus A321neo (A21N)", depTime: "20:45:00", arrTime: "23:00:00", duration: "03:15:00" },
  "AA1612": { from: "DFW", to: "SNA", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 737-800 (B738)", depTime: "12:42:00", arrTime: "14:01:00", duration: "03:19:00" },
  "AA2659": { from: "SNA", to: "DFW", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 737-800 (B738)", depTime: "16:47:00", arrTime: "21:44:00", duration: "02:57:00" },
  "AA2871": { from: "DFW", to: "SNA", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 737-800 (B738)", depTime: "10:33:00", arrTime: "12:03:00", duration: "03:30:00" },
  "AA2114": { from: "SNA", to: "DFW", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 737-800 (B738)", depTime: "10:02:00", arrTime: "14:54:00", duration: "02:52:00" },
  "AA777": { from: "DFW", to: "LAS", airline: "American Airlines (AA/AAL)", aircraft: "Airbus A321 (A321)", depTime: "09:20:00", arrTime: "10:17:00", duration: "02:57:00" },
  "AA412": { from: "LAS", to: "DFW", airline: "American Airlines (AA/AAL)", aircraft: "Airbus A321 (A321)", depTime: "14:18:00", arrTime: "18:59:00", duration: "02:41:00" },
  "AA1702": { from: "DFW", to: "MIA", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 777-300ER (B77W)", depTime: "07:20:00", arrTime: "11:11:00", duration: "02:51:00" },
  "AA1428": { from: "DCA", to: "DFW", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 737-800 (B738)", depTime: "07:54:00", arrTime: "10:15:00", duration: "03:21:00" },
  "AA1657": { from: "LAX", to: "DFW", airline: "American Airlines (AA/AAL)", aircraft: "Boeing 777-200 (B772)", depTime: "13:25:00", arrTime: "18:51:00", duration: "03:26:00" },

  // --- British Airways ---
  "BA139": { from: "LHR", to: "BOM", airline: "British Airways (BA/BAW)", aircraft: "Boeing 777 (B777)", depTime: "09:30:00", arrTime: "00:15:00", duration: "10:45:00" },
  "BA138": { from: "BOM", to: "LHR", airline: "British Airways (BA/BAW)", aircraft: "Airbus A350-1000 (A35K)", depTime: "02:15:00", arrTime: "07:15:00", duration: "09:00:00" },
  "BA198": { from: "BOM", to: "LHR", airline: "British Airways (BA/BAW)", aircraft: "Boeing 777 (B777)", depTime: "13:10:00", arrTime: "18:15:00", duration: "09:05:00" },
  "BA199": { from: "LHR", to: "BOM", airline: "British Airways (BA/BAW)", aircraft: "Boeing 777 (B777)", depTime: "20:25:00", arrTime: "11:05:00", duration: "10:40:00" },
  "BA135": { from: "LHR", to: "BOM", airline: "British Airways (BA/BAW)", aircraft: "Boeing 787-8 (B788)", depTime: "16:15:00", arrTime: "06:40:00", duration: "10:25:00" },
  "BA8728": { from: "LCY", to: "GLA", airline: "British Airways (BA/BAW)", aircraft: "Embraer ERJ-190 (E190)", depTime: "18:20:00", arrTime: "19:40:00", duration: "01:20:00" },
  "BA8729": { from: "GLA", to: "LCY", airline: "British Airways (BA/BAW)", aircraft: "Embraer ERJ-190 (E190)", depTime: "18:55:00", arrTime: "20:25:00", duration: "01:30:00" },
  "BA502": { from: "LHR", to: "LIS", airline: "British Airways (BA/BAW)", aircraft: "Airbus A320neo (A20N)", depTime: "07:10:00", arrTime: "10:05:00", duration: "02:55:00" },
  "BA501": { from: "LIS", to: "LHR", airline: "British Airways (BA/BAW)", aircraft: "Airbus A320 (A320)", depTime: "11:06:00", arrTime: "13:50:00", duration: "02:44:00" },
  "BA638": { from: "LHR", to: "ATH", airline: "British Airways (BA/BAW)", aircraft: "Airbus A320neo (A20N)", depTime: "16:15:00", arrTime: "21:55:00", duration: "04:40:00" },
  "BA868": { from: "LHR", to: "BUD", airline: "British Airways (BA/BAW)", aircraft: "Airbus A320-200 (A320)", depTime: "13:05:00", arrTime: "16:40:00", duration: "03:35:00" },
  "BA699": { from: "VIE", to: "LHR", airline: "British Airways (BA/BAW)", aircraft: "Airbus A319neo (A19N)", depTime: "18:55:00", arrTime: "20:25:00", duration: "01:30:00" },
  "BA520": { from: "LHR", to: "FNC", airline: "British Airways (BA/BAW)", aircraft: "Airbus A320neo (A20N)", depTime: "09:25:00", arrTime: "13:20:00", duration: "03:55:00" },
  "BA521": { from: "FNC", to: "LHR", airline: "British Airways (BA/BAW)", aircraft: "Airbus A320neo (A20N)", depTime: "13:40:00", arrTime: "17:20:00", duration: "03:40:00" },
  "BA842": { from: "LHR", to: "SPU", airline: "British Airways (BA/BAW)", aircraft: "Airbus A320 (A320)", depTime: "12:22:00", arrTime: "14:51:00", duration: "02:29:00" },
  "BA843": { from: "SPU", to: "LHR", airline: "British Airways (BA/BAW)", aircraft: "Airbus A320 (A320)", depTime: "15:49:00", arrTime: "18:15:00", duration: "02:26:00" },
  "BA8458": { from: "AMS", to: "LCY", airline: "British Airways (BA/BAW)", aircraft: "Embraer ERJ-190 (E190)", depTime: "18:55:00", arrTime: "20:00:00", duration: "01:05:00" },

  // --- Virgin Atlantic ---
  "VS354": { from: "LHR", to: "BOM", airline: "Virgin Atlantic (VS/VIR)", aircraft: "Airbus A350-1000 (A35K)", depTime: "17:45:00", arrTime: "08:20:00", duration: "10:35:00" },
  "VS355": { from: "BOM", to: "LHR", airline: "Virgin Atlantic (VS/VIR)", aircraft: "Airbus A350-1000 (A35K)", depTime: "10:40:00", arrTime: "15:35:00", duration: "08:55:00" },
  "VS303": { from: "DEL", to: "LHR", airline: "Virgin Atlantic (VS/VIR)", aircraft: "Airbus A350-1000 (A35K)", depTime: "05:00:00", arrTime: "09:30:00", duration: "08:30:00" },

  // --- IndiGo & Vistara & Air India ---
  "6E2113": { from: "BOM", to: "DEL", airline: "IndiGo (6E/IGO)", aircraft: "Airbus A321-200 (A321)", depTime: "18:45:00", arrTime: "21:00:00", duration: "02:15:00" },
  "6E2328": { from: "DEL", to: "BOM", airline: "IndiGo (6E/IGO)", aircraft: "Airbus A321-200 (A321)", depTime: "10:00:00", arrTime: "12:35:00", duration: "02:35:00" },
  "6E5212": { from: "BOM", to: "BLR", airline: "IndiGo (6E/IGO)", aircraft: "Airbus A321 (A321)", depTime: "12:40:00", arrTime: "14:20:00", duration: "01:40:00" },
  "6E5351": { from: "BLR", to: "BOM", airline: "IndiGo (6E/IGO)", aircraft: "Airbus A321LR (A21N)", depTime: "15:15:00", arrTime: "17:15:00", duration: "02:00:00" },
  "6E1855": { from: "BOM", to: "SEZ", airline: "IndiGo (6E/IGO)", aircraft: "Airbus A320neo (A20N)", depTime: "11:15:00", arrTime: "14:40:00", duration: "04:25:00" },
  "6E1856": { from: "SEZ", to: "BOM", airline: "IndiGo (6E/IGO)", aircraft: "Airbus A320neo (A20N)", depTime: "18:15:00", arrTime: "00:20:00", duration: "05:05:00" },
  "UK996": { from: "BOM", to: "DEL", airline: "Vistara (UK/VTI)", aircraft: "Airbus A320neo (A20N)", depTime: "18:30:00", arrTime: "20:40:00", duration: "02:10:00" },
  "AI1662": { from: "GOX", to: "BOM", airline: "Air India (AI/AIC)", aircraft: "Airbus A320 (A320)", depTime: "17:25:00", arrTime: "18:45:00", duration: "01:20:00" },
  "SG455": { from: "BOM", to: "GOI", airline: "SpiceJet (SG/SEJ)", aircraft: "Boeing 737-800 (B738)", depTime: "15:30:00", arrTime: "17:05:00", duration: "01:35:00" },

  // --- Middle East & European Carriers ---
  "EY205": { from: "BOM", to: "AUH", airline: "Etihad Airways (EY/ETD)", aircraft: "Airbus A350-1000 (A35K)", depTime: "22:55:00", arrTime: "00:40:00", duration: "02:45:00" },
  "EY019": { from: "AUH", to: "LHR", airline: "Etihad Airways (EY/ETD)", aircraft: "Airbus A380 (A380)", depTime: "08:10:00", arrTime: "12:45:00", duration: "07:35:00" },
  "QR204": { from: "ATH", to: "DOH", airline: "Qatar Airways (QR/QTR)", aircraft: "Airbus A330-300 (A333)", depTime: "12:40:00", arrTime: "17:55:00", duration: "04:15:00" },
  "QR556": { from: "DOH", to: "BOM", airline: "Qatar Airways (QR/QTR)", aircraft: "Airbus A350-1000 (A35K)", depTime: "20:30:00", arrTime: "02:35:00", duration: "04:05:00" },
  "KL982": { from: "LCY", to: "AMS", airline: "KLM Royal Dutch Airlines (KL/KLM)", aircraft: "Embraer ERJ-190 (E190)", depTime: "09:20:00", arrTime: "11:30:00", duration: "02:10:00" },
  "OS462": { from: "LHR", to: "VIE", airline: "Austrian Airlines (OS/AUA)", aircraft: "Airbus A320neo (A20N)", depTime: "15:05:00", arrTime: "18:20:00", duration: "03:15:00" },
  "TP1366": { from: "LIS", to: "LHR", airline: "TAP Air Portugal (TP/TAP)", aircraft: "Airbus A321LR (A21N)", depTime: "19:50:00", arrTime: "22:40:00", duration: "02:50:00" },
  "T1367": { from: "LHR", to: "LIS", airline: "TAP Air Portugal (TP/TAP)", aircraft: "Airbus A321neo (A21N)", depTime: "12:25:00", arrTime: "15:10:00", duration: "02:45:00" },
  "FR2537": { from: "STN", to: "EIN", airline: "Ryanair (FR/RYR)", aircraft: "Boeing 737-800 (B738)", depTime: "14:20:00", arrTime: "16:30:00", duration: "02:10:00" },
  "FR8283": { from: "EIN", to: "STN", airline: "Ryanair (FR/RYR)", aircraft: "Boeing 737-800 (B738)", depTime: "21:15:00", arrTime: "22:20:00", duration: "01:05:00" },
  "FR2842": { from: "STN", to: "LPA", airline: "Ryanair (FR/RYR)", aircraft: "Boeing 737-800 (B738)", depTime: "06:00:00", arrTime: "10:25:00", duration: "04:25:00" },
  "FR8133": { from: "LPA", to: "STN", airline: "Ryanair (FR/RYR)", aircraft: "Boeing 737 (B73X)", depTime: "19:05:00", arrTime: "23:30:00", duration: "04:25:00" },
  "FR2860": { from: "STN", to: "LUX", airline: "Ryanair (FR/RYR)", aircraft: "Boeing 737-800 (B738)", depTime: "15:15:00", arrTime: "17:35:00", duration: "02:20:00" },
  "FR1458": { from: "LUX", to: "STN", airline: "Ryanair (FR/RYR)", aircraft: "Boeing 737-800 (B738)", depTime: "09:25:00", arrTime: "10:45:00", duration: "01:20:00" },
  "FR2108": { from: "BUD", to: "BGY", airline: "Ryanair (FR/RYR)", aircraft: "Boeing 737-800 (B738)", depTime: "11:05:00", arrTime: "12:40:00", duration: "01:35:00" },
  "FR3003": { from: "CIA", to: "STN", airline: "Ryanair (FR/RYR)", aircraft: "Boeing 737-800 (B738)", depTime: "06:00:00", arrTime: "07:45:00", duration: "01:45:00" },
  "U2208": { from: "STN", to: "EDI", airline: "Easyjet (U2/EZY)", aircraft: "Airbus A320-200 (A320)", depTime: "08:15:00", arrTime: "09:20:00", duration: "01:05:00" },
  "U2313": { from: "EDI", to: "STN", airline: "Easyjet (U2/EZY)", aircraft: "Airbus A320-200 (A320)", depTime: "14:55:00", arrTime: "16:15:00", duration: "01:20:00" },
  "AT803": { from: "LGW", to: "CMN", airline: "Royal Air Maroc (AT/RAM)", aircraft: "Boeing 737-800 (B738)", depTime: "16:10:00", arrTime: "19:25:00", duration: "03:15:00" },
  "AT403": { from: "CMN", to: "RAK", airline: "Royal Air Maroc (AT/RAM)", aircraft: "Boeing 737-800 (B738)", depTime: "22:00:00", arrTime: "22:50:00", duration: "00:50:00" },
  "AT402": { from: "RAK", to: "CMN", airline: "Royal Air Maroc (AT/RAM)", aircraft: "Boeing 737-800 (B738)", depTime: "09:35:00", arrTime: "10:25:00", duration: "00:50:00" },
  "AT802": { from: "CMN", to: "LGW", airline: "Royal Air Maroc (AT/RAM)", aircraft: "Boeing 737-800 (B738)", depTime: "11:55:00", arrTime: "15:10:00", duration: "03:15:00" },
  "SL219": { from: "BOM", to: "DMK", airline: "Thai Lion Air (SL/TLM)", aircraft: "Boeing 737-800 (B738)", depTime: "00:40:00", arrTime: "06:35:00", duration: "03:55:00" },
  "SL740": { from: "DMK", to: "URT", airline: "Thai Lion Air (SL/TLM)", aircraft: "Boeing 737-800 (B738)", depTime: "14:35:00", arrTime: "15:55:00", duration: "01:20:00" },
  "FD3332": { from: "URT", to: "DMK", airline: "Thai AirAsia (FD/AIQ)", aircraft: "Airbus A320-200 (A320)", depTime: "17:40:00", arrTime: "18:55:00", duration: "01:15:00" },
  "VZ760": { from: "BKK", to: "BOM", airline: "MyTravel Airways (VZ/MYT)", aircraft: "Airbus A320-200 (A320)", depTime: "20:40:00", arrTime: "23:50:00", duration: "05:10:00" }
};

/**
 * Normalizes a flight number string for comparison (e.g. "aa 50", "AA050", "AA50" -> "AA50")
 */
export function normalizeFlightNumber(flightNum) {
  if (!flightNum) return "";
  const cleaned = String(flightNum).toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '');
  
  // Convert AA050 -> AA50 or AA0050 -> AA50
  const match = cleaned.match(/^([A-Z0-9]{2,3})(0+)(\d+)$/);
  if (match) {
    return `${match[1]}${match[3]}`;
  }
  return cleaned;
}

/**
 * Searches schedule database + past user flight history for a flight number
 */
export function lookupFlightSchedule(flightNumber, existingFlights = []) {
  if (!flightNumber) return null;
  const normalized = normalizeFlightNumber(flightNumber);
  if (!normalized) return null;

  // 1. Check known schedules database
  if (KNOWN_FLIGHT_SCHEDULES[normalized]) {
    return {
      ...KNOWN_FLIGHT_SCHEDULES[normalized],
      source: "schedule_db"
    };
  }

  // Check with zero padding variation
  for (const [key, sched] of Object.entries(KNOWN_FLIGHT_SCHEDULES)) {
    if (normalizeFlightNumber(key) === normalized) {
      return { ...sched, source: "schedule_db" };
    }
  }

  // 2. Check user's past flight logs for matching flight number
  if (existingFlights && existingFlights.length > 0) {
    const pastMatch = existingFlights.find(f => normalizeFlightNumber(f.flightNumber) === normalized);
    if (pastMatch) {
      return {
        from: pastMatch.fromCode,
        to: pastMatch.toCode,
        airline: pastMatch.airlineRaw,
        aircraft: pastMatch.aircraftRaw,
        depTime: pastMatch.depTime || "",
        arrTime: pastMatch.arrTime || "",
        duration: pastMatch.durationRaw || "",
        source: "flight_history"
      };
    }
  }

  return null;
}
