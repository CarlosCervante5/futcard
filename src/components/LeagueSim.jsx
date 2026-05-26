import React, { useState } from 'react';
import { ShieldCheck, Trophy, Calendar, Users, ChevronDown, ChevronUp, MapPin, Star } from 'lucide-react';

const LeagueSim = ({ leagues }) => {
  const [expandedLeagueId, setExpandedLeagueId] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('standings'); // standings, matches

  // Filter only active leagues (verified === true)
  const activeLeagues = (leagues || []).filter(l => l.verified);

  // Custom metadata to enrich the mock leagues dynamically
  const leagueMetadata = {
    'liga-1': {
      sede: 'Toluca, Estado de México (Cobertura Nacional)',
      categoria: 'Fútbol 11 - Primera Fuerza Profesional',
      equiposCount: 18,
      fundacion: '1943',
      standing: [
        { rank: 1, team: 'América', pj: 17, pg: 10, pe: 5, pp: 2, gf: 30, gc: 14, pts: 35 },
        { rank: 2, team: 'Cruz Azul', pj: 17, pg: 9, pe: 5, pp: 3, gf: 28, gc: 18, pts: 32 },
        { rank: 3, team: 'Pachuca', pj: 17, pg: 8, pe: 4, pp: 5, gf: 26, gc: 20, pts: 28 },
        { rank: 4, team: 'Feyenoord Pro (Santi)', pj: 17, pg: 7, pe: 5, pp: 5, gf: 24, gc: 22, pts: 26 }
      ],
      matches: [
        { date: 'Viernes 29 Mayo', time: '19:00', home: 'Cruz Azul', away: 'América', status: 'Pendiente' },
        { date: 'Sábado 30 Mayo', time: '21:00', home: 'Pachuca', away: 'Feyenoord Pro (Santi)', status: 'Pendiente' }
      ]
    },
    'liga-2': {
      sede: 'Toluca / Metepec, Estado de México',
      categoria: 'Fútbol 11 - Amateur Libre Elite',
      equiposCount: 12,
      fundacion: '2015',
      standing: [
        { rank: 1, team: 'Deportivo Toluca FC', pj: 10, pg: 8, pe: 1, pp: 1, gf: 25, gc: 10, pts: 25 },
        { rank: 2, team: 'Metepec FC', pj: 10, pg: 7, pe: 1, pp: 2, gf: 22, gc: 12, pts: 22 },
        { rank: 3, team: 'Potros UAEM', pj: 10, pg: 6, pe: 2, pp: 2, gf: 19, gc: 11, pts: 20 },
        { rank: 4, team: 'Real Naucalpan', pj: 10, pg: 4, pe: 2, pp: 4, gf: 16, gc: 18, pts: 14 }
      ],
      matches: [
        { date: 'Domingo 31 Mayo', time: '09:00', home: 'Deportivo Toluca FC', away: 'Potros UAEM', status: 'Pendiente' },
        { date: 'Domingo 31 Mayo', time: '11:00', home: 'Metepec FC', away: 'Real Naucalpan', status: 'Pendiente' }
      ]
    }
  };

  const handleToggleExpand = (leagueId) => {
    if (expandedLeagueId === leagueId) {
      setExpandedLeagueId(null);
    } else {
      setExpandedLeagueId(leagueId);
      setActiveSubTab('standings'); // Reset tab on change
    }
  };

  return (
    <div style={{ paddingBottom: '32px' }}>
      <h2 className="section-title">
        <ShieldCheck size={18} fill="currentColor" color="#060913" />
        Ver Ligas en el Estado
      </h2>

      {/* Intro info panel */}
      <div className="glass-panel" style={{ border: '1px solid rgba(195, 244, 0, 0.2)' }}>
        <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--primary)', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Star size={14} fill="currentColor" />
          Scouting & Competencia Oficial
        </h3>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Explora los torneos oficiales avalados que operan activamente en el Estado. Las estadísticas y logros que registres en estas ligas homologan puntos oficiales para certificar tu nivel futbolístico ante visores de la FMF.
        </p>
      </div>

      {/* Leagues Explorer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {activeLeagues.length > 0 ? (
          activeLeagues.map((league) => {
            const meta = leagueMetadata[league.id] || {
              sede: 'Estado de México',
              categoria: 'Torneo Local Amateur',
              equiposCount: 10,
              fundacion: 'N/A',
              standing: [],
              matches: []
            };

            const isExpanded = expandedLeagueId === league.id;

            return (
              <div key={league.id} className="glass-panel" style={{ padding: '16px', border: isExpanded ? '1px solid var(--primary)' : '1px solid var(--border-color)', transition: 'all 0.2s' }}>
                
                {/* League Main Row clickable */}
                <div 
                  onClick={() => handleToggleExpand(league.id)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {league.logo || '⚽'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '4px', letterSpacing: '0.5px' }}>
                        {league.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '9px',
                          background: 'rgba(195,244,0,0.1)',
                          color: 'var(--primary)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: '700',
                          letterSpacing: '0.5px'
                        }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', boxShadow: '0 0 6px var(--primary)' }} />
                          ACTIVA
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <MapPin size={10} />
                          Edomex
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {isExpanded ? <ChevronUp size={18} color="var(--text-secondary)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    
                    {/* Meta info tags */}
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px' }}>
                      <div>📍 <strong>Ubicación:</strong> {meta.sede}</div>
                      <div>🏆 <strong>Categoría:</strong> {meta.categoria}</div>
                      <div>⚽ <strong>Clubes Registrados:</strong> {meta.equiposCount} Equipos Activos</div>
                      {meta.fundacion !== 'N/A' && <div>🗓️ <strong>Año de Fundación:</strong> {meta.fundacion}</div>}
                    </div>

                    {/* Standings / Matches selector tab */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <button
                        onClick={() => setActiveSubTab('standings')}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          fontSize: '11px',
                          borderRadius: '4px',
                          border: 'none',
                          background: activeSubTab === 'standings' ? 'var(--primary)' : 'transparent',
                          color: activeSubTab === 'standings' ? '#121414' : 'var(--text-secondary)',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <Trophy size={12} />
                        Tabla General
                      </button>
                      <button
                        onClick={() => setActiveSubTab('matches')}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          fontSize: '11px',
                          borderRadius: '4px',
                          border: 'none',
                          background: activeSubTab === 'matches' ? 'var(--primary)' : 'transparent',
                          color: activeSubTab === 'matches' ? '#121414' : 'var(--text-secondary)',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <Calendar size={12} />
                        Calendario
                      </button>
                    </div>

                    {/* Sub-tab content 1: General Standings Table */}
                    {activeSubTab === 'standings' && (
                      <div>
                        {meta.standing && meta.standing.length > 0 ? (
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left', color: 'var(--text-secondary)' }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', fontSize: '10px' }}>
                                  <th style={{ padding: '6px 4px' }}>Pos</th>
                                  <th style={{ padding: '6px 4px' }}>Club</th>
                                  <th style={{ padding: '6px 4px', textAlign: 'center' }}>PJ</th>
                                  <th style={{ padding: '6px 4px', textAlign: 'center' }}>GF</th>
                                  <th style={{ padding: '6px 4px', textAlign: 'center' }}>GC</th>
                                  <th style={{ padding: '6px 4px', textAlign: 'right', fontWeight: '700', color: 'var(--primary)' }}>Pts</th>
                                </tr>
                              </thead>
                              <tbody>
                                {meta.standing.map((row) => (
                                  <tr 
                                    key={row.rank} 
                                    style={{ 
                                      borderBottom: '1px solid rgba(255,255,255,0.04)', 
                                      background: row.team.includes('(Santi)') ? 'rgba(195,244,0,0.04)' : 'transparent' 
                                    }}
                                  >
                                    <td style={{ padding: '8px 4px', color: row.rank <= 3 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '700' }}>
                                      {row.rank}
                                    </td>
                                    <td style={{ padding: '8px 4px', color: row.team.includes('(Santi)') ? 'var(--primary)' : '#fff', fontWeight: row.team.includes('(Santi)') ? '700' : 'normal' }}>
                                      {row.team}
                                    </td>
                                    <td style={{ padding: '8px 4px', textAlign: 'center' }}>{row.pj}</td>
                                    <td style={{ padding: '8px 4px', textAlign: 'center' }}>{row.gf}</td>
                                    <td style={{ padding: '8px 4px', textAlign: 'center' }}>{row.gc}</td>
                                    <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: '700', color: row.team.includes('(Santi)') ? 'var(--primary)' : '#fff' }}>
                                      {row.pts}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
                            Tabla en proceso de inicialización.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Sub-tab content 2: Matches & Calendars */}
                    {activeSubTab === 'matches' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {meta.matches && meta.matches.length > 0 ? (
                          meta.matches.map((match, idx) => (
                            <div key={idx} style={{ background: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
                                <span>📅 {match.date}</span>
                                <span>🕒 {match.time} hrs</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                                <span style={{ color: match.home.includes('(Santi)') ? 'var(--primary)' : '#fff', fontWeight: match.home.includes('(Santi)') ? '700' : 'normal', flex: 1, textAlign: 'left' }}>
                                  {match.home}
                                </span>
                                <span style={{ fontSize: '9px', color: 'var(--text-muted)', padding: '0 8px', fontWeight: '700' }}>VS</span>
                                <span style={{ color: match.away.includes('(Santi)') ? 'var(--primary)' : '#fff', fontWeight: match.away.includes('(Santi)') ? '700' : 'normal', flex: 1, textAlign: 'right' }}>
                                  {match.away}
                                </span>
                              </div>
                              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                                <span style={{ fontSize: '8px', background: 'rgba(251,191,36,0.1)', color: 'var(--accent-gold)', padding: '1px 6px', borderRadius: '3px', fontWeight: '700', letterSpacing: '0.5px' }}>
                                  {match.status.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
                            Próximos partidos no agendados aún.
                          </p>
                        )}
                      </div>
                    )}

                  </div>
                )}

              </div>
            );
          })
        ) : (
          <div className="glass-panel text-center" style={{ padding: '24px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              No existen ligas activas registradas en el Estado actualmente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeagueSim;
