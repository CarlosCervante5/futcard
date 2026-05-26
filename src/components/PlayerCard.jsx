import React from 'react';

const PlayerCard = ({ player, scale = 1 }) => {
  if (!player) return null;

  const {
    name = 'Jugador',
    position = 'DEL',
    cardTheme = 'gold',
    skills = {},
    nationality = 'México',
    flag = 'https://flagcdn.com/w40/mx.png',
    club = 'Club',
    clubBadge = '',
    aiPrompt = '',
    avatar = ''
  } = player;

  // Calculate overall rating from skills
  const skillKeys = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'];
  const avgRating = Math.round(
    skillKeys.reduce((acc, k) => acc + (skills[k]?.value || 50), 0) / skillKeys.length
  );
  
  // Load dynamic backgrounds from localStorage to check if it's a dynamic or custom background
  let customBg = null;
  try {
    const savedBgs = localStorage.getItem('futcard_all_backgrounds');
    if (savedBgs) {
      const bgs = JSON.parse(savedBgs);
      customBg = bgs.find(bg => bg.id === cardTheme);
    }
  } catch (e) {
    console.error(e);
  }
  
  // Custom theme mapping
  const themeClass = `theme-${cardTheme}`;

  // AI-generated colors integration
  const isAITheme = cardTheme === 'ai';
  const customCardStyles = {};
  const customAccentColor = isAITheme && player.aiColors?.accentColor;
  const customPrimaryColor = isAITheme && player.aiColors?.primaryColor;
  const customSecondaryColor = isAITheme && player.aiColors?.secondaryColor;
  const customAngle = isAITheme && player.aiColors?.angle;

  if (isAITheme && player.aiColors) {
    customCardStyles.background = `linear-gradient(${customAngle || 135}deg, #121414 0%, ${customSecondaryColor || '#0c0f0f'} 60%, ${customPrimaryColor || 'var(--accent-cyan)'} 100%)`;
    customCardStyles.borderColor = customAccentColor || 'var(--accent-cyan)';
    customCardStyles.boxShadow = `0 0 25px ${customAccentColor ? customAccentColor + '20' : 'rgba(34, 211, 238, 0.15)'}`;
  } else if (customBg) {
    customCardStyles.backgroundImage = `url('${customBg.image}')`;
    customCardStyles.backgroundSize = 'cover';
    customCardStyles.backgroundPosition = 'center';
    
    // Determine custom border based on preset theme, or default to nice high-fidelity neon cyan/lime
    if (cardTheme === 'neon_pitch') {
      customCardStyles.borderColor = 'var(--primary)';
    } else if (cardTheme === 'golden_shield') {
      customCardStyles.borderColor = 'var(--accent-gold)';
    } else if (cardTheme === 'cyber_grid') {
      customCardStyles.borderColor = 'var(--accent-pink)';
    } else if (cardTheme === 'legend_marble') {
      customCardStyles.borderColor = '#ffffff';
    } else {
      // Custom uploaded base64 background border and neon glow
      customCardStyles.borderColor = 'var(--accent-cyan)';
      customCardStyles.boxShadow = '0 0 20px rgba(34, 211, 238, 0.2)';
    }
  }

  // Default Player Silhouette if no avatar is supplied
  const defaultAvatarSvg = (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', opacity: 0.65 }}>
      <path d="M50 15C38.954 15 30 23.954 30 35C30 45.474 38.077 54.062 48.243 54.922C32.484 56.402 20 69.722 20 86C20 87.105 20.895 88 22 88H78C79.105 88 80 87.105 80 86C80 69.722 67.516 56.402 51.757 54.922C61.923 54.062 70 45.474 70 35C70 23.954 61.046 15 50 15Z" fill="url(#sil_grad)" />
      <defs>
        <linearGradient id="sil_grad" x1="50" y1="15" x2="50" y2="88" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6b7280" />
          <stop offset="1" stopColor="#374151" stopOpacity="0.3" />
        </linearGradient>
      </defs>
    </svg>
  );

  // Dynamic text color determinations
  const getRatingColor = () => {
    if (isAITheme && customAccentColor) return customAccentColor;
    if (cardTheme === 'icon') return '#ffffff';
    if (cardTheme === 'future') return 'var(--accent-pink)';
    if (cardTheme === 'ai') return 'var(--accent-cyan)';
    if (cardTheme === 'golden_shield') return 'var(--accent-gold)';
    if (cardTheme === 'cyber_grid') return 'var(--accent-pink)';
    if (cardTheme === 'legend_marble') return '#ffffff';
    return 'var(--primary)';
  };

  const getPlayerNameColor = () => {
    if (isAITheme && customPrimaryColor) return customPrimaryColor;
    if (cardTheme === 'future') return 'var(--accent-pink)';
    if (cardTheme === 'ai') return 'var(--accent-cyan)';
    if (cardTheme === 'icon') return '#ffffff';
    if (cardTheme === 'golden_shield') return 'var(--accent-gold)';
    if (cardTheme === 'cyber_grid') return 'var(--accent-pink)';
    if (cardTheme === 'legend_marble') return '#ffffff';
    return 'var(--primary)';
  };

  return (
    <div className="fut-card-wrapper" style={{ transform: `scale(${scale})` }}>
      <div className={`fut-card ${themeClass}`} style={customCardStyles}>
        {/* Shimmer reflection overlay */}
        <div className="card-shine" />

        {/* Content Container */}
        <div className="card-content" style={isAITheme && player.aiColors ? { border: `1px solid ${customAccentColor}25` } : {}}>
          
          {/* Card Upper Section - Layout */}
          <div className="card-top">
            
            {/* Stats Left Panel */}
            <div className="card-rating-panel">
              <span className="card-rating-number" style={{ color: getRatingColor() }}>{avgRating}</span>
              <span className="card-rating-position">{position}</span>
              <div className="card-divider" />
              <div className="card-badges">
                {flag && <img src={flag} alt={nationality} className="card-badge-icon" title={nationality} />}
                {clubBadge ? (
                  <img src={clubBadge} alt={club} className="card-badge-icon" />
                ) : (
                  <span style={{ fontSize: '13px', filter: 'grayscale(1)' }}>⚽</span>
                )}
              </div>
            </div>

            {/* Main Cut-out Player Photo Frame */}
            <div className="card-image-holder">
              {/* Decorative faint background pattern */}
              <svg className="card-svg-bg" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" strokeDasharray="5,5" fill="none" />
                <path d="M10 50h80M50 10v80" />
              </svg>

              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="card-player-photo"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div style={{ width: '130px', height: '130px', zIndex: 5 }}>
                  {defaultAvatarSvg}
                </div>
              )}
            </div>

          </div>

          {/* Player Name */}
          <h3 className="card-player-name" style={{ color: getPlayerNameColor() }}>{name}</h3>

          {/* Player Main Stats 6-Columns */}
          <div className="card-stats-grid">
            <div className="stat-column">
              <div className="stat-item">
                <span>RIT</span>
                <span className="stat-val">{skills.pac?.value || 50}</span>
              </div>
              <div className="stat-item">
                <span>TIR</span>
                <span className="stat-val">{skills.sho?.value || 50}</span>
              </div>
              <div className="stat-item">
                <span>PAS</span>
                <span className="stat-val">{skills.pas?.value || 50}</span>
              </div>
            </div>

            <div className="stat-column">
              <div className="stat-item">
                <span>REG</span>
                <span className="stat-val">{skills.dri?.value || 50}</span>
              </div>
              <div className="stat-item">
                <span>DEF</span>
                <span className="stat-val">{skills.def?.value || 50}</span>
              </div>
              <div className="stat-item">
                <span>FIS</span>
                <span className="stat-val">{skills.phy?.value || 50}</span>
              </div>
            </div>
          </div>

          {/* Team / Club Footer Branding */}
          <div className="card-team-footer">
            <span>{club}</span>
            {isAITheme && aiPrompt && (
              <span className="badge badge-cyan" style={{ fontSize: '7px', padding: '1px 4px', background: customAccentColor ? `${customAccentColor}20` : '', color: customAccentColor || '', borderColor: customAccentColor || '' }} title={aiPrompt}>
                {player.aiColors?.designName ? player.aiColors.designName : 'AI Styled'}
              </span>
            )}
          </div>

        </div>
      </div>
    </div>

  );
};

export default PlayerCard;
