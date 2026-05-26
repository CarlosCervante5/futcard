const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

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

// Initialize Postgres variables
let pool = null;
let isPostgres = false;
let memoryDbCache = {
  players: [],
  dts: [],
  referees: [],
  leagues: [],
  admins: [],
  backgrounds: [],
  auditLogs: [],
  geminiKey: ''
};

// Autodetect PostgreSQL connection settings
const pgHost = process.env.PGHOST;
const dbUrl = process.env.DATABASE_URL;

if (dbUrl || pgHost) {
  let connectionString = dbUrl;
  if (!connectionString && pgHost) {
    const pgUser = process.env.PGUSER;
    const pgPassword = process.env.PGPASSWORD;
    const pgDatabase = process.env.PGDATABASE;
    const pgPort = process.env.PGPORT || 5432;
    connectionString = `postgresql://${pgUser}:${pgPassword}@${pgHost}:${pgPort}/${pgDatabase}`;
  }

  if (connectionString) {
    pool = new Pool({
      connectionString: connectionString,
      ssl: {
        rejectUnauthorized: false // Necessary for Railway Postgres instance SSL enrouting
      }
    });
    isPostgres = true;
    console.log('🔌 [DATABASE MODULE]: PostgreSQL environment detected. Enabling Postgres dual-driver mode.');
  }
}

// PostgreSQL: Create tables and auto-seed if they are empty
async function initPostgresDb() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Players Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS players (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100),
        position VARCHAR(10),
        rating INTEGER,
        avatar TEXT,
        club VARCHAR(100),
        "clubBadge" TEXT,
        nationality VARCHAR(50),
        flag TEXT,
        "cardTheme" VARCHAR(50),
        "aiPrompt" TEXT,
        skills JSONB,
        teams JSONB
      )
    `);

    // 2. DTs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS dts (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100),
        "tacticalStyle" VARCHAR(100),
        formation VARCHAR(20),
        experience TEXT,
        certifications TEXT,
        avatar TEXT,
        "verifiedLeagues" JSONB
      )
    `);

    // 3. Referees Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS referees (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100),
        category VARCHAR(100),
        matches VARCHAR(50),
        "yellowCards" VARCHAR(50),
        "redCards" VARCHAR(50),
        "physicalLevel" VARCHAR(100),
        avatar TEXT,
        "verifiedLeagues" JSONB
      )
    `);

    // 4. Leagues Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS leagues (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100),
        logo VARCHAR(50),
        verified BOOLEAN
      )
    `);

    // 5. Admins Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(100),
        role VARCHAR(50)
      )
    `);

    // 6. Backgrounds Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS backgrounds (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100),
        description TEXT,
        image TEXT,
        "isPreset" BOOLEAN,
        enabled BOOLEAN
      )
    `);

    // 7. Audit Logs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(50) PRIMARY KEY,
        timestamp VARCHAR(50),
        email VARCHAR(100),
        action TEXT
      )
    `);

    // 8. App Config Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_config (
        key VARCHAR(50) PRIMARY KEY,
        value TEXT
      )
    `);

    // Check and seed default players
    const playerCheck = await client.query('SELECT COUNT(*) FROM players');
    if (parseInt(playerCheck.rows[0].count) === 0) {
      console.log('🌱 [POSTGRES SEED]: Seeding default players into relational schema...');
      for (const p of DEFAULT_PLAYERS) {
        await client.query(
          'INSERT INTO players (id, name, position, rating, avatar, club, "clubBadge", nationality, flag, "cardTheme", "aiPrompt", skills, teams) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
          [p.id, p.name, p.position, p.rating, p.avatar, p.club, p.clubBadge, p.nationality, p.flag, p.cardTheme, p.aiPrompt, JSON.stringify(p.skills), JSON.stringify(p.teams)]
        );
      }
    }

    // Check and seed default DTs
    const dtCheck = await client.query('SELECT COUNT(*) FROM dts');
    if (parseInt(dtCheck.rows[0].count) === 0) {
      console.log('🌱 [POSTGRES SEED]: Seeding default DTs...');
      for (const d of DEFAULT_DTS) {
        await client.query(
          'INSERT INTO dts (id, name, "tacticalStyle", formation, experience, certifications, avatar, "verifiedLeagues") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [d.id, d.name, d.tacticalStyle, d.formation, d.experience, d.certifications, d.avatar, JSON.stringify(d.verifiedLeagues)]
        );
      }
    }

    // Check and seed default Referees
    const refCheck = await client.query('SELECT COUNT(*) FROM referees');
    if (parseInt(refCheck.rows[0].count) === 0) {
      console.log('🌱 [POSTGRES SEED]: Seeding default referees...');
      for (const r of DEFAULT_REFEREES) {
        await client.query(
          'INSERT INTO referees (id, name, category, matches, "yellowCards", "redCards", "physicalLevel", avatar, "verifiedLeagues") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [r.id, r.name, r.category, r.matches, r.yellowCards, r.redCards, r.physicalLevel, r.avatar, JSON.stringify(r.verifiedLeagues)]
        );
      }
    }

    // Check and seed default Leagues
    const leagueCheck = await client.query('SELECT COUNT(*) FROM leagues');
    if (parseInt(leagueCheck.rows[0].count) === 0) {
      console.log('🌱 [POSTGRES SEED]: Seeding default leagues...');
      for (const l of DEFAULT_LEAGUES) {
        await client.query(
          'INSERT INTO leagues (id, name, logo, verified) VALUES ($1, $2, $3, $4)',
          [l.id, l.name, l.logo, l.verified]
        );
      }
    }

    // Check and seed default Admins
    const adminCheck = await client.query('SELECT COUNT(*) FROM admins');
    if (parseInt(adminCheck.rows[0].count) === 0) {
      console.log('🌱 [POSTGRES SEED]: Seeding default administrators...');
      for (const a of DEFAULT_ADMINS) {
        await client.query(
          'INSERT INTO admins (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5)',
          [a.id, a.name, a.email, a.password, a.role]
        );
      }
    }

    // Check and seed default preset Backgrounds
    const bgCheck = await client.query('SELECT COUNT(*) FROM backgrounds');
    if (parseInt(bgCheck.rows[0].count) === 0) {
      console.log('🌱 [POSTGRES SEED]: Seeding default preset backgrounds...');
      for (const b of DEFAULT_BACKGROUNDS) {
        await client.query(
          'INSERT INTO backgrounds (id, name, description, image, "isPreset", enabled) VALUES ($1, $2, $3, $4, $5, $6)',
          [b.id, b.name, b.description, b.image, b.isPreset, b.enabled]
        );
      }
    }

    // Check and seed default config key
    const configCheck = await client.query("SELECT COUNT(*) FROM app_config WHERE key = 'geminiKey'");
    if (parseInt(configCheck.rows[0].count) === 0) {
      await client.query("INSERT INTO app_config (key, value) VALUES ('geminiKey', '')");
    }

    await client.query('COMMIT');
    console.log('✅ [POSTGRES INIT]: Database tables initialized and seeded successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('🚨 [POSTGRES ERROR]: Failed to initialize database relational schema:', err);
    throw err;
  } finally {
    client.release();
  }
}

// PostgreSQL: Load data from Postgres to populates in-memory cache
async function loadDataFromPostgres() {
  const client = await pool.connect();
  try {
    const players = await client.query('SELECT * FROM players');
    const dts = await client.query('SELECT * FROM dts');
    const referees = await client.query('SELECT * FROM referees');
    const leagues = await client.query('SELECT * FROM leagues');
    const admins = await client.query('SELECT * FROM admins');
    const backgrounds = await client.query('SELECT * FROM backgrounds');
    const auditLogs = await client.query('SELECT * FROM audit_logs ORDER BY timestamp DESC');
    const geminiKeyRow = await client.query("SELECT value FROM app_config WHERE key = 'geminiKey'");

    memoryDbCache = {
      players: players.rows.map(r => ({
        ...r,
        skills: typeof r.skills === 'string' ? JSON.parse(r.skills) : r.skills,
        teams: typeof r.teams === 'string' ? JSON.parse(r.teams) : r.teams
      })),
      dts: dts.rows.map(r => ({
        ...r,
        tacticalStyle: r.tacticalStyle,
        verifiedLeagues: typeof r.verifiedLeagues === 'string' ? JSON.parse(r.verifiedLeagues) : r.verifiedLeagues
      })),
      referees: referees.rows.map(r => ({
        ...r,
        yellowCards: r.yellowCards,
        redCards: r.redCards,
        physicalLevel: r.physicalLevel,
        verifiedLeagues: typeof r.verifiedLeagues === 'string' ? JSON.parse(r.verifiedLeagues) : r.verifiedLeagues
      })),
      leagues: leagues.rows,
      admins: admins.rows,
      backgrounds: backgrounds.rows.map(r => ({
        ...r,
        isPreset: r.isPreset,
        enabled: r.enabled
      })),
      auditLogs: auditLogs.rows,
      geminiKey: geminiKeyRow.rows[0] ? geminiKeyRow.rows[0].value : ''
    };
    console.log('📖 [POSTGRES CACHE]: Loaded database cache successfully from PostgreSQL cluster.');
  } catch (err) {
    console.error('🚨 [POSTGRES ERROR]: Failed to load relational tables into database cache:', err);
  } finally {
    client.release();
  }
}

// PostgreSQL: Sync memory cache state to database
async function syncDataToPostgres(data) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Sync Players
    await client.query('TRUNCATE TABLE players');
    for (const p of data.players) {
      await client.query(
        'INSERT INTO players (id, name, position, rating, avatar, club, "clubBadge", nationality, flag, "cardTheme", "aiPrompt", skills, teams) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
        [p.id, p.name, p.position, p.rating, p.avatar, p.club, p.clubBadge, p.nationality, p.flag, p.cardTheme, p.aiPrompt, JSON.stringify(p.skills), JSON.stringify(p.teams)]
      );
    }

    // 2. Sync DTs
    await client.query('TRUNCATE TABLE dts');
    for (const d of data.dts) {
      await client.query(
        'INSERT INTO dts (id, name, "tacticalStyle", formation, experience, certifications, avatar, "verifiedLeagues") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [d.id, d.name, d.tacticalStyle, d.formation, d.experience, d.certifications, d.avatar, JSON.stringify(d.verifiedLeagues)]
      );
    }

    // 3. Sync Referees
    await client.query('TRUNCATE TABLE referees');
    for (const r of data.referees) {
      await client.query(
        'INSERT INTO referees (id, name, category, matches, "yellowCards", "redCards", "physicalLevel", avatar, "verifiedLeagues") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [r.id, r.name, r.category, r.matches, r.yellowCards, r.redCards, r.physicalLevel, r.avatar, JSON.stringify(r.verifiedLeagues)]
      );
    }

    // 4. Sync Leagues
    await client.query('TRUNCATE TABLE leagues');
    for (const l of data.leagues) {
      await client.query(
        'INSERT INTO leagues (id, name, logo, verified) VALUES ($1, $2, $3, $4)',
        [l.id, l.name, l.logo, l.verified]
      );
    }

    // 5. Sync Admins
    await client.query('TRUNCATE TABLE admins');
    for (const a of data.admins) {
      await client.query(
        'INSERT INTO admins (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5)',
        [a.id, a.name, a.email, a.password, a.role]
      );
    }

    // 6. Sync Backgrounds
    await client.query('TRUNCATE TABLE backgrounds');
    for (const b of data.backgrounds) {
      await client.query(
        'INSERT INTO backgrounds (id, name, description, image, "isPreset", enabled) VALUES ($1, $2, $3, $4, $5, $6)',
        [b.id, b.name, b.description, b.image, b.isPreset, b.enabled]
      );
    }

    // 7. Sync Audit Logs
    await client.query('TRUNCATE TABLE audit_logs');
    for (const l of data.auditLogs) {
      await client.query(
        'INSERT INTO audit_logs (id, timestamp, email, action) VALUES ($1, $2, $3, $4)',
        [l.id, l.timestamp, l.email, l.action]
      );
    }

    // 8. Sync app_config
    await client.query(
      "INSERT INTO app_config (key, value) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
      ['geminiKey', data.geminiKey || '']
    );

    await client.query('COMMIT');
    console.log('💾 [POSTGRES SYNC]: Written changes to PostgreSQL database successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('🚨 [POSTGRES SYNC ERROR]: Failed to sync changes to PostgreSQL database:', err);
  } finally {
    client.release();
  }
}

// Local JSON: Initialize Database
function initDb() {
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

// Start-up Initializer sequence
if (isPostgres) {
  initPostgresDb()
    .then(() => loadDataFromPostgres())
    .catch(err => {
      console.error('🚨 [POSTGRES FATAL]: Failed to connect to PostgreSQL. Falling back to local JSON database.', err);
      isPostgres = false;
      initDb();
    });
} else {
  initDb();
}

function readDb() {
  if (isPostgres) {
    return memoryDbCache;
  }

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
  if (isPostgres) {
    memoryDbCache = data;
    syncDataToPostgres(data);
    return true;
  }

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
