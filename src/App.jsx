import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Compass, Star, User, Sliders, Sparkles, RefreshCw, X, Award, Eye, EyeOff } from 'lucide-react';
import { getAppData, saveAppData, resetAppData } from './data/mockData';
import PlayerCard from './components/PlayerCard';
import CardGenerator from './components/CardGenerator';
import EndorsementSystem from './components/EndorsementSystem';
import RoleManager from './components/RoleManager';
import LeagueSim from './components/LeagueSim';
import SharedProfileView from './components/SharedProfileView';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://protective-education-production.up.railway.app';

const getCountryFlag = (country) => {
  if (!country) return 'https://flagcdn.com/w40/mx.png';
  const clean = country.trim().toLowerCase();
  if (clean.includes('mex') || clean.includes('méx')) return 'https://flagcdn.com/w40/mx.png';
  if (clean.includes('arg')) return 'https://flagcdn.com/w40/ar.png';
  if (clean.includes('bra')) return 'https://flagcdn.com/w40/br.png';
  if (clean.includes('esp')) return 'https://flagcdn.com/w40/es.png';
  if (clean.includes('usa') || clean.includes('est') || clean.includes('uni')) return 'https://flagcdn.com/w40/us.png';
  if (clean.includes('col')) return 'https://flagcdn.com/w40/co.png';
  if (clean.includes('uru')) return 'https://flagcdn.com/w40/uy.png';
  if (clean.includes('chi')) return 'https://flagcdn.com/w40/cl.png';
  return 'https://flagcdn.com/w40/mx.png'; // default
};

function App() {
  const [authToken, setAuthToken] = useState(() => sessionStorage.getItem('futcard_jwt') || '');
  const [db, setDb] = useState(getAppData());
  const [activeTab, setActiveTab] = useState('feed'); // feed, studio, my-profile, league-panel
  const [feedSegment, setFeedSegment] = useState('players'); // players, dts, referees explore filter

  // Auth state variables
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginShake, setLoginShake] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerNickname, setRegisterNickname] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [registerRole, setRegisterRole] = useState('Jugador');
  const [registerError, setRegisterError] = useState('');

  const [activeUser, setActiveUser] = useState(() => {
    const saved = sessionStorage.getItem('futcard_active_admin');
    return saved ? JSON.parse(saved) : {
      id: 'p-1',
      name: 'Santiago Giménez',
      role: 'player', // Default logged-in player Santiago
    };
  });
  const [sharedPlayerId, setSharedPlayerId] = useState(null);
  const [endorsePlayerId, setEndorsePlayerId] = useState(null);

  // Onboarding Wizard states
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardPosition, setOnboardPosition] = useState('DEL');
  const [onboardClub, setOnboardClub] = useState('');
  const [onboardNationality, setOnboardNationality] = useState('México');
  const [onboardPac, setOnboardPac] = useState(75);
  const [onboardSho, setOnboardSho] = useState(75);
  const [onboardPas, setOnboardPas] = useState(75);
  const [onboardDri, setOnboardDri] = useState(75);
  const [onboardDef, setOnboardDef] = useState(75);
  const [onboardPhy, setOnboardPhy] = useState(75);
  const [onboardAvatar, setOnboardAvatar] = useState('');
  const [onboardTheme, setOnboardTheme] = useState('gold');

  // Onboarding Avatar custom photo shape cropper states
  const [rawUploadedImage, setRawUploadedImage] = useState(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffsetX, setCropOffsetX] = useState(0);
  const [cropOffsetY, setCropOffsetY] = useState(0);

  // Live camera stream states and handlers
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 800 }, height: { ideal: 800 } },
        audio: false
      });
      setCameraStream(stream);
      // Wait for a brief React render frame cycle to ensure video ref is mounted
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("No se pudo acceder a la cámara. Asegúrate de otorgar los permisos necesarios.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      
      const width = video.videoWidth || 800;
      const height = video.videoHeight || 800;
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      // Mirror image for selfie capturing comfort
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, width, height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      
      const maxDim = 800;
      let targetW = width;
      let targetH = height;
      if (targetW > maxDim || targetH > maxDim) {
        if (targetW > targetH) {
          targetH = Math.round((targetH * maxDim) / targetW);
          targetW = maxDim;
        } else {
          targetW = Math.round((targetW * maxDim) / targetH);
          targetH = maxDim;
        }
      }
      
      const compressCanvas = document.createElement('canvas');
      compressCanvas.width = targetW;
      compressCanvas.height = targetH;
      const compressCtx = compressCanvas.getContext('2d');
      compressCtx.drawImage(canvas, 0, 0, targetW, targetH);
      
      const compressedData = compressCanvas.toDataURL('image/jpeg', 0.8);
      setRawUploadedImage(compressedData);
      setCropZoom(1);
      setCropOffsetX(0);
      setCropOffsetY(0);
      
      stopCamera();
    }
  };

  // Initialize and check for WhatsApp share params in URL query
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedId = params.get('sharedPlayerId');
    if (sharedId) {
      setSharedPlayerId(sharedId);
    }
  }, []);

  // Fetch data from backend when auth token is available
  useEffect(() => {
    if (!authToken) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/federation`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDb(data);
        }
      } catch (e) {
        console.error('Failed to fetch federation data', e);
      }
    };
    fetchData();
  }, [authToken]);

  // Onboarding lock interceptor and player auto-mapping
  useEffect(() => {
    if (!authToken || !activeUser || !db.players || db.players.length === 0) return;

    if (activeUser.role === 'Jugador' || activeUser.role === 'player') {
      const existingPlayer = db.players.find(p => p.name.toLowerCase() === activeUser.name.toLowerCase());
      
      if (existingPlayer) {
        // Link the user account to the federative player profile automatically
        if (activeUser.id !== existingPlayer.id) {
          const updatedUser = { ...activeUser, id: existingPlayer.id, role: 'player' };
          setActiveUser(updatedUser);
          sessionStorage.setItem('futcard_active_admin', JSON.stringify(updatedUser));
        }
        // Deactivate onboarding screen
        if (showOnboarding) {
          setShowOnboarding(false);
        }
      } else {
        // Force the player onboarding form before showing the home dashboard
        if (!showOnboarding) {
          setShowOnboarding(true);
          setOnboardingStep(1);
        }
      }
    }
  }, [db.players, activeUser, authToken]);

  // Onboarding draft loader
  useEffect(() => {
    if (!activeUser || !activeUser.email) return;
    
    try {
      const savedDraft = localStorage.getItem('futcard_onboarding_draft_' + activeUser.email);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (draft.step) setOnboardingStep(draft.step);
        if (draft.position) setOnboardPosition(draft.position);
        if (draft.club) setOnboardClub(draft.club);
        if (draft.nationality) setOnboardNationality(draft.nationality);
        if (draft.pac) setOnboardPac(draft.pac);
        if (draft.sho) setOnboardSho(draft.sho);
        if (draft.pas) setOnboardPas(draft.pas);
        if (draft.dri) setOnboardDri(draft.dri);
        if (draft.def) setOnboardDef(draft.def);
        if (draft.phy) setOnboardPhy(draft.phy);
        if (draft.avatar) setOnboardAvatar(draft.avatar);
        if (draft.theme) setOnboardTheme(draft.theme);
      }
    } catch (e) {
      console.error("Failed to read onboarding draft from localStorage:", e);
    }
  }, [activeUser]);

  // Onboarding draft auto-saver
  useEffect(() => {
    if (!activeUser || !activeUser.email || !showOnboarding) return;
    
    try {
      const draft = {
        step: onboardingStep,
        position: onboardPosition,
        club: onboardClub,
        nationality: onboardNationality,
        pac: onboardPac,
        sho: onboardSho,
        pas: onboardPas,
        dri: onboardDri,
        def: onboardDef,
        phy: onboardPhy,
        avatar: onboardAvatar,
        theme: onboardTheme
      };
      
      localStorage.setItem('futcard_onboarding_draft_' + activeUser.email, JSON.stringify(draft));
    } catch (e) {
      console.error("Failed to save onboarding draft to localStorage:", e);
    }
  }, [
    onboardingStep,
    onboardPosition,
    onboardClub,
    onboardNationality,
    onboardPac,
    onboardSho,
    onboardPas,
    onboardDri,
    onboardDef,
    onboardPhy,
    onboardAvatar,
    onboardTheme,
    activeUser,
    showOnboarding
  ]);

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

  // Auth: Handle Sign In via Express JWT login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await response.json();
      if (response.ok) {
        sessionStorage.setItem('futcard_active_admin', JSON.stringify(data.user));
        sessionStorage.setItem('futcard_jwt', data.token);
        setAuthToken(data.token);
        setActiveUser(data.user);
        setLoginEmail('');
        setLoginPassword('');
        setLoginError('');
      } else {
        throw new Error(data.error || 'Credenciales incorrectas.');
      }
    } catch (err) {
      setLoginShake(true);
      setLoginError(err.message || 'Error al conectar con el servidor.');
      setTimeout(() => setLoginShake(false), 500);
    }
  };

  // Auth: Simple Register
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
      setRegisterError('Completa todos los campos obligatorios.');
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('Las contraseñas no coinciden.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: registerName, email: registerEmail, password: registerPassword, role: registerRole, nickname: registerNickname })
      });
      const result = await res.json();
      if (res.ok) {
        // Auto login after successful registration
        const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: registerEmail, password: registerPassword })
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          sessionStorage.setItem('futcard_active_admin', JSON.stringify(loginData.user));
          sessionStorage.setItem('futcard_jwt', loginData.token);
          setAuthToken(loginData.token);
          setActiveUser(loginData.user);
          if (registerRole === 'Jugador') {
            setShowOnboarding(true);
            setOnboardingStep(1);
          }
          setRegisterName('');
          setRegisterEmail('');
          setRegisterNickname('');
          setRegisterPassword('');
          setRegisterConfirmPassword('');
          setRegisterError('');
          setShowRegister(false);
        }
      } else {
        throw new Error(result.error || 'Registro falló.');
      }
    } catch (err) {
      setRegisterError(err.message);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('futcard_jwt');
    sessionStorage.removeItem('futcard_active_admin');
    setAuthToken('');
    setActiveUser({
      id: 'p-1',
      name: 'Santiago Giménez',
      role: 'player',
    });
  };

  const handleCropApply = () => {
    if (!rawUploadedImage) return;
    const img = new Image();
    img.src = rawUploadedImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');

      // Clear with transparent background
      ctx.clearRect(0, 0, 300, 300);

      const cropBoxSize = 200;
      const destSize = 300;
      const ratio = destSize / cropBoxSize; // 1.5x multiplier

      const w = img.width;
      const h = img.height;
      const minSide = Math.min(w, h);
      const scaleFactor = (cropBoxSize / minSide) * cropZoom;
      const drawW = w * scaleFactor * ratio;
      const drawH = h * scaleFactor * ratio;

      const drawX = (destSize - drawW) / 2 + cropOffsetX * ratio;
      const drawY = (destSize - drawH) / 2 + cropOffsetY * ratio;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      setOnboardAvatar(canvas.toDataURL('image/jpeg', 0.85));
      setRawUploadedImage(null); // Close crop editor
      setCropZoom(1); // Reset
      setCropOffsetX(0);
      setCropOffsetY(0);
    };
  };

  const handleOnboardingSubmit = async () => {
    const calculatedRating = Math.round((parseInt(onboardPac) + parseInt(onboardSho) + parseInt(onboardPas) + parseInt(onboardDri) + parseInt(onboardDef) + parseInt(onboardPhy)) / 6);
    const newPlayer = {
      name: activeUser.name,
      position: onboardPosition,
      rating: calculatedRating,
      club: onboardClub || 'Sin Club',
      nationality: onboardNationality || 'México',
      flag: getCountryFlag(onboardNationality),
      cardTheme: onboardTheme,
      avatar: onboardAvatar,
      skills: {
        pac: { name: "Ritmo", value: parseInt(onboardPac), endorsements: [] },
        sho: { name: "Tiro", value: parseInt(onboardSho), endorsements: [] },
        pas: { name: "Pase", value: parseInt(onboardPas), endorsements: [] },
        dri: { name: "Regate", value: parseInt(onboardDri), endorsements: [] },
        def: { name: "Defensa", value: parseInt(onboardDef), endorsements: [] },
        phy: { name: "Físico", value: parseInt(onboardPhy), endorsements: [] }
      },
      teams: []
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/federation/players`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(newPlayer)
      });
      if (res.ok) {
        // Clear onboarding draft from localStorage!
        localStorage.removeItem('futcard_onboarding_draft_' + activeUser.email);

        // Refetch federation data to include the new player
        const refetchRes = await fetch(`${API_BASE_URL}/api/federation`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (refetchRes.ok) {
          const data = await refetchRes.json();
          setDb(data);
          const newPlayerRecord = data.players.find(p => p.name.toLowerCase() === activeUser.name.toLowerCase());
          if (newPlayerRecord) {
            const updatedUser = {
              ...activeUser,
              id: newPlayerRecord.id,
              role: 'player'
            };
            setActiveUser(updatedUser);
            sessionStorage.setItem('futcard_active_admin', JSON.stringify(updatedUser));
          }
        }
        setShowOnboarding(false);
      } else {
        alert('Error al registrar perfil deportivo.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Find currently shared player
  const sharedPlayer = db.players.find(p => p.id === sharedPlayerId);
  const myPlayerProfile = db.players[0]; // We represent player 1 Santiago

  // If not authenticated and not viewing a shared profile, show login/register UI
  if (!sharedPlayerId && !authToken) {
    return (
      <div className="login-overlay" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px', background: '#0c0f0f' }}>
        <div style={{ marginBottom: '24px', fontSize: '28px', fontWeight: 'bold', letterSpacing: '1px', color: '#fff', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚽ FutCard <span style={{ color: 'var(--primary)', fontWeight: '400', fontSize: '22px' }}>Pro</span>
        </div>
        {showRegister ? (
          <div className={`login-card ${loginShake ? 'shake-effect' : ''}`} style={{ width: '100%', maxWidth: '360px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', borderRadius: '8px' }}>
            <h2 style={{ color: '#fff', marginBottom: '16px', fontSize: '24px', fontFamily: 'var(--font-heading)' }}>Registro</h2>
            {registerError && <span className="error" style={{ color: '#ef4444', fontSize: '12px', display: 'block', marginBottom: '12px' }}>{registerError}</span>}
            <input placeholder="Nombre" value={registerName} onChange={e => setRegisterName(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px' }} />
            <input placeholder="Email" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px' }} />
            <input placeholder="Apodo (Opcional)" value={registerNickname} onChange={e => setRegisterNickname(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px' }} />
            
            <div style={{ position: 'relative', width: '100%', marginBottom: '12px' }}>
              <input
                type={showRegisterPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={registerPassword}
                onChange={e => setRegisterPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 40px 10px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px' }}
              />
              <button
                type="button"
                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
              >
                {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div style={{ position: 'relative', width: '100%', marginBottom: '12px' }}>
              <input
                type={showRegisterConfirmPassword ? 'text' : 'password'}
                placeholder="Confirmar Contraseña"
                value={registerConfirmPassword}
                onChange={e => setRegisterConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 40px 10px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px' }}
              />
              <button
                type="button"
                onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
              >
                {showRegisterConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <select value={registerRole} onChange={e => setRegisterRole(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '16px', background: '#121414', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px' }}>
              <option>Jugador</option>
              <option>DT</option>
              <option>Árbitro</option>
            </select>
            <button onClick={handleRegister} className="btn-primary" style={{ width: '100%', padding: '12px', marginBottom: '10px' }}>Crear Cuenta</button>
            <button onClick={() => setShowRegister(false)} className="btn-secondary" style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>Volver a Login</button>
          </div>
        ) : (
          <div className={`login-card ${loginShake ? 'shake-effect' : ''}`} style={{ width: '100%', maxWidth: '360px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', borderRadius: '8px' }}>
            <h2 style={{ color: '#fff', marginBottom: '16px', fontSize: '24px', fontFamily: 'var(--font-heading)' }}>Iniciar Sesión</h2>
            {loginError && <span className="error" style={{ color: '#ef4444', fontSize: '12px', display: 'block', marginBottom: '12px' }}>{loginError}</span>}
            <input placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px' }} />
            
            <div style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
              <input
                type={showLoginPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 40px 10px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px' }}
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
              >
                {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button onClick={handleLogin} className="btn-primary" style={{ width: '100%', padding: '12px', marginBottom: '10px' }}>Entrar</button>
            <button onClick={() => setShowRegister(true)} className="btn-secondary" style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>Crear Cuenta</button>
          </div>
        )}
      </div>
    );
  }

  if (showOnboarding) {
    const tempPlayerPreview = {
      name: activeUser.name,
      position: onboardPosition,
      club: onboardClub || 'Tu Club',
      nationality: onboardNationality || 'México',
      flag: getCountryFlag(onboardNationality),
      cardTheme: onboardTheme,
      avatar: onboardAvatar,
      skills: {
        pac: { name: 'Ritmo', value: parseInt(onboardPac) },
        sho: { name: 'Tiro', value: parseInt(onboardSho) },
        pas: { name: 'Pase', value: parseInt(onboardPas) },
        dri: { name: 'Regate', value: parseInt(onboardDri) },
        def: { name: 'Defensa', value: parseInt(onboardDef) },
        phy: { name: 'Físico', value: parseInt(onboardPhy) }
      }
    };

    const calculatedRating = Math.round((parseInt(onboardPac) + parseInt(onboardSho) + parseInt(onboardPas) + parseInt(onboardDri) + parseInt(onboardDef) + parseInt(onboardPhy)) / 6);

    return (
      <div className="login-overlay" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '100vh', padding: 'max(45px, env(safe-area-inset-top) + 10px) 12px max(30px, env(safe-area-inset-bottom) + 10px) 12px', background: '#0c0f0f', overflowY: 'auto' }}>
        <div style={{ marginBottom: '16px', fontSize: '22px', fontWeight: 'bold', color: '#fff', fontFamily: 'var(--font-heading)', textAlign: 'center', width: '100%' }}>
          ⚽ Creando tu Perfil de Jugador
        </div>

        <div className="glass-panel" style={{ width: '100%', maxWidth: '390px', padding: '20px 16px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
          
          {/* Progress Indicator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '11px', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>PASO {onboardingStep} DE 4</span>
            <div style={{ display: 'flex', gap: '4px', flex: 1, marginLeft: '12px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${(onboardingStep / 4) * 100}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }} />
            </div>
          </div>

          {/* STEP 1: Personal Info */}
          {onboardingStep === 1 && (
            <div>
              <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>1. Información Básica</h3>
              
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Posición de Juego</label>
              <select value={onboardPosition} onChange={e => setOnboardPosition(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '14px', background: '#121414', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px' }}>
                <option>DEL</option>
                <option>MCO</option>
                <option>MC</option>
                <option>DFC</option>
                <option>LI</option>
                <option>LD</option>
                <option>POR</option>
              </select>

              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Nombre de tu Club</label>
              <input placeholder="Ej. Feyenoord, Cruz Azul, FMF FC" value={onboardClub} onChange={e => setOnboardClub(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px' }} />

              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Nacionalidad</label>
              <input placeholder="Ej. México" value={onboardNationality} onChange={e => setOnboardNationality(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px' }} />

              <button onClick={() => setOnboardingStep(2)} className="btn-primary" style={{ width: '100%', padding: '12px' }}>Continuar</button>
            </div>
          )}

          {/* STEP 2: Stats Skills Sliders */}
          {onboardingStep === 2 && (
            <div>
              <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '14px', fontFamily: 'var(--font-heading)' }}>2. Estadísticas & Habilidades</h3>
              
              {/* Calculated Rating Live Display */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '13px', color: '#fff', fontWeight: 'bold' }}>Media Global</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: 'var(--text-muted)' }}>Cálculo automático de tus sliders</p>
                </div>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, #10b981 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(195, 244, 0, 0.4)', border: '2px solid #fff' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#121414', fontFamily: 'var(--font-heading)' }}>{calculatedRating}</span>
                </div>
              </div>

              {[
                { label: 'Ritmo (RIT)', val: onboardPac, setVal: setOnboardPac },
                { label: 'Tiro (TIR)', val: onboardSho, setVal: setOnboardSho },
                { label: 'Pase (PAS)', val: onboardPas, setVal: setOnboardPas },
                { label: 'Regate (REG)', val: onboardDri, setVal: setOnboardDri },
                { label: 'Defensa (DEF)', val: onboardDef, setVal: setOnboardDef },
                { label: 'Físico (FIS)', val: onboardPhy, setVal: setOnboardPhy }
              ].map((s, idx) => (
                <div key={idx} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    <span>{s.label}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{s.val}</span>
                  </div>
                  <input type="range" min="10" max="99" value={s.val} onChange={e => s.setVal(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                </div>
              ))}

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={() => setOnboardingStep(1)} className="btn-secondary" style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff' }}>Atrás</button>
                <button onClick={() => setOnboardingStep(3)} className="btn-primary" style={{ flex: 2, padding: '10px' }}>Continuar</button>
              </div>
            </div>
          )}

          {/* STEP 3: Avatar Photo URL & Theme selection */}
          {onboardingStep === 3 && (
            <div>
              <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>3. Foto & Estilo de Tarjeta</h3>

              {rawUploadedImage ? (
                /* Custom shape crop editor (Hides the rest of step 3 to save space) */
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#fff', fontWeight: 'bold', width: '100%', textAlign: 'left', fontFamily: 'var(--font-heading)' }}>Ajustar Encuadre de tu Foto</h4>
                  
                  {/* Interactive Mask Frame with Silhouette overlay (increased size to 250px) */}
                  <div style={{ width: '250px', height: '250px', borderRadius: '12px', border: '2px solid var(--primary)', background: '#121414', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(195, 244, 0, 0.2)', marginBottom: '12px' }}>
                    
                    {/* Raw image applying CSS transforms */}
                    <img 
                      src={rawUploadedImage} 
                      alt="En edición" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        pointerEvents: 'none', 
                        transform: `translate(${cropOffsetX}px, ${cropOffsetY}px) scale(${cropZoom})`, 
                        transition: 'transform 0.1s ease-out' 
                      }} 
                    />
                    
                    {/* Silhouette shape overlay guide (head and shoulders contour) */}
                    <svg viewBox="0 0 100 100" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
                      {/* Semi-transparent overlay outside the outline */}
                      <path d="M0,0 H100 V100 H0 Z M50,15 C41.7,15 35,21.7 35,30 C35,38.3 41.7,45 50,45 C58.3,45 65,38.3 65,30 C65,21.7 58.3,15 50,15 Z M15,85 C15,69.5 27.5,57 43,55.5 C43.5,55.4 44,55 44,54.5 V48 C42,47 41,45 41,42 C41,40 42,39 42,39 C42,39 43,35 43,32 H57 C57,35 58,39 58,39 C58,39 59,40 59,42 C59,45 58,47 56,48 V54.5 C56,55 56.5,55.4 57,55.5 C72.5,57 85,69.5 85,85 Z" fill="rgba(12,15,15,0.7)" fillRule="evenodd" />
                      {/* Glowing neon outline border */}
                      <path d="M50,15 C41.7,15 35,21.7 35,30 C35,38.3 41.7,45 50,45 C58.3,45 65,38.3 65,30 C65,21.7 58.3,15 50,15 Z M15,85 C15,69.5 27.5,57 43,55.5 C43.5,55.4 44,55 44,54.5 V48 C42,47 41,45 41,42 C41,40 42,39 42,39 C42,39 43,35 43,32 H57 C57,35 58,39 58,39 C58,39 59,40 59,42 C59,45 58,47 56,48 V54.5 C56,55 56.5,55.4 57,55.5 C72.5,57 85,69.5 85,85 Z" stroke="var(--primary)" strokeWidth="1.5" stroke-dasharray="3,3" fill="none" style={{ filter: 'drop-shadow(0 0 5px var(--primary))' }} />
                    </svg>
                  </div>
                  
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: '0 0 14px 0', textAlign: 'center' }}>
                    Ajusta tu rostro y hombros dentro del contorno neón usando los controles inferiores:
                  </p>

                  {/* Scale/Zoom Control */}
                  <div style={{ width: '100%', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      <span>Zoom (Ajustar Tamaño)</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{Math.round(cropZoom * 100)}%</span>
                    </div>
                    <input type="range" min="0.5" max="3.0" step="0.1" value={cropZoom} onChange={e => setCropZoom(parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                  </div>

                  {/* Move Horizontal Control */}
                  <div style={{ width: '100%', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      <span>Mover Horizontal</span>
                      <span style={{ color: 'var(--primary)' }}>{cropOffsetX}px</span>
                    </div>
                    <input type="range" min="-120" max="120" value={cropOffsetX} onChange={e => setCropOffsetX(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                  </div>

                  {/* Move Vertical Control */}
                  <div style={{ width: '100%', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      <span>Mover Vertical</span>
                      <span style={{ color: 'var(--primary)' }}>{cropOffsetY}px</span>
                    </div>
                    <input type="range" min="-120" max="120" value={cropOffsetY} onChange={e => setCropOffsetY(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                  </div>

                  {/* Button Actions */}
                  <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    <button 
                      onClick={() => setRawUploadedImage(null)} 
                      className="btn-secondary" 
                      style={{ flex: 1, padding: '10px', fontSize: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff' }}
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleCropApply} 
                      className="btn-primary" 
                      style={{ flex: 2, padding: '10px', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      ✂️ Guardar Recorte
                    </button>
                  </div>
                </div>
              ) : isCameraActive ? (
                /* Live Camera Feed inside the App with Silhouette Overlay (Hides rest of Step 3) */
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#fff', fontWeight: 'bold', width: '100%', textAlign: 'left', fontFamily: 'var(--font-heading)' }}>Encuadra tu Foto</h4>
                  
                  {/* Video viewport with neon contour guide overlay (increased size to 250px) */}
                  <div style={{ width: '250px', height: '250px', borderRadius: '12px', border: '2px solid var(--primary)', background: '#000', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(195, 244, 0, 0.3)', marginBottom: '12px' }}>
                    
                    {/* Live HTML5 video element */}
                    <video 
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        transform: 'scaleX(-1)' // Mirror video feed live
                      }} 
                    />
                    
                    {/* Silhouette shape overlay guide (head and shoulders contour) */}
                    <svg viewBox="0 0 100 100" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
                      {/* Semi-transparent overlay outside the outline */}
                      <path d="M0,0 H100 V100 H0 Z M50,15 C41.7,15 35,21.7 35,30 C35,38.3 41.7,45 50,45 C58.3,45 65,38.3 65,30 C65,21.7 58.3,15 50,15 Z M15,85 C15,69.5 27.5,57 43,55.5 C43.5,55.4 44,55 44,54.5 V48 C42,47 41,45 41,42 C41,40 42,39 42,39 C42,39 43,35 43,32 H57 C57,35 58,39 58,39 C58,39 59,40 59,42 C59,45 58,47 56,48 V54.5 C56,55 56.5,55.4 57,55.5 C72.5,57 85,69.5 85,85 Z" fill="rgba(12,15,15,0.7)" fillRule="evenodd" />
                      {/* Glowing neon outline border */}
                      <path d="M50,15 C41.7,15 35,21.7 35,30 C35,38.3 41.7,45 50,45 C58.3,45 65,38.3 65,30 C65,21.7 58.3,15 50,15 Z M15,85 C15,69.5 27.5,57 43,55.5 C43.5,55.4 44,55 44,54.5 V48 C42,47 41,45 41,42 C41,40 42,39 42,39 C42,39 43,35 43,32 H57 C57,35 58,39 58,39 C58,39 59,40 59,42 C59,45 58,47 56,48 V54.5 C56,55 56.5,55.4 57,55.5 C72.5,57 85,69.5 85,85 Z" stroke="var(--primary)" strokeWidth="1.5" stroke-dasharray="3,3" fill="none" style={{ filter: 'drop-shadow(0 0 5px var(--primary))' }} />
                    </svg>
                  </div>
                  
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: '0 0 16px 0', textAlign: 'center' }}>
                    Sitúate frente a la cámara y alinea tu cabeza y hombros con la silueta antes de capturar.
                  </p>
                  
                  {/* Camera action buttons */}
                  <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    <button 
                      onClick={stopCamera} 
                      className="btn-secondary" 
                      style={{ flex: 1, padding: '10px', fontSize: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff' }}
                    >
                      ✕ Cancelar
                    </button>
                    <button 
                      onClick={capturePhoto} 
                      className="btn-primary" 
                      style={{ flex: 2, padding: '10px', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      📸 Capturar Foto
                    </button>
                  </div>
                </div>
              ) : (
                /* Normal Upload Choice Panel (Only visible when neither camera nor cropper is active) */
                <>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Foto de tu Ficha</label>
                  
                  {onboardAvatar ? (
                    /* Display current avatar with option to remove */
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '18px', marginBottom: '14px', position: 'relative', textAlign: 'center' }}>
                      <div style={{ position: 'relative', zIndex: 12 }}>
                        <img src={onboardAvatar} alt="Foto cargada" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)', boxShadow: '0 0 12px rgba(195, 244, 0, 0.4)', marginBottom: '8px' }} />
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOnboardAvatar(''); }} 
                          style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', border: 'none', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }}
                        >
                          ✕
                        </button>
                        <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '500', display: 'block' }}>¡Imagen Cargada!</span>
                      </div>
                    </div>
                  ) : (
                    /* Clean Choice Stack: Live Camera vs Gallery Selector */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {/* Option A: In-app Live Camera */}
                        <button
                          type="button"
                          onClick={startCamera}
                          className="btn-primary"
                          style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', borderRadius: '8px', cursor: 'pointer' }}
                        >
                          <span style={{ fontSize: '22px' }}>🎥</span>
                          <span style={{ fontWeight: 'bold' }}>Cámara en Vivo</span>
                        </button>

                        {/* Option B: Gallery Selector Fallback */}
                        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', borderRadius: '8px' }}>
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ width: '100%', height: '100%', padding: '16px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}
                          >
                            <span style={{ fontSize: '22px' }}>📁</span>
                            <span style={{ fontWeight: 'bold' }}>Galería de Fotos</span>
                          </button>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                if (file.size > 20000000) {
                                  alert("La imagen supera el límite de peso de 20MB.");
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const img = new Image();
                                  img.onload = () => {
                                    const maxDim = 800;
                                    let width = img.width;
                                    let height = img.height;
                                    if (width > maxDim || height > maxDim) {
                                      if (width > height) {
                                        height = Math.round((height * maxDim) / width);
                                        width = maxDim;
                                      } else {
                                        width = Math.round((width * maxDim) / height);
                                        height = maxDim;
                                      }
                                    }
                                    const canvas = document.createElement('canvas');
                                    canvas.width = width;
                                    canvas.height = height;
                                    const ctx = canvas.getContext('2d');
                                    ctx.drawImage(img, 0, 0, width, height);
                                    
                                    setRawUploadedImage(canvas.toDataURL('image/jpeg', 0.8));
                                    setCropZoom(1);
                                    setCropOffsetX(0);
                                    setCropOffsetY(0);
                                  };
                                  img.src = event.target.result;
                                };
                                reader.readAsDataURL(file);
                              }
                            }} 
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Extra fallback option to manually type the image URL */}
                  <details style={{ marginBottom: '14px', width: '100%' }}>
                    <summary style={{ fontSize: '10px', color: 'var(--text-muted)', cursor: 'pointer', outline: 'none', textAlign: 'left', padding: '2px 0' }}>¿Prefieres ingresar un enlace URL externo?</summary>
                    <input 
                      placeholder="Ej. https://url-de-tu-foto.com/imagen.png" 
                      value={onboardAvatar.startsWith('data:') ? '' : onboardAvatar} 
                      onChange={e => setOnboardAvatar(e.target.value)} 
                      style={{ width: '100%', padding: '10px', marginTop: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', fontSize: '11px' }} 
                    />
                  </details>

                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Diseño de la Tarjeta</label>
                  <select value={onboardTheme} onChange={e => setOnboardTheme(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px', background: '#121414', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px' }}>
                    {db.backgrounds && db.backgrounds.length > 0 ? (
                      db.backgrounds.filter(b => b.enabled).map(bg => (
                        <option key={bg.id} value={bg.id}>{bg.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="gold">🏆 Oro Clásico</option>
                        <option value="totw">⚡ Equipo de la Semana (TOTW)</option>
                        <option value="future">🌌 Futura Promesa Neon</option>
                        <option value="icon">🎖️ Icono Leyenda Blanca</option>
                      </>
                    )}
                  </select>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button onClick={() => setOnboardingStep(2)} className="btn-secondary" style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff' }}>Atrás</button>
                    <button onClick={() => setOnboardingStep(4)} className="btn-primary" style={{ flex: 2, padding: '10px' }}>Vista Previa</button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 4: Live Card Photo Preview */}
          {onboardingStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '16px', fontFamily: 'var(--font-heading)', width: '100%', textAlign: 'left' }}>4. ¡Tu Tarjeta FutCard Pro!</h3>
              
              {/* Premium Scale-in Blur Entry Animation Style */}
              <style>{`
                @keyframes onboarding-scale-up {
                  0% { transform: scale(0.6); opacity: 0; filter: blur(8px); }
                  100% { transform: scale(0.85); opacity: 1; filter: blur(0); }
                }
                .onboarding-card-animate {
                  animation: onboarding-scale-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                  transform-origin: center center;
                }
              `}</style>

              <div className="onboarding-card-animate" style={{ margin: '-20px 0 -10px 0' }}>
                <PlayerCard player={tempPlayerPreview} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', width: '100%' }}>
                <button onClick={() => setOnboardingStep(3)} className="btn-secondary" style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff' }}>Atrás</button>
                <button onClick={handleOnboardingSubmit} className="btn-primary" style={{ flex: 2, padding: '10px' }}>Confirmar y Entrar</button>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      
      {/* 1. Global Navigation Header */}
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="app-logo" style={{ cursor: 'pointer' }} onClick={() => {
          setSharedPlayerId(null);
          window.history.replaceState({}, document.title, window.location.pathname);
          setActiveTab('feed');
        }}>
          ⚽ FutCard <span style={{ fontWeight: '400', fontSize: '13px', marginLeft: '4px', opacity: 0.8 }}>Pro</span>
        </div>
        {authToken && (
          <button onClick={handleLogout} className="btn-logout" style={{ background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.3)', color: '#ff6b6b', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
            Cerrar Sesión
          </button>
        )}
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

                        <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', display: 'flex', justifyContent: 'center' }}>
                          <button 
                            onClick={() => setEndorsePlayerId(p.id)} 
                            className="btn-primary" 
                            style={{ width: '100%', padding: '10px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '4px' }}
                          >
                            <Award size={14} />
                            Avalar Habilidades
                          </button>
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
            Ver Ligas
          </button>
        </nav>
      )}
      {endorsePlayerId && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '24px', position: 'relative', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', background: '#121414' }}>
            <button 
              onClick={() => setEndorsePlayerId(null)} 
              style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '20px', marginBottom: '16px', fontFamily: 'var(--font-heading)', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>Avalar Habilidades</h3>
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <EndorsementSystem
                player={db.players.find(p => p.id === endorsePlayerId)}
                activeUser={activeUser}
                onUpdatePlayer={handleUpdatePlayer}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
