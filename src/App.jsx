import React, { useState, useEffect } from 'react';
import { ShieldCheck, Compass, Star, User, Sliders, Sparkles, RefreshCw, X, Award, Eye, EyeOff } from 'lucide-react';
import { getAppData, saveAppData, resetAppData } from './data/mockData';
import PlayerCard from './components/PlayerCard';
import CardGenerator from './components/CardGenerator';
import EndorsementSystem from './components/EndorsementSystem';
import RoleManager from './components/RoleManager';
import LeagueSim from './components/LeagueSim';
import SharedProfileView from './components/SharedProfileView';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://protective-education-production.up.railway.app';

function App() {
  const [authToken, setAuthToken] = useState(() => sessionStorage.getItem('futcard_jwt') || '');
  const [db, setDb] = useState(getAppData());
  const [activeTab, setActiveTab] = useState('feed'); // feed, studio, my-profile, league-panel
  const [feedSegment, setFeedSegment] = useState('players'); // players, dts, referees explore filter

  // Auth state variables
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginShake, setLoginShake] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerNickname, setRegisterNickname] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [registerRole, setRegisterRole] = useState('Jugador');
  const [registerError, setRegisterError] = useState('');

  const [activeUser, setActiveUser] = useState(() => {
    const saved = sessionStorage.getItem('futcard_active_admin');
    return saved ? JSON.parse(saved) : {
      id: 'p-1',
      name: 'Santiago Giménez',
      role: 'player', // Default logged-in player Santiago
    };
  });
  const [sharedPlayerId, setSharedPlayerId] = useState(null);

  // Initialize and check for WhatsApp share params in URL query
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedId = params.get('sharedPlayerId');
    if (sharedId) {
      setSharedPlayerId(sharedId);
    }
  }, []);

  // Fetch data from backend when auth token is available
  useEffect(() => {
    if (!authToken) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/federation`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDb(data);
        }
      } catch (e) {
        console.error('Failed to fetch federation data', e);
      }
    };
    fetchData();
  }, [authToken]);

  const handleUpdatePlayer = (updatedPlayer) => {
    const nextPlayers = db.players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p);
    const nextDb = { ...db, players: nextPlayers };
    setDb(nextDb);
    saveAppData(nextDb);
  };

  const handleUpdateDT = (updatedDts) => {
    const nextDb = { ...db, dts: updatedDts };
    setDb(nextDb);
    saveAppData(nextDb);

    // Sync active simulation user if they are a DT
    if (activeUser.role === 'dt') {
      const match = updatedDts.find(d => d.id === activeUser.id);
      if (match) setActiveUser({ ...activeUser, verifiedLeagues: match.verifiedLeagues });
    }
  };

  const handleUpdateReferee = (updatedReferees) => {
    const nextDb = { ...db, referees: updatedReferees };
    setDb(nextDb);
    saveAppData(nextDb);

    // Sync active simulation user if they are a Referee
    if (activeUser.role === 'referee') {
      const match = updatedReferees.find(r => r.id === activeUser.id);
      if (match) setActiveUser({ ...activeUser, verifiedLeagues: match.verifiedLeagues });
    }
  };


  // Switch simulation identities
  const handleSelectRole = (roleType, entityId = '') => {
    if (roleType === 'guest') {
      setActiveUser({ id: 'user-guest', name: 'Invitado Fan', role: 'guest' });
    } else if (roleType === 'player') {
      const p = db.players[0]; // Santiago Gimenez
      setActiveUser({ id: p.id, name: p.name, role: 'player' });
    } else if (roleType === 'dt') {
      const dt = db.dts[0]; // Profe Almada
      setActiveUser({
        id: dt.id,
        name: dt.name,
        role: 'dt',
        verifiedLeagues: dt.verifiedLeagues
      });
    } else if (roleType === 'referee') {
      const ref = db.referees[0]; // Cesar Arturo Ramos
      setActiveUser({
        id: ref.id,
        name: ref.name,
        role: 'referee',
        verifiedLeagues: ref.verifiedLeagues
      });
    }
    setShowRoleModal(false);
  };

  const handleResetAllData = () => {
    const cleanDb = resetAppData();
    setDb(cleanDb);
    // Refresh page state smoothly
    setSharedPlayerId(null);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  // Auth: Handle Sign In via Express JWT login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await response.json();
      if (response.ok) {
        sessionStorage.setItem('futcard_active_admin', JSON.stringify(data.user));
        sessionStorage.setItem('futcard_jwt', data.token);
        setAuthToken(data.token);
        setActiveUser(data.user);
        setLoginEmail('');
        setLoginPassword('');
        setLoginError('');
      } else {
        throw new Error(data.error || 'Credenciales incorrectas.');
      }
    } catch (err) {
      setLoginShake(true);
      setLoginError(err.message || 'Error al conectar con el servidor.');
      setTimeout(() => setLoginShake(false), 500);
    }
  };

  // Auth: Simple Register
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
      setRegisterError('Completa todos los campos obligatorios.');
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('Las contraseñas no coinciden.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: registerName, email: registerEmail, password: registerPassword, role: registerRole, nickname: registerNickname })
      });
      const result = await res.json();
      if (res.ok) {
        // Auto login after successful registration
        const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: registerEmail, password: registerPassword })
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          sessionStorage.setItem('futcard_active_admin', JSON.stringify(loginData.user));
          sessionStorage.setItem('futcard_jwt', loginData.token);
          setAuthToken(loginData.token);
          setActiveUser(loginData.user);
          setRegisterName('');
          setRegisterEmail('');
          setRegisterNickname('');
          setRegisterPassword('');
          setRegisterConfirmPassword('');
          setRegisterError('');
          setShowRegister(false);
        }
      } else {
        throw new Error(result.error || 'Registro falló.');
      }
    } catch (err) {
      setRegisterError(err.message);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('futcard_jwt');
    sessionStorage.removeItem('futcard_active_admin');
    setAuthToken('');
    setActiveUser({
      id: 'p-1',
      name: 'Santiago Giménez',
      role: 'player',
    });
  };

  // Find currently shared player
  const sharedPlayer = db.players.find(p => p.id === sharedPlayerId);
  const myPlayerProfile = db.players[0]; // We represent player 1 Santiago

  // If not authenticated and not viewing a shared profile, show login/register UI
  if (!sharedPlayerId && !authToken) {
    return (
      <div className="login-overlay" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px', background: '#0c0f0f' }}>
        <div style={{ marginBottom: '24px', fontSize: '28px', fontWeight: 'bold', letterSpacing: '1px', color: '#fff', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚽ FutCard <span style={{ color: 'var(--primary)', fontWeight: '400', fontSize: '22px' }}>Pro</span>
        </div>
        {showRegister ? (
          <div className={`login-card ${loginShake ? 'shake-effect' : ''}`} style={{ width: '100%', maxWidth: '360px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', borderRadius: '8px' }}>
            <h2 style={{ color: '#fff', marginBottom: '16px', fontSize: '24px', fontFamily: 'var(--font-heading)' }}>Registro</h2>
            {registerError && <span className="error" style={{ color: '#ef4444', fontSize: '12px', display: 'block', marginBottom: '12px' }}>{registerError}</span>}
            <input placeholder="Nombre" value={registerName} onChange={e => setRegisterName(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px' }} />
            <input placeholder="Email" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px' }} />
            <input placeholder="Apodo (Opcional)" value={registerNickname} onChange={e => setRegisterNickname(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px' }} />
            
            <div style={{ position: 'relative', width: '100%', marginBottom: '12px' }}>
              <input
                type={showRegisterPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={registerPassword}
                onChange={e => setRegisterPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 40px 10px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px' }}
              />
              <button
                type="button"
                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
              >
                {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div style={{ position: 'relative', width: '100%', marginBottom: '12px' }}>
              <input
                type={showRegisterConfirmPassword ? 'text' : 'password'}
                placeholder="Confirmar Contraseña"
                value={registerConfirmPassword}
                onChange={e => setRegisterConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 40px 10px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px' }}
              />
              <button
                type="button"
                onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
              >
                {showRegisterConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <select value={registerRole} onChange={e => setRegisterRole(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '16px', background: '#121414', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px' }}>
              <option>Jugador</option>
              <option>DT</option>
              <option>Árbitro</option>
            </select>
            <button onClick={handleRegister} className="btn-primary" style={{ width: '100%', padding: '12px', marginBottom: '10px' }}>Crear Cuenta</button>
            <button onClick={() => setShowRegister(false)} className="btn-secondary" style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>Volver a Login</button>
          </div>
        ) : (
          <div className={`login-card ${loginShake ? 'shake-effect' : ''}`} style={{ width: '100%', maxWidth: '360px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', borderRadius: '8px' }}>
            <h2 style={{ color: '#fff', marginBottom: '16px', fontSize: '24px', fontFamily: 'var(--font-heading)' }}>Iniciar Sesión</h2>
            {loginError && <span className="error" style={{ color: '#ef4444', fontSize: '12px', display: 'block', marginBottom: '12px' }}>{loginError}</span>}
            <input placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px' }} />
            
            <div style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
              <input
                type={showLoginPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 40px 10px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px' }}
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
              >
                {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button onClick={handleLogin} className="btn-primary" style={{ width: '100%', padding: '12px', marginBottom: '10px' }}>Entrar</button>
            <button onClick={() => setShowRegister(true)} className="btn-secondary" style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>Crear Cuenta</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      
      {/* 1. Global Navigation Header */}
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="app-logo" style={{ cursor: 'pointer' }} onClick={() => {
          setSharedPlayerId(null);
          window.history.replaceState({}, document.title, window.location.pathname);
          setActiveTab('feed');
        }}>
          ⚽ FutCard <span style={{ fontWeight: '400', fontSize: '13px', marginLeft: '4px', opacity: 0.8 }}>Pro</span>
        </div>
        {authToken && (
          <button onClick={handleLogout} className="btn-logout" style={{ background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.3)', color: '#ff6b6b', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
            Cerrar Sesión
          </button>
        )}
      </header>

      {/* 2. Main Content View Body */}
      <main className="scroll-content">
        
        {/* Render Public shared WhatsApp landing view directly if shared id exists */}
        {sharedPlayerId ? (
          <SharedProfileView
            player={sharedPlayer}
            activeUser={activeUser}
            onUpdatePlayer={handleUpdatePlayer}
            onGoToHome={() => {
              setSharedPlayerId(null);
              window.history.replaceState({}, document.title, window.location.pathname);
              setActiveTab('feed');
            }}
          />
        ) : (
          <>
            {/* View TAB: Explore/Feed list of other users */}
            {activeTab === 'feed' && (
              <div>
                <h2 className="section-title">Explorar Comunidad</h2>
                
                {/* Segment Selector for Separated concerns (Jugadores, DT, Arbitros) */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '18px', background: 'rgba(255,255,255,0.02)', padding: '4px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                  <button
                    onClick={() => setFeedSegment('players')}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '8px 4px', fontSize: '11px', background: feedSegment === 'players' ? 'var(--primary)' : 'transparent', color: feedSegment === 'players' ? '#121414' : 'var(--text-primary)', border: 'none', borderStyle: 'none', fontFamily: 'var(--font-heading)', fontStyle: 'italic', textTransform: 'uppercase' }}
                  >
                    Jugadores
                  </button>
                  <button
                    onClick={() => setFeedSegment('dts')}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '8px 4px', fontSize: '11px', background: feedSegment === 'dts' ? 'var(--primary)' : 'transparent', color: feedSegment === 'dts' ? '#121414' : 'var(--text-primary)', border: 'none', borderStyle: 'none', fontFamily: 'var(--font-heading)', fontStyle: 'italic', textTransform: 'uppercase' }}
                  >
                    DT / Coaches
                  </button>
                  <button
                    onClick={() => setFeedSegment('referees')}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '8px 4px', fontSize: '11px', background: feedSegment === 'referees' ? 'var(--primary)' : 'transparent', color: feedSegment === 'referees' ? '#121414' : 'var(--text-primary)', border: 'none', borderStyle: 'none', fontFamily: 'var(--font-heading)', fontStyle: 'italic', textTransform: 'uppercase' }}
                  >
                    Árbitros
                  </button>
                </div>

                {/* Sub-tab 1: Players Directory */}
                {feedSegment === 'players' && (
                  <div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      Conoce y avala el perfil de otros jugadores destacados de la Liga FMF.
                    </p>

                    {db.players.map((p) => (
                      <div key={p.id} className="glass-panel" style={{ paddingBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: '400', fontFamily: 'var(--font-heading)' }}>{p.name}</h3>
                          <span className="badge badge-gold" style={{ fontSize: '9px' }}>{p.position}</span>
                        </div>

                        <PlayerCard player={p} scale={0.9} />

                        <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                          <EndorsementSystem
                            player={p}
                            activeUser={activeUser}
                            onUpdatePlayer={handleUpdatePlayer}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sub-tab 2: Technical Directors Directory */}
                {feedSegment === 'dts' && (
                  <div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      Explora la trayectoria y estilos de juego de los entrenadores profesionales habilitados.
                    </p>

                    {db.dts.map((dt) => {
                      const isVerified = dt.verifiedLeagues?.includes('liga-1');
                      return (
                        <div key={dt.id} className="glass-panel">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                            <div>
                              <h3 style={{ fontSize: '18px', fontWeight: '400', fontFamily: 'var(--font-heading)', color: '#ffffff' }}>
                                {dt.name}
                              </h3>
                              <span className="badge badge-emerald" style={{ marginTop: '4px' }}>Director Técnico</span>
                            </div>
                            {isVerified && (
                              <span className="bg-secondary-container text-on-secondary px-2 py-1 font-mono text-[9px] rounded flex items-center gap-1">
                                🎖️ VALIDADO
                              </span>
                            )}
                          </div>

                          <div className="referee-stat-box" style={{ marginBottom: '14px' }}>
                            <div className="ref-sub-box">
                              <span className="ref-num" style={{ fontSize: '14px', color: 'var(--primary)' }}>{dt.tacticalStyle}</span>
                              <div className="ref-label">Filosofía Táctica</div>
                            </div>
                            <div className="ref-sub-box">
                              <span className="ref-num" style={{ fontSize: '18px' }}>{dt.formation}</span>
                              <div className="ref-label">Esquema Fijo</div>
                            </div>
                          </div>

                          {/* Simulated Tactical Pitch */}
                          <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                            Esquema de Juego
                          </h4>
                          <div className="tactic-board" style={{ height: '140px' }}>
                            <div className="pitch-line-mid" />
                            <div className="pitch-line-circle" />
                            <div className="tactic-player-node" style={{ top: '80%', left: '46%' }}>1</div>
                            <div className="tactic-player-node" style={{ top: '65%', left: '20%' }}>3</div>
                            <div className="tactic-player-node" style={{ top: '68%', left: '38%' }}>4</div>
                            <div className="tactic-player-node" style={{ top: '68%', left: '56%' }}>5</div>
                            <div className="tactic-player-node" style={{ top: '65%', left: '74%' }}>2</div>
                            <div className="tactic-player-node" style={{ top: '48%', left: '46%' }}>6</div>
                            <div className="tactic-player-node" style={{ top: '30%', left: '20%' }}>11</div>
                            <div className="tactic-player-node" style={{ top: '28%', left: '46%' }}>10</div>
                            <div className="tactic-player-node" style={{ top: '30%', left: '74%' }}>7</div>
                            <div className="tactic-player-node" style={{ top: '10%', left: '46%' }}>9</div>
                          </div>

                          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                            <strong>Licencias:</strong> {dt.certifications}
                            <br />
                            <strong style={{ display: 'block', marginTop: '6px' }}>Trayectoria:</strong> {dt.experience}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Sub-tab 3: Referees Directory */}
                {feedSegment === 'referees' && (
                  <div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      Consulta la ficha de colegiación y el historial físico de nuestro cuerpo arbitral.
                    </p>

                    {db.referees.map((ref) => {
                      const isVerified = ref.verifiedLeagues?.includes('liga-1');
                      return (
                        <div key={ref.id} className="glass-panel">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                            <div>
                              <h3 style={{ fontSize: '18px', fontWeight: '400', fontFamily: 'var(--font-heading)', color: '#ffffff' }}>
                                {ref.name}
                              </h3>
                              <span className="badge badge-cyan" style={{ marginTop: '4px' }}>{ref.category}</span>
                            </div>
                            {isVerified && (
                              <span className="bg-secondary-container text-on-secondary px-2 py-1 font-mono text-[9px] rounded flex items-center gap-1">
                                🎖️ VALIDADO
                              </span>
                            )}
                          </div>

                          <div className="referee-stat-box" style={{ marginBottom: '12px' }}>
                            <div className="ref-sub-box">
                              <span className="ref-num" style={{ fontSize: '18px' }}>{ref.matches.split(' ')[0]}</span>
                              <div className="ref-label">Partidos Oficiales</div>
                            </div>
                            <div className="ref-sub-box">
                              <span className="ref-num" style={{ color: 'var(--primary)', fontSize: '14px' }}>{ref.physicalLevel.split(' ')[0]}</span>
                              <div className="ref-label">Rendimiento Físico</div>
                            </div>
                          </div>

                          <div className="referee-stat-box">
                            <div className="ref-sub-box" style={{ borderLeft: '2px solid #eab308' }}>
                              <span className="ref-num yellow" style={{ fontSize: '20px' }}>{ref.yellowCards.split(' ')[0]}</span>
                              <div className="ref-label">Amarillas / Juego</div>
                            </div>
                            <div className="ref-sub-box" style={{ borderLeft: '2px solid #ef4444' }}>
                              <span className="ref-num red" style={{ fontSize: '20px' }}>{ref.redCards.split(' ')[0]}</span>
                              <div className="ref-label">Rojas / Juego</div>
                            </div>
                          </div>

                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '12px' }}>
                            Acreditaciones de aptitud: <strong>{ref.physicalLevel}</strong>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

            {/* View TAB: Mi Tarjeta (Merged Generator & Profile) */}
            {activeTab === 'studio' && (
              <RoleManager
                player={myPlayerProfile}
                dt={db.dts[0]}
                referee={db.referees[0]}
                activeUser={activeUser}
                onUpdatePlayer={handleUpdatePlayer}
                onSwitchUserRole={handleSelectRole}
              />
            )}

            {/* View TAB: League Administration simulators */}
            {activeTab === 'league-panel' && (
              <LeagueSim
                dts={db.dts}
                referees={db.referees}
                leagues={db.leagues}
                onUpdateDT={handleUpdateDT}
                onUpdateReferee={handleUpdateReferee}
              />
            )}
          </>
        )}

        {/* Global Developer Reset Control */}
        {!sharedPlayerId && (
          <div style={{ marginTop: '36px', borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '20px', paddingBottom: '16px' }} className="text-center">
            <button
              onClick={handleResetAllData}
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '6px 12px', width: 'auto', margin: '0 auto', color: 'var(--text-muted)' }}
            >
              <RefreshCw size={11} style={{ marginRight: '4px' }} />
              Reiniciar Base de Datos Local
            </button>
          </div>
        )}
      </main>

      {/* 3. Navigation Tab Bar Footer */}
      {!sharedPlayerId && (
        <nav className="tab-bar">
          <button
            onClick={() => setActiveTab('feed')}
            className={`tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
            id="tab-explore"
          >
            <Compass />
            Explorar
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`tab-btn ${activeTab === 'studio' ? 'active' : ''}`}
            id="tab-generator"
          >
            <User />
            Mi Tarjeta
          </button>
          <button
            onClick={() => setActiveTab('league-panel')}
            className={`tab-btn ${activeTab === 'league-panel' ? 'active' : ''}`}
            id="tab-league"
          >
            <ShieldCheck />
            Ver Ligas
          </button>
        </nav>
      )}



    </div>
  );
}

export default App;
