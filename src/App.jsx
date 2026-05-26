import React, { useState, useEffect } from 'react';
import { ShieldCheck, Compass, Star, User, Sliders, Sparkles, RefreshCw, X, Award } from 'lucide-react';
import { getAppData, saveAppData, resetAppData } from './data/mockData';
import PlayerCard from './components/PlayerCard';
import CardGenerator from './components/CardGenerator';
import EndorsementSystem from './components/EndorsementSystem';
import RoleManager from './components/RoleManager';
import LeagueSim from './components/LeagueSim';
import SharedProfileView from './components/SharedProfileView';

function App() {
  const [db, setDb] = useState(getAppData());
  const [activeTab, setActiveTab] = useState('feed'); // feed, studio, my-profile, league-panel
  const [feedSegment, setFeedSegment] = useState('players'); // players, dts, referees explore filter
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [activeUser, setActiveUser] = useState({
    id: 'user-guest',
    name: 'Invitado Fan',
    role: 'guest', // guest, player, dt, referee
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

  // Find currently shared player
  const sharedPlayer = db.players.find(p => p.id === sharedPlayerId);
  const myPlayerProfile = db.players[0]; // We represent player 1 Santiago

  return (
    <div className="app-container">
      
      {/* 1. Global Navigation Header */}
      <header className="app-header">
        <div className="app-logo" style={{ cursor: 'pointer' }} onClick={() => {
          setSharedPlayerId(null);
          window.history.replaceState({}, document.title, window.location.pathname);
          setActiveTab('feed');
        }}>
          ⚽ FutCard <span style={{ fontWeight: '400', fontSize: '13px', marginLeft: '4px', opacity: 0.8 }}>Pro</span>
        </div>

        {/* Identity Simulator trigger badge */}
        <div className="role-switcher-badge" onClick={() => setShowRoleModal(true)}>
          <span style={{ fontSize: '10px' }}>Swap Rol:</span>
          <span style={{ color: activeUser.role === 'guest' ? 'var(--text-secondary)' : activeUser.role === 'player' ? 'var(--primary)' : activeUser.role === 'dt' ? 'var(--accent-gold)' : 'var(--accent-cyan)' }}>
            {activeUser.name.split(' ')[0]} ({activeUser.role.toUpperCase()})
          </span>
        </div>
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
            Liga FMF
          </button>
        </nav>
      )}

      {/* 4. Role Selector Modal Overlay (Simulator Panel) */}
      {showRoleModal && (
        <div className="role-modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="role-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h3 className="role-modal-title">
                <Sliders size={18} color="var(--primary)" />
                Simulador de Roles
              </h3>
              <button
                onClick={() => setShowRoleModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <p className="role-modal-desc">
              Cambia tu identidad activa para probar la lógica de los avales (+1 ordinario, +5 oficial si el DT/Árbitro está validado por la liga).
            </p>

            {/* Guest Fan Card */}
            <div
              className={`role-option-card ${activeUser.role === 'guest' ? 'selected' : ''}`}
              onClick={() => handleSelectRole('guest')}
            >
              <div style={{ fontSize: '24px' }}>👥</div>
              <div className="role-option-info">
                <span className="role-option-name">Invitado (Espectador)</span>
                <span className="role-option-summary">Otorga avales estándar (+1 punto) a las habilidades.</span>
              </div>
            </div>

            {/* Standard Player Card */}
            <div
              className={`role-option-card ${activeUser.role === 'player' ? 'selected' : ''}`}
              onClick={() => handleSelectRole('player')}
            >
              <div style={{ fontSize: '24px' }}>🏃‍♂️</div>
              <div className="role-option-info">
                <span className="role-option-name">Santiago Giménez (Jugador)</span>
                <span className="role-option-summary">Edita sus propias tarjetas, historial de equipos y otorga avales estándar (+1).</span>
              </div>
            </div>

            {/* Technical Director Card */}
            <div
              className={`role-option-card ${activeUser.role === 'dt' ? 'selected' : ''}`}
              onClick={() => handleSelectRole('dt')}
            >
              <div style={{ fontSize: '24px' }}>📋</div>
              <div className="role-option-info">
                <span className="role-option-name">Guillermo Almada (Director Técnico)</span>
                <span className="role-option-summary">
                  {db.dts[0].verifiedLeagues?.includes('liga-1') 
                    ? '🟢 Habilitado por Liga MX: ¡Otorga avales oficiales de +5 puntos!'
                    : '🔴 Licencia inactiva: Otorga avales de +1 punto. Actívalo en la pestaña "Liga FMF".'
                  }
                </span>
              </div>
            </div>

            {/* Referee Card */}
            <div
              className={`role-option-card ${activeUser.role === 'referee' ? 'selected' : ''}`}
              onClick={() => handleSelectRole('referee')}
            >
              <div style={{ fontSize: '24px' }}>🏁</div>
              <div className="role-option-info">
                <span className="role-option-name">César Arturo Ramos (Árbitro)</span>
                <span className="role-option-summary">
                  {db.referees[0].verifiedLeagues?.includes('liga-1')
                    ? '🟢 Habilitado por Liga MX: ¡Otorga avales oficiales de +5 puntos!'
                    : '🔴 Licencia inactiva: Otorga avales de +1 punto. Actívalo en la pestaña "Liga FMF".'
                  }
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default App;
