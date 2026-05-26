import React, { useState } from 'react';
import { ShieldAlert, Plus, Trash2, Edit2, CheckCircle2, XCircle, UserPlus, Save, ToggleLeft, ToggleRight } from 'lucide-react';

const AdminPanel = ({
  db,
  onUpdatePlayer,
  onUpdateDT,
  onUpdateReferee,
  onCreateUser,
  onDeleteUser
}) => {
  const [activeSubTab, setActiveSubTab] = useState('list'); // list, create
  const [selectedRole, setSelectedRole] = useState('player'); // player, dt, referee
  
  // New User Form States
  const [formData, setFormData] = useState({
    name: '',
    club: '',
    position: 'DEL',
    nationality: 'México',
    flag: 'https://flagcdn.com/w40/mx.png',
    cardTheme: 'gold',
    aiPrompt: 'Fondo neón deportivo místico',
    
    // DT Specs
    tacticalStyle: 'Presión Alta (Gegenpressing)',
    formation: '4-3-3',
    experience: '',
    certifications: 'Licencia Pro',
    
    // Referee Specs
    category: 'Árbitro Central',
    matches: '120 Partidos',
    yellowCards: '4.2',
    redCards: '0.25',
    physicalLevel: 'Élite Clase A',
    
    // Skills values
    pac: 75,
    sho: 75,
    pas: 75,
    dri: 75,
    def: 75,
    phy: 75
  });

  const [editingUserId, setEditingUserId] = useState(null);

  const handleCreateOrUpdateUser = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingUserId) {
      // Handle User Update
      const role = selectedRole;
      if (role === 'player') {
        const originalPlayer = db.players.find(p => p.id === editingUserId);
        const updatedPlayer = {
          ...originalPlayer,
          name: formData.name,
          club: formData.club,
          position: formData.position,
          cardTheme: formData.cardTheme,
          skills: {
            pac: { name: 'Ritmo', value: parseInt(formData.pac) || 75, endorsements: originalPlayer.skills?.pac?.endorsements || [] },
            sho: { name: 'Tiro', value: parseInt(formData.sho) || 75, endorsements: originalPlayer.skills?.sho?.endorsements || [] },
            pas: { name: 'Pase', value: parseInt(formData.pas) || 75, endorsements: originalPlayer.skills?.pas?.endorsements || [] },
            dri: { name: 'Regate', value: parseInt(formData.dri) || 75, endorsements: originalPlayer.skills?.dri?.endorsements || [] },
            def: { name: 'Defensa', value: parseInt(formData.def) || 75, endorsements: originalPlayer.skills?.def?.endorsements || [] },
            phy: { name: 'Físico', value: parseInt(formData.phy) || 75, endorsements: originalPlayer.skills?.phy?.endorsements || [] }
          }
        };
        onUpdatePlayer(updatedPlayer);
      } else if (role === 'dt') {
        const originalDt = db.dts.find(d => d.id === editingUserId);
        const updatedDts = db.dts.map(d => d.id === editingUserId ? {
          ...originalDt,
          name: formData.name,
          tacticalStyle: formData.tacticalStyle,
          formation: formData.formation,
          certifications: formData.certifications,
          experience: formData.experience
        } : d);
        onUpdateDT(updatedDts);
      } else if (role === 'referee') {
        const originalRef = db.referees.find(r => r.id === editingUserId);
        const updatedReferees = db.referees.map(r => r.id === editingUserId ? {
          ...originalRef,
          name: formData.name,
          category: formData.category,
          matches: formData.matches,
          yellowCards: formData.yellowCards,
          redCards: formData.redCards,
          physicalLevel: formData.physicalLevel
        } : r);
        onUpdateReferee(updatedReferees);
      }
      setEditingUserId(null);
    } else {
      // Handle New User Creation
      const uniqueId = `${selectedRole === 'player' ? 'p' : selectedRole === 'dt' ? 'dt' : 'ref'}-${Date.now()}`;
      let newUser = {
        id: uniqueId,
        name: formData.name,
        avatar: '',
      };

      if (selectedRole === 'player') {
        newUser = {
          ...newUser,
          position: formData.position,
          club: formData.club || 'Libre',
          nationality: formData.nationality,
          flag: formData.flag,
          cardTheme: formData.cardTheme,
          aiPrompt: formData.aiPrompt,
          skills: {
            pac: { name: 'Ritmo', value: parseInt(formData.pac) || 75, endorsements: [] },
            sho: { name: 'Tiro', value: parseInt(formData.sho) || 75, endorsements: [] },
            pas: { name: 'Pase', value: parseInt(formData.pas) || 75, endorsements: [] },
            dri: { name: 'Regate', value: parseInt(formData.dri) || 75, endorsements: [] },
            def: { name: 'Defensa', value: parseInt(formData.def) || 75, endorsements: [] },
            phy: { name: 'Físico', value: parseInt(formData.phy) || 75, endorsements: [] }
          },
          teams: []
        };
      } else if (selectedRole === 'dt') {
        newUser = {
          ...newUser,
          tacticalStyle: formData.tacticalStyle,
          formation: formData.formation,
          certifications: formData.certifications,
          experience: formData.experience || 'Sin trayectoria cargada',
          verifiedLeagues: []
        };
      } else if (selectedRole === 'referee') {
        newUser = {
          ...newUser,
          category: formData.category,
          matches: formData.matches || '0 Partidos',
          yellowCards: formData.yellowCards || '4.0',
          redCards: formData.redCards || '0.2',
          physicalLevel: formData.physicalLevel,
          verifiedLeagues: []
        };
      }

      onCreateUser(selectedRole, newUser);
    }

    // Reset Form
    setFormData({
      name: '', club: '', position: 'DEL', nationality: 'México', flag: 'https://flagcdn.com/w40/mx.png', cardTheme: 'gold', aiPrompt: 'Fondo neón deportivo místico',
      tacticalStyle: 'Presión Alta (Gegenpressing)', formation: '4-3-3', experience: '', certifications: 'Licencia Pro',
      category: 'Árbitro Central', matches: '120 Partidos', yellowCards: '4.2', redCards: '0.25', physicalLevel: 'Élite Clase A',
      pac: 75, sho: 75, pas: 75, dri: 75, def: 75, phy: 75
    });
    setActiveSubTab('list');
  };

  const handleEditClick = (user, roleType) => {
    setSelectedRole(roleType);
    setEditingUserId(user.id);
    setActiveSubTab('create');

    if (roleType === 'player') {
      setFormData({
        name: user.name,
        club: user.club,
        position: user.position || 'DEL',
        cardTheme: user.cardTheme || 'gold',
        pac: user.skills?.pac?.value || 75,
        sho: user.skills?.sho?.value || 75,
        pas: user.skills?.pas?.value || 75,
        dri: user.skills?.dri?.value || 75,
        def: user.skills?.def?.value || 75,
        phy: user.skills?.phy?.value || 75
      });
    } else if (roleType === 'dt') {
      setFormData({
        name: user.name,
        tacticalStyle: user.tacticalStyle,
        formation: user.formation,
        certifications: user.certifications,
        experience: user.experience
      });
    } else if (roleType === 'referee') {
      setFormData({
        name: user.name,
        category: user.category,
        matches: user.matches,
        yellowCards: user.yellowCards,
        redCards: user.redCards,
        physicalLevel: user.physicalLevel
      });
    }
  };

  const handleToggleVerification = (user, roleType) => {
    if (roleType === 'dt') {
      const currentVerified = user.verifiedLeagues || [];
      const isVerified = currentVerified.includes('liga-1');
      const nextVerified = isVerified 
        ? currentVerified.filter(id => id !== 'liga-1')
        : [...currentVerified, 'liga-1'];
      const updatedDts = db.dts.map(d => d.id === user.id ? { ...d, verifiedLeagues: nextVerified } : d);
      onUpdateDT(updatedDts);
    } else if (roleType === 'referee') {
      const currentVerified = user.verifiedLeagues || [];
      const isVerified = currentVerified.includes('liga-1');
      const nextVerified = isVerified 
        ? currentVerified.filter(id => id !== 'liga-1')
        : [...currentVerified, 'liga-1'];
      const updatedReferees = db.referees.map(r => r.id === user.id ? { ...r, verifiedLeagues: nextVerified } : r);
      onUpdateReferee(updatedReferees);
    }
  };

  return (
    <div style={{ paddingBottom: '32px' }}>
      <h2 className="section-title">
        <ShieldAlert size={18} color="var(--primary)" />
        Portal Administrativo
      </h2>

      {/* Admin sub-routing switcher */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '18px', background: 'rgba(255,255,255,0.02)', padding: '4px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '2px' }}>
        <button
          onClick={() => { setActiveSubTab('list'); setEditingUserId(null); }}
          className="btn-secondary"
          style={{ flex: 1, padding: '8px 4px', fontSize: '11px', background: activeSubTab === 'list' ? 'var(--primary)' : 'transparent', color: activeSubTab === 'list' ? '#121414' : 'var(--text-primary)', border: 'none', borderStyle: 'none', fontFamily: 'var(--font-heading)', fontStyle: 'italic' }}
        >
          Lista de Usuarios
        </button>
        <button
          onClick={() => setActiveSubTab('create')}
          className="btn-secondary"
          style={{ flex: 1, padding: '8px 4px', fontSize: '11px', background: activeSubTab === 'create' ? 'var(--primary)' : 'transparent', color: activeSubTab === 'create' ? '#121414' : 'var(--text-primary)', border: 'none', borderStyle: 'none', fontFamily: 'var(--font-heading)', fontStyle: 'italic' }}
        >
          {editingUserId ? 'Editar Usuario' : 'Registrar Nuevo'}
        </button>
      </div>

      {/* SUB-PANEL 1: Users table database view */}
      {activeSubTab === 'list' && (
        <div className="glass-panel" style={{ padding: '14px 10px' }}>
          <h3 style={{ fontSize: '14px', fontFamily: 'var(--font-heading)', marginBottom: '12px' }}>
            Base de Datos de Usuarios ({db.players.length + db.dts.length + db.referees.length})
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--primary)' }}>
                  <th style={{ textAlign: 'left', padding: '6px 4px' }}>NOMBRE</th>
                  <th style={{ textAlign: 'left', padding: '6px 4px' }}>ROL</th>
                  <th style={{ textAlign: 'center', padding: '6px 4px' }}>ESTADO</th>
                  <th style={{ textAlign: 'right', padding: '6px 4px' }}>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {/* 1. Players Rows */}
                {db.players.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '8px 4px', fontWeight: '700', color: '#fff' }}>{p.name}</td>
                    <td style={{ padding: '8px 4px', color: 'var(--accent-gold)' }}>JUGADOR ({p.position})</td>
                    <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                      <span style={{ color: 'var(--primary)' }}>Activo</span>
                    </td>
                    <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleEditClick(p, 'player')} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer' }}>
                          <Edit2 size={12} />
                        </button>
                        {db.players.length > 1 && (
                          <button onClick={() => onDeleteUser('player', p.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {/* 2. DTs Rows */}
                {db.dts.map(d => {
                  const isVerified = d.verifiedLeagues?.includes('liga-1');
                  return (
                    <tr key={d.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '8px 4px', fontWeight: '700', color: '#fff' }}>{d.name}</td>
                      <td style={{ padding: '8px 4px', color: '#34d399' }}>DT / COACH</td>
                      <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleToggleVerification(d, 'dt')}
                          style={{ background: 'none', border: 'none', color: isVerified ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}
                        >
                          {isVerified ? <CheckCircle2 size={14} fill="rgba(195,244,0,0.1)" /> : <XCircle size={14} />}
                        </button>
                      </td>
                      <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleEditClick(d, 'dt')} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer' }}>
                            <Edit2 size={12} />
                          </button>
                          {db.dts.length > 1 && (
                            <button onClick={() => onDeleteUser('dt', d.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* 3. Referees Rows */}
                {db.referees.map(r => {
                  const isVerified = r.verifiedLeagues?.includes('liga-1');
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '8px 4px', fontWeight: '700', color: '#fff' }}>{r.name}</td>
                      <td style={{ padding: '8px 4px', color: 'var(--accent-cyan)' }}>ÁRBITRO</td>
                      <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleToggleVerification(r, 'referee')}
                          style={{ background: 'none', border: 'none', color: isVerified ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}
                        >
                          {isVerified ? <CheckCircle2 size={14} fill="rgba(195,244,0,0.1)" /> : <XCircle size={14} />}
                        </button>
                      </td>
                      <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleEditClick(r, 'referee')} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer' }}>
                            <Edit2 size={12} />
                          </button>
                          {db.referees.length > 1 && (
                            <button onClick={() => onDeleteUser('referee', r.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-PANEL 2: User Creation Form */}
      {activeSubTab === 'create' && (
        <form onSubmit={handleCreateOrUpdateUser} className="glass-panel">
          <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-heading)', marginBottom: '14px' }}>
            {editingUserId ? 'Editar Credenciales del Usuario' : 'Formulario de Registro Oficial'}
          </h3>

          {/* Role selector switches */}
          {!editingUserId && (
            <div className="form-group">
              <label>Seleccionar Rol del Perfil</label>
              <select
                className="form-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="player">🏃‍♂️ Jugador de Fútbol</option>
                <option value="dt">📋 Director Técnico (DT)</option>
                <option value="referee">🏁 Árbitro de la Liga</option>
              </select>
            </div>
          )}

          {/* Shared attributes */}
          <div className="form-group">
            <label>Nombre del Federado</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej. Marcus Bellingham"
              required
            />
          </div>

          {/* PLAYER Specific metrics */}
          {selectedRole === 'player' && (
            <div>
              <div className="form-row">
                <div className="form-group">
                  <label>Posición</label>
                  <select
                    className="form-select"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  >
                    <option value="POR">POR (Arquero)</option>
                    <option value="DFC">DFC (Defensa Central)</option>
                    <option value="LD">LD (Lateral Derecho)</option>
                    <option value="LI">LI (Lateral Izquierdo)</option>
                    <option value="MCD">MCD (Contención)</option>
                    <option value="MC">MC (Mediocentro)</option>
                    <option value="MCO">MCO (Enganche)</option>
                    <option value="DEL">DEL (Delantero Centro)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Club / Academia</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.club}
                    onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                    placeholder="Ej. London AC"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Tema de la Carta de Jugador</label>
                <select
                  className="form-select"
                  value={formData.cardTheme}
                  onChange={(e) => setFormData({ ...formData, cardTheme: e.target.value })}
                >
                  <option value="gold">FUT Oro Premium</option>
                  <option value="icon">FUT Leyenda / Blanco</option>
                  <option value="totw">Equipo de la Semana (Negro)</option>
                  <option value="future">Futuro Crack (Rosa)</option>
                </select>
              </div>

              {/* Dynamic stats input values */}
              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', marginTop: '12px' }}>
                Estadísticas de Habilidad Base (0 - 99)
              </h4>
              <div className="stat-adjuster-grid" style={{ marginBottom: '14px' }}>
                <div className="stat-adjuster-card">
                  <span className="stat-adjuster-label">RIT</span>
                  <input type="number" className="stat-adjuster-input" value={formData.pac} min="0" max="99" onChange={(e) => setFormData({ ...formData, pac: e.target.value })} />
                </div>
                <div className="stat-adjuster-card">
                  <span className="stat-adjuster-label">TIR</span>
                  <input type="number" className="stat-adjuster-input" value={formData.sho} min="0" max="99" onChange={(e) => setFormData({ ...formData, sho: e.target.value })} />
                </div>
                <div className="stat-adjuster-card">
                  <span className="stat-adjuster-label">PAS</span>
                  <input type="number" className="stat-adjuster-input" value={formData.pas} min="0" max="99" onChange={(e) => setFormData({ ...formData, pas: e.target.value })} />
                </div>
                <div className="stat-adjuster-card">
                  <span className="stat-adjuster-label">REG</span>
                  <input type="number" className="stat-adjuster-input" value={formData.dri} min="0" max="99" onChange={(e) => setFormData({ ...formData, dri: e.target.value })} />
                </div>
                <div className="stat-adjuster-card">
                  <span className="stat-adjuster-label">DEF</span>
                  <input type="number" className="stat-adjuster-input" value={formData.def} min="0" max="99" onChange={(e) => setFormData({ ...formData, def: e.target.value })} />
                </div>
                <div className="stat-adjuster-card">
                  <span className="stat-adjuster-label">FIS</span>
                  <input type="number" className="stat-adjuster-input" value={formData.phy} min="0" max="99" onChange={(e) => setFormData({ ...formData, phy: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {/* DT Specific metrics */}
          {selectedRole === 'dt' && (
            <div>
              <div className="form-row">
                <div className="form-group">
                  <label>Filosofía Táctica</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.tacticalStyle}
                    onChange={(e) => setFormData({ ...formData, tacticalStyle: e.target.value })}
                    placeholder="Ej. Contraataque Directo"
                  />
                </div>
                <div className="form-group">
                  <label>Esquema Fijo</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.formation}
                    onChange={(e) => setFormData({ ...formData, formation: e.target.value })}
                    placeholder="Ej. 4-4-2"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Licencias / Acreditaciones</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.certifications}
                  onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                  placeholder="Ej. Conmebol Elite, UEFA B"
                />
              </div>

              <div className="form-group">
                <label>Experiencia (Clubes y años)</label>
                <textarea
                  className="form-textarea"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="Ej. Pachuca (2020-2022), Cruz Azul (2018)"
                  rows="2"
                />
              </div>
            </div>
          )}

          {/* REFEREE Specific metrics */}
          {selectedRole === 'referee' && (
            <div>
              <div className="form-row">
                <div className="form-group">
                  <label>Categoría Arbitral</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ej. Asistente FIFA"
                  />
                </div>
                <div className="form-group">
                  <label>Partidos Dirigidos</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.matches}
                    onChange={(e) => setFormData({ ...formData, matches: e.target.value })}
                    placeholder="Ej. 120 Partidos"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Amarillas por Partido</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.yellowCards}
                    onChange={(e) => setFormData({ ...formData, yellowCards: e.target.value })}
                    placeholder="Ej. 3.8"
                  />
                </div>
                <div className="form-group">
                  <label>Rojas por Partido</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.redCards}
                    onChange={(e) => setFormData({ ...formData, redCards: e.target.value })}
                    placeholder="Ej. 0.18"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Rendimiento Físico</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.physicalLevel}
                  onChange={(e) => setFormData({ ...formData, physicalLevel: e.target.value })}
                  placeholder="Ej. Élite Clase A"
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ marginTop: '12px' }}>
            <Save size={16} />
            {editingUserId ? 'Guardar Cambios' : 'Registrar Federado'}
          </button>
        </form>
      )}
    </div>
  );
};

export default AdminPanel;
