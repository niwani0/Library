// Hong Kong 2027 holiday-maximiser data.
// Holidays: the 17 gazetted 2027 Hong Kong General Holidays.
// Countries: grouped by region with coordinates (for great-circle distance from
// Hong Kong), ideal travel months, and scenery keywords used to fetch a famous
// photo of the place — with season overrides so the shot suits the chosen month.

const YEAR = 2027;

// Hong Kong reference point (city centre) for all distance/flight-time maths.
const HK = { lat: 22.3193, lng: 114.1694 };
const HK_SCENE = { wiki: 'Victoria Harbour', caption: 'Victoria Harbour, Hong Kong' };

// Source: GovHK "General holidays for 2027". `lunar` flags festivals whose date
// follows the Chinese lunar calendar (kept here so the UI can label them).
const HOLIDAYS = [
  { date: '2027-01-01', name: "New Year's Day" },
  { date: '2027-02-06', name: 'Lunar New Year (1st day)', lunar: true },
  { date: '2027-02-08', name: 'Lunar New Year (3rd day)', lunar: true },
  { date: '2027-02-09', name: 'Lunar New Year (4th day, in lieu)', lunar: true },
  { date: '2027-03-26', name: 'Good Friday' },
  { date: '2027-03-27', name: 'Day after Good Friday' },
  { date: '2027-03-29', name: 'Easter Monday' },
  { date: '2027-04-05', name: 'Ching Ming Festival', lunar: true },
  { date: '2027-05-01', name: 'Labour Day' },
  { date: '2027-05-13', name: "Buddha's Birthday", lunar: true },
  { date: '2027-06-09', name: 'Tuen Ng (Dragon Boat) Festival', lunar: true },
  { date: '2027-07-01', name: 'HKSAR Establishment Day' },
  { date: '2027-09-16', name: 'Day after Mid-Autumn Festival', lunar: true },
  { date: '2027-10-01', name: 'National Day' },
  { date: '2027-10-08', name: 'Chung Yeung Festival', lunar: true },
  { date: '2027-12-25', name: 'Christmas Day' },
  { date: '2027-12-27', name: 'First weekday after Christmas' },
];

// Each country: flag, coordinates, ideal travel months (1-12), a one-line "why
// now" blurb, and `scene` — an iconic landmark (by Wikipedia article title, whose
// lead photo is fetched) plus optional season overrides (`months` in 1-12) so the
// shot matches when the traveller is going.
const REGIONS = {
  Asia: [
    { name: 'Japan', flag: '🇯🇵', lat: 35.68, lng: 139.69, months: [3, 4, 5, 10, 11], blurb: 'Cherry blossoms in spring, fiery maples in autumn.',
      scene: { wiki: 'Fushimi Inari-taisha', caption: "Kyoto's torii gates", seasons: [
        { months: [3, 4], wiki: 'Cherry blossom', caption: 'Cherry blossoms in Japan' },
        { months: [10, 11], wiki: 'Kiyomizu-dera', caption: 'Autumn temples of Kyoto' }] } },
    { name: 'South Korea', flag: '🇰🇷', lat: 37.57, lng: 126.98, months: [4, 5, 9, 10, 11], blurb: 'Mild shoulder seasons and golden ginkgo streets.',
      scene: { wiki: 'Gyeongbokgung', caption: 'Gyeongbokgung Palace, Seoul' } },
    { name: 'Thailand', flag: '🇹🇭', lat: 13.75, lng: 100.5, months: [11, 12, 1, 2], blurb: 'Cool, dry season — perfect for temples and beaches.',
      scene: { wiki: 'Wat Arun', caption: 'Wat Arun, Bangkok' } },
    { name: 'Vietnam', flag: '🇻🇳', lat: 21.03, lng: 105.85, months: [2, 3, 4, 11, 12], blurb: 'Dry and pleasant north-to-south.',
      scene: { wiki: 'Hạ Long Bay', caption: 'Ha Long Bay' } },
    { name: 'Taiwan', flag: '🇹🇼', lat: 25.03, lng: 121.56, months: [3, 4, 10, 11, 12], blurb: 'Night markets and mountains in mild, dry months.',
      scene: { wiki: 'Taipei 101', caption: 'Taipei 101' } },
    { name: 'Cambodia', flag: '🇰🇭', lat: 11.55, lng: 104.92, months: [11, 12, 1, 2], blurb: "Cool, dry season for Angkor's temples.",
      scene: { wiki: 'Angkor Wat', caption: 'Angkor Wat at dawn' } },
    { name: 'Indonesia (Bali)', flag: '🇮🇩', lat: -8.65, lng: 115.13, months: [4, 5, 6, 9, 10], blurb: 'Dry season sunshine before the crowds.',
      scene: { wiki: 'Tanah Lot', caption: 'Tanah Lot, Bali' } },
    { name: 'India', flag: '🇮🇳', lat: 28.61, lng: 77.21, months: [10, 11, 12, 1, 2, 3], blurb: 'Cool, comfortable months for the north and Rajasthan.',
      scene: { wiki: 'Taj Mahal', caption: 'The Taj Mahal' } },
    { name: 'Nepal', flag: '🇳🇵', lat: 27.7, lng: 85.32, months: [3, 4, 10, 11], blurb: 'Clear Himalayan trekking skies.',
      scene: { wiki: 'Machapuchare', caption: 'Himalayan peaks' } },
    { name: 'Philippines', flag: '🇵🇭', lat: 14.6, lng: 120.98, months: [1, 2, 3, 4], blurb: 'Dry season island-hopping weather.',
      scene: { wiki: 'El Nido, Palawan', caption: 'Palawan lagoons' } },
    { name: 'Singapore', flag: '🇸🇬', lat: 1.35, lng: 103.82, months: [2, 3, 4, 7], blurb: 'Slightly drier windows in a year-round city break.',
      scene: { wiki: 'Gardens by the Bay', caption: 'Gardens by the Bay' } },
  ],
  'North America': [
    { name: 'USA', flag: '🇺🇸', lat: 38.9, lng: -77.04, months: [4, 5, 6, 9, 10], blurb: 'Spring blooms and crisp autumn colour.',
      scene: { wiki: 'Grand Canyon', caption: 'The Grand Canyon' } },
    { name: 'Canada', flag: '🇨🇦', lat: 45.42, lng: -75.7, months: [6, 7, 8, 9], blurb: 'Warm summers and blazing maple autumns.',
      scene: { wiki: 'Moraine Lake', caption: 'Moraine Lake, Banff' } },
    { name: 'Mexico', flag: '🇲🇽', lat: 19.43, lng: -99.13, months: [3, 4, 10, 11], blurb: 'Dry, sunny and festival-rich.',
      scene: { wiki: 'Chichen Itza', caption: 'Chichén Itzá' } },
  ],
  'Central America': [
    { name: 'Costa Rica', flag: '🇨🇷', lat: 9.93, lng: -84.08, months: [12, 1, 2, 3, 4], blurb: 'Dry season rainforest and beaches.',
      scene: { wiki: 'Arenal Volcano', caption: 'Arenal Volcano' } },
    { name: 'Guatemala', flag: '🇬🇹', lat: 14.63, lng: -90.51, months: [11, 12, 1, 2, 3], blurb: 'Sunny highlands and Mayan ruins.',
      scene: { wiki: 'Lake Atitlán', caption: 'Lake Atitlán' } },
    { name: 'Panama', flag: '🇵🇦', lat: 8.98, lng: -79.52, months: [12, 1, 2, 3, 4], blurb: 'Dry season city-and-canal weather.',
      scene: { wiki: 'Guna Yala', caption: 'The San Blas Islands' } },
    { name: 'Belize', flag: '🇧🇿', lat: 17.5, lng: -88.2, months: [12, 1, 2, 3, 4], blurb: 'Reef-diving dry season.',
      scene: { wiki: 'Great Blue Hole', caption: 'The Great Blue Hole' } },
  ],
  'South America': [
    { name: 'Peru', flag: '🇵🇪', lat: -12.05, lng: -77.04, months: [5, 6, 7, 8, 9], blurb: 'Dry Andean trekking season for Machu Picchu.',
      scene: { wiki: 'Machu Picchu', caption: 'Machu Picchu' } },
    { name: 'Argentina', flag: '🇦🇷', lat: -34.6, lng: -58.38, months: [10, 11, 3, 4], blurb: 'Mild spring and autumn in Buenos Aires and Patagonia.',
      scene: { wiki: 'Fitz Roy', caption: "Patagonia's Mount Fitz Roy" } },
    { name: 'Brazil', flag: '🇧🇷', lat: -22.9, lng: -43.17, months: [2, 3, 9, 10, 11, 12], blurb: 'Warm beaches and Carnaval energy.',
      scene: { wiki: 'Christ the Redeemer (statue)', caption: 'Rio de Janeiro' } },
    { name: 'Chile', flag: '🇨🇱', lat: -33.45, lng: -70.66, months: [10, 11, 12, 1, 2, 3], blurb: 'Southern-hemisphere summer, deserts to fjords.',
      scene: { wiki: 'Torres del Paine', caption: 'Torres del Paine' } },
    { name: 'Colombia', flag: '🇨🇴', lat: 4.71, lng: -74.07, months: [12, 1, 2, 3, 7, 8], blurb: 'Drier windows for coffee country and coast.',
      scene: { wiki: 'Cartagena, Colombia', caption: 'Cartagena' } },
  ],
  'Central Asia': [
    { name: 'Kazakhstan', flag: '🇰🇿', lat: 51.16, lng: 71.47, months: [5, 6, 7, 8, 9], blurb: 'Warm steppe-and-mountain summers.',
      scene: { wiki: 'Big Almaty Lake', caption: 'Big Almaty Lake' } },
    { name: 'Uzbekistan', flag: '🇺🇿', lat: 41.3, lng: 69.24, months: [4, 5, 9, 10], blurb: 'Mild Silk Road spring and autumn.',
      scene: { wiki: 'Registan', caption: 'The Registan, Samarkand' } },
    { name: 'Kyrgyzstan', flag: '🇰🇬', lat: 42.87, lng: 74.6, months: [6, 7, 8, 9], blurb: 'Alpine lakes and yurt-stay summers.',
      scene: { wiki: 'Song-Köl Lake', caption: 'Lake Song-Köl' } },
    { name: 'Tajikistan', flag: '🇹🇯', lat: 38.56, lng: 68.79, months: [6, 7, 8, 9], blurb: 'Pamir Highway season.',
      scene: { wiki: 'Iskanderkul', caption: 'Iskanderkul lake' } },
  ],
  'Middle East': [
    { name: 'UAE', flag: '🇦🇪', lat: 25.2, lng: 55.27, months: [11, 12, 1, 2, 3], blurb: 'Cooler desert-and-city season.',
      scene: { wiki: 'Burj Khalifa', caption: 'Dubai & the Burj Khalifa' } },
    { name: 'Jordan', flag: '🇯🇴', lat: 31.95, lng: 35.93, months: [3, 4, 5, 10, 11], blurb: 'Comfortable Petra and Wadi Rum weather.',
      scene: { wiki: 'Petra', caption: 'Petra' } },
    { name: 'Oman', flag: '🇴🇲', lat: 23.58, lng: 58.4, months: [11, 12, 1, 2, 3], blurb: 'Mild wadis, forts and dunes.',
      scene: { wiki: 'Wadi Shab', caption: 'Wadi Shab' } },
    { name: 'Turkey', flag: '🇹🇷', lat: 41.01, lng: 28.98, months: [4, 5, 6, 9, 10], blurb: 'Balmy Istanbul and Cappadocia shoulder seasons.',
      scene: { wiki: 'Cappadocia', caption: 'Cappadocia balloons' } },
    { name: 'Israel', flag: '🇮🇱', lat: 31.77, lng: 35.21, months: [4, 5, 9, 10], blurb: 'Warm-but-not-scorching spring and autumn.',
      scene: { wiki: 'Old City (Jerusalem)', caption: "Jerusalem's Old City" } },
  ],
  'Eastern Europe': [
    { name: 'Poland', flag: '🇵🇱', lat: 52.23, lng: 21.01, months: [5, 6, 9], blurb: 'Green, mild and uncrowded.',
      scene: { wiki: 'Wawel Castle', caption: 'Wawel Castle, Kraków' } },
    { name: 'Czechia', flag: '🇨🇿', lat: 50.08, lng: 14.44, months: [5, 6, 9, 10], blurb: 'Fairy-tale Prague in gentle weather.',
      scene: { wiki: 'Charles Bridge', caption: 'Charles Bridge, Prague' } },
    { name: 'Hungary', flag: '🇭🇺', lat: 47.5, lng: 19.04, months: [4, 5, 6, 9, 10], blurb: 'Thermal baths and mild sightseeing.',
      scene: { wiki: 'Hungarian Parliament Building', caption: "Budapest's Parliament" } },
    { name: 'Croatia', flag: '🇭🇷', lat: 45.81, lng: 15.98, months: [6, 7, 8, 9], blurb: 'Adriatic summer sailing weather.',
      scene: { wiki: 'Plitvice Lakes National Park', caption: 'Plitvice Lakes' } },
    { name: 'Romania', flag: '🇷🇴', lat: 44.43, lng: 26.1, months: [5, 6, 9], blurb: 'Lush Transylvania in shoulder season.',
      scene: { wiki: 'Transfăgărășan', caption: 'The Transfăgărășan road' } },
  ],
  'Western Europe': [
    { name: 'France', flag: '🇫🇷', lat: 48.85, lng: 2.35, months: [4, 5, 6, 9, 10], blurb: 'Warm days, thinner crowds than midsummer.',
      scene: { wiki: 'Eiffel Tower', caption: 'Paris & the Eiffel Tower', seasons: [
        { months: [6, 7], wiki: 'Lavandula', caption: 'Provence lavender fields' }] } },
    { name: 'Italy', flag: '🇮🇹', lat: 41.9, lng: 12.5, months: [4, 5, 6, 9, 10], blurb: 'Ideal light for Rome, Tuscany and the coast.',
      scene: { wiki: 'Amalfi Coast', caption: 'The Amalfi Coast' } },
    { name: 'Spain', flag: '🇪🇸', lat: 40.42, lng: -3.7, months: [4, 5, 6, 9, 10], blurb: 'Warm, festive and comfortable to walk.',
      scene: { wiki: 'Sagrada Família', caption: "Barcelona's Sagrada Família" } },
    { name: 'Germany', flag: '🇩🇪', lat: 52.52, lng: 13.4, months: [5, 6, 7, 8, 9, 12], blurb: 'Beer gardens in summer, markets in December.',
      scene: { wiki: 'Neuschwanstein Castle', caption: 'Neuschwanstein Castle', seasons: [
        { months: [12], wiki: 'Christmas market', caption: 'German Christmas markets' }] } },
    { name: 'Netherlands', flag: '🇳🇱', lat: 52.37, lng: 4.9, months: [4, 5, 6, 9], blurb: 'Tulip season and canal-side sun.',
      scene: { wiki: 'Canals of Amsterdam', caption: "Amsterdam's canals", seasons: [
        { months: [4], wiki: 'Keukenhof', caption: 'Keukenhof tulip gardens' }] } },
    { name: 'Switzerland', flag: '🇨🇭', lat: 46.95, lng: 7.45, months: [6, 7, 8, 9, 12, 1, 2], blurb: 'Alpine hiking in summer, snow in winter.',
      scene: { wiki: 'Matterhorn', caption: 'The Matterhorn' } },
    { name: 'Portugal', flag: '🇵🇹', lat: 38.72, lng: -9.14, months: [4, 5, 6, 9, 10], blurb: 'Sunny, breezy and easy-going.',
      scene: { wiki: 'Pena Palace', caption: "Sintra's Pena Palace" } },
  ],
  Scandinavia: [
    { name: 'Iceland', flag: '🇮🇸', lat: 64.15, lng: -21.94, months: [6, 7, 8, 2, 3], blurb: 'Midnight sun in summer, auroras in late winter.',
      scene: { wiki: 'Skógafoss', caption: "Iceland's waterfalls", seasons: [
        { months: [2, 3], wiki: 'Aurora', caption: 'Northern lights over Iceland' }] } },
    { name: 'Norway', flag: '🇳🇴', lat: 59.91, lng: 10.75, months: [6, 7, 8, 1, 2, 3], blurb: 'Fjord cruising in summer, northern lights in winter.',
      scene: { wiki: 'Geirangerfjord', caption: 'The Norwegian fjords', seasons: [
        { months: [1, 2, 3], wiki: 'Aurora', caption: 'Northern lights over Norway' }] } },
    { name: 'Sweden', flag: '🇸🇪', lat: 59.33, lng: 18.07, months: [6, 7, 8, 12], blurb: 'Long light summers and cosy December.',
      scene: { wiki: 'Gamla stan', caption: "Stockholm's old town" } },
    { name: 'Finland', flag: '🇫🇮', lat: 60.17, lng: 24.94, months: [6, 7, 8, 12, 1, 2], blurb: 'Lakeland summers and Lapland winters.',
      scene: { wiki: 'Helsinki Cathedral', caption: 'Helsinki', seasons: [
        { months: [12, 1, 2], wiki: 'Aurora', caption: "Lapland's northern lights" }] } },
    { name: 'Denmark', flag: '🇩🇰', lat: 55.68, lng: 12.57, months: [5, 6, 7, 8], blurb: 'Bright, bike-friendly Scandinavian summer.',
      scene: { wiki: 'Nyhavn', caption: "Copenhagen's Nyhavn" } },
  ],
  'UK & Ireland': [
    { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', lat: 51.51, lng: -0.13, months: [5, 6, 7, 8, 9], blurb: 'Longest, warmest days of the year.',
      scene: { wiki: 'Tower Bridge', caption: 'London' } },
    { name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', lat: 55.95, lng: -3.19, months: [5, 6, 7, 8, 9], blurb: 'Highlands at their greenest and driest.',
      scene: { wiki: 'Glenfinnan Viaduct', caption: 'The Scottish Highlands' } },
    { name: 'Ireland', flag: '🇮🇪', lat: 53.35, lng: -6.26, months: [5, 6, 7, 8, 9], blurb: 'Mild, blooming and festival-filled.',
      scene: { wiki: 'Cliffs of Moher', caption: 'Cliffs of Moher' } },
    { name: 'Wales', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', lat: 51.48, lng: -3.18, months: [5, 6, 7, 8, 9], blurb: 'Coast paths and castles in the sun.',
      scene: { wiki: 'Snowdon', caption: 'Snowdon, Wales' } },
  ],
  'Australia & New Zealand': [
    { name: 'Australia', flag: '🇦🇺', lat: -33.87, lng: 151.21, months: [3, 4, 5, 9, 10, 11], blurb: 'Warm, mild shoulder seasons across the country.',
      scene: { wiki: 'Sydney Opera House', caption: 'Sydney Harbour' } },
    { name: 'New Zealand', flag: '🇳🇿', lat: -41.29, lng: 174.78, months: [12, 1, 2, 3, 11], blurb: 'Southern-hemisphere summer for the great outdoors.',
      scene: { wiki: 'Milford Sound', caption: 'Milford Sound' } },
  ],
  'Pacific Islands': [
    { name: 'Fiji', flag: '🇫🇯', lat: -18.14, lng: 178.44, months: [5, 6, 7, 8, 9, 10], blurb: 'Dry season sunshine and calm seas.',
      scene: { wiki: 'Mamanuca Islands', caption: "Fiji's islands" } },
    { name: 'French Polynesia', flag: '🇵🇫', lat: -17.68, lng: -149.4, months: [5, 6, 7, 8, 9], blurb: 'Dry, breezy over-water-bungalow weather.',
      scene: { wiki: 'Bora Bora', caption: 'Bora Bora' } },
    { name: 'Samoa', flag: '🇼🇸', lat: -13.83, lng: -171.77, months: [5, 6, 7, 8, 9, 10], blurb: 'Cooler dry season across the islands.',
      scene: { wiki: 'To Sua Ocean Trench', caption: 'To Sua Ocean Trench' } },
    { name: 'Palau', flag: '🇵🇼', lat: 7.5, lng: 134.62, months: [11, 12, 1, 2, 3, 4], blurb: 'Calmest seas for diving the rock islands.',
      scene: { wiki: 'Rock Islands', caption: "Palau's Rock Islands" } },
  ],
};
