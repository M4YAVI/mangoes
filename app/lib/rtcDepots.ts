// Curated list of major RTC bus stations / cargo depots that the farm ships to.
// Customers pick the depot they will collect from — eliminates address ambiguity.
// Edit freely; the depot dropdown re-renders from this list and the server
// validates against `code`.

export interface RtcDepot {
  code: string;          // stable slug — stored on the order, never changes
  name: string;          // display name
  city: string;
  state: 'TG' | 'AP' | 'KA' | 'TN' | 'OD' | 'MH';
  landmark?: string;     // optional short address hint shown under the option
  aliases?: string[];    // for search ("MGBS", "Imlibun", "Jubilee" etc.)
}

export const RTC_DEPOTS: RtcDepot[] = [
  // ===== Telangana =====
  { code: 'tg-mgbs',          name: 'MGBS — Mahatma Gandhi Bus Station',  city: 'Hyderabad',   state: 'TG', landmark: 'Imlibun, Hyderabad',          aliases: ['MGBS', 'Imlibun', 'Hyderabad central'] },
  { code: 'tg-jbs',           name: 'JBS — Jubilee Bus Station',          city: 'Secunderabad',state: 'TG', landmark: 'Secunderabad, Hyderabad',      aliases: ['JBS', 'Jubilee', 'Secunderabad bus stand'] },
  { code: 'tg-uppal',         name: 'Uppal Bus Depot',                    city: 'Hyderabad',   state: 'TG', landmark: 'Uppal X-Roads',                aliases: ['Uppal'] },
  { code: 'tg-warangal',      name: 'Warangal Central Bus Stand',         city: 'Warangal',    state: 'TG', landmark: 'Hanamkonda, Warangal',         aliases: ['Hanamkonda'] },
  { code: 'tg-karimnagar',    name: 'Karimnagar Bus Stand',               city: 'Karimnagar',  state: 'TG' },
  { code: 'tg-khammam',       name: 'Khammam Bus Stand',                  city: 'Khammam',     state: 'TG' },
  { code: 'tg-nizamabad',     name: 'Nizamabad Bus Stand',                city: 'Nizamabad',   state: 'TG' },
  { code: 'tg-mahabubnagar',  name: 'Mahabubnagar Bus Stand',             city: 'Mahabubnagar',state: 'TG', aliases: ['Palamuru'] },
  { code: 'tg-nalgonda',      name: 'Nalgonda Bus Stand',                 city: 'Nalgonda',    state: 'TG' },
  { code: 'tg-suryapet',      name: 'Suryapet Bus Stand',                 city: 'Suryapet',    state: 'TG' },

  // ===== Andhra Pradesh =====
  { code: 'ap-vja-pnbs',      name: 'PNBS — Pandit Nehru Bus Station',    city: 'Vijayawada',  state: 'AP', landmark: 'Vijayawada Central',           aliases: ['PNBS', 'Vijayawada central', 'Vijayawada bus stand'] },
  { code: 'ap-vsk-dwarka',    name: 'Dwaraka Bus Station',                city: 'Visakhapatnam',state: 'AP',landmark: 'Asilmetta, Visakhapatnam',      aliases: ['Vizag', 'Dwaraka', 'RTC complex Vizag'] },
  { code: 'ap-guntur',        name: 'Guntur Bus Stand (NTR)',             city: 'Guntur',      state: 'AP', landmark: 'NTR Bus Stand, Guntur',        aliases: ['Guntur NTR'] },
  { code: 'ap-tirupati',      name: 'Tirupati Central Bus Stand',         city: 'Tirupati',    state: 'AP', landmark: 'Near Railway Station, Tirupati' },
  { code: 'ap-nellore',       name: 'Nellore Bus Stand',                  city: 'Nellore',     state: 'AP' },
  { code: 'ap-rajahmundry',   name: 'Rajahmundry Bus Stand',              city: 'Rajahmundry', state: 'AP', aliases: ['Rajamahendravaram'] },
  { code: 'ap-kakinada',      name: 'Kakinada Bus Stand',                 city: 'Kakinada',    state: 'AP' },
  { code: 'ap-eluru',         name: 'Eluru Bus Stand',                    city: 'Eluru',       state: 'AP' },
  { code: 'ap-ongole',        name: 'Ongole Bus Stand',                   city: 'Ongole',      state: 'AP' },
  { code: 'ap-kurnool',       name: 'Kurnool Bus Stand',                  city: 'Kurnool',     state: 'AP' },
  { code: 'ap-anantapur',     name: 'Anantapur Bus Stand',                city: 'Anantapur',   state: 'AP' },
  { code: 'ap-kadapa',        name: 'Kadapa Bus Stand',                   city: 'Kadapa',      state: 'AP', aliases: ['Cuddapah'] },
  { code: 'ap-chittoor',      name: 'Chittoor Bus Stand',                 city: 'Chittoor',    state: 'AP' },
  { code: 'ap-srikakulam',    name: 'Srikakulam Bus Stand',               city: 'Srikakulam',  state: 'AP' },
  { code: 'ap-vizianagaram',  name: 'Vizianagaram Bus Stand',             city: 'Vizianagaram',state: 'AP' },

  // ===== Karnataka =====
  { code: 'ka-bglr-msbt',     name: 'Majestic — Kempegowda Bus Station',  city: 'Bengaluru',   state: 'KA', landmark: 'Majestic, Bengaluru',          aliases: ['Majestic', 'Bangalore central', 'KBS'] },
  { code: 'ka-bglr-shanti',   name: 'Shantinagar Bus Station',            city: 'Bengaluru',   state: 'KA', aliases: ['Shantinagar TTMC'] },
  { code: 'ka-mysuru',        name: 'Mysuru Central Bus Stand',           city: 'Mysuru',      state: 'KA', aliases: ['Mysore'] },

  // ===== Tamil Nadu =====
  { code: 'tn-chennai-cmbt',  name: 'CMBT — Chennai Mofussil Bus Terminus',city: 'Chennai',    state: 'TN', landmark: 'Koyambedu, Chennai',           aliases: ['CMBT', 'Koyambedu'] },
  { code: 'tn-coimbatore',    name: 'Gandhipuram Central Bus Stand',      city: 'Coimbatore',  state: 'TN', aliases: ['Gandhipuram'] },
  { code: 'tn-madurai',       name: 'Mattuthavani Bus Stand',             city: 'Madurai',     state: 'TN', aliases: ['Mattuthavani', 'MGR Bus Stand'] },

  // ===== Odisha & Maharashtra (key cross-border) =====
  { code: 'od-bhubaneswar',   name: 'Baramunda Bus Stand',                city: 'Bhubaneswar', state: 'OD' },
  { code: 'mh-mumbai-dadar',  name: 'Dadar Bus Depot',                    city: 'Mumbai',      state: 'MH', landmark: 'Dadar, Mumbai' },
  { code: 'mh-pune-swargate', name: 'Swargate Bus Stand',                 city: 'Pune',        state: 'MH', aliases: ['Swargate'] },

  // ===== Catch-all =====
  { code: 'other',            name: 'Other — I will share details in notes', city: '—',        state: 'AP', landmark: 'Pick this if your depot is not listed' },
];

export const STATE_LABELS: Record<RtcDepot['state'], string> = {
  TG: 'Telangana',
  AP: 'Andhra Pradesh',
  KA: 'Karnataka',
  TN: 'Tamil Nadu',
  OD: 'Odisha',
  MH: 'Maharashtra',
};

export function getDepotByCode(code: string): RtcDepot | undefined {
  return RTC_DEPOTS.find((d) => d.code === code);
}

export function searchDepots(query: string): RtcDepot[] {
  const q = query.trim().toLowerCase();
  if (!q) return RTC_DEPOTS;
  return RTC_DEPOTS.filter((d) => {
    const hay = [d.name, d.city, d.landmark || "", STATE_LABELS[d.state], ...(d.aliases || [])]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}
