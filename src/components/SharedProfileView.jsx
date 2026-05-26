import React from 'react';
import PlayerCard from './PlayerCard';
import RadarChart from './RadarChart';
import EndorsementSystem from './EndorsementSystem';
import { Award, Trophy, UserCheck, Calendar } from 'lucide-react';

const SharedProfileView = ({
  player,
  activeUser,
  onUpdatePlayer,
  onGoToHome
}) => {
  if (!player) {
    return (
      <div className="glass-panel text-center" style={{ marginTop: '100px' }}>
        <h3>⚠️ Perfil No Encontrado</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
          El enlace de la tarjeta compartida no es válido o el jugador no existe.
        </p>
        <button onClick={onGoToHome} className="btn-primary" style={{ marginTop: '16px' }}>
          Volver a Inicio
        </button>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Premium Header Branding Call-To-Action */}
      <div className="glass-panel text-center" style={{ border: '1px solid rgba(16, 185, 129, 0.3)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(6, 182, 212, 0.08))', padding: '16px 12px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          ⚽ ¡Bienvenido a FutCard Pro!
        </h2>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '12px' }}>
          Estás viendo el perfil profesional y tarjeta digital de <strong style={{ color: '#fff' }}>{player.name}</strong>.
        </p>
        <button
          onClick={onGoToHome}
          className="btn-primary"
          style={{ padding: '8px 14px', fontSize: '12px', width: 'auto', margin: '0 auto' }}
        >
          <UserCheck size={14} />
          Crear mi Tarjeta con IA
        </button>
      </div>

      {/* FIFA Player Card Rendering */}
      <PlayerCard player={player} />

      {/* SVG Radar Chart Analysis */}
      <div className="glass-panel">
        <h3 className="section-title" style={{ borderLeftColor: 'var(--accent-cyan)' }}>
          Análisis de Habilidades
        </h3>
        <RadarChart skills={player.skills} />
      </div>

      {/* Endorse Habilidades System for guest actions */}
      <EndorsementSystem
        player={player}
        activeUser={activeUser}
        onUpdatePlayer={onUpdatePlayer}
      />

      {/* Chronological Team history */}
      <div className="glass-panel">
        <h3 className="section-title" style={{ borderLeftColor: 'var(--accent-gold)' }}>
          Historial de Equipos
        </h3>
        
        <div style={{ marginTop: '12px' }}>
          {player.teams && player.teams.length > 0 ? (
            player.teams.map((t) => (
              <div key={t.id} className="timeline-item">
                <div className="timeline-header">
                  <span className="timeline-team">{t.club}</span>
                  <span className="timeline-date">
                    <Calendar size={11} style={{ marginRight: '3px', verticalAlign: 'text-top' }} />
                    {t.period}
                  </span>
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
              Este jugador no ha cargado su historial de equipos aún.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedProfileView;
