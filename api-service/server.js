const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');

const { readDb, writeDb, DEFAULT_PLAYERS, DEFAULT_DTS, DEFAULT_REFEREES, DEFAULT_LEAGUES, DEFAULT_BACKGROUNDS } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Resolve JWT secret securely as required by mandatory-secure-web-skills
let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  const secretPath = path.join(__dirname, 'jwt_secret.txt');
  if (fs.existsSync(secretPath)) {
    JWT_SECRET = fs.readFileSync(secretPath, 'utf-8').trim();
  } else {
    JWT_SECRET = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(secretPath, JWT_SECRET, 'utf-8');
    console.warn("🚨 [SECURITY WARNING]: Ephemeral JWT secret generated and saved. Instance-isolated!");
  }
}

// Security Configuration
app.use(helmet());

// Express JSON limit set to 5MB to accommodate base64 background visual assets safely
app.use(express.json({ limit: '5mb' }));

// Restrict CORS origins strictly to local and configured production frontends
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];
if (process.env.ALLOWED_ORIGINS) {
  const customOrigins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
  allowedOrigins.push(...customOrigins);
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
    }
  },
  credentials: true
}));

// Apply global rate limiting to all endpoints (Testing safety & prevent DoS)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: { error: 'Demasiadas solicitudes desde esta dirección IP. Por favor reintente en 15 minutos.' }
});
app.use(apiLimiter);
// Parse cookies for session management
app.use(cookieParser());

// JWT Middleware: Authenticate administrator sessions (Fail Close)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Token de sesión ausente. Por favor inicia sesión.' });

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) return res.status(403).json({ error: 'Sesión expirada o inválida. Por favor inicia sesión de nuevo.' });
    req.user = decodedUser;
    next();
  });
}

// Log utility helper for admin audits
function logAuditAction(email, action) {
  const dbData = readDb();
  const logEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    email: email || 'Sistema',
    action,
  };
  dbData.auditLogs = [logEntry, ...(dbData.auditLogs || [])];
  writeDb(dbData);
}

// CSRF double‑submit cookie protection
function csrfProtection(req, res, next) {
  const headerToken = req.headers['x-csrf-token'];
  const cookieToken = req.cookies['csrfToken'];
  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({ error: 'CSRF validation failed.' });
  }
  next();
}

// Generate CSRF token for authenticated sessions
function setCsrfCookie(res) {
  const token = crypto.randomBytes(24).toString('hex');
  res.cookie('csrfToken', token, { httpOnly: false, secure: true, sameSite: 'Strict' });
}

// Email service (nodemailer transport)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});
function sendVerificationEmail(toEmail, token) {
  const verificationUrl = `${process.env.VERIFICATION_BASE_URL || 'http://localhost:5173'}/verify?token=${token}`;
  const mailOptions = {
    from: process.env.SMTP_FROM || 'no-reply@example.com',
    to: toEmail,
    subject: 'Verify your FutCard Pro account',
    text: `Please verify your account by clicking the link: ${verificationUrl}`,
    html: `<p>Please verify your account by clicking the link:</p><p><a href="${verificationUrl}">Verify Email</a></p>`,
  };
  return transporter.sendMail(mailOptions);
}

// In‑memory resend counter (email => { count, resetTime })
const resendTracker = {};
function canResend(email) {
  const now = Date.now();
  const record = resendTracker[email] || { count: 0, resetTime: now + 60 * 60 * 1000 };
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + 60 * 60 * 1000;
  }
  if (record.count >= 3) return false;
  record.count += 1;
  resendTracker[email] = record;
  return true;
}
    action: action
  };
  dbData.auditLogs = [logEntry, ...(dbData.auditLogs || [])];
  writeDb(dbData);
}

// ==========================================
// 1. AUTH ENDPOINTS
// ==========================================

// Authenticate Administrator Credentials
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Completa el correo y la contraseña.' });
  }

  const dbData = readDb();
  const admin = dbData.admins.find(a => a.email.toLowerCase() === email.toLowerCase());
  if (!admin) {
    return res.status(401).json({ error: 'Credenciales incorrectas. Verifica tus datos.' });
  }
  // Verify password (plain for demo, hash in prod)
  const passwordMatches = admin.password === password;
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Credenciales incorrectas.' });
  }

  const userPayload = { id: admin.id, name: admin.name, email: admin.email, role: admin.role, nickname: admin.nickname || '' };
  const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '24h' });
  // Set HttpOnly Secure SameSite cookie
  res.cookie('__Host-auth', token, { httpOnly: true, secure: true, sameSite: 'Strict', path: '/' });
  // Set CSRF token cookie for subsequent state‑changing requests
  setCsrfCookie(res);
  logAuditAction(admin.email, `Inicio de sesión exitoso en el portal administrativo`);
  res.json({ user: userPayload, token });
});

// Register new admin (simple password storage)
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Completa todos los campos obligatorios.' });
  }
  const dbData = readDb();
  if (dbData.admins.some(a => a.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Este correo ya está registrado.' });
  }
  const newAdmin = {
    id: `admin-${Date.now()}`,
    name,
    email,
    password, // plain password for demo
    role,
    nickname: req.body.nickname || '',
  };
  dbData.admins.push(newAdmin);
  writeDb(dbData);

  logAuditAction(email, `Registro de nuevo administrador`);
  res.status(201).json({ success: true, message: 'Registro exitoso.' });
});

// ==========================================
// 2. ADMIN USER CRUD ENDPOINTS (Super Admin Access only)
// ==========================================

app.get('/api/admins', authenticateToken, (req, res) => {
  if (req.user.role !== 'Super Admin') return res.status(403).json({ error: 'Acceso denegado: Se requieren privilegios de Super Admin.' });
  
  const dbData = readDb();
  // Mask/delete password hashes before shipping to client for defense-in-depth
  const cleanAdmins = dbData.admins.map(({ password, ...rest }) => rest);
  res.json(cleanAdmins);
});

app.post('/api/admins', authenticateToken, (req, res) => {
  if (req.user.role !== 'Super Admin') return res.status(403).json({ error: 'Acceso denegado.' });
  
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Completa todos los campos obligatorios del administrador.' });
  }

  const dbData = readDb();
  if (dbData.admins.some(a => a.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Este correo electrónico ya está registrado en el sistema.' });
  }

  const newAdmin = {
    id: `admin-${Date.now()}`,
    name,
    email,
    password, // Plain text in simulated seeder, but ideally hashed with bcrypt in prod
    role
  };

  dbData.admins.push(newAdmin);
  writeDb(dbData);

  logAuditAction(req.user.email, `Creó nuevo administrador: ${name} (${role})`);
  res.status(201).json({ success: true, message: 'Administrador creado con éxito.' });
});

app.delete('/api/admins/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'Super Admin') return res.status(403).json({ error: 'Acceso denegado.' });
  
  const adminId = req.params.id;
  if (adminId === 'admin-1') return res.status(400).json({ error: 'No se puede eliminar el Super Admin principal del sistema.' });
  if (adminId === req.user.id) return res.status(400).json({ error: 'No puedes eliminarte a ti mismo de la sesión activa.' });

  const dbData = readDb();
  const deletedAdmin = dbData.admins.find(a => a.id === adminId);
  
  if (!deletedAdmin) return res.status(404).json({ error: 'Administrador no encontrado.' });

  dbData.admins = dbData.admins.filter(a => a.id !== adminId);
  writeDb(dbData);

  logAuditAction(req.user.email, `Eliminó administrador del sistema: ${deletedAdmin.name}`);
  res.json({ success: true, message: 'Administrador dado de baja con éxito.' });
});

// ==========================================
// 3. AUDIT LOGS ENDPOINTS
// ==========================================

app.get('/api/audit-logs', authenticateToken, (req, res) => {
  const dbData = readDb();
  res.json(dbData.auditLogs || []);
});

app.post('/api/audit-logs', authenticateToken, (req, res) => {
  const { action } = req.body;
  if (action) {
    logAuditAction(req.user.email, action);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Acción ausente.' });
  }
});

// ==========================================
// 4. BACKGROUNDS ENDPOINTS (Visual Card Assets)
// ==========================================

app.get('/api/backgrounds', (req, res) => {
  const dbData = readDb();
  res.json(dbData.backgrounds || []);
});

// Create Custom Background
app.post('/api/backgrounds', authenticateToken, (req, res) => {
  if (req.user.role === 'Auditor Técnico') return res.status(403).json({ error: 'Permiso denegado: El Auditor Técnico no puede crear fondos.' });

  const { name, description, image } = req.body;
  if (!name || !image) return res.status(400).json({ error: 'Completa el nombre y selecciona un archivo de imagen válido.' });

  // Safety byte size check for base64 payload to prevent Buffer DoS
  if (image.length > 2800000) { // ~2MB limit
    return res.status(413).json({ error: 'La imagen supera el límite de peso máximo del sistema (2MB).' });
  }

  const dbData = readDb();
  const newBg = {
    id: `bg-custom-${Date.now()}`,
    name: `🎨 ${name}`,
    description: description || 'Fondo cargado por el administrador',
    image: image, // base64 string
    isPreset: false,
    enabled: true
  };

  dbData.backgrounds.push(newBg);
  writeDb(dbData);

  logAuditAction(req.user.email, `Subió nuevo fondo de tarjeta personalizado: ${name}`);
  res.status(201).json(newBg);
});

// Toggle Background Status
app.put('/api/backgrounds/:id/toggle', authenticateToken, (req, res) => {
  if (req.user.role === 'Auditor Técnico') return res.status(403).json({ error: 'Permiso denegado.' });

  const bgId = req.params.id;
  const dbData = readDb();
  const bg = dbData.backgrounds.find(b => b.id === bgId);
  
  if (!bg) return res.status(404).json({ error: 'Fondo no encontrado.' });

  // Safeguard: Ensure at least 1 background remains active system-wide
  const nextStatus = !bg.enabled;
  const enabledCount = dbData.backgrounds.filter(b => b.enabled).length;
  
  if (!nextStatus && enabledCount <= 1) {
    return res.status(400).json({ error: 'Operación denegada: Debe haber al menos un fondo activo habilitado para evitar fallos de renderizado.' });
  }

  bg.enabled = nextStatus;
  writeDb(dbData);

  logAuditAction(req.user.email, `${nextStatus ? 'Habilitó' : 'Desactivó'} el fondo de tarjeta: ${bg.name}`);
  res.json(bg);
});

// Delete Custom Background
app.delete('/api/backgrounds/:id', authenticateToken, (req, res) => {
  if (req.user.role === 'Auditor Técnico') return res.status(403).json({ error: 'Permiso denegado.' });

  const bgId = req.params.id;
  const dbData = readDb();
  const bg = dbData.backgrounds.find(b => b.id === bgId);

  if (!bg) return res.status(404).json({ error: 'Fondo no encontrado.' });
  if (bg.isPreset) return res.status(400).json({ error: 'No es posible eliminar los fondos presets nativos del sistema.' });

  // Safeguard: Check minimum active backgrounds
  const nextBackgrounds = dbData.backgrounds.filter(b => b.id !== bgId);
  const enabledCount = nextBackgrounds.filter(b => b.enabled).length;

  if (enabledCount < 1) {
    return res.status(400).json({ error: 'Operación denegada: Borrar este fondo violaría el límite de fondos habilitados activos en el sistema.' });
  }

  dbData.backgrounds = nextBackgrounds;
  writeDb(dbData);

  logAuditAction(req.user.email, `Eliminó permanentemente el fondo de tarjeta: ${bg.name}`);
  res.json({ success: true });
});

// ==========================================
// 5. GEMINI AI CONFIGURATION & BFF PROXY
// ==========================================

// Save Gemini API Key
app.post('/api/config/gemini-key', authenticateToken, (req, res) => {
  if (req.user.role === 'Auditor Técnico') return res.status(403).json({ error: 'Permiso denegado.' });
  
  const { key } = req.body;
  const dbData = readDb();
  dbData.geminiKey = key || '';
  writeDb(dbData);

  logAuditAction(req.user.email, key ? 'Configuró y guardó la clave Google Gemini API Key' : 'Eliminó la Gemini API Key del sistema');
  res.json({ success: true, message: 'Gemini Key guardada exitosamente.' });
});

// Retrieve Gemini AI Connectivity status without exposing the key
app.get('/api/config/gemini-status', (req, res) => {
  const dbData = readDb();
  res.json({ active: !!dbData.geminiKey && dbData.geminiKey.trim().length > 0 });
});

// Live Sandbox diagnostics test (Direct backend-to-Google communication)
app.post('/api/config/test-gemini', authenticateToken, async (req, res) => {
  const { prompt } = req.body;
  const dbData = readDb();
  const apiKey = dbData.geminiKey;

  if (!apiKey) return res.status(400).json({ error: 'No hay ninguna clave API Key de Gemini cargada en el servidor.' });
  if (!prompt) return res.status(400).json({ error: 'Especifica un prompt para ejecutar el análisis diagnóstico.' });

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analiza el prompt '${prompt}' y devuelve ÚNICAMENTE un JSON sin markdown ni bloques de código con la estructura exacta: {"primaryColor": "#hex", "secondaryColor": "#hex", "accentColor": "#hex", "designName": "2 palabras", "feedbackMsg": "1 linea"}. Combina perfectamente con fondo oscuro.`
          }]
        }]
      })
    });

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);

    logAuditAction(req.user.email, `Prueba de sandbox Gemini exitosa para: "${prompt}"`);
    res.json(parsed);
  } catch (err) {
    console.error('Error in Sandbox Gemini test:', err);
    res.status(500).json({ error: 'Error de respuesta o API Key incorrecta al consultar Google Gemini.' });
  }
});

// Secure Backend-For-Frontend (BFF) Proxy endpoint for players card prompt generations!
app.post('/api/cards/generate-ai', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Completa la descripción del prompt.' });

  const dbData = readDb();
  const apiKey = dbData.geminiKey;

  // If no API Key, default to beautiful simulator colors safely
  if (!apiKey || apiKey.trim().length === 0) {
    const fallbacks = [
      { primaryColor: '#22d3ee', secondaryColor: '#0c0f0f', accentColor: '#22d3ee', angle: 135, designName: 'CYBER VORTEX', feedbackMsg: 'Simulación de respaldo (Sin clave API en el servidor)' },
      { primaryColor: '#ec4899', secondaryColor: '#1e1b4b', accentColor: '#ec4899', angle: 45, designName: 'PROMO NEON', feedbackMsg: 'Simulación de respaldo (Sin clave API en el servidor)' },
      { primaryColor: '#c3f400', secondaryColor: '#121414', accentColor: '#c3f400', angle: 90, designName: 'FUT GLOW', feedbackMsg: 'Simulación de respaldo (Sin clave API en el servidor)' }
    ];
    const picked = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return res.json(picked);
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Eres el motor creativo de la app de cartas deportivas FutCard Pro. El usuario ingresó este prompt creativo: '${prompt}'. Analiza este prompt y devuelve ÚNICAMENTE un objeto JSON sin formato markdown (NO uses bloques de código con backticks ni la palabra json) con la siguiente estructura exacta: {"primaryColor": "#código_hexadecimal_del_color_primario_que_combine_con_gris", "secondaryColor": "#código_hexadecimal_de_color_de_fondo", "accentColor": "#código_hexadecimal_de_destello_neon", "angle": 135, "designName": "Nombre elegante del diseño en 2 palabras cortas", "feedbackMsg": "Mensaje poético corto de 1 línea"}. Asegúrate de que los colores hagan juego perfecto, sean sumamente premium, de alta fidelidad y combinen con una base oscura.`
          }]
        }]
      })
    });

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);

    res.json({
      primaryColor: parsed.primaryColor || '#22d3ee',
      secondaryColor: parsed.secondaryColor || '#0c0f0f',
      accentColor: parsed.accentColor || '#22d3ee',
      angle: parsed.angle || 135,
      designName: parsed.designName?.toUpperCase() || 'DISEÑO IA',
      feedbackMsg: parsed.feedbackMsg || 'Diseño renderizado con Gemini'
    });
  } catch (err) {
    console.error('Error generating card colors via Gemini BFF:', err);
    // Safe fallback so user experience never breaks on failures (Fail Safe)
    res.json({
      primaryColor: '#c3f400',
      secondaryColor: '#1e2020',
      accentColor: '#c3f400',
      angle: 135,
      designName: 'PITCH GLOW',
      feedbackMsg: 'Estilo de respaldo cargado debido a desconexión del servidor de IA.'
    });
  }
});

// ==========================================
// 6. FEDERATION ROSTERS & LEAGUE CRUD DATA
// ==========================================

// Get All federation models
app.get('/api/federation', (req, res) => {
  const dbData = readDb();
  res.json({
    players: dbData.players || [],
    dts: dbData.dts || [],
    referees: dbData.referees || [],
    leagues: dbData.leagues || []
  });
});

// Synchronize whole federation database
app.post('/api/federation/sync', authenticateToken, (req, res) => {
  if (req.user.role === 'Auditor Técnico') return res.status(403).json({ error: 'Permiso denegado: El Auditor Técnico no tiene permitido realizar sincronizaciones.' });
  const { players, dts, referees, leagues } = req.body;
  const dbData = readDb();
  if (players) dbData.players = players;
  if (dts) dbData.dts = dts;
  if (referees) dbData.referees = referees;
  if (leagues) dbData.leagues = leagues;
  writeDb(dbData);
  res.json({ success: true, message: 'Base de datos federativa sincronizada con éxito.' });
});

// Create Sports Profile
app.post('/api/federation/:type', authenticateToken, (req, res) => {
  if (req.user.role === 'Auditor Técnico') return res.status(403).json({ error: 'Permiso denegado: El Auditor Técnico no tiene permitido editar registros.' });

  const type = req.params.type; // players, dts, referees, leagues
  const body = req.body;

  const dbData = readDb();
  if (!dbData[type]) return res.status(400).json({ error: 'Tipo de datos no soportado.' });

  const prefix = type === 'players' ? 'p-' : type === 'dts' ? 'dt-' : type === 'referees' ? 'ref-' : 'liga-';
  const newRecord = {
    id: `${prefix}${Date.now()}`,
    ...body
  };

  dbData[type].push(newRecord);
  writeDb(dbData);

  logAuditAction(req.user.email, `Creó un registro nuevo en la base de ${type}: ${newRecord.name || newRecord.id}`);
  res.status(201).json(newRecord);
});

// Edit Sports Profile
app.put('/api/federation/:type/:id', authenticateToken, (req, res) => {
  if (req.user.role === 'Auditor Técnico') return res.status(403).json({ error: 'Permiso denegado.' });

  const { type, id } = req.params;
  const body = req.body;

  const dbData = readDb();
  if (!dbData[type]) return res.status(400).json({ error: 'Tipo de datos no soportado.' });

  const index = dbData[type].findIndex(item => item.id === id);
  if (index === -1) return res.status(404).json({ error: 'Registro no encontrado.' });

  const updatedRecord = { ...dbData[type][index], ...body, id }; // retain id
  dbData[type][index] = updatedRecord;
  writeDb(dbData);

  logAuditAction(req.user.email, `Modificó el perfil federativo en ${type}: ${updatedRecord.name || updatedRecord.id}`);
  res.json(updatedRecord);
});

// Delete Sports Profile
app.delete('/api/federation/:type/:id', authenticateToken, (req, res) => {
  if (req.user.role === 'Auditor Técnico') return res.status(403).json({ error: 'Permiso denegado.' });

  const { type, id } = req.params;
  const dbData = readDb();
  if (!dbData[type]) return res.status(400).json({ error: 'Tipo de datos no soportado.' });

  const record = dbData[type].find(item => item.id === id);
  if (!record) return res.status(404).json({ error: 'Registro no encontrado.' });

  dbData[type] = dbData[type].filter(item => item.id !== id);
  writeDb(dbData);

  logAuditAction(req.user.email, `Eliminó el registro federativo de ${type}: ${record.name || record.id}`);
  res.json({ success: true });
});

// Factory Database Reset (Super Admin only)
app.post('/api/federation/reset', authenticateToken, (req, res) => {
  if (req.user.role !== 'Super Admin') return res.status(403).json({ error: 'Acceso denegado: Solo un Super Admin principal puede restablecer los datos.' });

  const dbData = readDb();
  dbData.players = DEFAULT_PLAYERS;
  dbData.dts = DEFAULT_DTS;
  dbData.referees = DEFAULT_REFEREES;
  dbData.leagues = DEFAULT_LEAGUES;
  dbData.backgrounds = DEFAULT_BACKGROUNDS;
  
  writeDb(dbData);

  logAuditAction(req.user.email, `Restableció los datos federativos a los valores por defecto de fábrica`);
  res.json({ success: true, message: 'Base de datos federativa re-sembrada con éxito.' });
});

// Start Express Server listening on configured host (supports local security and Railway container enrouting)
const HOST = process.env.HOST || '127.0.0.1';
app.listen(PORT, HOST, () => {
  console.log(`🚀 [EXPRESS BACKEND LIVE]: Listening at http://${HOST}:${PORT}`);
});
