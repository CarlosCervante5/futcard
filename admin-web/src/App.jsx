import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, Plus, Trash2, Edit2, CheckCircle2, XCircle, Search, 
  Save, Award, RefreshCw, Layers, Lock, Unlock, LogOut, UserCheck, 
  Activity, Eye, EyeOff, ShieldCheck, Terminal, Settings, Sliders, Upload 
} from 'lucide-react';

// Shared localStorage database helper keys
const MOCK_DB_KEYS = {
  players: 'futcard_players',
  dts: 'futcard_dts',
  referees: 'futcard_referees',
  leagues: 'futcard_leagues',
  admins: 'futcard_admins',
  auditLogs: 'futcard_audit_logs',
  geminiKey: 'futcard_gemini_api_key',
  backgrounds: 'futcard_all_backgrounds'
};

function App() {
  const [db, setDb] = useState({ players: [], dts: [], referees: [], leagues: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // all, player, dt, referee
  const [selectedRole, setSelectedRole] = useState('player'); // player, dt, referee (creation form)
  const [editingUserId, setEditingUserId] = useState(null);
  const [notification, setNotification] = useState('🔌 Conectado a la base de datos local compartida (localStorage)');

  // Phase 2 State Hooks
  const [activeAdmin, setActiveAdmin] = useState(() => {
    try {
      const saved = sessionStorage.getItem('futcard_active_admin');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [adminsList, setAdminsList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('federados'); // 'federados', 'admins', or 'config'
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginShake, setLoginShake] = useState(false);

  // Administrator Form State
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Editor Liga' // Super Admin, Editor Liga, Auditor Técnico
  });
  const [editingAdminId, setEditingAdminId] = useState(null);

  // System Configurations States
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem(MOCK_DB_KEYS.geminiKey) || '');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [backgroundsList, setBackgroundsList] = useState([]);
  
  // Gemini Diagnostic Sandbox
  const [diagnosticPrompt, setDiagnosticPrompt] = useState('Obsidiana y relámpago dorado');
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState(null);

  // Custom Background Upload Form State
  const [customBgForm, setCustomBgForm] = useState({
    name: '',
    description: '',
    image: ''
  });
  const fileInputRef = useRef(null);

  // Form States for Federated Users
  const [formData, setFormData] = useState({
    name: '',
    club: '',
    position: 'DEL',
    nationality: 'México',
    flag: 'https://flagcdn.com/w40/mx.png',
    cardTheme: 'gold',
    aiPrompt: 'Fondo ciberpunk neón deportivo',
    
    // DT Specs
    tacticalStyle: 'Presión Alta (Gegenpressing)',
    formation: '4-3-3',
    experience: '',
    certifications: 'UEFA Pro License',
    
    // Referee Specs
    category: 'Árbitro Central FIFA',
    matches: '150 Partidos',
    yellowCards: '4.2',
    redCards: '0.28',
    physicalLevel: 'Élite Clase A',
    
    // Skills
    pac: 75,
    sho: 75,
    pas: 75,
    dri: 75,
    def: 75,
    phy: 75
  });

  // Role checking helpers
  const isSuperAdmin = activeAdmin?.role === 'Super Admin';
  const isEditor = activeAdmin?.role === 'Editor Liga';
  const isAuditor = activeAdmin?.role === 'Auditor Técnico';

  // Load shared data from localStorage on mount
  useEffect(() => {
    loadData();
    // Add window listener to sync edits across windows
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const loadData = () => {
    // 1. Load federated users databases
    const players = localStorage.getItem(MOCK_DB_KEYS.players);
    const dts = localStorage.getItem(MOCK_DB_KEYS.dts);
    const referees = localStorage.getItem(MOCK_DB_KEYS.referees);
    const leagues = localStorage.getItem(MOCK_DB_KEYS.leagues);

    setDb({
      players: players ? JSON.parse(players) : [],
      dts: dts ? JSON.parse(dts) : [],
      referees: referees ? JSON.parse(referees) : [],
      leagues: leagues ? JSON.parse(leagues) : []
    });

    // 2. Load and seed administrators
    let admins = localStorage.getItem(MOCK_DB_KEYS.admins);
    if (!admins) {
      const defaultAdmins = [
        { id: 'admin-1', name: 'Directiva FMF Super', email: 'admin@pitchpulse.com', password: 'admin2026', role: 'Super Admin' },
        { id: 'admin-2', name: 'Santiago Editor FMF', email: 'editor@pitchpulse.com', password: 'editor2026', role: 'Editor Liga' },
        { id: 'admin-3', name: 'Sofía Auditora Liga', email: 'auditor@pitchpulse.com', password: 'auditor2026', role: 'Auditor Técnico' }
      ];
      localStorage.setItem(MOCK_DB_KEYS.admins, JSON.stringify(defaultAdmins));
      setAdminsList(defaultAdmins);
    } else {
      setAdminsList(JSON.parse(admins));
    }

    // 3. Load and seed audit logs
    let logs = localStorage.getItem(MOCK_DB_KEYS.auditLogs);
    if (!logs) {
      const defaultLogs = [
        { id: 'log-1', time: '2026-05-26 11:20:45', email: 'admin@pitchpulse.com', details: 'Inicialización de la base de datos oficial', ip: '127.0.0.1' },
        { id: 'log-2', time: '2026-05-26 12:45:10', email: 'editor@pitchpulse.com', details: 'Revisión y avales técnicos cargados', ip: '192.168.1.102' }
      ];
      localStorage.setItem(MOCK_DB_KEYS.auditLogs, JSON.stringify(defaultLogs));
      setAuditLogs(defaultLogs);
    } else {
      setAuditLogs(JSON.parse(logs));
    }

    // 4. Seeding dynamic backgrounds list
    let bgs = localStorage.getItem(MOCK_DB_KEYS.backgrounds);
    if (!bgs) {
      const defaultBackgrounds = [
        { id: 'neon_pitch', name: '🏟️ Fondo Pitch Neón', description: 'Líneas de juego color verde neón futurista', image: '/backgrounds/neon_pitch.png', isPreset: true, enabled: true },
        { id: 'golden_shield', name: '🥇 Fondo Escudo Dorado', description: 'Textura dorada metálica de lujo', image: '/backgrounds/golden_shield.png', isPreset: true, enabled: true },
        { id: 'cyber_grid', name: '👾 Fondo Rejilla Cyber', description: 'Matriz de rejilla de datos neón rosa/violeta', image: '/backgrounds/cyber_grid.png', isPreset: true, enabled: true },
        { id: 'legend_marble', name: '🏛️ Fondo Mármol Leyenda', description: 'Mármol blanco elegante con vetas de oro', image: '/backgrounds/legend_marble.png', isPreset: true, enabled: true }
      ];
      localStorage.setItem(MOCK_DB_KEYS.backgrounds, JSON.stringify(defaultBackgrounds));
      setBackgroundsList(defaultBackgrounds);
    } else {
      setBackgroundsList(JSON.parse(bgs));
    }
  };

  const persistData = (updatedDb) => {
    localStorage.setItem(MOCK_DB_KEYS.players, JSON.stringify(updatedDb.players));
    localStorage.setItem(MOCK_DB_KEYS.dts, JSON.stringify(updatedDb.dts));
    localStorage.setItem(MOCK_DB_KEYS.referees, JSON.stringify(updatedDb.referees));
    setDb(updatedDb);

    // Trigger local storage event manually for other tabs / windows
    window.dispatchEvent(new Event('storage'));
  };

  // Helper to add audit logs
  const logAuditAction = (email, details) => {
    const now = new Date();
    const formattedTime = now.toISOString().replace('T', ' ').substring(0, 19);
    
    // Simulating user IP
    const randomIP = `192.168.1.${Math.floor(Math.random() * 254) + 1}`;
    const newLog = {
      id: `log-${Date.now()}`,
      time: formattedTime,
      email,
      details,
      ip: randomIP
    };

    const currentLogs = JSON.parse(localStorage.getItem(MOCK_DB_KEYS.auditLogs) || '[]');
    const nextLogs = [newLog, ...currentLogs].slice(0, 50); // Keep last 50 entries
    localStorage.setItem(MOCK_DB_KEYS.auditLogs, JSON.stringify(nextLogs));
    setAuditLogs(nextLogs);
  };

  // Auth: Handle Sign In
  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) return;

    // Search administrator database
    const matchedAdmin = adminsList.find(
      a => a.email.toLowerCase() === loginEmail.toLowerCase() && a.password === loginPassword
    );

    if (matchedAdmin) {
      // Login success
      sessionStorage.setItem('futcard_active_admin', JSON.stringify(matchedAdmin));
      setActiveAdmin(matchedAdmin);
      logAuditAction(matchedAdmin.email, 'Inicio de sesión exitoso');
      showToast(`🔑 Bienvenido de nuevo, ${matchedAdmin.name}`);
      
      // Clear forms
      setLoginEmail('');
      setLoginPassword('');
      setLoginError('');
    } else {
      // Login failed with premium visual shake
      setLoginShake(true);
      setLoginError('Credenciales incorrectas. Verifica tu correo y contraseña.');
      setTimeout(() => {
        setLoginShake(false);
      }, 500);
    }
  };

  // Auth: Handle Sign Out
  const handleLogout = () => {
    if (activeAdmin) {
      logAuditAction(activeAdmin.email, 'Cierre de sesión voluntario');
      sessionStorage.removeItem('futcard_active_admin');
      setActiveAdmin(null);
      setActiveTab('federados');
      showToast('🔒 Sesión cerrada con éxito');
    }
  };

  // Federated CRUD: Save/Update User
  const handleCreateOrUpdateUser = (e) => {
    e.preventDefault();
    if (isAuditor) {
      showToast('⚠️ Error: Tu rol de Auditor Técnico no tiene permisos para crear/editar federados.');
      return;
    }
    if (!formData.name.trim()) return;

    let nextDb = { ...db };

    if (editingUserId) {
      // 1. UPDATE USER
      if (selectedRole === 'player') {
        const originalPlayer = db.players.find(p => p.id === editingUserId);
        nextDb.players = db.players.map(p => p.id === editingUserId ? {
          ...originalPlayer,
          name: formData.name,
          club: formData.club || 'Libre',
          position: formData.position,
          cardTheme: formData.cardTheme,
          skills: {
            pac: { name: 'Ritmo', value: parseInt(formData.pac) || 75, endorsements: originalPlayer.skills?.pac?.endorsements || [] },
            sho: { name: 'Tiro', value: parseInt(formData.sho) || 75, endorsements: originalPlayer.skills?.sho?.endorsements || [] },
            pas: { name: 'Pase', value: parseInt(formData.pas) || 75, endorsements: originalPlayer.skills?.pas?.endorsements || [] },
            dri: { name: 'Regate', value: parseInt(formData.dri) || 75, endorsements: originalPlayer.skills?.dri?.endorsements || [] },
            def: { name: 'Defensa', value: parseInt(formData.def) || 75, endorsements: originalPlayer.skills?.def?.endorsements || [] },
            phy: { name: 'Físico', value: parseInt(formData.phy) || 75, endorsements: originalPlayer.skills?.phy?.endorsements || [] }
          }
        } : p);
      } else if (selectedRole === 'dt') {
        const originalDt = db.dts.find(d => d.id === editingUserId);
        nextDb.dts = db.dts.map(d => d.id === editingUserId ? {
          ...originalDt,
          name: formData.name,
          tacticalStyle: formData.tacticalStyle,
          formation: formData.formation,
          certifications: formData.certifications,
          experience: formData.experience
        } : d);
      } else if (selectedRole === 'referee') {
        const originalRef = db.referees.find(r => r.id === editingUserId);
        nextDb.referees = db.referees.map(r => r.id === editingUserId ? {
          ...originalRef,
          name: formData.name,
          category: formData.category,
          matches: formData.matches,
          yellowCards: formData.yellowCards,
          redCards: formData.redCards,
          physicalLevel: formData.physicalLevel
        } : r);
      }
      logAuditAction(activeAdmin.email, `Modificó registro federado: ${formData.name} (${selectedRole})`);
      showToast(`📝 Usuario "${formData.name}" actualizado con éxito`);
      setEditingUserId(null);
    } else {
      // 2. CREATE USER
      const uniqueId = `${selectedRole === 'player' ? 'p' : selectedRole === 'dt' ? 'dt' : 'ref'}-${Date.now()}`;
      let newUser = {
        id: uniqueId,
        name: formData.name,
        avatar: '',
      };

      if (selectedRole === 'player') {
        newUser = {
          ...newUser,
          position: formData.position,
          club: formData.club || 'Libre',
          nationality: formData.nationality,
          flag: formData.flag,
          cardTheme: formData.cardTheme,
          aiPrompt: formData.aiPrompt,
          skills: {
            pac: { name: 'Ritmo', value: parseInt(formData.pac) || 75, endorsements: [] },
            sho: { name: 'Tiro', value: parseInt(formData.sho) || 75, endorsements: [] },
            pas: { name: 'Pase', value: parseInt(formData.pas) || 75, endorsements: [] },
            dri: { name: 'Regate', value: parseInt(formData.dri) || 75, endorsements: [] },
            def: { name: 'Defensa', value: parseInt(formData.def) || 75, endorsements: [] },
            phy: { name: 'Físico', value: parseInt(formData.phy) || 75, endorsements: [] }
          },
          teams: []
        };
        nextDb.players = [...db.players, newUser];
      } else if (selectedRole === 'dt') {
        newUser = {
          ...newUser,
          tacticalStyle: formData.tacticalStyle,
          formation: formData.formation,
          certifications: formData.certifications,
          experience: formData.experience || 'Sin trayectoria cargada',
          verifiedLeagues: []
        };
        nextDb.dts = [...db.dts, newUser];
      } else if (selectedRole === 'referee') {
        newUser = {
          ...newUser,
          category: formData.category,
          matches: formData.matches || '0 Partidos',
          yellowCards: formData.yellowCards || '4.0',
          redCards: formData.redCards || '0.2',
          physicalLevel: formData.physicalLevel,
          verifiedLeagues: []
        };
        nextDb.referees = [...db.referees, newUser];
      }
      logAuditAction(activeAdmin.email, `Creó nuevo registro federado: ${formData.name} (${selectedRole})`);
      showToast(`➕ Nuevo ${selectedRole.toUpperCase()} "${formData.name}" registrado`);
    }

    persistData(nextDb);

    // Reset fields
    setFormData({
      name: '', club: '', position: 'DEL', nationality: 'México', flag: 'https://flagcdn.com/w40/mx.png', cardTheme: 'gold', aiPrompt: 'Fondo ciberpunk neón deportivo',
      tacticalStyle: 'Presión Alta (Gegenpressing)', formation: '4-3-3', experience: '', certifications: 'UEFA Pro License',
      category: 'Árbitro Central FIFA', matches: '150 Partidos', yellowCards: '4.2', redCards: '0.28', physicalLevel: 'Élite Clase A',
      pac: 75, sho: 75, pas: 75, dri: 75, def: 75, phy: 75
    });
  };

  // Federated CRUD: Edit Click
  const handleEditClick = (user, roleType) => {
    if (isAuditor) {
      showToast('⚠️ No puedes editar registros en modo de consulta de Auditor Técnico.');
      return;
    }
    setSelectedRole(roleType);
    setEditingUserId(user.id);

    if (roleType === 'player') {
      setFormData({
        name: user.name,
        club: user.club || '',
        position: user.position || 'DEL',
        cardTheme: user.cardTheme || 'gold',
        pac: user.skills?.pac?.value || 75,
        sho: user.skills?.sho?.value || 75,
        pas: user.skills?.pas?.value || 75,
        dri: user.skills?.dri?.value || 75,
        def: user.skills?.def?.value || 75,
        phy: user.skills?.phy?.value || 75
      });
    } else if (roleType === 'dt') {
      setFormData({
        name: user.name,
        tacticalStyle: user.tacticalStyle,
        formation: user.formation,
        certifications: user.certifications,
        experience: user.experience
      });
    } else if (roleType === 'referee') {
      setFormData({
        name: user.name,
        category: user.category,
        matches: user.matches,
        yellowCards: user.yellowCards,
        redCards: user.redCards,
        physicalLevel: user.physicalLevel
      });
    }
    showToast(`✏️ Editando perfil de ${user.name}`);
  };

  // Federated CRUD: Delete Click
  const handleDeleteClick = (roleType, userId, name) => {
    if (isAuditor) {
      showToast('⚠️ Error: Los auditores técnicos tienen el panel de eliminación inhabilitado.');
      return;
    }
    if (!window.confirm(`¿Estás seguro que deseas eliminar a "${name}" de la federación?`)) return;

    let nextDb = { ...db };
    if (roleType === 'player') {
      nextDb.players = db.players.filter(p => p.id !== userId);
    } else if (roleType === 'dt') {
      nextDb.dts = db.dts.filter(d => d.id !== userId);
    } else if (roleType === 'referee') {
      nextDb.referees = db.referees.filter(r => r.id !== userId);
    }

    persistData(nextDb);
    logAuditAction(activeAdmin.email, `Eliminó registro federado: ${name} (${roleType})`);
    showToast(`🗑️ ${name} ha sido eliminado permanentemente`);
    if (editingUserId === userId) setEditingUserId(null);
  };

  // Federated CRUD: Verification Badges Toggle
  const handleToggleVerification = (user, roleType) => {
    if (isAuditor) {
      showToast('⚠️ Permiso denegado: El modo Auditor no permite alterar acreditaciones de liga.');
      return;
    }
    let nextDb = { ...db };
    const currentVerified = user.verifiedLeagues || [];
    const isVerified = currentVerified.includes('liga-1');
    const nextVerified = isVerified 
      ? currentVerified.filter(id => id !== 'liga-1')
      : [...currentVerified, 'liga-1'];

    if (roleType === 'dt') {
      nextDb.dts = db.dts.map(d => d.id === user.id ? { ...d, verifiedLeagues: nextVerified } : d);
    } else if (roleType === 'referee') {
      nextDb.referees = db.referees.map(r => r.id === user.id ? { ...r, verifiedLeagues: nextVerified } : r);
    }

    persistData(nextDb);
    logAuditAction(activeAdmin.email, `${isVerified ? 'Revocó' : 'Otorgó'} acreditación oficial de liga a: ${user.name}`);
    showToast(`🛡️ Acreditación oficial ${isVerified ? 'removida de' : 'otorgada a'} ${user.name}`);
  };

  // Admin CRUD: Create / Update Administrator Account
  const handleCreateOrUpdateAdmin = (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      showToast('⚠️ Error: Solo un Super Admin puede gestionar cuentas administrativas.');
      return;
    }
    if (!adminForm.name.trim() || !adminForm.email.trim() || !adminForm.password.trim()) return;

    let nextAdmins = [...adminsList];

    if (editingAdminId) {
      // Prevent editing the default super admin email/role to avoid locked state
      if (editingAdminId === 'admin-1' && (adminForm.role !== 'Super Admin' || adminForm.email !== 'admin@pitchpulse.com')) {
        showToast('⚠️ Error de Seguridad: No se permite cambiar el rol o email del Super Admin primario.');
        return;
      }

      nextAdmins = adminsList.map(a => a.id === editingAdminId ? {
        ...a,
        name: adminForm.name,
        email: adminForm.email,
        password: adminForm.password,
        role: adminForm.role
      } : a);
      logAuditAction(activeAdmin.email, `Modificó administrador: ${adminForm.email} (${adminForm.role})`);
      showToast(`📝 Administrador "${adminForm.name}" modificado`);
      setEditingAdminId(null);
    } else {
      // Check for email duplication
      if (adminsList.some(a => a.email.toLowerCase() === adminForm.email.toLowerCase())) {
        showToast('⚠️ Error: Este correo de administrador ya se encuentra registrado.');
        return;
      }

      const newAdmin = {
        id: `admin-${Date.now()}`,
        name: adminForm.name,
        email: adminForm.email,
        password: adminForm.password,
        role: adminForm.role
      };
      nextAdmins = [...adminsList, newAdmin];
      logAuditAction(activeAdmin.email, `Creó nuevo administrador: ${adminForm.email} (${adminForm.role})`);
      showToast(`➕ Nuevo administrador "${adminForm.name}" registrado`);
    }

    localStorage.setItem(MOCK_DB_KEYS.admins, JSON.stringify(nextAdmins));
    setAdminsList(nextAdmins);

    setAdminForm({ name: '', email: '', password: '', role: 'Editor Liga' });
  };

  // Admin CRUD: Delete Administrator
  const handleDeleteAdminClick = (id, name, email) => {
    if (!isSuperAdmin) {
      showToast('⚠️ Permiso denegado: Solo un Super Admin puede dar de baja administradores.');
      return;
    }
    if (id === 'admin-1') {
      showToast('⚠️ Seguridad FMF: No se puede eliminar al Super Administrador maestro.');
      return;
    }
    if (id === activeAdmin.id) {
      showToast('⚠️ Error: No puedes eliminar tu propia cuenta en sesión activa.');
      return;
    }

    if (!window.confirm(`¿Estás seguro que deseas dar de baja a la cuenta de admin "${name}"?`)) return;

    const nextAdmins = adminsList.filter(a => a.id !== id);
    localStorage.setItem(MOCK_DB_KEYS.admins, JSON.stringify(nextAdmins));
    setAdminsList(nextAdmins);
    
    logAuditAction(activeAdmin.email, `Eliminó administrador permanente: ${email}`);
    showToast(`🗑️ Cuenta de administrador "${name}" eliminada`);
    if (editingAdminId === id) setEditingAdminId(null);
  };

  // System Configurations CRUD: Save Gemini API Key
  const handleSaveGeminiKey = (e) => {
    e.preventDefault();
    if (isAuditor) {
      showToast('⚠️ Error: Tu nivel de Auditor Técnico no tiene permisos para alterar llaves de API.');
      return;
    }
    localStorage.setItem(MOCK_DB_KEYS.geminiKey, geminiKey);
    logAuditAction(activeAdmin.email, `Actualizó la clave de API de Google Gemini`);
    showToast('🔑 API Key de Google Gemini guardada con éxito');
    
    // Trigger local storage event manually for client sync
    window.dispatchEvent(new Event('storage'));
  };

  // System Configurations: Diagnosticate Gemini prompt
  const handleTestGeminiAPI = async () => {
    if (!geminiKey) {
      showToast('⚠️ Error: Debes ingresar y guardar una API Key antes de probar el sandbox.');
      return;
    }
    setDiagnosticLoading(true);
    setDiagnosticResult(null);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analiza este prompt deportivo: '${diagnosticPrompt}'. Devuelve únicamente un objeto JSON plano sin backticks que asigne colores ideales para el tema: {"primaryColor": "#hex", "secondaryColor": "#hex", "accentColor": "#hex", "designName": "2 palabras", "feedbackMsg": "1 linea"}.`
            }]
          }]
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanText);
      setDiagnosticResult(parsed);
      logAuditAction(activeAdmin.email, `Prueba exitosa del Sandbox de Gemini con prompt: "${diagnosticPrompt}"`);
    } catch (e) {
      console.error(e);
      setDiagnosticResult({ error: 'Fallo al parsear o conectar. Verifica la API Key o la estructura.' });
    } finally {
      setDiagnosticLoading(false);
    }
  };

  // System Configurations CRUD: Toggle Enabled Background Image
  const handleToggleBackground = (bgId) => {
    if (isAuditor) {
      showToast('⚠️ Permiso denegado: Los auditores no pueden alterar los recursos visuales del sistema.');
      return;
    }
    
    const nextBackgrounds = backgroundsList.map(bg => {
      if (bg.id === bgId) {
        // Keep at least one enabled
        const enabledCount = backgroundsList.filter(b => b.enabled).length;
        if (bg.enabled && enabledCount <= 1) {
          showToast('⚠️ Error: Debe permanecer al menos un fondo activo habilitado en la federación.');
          return bg;
        }
        const updatedBg = { ...bg, enabled: !bg.enabled };
        logAuditAction(activeAdmin.email, `${bg.enabled ? 'Deshabilitó' : 'Habilitó'} fondo de tarjeta: ${bg.name}`);
        showToast(`🎨 Fondo "${bg.name}" ${bg.enabled ? 'desactivado' : 'activado'} en vivo`);
        return updatedBg;
      }
      return bg;
    });

    localStorage.setItem(MOCK_DB_KEYS.backgrounds, JSON.stringify(nextBackgrounds));
    setBackgroundsList(nextBackgrounds);

    // Sync client storage event
    window.dispatchEvent(new Event('storage'));
  };

  // System Configurations CRUD: Upload Custom Background Image (base64)
  const handleUploadCustomBackground = (e) => {
    e.preventDefault();
    if (isAuditor) {
      showToast('⚠️ Error: Los auditores no tienen permitido subir archivos multimedia.');
      return;
    }
    if (!customBgForm.name.trim() || !customBgForm.image) {
      showToast('⚠️ Error: Completa el nombre y selecciona un archivo de imagen.');
      return;
    }

    const newBg = {
      id: `bg-custom-${Date.now()}`,
      name: `🎨 ${customBgForm.name}`,
      description: customBgForm.description || 'Fondo cargado por el administrador',
      image: customBgForm.image,
      isPreset: false,
      enabled: true
    };

    const nextBackgrounds = [...backgroundsList, newBg];
    localStorage.setItem(MOCK_DB_KEYS.backgrounds, JSON.stringify(nextBackgrounds));
    setBackgroundsList(nextBackgrounds);

    logAuditAction(activeAdmin.email, `Subió nuevo fondo de tarjeta personalizado: ${customBgForm.name}`);
    showToast(`➕ Fondo "${customBgForm.name}" subido e integrado con éxito`);

    // Reset Form
    setCustomBgForm({ name: '', description: '', image: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Sync client storage event
    window.dispatchEvent(new Event('storage'));
  };

  // System Configurations CRUD: Delete Custom Background Image
  const handleDeleteBackground = (bgId, name) => {
    if (isAuditor) {
      showToast('⚠️ Permiso denegado.');
      return;
    }
    if (!window.confirm(`¿Estás seguro que deseas dar de baja y borrar el fondo "${name}" permanentemente?`)) return;

    // Check if it's currently active and if we are breaking min counts
    const nextBackgrounds = backgroundsList.filter(bg => bg.id !== bgId);
    
    // Safety check: make sure we have at least one enabled
    const enabledCount = nextBackgrounds.filter(b => b.enabled).length;
    if (enabledCount < 1) {
      showToast('⚠️ Error: No puedes eliminar este fondo ya que rompería el mínimo de fondos activos.');
      return;
    }

    localStorage.setItem(MOCK_DB_KEYS.backgrounds, JSON.stringify(nextBackgrounds));
    setBackgroundsList(nextBackgrounds);

    logAuditAction(activeAdmin.email, `Eliminó fondo de tarjeta de forma permanente: ${name}`);
    showToast(`🗑️ Fondo "${name}" eliminado permanentemente`);

    // Sync client storage event
    window.dispatchEvent(new Event('storage'));
  };

  const handleCustomImageFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2000000) {
        showToast('⚠️ Error: La imagen supera los 2MB. Sube un archivo más ligero.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomBgForm({ ...customBgForm, image: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset database values to factory defaults
  const handleFactoryResetData = () => {
    if (!isSuperAdmin) {
      showToast('⚠️ Error de Seguridad: Solo un Super Admin principal puede restablecer la base de datos.');
      return;
    }
    if (!window.confirm('🚨 ¡ADVERTENCIA CRÍTICA! Esta acción restablecerá todos los jugadores, DTs y árbitros a sus valores por defecto de fábrica. ¿Deseas continuar?')) return;
    
    localStorage.removeItem('futcard_players');
    localStorage.removeItem('futcard_dts');
    localStorage.removeItem('futcard_referees');
    localStorage.removeItem('futcard_leagues');
    localStorage.removeItem('futcard_all_backgrounds');
    
    logAuditAction(activeAdmin.email, 'Restableció la base de datos federativa a los valores de fábrica');
    showToast('🔄 Base de datos federativa restablecida con éxito. Recargando datos...');
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Helper Toast Notification
  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification('🔌 Conectado a la base de datos local compartida (localStorage)');
    }, 4500);
  };

  // Compile directory entries
  const filteredUsers = [];
  if (roleFilter === 'all' || roleFilter === 'player') {
    db.players.forEach(p => {
      if (p.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        filteredUsers.push({ ...p, roleType: 'player' });
      }
    });
  }
  if (roleFilter === 'all' || roleFilter === 'dt') {
    db.dts.forEach(d => {
      if (d.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        filteredUsers.push({ ...d, roleType: 'dt' });
      }
    });
  }
  if (roleFilter === 'all' || roleFilter === 'referee') {
    db.referees.forEach(r => {
      if (r.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        filteredUsers.push({ ...r, roleType: 'referee' });
      }
    });
  }

  // RENDER LOGIN SCREEN IF NO SESSION
  if (!activeAdmin) {
    return (
      <div className="login-overlay">
        <div className={`login-card ${loginShake ? 'shake-effect' : ''}`}>
          <div className="login-logo-container">
            <span style={{ fontSize: '38px' }}>⚽</span>
            <h1 className="login-title">PITCH<span>PULSE</span></h1>
            <p className="login-subtitle">Portal Federativo de Administración</p>
          </div>

          <form onSubmit={handleLogin}>
            {loginError && (
              <div className="error-banner">
                <ShieldAlert size={16} />
                <span>{loginError}</span>
              </div>
            )}

            <div className="form-group">
              <label>Correo Electrónico Administrativo</label>
              <input
                type="email"
                className="form-input"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="ejemplo@pitchpulse.com"
                required
              />
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label>Contraseña Acceso FMF</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '6px',
                  bottom: '10px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
                title={showPassword ? "Ocultar" : "Mostrar"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '24px' }}>
              <ShieldCheck size={18} />
              Iniciar Sesión Autorizada
            </button>
          </form>

          {/* Quick preset credentials */}
          <div style={{ marginTop: '30px', borderTop: '1px dashed var(--border-color)', paddingTop: '15px' }}>
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Cuentas de Prueba Rápida
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button 
                type="button" 
                onClick={() => { setLoginEmail('admin@pitchpulse.com'); setLoginPassword('admin2026'); }}
                className="btn-secondary" 
                style={{ justifyContent: 'space-between', padding: '6px 10px', fontSize: '10px' }}
              >
                <span>🔑 Super Admin (CRUD Total)</span>
                <span style={{ color: 'var(--primary)' }}>Cargar</span>
              </button>
              <button 
                type="button" 
                onClick={() => { setLoginEmail('editor@pitchpulse.com'); setLoginPassword('editor2026'); }}
                className="btn-secondary" 
                style={{ justifyContent: 'space-between', padding: '6px 10px', fontSize: '10px' }}
              >
                <span>📝 Editor Liga (CRUD Federados)</span>
                <span style={{ color: 'var(--accent-cyan)' }}>Cargar</span>
              </button>
              <button 
                type="button" 
                onClick={() => { setLoginEmail('auditor@pitchpulse.com'); setLoginPassword('auditor2026'); }}
                className="btn-secondary" 
                style={{ justifyContent: 'space-between', padding: '6px 10px', fontSize: '10px' }}
              >
                <span>👁️ Auditor (Consulta Solo Lectura)</span>
                <span style={{ color: 'var(--accent-gold)' }}>Cargar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE DASHBOARD CONTAINER
  return (
    <div className="admin-container">
      {/* Top Navbar */}
      <header className="admin-header">
        <div className="admin-logo">
          ⚽ Pitch Pulse <span>Admin Portal</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Active Admin details */}
          <div className="header-profile-pill">
            <UserCheck size={14} color="var(--primary)" />
            <div>
              <span className="header-profile-name">{activeAdmin.name}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '8px' }}>|</span>
              {isSuperAdmin && <span className="badge badge-gold" style={{ marginLeft: '8px', padding: '2px 6px', fontSize: '8px' }}>Super Admin</span>}
              {isEditor && <span className="badge badge-purple" style={{ marginLeft: '8px', padding: '2px 6px', fontSize: '8px' }}>Editor Liga</span>}
              {isAuditor && <span className="badge badge-blue" style={{ marginLeft: '8px', padding: '2px 6px', fontSize: '8px' }}>Auditor Técnico</span>}
            </div>
          </div>

          <button 
            onClick={handleLogout} 
            className="btn-logout"
            title="Cerrar Sesión Segura"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="admin-navigation">
        <button 
          onClick={() => setActiveTab('federados')} 
          className={`nav-tab-btn ${activeTab === 'federados' ? 'active' : ''}`}
        >
          <Layers size={16} />
          Gestión de Federados
        </button>
        <button 
          onClick={() => setActiveTab('admins')} 
          className={`nav-tab-btn ${activeTab === 'admins' ? 'active' : ''}`}
        >
          <Unlock size={15} />
          Control de Administradores
        </button>
        <button 
          onClick={() => setActiveTab('config')} 
          className={`nav-tab-btn ${activeTab === 'config' ? 'active' : ''}`}
        >
          <Settings size={15} />
          Configuraciones
        </button>
      </nav>

      {/* TAB 1: Federated CRUD */}
      {activeTab === 'federados' && (
        <div className="admin-workspace">
          
          <div className="glass-panel">
            <h2 className="section-title">
              <Layers size={18} color="var(--primary)" />
              Directorio Oficial de Federados
            </h2>

            <div className="search-bar-container">
              <div className="search-input-wrapper">
                <Search className="search-icon-inside" size={16} />
                <input
                  type="text"
                  className="search-field"
                  placeholder="BUSCAR POR NOMBRE..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '4px' }}>
                {['all', 'player', 'dt', 'referee'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setRoleFilter(f)}
                    className="btn-secondary"
                    style={{
                      background: roleFilter === f ? 'var(--primary)' : 'transparent',
                      color: roleFilter === f ? '#121414' : 'var(--text-primary)',
                      borderColor: roleFilter === f ? 'var(--primary)' : 'var(--border-color)',
                      padding: '8px 12px'
                    }}
                  >
                    {f === 'all' ? 'Todos' : f === 'player' ? 'Jugadores' : f === 'dt' ? 'DTs' : 'Árbitros'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ overflowX: 'auto', marginTop: '10px' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Rol / Ficha</th>
                    <th>Detalle Técnico</th>
                    <th style={{ textAlign: 'center' }}>Licencia Liga</th>
                    <th style={{ textAlign: 'right' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => {
                      const isPlayer = u.roleType === 'player';
                      const isDt = u.roleType === 'dt';
                      const isRef = u.roleType === 'referee';
                      const isVerified = u.verifiedLeagues?.includes('liga-1');

                      return (
                        <tr key={u.id}>
                          <td style={{ fontWeight: '700', color: '#ffffff' }}>{u.name}</td>
                          <td>
                            {isPlayer && <span className="badge badge-gold">Jugador ({u.position})</span>}
                            {isDt && <span className="badge badge-emerald">DT Coach</span>}
                            {isRef && <span className="badge badge-cyan">Árbitro</span>}
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                            {isPlayer && `Rating: ${Math.round(Object.keys(u.skills).reduce((a, k) => a + u.skills[k].value, 0) / 6)}`}
                            {isDt && `${u.formation} (${u.tacticalStyle.split(' ')[0]})`}
                            {isRef && `${u.matches.split(' ')[0]} Partidos`}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {!isPlayer ? (
                              <button
                                onClick={() => handleToggleVerification(u, u.roleType)}
                                style={{ background: 'none', border: 'none', color: isVerified ? 'var(--primary)' : 'var(--text-muted)', cursor: isVerified && !isAuditor ? 'pointer' : isAuditor ? 'not-allowed' : 'pointer' }}
                                title={isAuditor ? "Solo lectura" : "Habilitar/Deshabilitar aval"}
                                disabled={isAuditor}
                              >
                                {isVerified ? <CheckCircle2 size={16} fill="rgba(195,244,0,0.1)" /> : <XCircle size={16} />}
                              </button>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>-</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => handleEditClick(u, u.roleType)}
                                style={{ background: 'none', border: 'none', color: isAuditor ? 'var(--text-muted)' : 'var(--accent-cyan)', cursor: isAuditor ? 'not-allowed' : 'pointer' }}
                                disabled={isAuditor}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(u.roleType, u.id, u.name)}
                                style={{ background: 'none', border: 'none', color: isAuditor ? 'var(--text-muted)' : '#ef4444', cursor: isAuditor ? 'not-allowed' : 'pointer' }}
                                disabled={isAuditor}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        Ningún federado coincide con la búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="notification-card">
              <span className="status-dot active"></span>
              {notification}
            </div>
          </div>

          <div className="glass-panel">
            <h2 className="section-title" style={{ borderLeftColor: 'var(--accent-cyan)' }}>
              <Award size={18} color="var(--accent-cyan)" />
              {editingUserId ? 'Modificar Registro' : 'Registrar Nuevo Federado'}
            </h2>

            {isAuditor && (
              <div className="auditor-notice-banner">
                <ShieldAlert size={14} style={{ marginRight: '6px', verticalAlign: 'middle', display: 'inline' }} />
                <span><strong>MODO CONSULTA:</strong> Tu cuenta es de solo lectura.</span>
              </div>
            )}

            <form onSubmit={handleCreateOrUpdateUser}>
              {!editingUserId && (
                <div className="form-group">
                  <label>Rol del Perfil Federado</label>
                  <select
                    className="form-select"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    disabled={isAuditor}
                  >
                    <option value="player">🏃‍♂️ Jugador de Fútbol</option>
                    <option value="dt">📋 Director Técnico (DT)</option>
                    <option value="referee">🏁 Árbitro Profesional</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Nombre Completo</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Marcus Bellingham"
                  required
                  disabled={isAuditor}
                />
              </div>

              {selectedRole === 'player' && (
                <div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Posición</label>
                      <select
                        className="form-select"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        disabled={isAuditor}
                      >
                        <option value="POR">POR</option>
                        <option value="DFC">DFC</option>
                        <option value="LD">LD</option>
                        <option value="LI">LI</option>
                        <option value="MCD">MCD</option>
                        <option value="MC">MC</option>
                        <option value="MCO">MCO</option>
                        <option value="ED">ED</option>
                        <option value="EI">EI</option>
                        <option value="DEL">DEL</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Club</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.club}
                        onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                        placeholder="Ej. London AC"
                        disabled={isAuditor}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Estilo de Tarjeta</label>
                    <select
                      className="form-select"
                      value={formData.cardTheme}
                      onChange={(e) => setFormData({ ...formData, cardTheme: e.target.value })}
                      disabled={isAuditor}
                    >
                      <option value="gold">Gold Neon</option>
                      <option value="icon">Leyenda</option>
                      <option value="totw">TOTW</option>
                      <option value="future">Futuro Crack</option>
                    </select>
                  </div>

                  <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Atributos Técnicos Base
                  </h4>
                  <div className="stat-adjuster-grid" style={{ marginBottom: '14px' }}>
                    <div className="stat-adjuster-card">
                      <span className="stat-adjuster-label">RIT</span>
                      <input type="number" className="stat-adjuster-input" value={formData.pac} min="0" max="99" onChange={(e) => setFormData({ ...formData, pac: e.target.value })} disabled={isAuditor} />
                    </div>
                    <div className="stat-adjuster-card">
                      <span className="stat-adjuster-label">TIR</span>
                      <input type="number" className="stat-adjuster-input" value={formData.sho} min="0" max="99" onChange={(e) => setFormData({ ...formData, sho: e.target.value })} disabled={isAuditor} />
                    </div>
                    <div className="stat-adjuster-card">
                      <span className="stat-adjuster-label">PAS</span>
                      <input type="number" className="stat-adjuster-input" value={formData.pas} min="0" max="99" onChange={(e) => setFormData({ ...formData, pas: e.target.value })} disabled={isAuditor} />
                    </div>
                    <div className="stat-adjuster-card">
                      <span className="stat-adjuster-label">REG</span>
                      <input type="number" className="stat-adjuster-input" value={formData.dri} min="0" max="99" onChange={(e) => setFormData({ ...formData, dri: e.target.value })} disabled={isAuditor} />
                    </div>
                    <div className="stat-adjuster-card">
                      <span className="stat-adjuster-label">DEF</span>
                      <input type="number" className="stat-adjuster-input" value={formData.def} min="0" max="99" onChange={(e) => setFormData({ ...formData, def: e.target.value })} disabled={isAuditor} />
                    </div>
                    <div className="stat-adjuster-card">
                      <span className="stat-adjuster-label">FIS</span>
                      <input type="number" className="stat-adjuster-input" value={formData.phy} min="0" max="99" onChange={(e) => setFormData({ ...formData, phy: e.target.value })} disabled={isAuditor} />
                    </div>
                  </div>
                </div>
              )}

              {selectedRole === 'dt' && (
                <div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Filosofía</label>
                      <input type="text" className="form-input" value={formData.tacticalStyle} onChange={(e) => setFormData({ ...formData, tacticalStyle: e.target.value })} disabled={isAuditor} />
                    </div>
                    <div className="form-group">
                      <label>Esquema</label>
                      <input type="text" className="form-input" value={formData.formation} onChange={(e) => setFormData({ ...formData, formation: e.target.value })} disabled={isAuditor} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Licencias</label>
                    <input type="text" className="form-input" value={formData.certifications} onChange={(e) => setFormData({ ...formData, certifications: e.target.value })} disabled={isAuditor} />
                  </div>
                  <div className="form-group">
                    <label>Trayectoria</label>
                    <textarea className="form-textarea" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} disabled={isAuditor} rows="3" />
                  </div>
                </div>
              )}

              {selectedRole === 'referee' && (
                <div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Categoría</label>
                      <input type="text" className="form-input" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} disabled={isAuditor} />
                    </div>
                    <div className="form-group">
                      <label>Partidos</label>
                      <input type="text" className="form-input" value={formData.matches} onChange={(e) => setFormData({ ...formData, matches: e.target.value })} disabled={isAuditor} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Amarillas</label>
                      <input type="text" className="form-input" value={formData.yellowCards} onChange={(e) => setFormData({ ...formData, yellowCards: e.target.value })} disabled={isAuditor} />
                    </div>
                    <div className="form-group">
                      <label>Rojas</label>
                      <input type="text" className="form-input" value={formData.redCards} onChange={(e) => setFormData({ ...formData, redCards: e.target.value })} disabled={isAuditor} />
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                {editingUserId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUserId(null);
                      setFormData({
                        name: '', club: '', position: 'DEL', nationality: 'México', flag: 'https://flagcdn.com/w40/mx.png', cardTheme: 'gold', aiPrompt: 'Fondo ciberpunk neón deportivo',
                        tacticalStyle: 'Presión Alta (Gegenpressing)', formation: '4-3-3', experience: '', certifications: 'UEFA Pro License',
                        category: 'Árbitro Central FIFA', matches: '150 Partidos', yellowCards: '4.2', redCards: '0.28', physicalLevel: 'Élite Clase A',
                        pac: 75, sho: 75, pas: 75, dri: 75, def: 75, phy: 75
                      });
                      showToast('❌ Cancelado');
                    }}
                    className="btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancelar
                  </button>
                )}
                <button type="submit" className="btn-primary" style={{ flex: editingUserId ? 2 : 1 }} disabled={isAuditor}>
                  <Save size={16} />
                  {editingUserId ? 'Guardar' : 'Dar de Alta'}
                </button>
              </div>
            </form>
          </div>

        </div>
      )}

      {/* TAB 2: Administrators Management */}
      {activeTab === 'admins' && (
        <div className="admin-workspace">
          
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 className="section-title">
              <Unlock size={18} color="var(--primary)" />
              Administradores Registrados FMF
            </h2>

            <div style={{ overflowX: 'auto', flex: 1 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email Acceso</th>
                    <th>Nivel Rol</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {adminsList.map((admin) => (
                    <tr key={admin.id}>
                      <td style={{ fontWeight: '700', color: '#ffffff' }}>{admin.name}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{admin.email}</td>
                      <td>
                        {admin.role === 'Super Admin' && <span className="badge badge-gold">Super Admin</span>}
                        {admin.role === 'Editor Liga' && <span className="badge badge-purple">Editor Liga</span>}
                        {admin.role === 'Auditor Técnico' && <span className="badge badge-blue">Auditor</span>}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => {
                              if (!isSuperAdmin) {
                                showToast('⚠️ Permiso denegado.');
                                return;
                              }
                              setEditingAdminId(admin.id);
                              setAdminForm({ name: admin.name, email: admin.email, password: admin.password, role: admin.role });
                              showToast(`✏️ Editando credenciales de ${admin.name}`);
                            }}
                            style={{ background: 'none', border: 'none', color: isSuperAdmin ? 'var(--accent-cyan)' : 'var(--text-muted)', cursor: isSuperAdmin ? 'pointer' : 'not-allowed' }}
                            disabled={!isSuperAdmin}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteAdminClick(admin.id, admin.name, admin.email)}
                            style={{ background: 'none', border: 'none', color: isSuperAdmin && admin.id !== 'admin-1' && admin.id !== activeAdmin.id ? '#ef4444' : 'var(--text-muted)', cursor: isSuperAdmin && admin.id !== 'admin-1' && admin.id !== activeAdmin.id ? 'pointer' : 'not-allowed' }}
                            disabled={!isSuperAdmin || admin.id === 'admin-1' || admin.id === activeAdmin.id}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="audit-logs-panel">
              <div className="audit-logs-title">
                <span><Terminal size={12} style={{ marginRight: '6px' }} /> Terminal de Accesos y Auditoría</span>
              </div>
              {auditLogs.map((log) => (
                <div className="audit-log-entry" key={log.id}>
                  <span className="audit-log-time">[{log.time}]</span>
                  <span className="audit-log-details">
                    <strong>{log.email}</strong>: {log.details}
                  </span>
                  <span className="audit-log-action">({log.ip})</span>
                </div>
              ))}
            </div>

            <div className="notification-card">
              <span className="status-dot active"></span>
              {notification}
            </div>
          </div>

          <div className="glass-panel">
            <h2 className="section-title" style={{ borderLeftColor: 'var(--accent-pink)' }}>
              <ShieldCheck size={18} color="var(--accent-pink)" />
              {editingAdminId ? 'Modificar Credenciales' : 'Registrar Nuevo Administrador'}
            </h2>

            {!isSuperAdmin && (
              <div className="auditor-notice-banner" style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
                <span><strong>ACCESO DENEGADO:</strong> Solo Super Admins pueden gestionar credenciales.</span>
              </div>
            )}

            <form onSubmit={handleCreateOrUpdateAdmin}>
              <div className="form-group">
                <label>Nombre de la Cuenta</label>
                <input type="text" className="form-input" value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} placeholder="Ej. Ing. Carlos" required disabled={!isSuperAdmin} />
              </div>
              <div className="form-group">
                <label>Correo de Acceso</label>
                <input type="email" className="form-input" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} required disabled={!isSuperAdmin || (editingAdminId === 'admin-1')} />
              </div>
              <div className="form-group">
                <label>Contraseña</label>
                <input type="text" className="form-input" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} required disabled={!isSuperAdmin} />
              </div>
              <div className="form-group">
                <label>Nivel de Rango</label>
                <select className="form-select" value={adminForm.role} onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })} disabled={!isSuperAdmin || (editingAdminId === 'admin-1')}>
                  <option value="Super Admin">🥇 Super Admin</option>
                  <option value="Editor Liga">🥈 Editor Liga</option>
                  <option value="Auditor Técnico">🥉 Auditor Técnico</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                {editingAdminId && (
                  <button type="button" onClick={() => { setEditingAdminId(null); setAdminForm({ name: '', email: '', password: '', role: 'Editor Liga' }); }} className="btn-secondary">Cancelar</button>
                )}
                <button type="submit" className="btn-primary" style={{ background: 'var(--accent-pink)' }} disabled={!isSuperAdmin}>
                  <Save size={16} /> Guardar
                </button>
              </div>
            </form>
          </div>

        </div>
      )}

      {/* TAB 3: Dynamic Settings (Gemini diagnostics & Image Uploader) */}
      {activeTab === 'config' && (
        <div className="admin-workspace">
          
          {/* Left Column: Visual background image uploader grid */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 className="section-title">
              <Sliders size={18} color="var(--primary)" />
              Galería y Carga de Fondos
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Administra los recursos visuales del creador móvil. Activa/desactiva fondos o sube tus propios archivos JPG/PNG para integrarlos al estudio de forma inmediata.
            </p>

            {/* Subir nuevo fondo form */}
            <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.12)', padding: '16px' }}>
              <h3 style={{ fontSize: '13px', color: '#ffffff', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Upload size={14} color="var(--accent-cyan)" /> Subir Nuevo Fondo Personalizado
              </h3>
              
              <form onSubmit={handleUploadCustomBackground} className="space-y-md">
                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '10px' }}>Nombre del Fondo</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={customBgForm.name}
                    onChange={(e) => setCustomBgForm({ ...customBgForm, name: e.target.value })}
                    placeholder="Ej. Espacio Estrellado"
                    disabled={isAuditor}
                    required
                    style={{ padding: '6px' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '10px' }}>Descripción Corta</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={customBgForm.description}
                    onChange={(e) => setCustomBgForm({ ...customBgForm, description: e.target.value })}
                    placeholder="Ej. Fondo galaxia oscura para cartas especiales"
                    disabled={isAuditor}
                    style={{ padding: '6px' }}
                  />
                </div>

                <div className="form-row" style={{ gap: '10px', alignItems: 'center' }}>
                  <div className="form-group" style={{ marginBottom: 0, flex: 2 }}>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleCustomImageFile}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary"
                      disabled={isAuditor}
                      style={{ borderStyle: 'dashed', padding: '8px' }}
                    >
                      <Upload size={14} /> Seleccionar Imagen (JPG/PNG)
                    </button>
                  </div>
                  
                  {/* File preview thumbnail */}
                  {customBgForm.image && (
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                      <img 
                        src={customBgForm.image} 
                        alt="Preview" 
                        style={{ width: '45px', height: '45px', borderRadius: '4px', objectCover: 'cover', border: '2px solid var(--accent-cyan)' }} 
                      />
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ background: 'var(--accent-cyan)', color: '#121414', padding: '10px', marginTop: '12px', fontSize: '12px' }}
                  disabled={isAuditor || !customBgForm.image}
                >
                  Habilitar y Subir al Sistema
                </button>
              </form>
            </div>

            {/* Visual backgrounds manager list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }} className="custom-scrollbar">
              {backgroundsList.map((bg) => (
                <div key={bg.id} className="glass-panel" style={{ background: 'rgba(255, 255, 255, 0.015)', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: bg.enabled ? 'rgba(195,244,0,0.12)' : 'var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div 
                      style={{ 
                        width: '50px', 
                        height: '50px', 
                        borderRadius: '2px', 
                        backgroundImage: `url('${bg.image}')`, 
                        backgroundSize: 'cover', 
                        backgroundPosition: 'center', 
                        border: '1px solid rgba(255,255,255,0.08)' 
                      }} 
                    />
                    <div>
                      <h4 style={{ color: '#ffffff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {bg.name}
                        {!bg.isPreset && <span className="badge badge-cyan" style={{ fontSize: '7px', padding: '1px 3px' }}>Custom</span>}
                      </h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '10px', marginTop: '2px' }}>{bg.description}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={bg.enabled}
                        onChange={() => handleToggleBackground(bg.id)}
                        disabled={isAuditor}
                      />
                      <span className="slider" style={{ borderRadius: '2px' }}></span>
                    </label>
                    
                    {!bg.isPreset && (
                      <button
                        type="button"
                        onClick={() => handleDeleteBackground(bg.id, bg.name)}
                        style={{ background: 'none', border: 'none', color: isAuditor ? 'var(--text-muted)' : '#ef4444', cursor: isAuditor ? 'not-allowed' : 'pointer' }}
                        disabled={isAuditor}
                        title="Borrar de la base de datos"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {isSuperAdmin && (
              <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '15px' }}>
                <button
                  type="button"
                  onClick={handleFactoryResetData}
                  className="btn-secondary"
                  style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)', padding: '10px', fontSize: '11px' }}
                >
                  <RefreshCw size={12} style={{ marginRight: '6px' }} /> Restablecer Valores de Fábrica
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Google Gemini Config form + Interactive Sandbox Diagnostics */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* API Config Box */}
            <div>
              <h2 className="section-title" style={{ borderLeftColor: 'var(--primary)' }}>
                <Lock size={18} color="var(--primary)" />
                Configuración de Gemini AI
              </h2>
              
              {isAuditor && (
                <div className="auditor-notice-banner" style={{ marginBottom: '12px' }}>
                  <span><strong>MODO CONSULTA:</strong> Sin permisos de edición.</span>
                </div>
              )}

              <form onSubmit={handleSaveGeminiKey}>
                <div className="form-group" style={{ position: 'relative', marginBottom: '14px' }}>
                  <label>Google Gemini API Key (AI Studio)</label>
                  <input
                    type={showGeminiKey ? 'text' : 'password'}
                    className="form-input"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    disabled={isAuditor}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    style={{ position: 'absolute', right: '6px', bottom: '10px', background: 'none', border: 'none', color: 'var(--text-muted)' }}
                  >
                    {showGeminiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                
                <button type="submit" className="btn-primary" style={{ padding: '10px', fontSize: '12px' }} disabled={isAuditor}>
                  <Save size={14} /> Guardar API Key
                </button>
              </form>
            </div>

            {/* Diagnostic Sandbox */}
            <div className="glass-panel" style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(195, 244, 0, 0.15)', padding: '16px' }}>
              <h3 style={{ color: 'var(--primary)', fontSize: '13px', textTransform: 'uppercase', fontFamily: 'var(--font-heading)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={14} /> Consola Diagnóstica Sandbox (Prompt Test)
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: '1.4' }}>
                Verifica en vivo si tu API Key funciona correctamente. Envía un prompt diagnóstico y observa el análisis de color estructurado que devolverá Gemini.
              </p>

              <div className="form-group" style={{ marginBottom: '10px' }}>
                <input 
                  type="text"
                  className="form-input"
                  value={diagnosticPrompt}
                  onChange={(e) => setDiagnosticPrompt(e.target.value)}
                  placeholder="Ej. Nebulosa azul galáctica"
                  style={{ background: '#0c0f0f', border: '1px solid rgba(255,255,255,0.06)' }}
                />
              </div>

              <button
                type="button"
                onClick={handleTestGeminiAPI}
                className="btn-secondary"
                disabled={diagnosticLoading || !geminiKey}
                style={{ width: '100%', padding: '8px', fontSize: '11px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
              >
                {diagnosticLoading ? 'Analizando en vivo con Gemini...' : 'Probar Respuesta Diagnóstica'}
              </button>

              {/* Diagnostic Sandbox results preview badges */}
              {diagnosticResult && (
                <div style={{ marginTop: '14px', background: '#0a0b0b', border: '1px solid rgba(255,255,255,0.08)', padding: '12px', borderRadius: '2px' }}>
                  {diagnosticResult.error ? (
                    <span style={{ color: '#ef4444', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>{diagnosticResult.error}</span>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>Diseño IA:</span>
                        <strong style={{ color: diagnosticResult.primaryColor || '#ffffff', fontSize: '12px' }}>{diagnosticResult.designName}</strong>
                      </div>
                      
                      {/* Interactive Color Preview Pill */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <div style={{ flex: 1, height: '24px', borderRadius: '2px', background: diagnosticResult.primaryColor, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '8px', color: '#121414', fontWeight: '700' }}>Primario</span>
                        </div>
                        <div style={{ flex: 1, height: '24px', borderRadius: '2px', background: diagnosticResult.secondaryColor, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '8px', color: '#ffffff', fontWeight: '700' }}>Fondo</span>
                        </div>
                        <div style={{ flex: 1, height: '24px', borderRadius: '2px', background: diagnosticResult.accentColor, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '8px', color: '#121414', fontWeight: '700' }}>Destello</span>
                        </div>
                      </div>

                      <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                        "{diagnosticResult.feedbackMsg}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="notification-card">
              <span className="status-dot active"></span>
              {geminiKey ? (
                <span>Estatus: <strong>GEMINI EN VIVO (CONECTADO)</strong></span>
              ) : (
                <span>Estatus: <strong>MOCK SIMULATOR ACTIVO (SIN LLAVE)</strong></span>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

export default App;
