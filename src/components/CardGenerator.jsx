import React, { useState, useRef, useEffect } from 'react';
import { Upload, Sparkles, Download, RefreshCw, Star, Compass, Camera, X, Check } from 'lucide-react';
import PlayerCard from './PlayerCard';

let API_BASE_URL = import.meta.env.VITE_API_URL || 'https://protective-education-production.up.railway.app';

const CardGenerator = ({ player, onUpdatePlayer, embedded = false }) => {
  const [isCroppingAI, setIsCroppingAI] = useState(false);
  const [cropSuccess, setCropSuccess] = useState('');
  const fileInputRef = useRef(null);

  // ── Crop editor state (mirror of onboarding crop editor) ──
  const [rawCardImage, setRawCardImage] = useState(null);
  const [cardCropZoom, setCardCropZoom] = useState(1);
  const [cardCropOffsetX, setCardCropOffsetX] = useState(0);
  const [cardCropOffsetY, setCardCropOffsetY] = useState(0);

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
    window.addEventListener('storage', fetchBackgrounds);
    return () => window.removeEventListener('storage', fetchBackgrounds);
  }, []);

  // Auto-migrate legacy gradient keys to database backgrounds
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

  const themeOptions = allBackgrounds
    .filter(bg => bg.enabled)
    .map(bg => ({ value: bg.id, label: bg.name }));

  const positions = ['POR', 'DFC', 'LD', 'LI', 'MCD', 'MC', 'MCO', 'ED', 'EI', 'DEL'];

  const handleStatChange = (key, val) => {
    const numericVal = Math.max(0, Math.min(99, parseInt(val) || 0));
    const updatedSkills = {
      ...player.skills,
      [key]: { ...player.skills[key], value: numericVal }
    };
    onUpdatePlayer({ ...player, skills: updatedSkills });
  };

  // ── File picker: downscale then open crop editor ──
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 900;
        let w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
          else { w = Math.round((w * maxDim) / h); h = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        // Open crop editor instead of applying directly
        setRawCardImage(canvas.toDataURL('image/jpeg', 0.82));
        setCardCropZoom(1);
        setCardCropOffsetX(0);
        setCardCropOffsetY(0);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  // ── Apply crop from the editor canvas ──
  const handleCardCropApply = () => {
    if (!rawCardImage) return;
    const img = new Image();
    img.src = rawCardImage;
    img.onload = () => {
      const destSize = 300;
      const cropBoxSize = 200;
      const ratio = destSize / cropBoxSize;

      const canvas = document.createElement('canvas');
      canvas.width = destSize;
      canvas.height = destSize;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, destSize, destSize);

      const minSide = Math.min(img.width, img.height);
      const scaleFactor = (cropBoxSize / minSide) * cardCropZoom;
      const drawW = img.width * scaleFactor * ratio;
      const drawH = img.height * scaleFactor * ratio;
      const drawX = (destSize - drawW) / 2 + cardCropOffsetX * ratio;
      const drawY = (destSize - drawH) / 2 + cardCropOffsetY * ratio;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      onUpdatePlayer({ ...player, avatar: canvas.toDataURL('image/jpeg', 0.85) });
      setRawCardImage(null);
    };
  };

  // ── AI Background Removal: calls Gemini Vision for color hints → canvas removal → composite on bg ──
  const removeBackgroundWithAI = async () => {
    if (!player.avatar) return;
    setIsCroppingAI(true);
    setCropSuccess('');

    try {
      // ── Step 1: Ask Gemini Vision what colors are the background ──
      let backgroundColors = ['#ffffff', '#f0f0f0'];
      let threshold = 55;
      let usingFallback = true;

      try {
        const analysisResp = await fetch(`${API_BASE_URL}/api/ai/analyze-background`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: player.avatar })
        });
        if (analysisResp.ok) {
          const analysis = await analysisResp.json();
          if (analysis.backgroundColors?.length) backgroundColors = analysis.backgroundColors;
          if (analysis.threshold) threshold = analysis.threshold;
          if (analysis.usingFallback !== undefined) usingFallback = analysis.usingFallback;
        }
      } catch (e) {
        console.warn('[AI BG] Could not reach analyze-background endpoint, using corner fallback:', e);
      }

      // Helper: hex → {r,g,b}
      const hexToRgb = (hex) => {
        const clean = hex.replace('#', '');
        return {
          r: parseInt(clean.substring(0, 2), 16),
          g: parseInt(clean.substring(2, 4), 16),
          b: parseInt(clean.substring(4, 6), 16)
        };
      };

      const targetColors = backgroundColors.map(hexToRgb);

      // ── Step 2: Canvas background removal using Gemini-guided palette ──
      const activeBg = allBackgrounds.find(bg => bg.id === player.cardTheme);

      const processedDataUrl = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const SIZE = img.width;
          const canvas = document.createElement('canvas');
          canvas.width = SIZE;
          canvas.height = SIZE;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          const imgData = ctx.getImageData(0, 0, SIZE, SIZE);
          const d = imgData.data;

          // Only sample top corners as extra hints in fallback mode
          const allTargets = [...targetColors];
          if (usingFallback) {
            allTargets.push(
              { r: d[0], g: d[1], b: d[2] }, // top-left
              { r: d[(SIZE - 1) * 4], g: d[(SIZE - 1) * 4 + 1], b: d[(SIZE - 1) * 4 + 2] } // top-right
            );
          }

          const colorDist = (r1, g1, b1, r2, g2, b2) =>
            Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);

          for (let i = 0; i < d.length; i += 4) {
            const pr = d[i], pg = d[i + 1], pb = d[i + 2];
            const minDist = Math.min(...allTargets.map(c => colorDist(pr, pg, pb, c.r, c.g, c.b)));

            if (minDist < threshold) {
              // Fully transparent
              d[i + 3] = 0;
            } else if (minDist < threshold + 20) {
              // Feathered edge: partial transparency for smooth border
              d[i + 3] = Math.round(((minDist - threshold) / 20) * 255);
            }
            // else: keep pixel fully opaque
          }

          ctx.putImageData(imgData, 0, 0);
          const cutout = canvas.toDataURL('image/png');

          // ── Step 3: Composite cutout on selected card background ──
          if (activeBg?.image) {
            const bgImg = new Image();
            bgImg.onload = () => {
              const outCanvas = document.createElement('canvas');
              const OUT_SIZE = 400;
              outCanvas.width = OUT_SIZE;
              outCanvas.height = OUT_SIZE;
              const outCtx = outCanvas.getContext('2d');

              // Draw background filling the square
              outCtx.drawImage(bgImg, 0, 0, OUT_SIZE, OUT_SIZE);

              // Draw player cutout centered and slightly up (head/shoulders framing)
              const cutoutImg = new Image();
              cutoutImg.onload = () => {
                // Scale to fill 90% of frame, vertically shifted up slightly
                const scale = OUT_SIZE / cutoutImg.width;
                const drawW = cutoutImg.width * scale;
                const drawH = cutoutImg.height * scale;
                const drawX = (OUT_SIZE - drawW) / 2;
                const drawY = (OUT_SIZE - drawH) / 2 - OUT_SIZE * 0.05;
                outCtx.drawImage(cutoutImg, drawX, drawY, drawW, drawH);
                resolve(outCanvas.toDataURL('image/jpeg', 0.88));
              };
              cutoutImg.onerror = () => resolve(cutout);
              cutoutImg.src = cutout;
            };
            bgImg.onerror = () => resolve(cutout);
            bgImg.src = activeBg.image;
          } else {
            resolve(cutout);
          }
        };
        img.onerror = reject;
        img.src = player.avatar;
      });

      onUpdatePlayer({ ...player, avatar: processedDataUrl });
      setCropSuccess('✨ Fondo eliminado con IA Gemini y composición aplicada sobre el fondo de tarjeta.');
    } catch (err) {
      console.error('[AI BG Removal]', err);
      setCropSuccess('⚠️ Error al procesar la imagen. Intenta de nuevo.');
    } finally {
      setIsCroppingAI(false);
      setTimeout(() => setCropSuccess(''), 5000);
    }
  };

  const triggerDownloadCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 560;
    canvas.height = 820;
    const ctx = canvas.getContext('2d');

    const activeBg = allBackgrounds.find(bg => bg.id === player.cardTheme);
    const isImageTheme = !!activeBg;

    const drawCardDetails = () => {
      ctx.fillStyle = 'rgba(18, 20, 20, 0.94)';
      ctx.fillRect(8, 8, canvas.width - 16, canvas.height - 16);

      const ratingKeys = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'];
      const calculatedRating = Math.round(
        ratingKeys.reduce((acc, k) => acc + (player.skills[k]?.value || 50), 0) / ratingKeys.length
      );

      let ratingColor = '#c3f400', nameColor = '#c3f400';
      if (player.cardTheme === 'icon' || player.cardTheme === 'legend_marble') { ratingColor = '#ffffff'; nameColor = '#ffffff'; }
      else if (player.cardTheme === 'future' || player.cardTheme === 'cyber_grid') { ratingColor = '#ec4899'; nameColor = '#ec4899'; }
      else if (player.cardTheme === 'totw' || player.cardTheme === 'golden_shield') { ratingColor = '#fbbf24'; nameColor = '#fbbf24'; }
      else if (isImageTheme) { ratingColor = '#c3f400'; nameColor = '#ffffff'; }

      ctx.fillStyle = ratingColor;
      ctx.font = 'italic 120px Anton, sans-serif';
      ctx.fillText(calculatedRating.toString(), 35, 140);

      ctx.fillStyle = '#e2e2e2';
      ctx.font = '500 24px JetBrains Mono, monospace';
      ctx.fillText(player.position, 40, 195);

      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(40, 220); ctx.lineTo(130, 220); ctx.stroke();

      ctx.font = '36px Arial'; ctx.fillText('🇲🇽', 40, 280);
      ctx.font = '28px Arial'; ctx.fillText('⚽', 40, 335);

      ctx.textAlign = 'center';
      ctx.fillStyle = nameColor;
      ctx.font = 'italic 44px Anton, sans-serif';
      ctx.fillText(player.name.toUpperCase(), canvas.width / 2, 490);

      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath(); ctx.moveTo(40, 520); ctx.lineTo(canvas.width - 40, 520); ctx.stroke();

      ctx.textAlign = 'left';
      ctx.font = '500 22px JetBrains Mono, monospace';
      ctx.fillStyle = '#8d928d';
      ctx.fillText('RIT', 60, 570); ctx.fillText('TIR', 60, 620); ctx.fillText('PAS', 60, 670);
      ctx.fillText('REG', canvas.width / 2 + 40, 570); ctx.fillText('DEF', canvas.width / 2 + 40, 620); ctx.fillText('FIS', canvas.width / 2 + 40, 670);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = '400 28px Anton, sans-serif';
      ctx.fillText(player.skills.pac?.value.toString(), canvas.width / 2 - 60, 570);
      ctx.fillText(player.skills.sho?.value.toString(), canvas.width / 2 - 60, 620);
      ctx.fillText(player.skills.pas?.value.toString(), canvas.width / 2 - 60, 670);
      ctx.fillText(player.skills.dri?.value.toString(), canvas.width - 60, 570);
      ctx.fillText(player.skills.def?.value.toString(), canvas.width - 60, 620);
      ctx.fillText(player.skills.phy?.value.toString(), canvas.width - 60, 670);

      ctx.textAlign = 'center';
      ctx.font = '500 22px JetBrains Mono, monospace';
      ctx.fillStyle = '#8d928d';
      ctx.fillText(player.club.toUpperCase(), canvas.width / 2, 755);

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
        ctx.fillStyle = '#1a1c1c';
        ctx.beginPath(); ctx.arc(canvas.width / 2 + 100, 240, 90, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(canvas.width / 2 + 100, 390, 130, 90, 0, 0, Math.PI * 2); ctx.fill();
        triggerSave(canvas);
      }
    };

    if (isImageTheme && activeBg) {
      const bgImg = new Image();
      bgImg.onload = () => { ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height); drawCardDetails(); };
      bgImg.src = activeBg.image;
    } else {
      let bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGrad.addColorStop(0, '#121414'); bgGrad.addColorStop(0.5, '#1e2020'); bgGrad.addColorStop(1, '#c3f400');
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

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  // If crop editor is open, show it full-screen within the component
  if (rawCardImage) {
    return (
      <div style={{ paddingBottom: '32px' }}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#fff', fontWeight: 'bold', width: '100%', textAlign: 'left', fontFamily: 'var(--font-heading)' }}>
            ✂️ Ajustar Encuadre
          </h4>

          {/* Crop viewport with silhouette overlay */}
          <div style={{ width: '260px', height: '260px', borderRadius: '12px', border: '2px solid var(--primary)', background: '#121414', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(195,244,0,0.2)', marginBottom: '12px' }}>
            <img
              src={rawCardImage}
              alt="Encuadre"
              style={{
                width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none',
                transform: `translate(${cardCropOffsetX}px, ${cardCropOffsetY}px) scale(${cardCropZoom})`,
                transition: 'transform 0.1s ease-out'
              }}
            />
            {/* Silhouette SVG guide */}
            <svg viewBox="0 0 100 100" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
              <path d="M0,0 H100 V100 H0 Z M50,15 C41.7,15 35,21.7 35,30 C35,38.3 41.7,45 50,45 C58.3,45 65,38.3 65,30 C65,21.7 58.3,15 50,15 Z M15,85 C15,69.5 27.5,57 43,55.5 C43.5,55.4 44,55 44,54.5 V48 C42,47 41,45 41,42 C41,40 42,39 42,39 C42,39 43,35 43,32 H57 C57,35 58,39 58,39 C58,39 59,40 59,42 C59,45 58,47 56,48 V54.5 C56,55 56.5,55.4 57,55.5 C72.5,57 85,69.5 85,85 Z" fill="rgba(12,15,15,0.7)" fillRule="evenodd" />
              <path d="M50,15 C41.7,15 35,21.7 35,30 C35,38.3 41.7,45 50,45 C58.3,45 65,38.3 65,30 C65,21.7 58.3,15 50,15 Z M15,85 C15,69.5 27.5,57 43,55.5 C43.5,55.4 44,55 44,54.5 V48 C42,47 41,45 41,42 C41,40 42,39 42,39 C42,39 43,35 43,32 H57 C57,35 58,39 58,39 C58,39 59,40 59,42 C59,45 58,47 56,48 V54.5 C56,55 56.5,55.4 57,55.5 C72.5,57 85,69.5 85,85 Z" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="3,3" fill="none" style={{ filter: 'drop-shadow(0 0 5px var(--primary))' }} />
            </svg>
          </div>

          <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: '0 0 12px 0', textAlign: 'center' }}>
            Centra tu rostro y hombros dentro del contorno neón
          </p>

          {/* Zoom */}
          <div style={{ width: '100%', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <span>Zoom</span>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{Math.round(cardCropZoom * 100)}%</span>
            </div>
            <input type="range" min="0.5" max="3.0" step="0.1" value={cardCropZoom} onChange={e => setCardCropZoom(parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
          </div>

          {/* Horizontal */}
          <div style={{ width: '100%', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <span>Mover Horizontal</span>
              <span style={{ color: 'var(--primary)' }}>{cardCropOffsetX}px</span>
            </div>
            <input type="range" min="-120" max="120" value={cardCropOffsetX} onChange={e => setCardCropOffsetX(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
          </div>

          {/* Vertical */}
          <div style={{ width: '100%', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <span>Mover Vertical</span>
              <span style={{ color: 'var(--primary)' }}>{cardCropOffsetY}px</span>
            </div>
            <input type="range" min="-120" max="120" value={cardCropOffsetY} onChange={e => setCardCropOffsetY(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <button
              onClick={() => setRawCardImage(null)}
              className="btn-secondary"
              style={{ flex: 1, padding: '10px', fontSize: '13px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <X size={14} /> Cancelar
            </button>
            <button
              onClick={handleCardCropApply}
              className="btn-primary"
              style={{ flex: 2, padding: '10px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Check size={14} /> Guardar Recorte
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '32px' }}>
      {!embedded && (
        <>
          <h2 className="section-title">
            <Star size={18} fill="currentColor" color="var(--primary)" />
            Mi Card Studio
          </h2>
          <PlayerCard player={player} />
        </>
      )}

      <div className="glass-panel" style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '14px', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
          Personalizar Datos
        </h3>

        <div className="form-group">
          <label>Nombre del Jugador</label>
          <input type="text" className="form-input" value={player.name} onChange={(e) => onUpdatePlayer({ ...player, name: e.target.value })} placeholder="Nombre completo" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Posición</label>
            <select className="form-select" value={player.position} onChange={(e) => onUpdatePlayer({ ...player, position: e.target.value })}>
              {positions.map((p) => (<option key={p} value={p}>{p}</option>))}
            </select>
          </div>
          <div className="form-group">
            <label>Club / Equipo</label>
            <input type="text" className="form-input" value={player.club} onChange={(e) => onUpdatePlayer({ ...player, club: e.target.value })} placeholder="Nombre del club" />
          </div>
        </div>

        <div className="form-group">
          <label>Estilo de Tarjeta Conmemorativa</label>
          <select className="form-select" value={player.cardTheme} onChange={(e) => onUpdatePlayer({ ...player, cardTheme: e.target.value })}>
            {themeOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>
        </div>

        {/* Photo upload → opens crop editor */}
        <div className="form-group">
          <label>Foto del Jugador</label>
          <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" style={{ display: 'none' }} />

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary"
              style={{ flex: 1, minWidth: '120px', borderStyle: 'dashed' }}
            >
              <Upload size={16} />
              {player.avatar ? 'Cambiar Foto' : 'Subir Foto'}
            </button>

            {player.avatar && (
              <button
                onClick={removeBackgroundWithAI}
                className="btn-primary"
                style={{ flex: 1, minWidth: '120px', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary-glow)', color: '#121414', fontSize: '13px' }}
                disabled={isCroppingAI}
              >
                {isCroppingAI ? (
                  <><RefreshCw className="animate-spin" size={14} /> Procesando...</>
                ) : (
                  <><Sparkles size={14} fill="currentColor" /> Recortar + Fondo IA</>
                )}
              </button>
            )}
          </div>

          {/* Avatar preview thumbnail */}
          {player.avatar && (
            <div style={{ marginTop: '10px', width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--primary)', boxShadow: '0 0 8px var(--primary-glow)' }}>
              <img src={player.avatar} alt="Avatar preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

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
          Selecciona un diseño. Al usar "Recortar + Fondo IA" la foto se composita sobre el fondo elegido.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {allBackgrounds.filter(bg => bg.enabled).map((bg) => (
            <div
              key={bg.id}
              onClick={() => onUpdatePlayer({ ...player, cardTheme: bg.id })}
              style={{
                padding: '12px 8px', borderRadius: '8px',
                border: player.cardTheme === bg.id ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(0,0,0,0.4)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: player.cardTheme === bg.id ? '0 0 10px rgba(195, 244, 0, 0.15)' : 'none'
              }}
            >
              {bg.image ? (
                <div style={{ width: '48px', height: '48px', margin: '0 auto 8px', position: 'relative', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img src={bg.image} alt={bg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

      {/* Stats editor */}
      <div className="glass-panel" style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '14px', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
          Ajustar Atributos Base
        </h3>
        <div className="stat-adjuster-grid">
          {Object.keys(player.skills).map((key) => (
            <div key={key} className="stat-adjuster-card">
              <span className="stat-adjuster-label">{player.skills[key].name}</span>
              <input type="number" className="stat-adjuster-input" value={player.skills[key].value} onChange={(e) => handleStatChange(key, e.target.value)} min="0" max="99" />
            </div>
          ))}
        </div>
      </div>

      {/* Download button */}
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
