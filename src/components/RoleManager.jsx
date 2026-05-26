import React, { useState } from 'react';
import { ShieldCheck, Calendar, Trophy, MessageSquare, Plus, Trash2, Award, ClipboardCheck } from 'lucide-react';
import RadarChart from './RadarChart';
import PlayerCard from './PlayerCard';
import CardGenerator from './CardGenerator';

const RoleManager = ({
  player,
  dt,
  referee,
  activeUser,
  onUpdatePlayer,
  onSwitchUserRole
}) => {
  const [newTeam, setNewTeam] = useState({ club: '', period: '', stats: '', achievements: '' });
  const [showAddTeamForm, setShowAddTeamForm] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sharing profiles via WhatsApp helper
  const handleWhatsAppShare = () => {
    // Generate shared link utilizing query parameter
    const shareUrl = `${window.location.origin}${window.location.pathname}?sharedPlayerId=${player.id}`;
    
    // Build prefilled WhatsApp message in Spanish
    const textMsg = encodeURIComponent(
      `⚽ ¡Hola! Te comparto mi perfil y tarjeta oficial en FutCard Pro. Mira mis habilidades, historial y avala mi nivel aquí: ${shareUrl} 🔥`
    );

    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
      
      // Open WhatsApp web or app
      window.open(`https://api.whatsapp.com/send?text=${textMsg}`, '_blank');
    });
  };

  const handleAddTeam = (e) => {
    e.preventDefault();
    if (!newTeam.club || !newTeam.period) return;

    const teamEntry = {
      id: `team-${Date.now()}`,
      ...newTeam
    };

    onUpdatePlayer({
      ...player,
      teams: [teamEntry, ...(player.teams || [])]
    });

    setNewTeam({ club: '', period: '', stats: '', achievements: '' });
    setShowAddTeamForm(false);
  };

  const handleDeleteTeam = (teamId) => {
    const filteredTeams = player.teams.filter(t => t.id !== teamId);
    onUpdatePlayer({
      ...player,
      teams: filteredTeams
    });
  };

  return (
    <div>
      {/* 1. PLAYER DISPLAY LAYOUT */}
      {activeUser.role === 'player' && (
        <div>
          <h2 className="section-title">Mi Tarjeta Digital</h2>
          
          <PlayerCard player={player} />

          {/* Embedded Card Customizer & Designer (formerly 'Mi Card') */}
          <CardGenerator
            player={player}
            onUpdatePlayer={onUpdatePlayer}
            embedded={true}
          />

          {/* WhatsApp share panel */}
          <div className="glass-panel text-center" style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '15px', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>Compartir Ficha Profesional</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Copia el enlace de tu perfil y compártelo por WhatsApp. Tus amigos, directores técnicos o ligas locales podrán avalar tus habilidades desde cualquier dispositivo.
            </p>
            <button
              onClick={handleWhatsAppShare}
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', boxShadow: '0 4px 15px rgba(37,211,102,0.2)' }}
            >
              {copiedLink ? (
                <>
                  <ClipboardCheck size={16} />
                  ¡Enlace Copiado!
                </>
              ) : (
                <>
                  <MessageSquare size={16} />
                  Compartir en WhatsApp
                </>
              )}
            </button>
          </div>

          {/* SVG Radar Chart Analysis */}
          <div className="glass-panel">
            <h3 className="section-title" style={{ borderLeftColor: 'var(--accent-cyan)' }}>
              Análisis de Habilidades
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Gráfico de araña interactivo que representa tus estadísticas reales acumuladas en tiempo real.
            </p>
            <RadarChart skills={player.skills} />
          </div>

          {/* Team Chronology History list */}
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 className="section-title" style={{ borderLeftColor: 'var(--accent-gold)', marginBottom: 0 }}>
                Historial de Equipos
              </h3>
              <button
                onClick={() => setShowAddTeamForm(!showAddTeamForm)}
                className="btn-secondary"
                style={{ padding: '4px 8px', fontSize: '11px', width: 'auto' }}
              >
                <Plus size={12} />
                Agregar
              </button>
            </div>

            {showAddTeamForm && (
              <form onSubmit={handleAddTeam} className="glass-panel" style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '10px' }}>Club / Escuela</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newTeam.club}
                    onChange={(e) => setNewTeam({ ...newTeam, club: e.target.value })}
                    placeholder="Ej. Cruz Azul Coapa"
                    required
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '10px' }}>Periodo (Años)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newTeam.period}
                    onChange={(e) => setNewTeam({ ...newTeam, period: e.target.value })}
                    placeholder="Ej. 2021 - 2023"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label style={{ fontSize: '10px' }}>Goles / Asistencias</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newTeam.stats}
                      onChange={(e) => setNewTeam({ ...newTeam, stats: e.target.value })}
                      placeholder="Ej. 25 Goles, 8 Asist."
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '10px' }}>Logros / Copas</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newTeam.achievements}
                      onChange={(e) => setNewTeam({ ...newTeam, achievements: e.target.value })}
                      placeholder="Ej. Campeón Clausura"
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '8px' }}>
                  Guardar Registro
                </button>
              </form>
            )}

            <div style={{ marginTop: '8px' }}>
              {player.teams && player.teams.length > 0 ? (
                player.teams.map((t) => (
                  <div key={t.id} className="timeline-item">
                    <div className="timeline-header">
                      <span className="timeline-team">{t.club}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="timeline-date">
                          <Calendar size={11} style={{ marginRight: '3px', verticalAlign: 'text-top' }} />
                          {t.period}
                        </span>
                        <button
                          onClick={() => handleDeleteTeam(t.id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    {t.stats && <div className="timeline-desc">📊 {t.stats}</div>}
                    {t.achievements && (
                      <div className="timeline-desc" style={{ color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Trophy size={11} />
                        {t.achievements}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Sin historial cargado. Haz clic en "Agregar" para registrar tus antiguos clubes.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. COACH / DT DISPLAY LAYOUT */}
      {activeUser.role === 'dt' && (
        <div>
          <h2 className="section-title">Ficha Técnica DT</h2>
          
          <div className="glass-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContents: 'center', fontSize: '32px', border: '1px solid var(--border-color)', justifyContent: 'center' }}>
                📋
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{dt.name}</h3>
                <span className="badge badge-emerald">Director Técnico Profesional</span>
                {dt.verifiedLeagues && dt.verifiedLeagues.length > 0 && (
                  <div className="verified-indicator" style={{ marginTop: '4px', fontSize: '11px' }}>
                    <ShieldCheck size={14} fill="currentColor" color="#060913" />
                    Avalado por Liga FMF
                  </div>
                )}
              </div>
            </div>

            {/* Strategic tactical style and formations */}
            <div className="form-row" style={{ marginBottom: '14px' }}>
              <div className="ref-sub-box">
                <span className="ref-num" style={{ fontSize: '16px', color: 'var(--accent-gold)' }}>
                  {dt.tacticalStyle}
                </span>
                <div className="ref-label">Filosofía Táctica</div>
              </div>
              <div className="ref-sub-box">
                <span className="ref-num" style={{ fontSize: '20px' }}>
                  {dt.formation}
                </span>
                <div className="ref-label">Esquema Predilecto</div>
              </div>
            </div>

            {/* Simulated Tactic Board Pitch Visualizer */}
            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Pizarra Táctica Activa
            </h4>
            <div className="tactic-board">
              <div className="pitch-line-mid" />
              <div className="pitch-line-circle" />
              {/* Nodes layout simulating a 4-2-3-1 */}
              <div className="tactic-player-node" style={{ top: '80%', left: '46%' }}>1</div>
              <div className="tactic-player-node" style={{ top: '60%', left: '20%' }}>3</div>
              <div className="tactic-player-node" style={{ top: '65%', left: '38%' }}>4</div>
              <div className="tactic-player-node" style={{ top: '65%', left: '56%' }}>5</div>
              <div className="tactic-player-node" style={{ top: '60%', left: '74%' }}>2</div>
              <div className="tactic-player-node" style={{ top: '45%', left: '30%' }}>6</div>
              <div className="tactic-player-node" style={{ top: '45%', left: '60%' }}>8</div>
              <div className="tactic-player-node" style={{ top: '25%', left: '15%' }}>11</div>
              <div className="tactic-player-node" style={{ top: '22%', left: '46%' }}>10</div>
              <div className="tactic-player-node" style={{ top: '25%', left: '77%' }}>7</div>
              <div className="tactic-player-node" style={{ top: '8%', left: '46%' }}>9</div>
            </div>
          </div>

          <div className="glass-panel">
            <h3 className="section-title" style={{ borderLeftColor: 'var(--accent-cyan)' }}>
              Certificaciones & Licencias
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {dt.certifications.split(',').map((cert, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <Award size={16} color="var(--accent-gold)" />
                  <span>{cert.trim()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel">
            <h3 className="section-title" style={{ borderLeftColor: 'var(--accent-gold)' }}>
              Trayectoria Directiva
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {dt.experience}
            </p>
          </div>
        </div>
      )}

      {/* 3. REFEREE DISPLAY LAYOUT */}
      {activeUser.role === 'referee' && (
        <div>
          <h2 className="section-title">Registro Arbitral</h2>

          <div className="glass-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContents: 'center', fontSize: '32px', border: '1px solid var(--border-color)', justifyContent: 'center' }}>
                🏁
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{referee.name}</h3>
                <span className="badge badge-cyan">{referee.category}</span>
                {referee.verifiedLeagues && referee.verifiedLeagues.length > 0 && (
                  <div className="verified-indicator" style={{ marginTop: '4px', fontSize: '11px' }}>
                    <ShieldCheck size={14} fill="currentColor" color="#060913" />
                    Colegiatura Verificada
                  </div>
                )}
              </div>
            </div>

            {/* Referee stats counts */}
            <div className="referee-stat-box" style={{ marginBottom: '14px' }}>
              <div className="ref-sub-box">
                <span className="ref-num">{referee.matches.split(' ')[0]}</span>
                <div className="ref-label">Partidos Dirigidos</div>
              </div>
              <div className="ref-sub-box">
                <span className="ref-num" style={{ color: 'var(--primary)' }}>{referee.physicalLevel.split(' ')[0]}</span>
                <div className="ref-label">Rendimiento Físico</div>
              </div>
            </div>

            {/* Card stats */}
            <div className="referee-stat-box">
              <div className="ref-sub-box" style={{ borderLeft: '3px solid #eab308' }}>
                <span className="ref-num yellow">{referee.yellowCards.split(' ')[0]}</span>
                <div className="ref-label">Tarjetas Amarillas / Juego</div>
              </div>
              <div className="ref-sub-box" style={{ borderLeft: '3px solid #ef4444' }}>
                <span className="ref-num red">{referee.redCards.split(' ')[0]}</span>
                <div className="ref-label">Tarjetas Rojas / Juego</div>
              </div>
            </div>
          </div>

          <div className="glass-panel">
            <h3 className="section-title" style={{ borderLeftColor: 'var(--accent-gold)' }}>
              Acreditación y Áreas Verificadas
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Nivel de certificación: <strong>{referee.physicalLevel}</strong>
              <br /><br />
              Este árbitro cuenta con habilitación oficial para fiscalizar torneos del sector profesional y amateurs de alto rendimiento.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManager;
