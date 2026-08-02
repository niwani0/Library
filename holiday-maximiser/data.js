// Hong Kong 2027 holiday-maximiser data.
// Holidays: the 17 gazetted 2027 Hong Kong General Holidays.
// Countries: grouped by region with coordinates (for great-circle distance from
// Hong Kong), ideal travel months, and scenery keywords used to fetch a famous
// photo of the place — with season overrides so the shot suits the chosen month.

const YEAR = 2027;

// Hong Kong reference point (city centre) for all distance/flight-time maths.
const HK = { lat: 22.3193, lng: 114.1694 };
const HK_SCENE = { q: 'hongkong,victoriaharbour,skyline', caption: 'Victoria Harbour, Hong Kong' };

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
// now" blurb, and `scene` — a default famous view plus optional season overrides
// (`months` in 1-12) so the photo matches when the traveller is going.
const REGIONS = {
  Asia: [
    { name: 'Japan', flag: '🇯🇵', lat: 35.68, lng: 139.69, months: [3, 4, 5, 10, 11], blurb: 'Cherry blossoms in spring, fiery maples in autumn.',
      scene: { q: 'kyoto,temple,japan', caption: "Kyoto's temples", seasons: [
        { months: [3, 4], q: 'kyoto,cherryblossom', caption: 'Cherry blossoms in Kyoto' },
        { months: [10, 11], q: 'kyoto,autumn,maple', caption: 'Autumn maples in Kyoto' }] } },
    { name: 'South Korea', flag: '🇰🇷', lat: 37.57, lng: 126.98, months: [4, 5, 9, 10, 11], blurb: 'Mild shoulder seasons and golden ginkgo streets.',
      scene: { q: 'seoul,palace,korea', caption: 'Gyeongbokgung, Seoul', seasons: [
        { months: [4], q: 'korea,cherryblossom', caption: 'Spring blossoms in Korea' },
        { months: [10, 11], q: 'korea,autumn,foliage', caption: 'Autumn foliage in Korea' }] } },
    { name: 'Thailand', flag: '🇹🇭', lat: 13.75, lng: 100.5, months: [11, 12, 1, 2], blurb: 'Cool, dry season — perfect for temples and beaches.',
      scene: { q: 'thailand,temple,beach', caption: 'Thai temples & islands' } },
    { name: 'Vietnam', flag: '🇻🇳', lat: 21.03, lng: 105.85, months: [2, 3, 4, 11, 12], blurb: 'Dry and pleasant north-to-south.',
      scene: { q: 'halongbay,vietnam', caption: 'Ha Long Bay' } },
    { name: 'Taiwan', flag: '🇹🇼', lat: 25.03, lng: 121.56, months: [3, 4, 10, 11, 12], blurb: 'Night markets and mountains in mild, dry months.',
      scene: { q: 'taiwan,taipei,mountain', caption: 'Taipei & the mountains' } },
    { name: 'Cambodia', flag: '🇰🇭', lat: 11.55, lng: 104.92, months: [11, 12, 1, 2], blurb: "Cool, dry season for Angkor's temples.",
      scene: { q: 'angkorwat,cambodia', caption: 'Angkor Wat at dawn' } },
    { name: 'Indonesia (Bali)', flag: '🇮🇩', lat: -8.65, lng: 115.13, months: [4, 5, 6, 9, 10], blurb: 'Dry season sunshine before the crowds.',
      scene: { q: 'bali,rice,terrace', caption: 'Bali rice terraces' } },
    { name: 'India', flag: '🇮🇳', lat: 28.61, lng: 77.21, months: [10, 11, 12, 1, 2, 3], blurb: 'Cool, comfortable months for the north and Rajasthan.',
      scene: { q: 'tajmahal,india', caption: 'The Taj Mahal' } },
    { name: 'Nepal', flag: '🇳🇵', lat: 27.7, lng: 85.32, months: [3, 4, 10, 11], blurb: 'Clear Himalayan trekking skies.',
      scene: { q: 'himalaya,nepal,mountain', caption: 'Himalayan peaks' } },
    { name: 'Philippines', flag: '🇵🇭', lat: 14.6, lng: 120.98, months: [1, 2, 3, 4], blurb: 'Dry season island-hopping weather.',
      scene: { q: 'palawan,philippines,beach', caption: 'Palawan lagoons' } },
    { name: 'Singapore', flag: '🇸🇬', lat: 1.35, lng: 103.82, months: [2, 3, 4, 7], blurb: 'Slightly drier windows in a year-round city break.',
      scene: { q: 'singapore,marinabay,skyline', caption: 'Marina Bay skyline' } },
  ],
  'North America': [
    { name: 'USA', flag: '🇺🇸', lat: 38.9, lng: -77.04, months: [4, 5, 6, 9, 10], blurb: 'Spring blooms and crisp autumn colour.',
      scene: { q: 'grandcanyon,usa', caption: 'The Grand Canyon', seasons: [
        { months: [9, 10], q: 'newengland,autumn,foliage', caption: 'New England in the fall' }] } },
    { name: 'Canada', flag: '🇨🇦', lat: 45.42, lng: -75.7, months: [6, 7, 8, 9], blurb: 'Warm summers and blazing maple autumns.',
      scene: { q: 'banff,canada,rockies', caption: 'Banff & the Rockies', seasons: [
        { months: [9, 10], q: 'canada,autumn,maple', caption: 'Maple country in autumn' }] } },
    { name: 'Mexico', flag: '🇲🇽', lat: 19.43, lng: -99.13, months: [3, 4, 10, 11], blurb: 'Dry, sunny and festival-rich.',
      scene: { q: 'chichenitza,mexico', caption: 'Chichén Itzá' } },
  ],
  'Central America': [
    { name: 'Costa Rica', flag: '🇨🇷', lat: 9.93, lng: -84.08, months: [12, 1, 2, 3, 4], blurb: 'Dry season rainforest and beaches.',
      scene: { q: 'costarica,volcano,rainforest', caption: 'Rainforests & volcanoes' } },
    { name: 'Guatemala', flag: '🇬🇹', lat: 14.63, lng: -90.51, months: [11, 12, 1, 2, 3], blurb: 'Sunny highlands and Mayan ruins.',
      scene: { q: 'guatemala,antigua,volcano', caption: 'Antigua & its volcanoes' } },
    { name: 'Panama', flag: '🇵🇦', lat: 8.98, lng: -79.52, months: [12, 1, 2, 3, 4], blurb: 'Dry season city-and-canal weather.',
      scene: { q: 'panama,canal,city', caption: 'Panama Canal & skyline' } },
    { name: 'Belize', flag: '🇧🇿', lat: 17.5, lng: -88.2, months: [12, 1, 2, 3, 4], blurb: 'Reef-diving dry season.',
      scene: { q: 'belize,reef,caye', caption: 'Belize barrier reef' } },
  ],
  'South America': [
    { name: 'Peru', flag: '🇵🇪', lat: -12.05, lng: -77.04, months: [5, 6, 7, 8, 9], blurb: 'Dry Andean trekking season for Machu Picchu.',
      scene: { q: 'machupicchu,peru', caption: 'Machu Picchu' } },
    { name: 'Argentina', flag: '🇦🇷', lat: -34.6, lng: -58.38, months: [10, 11, 3, 4], blurb: 'Mild spring and autumn in Buenos Aires and Patagonia.',
      scene: { q: 'patagonia,argentina', caption: 'Patagonia' } },
    { name: 'Brazil', flag: '🇧🇷', lat: -22.9, lng: -43.17, months: [2, 3, 9, 10, 11, 12], blurb: 'Warm beaches and Carnaval energy.',
      scene: { q: 'riodejaneiro,brazil', caption: 'Rio de Janeiro' } },
    { name: 'Chile', flag: '🇨🇱', lat: -33.45, lng: -70.66, months: [10, 11, 12, 1, 2, 3], blurb: 'Southern-hemisphere summer, deserts to fjords.',
      scene: { q: 'atacama,chile,andes', caption: 'Atacama & the Andes' } },
    { name: 'Colombia', flag: '🇨🇴', lat: 4.71, lng: -74.07, months: [12, 1, 2, 3, 7, 8], blurb: 'Drier windows for coffee country and coast.',
      scene: { q: 'cartagena,colombia', caption: "Cartagena's old town" } },
  ],
  'Central Asia': [
    { name: 'Kazakhstan', flag: '🇰🇿', lat: 51.16, lng: 71.47, months: [5, 6, 7, 8, 9], blurb: 'Warm steppe-and-mountain summers.',
      scene: { q: 'kazakhstan,almaty,mountains', caption: 'Almaty mountains' } },
    { name: 'Uzbekistan', flag: '🇺🇿', lat: 41.3, lng: 69.24, months: [4, 5, 9, 10], blurb: 'Mild Silk Road spring and autumn.',
      scene: { q: 'samarkand,uzbekistan', caption: "Samarkand's blue domes" } },
    { name: 'Kyrgyzstan', flag: '🇰🇬', lat: 42.87, lng: 74.6, months: [6, 7, 8, 9], blurb: 'Alpine lakes and yurt-stay summers.',
      scene: { q: 'kyrgyzstan,lake,mountains', caption: 'Alpine lakes' } },
    { name: 'Tajikistan', flag: '🇹🇯', lat: 38.56, lng: 68.79, months: [6, 7, 8, 9], blurb: 'Pamir Highway season.',
      scene: { q: 'pamir,tajikistan,mountains', caption: 'The Pamirs' } },
  ],
  'Middle East': [
    { name: 'UAE', flag: '🇦🇪', lat: 25.2, lng: 55.27, months: [11, 12, 1, 2, 3], blurb: 'Cooler desert-and-city season.',
      scene: { q: 'dubai,skyline,desert', caption: 'Dubai skyline & dunes' } },
    { name: 'Jordan', flag: '🇯🇴', lat: 31.95, lng: 35.93, months: [3, 4, 5, 10, 11], blurb: 'Comfortable Petra and Wadi Rum weather.',
      scene: { q: 'petra,jordan', caption: 'Petra' } },
    { name: 'Oman', flag: '🇴🇲', lat: 23.58, lng: 58.4, months: [11, 12, 1, 2, 3], blurb: 'Mild wadis, forts and dunes.',
      scene: { q: 'oman,wadi,desert', caption: 'Wadis & dunes' } },
    { name: 'Turkey', flag: '🇹🇷', lat: 41.01, lng: 28.98, months: [4, 5, 6, 9, 10], blurb: 'Balmy Istanbul and Cappadocia shoulder seasons.',
      scene: { q: 'cappadocia,turkey,balloon', caption: 'Cappadocia balloons' } },
    { name: 'Israel', flag: '🇮🇱', lat: 31.77, lng: 35.21, months: [4, 5, 9, 10], blurb: 'Warm-but-not-scorching spring and autumn.',
      scene: { q: 'jerusalem,israel,oldcity', caption: 'Jerusalem old city' } },
  ],
  'Eastern Europe': [
    { name: 'Poland', flag: '🇵🇱', lat: 52.23, lng: 21.01, months: [5, 6, 9], blurb: 'Green, mild and uncrowded.',
      scene: { q: 'krakow,poland,oldtown', caption: 'Kraków old town' } },
    { name: 'Czechia', flag: '🇨🇿', lat: 50.08, lng: 14.44, months: [5, 6, 9, 10], blurb: 'Fairy-tale Prague in gentle weather.',
      scene: { q: 'prague,czech,castle', caption: 'Prague castle & bridge' } },
    { name: 'Hungary', flag: '🇭🇺', lat: 47.5, lng: 19.04, months: [4, 5, 6, 9, 10], blurb: 'Thermal baths and mild sightseeing.',
      scene: { q: 'budapest,hungary,parliament', caption: 'Budapest parliament' } },
    { name: 'Croatia', flag: '🇭🇷', lat: 45.81, lng: 15.98, months: [6, 7, 8, 9], blurb: 'Adriatic summer sailing weather.',
      scene: { q: 'dubrovnik,croatia', caption: 'Dubrovnik walls' } },
    { name: 'Romania', flag: '🇷🇴', lat: 44.43, lng: 26.1, months: [5, 6, 9], blurb: 'Lush Transylvania in shoulder season.',
      scene: { q: 'transylvania,romania,castle', caption: 'Transylvanian castles' } },
  ],
  'Western Europe': [
    { name: 'France', flag: '🇫🇷', lat: 48.85, lng: 2.35, months: [4, 5, 6, 9, 10], blurb: 'Warm days, thinner crowds than midsummer.',
      scene: { q: 'paris,eiffeltower,france', caption: 'Paris & the Eiffel Tower', seasons: [
        { months: [6, 7], q: 'provence,lavender,france', caption: 'Provence lavender fields' }] } },
    { name: 'Italy', flag: '🇮🇹', lat: 41.9, lng: 12.5, months: [4, 5, 6, 9, 10], blurb: 'Ideal light for Rome, Tuscany and the coast.',
      scene: { q: 'rome,colosseum,italy', caption: 'Rome & the Colosseum' } },
    { name: 'Spain', flag: '🇪🇸', lat: 40.42, lng: -3.7, months: [4, 5, 6, 9, 10], blurb: 'Warm, festive and comfortable to walk.',
      scene: { q: 'barcelona,sagradafamilia,spain', caption: 'Barcelona' } },
    { name: 'Germany', flag: '🇩🇪', lat: 52.52, lng: 13.4, months: [5, 6, 7, 8, 9, 12], blurb: 'Beer gardens in summer, markets in December.',
      scene: { q: 'neuschwanstein,germany,castle', caption: 'Bavarian castles', seasons: [
        { months: [12], q: 'germany,christmas,market', caption: 'Christmas markets' }] } },
    { name: 'Netherlands', flag: '🇳🇱', lat: 52.37, lng: 4.9, months: [4, 5, 6, 9], blurb: 'Tulip season and canal-side sun.',
      scene: { q: 'amsterdam,canal,netherlands', caption: 'Amsterdam canals', seasons: [
        { months: [4], q: 'netherlands,tulip,field', caption: 'Tulip fields in bloom' }] } },
    { name: 'Switzerland', flag: '🇨🇭', lat: 46.95, lng: 7.45, months: [6, 7, 8, 9, 12, 1, 2], blurb: 'Alpine hiking in summer, snow in winter.',
      scene: { q: 'switzerland,matterhorn,alps', caption: 'The Matterhorn', seasons: [
        { months: [12, 1, 2], q: 'switzerland,alps,snow', caption: 'The snowy Alps' }] } },
    { name: 'Portugal', flag: '🇵🇹', lat: 38.72, lng: -9.14, months: [4, 5, 6, 9, 10], blurb: 'Sunny, breezy and easy-going.',
      scene: { q: 'lisbon,portugal,tram', caption: "Lisbon's trams & tiles" } },
  ],
  Scandinavia: [
    { name: 'Iceland', flag: '🇮🇸', lat: 64.15, lng: -21.94, months: [6, 7, 8, 2, 3], blurb: 'Midnight sun in summer, auroras in late winter.',
      scene: { q: 'iceland,waterfall,landscape', caption: "Iceland's waterfalls", seasons: [
        { months: [2, 3], q: 'iceland,auroraborealis', caption: 'Northern lights over Iceland' },
        { months: [6, 7, 8], q: 'iceland,midnightsun,landscape', caption: 'Midnight-sun landscapes' }] } },
    { name: 'Norway', flag: '🇳🇴', lat: 59.91, lng: 10.75, months: [6, 7, 8, 1, 2, 3], blurb: 'Fjord cruising in summer, northern lights in winter.',
      scene: { q: 'norway,fjord', caption: 'The fjords', seasons: [
        { months: [1, 2, 3], q: 'norway,auroraborealis', caption: 'Northern lights over Norway' }] } },
    { name: 'Sweden', flag: '🇸🇪', lat: 59.33, lng: 18.07, months: [6, 7, 8, 12], blurb: 'Long light summers and cosy December.',
      scene: { q: 'stockholm,sweden,oldtown', caption: "Stockholm's old town", seasons: [
        { months: [12], q: 'sweden,winter,snow', caption: 'Snowy Sweden' }] } },
    { name: 'Finland', flag: '🇫🇮', lat: 60.17, lng: 24.94, months: [6, 7, 8, 12, 1, 2], blurb: 'Lakeland summers and Lapland winters.',
      scene: { q: 'finland,lake,forest', caption: 'Lakeland Finland', seasons: [
        { months: [12, 1, 2], q: 'lapland,finland,snow,aurora', caption: 'Lapland in winter' }] } },
    { name: 'Denmark', flag: '🇩🇰', lat: 55.68, lng: 12.57, months: [5, 6, 7, 8], blurb: 'Bright, bike-friendly Scandinavian summer.',
      scene: { q: 'copenhagen,nyhavn,denmark', caption: "Copenhagen's Nyhavn" } },
  ],
  'UK & Ireland': [
    { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', lat: 51.51, lng: -0.13, months: [5, 6, 7, 8, 9], blurb: 'Longest, warmest days of the year.',
      scene: { q: 'london,bigben,england', caption: 'London' } },
    { name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', lat: 55.95, lng: -3.19, months: [5, 6, 7, 8, 9], blurb: 'Highlands at their greenest and driest.',
      scene: { q: 'scotland,highlands,castle', caption: 'The Highlands' } },
    { name: 'Ireland', flag: '🇮🇪', lat: 53.35, lng: -6.26, months: [5, 6, 7, 8, 9], blurb: 'Mild, blooming and festival-filled.',
      scene: { q: 'ireland,cliffsofmoher', caption: 'Cliffs of Moher' } },
    { name: 'Wales', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', lat: 51.48, lng: -3.18, months: [5, 6, 7, 8, 9], blurb: 'Coast paths and castles in the sun.',
      scene: { q: 'wales,castle,mountains', caption: 'Welsh castles & peaks' } },
  ],
  'Australia & New Zealand': [
    { name: 'Australia', flag: '🇦🇺', lat: -33.87, lng: 151.21, months: [3, 4, 5, 9, 10, 11], blurb: 'Warm, mild shoulder seasons across the country.',
      scene: { q: 'sydney,operahouse,australia', caption: 'Sydney Harbour' } },
    { name: 'New Zealand', flag: '🇳🇿', lat: -41.29, lng: 174.78, months: [12, 1, 2, 3, 11], blurb: 'Southern-hemisphere summer for the great outdoors.',
      scene: { q: 'newzealand,mountains,lake', caption: 'Southern Alps & lakes' } },
  ],
  'Pacific Islands': [
    { name: 'Fiji', flag: '🇫🇯', lat: -18.14, lng: 178.44, months: [5, 6, 7, 8, 9, 10], blurb: 'Dry season sunshine and calm seas.',
      scene: { q: 'fiji,beach,island', caption: "Fiji's beaches" } },
    { name: 'French Polynesia', flag: '🇵🇫', lat: -17.68, lng: -149.4, months: [5, 6, 7, 8, 9], blurb: 'Dry, breezy over-water-bungalow weather.',
      scene: { q: 'borabora,tahiti,lagoon', caption: 'Bora Bora lagoon' } },
    { name: 'Samoa', flag: '🇼🇸', lat: -13.83, lng: -171.77, months: [5, 6, 7, 8, 9, 10], blurb: 'Cooler dry season across the islands.',
      scene: { q: 'samoa,beach,waterfall', caption: "Samoa's shores" } },
    { name: 'Palau', flag: '🇵🇼', lat: 7.5, lng: 134.62, months: [11, 12, 1, 2, 3, 4], blurb: 'Calmest seas for diving the rock islands.',
      scene: { q: 'palau,rockislands,lagoon', caption: "Palau's Rock Islands" } },
  ],
};
