import React from 'react';
import { ShieldCheck, Award, Users } from 'lucide-react';

const LeagueSim = ({
  dts,
  referees,
  leagues,
  onUpdateDT,
  onUpdateReferee,
  onUpdateLeagues
}) => {

  const handleToggleDTVerification = (dtId) => {
    const updatedDts = dts.map(dt => {
      if (dt.id === dtId) {
        // Toggle presence of "liga-1" in verifiedLeagues
        const currentVerified = dt.verifiedLeagues || [];
        const hasVerification = currentVerified.includes('liga-1');
        const nextVerified = hasVerification
          ? currentVerified.filter(id => id !== 'liga-1')
          : [...currentVerified, 'liga-1'];
        return { ...dt, verifiedLeagues: nextVerified };
      }
      return dt;
    });
    onUpdateDT(updatedDts);
  };

  const handleToggleRefereeVerification = (refId) => {
    const updatedReferees = referees.map(ref => {
      if (ref.id === refId) {
        const currentVerified = ref.verifiedLeagues || [];
        const hasVerification = currentVerified.includes('liga-1');
        const nextVerified = hasVerification
          ? currentVerified.filter(id => id !== 'liga-1')
          : [...currentVerified, 'liga-1'];
        return { ...ref, verifiedLeagues: nextVerified };
      }
      return ref;
    });
    onUpdateReferee(updatedReferees);
  };

  return (
    <div style={{ paddingBottom: '32px' }}>
      <h2 className="section-title">
        <ShieldCheck size={18} fill="currentColor" color="#060913" />
        Panel de la Liga FMF
      </h2>

      <div className="glass-panel">
        <h3 style={{ fontSize: '15px', marginBottom: '8px', color: 'var(--accent-gold)' }}>
          Simulador de Acreditación Oficial
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Desde este panel administras las licencias de la federación. 
          Al activar el interruptor de validación, la liga otorga una credencial oficial al Director Técnico o Árbitro.
          <br /><br />
          <strong style={{ color: '#fff' }}>Efecto de la Validación:</strong> Sus avales sobre las estadísticas de los jugadores sumarán <strong style={{ color: 'var(--primary)' }}>+5 puntos</strong> y mostrarán la insignia oficial de la Liga en su ficha.
        </p>
      </div>

      {/* DT Accreditations Section */}
      <div className="glass-panel">
        <h3 className="section-title" style={{ fontSize: '14px', borderLeftColor: 'var(--primary)', marginBottom: '14px' }}>
          <Users size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Acreditación de Directores Técnicos (DT)
        </h3>

        <div className="league-list">
          {dts.map((dt) => {
            const isVerified = dt.verifiedLeagues?.includes('liga-1');
            return (
              <div key={dt.id} className="league-row">
                <div className="league-info">
                  <span className="league-name">{dt.name}</span>
                  <span className="league-verify-badge">
                    {isVerified ? (
                      <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <ShieldCheck size={12} fill="currentColor" color="#060913" />
                        Licencia Activa Liga MX
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Sin Licencia Liga MX</span>
                    )}
                  </span>
                </div>

                <label className="switch">
                  <input
                    type="checkbox"
                    checked={isVerified}
                    onChange={() => handleToggleDTVerification(dt.id)}
                  />
                  <span className="slider" />
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Referee Accreditations Section */}
      <div className="glass-panel">
        <h3 className="section-title" style={{ fontSize: '14px', borderLeftColor: 'var(--accent-cyan)', marginBottom: '14px' }}>
          <Award size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Habilitación del Cuerpo Arbitral
        </h3>

        <div className="league-list">
          {referees.map((ref) => {
            const isVerified = ref.verifiedLeagues?.includes('liga-1');
            return (
              <div key={ref.id} className="league-row">
                <div className="league-info">
                  <span className="league-name">{ref.name}</span>
                  <span className="league-verify-badge">
                    {isVerified ? (
                      <span style={{ color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <ShieldCheck size={12} fill="currentColor" color="#060913" />
                        Colegiatura Oficial Activa
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Pendiente de Certificación</span>
                    )}
                  </span>
                </div>

                <label className="switch">
                  <input
                    type="checkbox"
                    checked={isVerified}
                    onChange={() => handleToggleRefereeVerification(ref.id)}
                  />
                  <span className="slider" />
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeagueSim;
