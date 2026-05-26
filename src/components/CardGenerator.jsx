import React, { useState, useRef, useEffect } from 'react';
import { Upload, Sparkles, Download, RefreshCw, Star } from 'lucide-react';
import PlayerCard from './PlayerCard';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CardGenerator = ({ player, onUpdatePlayer }) => {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [prompt, setPrompt] = useState(player.aiPrompt || '');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  // Load dynamic background settings from local storage (centralized admin DB)
  const [allBackgrounds, setAllBackgrounds] = useState([]);

  useEffect(() => {
    const loadBackgrounds = () => {
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

    loadBackgrounds();
    
    // Listen for storage events (e.g. changes made in Web Admin on the same domain)
    window.addEventListener('storage', loadBackgrounds);
    return () => window.removeEventListener('storage', loadBackgrounds);
  }, []);

  // Filter theme options based on administrator settings
  const themeOptions = [
    { value: 'gold', label: 'Pitch Neon (Oro / Lime)' },
    { value: 'icon', label: 'Clásico Blanco / Leyenda' },
    { value: 'totw', label: 'Equipo de la Semana' },
    { value: 'future', label: 'Futuro Crack' },
    { value: 'ai', label: 'Generación IA con Prompt' },
    ...allBackgrounds
      .filter(bg => bg.enabled)
      .map(bg => ({
        value: bg.id,
        label: bg.name
      }))
  ];

  const suggestionChips = [
    'León de fuego místico',
    'Tormenta eléctrica azul',
    'Humo ciberpunk neón',
    'Erupción de oro líquido',
    'Fénix solar esmeralda'
  ];

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

  // Real-time Gemini API Integration via Server-Side BFF Proxy (BFF Key Protection)
  const simulateAIGeneration = async () => {
    if (!prompt.trim()) return;
    setIsGeneratingAI(true);
    setSuccessMsg('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/cards/generate-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: prompt })
      });

      const data = await response.json();
      if (response.ok) {
        onUpdatePlayer({
          ...player,
          cardTheme: 'ai',
          aiPrompt: prompt,
          aiColors: {
            primaryColor: data.primaryColor || '#22d3ee',
            secondaryColor: data.secondaryColor || '#0c0f0f',
            accentColor: data.accentColor || '#22d3ee',
            angle: data.angle || 135,
            designName: data.designName?.toUpperCase() || 'DISEÑO IA'
          }
        });
        setSuccessMsg(`🎨 ¡Diseño de IA cargado: "${data.designName}"! (${data.feedbackMsg || ''})`);
      } else {
        throw new Error(data.error || 'Error al generar.');
      }
    } catch (err) {
      console.error('Error connecting with Gemini API:', err);
      // Fallback stylized system (Fail Safe)
      onUpdatePlayer({
        ...player,
        cardTheme: 'ai',
        aiPrompt: prompt,
        aiColors: {
          primaryColor: '#c3f400',
          secondaryColor: '#1e2020',
          accentColor: '#c3f400',
          angle: 135,
          designName: 'PITCH GLOW'
        }
      });
      setSuccessMsg('⚠️ Fallo de conexión. Se cargó un tema visual de respaldo.');
    } finally {
      setIsGeneratingAI(false);
      setTimeout(() => setSuccessMsg(''), 5500);
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
      } else if (player.cardTheme === 'ai') {
        ratingColor = player.aiColors?.accentColor || '#22d3ee';
        nameColor = player.aiColors?.primaryColor || '#22d3ee';
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
        // AI custom theme
        const primary = player.aiColors?.primaryColor || '#22d3ee';
        const secondary = player.aiColors?.secondaryColor || '#0c0f0f';
        bgGrad.addColorStop(0, '#121414');
        bgGrad.addColorStop(0.5, secondary);
        bgGrad.addColorStop(1, primary);
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
        Estudio de Tarjetas
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

        {/* Custom Picture Upload Button */}
        <div className="form-group">
          <label>Foto del Jugador</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary"
            style={{ width: '100%', borderStyle: 'dashed' }}
          >
            <Upload size={16} />
            Subir Foto (.png, .jpg)
          </button>
        </div>
      </div>

      {/* Stats Real-time Editor sliders */}
      <div className="glass-panel">
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

      {/* AI generator module with Gemini options */}
      <div className="glass-panel" style={{ border: '1px solid rgba(195, 244, 0, 0.3)' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '6px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-heading)' }}>
          <Sparkles size={16} />
          Generador de Fondo IA
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>
          Escribe un prompt descriptivo para generar un fondo exclusivo y místico para tu tarjeta.
        </p>

        <div className="prompt-container">
          <input
            type="text"
            className="form-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ej. León de fuego con relámpagos dorados..."
            style={{ border: '1px solid rgba(195, 244, 0, 0.2)', background: 'rgba(0,0,0,0.5)' }}
          />

          <div className="prompt-suggestions">
            {suggestionChips.map((chip) => (
              <span
                key={chip}
                onClick={() => setPrompt(chip)}
                className="suggestion-chip"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={simulateAIGeneration}
          className="btn-primary"
          style={{ background: 'var(--primary)', boxShadow: '0 0 15px var(--primary-glow)' }}
          disabled={isGeneratingAI || !prompt.trim()}
        >
          {isGeneratingAI ? (
            <>
              <RefreshCw className="animate-spin" size={16} />
              Generando Fondo con IA...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generar con IA
            </>
          )}
        </button>

        {successMsg && (
          <div className="generated-ai-art-alert" style={{ background: successMsg.includes('⚠️') ? 'rgba(239,68,68,0.08)' : '', color: successMsg.includes('⚠️') ? '#f87171' : '', borderColor: successMsg.includes('⚠️') ? 'rgba(239,68,68,0.2)' : '' }}>
            <Sparkles size={14} />
            {successMsg}
          </div>
        )}
      </div>

      {/* Canvas Download Button */}
      <button
        onClick={triggerDownloadCard}
        className="btn-primary"
        style={{ marginTop: '16px', background: 'linear-gradient(135deg, var(--primary), #abd600)', boxShadow: '0 4px 15px var(--primary-glow)', color: '#121414' }}
      >
        <Download size={16} />
        Descargar Tarjeta (PNG)
      </button>
    </div>
  );
};

export default CardGenerator;
