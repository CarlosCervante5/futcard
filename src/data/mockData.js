// Default Mock Data for FutCard Pro

const DEFAULT_PLAYERS = [
  {
    id: "p-1",
    name: "Santiago Giménez",
    position: "DEL",
    rating: 84,
    avatar: "", // empty defaults to svg silhouette
    club: "Feyenoord Rotterdam",
    clubBadge: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=80&fit=crop&q=80",
    nationality: "México",
    flag: "https://flagcdn.com/w40/mx.png",
    cardTheme: "gold", // gold, icon, totw, future, ai
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
    verifiedLeagues: ["liga-1", "liga-2"] // Accredited by these leagues
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

// Helper to initialize and retrieve from localStorage
export const getAppData = () => {
  if (typeof window === "undefined") return { players: [], dts: [], referees: [], leagues: [] };
  
  let players = localStorage.getItem("futcard_players");
  let dts = localStorage.getItem("futcard_dts");
  let referees = localStorage.getItem("futcard_referees");
  let leagues = localStorage.getItem("futcard_leagues");

  if (!players) {
    localStorage.setItem("futcard_players", JSON.stringify(DEFAULT_PLAYERS));
    players = JSON.stringify(DEFAULT_PLAYERS);
  }
  if (!dts) {
    localStorage.setItem("futcard_dts", JSON.stringify(DEFAULT_DTS));
    dts = JSON.stringify(DEFAULT_DTS);
  }
  if (!referees) {
    localStorage.setItem("futcard_referees", JSON.stringify(DEFAULT_REFEREES));
    referees = JSON.stringify(DEFAULT_REFEREES);
  }
  if (!leagues) {
    localStorage.setItem("futcard_leagues", JSON.stringify(DEFAULT_LEAGUES));
    leagues = JSON.stringify(DEFAULT_LEAGUES);
  }

  return {
    players: JSON.parse(players),
    dts: JSON.parse(dts),
    referees: JSON.parse(referees),
    leagues: JSON.parse(leagues)
  };
};

export const saveAppData = (data) => {
  if (typeof window === "undefined") return;
  if (data.players) localStorage.setItem("futcard_players", JSON.stringify(data.players));
  if (data.dts) localStorage.setItem("futcard_dts", JSON.stringify(data.dts));
  if (data.referees) localStorage.setItem("futcard_referees", JSON.stringify(data.referees));
  if (data.leagues) localStorage.setItem("futcard_leagues", JSON.stringify(data.leagues));
};

export const resetAppData = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("futcard_players");
  localStorage.removeItem("futcard_dts");
  localStorage.removeItem("futcard_referees");
  localStorage.removeItem("futcard_leagues");
  return getAppData();
};
