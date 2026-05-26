import React, { useState, useRef, useEffect } from 'react';
import { Upload, Sparkles, Download, RefreshCw, Star, Compass } from 'lucide-react';
import PlayerCard from './PlayerCard';

let API_BASE_URL = import.meta.env.VITE_API_URL;
if (!API_BASE_URL) {
  if (typeof window !== 'undefined' && (
    window.location.hostname.includes('railway.app') ||
    window.Capacitor ||
    window.location.protocol === 'capacitor:' ||
    window.location.protocol === 'http-capacitor:' ||
    window.location.hostname === 'localhost' && window.location.port === '' // native packaged webview
  )) {
    API_BASE_URL = 'https://protective-education-production.up.railway.app';
  } else {
    API_BASE_URL = 'http://localhost:5000';
  }
}

const CardGenerator = ({ player, onUpdatePlayer }) => {
  const [isCroppingAI, setIsCroppingAI] = useState(false);
  const [cropSuccess, setCropSuccess] = useState('');
  const fileInputRef = useRef(null);

  // Load dynamic background settings from local storage & API (centralized admin DB)
  const [allBackgrounds, setAllBackgrounds] = useState([]);

  useEffect(() => {
    const fetchBackgrounds = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/backgrounds`);
        if (response.ok) {
          const data = await response.json();
          setAllBackgrounds(data);
          localStorage.setItem('futcard_all_backgrounds', JSON.stringify(data));
          return;
        }
      } catch (err) {
        console.warn('Could not fetch backgrounds from API. Using local storage fallback.', err);
      }

      // Local storage fallback
      const savedBgs = localStorage.getItem('futcard_all_backgrounds');
      if (savedBgs) {
        try {
          setAllBackgrounds(JSON.parse(savedBgs));
        } catch (e) {
          console.error('Error parsing futcard_all_backgrounds:', e);
        }
      } else {
        // Fallback default presets if nothing in localStorage yet
        const defaultBgs = [
          { id: 'neon_pitch', name: '🏟️ Fondo Pitch Neón', image: '/backgrounds/neon_pitch.png', enabled: true, isPreset: true },
          { id: 'golden_shield', name: '🥇 Fondo Escudo Dorado', image: '/backgrounds/golden_shield.png', enabled: true, isPreset: true },
          { id: 'cyber_grid', name: '👾 Fondo Rejilla Cyber', image: '/backgrounds/cyber_grid.png', enabled: true, isPreset: true },
          { id: 'legend_marble', name: '🏛️ Fondo Mármol Leyenda', image: '/backgrounds/legend_marble.png', enabled: true, isPreset: true }
        ];
        setAllBackgrounds(defaultBgs);
      }
    };

    fetchBackgrounds();

    // Listen for storage events (e.g. changes made in Web Admin on the same domain)
    window.addEventListener('storage', fetchBackgrounds);
    return () => window.removeEventListener('storage', fetchBackgrounds);
  }, []);

  // Auto-migrate legacy gradient keys to high-fidelity database backgrounds
  useEffect(() => {
    if (player.cardTheme === 'gold') {
      onUpdatePlayer({ ...player, cardTheme: 'neon_pitch' });
    } else if (player.cardTheme === 'totw') {
      onUpdatePlayer({ ...player, cardTheme: 'golden_shield' });
    } else if (player.cardTheme === 'future') {
      onUpdatePlayer({ ...player, cardTheme: 'cyber_grid' });
    } else if (player.cardTheme === 'icon') {
      onUpdatePlayer({ ...player, cardTheme: 'legend_marble' });
    }
  }, [player.cardTheme]);

  // Filter theme options strictly based on dynamic preloaded backgrounds (removing duplicates)
  const themeOptions = allBackgrounds
    .filter(bg => bg.enabled)
    .map(bg => ({
      value: bg.id,
      label: bg.name
    }));

  const positions = ['POR', 'DFC', 'LD', 'LI', 'MCD', 'MC', 'MCO', 'ED', 'EI', 'DEL'];

  const handleStatChange = (key, val) => {
    const numericVal = Math.max(0, Math.min(99, parseInt(val) || 0));
    const updatedSkills = {
      ...player.skills,
      [key]: { ...player.skills[key], value: numericVal }
    };
    onUpdatePlayer({ ...player, skills: updatedSkills });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdatePlayer({ ...player, avatar: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Intelligent client-side AI Silhouette Cropper (Background Removal)
  const removeBackgroundWithAI = async () => {
    if (!player.avatar) return;
    setIsCroppingAI(true);
    setCropSuccess('');

    try {
      // 1. Simulate premium AI scanner delay
      await new Promise(resolve => setTimeout(resolve, 2200));

      // 2. Perform client-side intelligent canvas color-similarity background removal
      const croppedImage = await new Promise((resolve) => {
        const img = new Image();
        img.src = player.avatar;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

          // Corner color detection (typical background color)
          const r = data[0], g = data[1], b = data[2];
          const threshold = 65; // similarity threshold

          for (let i = 0; i < data.length; i += 4) {
            const currR = data[i];
            const currG = data[i+1];
            const currB = data[i+2];

            const dist = Math.sqrt(
              Math.pow(currR - r, 2) +
              Math.pow(currG - g, 2) +
              Math.pow(currB - b, 2)
            );

            // Also detect bright white or very light grey backgrounds
            const isWhite = currR > 230 && currG > 230 && currB > 230;

            if (dist < threshold || isWhite) {
              data[i + 3] = 0; // Set transparency to 100%
            }
          }

          ctx.putImageData(imgData, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
      });

      onUpdatePlayer({ ...player, avatar: croppedImage });
      setCropSuccess('✨ ¡Silueta recortada con IA y montada en tu tarjeta con éxito!');
    } catch (err) {
      console.error('Error cropping image:', err);
      setCropSuccess('⚠️ Error al recortar la silueta del jugador.');
    } finally {
      setIsCroppingAI(false);
      setTimeout(() => setCropSuccess(''), 4500);
    }
  };

  const triggerDownloadCard = () => {
    // Compile and export card using HTML5 Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 560; // 2x FUT card standard width
    canvas.height = 820; // 2x FUT card standard height
    const ctx = canvas.getContext('2d');

    const activeBg = allBackgrounds.find(bg => bg.id === player.cardTheme);
    const isImageTheme = !!activeBg;

    const drawCardDetails = () => {
      // Inner card shape border
      ctx.fillStyle = 'rgba(18, 20, 20, 0.94)';
      ctx.fillRect(8, 8, canvas.width - 16, canvas.height - 16);

      // Card Details - Header Rating & Position using Pitch Pulse typography
      const ratingKeys = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'];
      const calculatedRating = Math.round(
        ratingKeys.reduce((acc, k) => acc + (player.skills[k]?.value || 50), 0) / ratingKeys.length
      );

      // Determine colors dynamically
      let ratingColor = '#c3f400';
      let nameColor = '#c3f400';

      if (player.cardTheme === 'icon') {
        ratingColor = '#ffffff';
        nameColor = '#ffffff';
      } else if (player.cardTheme === 'future') {
        ratingColor = '#ec4899';
        nameColor = '#ec4899';
      } else if (player.cardTheme === 'totw') {
        ratingColor = '#fbbf24';
        nameColor = '#fbbf24';
      } else if (player.cardTheme === 'neon_pitch') {
        ratingColor = '#c3f400';
        nameColor = '#c3f400';
      } else if (player.cardTheme === 'golden_shield') {
        ratingColor = '#fbbf24';
        nameColor = '#fbbf24';
      } else if (player.cardTheme === 'cyber_grid') {
        ratingColor = '#ec4899';
        nameColor = '#ec4899';
      } else if (player.cardTheme === 'legend_marble') {
        ratingColor = '#ffffff';
        nameColor = '#ffffff';
      } else if (isImageTheme) {
        // Fallback color schemes for custom uploaded background designs
        ratingColor = '#c3f400';
        nameColor = '#ffffff';
      }

      ctx.fillStyle = ratingColor;
      ctx.font = 'italic 120px Anton, sans-serif'; // Condensed huge look
      ctx.fillText(calculatedRating.toString(), 35, 140);

      ctx.fillStyle = '#e2e2e2';
      ctx.font = '500 24px JetBrains Mono, monospace'; // Monospace sub-details
      ctx.fillText(player.position, 40, 195);

      // Separator line
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, 220);
      ctx.lineTo(130, 220);
      ctx.stroke();

      // Flag or logo placeholder
      ctx.font = '36px Arial';
      ctx.fillText('🇲🇽', 40, 280);
      ctx.font = '28px Arial';
      ctx.fillText('⚽', 40, 335);

      // Player Name using Anton font
      ctx.textAlign = 'center';
      ctx.fillStyle = nameColor;
      ctx.font = 'italic 44px Anton, sans-serif';
      ctx.fillText(player.name.toUpperCase(), canvas.width / 2, 490);

      // Horizontal split border
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath();
      ctx.moveTo(40, 520);
      ctx.lineTo(canvas.width - 40, 520);
      ctx.stroke();

      // Draw Stats 3x2 grid in JetBrains Mono / Anton
      ctx.textAlign = 'left';
      ctx.font = '500 22px JetBrains Mono, monospace';
      ctx.fillStyle = '#8d928d';
      
      // PAC, SHO, PAS
      ctx.fillText('RIT', 60, 570);
      ctx.fillText('TIR', 60, 620);
      ctx.fillText('PAS', 60, 670);

      // DRI, DEF, PHY
      ctx.fillText('REG', canvas.width / 2 + 40, 570);
      ctx.fillText('DEF', canvas.width / 2 + 40, 620);
      ctx.fillText('FIS', canvas.width / 2 + 40, 670);

      // Dynamic stat values in Anton
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = '400 28px Anton, sans-serif';
      
      ctx.fillText(player.skills.pac?.value.toString(), canvas.width / 2 - 60, 570);
      ctx.fillText(player.skills.sho?.value.toString(), canvas.width / 2 - 60, 620);
      ctx.fillText(player.skills.pas?.value.toString(), canvas.width / 2 - 60, 670);

      ctx.fillText(player.skills.dri?.value.toString(), canvas.width - 60, 570);
      ctx.fillText(player.skills.def?.value.toString(), canvas.width - 60, 620);
      ctx.fillText(player.skills.phy?.value.toString(), canvas.width - 60, 670);

      // Team Footer Branding
      ctx.textAlign = 'center';
      ctx.font = '500 22px JetBrains Mono, monospace';
      ctx.fillStyle = '#8d928d';
      ctx.fillText(player.club.toUpperCase(), canvas.width / 2, 755);

      // Draw cropped avatar image if available
      if (player.avatar) {
        const avatarImg = new Image();
        avatarImg.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(canvas.width / 2 + 100, 240, 160, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(avatarImg, canvas.width / 2 - 100, 40, 360, 360);
          ctx.restore();
          triggerSave(canvas);
        };
        avatarImg.src = player.avatar;
      } else {
        // Draw placeholder outline silhouette using canvas paths
        ctx.fillStyle = '#1a1c1c';
        ctx.beginPath();
        ctx.arc(canvas.width / 2 + 100, 240, 90, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2 + 100, 390, 130, 90, 0, 0, Math.PI * 2);
        ctx.fill();

        triggerSave(canvas);
      }
    };

    if (isImageTheme && activeBg) {
      // Draw background image first
      const bgImg = new Image();
      bgImg.onload = () => {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        drawCardDetails();
      };
      bgImg.src = activeBg.image;
    } else {
      // Fallback/Gradient background
      let bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      if (player.cardTheme === 'gold') {
        bgGrad.addColorStop(0, '#121414');
        bgGrad.addColorStop(0.5, '#1e2020');
        bgGrad.addColorStop(1, '#c3f400');
      } else if (player.cardTheme === 'icon') {
        bgGrad.addColorStop(0, '#121414');
        bgGrad.addColorStop(0.5, '#38393a');
        bgGrad.addColorStop(1, '#ffffff');
      } else if (player.cardTheme === 'totw') {
        bgGrad.addColorStop(0, '#121414');
        bgGrad.addColorStop(0.5, '#1c1c1c');
        bgGrad.addColorStop(1, '#fbbf24');
      } else if (player.cardTheme === 'future') {
        bgGrad.addColorStop(0, '#121414');
        bgGrad.addColorStop(0.5, '#1e1b4b');
        bgGrad.addColorStop(1, '#ec4899');
      } else {
        bgGrad.addColorStop(0, '#121414');
        bgGrad.addColorStop(0.5, '#1e2020');
        bgGrad.addColorStop(1, '#c3f400');
      }

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawCardDetails();
    }
  };

  const triggerSave = (canvas) => {
    const link = document.createElement('a');
    link.download = `FutCard_${player.name.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div style={{ paddingBottom: '32px' }}>
      <h2 className="section-title">
        <Star size={18} fill="currentColor" color="var(--primary)" />
        Mi Card Studio
      </h2>

      {/* Main card preview with metallic shimmer */}
      <PlayerCard player={player} />

      <div className="glass-panel" style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '14px', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
          Personalizar Datos
        </h3>

        {/* Name and Position editor */}
        <div className="form-group">
          <label>Nombre del Jugador</label>
          <input
            type="text"
            className="form-input"
            value={player.name}
            onChange={(e) => onUpdatePlayer({ ...player, name: e.target.value })}
            placeholder="Nombre completo"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Posición</label>
            <select
              className="form-select"
              value={player.position}
              onChange={(e) => onUpdatePlayer({ ...player, position: e.target.value })}
            >
              {positions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Club / Equipo</label>
            <input
              type="text"
              className="form-input"
              value={player.club}
              onChange={(e) => onUpdatePlayer({ ...player, club: e.target.value })}
              placeholder="Nombre del club"
            />
          </div>
        </div>

        {/* Special commemorate themes list */}
        <div className="form-group">
          <label>Estilo de Tarjeta Conmemorativa</label>
          <select
            className="form-select"
            value={player.cardTheme}
            onChange={(e) => onUpdatePlayer({ ...player, cardTheme: e.target.value })}
          >
            {themeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Picture Upload Button with AI Silhouette Cropper */}
        <div className="form-group">
          <label>Foto del Jugador</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary"
              style={{ flex: 1, borderStyle: 'dashed' }}
            >
              <Upload size={16} />
              Subir Foto
            </button>
            
            {player.avatar && (
              <button
                onClick={removeBackgroundWithAI}
                className="btn-primary"
                style={{ 
                  flex: 1, 
                  background: 'var(--primary)', 
                  boxShadow: '0 0 10px var(--primary-glow)', 
                  color: '#121414',
                  fontSize: '13px'
                }}
                disabled={isCroppingAI}
              >
                {isCroppingAI ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} />
                    Recortando...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} fill="currentColor" />
                    Recortar IA
                  </>
                )}
              </button>
            )}
          </div>
          
          {cropSuccess && (
            <div className="generated-ai-art-alert" style={{ marginTop: '8px', fontSize: '11px', padding: '6px 10px' }}>
              {cropSuccess}
            </div>
          )}
        </div>
      </div>

      {/* Background visual selector gallery */}
      <div className="glass-panel" style={{ border: '1px solid rgba(195, 244, 0, 0.2)' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '4px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-heading)' }}>
          <Compass size={16} />
          Galería de Fondos Precargados
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Selecciona un diseño exclusivo de la base de datos de la liga para revestir tu tarjeta.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {allBackgrounds.filter(bg => bg.enabled).map((bg) => (
            <div 
              key={bg.id}
              onClick={() => onUpdatePlayer({ ...player, cardTheme: bg.id })}
              style={{
                padding: '12px 8px',
                borderRadius: '8px',
                border: player.cardTheme === bg.id ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(0,0,0,0.4)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: player.cardTheme === bg.id ? '0 0 10px rgba(195, 244, 0, 0.15)' : 'none'
              }}
            >
              {bg.image ? (
                <div style={{ width: '48px', height: '48px', margin: '0 auto 8px', position: 'relative', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img 
                    src={bg.image} 
                    alt={bg.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>🖼️</span>
              )}
              <span style={{ fontSize: '11px', fontWeight: '600', display: 'block', color: player.cardTheme === bg.id ? 'var(--primary)' : '#e2e2e2', textTransform: 'uppercase', letterSpacing: '0.5px', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                {bg.name.replace(/🏟️|🥇|👾|🏛️|Fondo/g, '').trim()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Real-time Editor sliders */}
      <div className="glass-panel" style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '14px', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
          Ajustar Atributos Base
        </h3>
        
        <div className="stat-adjuster-grid">
          {Object.keys(player.skills).map((key) => (
            <div key={key} className="stat-adjuster-card">
              <span className="stat-adjuster-label">
                {player.skills[key].name}
              </span>
              <input
                type="number"
                className="stat-adjuster-input"
                value={player.skills[key].value}
                onChange={(e) => handleStatChange(key, e.target.value)}
                min="0"
                max="99"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Canvas Download Button */}
      <button
        onClick={triggerDownloadCard}
        className="btn-primary"
        style={{ marginTop: '24px', background: 'linear-gradient(135deg, var(--primary), #abd600)', boxShadow: '0 4px 15px var(--primary-glow)', color: '#121414' }}
      >
        <Download size={16} />
        Descargar Tarjeta (PNG)
      </button>
    </div>
  );
};

export default CardGenerator;
