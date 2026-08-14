/**
 * Global Airport Database & Geodesic Calculation Engine
 * Comprehensive dataset covering the user's flight history + major global international hubs.
 */

export const AIRPORTS = {
  // --- North America (US, CA, MX) ---
  "DFW": { icao: "KDFW", name: "Dallas/Fort Worth International Airport", city: "Dallas-Ft Worth", country: "United States", countryCode: "US", lat: 32.8998, lon: -97.0403 },
  "DAL": { icao: "KDAL", name: "Dallas Love Field", city: "Dallas", country: "United States", countryCode: "US", lat: 32.8471, lon: -96.8518 },
  "SBN": { icao: "KSBN", name: "South Bend International Airport", city: "South Bend", country: "United States", countryCode: "US", lat: 41.7087, lon: -86.3173 },
  "SAT": { icao: "KSAT", name: "San Antonio International Airport", city: "San Antonio", country: "United States", countryCode: "US", lat: 29.5337, lon: -98.4698 },
  "CLL": { icao: "KCLL", name: "Easterwood Field", city: "College Station", country: "United States", countryCode: "US", lat: 30.5886, lon: -96.3638 },
  "SEA": { icao: "KSEA", name: "Seattle-Tacoma International Airport", city: "Seattle", country: "United States", countryCode: "US", lat: 47.4502, lon: -122.3088 },
  "PAE": { icao: "KPAE", name: "Snohomish County Airport (Paine Field)", city: "Everett", country: "United States", countryCode: "US", lat: 47.9063, lon: -122.2816 },
  "PHX": { icao: "KPHX", name: "Phoenix Sky Harbor International Airport", city: "Phoenix", country: "United States", countryCode: "US", lat: 33.4373, lon: -112.0078 },
  "BGR": { icao: "KBGR", name: "Bangor International Airport", city: "Bangor", country: "United States", countryCode: "US", lat: 44.8074, lon: -68.8281 },
  "GSO": { icao: "KGSO", name: "Piedmont Triad International Airport", city: "Greensboro", country: "United States", countryCode: "US", lat: 36.0978, lon: -79.9373 },
  "RDU": { icao: "KRDU", name: "Raleigh-Durham International Airport", city: "Raleigh-Durham", country: "United States", countryCode: "US", lat: 35.8801, lon: -78.7880 },
  "ORD": { icao: "KORD", name: "O'Hare International Airport", city: "Chicago", country: "United States", countryCode: "US", lat: 41.9742, lon: -87.9073 },
  "MDW": { icao: "KMDW", name: "Chicago Midway International Airport", city: "Chicago", country: "United States", countryCode: "US", lat: 41.7868, lon: -87.7522 },
  "CLT": { icao: "KCLT", name: "Charlotte Douglas International Airport", city: "Charlotte", country: "United States", countryCode: "US", lat: 35.2144, lon: -80.9473 },
  "LGA": { icao: "KLGA", name: "LaGuardia Airport", city: "New York", country: "United States", countryCode: "US", lat: 40.7769, lon: -73.8740 },
  "JFK": { icao: "KJFK", name: "John F. Kennedy International Airport", city: "New York", country: "United States", countryCode: "US", lat: 40.6413, lon: -73.7781 },
  "EWR": { icao: "KEWR", name: "Newark Liberty International Airport", city: "Newark/New York", country: "United States", countryCode: "US", lat: 40.6895, lon: -74.1745 },
  "AUS": { icao: "KAUS", name: "Austin-Bergstrom International Airport", city: "Austin", country: "United States", countryCode: "US", lat: 30.1975, lon: -97.6664 },
  "SNA": { icao: "KSNA", name: "John Wayne Airport", city: "Santa Ana / Orange County", country: "United States", countryCode: "US", lat: 33.6762, lon: -117.8682 },
  "LAX": { icao: "KLAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "United States", countryCode: "US", lat: 33.9416, lon: -118.4085 },
  "ONT": { icao: "KONT", name: "Ontario International Airport", city: "Ontario", country: "United States", countryCode: "US", lat: 34.0560, lon: -117.6012 },
  "SFO": { icao: "KSFO", name: "San Francisco International Airport", city: "San Francisco", country: "United States", countryCode: "US", lat: 37.6213, lon: -122.3790 },
  "SAN": { icao: "KSAN", name: "San Diego International Airport", city: "San Diego", country: "United States", countryCode: "US", lat: 32.7338, lon: -117.1933 },
  "MSP": { icao: "KMSP", name: "Minneapolis-Saint Paul International Airport", city: "Minneapolis", country: "United States", countryCode: "US", lat: 44.8848, lon: -93.2223 },
  "RNO": { icao: "KRNO", name: "Reno/Tahoe International Airport", city: "Reno", country: "United States", countryCode: "US", lat: 39.4991, lon: -119.7681 },
  "DEN": { icao: "KDEN", name: "Denver International Airport", city: "Denver", country: "United States", countryCode: "US", lat: 39.8561, lon: -104.6737 },
  "TYS": { icao: "KTYS", name: "McGhee Tyson Airport", city: "Knoxville", country: "United States", countryCode: "US", lat: 35.8110, lon: -83.9940 },
  "LAS": { icao: "KLAS", name: "Harry Reid International Airport", city: "Las Vegas", country: "United States", countryCode: "US", lat: 36.0840, lon: -115.1537 },
  "HOU": { icao: "KHOU", name: "William P. Hobby Airport", city: "Houston", country: "United States", countryCode: "US", lat: 29.6454, lon: -95.2789 },
  "IAH": { icao: "KIAH", name: "George Bush Intercontinental Airport", city: "Houston", country: "United States", countryCode: "US", lat: 29.9902, lon: -95.3368 },
  "BOS": { icao: "KBOS", name: "Logan International Airport", city: "Boston", country: "United States", countryCode: "US", lat: 42.3656, lon: -71.0096 },
  "SAF": { icao: "KSAF", name: "Santa Fe Regional Airport", city: "Santa Fe", country: "United States", countryCode: "US", lat: 35.6171, lon: -106.0894 },
  "PHL": { icao: "KPHL", name: "Philadelphia International Airport", city: "Philadelphia", country: "United States", countryCode: "US", lat: 39.8729, lon: -75.2437 },
  "PDX": { icao: "KPDX", name: "Portland International Airport", city: "Portland", country: "United States", countryCode: "US", lat: 45.5898, lon: -122.5951 },
  "MIA": { icao: "KMIA", name: "Miami International Airport", city: "Miami", country: "United States", countryCode: "US", lat: 25.7959, lon: -80.2870 },
  "TPA": { icao: "KTPA", name: "Tampa International Airport", city: "Tampa", country: "United States", countryCode: "US", lat: 27.9755, lon: -82.5332 },
  "MCO": { icao: "KMCO", name: "Orlando International Airport", city: "Orlando", country: "United States", countryCode: "US", lat: 28.4312, lon: -81.3081 },
  "ATL": { icao: "KATL", name: "Hartsfield-Jackson Atlanta International Airport", city: "Atlanta", country: "United States", countryCode: "US", lat: 33.6407, lon: -84.4277 },
  "DCA": { icao: "KDCA", name: "Ronald Reagan Washington National Airport", city: "Washington D.C.", country: "United States", countryCode: "US", lat: 38.8512, lon: -77.0402 },
  "IAD": { icao: "KIAD", name: "Washington Dulles International Airport", city: "Washington D.C.", country: "United States", countryCode: "US", lat: 38.9531, lon: -77.4565 },
  "BWI": { icao: "KBWI", name: "Baltimore/Washington International Thurgood Marshall Airport", city: "Baltimore", country: "United States", countryCode: "US", lat: 39.1754, lon: -76.6682 },
  "SLC": { icao: "KSLC", name: "Salt Lake City International Airport", city: "Salt Lake City", country: "United States", countryCode: "US", lat: 40.7899, lon: -111.9791 },
  "SJD": { icao: "MMSD", name: "Los Cabos International Airport", city: "San Jose del Cabo", country: "Mexico", countryCode: "MX", lat: 23.1518, lon: -109.7214 },
  "MEX": { icao: "MMMX", name: "Benito Juárez International Airport", city: "Mexico City", country: "Mexico", countryCode: "MX", lat: 19.4363, lon: -99.0721 },
  "CUN": { icao: "MMUN", name: "Cancún International Airport", city: "Cancun", country: "Mexico", countryCode: "MX", lat: 21.0365, lon: -86.8771 },
  "YYZ": { icao: "CYYZ", name: "Toronto Pearson International Airport", city: "Toronto", country: "Canada", countryCode: "CA", lat: 43.6777, lon: -79.6248 },
  "YVR": { icao: "CYVR", name: "Vancouver International Airport", city: "Vancouver", country: "Canada", countryCode: "CA", lat: 49.1967, lon: -123.1815 },

  // --- Europe & UK ---
  "LHR": { icao: "EGLL", name: "London Heathrow Airport", city: "London", country: "United Kingdom", countryCode: "GB", lat: 51.4700, lon: -0.4543 },
  "LCY": { icao: "EGLC", name: "London City Airport", city: "London", country: "United Kingdom", countryCode: "GB", lat: 51.5053, lon: 0.0553 },
  "STN": { icao: "EGSS", name: "London Stansted Airport", city: "London", country: "United Kingdom", countryCode: "GB", lat: 51.8860, lon: 0.2389 },
  "LGW": { icao: "EGKK", name: "London Gatwick Airport", city: "London", country: "United Kingdom", countryCode: "GB", lat: 51.1537, lon: -0.1821 },
  "LTN": { icao: "EGGW", name: "London Luton Airport", city: "London", country: "United Kingdom", countryCode: "GB", lat: 51.8747, lon: -0.3683 },
  "GLA": { icao: "EGPF", name: "Glasgow Airport", city: "Glasgow", country: "United Kingdom", countryCode: "GB", lat: 55.8719, lon: -4.4331 },
  "EDI": { icao: "EGPH", name: "Edinburgh Airport", city: "Edinburgh", country: "United Kingdom", countryCode: "GB", lat: 55.9500, lon: -3.3725 },
  "MAN": { icao: "EGCC", name: "Manchester Airport", city: "Manchester", country: "United Kingdom", countryCode: "GB", lat: 53.3537, lon: -2.2750 },
  "BHX": { icao: "EGBB", name: "Birmingham Airport", city: "Birmingham", country: "United Kingdom", countryCode: "GB", lat: 52.4539, lon: -1.7480 },
  "DUB": { icao: "EIDW", name: "Dublin Airport", city: "Dublin", country: "Ireland", countryCode: "IE", lat: 53.4213, lon: -6.2701 },
  "AMS": { icao: "EHAM", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Netherlands", countryCode: "NL", lat: 52.3105, lon: 4.7683 },
  "EIN": { icao: "EHEH", name: "Eindhoven Airport", city: "Eindhoven", country: "Netherlands", countryCode: "NL", lat: 51.4501, lon: 5.3745 },
  "BRU": { icao: "EBBR", name: "Brussels Airport", city: "Brussels", country: "Belgium", countryCode: "BE", lat: 50.9010, lon: 4.4856 },
  "CDG": { icao: "LFPG", name: "Paris Charles de Gaulle Airport", city: "Paris", country: "France", countryCode: "FR", lat: 49.0097, lon: 2.5479 },
  "ORY": { icao: "LFPO", name: "Paris Orly Airport", city: "Paris", country: "France", countryCode: "FR", lat: 48.7262, lon: 2.3652 },
  "NCE": { icao: "LFMN", name: "Nice Côte d'Azur Airport", city: "Nice", country: "France", countryCode: "FR", lat: 43.6584, lon: 7.2159 },
  "FRA": { icao: "EDDF", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany", countryCode: "DE", lat: 50.0379, lon: 8.5622 },
  "MUC": { icao: "EDDM", name: "Munich Airport", city: "Munich", country: "Germany", countryCode: "DE", lat: 48.3537, lon: 11.7861 },
  "BER": { icao: "EDDB", name: "Berlin Brandenburg Airport", city: "Berlin", country: "Germany", countryCode: "DE", lat: 52.3667, lon: 13.5033 },
  "ZRH": { icao: "LSZH", name: "Zurich Airport", city: "Zurich", country: "Switzerland", countryCode: "CH", lat: 47.4582, lon: 8.5555 },
  "GVA": { icao: "LSGG", name: "Geneva Airport", city: "Geneva", country: "Switzerland", countryCode: "CH", lat: 46.2370, lon: 6.1092 },
  "VIE": { icao: "LOWW", name: "Vienna International Airport", city: "Vienna", country: "Austria", countryCode: "AT", lat: 48.1103, lon: 16.5697 },
  "BUD": { icao: "LHBP", name: "Budapest Ferenc Liszt International Airport", city: "Budapest", country: "Hungary", countryCode: "HU", lat: 47.4369, lon: 19.2556 },
  "PRG": { icao: "LKPR", name: "Václav Havel Airport Prague", city: "Prague", country: "Czech Republic", countryCode: "CZ", lat: 50.1008, lon: 14.2600 },
  "WAW": { icao: "EPWA", name: "Warsaw Chopin Airport", city: "Warsaw", country: "Poland", countryCode: "PL", lat: 52.1672, lon: 20.9679 },
  "LUX": { icao: "ELLX", name: "Luxembourg Airport", city: "Luxembourg", country: "Luxembourg", countryCode: "LU", lat: 49.6233, lon: 6.2044 },
  "LIS": { icao: "LPPT", name: "Humberto Delgado Airport (Lisbon)", city: "Lisbon", country: "Portugal", countryCode: "PT", lat: 38.7756, lon: -9.1354 },
  "OPO": { icao: "LPPR", name: "Francisco Sá Carneiro Airport", city: "Porto", country: "Portugal", countryCode: "PT", lat: 41.2421, lon: -8.6786 },
  "FNC": { icao: "LPMA", name: "Cristiano Ronaldo Madeira International Airport", city: "Funchal", country: "Portugal", countryCode: "PT", lat: 32.6979, lon: -16.7745 },
  "MAD": { icao: "LEMD", name: "Adolfo Suárez Madrid–Barajas Airport", city: "Madrid", country: "Spain", countryCode: "ES", lat: 40.4839, lon: -3.5680 },
  "BCN": { icao: "LEBL", name: "Josep Tarradellas Barcelona-El Prat Airport", city: "Barcelona", country: "Spain", countryCode: "ES", lat: 41.2974, lon: 2.0833 },
  "LPA": { icao: "GCLP", name: "Gran Canaria Airport", city: "Gran Canaria", country: "Spain", countryCode: "ES", lat: 27.9319, lon: -15.3866 },
  "TFS": { icao: "GCTS", name: "Tenerife South Airport", city: "Tenerife", country: "Spain", countryCode: "ES", lat: 28.0445, lon: -16.5725 },
  "PMI": { icao: "LEPA", name: "Palma de Mallorca Airport", city: "Mallorca", country: "Spain", countryCode: "ES", lat: 39.5517, lon: 2.7388 },
  "MXP": { icao: "LIMC", name: "Milan Malpensa Airport", city: "Milan", country: "Italy", countryCode: "IT", lat: 45.6301, lon: 8.7255 },
  "LIN": { icao: "LIML", name: "Milan Linate Airport", city: "Milan", country: "Italy", countryCode: "IT", lat: 45.4451, lon: 9.2767 },
  "BGY": { icao: "LIME", name: "Milan Bergamo Airport (Orio al Serio)", city: "Bergamo/Milan", country: "Italy", countryCode: "IT", lat: 45.6739, lon: 9.7042 },
  "FCO": { icao: "LIRF", name: "Leonardo da Vinci–Fiumicino Airport", city: "Rome", country: "Italy", countryCode: "IT", lat: 41.8003, lon: 12.2389 },
  "CIA": { icao: "LIRA", name: "Rome Ciampino Airport", city: "Rome", country: "Italy", countryCode: "IT", lat: 41.7994, lon: 12.5949 },
  "VCE": { icao: "LIPZ", name: "Venice Marco Polo Airport", city: "Venice", country: "Italy", countryCode: "IT", lat: 45.5053, lon: 12.3519 },
  "ATH": { icao: "LGAV", name: "Athens International Airport", city: "Athens", country: "Greece", countryCode: "GR", lat: 37.9364, lon: 23.9445 },
  "HER": { icao: "LGIR", name: "Heraklion International Airport", city: "Crete", country: "Greece", countryCode: "GR", lat: 35.3397, lon: 25.1803 },
  "JMK": { icao: "LGMK", name: "Mykonos Airport", city: "Mykonos", country: "Greece", countryCode: "GR", lat: 37.4351, lon: 25.3481 },
  "JTR": { icao: "LGSR", name: "Santorini (Thira) National Airport", city: "Santorini", country: "Greece", countryCode: "GR", lat: 36.3992, lon: 25.4793 },
  "SPU": { icao: "LDSP", name: "Split Airport", city: "Split", country: "Croatia", countryCode: "HR", lat: 43.5389, lon: 16.2980 },
  "DBV": { icao: "LDDU", name: "Dubrovnik Airport", city: "Dubrovnik", country: "Croatia", countryCode: "HR", lat: 42.5614, lon: 18.2682 },
  "ZAG": { icao: "LDZA", name: "Zagreb Airport", city: "Zagreb", country: "Croatia", countryCode: "HR", lat: 45.7429, lon: 16.0688 },
  "IST": { icao: "LTFM", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", countryCode: "TR", lat: 41.2753, lon: 28.7519 },
  "SAW": { icao: "LTFJ", name: "Istanbul Sabiha Gökçen International Airport", city: "Istanbul", country: "Turkey", countryCode: "TR", lat: 40.8986, lon: 29.3092 },
  "CPH": { icao: "EKCH", name: "Copenhagen Airport", city: "Copenhagen", country: "Denmark", countryCode: "DK", lat: 55.6180, lon: 12.6560 },
  "ARN": { icao: "ESSA", name: "Stockholm Arlanda Airport", city: "Stockholm", country: "Sweden", countryCode: "SE", lat: 59.6498, lon: 17.9238 },
  "OSL": { icao: "ENGM", name: "Oslo Gardermoen Airport", city: "Oslo", country: "Norway", countryCode: "NO", lat: 60.1975, lon: 11.1004 },
  "HEL": { icao: "EFHK", name: "Helsinki-Vantaa Airport", city: "Helsinki", country: "Finland", countryCode: "FI", lat: 60.3172, lon: 24.9633 },
  "KEF": { icao: "BIKF", name: "Keflavík International Airport", city: "Reykjavik", country: "Iceland", countryCode: "IS", lat: 63.9850, lon: -22.6056 },

  // --- India & South Asia ---
  "BOM": { icao: "VABB", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", country: "India", countryCode: "IN", lat: 19.0896, lon: 72.8656 },
  "DEL": { icao: "VIDP", name: "Indira Gandhi International Airport", city: "Delhi", country: "India", countryCode: "IN", lat: 28.5562, lon: 77.1000 },
  "BLR": { icao: "VOBL", name: "Kempegowda International Airport", city: "Bangalore", country: "India", countryCode: "IN", lat: 13.1986, lon: 77.7066 },
  "GOI": { icao: "VAGO", name: "Dabolim Airport", city: "Goa (Dabolim)", country: "India", countryCode: "IN", lat: 15.3808, lon: 73.8314 },
  "GOX": { icao: "VOGA", name: "Manohar International Airport (Mopa)", city: "Goa (Mopa)", country: "India", countryCode: "IN", lat: 15.7594, lon: 73.8647 },
  "MAA": { icao: "VOMM", name: "Chennai International Airport", city: "Chennai", country: "India", countryCode: "IN", lat: 12.9941, lon: 80.1709 },
  "HYD": { icao: "VOHS", name: "Rajiv Gandhi International Airport", city: "Hyderabad", country: "India", countryCode: "IN", lat: 17.2403, lon: 78.4294 },
  "CCU": { icao: "VECC", name: "Netaji Subhash Chandra Bose International Airport", city: "Kolkata", country: "India", countryCode: "IN", lat: 22.6547, lon: 88.4467 },
  "AMD": { icao: "VAAH", name: "Sardar Vallabhbhai Patel International Airport", city: "Ahmedabad", country: "India", countryCode: "IN", lat: 23.0772, lon: 72.6347 },
  "COK": { icao: "VOCI", name: "Cochin International Airport", city: "Kochi", country: "India", countryCode: "IN", lat: 10.1556, lon: 76.4019 },
  "PNQ": { icao: "VAPO", name: "Pune Airport", city: "Pune", country: "India", countryCode: "IN", lat: 18.5821, lon: 73.9197 },
  "CMB": { icao: "VCBI", name: "Bandaranaike International Airport", city: "Colombo", country: "Sri Lanka", countryCode: "LK", lat: 7.1808, lon: 79.8841 },
  "MLE": { icao: "VRMM", name: "Velana International Airport", city: "Male", country: "Maldives", countryCode: "MV", lat: 4.1918, lon: 73.5291 },
  "KTM": { icao: "VNKT", name: "Tribhuvan International Airport", city: "Kathmandu", country: "Nepal", countryCode: "NP", lat: 27.6966, lon: 85.3591 },

  // --- Middle East & Africa ---
  "AUH": { icao: "OMAA", name: "Zayed International Airport (Abu Dhabi)", city: "Abu Dhabi", country: "United Arab Emirates", countryCode: "AE", lat: 24.4330, lon: 54.6511 },
  "DXB": { icao: "OMDB", name: "Dubai International Airport", city: "Dubai", country: "United Arab Emirates", countryCode: "AE", lat: 25.2532, lon: 55.3657 },
  "DOH": { icao: "OTHH", name: "Hamad International Airport", city: "Doha", country: "Qatar", countryCode: "QA", lat: 25.2731, lon: 51.6081 },
  "RUH": { icao: "OERK", name: "King Khalid International Airport", city: "Riyadh", country: "Saudi Arabia", countryCode: "SA", lat: 24.9576, lon: 46.6988 },
  "JED": { icao: "OEJN", name: "King Abdulaziz International Airport", city: "Jeddah", country: "Saudi Arabia", countryCode: "SA", lat: 21.6796, lon: 39.1565 },
  "BAH": { icao: "OBBI", name: "Bahrain International Airport", city: "Manama", country: "Bahrain", countryCode: "BH", lat: 26.2708, lon: 50.6336 },
  "KWI": { icao: "OKBK", name: "Kuwait International Airport", city: "Kuwait City", country: "Kuwait", countryCode: "KW", lat: 29.2266, lon: 47.9809 },
  "MCT": { icao: "OOMS", name: "Muscat International Airport", city: "Muscat", country: "Oman", countryCode: "OM", lat: 23.5933, lon: 58.2844 },
  "CMN": { icao: "GMMN", name: "Mohammed V International Airport", city: "Casablanca", country: "Morocco", countryCode: "MA", lat: 33.3675, lon: -7.5898 },
  "RAK": { icao: "GMMX", name: "Marrakesh Menara Airport", city: "Marrakech", country: "Morocco", countryCode: "MA", lat: 31.6069, lon: -8.0363 },
  "CAI": { icao: "HECA", name: "Cairo International Airport", city: "Cairo", country: "Egypt", countryCode: "EG", lat: 30.1219, lon: 31.4056 },
  "JNB": { icao: "FAOR", name: "O. R. Tambo International Airport", city: "Johannesburg", country: "South Africa", countryCode: "ZA", lat: -26.1392, lon: 28.2460 },
  "CPT": { icao: "FACT", name: "Cape Town International Airport", city: "Cape Town", country: "South Africa", countryCode: "ZA", lat: -33.9648, lon: 18.6017 },
  "NBO": { icao: "HKJK", name: "Jomo Kenyatta International Airport", city: "Nairobi", country: "Kenya", countryCode: "KE", lat: -1.3192, lon: 36.9278 },
  "SEZ": { icao: "FSIA", name: "Seychelles International Airport", city: "Mahe", country: "Seychelles", countryCode: "SC", lat: -4.6743, lon: 55.5219 },
  "MRU": { icao: "FIMP", name: "Sir Seewoosagur Ramgoolam International Airport", city: "Mauritius", country: "Mauritius", countryCode: "MU", lat: -20.4302, lon: 57.6836 },

  // --- East Asia & Southeast Asia & Oceania ---
  "DMK": { icao: "VTBD", name: "Don Mueang International Airport", city: "Bangkok (Don Mueang)", country: "Thailand", countryCode: "TH", lat: 13.9126, lon: 100.6068 },
  "BKK": { icao: "VTBS", name: "Suvarnabhumi Airport", city: "Bangkok (Suvarnabhumi)", country: "Thailand", countryCode: "TH", lat: 13.6900, lon: 100.7501 },
  "URT": { icao: "VTSB", name: "Surat Thani Airport", city: "Surat Thani", country: "Thailand", countryCode: "TH", lat: 9.1326, lon: 99.1356 },
  "HKT": { icao: "VTSP", name: "Phuket International Airport", city: "Phuket", country: "Thailand", countryCode: "TH", lat: 8.1132, lon: 98.3169 },
  "CNX": { icao: "VTCC", name: "Chiang Mai International Airport", city: "Chiang Mai", country: "Thailand", countryCode: "TH", lat: 18.7668, lon: 98.9626 },
  "SIN": { icao: "WSSS", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", countryCode: "SG", lat: 1.3644, lon: 103.9915 },
  "KUL": { icao: "WMKK", name: "Kuala Lumpur International Airport", city: "Kuala Lumpur", country: "Malaysia", countryCode: "MY", lat: 2.7456, lon: 101.7072 },
  "CGK": { icao: "WIII", name: "Soekarno-Hatta International Airport", city: "Jakarta", country: "Indonesia", countryCode: "ID", lat: -6.1256, lon: 106.6559 },
  "DPS": { icao: "WADD", name: "I Gusti Ngurah Rai International Airport", city: "Bali", country: "Indonesia", countryCode: "ID", lat: -8.7482, lon: 115.1672 },
  "MNL": { icao: "RPLL", name: "Ninoy Aquino International Airport", city: "Manila", country: "Philippines", countryCode: "PH", lat: 14.5086, lon: 121.0194 },
  "SGN": { icao: "VVTS", name: "Tan Son Nhat International Airport", city: "Ho Chi Minh City", country: "Vietnam", countryCode: "VN", lat: 10.8188, lon: 106.6520 },
  "HAN": { icao: "VVNB", name: "Noi Bai International Airport", city: "Hanoi", country: "Vietnam", countryCode: "VN", lat: 21.2212, lon: 105.8072 },
  "HKG": { icao: "VHHH", name: "Hong Kong International Airport", city: "Hong Kong", country: "Hong Kong", countryCode: "HK", lat: 22.3080, lon: 113.9185 },
  "TPE": { icao: "RCTP", name: "Taiwan Taoyuan International Airport", city: "Taipei", country: "Taiwan", countryCode: "TW", lat: 25.0797, lon: 121.2342 },
  "HND": { icao: "RJTT", name: "Tokyo Haneda Airport", city: "Tokyo (Haneda)", country: "Japan", countryCode: "JP", lat: 35.5494, lon: 139.7798 },
  "NRT": { icao: "RJAA", name: "Narita International Airport", city: "Tokyo (Narita)", country: "Japan", countryCode: "JP", lat: 35.7720, lon: 140.3929 },
  "KIX": { icao: "RJBB", name: "Kansai International Airport", city: "Osaka", country: "Japan", countryCode: "JP", lat: 34.4320, lon: 135.2304 },
  "ICN": { icao: "RKSI", name: "Incheon International Airport", city: "Seoul", country: "South Korea", countryCode: "KR", lat: 37.4602, lon: 126.4407 },
  "PEK": { icao: "ZBAA", name: "Beijing Capital International Airport", city: "Beijing", country: "China", countryCode: "CN", lat: 40.0799, lon: 116.6031 },
  "PKX": { icao: "ZBAD", name: "Beijing Daxing International Airport", city: "Beijing", country: "China", countryCode: "CN", lat: 39.5098, lon: 116.4105 },
  "PVG": { icao: "ZSPD", name: "Shanghai Pudong International Airport", city: "Shanghai", country: "China", countryCode: "CN", lat: 31.1443, lon: 121.8083 },
  "SYD": { icao: "YSSY", name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia", countryCode: "AU", lat: -33.9399, lon: 151.1753 },
  "MEL": { icao: "YMML", name: "Melbourne Airport", city: "Melbourne", country: "Australia", countryCode: "AU", lat: -37.6690, lon: 144.8410 },
  "BNE": { icao: "YBBN", name: "Brisbane Airport", city: "Brisbane", country: "Australia", countryCode: "AU", lat: -27.3842, lon: 153.1175 },
  "AKL": { icao: "NZAA", name: "Auckland Airport", city: "Auckland", country: "New Zealand", countryCode: "NZ", lat: -37.0082, lon: 174.7850 },

  // --- Latin America ---
  "GRU": { icao: "SBGR", name: "São Paulo/Guarulhos International Airport", city: "São Paulo", country: "Brazil", countryCode: "BR", lat: -23.4356, lon: -46.4731 },
  "GIG": { icao: "SBGL", name: "Rio de Janeiro/Galeão International Airport", city: "Rio de Janeiro", country: "Brazil", countryCode: "BR", lat: -22.8089, lon: -43.2436 },
  "EZE": { icao: "SAEZ", name: "Ministro Pistarini International Airport", city: "Buenos Aires", country: "Argentina", countryCode: "AR", lat: -34.8222, lon: -58.5358 },
  "SCL": { icao: "SCEL", name: "Arturo Merino Benítez International Airport", city: "Santiago", country: "Chile", countryCode: "CL", lat: -33.3930, lon: -70.7858 },
  "BOG": { icao: "SKBO", name: "El Dorado International Airport", city: "Bogotá", country: "Colombia", countryCode: "CO", lat: 4.7016, lon: -74.1469 },
  "LIM": { icao: "SPJC", name: "Jorge Chávez International Airport", city: "Lima", country: "Peru", countryCode: "PE", lat: -12.0219, lon: -77.1143 },
  "PTY": { icao: "MPTO", name: "Tocumen International Airport", city: "Panama City", country: "Panama", countryCode: "PA", lat: 9.0714, lon: -79.3835 }
};

/**
 * Parses airport string from myflightradar24 format
 * Example: "Dallas-Ft Worth / Dallas-Ft Worth (DFW/KDFW)" -> "DFW"
 * Example: "Budapest / Franz Liszt International (BUD/LHBP)" -> "BUD"
 */
export function extractAirportCode(airportStr) {
  if (!airportStr) return "";
  const str = String(airportStr).trim();
  
  // Look for (IATA/ICAO)
  const matchSlash = str.match(/\(([A-Z0-9]{3})\/[A-Z0-9]{3,4}\)/i);
  if (matchSlash) return matchSlash[1].toUpperCase();

  // Look for (IATA)
  const matchParen = str.match(/\(([A-Z0-9]{3})\)/i);
  if (matchParen) return matchParen[1].toUpperCase();

  // Pure 3-letter IATA code
  if (/^[A-Z0-9]{3}$/i.test(str)) {
    return str.toUpperCase();
  }

  // Pure 4-letter ICAO code matching lookup
  if (/^[A-Z0-9]{4}$/i.test(str)) {
    const icao = str.toUpperCase();
    for (const [iata, ap] of Object.entries(AIRPORTS)) {
      if (ap.icao === icao) return iata;
    }
  }

  // Search by name / city inside string
  for (const [iata, ap] of Object.entries(AIRPORTS)) {
    if (str.toLowerCase().includes(ap.city.toLowerCase()) || str.toLowerCase().includes(ap.name.toLowerCase())) {
      return iata;
    }
  }

  return str.toUpperCase();
}

/**
 * Returns airport object for given IATA / code
 */
export function getAirport(code) {
  if (!code) return null;
  const cleanCode = extractAirportCode(code);
  return AIRPORTS[cleanCode] || {
    name: code,
    city: code,
    country: "Unknown",
    countryCode: "??",
    lat: 0,
    lon: 0,
    icao: ""
  };
}

/**
 * Great Circle distance calculation using Haversine formula
 * Returns distance object with km, mi, nm
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 && !lon1 && !lat2 && !lon2) return { km: 0, mi: 0, nm: 0 };
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = Math.round(R * c);
  const mi = Math.round(km * 0.621371);
  const nm = Math.round(km * 0.539957);
  return { km, mi, nm };
}

/**
 * Generates an array of intermediate coordinates along a geodesic great-circle path
 * Automatically handles shortest arc and date-line wrapping.
 */
export function getGreatCircleArc(startLat, startLon, endLat, endLon, points = 60) {
  const coords = [];
  const p1 = { lat: startLat * Math.PI / 180, lon: startLon * Math.PI / 180 };
  const p2 = { lat: endLat * Math.PI / 180, lon: endLon * Math.PI / 180 };

  const dLon = p2.lon - p1.lon;
  const d = Math.acos(
    Math.sin(p1.lat) * Math.sin(p2.lat) +
    Math.cos(p1.lat) * Math.cos(p2.lat) * Math.cos(dLon)
  );

  if (isNaN(d) || d === 0) {
    return [[startLat, startLon], [endLat, endLon]];
  }

  for (let i = 0; i <= points; i++) {
    const f = i / points;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);

    const x = A * Math.cos(p1.lat) * Math.cos(p1.lon) + B * Math.cos(p2.lat) * Math.cos(p2.lon);
    const y = A * Math.cos(p1.lat) * Math.sin(p1.lon) + B * Math.cos(p2.lat) * Math.sin(p2.lon);
    const z = A * Math.sin(p1.lat) + B * Math.sin(p2.lat);

    const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * 180 / Math.PI;
    const lon = Math.atan2(y, x) * 180 / Math.PI;

    coords.push([lat, lon]);
  }

  return coords;
}
