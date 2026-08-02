// Hong Kong 2027 holiday-maximiser data.
// Holidays: the 17 gazetted 2027 Hong Kong General Holidays.
// Countries: grouped by region with coordinates (for great-circle distance from
// Hong Kong), ideal travel months, and a traditional-dress descriptor for the avatar.

const YEAR = 2027;

// Hong Kong reference point (city centre) for all distance/flight-time maths.
const HK = { lat: 22.3193, lng: 114.1694 };

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

// Each country: flag, coordinates, ideal travel months (1-12), traditional dress
// (name + emoji) worn by the avatar, and a one-line "why now" blurb keyed to season.
const REGIONS = {
  Asia: [
    { name: 'Japan', flag: '🇯🇵', lat: 35.68, lng: 139.69, months: [3, 4, 5, 10, 11], dress: { name: 'Kimono', emoji: '👘' }, blurb: 'Cherry blossoms in spring, fiery maples in autumn.' },
    { name: 'South Korea', flag: '🇰🇷', lat: 37.57, lng: 126.98, months: [4, 5, 9, 10, 11], dress: { name: 'Hanbok', emoji: '👘' }, blurb: 'Mild shoulder seasons and golden ginkgo streets.' },
    { name: 'Thailand', flag: '🇹🇭', lat: 13.75, lng: 100.5, months: [11, 12, 1, 2], dress: { name: 'Chut Thai', emoji: '🩷' }, blurb: 'Cool, dry season — perfect for temples and beaches.' },
    { name: 'Vietnam', flag: '🇻🇳', lat: 21.03, lng: 105.85, months: [2, 3, 4, 11, 12], dress: { name: 'Áo dài', emoji: '👗' }, blurb: 'Dry and pleasant north-to-south.' },
    { name: 'Taiwan', flag: '🇹🇼', lat: 25.03, lng: 121.56, months: [3, 4, 10, 11, 12], dress: { name: 'Qipao', emoji: '🏮' }, blurb: 'Night markets and mountains in mild, dry months.' },
    { name: 'Cambodia', flag: '🇰🇭', lat: 11.55, lng: 104.92, months: [11, 12, 1, 2], dress: { name: 'Sampot', emoji: '🛕' }, blurb: "Cool, dry season for Angkor's temples." },
    { name: 'Indonesia (Bali)', flag: '🇮🇩', lat: -8.65, lng: 115.13, months: [4, 5, 6, 9, 10], dress: { name: 'Kebaya', emoji: '🌺' }, blurb: 'Dry season sunshine before the crowds.' },
    { name: 'India', flag: '🇮🇳', lat: 28.61, lng: 77.21, months: [10, 11, 12, 1, 2, 3], dress: { name: 'Sari', emoji: '🥻' }, blurb: 'Cool, comfortable months for the north and Rajasthan.' },
    { name: 'Nepal', flag: '🇳🇵', lat: 27.7, lng: 85.32, months: [3, 4, 10, 11], dress: { name: 'Daura-Suruwal', emoji: '🏔️' }, blurb: 'Clear Himalayan trekking skies.' },
    { name: 'Philippines', flag: '🇵🇭', lat: 14.6, lng: 120.98, months: [1, 2, 3, 4], dress: { name: 'Barong / Terno', emoji: '🌴' }, blurb: 'Dry season island-hopping weather.' },
    { name: 'Singapore', flag: '🇸🇬', lat: 1.35, lng: 103.82, months: [2, 3, 4, 7], dress: { name: 'Baju Kurung', emoji: '🦁' }, blurb: 'Slightly drier windows in a year-round city break.' },
  ],
  'North America': [
    { name: 'USA', flag: '🇺🇸', lat: 38.9, lng: -77.04, months: [4, 5, 6, 9, 10], dress: { name: 'Denim & Stetson', emoji: '🤠' }, blurb: 'Spring blooms and crisp autumn colour.' },
    { name: 'Canada', flag: '🇨🇦', lat: 45.42, lng: -75.7, months: [6, 7, 8, 9], dress: { name: 'Flannel & toque', emoji: '🍁' }, blurb: 'Warm summers and blazing maple autumns.' },
    { name: 'Mexico', flag: '🇲🇽', lat: 19.43, lng: -99.13, months: [3, 4, 10, 11], dress: { name: 'China Poblana', emoji: '💃' }, blurb: 'Dry, sunny and festival-rich.' },
  ],
  'Central America': [
    { name: 'Costa Rica', flag: '🇨🇷', lat: 9.93, lng: -84.08, months: [12, 1, 2, 3, 4], dress: { name: 'Traje típico', emoji: '🦥' }, blurb: 'Dry season rainforest and beaches.' },
    { name: 'Guatemala', flag: '🇬🇹', lat: 14.63, lng: -90.51, months: [11, 12, 1, 2, 3], dress: { name: 'Huipil', emoji: '🌋' }, blurb: 'Sunny highlands and Mayan ruins.' },
    { name: 'Panama', flag: '🇵🇦', lat: 8.98, lng: -79.52, months: [12, 1, 2, 3, 4], dress: { name: 'Pollera', emoji: '🚢' }, blurb: 'Dry season city-and-canal weather.' },
    { name: 'Belize', flag: '🇧🇿', lat: 17.5, lng: -88.2, months: [12, 1, 2, 3, 4], dress: { name: 'Traditional dress', emoji: '🐠' }, blurb: 'Reef-diving dry season.' },
  ],
  'South America': [
    { name: 'Peru', flag: '🇵🇪', lat: -12.05, lng: -77.04, months: [5, 6, 7, 8, 9], dress: { name: 'Pollera & poncho', emoji: '🦙' }, blurb: 'Dry Andean trekking season for Machu Picchu.' },
    { name: 'Argentina', flag: '🇦🇷', lat: -34.6, lng: -58.38, months: [10, 11, 3, 4], dress: { name: 'Gaucho', emoji: '🐎' }, blurb: 'Mild spring and autumn in Buenos Aires and Patagonia.' },
    { name: 'Brazil', flag: '🇧🇷', lat: -22.9, lng: -43.17, months: [2, 3, 9, 10, 11, 12], dress: { name: 'Carnaval', emoji: '🎭' }, blurb: 'Warm beaches and Carnaval energy.' },
    { name: 'Chile', flag: '🇨🇱', lat: -33.45, lng: -70.66, months: [10, 11, 12, 1, 2, 3], dress: { name: 'Huaso', emoji: '🍇' }, blurb: 'Southern-hemisphere summer, deserts to fjords.' },
    { name: 'Colombia', flag: '🇨🇴', lat: 4.71, lng: -74.07, months: [12, 1, 2, 3, 7, 8], dress: { name: 'Traje típico', emoji: '☕' }, blurb: 'Drier windows for coffee country and coast.' },
  ],
  'Central Asia': [
    { name: 'Kazakhstan', flag: '🇰🇿', lat: 51.16, lng: 71.47, months: [5, 6, 7, 8, 9], dress: { name: 'Chapan', emoji: '🦅' }, blurb: 'Warm steppe-and-mountain summers.' },
    { name: 'Uzbekistan', flag: '🇺🇿', lat: 41.3, lng: 69.24, months: [4, 5, 9, 10], dress: { name: 'Atlas & chapan', emoji: '🕌' }, blurb: 'Mild Silk Road spring and autumn.' },
    { name: 'Kyrgyzstan', flag: '🇰🇬', lat: 42.87, lng: 74.6, months: [6, 7, 8, 9], dress: { name: 'Kalpak & chapan', emoji: '🏔️' }, blurb: 'Alpine lakes and yurt-stay summers.' },
    { name: 'Tajikistan', flag: '🇹🇯', lat: 38.56, lng: 68.79, months: [6, 7, 8, 9], dress: { name: 'Kurta & toqi', emoji: '⛰️' }, blurb: 'Pamir Highway season.' },
  ],
  'Middle East': [
    { name: 'UAE', flag: '🇦🇪', lat: 25.2, lng: 55.27, months: [11, 12, 1, 2, 3], dress: { name: 'Kandura / Abaya', emoji: '🕌' }, blurb: 'Cooler desert-and-city season.' },
    { name: 'Jordan', flag: '🇯🇴', lat: 31.95, lng: 35.93, months: [3, 4, 5, 10, 11], dress: { name: 'Thobe & keffiyeh', emoji: '🏜️' }, blurb: 'Comfortable Petra and Wadi Rum weather.' },
    { name: 'Oman', flag: '🇴🇲', lat: 23.58, lng: 58.4, months: [11, 12, 1, 2, 3], dress: { name: 'Dishdasha', emoji: '🐫' }, blurb: 'Mild wadis, forts and dunes.' },
    { name: 'Turkey', flag: '🇹🇷', lat: 41.01, lng: 28.98, months: [4, 5, 6, 9, 10], dress: { name: 'Ottoman kaftan', emoji: '🎈' }, blurb: 'Balmy Istanbul and Cappadocia shoulder seasons.' },
    { name: 'Israel', flag: '🇮🇱', lat: 31.77, lng: 35.21, months: [4, 5, 9, 10], dress: { name: 'Traditional dress', emoji: '🕎' }, blurb: 'Warm-but-not-scorching spring and autumn.' },
  ],
  'Eastern Europe': [
    { name: 'Poland', flag: '🇵🇱', lat: 52.23, lng: 21.01, months: [5, 6, 9], dress: { name: 'Kraków folk dress', emoji: '🏰' }, blurb: 'Green, mild and uncrowded.' },
    { name: 'Czechia', flag: '🇨🇿', lat: 50.08, lng: 14.44, months: [5, 6, 9, 10], dress: { name: 'Kroj', emoji: '🍺' }, blurb: 'Fairy-tale Prague in gentle weather.' },
    { name: 'Hungary', flag: '🇭🇺', lat: 47.5, lng: 19.04, months: [4, 5, 6, 9, 10], dress: { name: 'Matyó embroidery', emoji: '♨️' }, blurb: 'Thermal baths and mild sightseeing.' },
    { name: 'Croatia', flag: '🇭🇷', lat: 45.81, lng: 15.98, months: [6, 7, 8, 9], dress: { name: 'Narodna nošnja', emoji: '⛵' }, blurb: 'Adriatic summer sailing weather.' },
    { name: 'Romania', flag: '🇷🇴', lat: 44.43, lng: 26.1, months: [5, 6, 9], dress: { name: 'Ie blouse', emoji: '🧛' }, blurb: 'Lush Transylvania in shoulder season.' },
  ],
  'Western Europe': [
    { name: 'France', flag: '🇫🇷', lat: 48.85, lng: 2.35, months: [4, 5, 6, 9, 10], dress: { name: 'Regional folk dress', emoji: '🥐' }, blurb: 'Warm days, thinner crowds than midsummer.' },
    { name: 'Italy', flag: '🇮🇹', lat: 41.9, lng: 12.5, months: [4, 5, 6, 9, 10], dress: { name: 'Regional costume', emoji: '🍝' }, blurb: 'Ideal light for Rome, Tuscany and the coast.' },
    { name: 'Spain', flag: '🇪🇸', lat: 40.42, lng: -3.7, months: [4, 5, 6, 9, 10], dress: { name: 'Flamenco traje', emoji: '💃' }, blurb: 'Warm, festive and comfortable to walk.' },
    { name: 'Germany', flag: '🇩🇪', lat: 52.52, lng: 13.4, months: [5, 6, 7, 8, 9, 12], dress: { name: 'Dirndl / Lederhosen', emoji: '🥨' }, blurb: 'Beer gardens in summer, markets in December.' },
    { name: 'Netherlands', flag: '🇳🇱', lat: 52.37, lng: 4.9, months: [4, 5, 6, 9], dress: { name: 'Klederdracht', emoji: '🌷' }, blurb: 'Tulip season and canal-side sun.' },
    { name: 'Switzerland', flag: '🇨🇭', lat: 46.95, lng: 7.45, months: [6, 7, 8, 9, 12, 1, 2], dress: { name: 'Tracht', emoji: '🏔️' }, blurb: 'Alpine hiking in summer, snow in winter.' },
    { name: 'Portugal', flag: '🇵🇹', lat: 38.72, lng: -9.14, months: [4, 5, 6, 9, 10], dress: { name: 'Traje regional', emoji: '🚋' }, blurb: 'Sunny, breezy and easy-going.' },
  ],
  Scandinavia: [
    { name: 'Iceland', flag: '🇮🇸', lat: 64.15, lng: -21.94, months: [6, 7, 8, 2, 3], dress: { name: 'Þjóðbúningur', emoji: '🌋' }, blurb: 'Midnight sun in summer, auroras in late winter.' },
    { name: 'Norway', flag: '🇳🇴', lat: 59.91, lng: 10.75, months: [6, 7, 8, 1, 2, 3], dress: { name: 'Bunad', emoji: '🏔️' }, blurb: 'Fjord cruising in summer, northern lights in winter.' },
    { name: 'Sweden', flag: '🇸🇪', lat: 59.33, lng: 18.07, months: [6, 7, 8, 12], dress: { name: 'Sverigedräkten', emoji: '🦌' }, blurb: 'Long light summers and cosy December.' },
    { name: 'Finland', flag: '🇫🇮', lat: 60.17, lng: 24.94, months: [6, 7, 8, 12, 1, 2], dress: { name: 'Kansallispuku', emoji: '🦉' }, blurb: 'Lakeland summers and Lapland winters.' },
    { name: 'Denmark', flag: '🇩🇰', lat: 55.68, lng: 12.57, months: [5, 6, 7, 8], dress: { name: 'Folkedragt', emoji: '🚲' }, blurb: 'Bright, bike-friendly Scandinavian summer.' },
  ],
  'UK & Ireland': [
    { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', lat: 51.51, lng: -0.13, months: [5, 6, 7, 8, 9], dress: { name: 'Morris / Beefeater', emoji: '🎡' }, blurb: 'Longest, warmest days of the year.' },
    { name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', lat: 55.95, lng: -3.19, months: [5, 6, 7, 8, 9], dress: { name: 'Kilt & tartan', emoji: '🎻' }, blurb: 'Highlands at their greenest and driest.' },
    { name: 'Ireland', flag: '🇮🇪', lat: 53.35, lng: -6.26, months: [5, 6, 7, 8, 9], dress: { name: 'Léine & brat', emoji: '☘️' }, blurb: 'Mild, blooming and festival-filled.' },
    { name: 'Wales', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', lat: 51.48, lng: -3.18, months: [5, 6, 7, 8, 9], dress: { name: 'Welsh costume', emoji: '🐉' }, blurb: 'Coast paths and castles in the sun.' },
  ],
  'Australia & New Zealand': [
    { name: 'Australia', flag: '🇦🇺', lat: -33.87, lng: 151.21, months: [3, 4, 5, 9, 10, 11], dress: { name: 'Akubra & Driza-Bone', emoji: '🦘' }, blurb: 'Warm, mild shoulder seasons across the country.' },
    { name: 'New Zealand', flag: '🇳🇿', lat: -41.29, lng: 174.78, months: [12, 1, 2, 3, 11], dress: { name: 'Māori korowai', emoji: '🥝' }, blurb: 'Southern-hemisphere summer for the great outdoors.' },
  ],
  'Pacific Islands': [
    { name: 'Fiji', flag: '🇫🇯', lat: -18.14, lng: 178.44, months: [5, 6, 7, 8, 9, 10], dress: { name: 'Sulu & masi', emoji: '🏝️' }, blurb: 'Dry season sunshine and calm seas.' },
    { name: 'French Polynesia', flag: '🇵🇫', lat: -17.68, lng: -149.4, months: [5, 6, 7, 8, 9], dress: { name: 'Pāreu', emoji: '🐚' }, blurb: 'Dry, breezy over-water-bungalow weather.' },
    { name: 'Samoa', flag: '🇼🇸', lat: -13.83, lng: -171.77, months: [5, 6, 7, 8, 9, 10], dress: { name: 'Puletasi & lavalava', emoji: '🌺' }, blurb: 'Cooler dry season across the islands.' },
    { name: 'Palau', flag: '🇵🇼', lat: 7.5, lng: 134.62, months: [11, 12, 1, 2, 3, 4], dress: { name: 'Traditional dress', emoji: '🪸' }, blurb: 'Calmest seas for diving the rock islands.' },
  ],
};
