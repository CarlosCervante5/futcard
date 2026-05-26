const fs = require('fs');
const path = require('path');

const DB_DIR = process.env.DB_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

const DEFAULT_PLAYERS = [
  {
    id: "p-1",
    name: "Santiago Giménez",
    position: "DEL",
    rating: 84,
    avatar: "",
    club: "Feyenoord Rotterdam",
    clubBadge: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=80&fit=crop&q=80",
    nationality: "México",
    flag: "https://flagcdn.com/w40/mx.png",
    cardTheme: "gold",
    aiPrompt: "Un león de fuego sobre la cancha",
    skills: {
      pac: { name: "Ritmo", value: 85, endorsements: [] },
      sho: { name: "Tiro", value: 88, endorsements: [] },
      pas: { name: "Pase", value: 75, endorsements: [] },
      dri: { name: "Regate", value: 82, endorsements: [] },
      def: { name: "Defensa", value: 38, endorsements: [] },
      phy: { name: "Físico", value: 84, endorsements: [] }
    },
    teams: [
      { id: "t1", club: "Feyenoord (NED)", period: "2022 - Presente", stats: "78 Goles, 16 Asistencias", achievements: "Campeón Eredivisie 2023" },
      { id: "t2", club: "Cruz Azul (MEX)", period: "2017 - 2022", stats: "105 Partidos, 28 Goles", achievements: "Campeón Liga MX Guard1anes 2021" }
    ]
  },
  {
    id: "p-2",
    name: "Hirving Lozano",
    position: "EI",
    rating: 81,
    avatar: "",
    club: "PSV Eindhoven",
    clubBadge: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=80&fit=crop&q=80",
    nationality: "México",
    flag: "https://flagcdn.com/w40/mx.png",
    cardTheme: "totw",
    aiPrompt: "Rayos de tormenta eléctrica neon",
    skills: {
      pac: { name: "Ritmo", value: 92, endorsements: [] },
      sho: { name: "Tiro", value: 80, endorsements: [] },
      pas: { name: "Pase", value: 78, endorsements: [] },
      dri: { name: "Regate", value: 86, endorsements: [] },
      def: { name: "Defensa", value: 42, endorsements: [] },
      phy: { name: "Físico", value: 68, endorsements: [] }
    },
    teams: [
      { id: "t3", club: "PSV Eindhoven (NED)", period: "2023 - Presente", stats: "35 Partidos, 12 Goles", achievements: "Campeón Eredivisie 2024" },
      { id: "t4", club: "Napoli (ITA)", period: "2019 - 2023", stats: "155 Partidos, 30 Goles", achievements: "Campeón Serie A 2023, Coppa Italia 2020" },
      { id: "t5", club: "Pachuca (MEX)", period: "2014 - 2017", stats: "149 Partidos, 43 Goles", achievements: "Campeón Liga MX 2016, Concacaf CL 2017" }
    ]
  }
];

const DEFAULT_DTS = [
  {
    id: "dt-1",
    name: "Profe Guillermo Almada",
    tacticalStyle: "Presión Alta (Gegenpressing)",
    formation: "4-2-3-1",
    experience: "Pachuca (2022-Pres), Santos Laguna (2019-2021), Barcelona SC (2015-2019)",
    certifications: "UEFA Pro License, Licencia Conmebol Pro",
    avatar: "",
    verifiedLeagues: ["liga-1", "liga-2"]
  },
  {
    id: "dt-2",
    name: "Profe Jaime Lozano",
    tacticalStyle: "Posesión y Tiki-Taka",
    formation: "4-3-3",
    experience: "Selección Mexicana (2023-2024), Necaxa (2022), Querétaro (2017)",
    certifications: "Licencia Pro FMF",
    avatar: "",
    verifiedLeagues: ["liga-1"]
  }
];

const DEFAULT_REFEREES = [
  {
    id: "ref-1",
    name: "César Arturo Ramos",
    category: "Árbitro Central FIFA",
    matches: "480+ Partidos Oficiales",
    yellowCards: "4.1 (Promedio por partido)",
    redCards: "0.28 (Promedio por partido)",
    physicalLevel: "Élite Clase A (FMA)",
    avatar: "",
    verifiedLeagues: ["liga-1", "liga-2"]
  },
  {
    id: "ref-2",
    name: "Fernando Guerrero",
    category: "Árbitro VAR & Central FIFA",
    matches: "390+ Partidos Oficiales",
    yellowCards: "3.8 (Promedio por partido)",
    redCards: "0.22 (Promedio por partido)",
    physicalLevel: "Élite Clase B",
    avatar: "",
    verifiedLeagues: ["liga-3"]
  }
];

const DEFAULT_LEAGUES = [
  { id: "liga-1", name: "Liga MX Profesional", logo: "🇲🇽", verified: true },
  { id: "liga-2", name: "Copa Amateurs de México", logo: "🏆", verified: true },
  { id: "liga-3", name: "Liga Metropolitana Local", logo: "⚽", verified: false }
];

const DEFAULT_ADMINS = [
  { id: 'admin-1', name: 'Directiva FMF Super', email: 'admin@pitchpulse.com', password: 'admin2026', role: 'Super Admin' },
  { id: 'admin-2', name: 'Santiago Editor FMF', email: 'editor@pitchpulse.com', password: 'editor2026', role: 'Editor Liga' },
  { id: 'admin-3', name: 'Sofía Auditora Liga', email: 'auditor@pitchpulse.com', password: 'auditor2026', role: 'Auditor Técnico' }
];

const DEFAULT_BACKGROUNDS = [
  { id: 'neon_pitch', name: '🏟️ Fondo Pitch Neón', description: 'Líneas de juego color verde neón futurista', image: '/backgrounds/neon_pitch.png', isPreset: true, enabled: true },
  { id: 'golden_shield', name: '🥇 Fondo Escudo Dorado', description: 'Textura dorada metálica de lujo', image: '/backgrounds/golden_shield.png', isPreset: true, enabled: true },
  { id: 'cyber_grid', name: '👾 Fondo Rejilla Cyber', description: 'Matriz de rejilla de datos neón rosa/violeta', image: '/backgrounds/cyber_grid.png', isPreset: true, enabled: true },
  { id: 'legend_marble', name: '🏛️ Fondo Mármol Leyenda', description: 'Mármol blanco elegante con vetas de oro', image: '/backgrounds/legend_marble.png', isPreset: true, enabled: true }
];

function initDb() {
  // Ensure the database directory exists (useful for persistent volume mounts)
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
    console.log(`📁 [DATABASE VOLUME]: Created persistent directory at ${DB_DIR}`);
  }

  let dbData = null;
  let needsWrite = false;

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      dbData = JSON.parse(content);
    } catch (err) {
      console.error('⚠️ [DATABASE CORRUPTION]: Failed to parse db.json. Restoring fallback defaults.', err);
    }
  }

  if (!dbData) {
    dbData = {
      players: DEFAULT_PLAYERS,
      dts: DEFAULT_DTS,
      referees: DEFAULT_REFEREES,
      leagues: DEFAULT_LEAGUES,
      admins: DEFAULT_ADMINS,
      backgrounds: DEFAULT_BACKGROUNDS,
      auditLogs: [],
      geminiKey: ''
    };
    needsWrite = true;
    console.log('🌱 [DATABASE SEED]: Database file was missing. Successfully seeded default sports & administrator records!');
  } else {
    // Automated schema migrations (Ensure missing fields / collections are created safely)
    const schemaDefaults = {
      players: DEFAULT_PLAYERS,
      dts: DEFAULT_DTS,
      referees: DEFAULT_REFEREES,
      leagues: DEFAULT_LEAGUES,
      admins: DEFAULT_ADMINS,
      backgrounds: DEFAULT_BACKGROUNDS,
      auditLogs: [],
      geminiKey: ''
    };

    for (const [key, defaultValue] of Object.entries(schemaDefaults)) {
      if (dbData[key] === undefined) {
        dbData[key] = defaultValue;
        needsWrite = true;
        console.log(`🔧 [DATABASE MIGRATION]: Added missing schema collection: "${key}"`);
      }
    }
  }

  if (needsWrite) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
      console.log('💾 [DATABASE WRITER]: Database changes/seeds written to disk.');
    } catch (err) {
      console.error('🚨 [DATABASE ERROR]: Failed to write seeded database to disk:', err);
    }
  }
}

// Call initDb immediately upon loading module to trigger automatic migrations and seeding
initDb();

function readDb() {
  initDb();
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading JSON DB file:', err);
    return {};
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing JSON DB file:', err);
    return false;
  }
}

module.exports = {
  readDb,
  writeDb,
  DEFAULT_PLAYERS,
  DEFAULT_DTS,
  DEFAULT_REFEREES,
  DEFAULT_LEAGUES,
  DEFAULT_ADMINS,
  DEFAULT_BACKGROUNDS
};
