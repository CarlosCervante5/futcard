import React from 'react';
import { ThumbsUp, ShieldCheck, Award } from 'lucide-react';

const EndorsementSystem = ({ player, activeUser, onUpdatePlayer }) => {
  const { skills = {}, name = 'Jugador' } = player;

  const handleEndorse = (skillKey) => {
    // Determine the endorser's role weight
    let weight = 1;
    let isOfficial = false;

    if (activeUser.role === 'dt') {
      // If the DT has active league verifications
      const isLeagueVerified = activeUser.verifiedLeagues && activeUser.verifiedLeagues.length > 0;
      weight = isLeagueVerified ? 5 : 1;
      isOfficial = isLeagueVerified;
    } else if (activeUser.role === 'referee') {
      const isLeagueVerified = activeUser.verifiedLeagues && activeUser.verifiedLeagues.length > 0;
      weight = isLeagueVerified ? 5 : 1;
      isOfficial = isLeagueVerified;
    }

    // Prepare a unique endorsement entry
    const newEndorsement = {
      id: `end-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      endorserName: activeUser.name,
      endorserRole: activeUser.role, // 'player', 'dt', 'referee'
      isOfficial: isOfficial,
      weight: weight,
      timestamp: new Date().toLocaleDateString()
    };

    // Update player skills list
    const updatedSkills = { ...skills };
    const currentSkill = updatedSkills[skillKey];

    // Initialize endorsements array if missing
    const currentEndorsements = currentSkill.endorsements || [];
    
    // Prevent double endorsement by the same user on the same skill
    const alreadyEndorsed = currentEndorsements.some(e => e.endorserName === activeUser.name);
    if (alreadyEndorsed) {
      alert(`⚠️ Ya has avalado la habilidad "${currentSkill.name}" de ${name}.`);
      return;
    }

    const newEndorsementsList = [...currentEndorsements, newEndorsement];
    
    // Calculate new skill value: baseValue + weight, capped at 99
    const newBaseVal = Math.min(99, currentSkill.value + weight);

    updatedSkills[skillKey] = {
      ...currentSkill,
      value: newBaseVal,
      endorsements: newEndorsementsList
    };

    onUpdatePlayer({
      ...player,
      skills: updatedSkills
    });
  };

  return (
    <div className="glass-panel">
      <h3 className="section-title">
        <Award size={18} />
        Avalar Habilidades
      </h3>
      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Las habilidades de este jugador se incrementan cuando recibe avales de la comunidad. 
        <br />
        <strong style={{ color: 'var(--accent-gold)' }}>🎖️ DT y Árbitros certificados otorgan +5 puntos</strong> (en lugar de +1).
      </p>

      <div className="endorsements-list">
        {Object.keys(skills).map((key) => {
          const skill = skills[key];
          const endorsementsCount = skill.endorsements?.length || 0;
          
          // Check if it has any official endorsements from league-verified DTs or Referees
          const officialEndorsements = skill.endorsements?.filter(e => e.isOfficial) || [];
          const hasOfficialEndorsement = officialEndorsements.length > 0;

          return (
            <div key={key} className="endorsement-row">
              <div className="endorsement-info">
                <span className="endorsement-name">
                  {skill.name}
                </span>
                
                <div className="endorsement-score">
                  <span className="badge badge-emerald" style={{ padding: '1px 6px', fontSize: '9px' }}>
                    Nivel: {skill.value}
                  </span>
                  <span>•</span>
                  <span>{endorsementsCount} {endorsementsCount === 1 ? 'aval' : 'avales'}</span>

                  {hasOfficialEndorsement && (
                    <>
                      <span>•</span>
                      <span className="verified-indicator">
                        <ShieldCheck size={12} fill="currentColor" color="#060913" />
                        Oficial
                      </span>
                    </>
                  )}
                </div>

                {/* Show names of people who endorsed */}
                {endorsementsCount > 0 && (
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Avalado por: {skill.endorsements.map(e => `${e.endorserName} (${e.isOfficial ? '⭐️ DT/Ref' : e.endorserRole.toUpperCase()})`).join(', ')}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleEndorse(key)}
                className="btn-endorse"
              >
                <ThumbsUp size={13} />
                Avalar
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EndorsementSystem;
