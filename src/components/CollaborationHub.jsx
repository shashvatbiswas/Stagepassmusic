import React, { useState, useEffect } from 'react';
import { collabsAPI, assetsAPI } from '../api/db';
import { PRESET_AVATARS } from '../utils/presets';
import { 
  Users, 
  PlusCircle, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Check, 
  X, 
  Send, 
  Play, 
  Loader2, 
  MessageSquare,
  FileText,
  Search
} from 'lucide-react';

export default function CollaborationHub({ currentUser, onNavigateProfile, onPlayAsset, addToast }) {
  const [collabTab, setCollabTab] = useState('board'); // 'board' | 'post' | 'my-posts'
  const [requests, setRequests] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');

  // Application Modal state
  const [applyingRequestId, setApplyingRequestId] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [selectedDemoId, setSelectedDemoId] = useState('');
  const [userDemos, setUserDemos] = useState([]);

  // New Request Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newRole, setNewRole] = useState('Singer');
  const [newGenre, setNewGenre] = useState('Pop');
  const [newLang, setNewLang] = useState('English');
  const [newBudget, setNewBudget] = useState('5000');
  const [newDeadline, setNewDeadline] = useState('');
  const [newReqs, setNewReqs] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Mock Workspace Active Chats
  const [activeChatCollabId, setActiveChatCollabId] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [mockChats, setMockChats] = useState({});

  const roleOptions = ['Singer', 'Lyricist', 'Producer', 'Songwriter', 'Composer', 'Musician', 'Sound Engineer'];
  const genres = ['Pop', 'Hip-Hop', 'Rap', 'R&B', 'Rock', 'Indie', 'Electronic', 'EDM', 'Jazz', 'Sufi', 'Ghazal', 'Folk', 'Bollywood', 'Lo-fi'];
  const languages = ['English', 'Hindi', 'Urdu', 'Tamil', 'Punjabi', 'Kannada', 'Marathi'];

  useEffect(() => {
    fetchRequests();
    fetchRecommendations();
    fetchUserDemos();
  }, [selectedRole, selectedGenre, selectedLanguage, collabTab]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await collabsAPI.getRequests({
        search: searchQuery,
        role: selectedRole,
        genre: selectedGenre,
        language: selectedLanguage
      });
      setRequests(data);
    } catch (e) {
      addToast('Error loading collaboration board', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const recs = await collabsAPI.getRecommendedCollaborators();
      setRecommended(recs);
    } catch (e) {

    }
  };

  const fetchUserDemos = async () => {
    try {
      const allAssets = await assetsAPI.getAssets({ allowUnlisted: true });
      const userAssets = allAssets.filter(a => a.creatorId === currentUser.username);
      setUserDemos(userAssets);
      if (userAssets.length > 0) {
        setSelectedDemoId(userAssets[0].id);
      }
    } catch (e) {

    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle || !newDesc) {
      addToast('Title and details are required', 'error');
      return;
    }

    setFormLoading(true);
    try {
      await collabsAPI.createRequest({
        title: newTitle,
        description: newDesc,
        requiredRole: newRole,
        genre: newGenre,
        language: newLang,
        budget: parseFloat(newBudget) || 0,
        deadline: newDeadline,
        requirements: newReqs
      });
      addToast('Collaboration offer published', 'success');
      
      setNewTitle('');
      setNewDesc('');
      setNewBudget('5000');
      setNewDeadline('');
      setNewReqs('');
      
      setCollabTab('board');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleApplyClick = (requestId) => {
    setApplyingRequestId(requestId);
    setApplicationMessage('');
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applicationMessage) {
      addToast('Application message required', 'error');
      return;
    }
    try {
      await collabsAPI.applyToCollab(applyingRequestId, selectedDemoId, applicationMessage);
      addToast('Application submitted successfully!', 'success');
      setApplyingRequestId(null);
      fetchRequests();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleManageApplication = async (requestId, applicationId, action) => {
    try {
      await collabsAPI.manageApplication(requestId, applicationId, action);
      addToast(`Application state: ${action}`, 'success');
      fetchRequests();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleSendMessage = (collabId) => {
    if (!chatMessage.trim()) return;
    const key = `collab-${collabId}`;
    const previous = mockChats[key] || [
      { sender: 'System', text: 'StagePass Studio Workspace Online. Coordinate stem formats and split parameters below.', timestamp: Date.now() - 60000 }
    ];
    const updated = [
      ...previous,
      { sender: currentUser.artistName, text: chatMessage, timestamp: Date.now() }
    ];
    
    setMockChats({ ...mockChats, [key]: updated });
    setChatMessage('');
    
    setTimeout(() => {
      setMockChats(prev => ({
        ...prev,
        [key]: [
          ...prev[key],
          { sender: 'Studio Artist', text: 'Royalties split details verified. Ready for checkout.', timestamp: Date.now() }
        ]
      }));
    }, 1200);
  };

  const getChatMessages = (collabId) => {
    const key = `collab-${collabId}`;
    return mockChats[key] || [
      { sender: 'System', text: 'StagePass Studio Workspace Online. Coordinate stem formats and split parameters below.', timestamp: Date.now() - 60000 }
    ];
  };

  return (
    <div style={{ padding: '32px 0 80px 0', zIndex: 1, position: 'relative' }}>
      
      {/* Collabs Header */}
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Collaboration Board
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Coordinate session recordings, split creative rights, and hire vocalists.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="glass-panel" style={{ display: 'flex', padding: '3px', borderRadius: '12px', border: '1.5px solid var(--border-glass)' }}>
          <button
            onClick={() => { setCollabTab('board'); setActiveChatCollabId(null); }}
            className={`btn ${collabTab === 'board' ? 'btn-cyan' : 'btn-secondary'}`}
            style={{ borderRadius: '10px', padding: '6px 14px', fontSize: '11px', height: '30px' }}
          >
            <Users size={13} /> Open Board
          </button>
          <button
            onClick={() => { setCollabTab('my-posts'); setActiveChatCollabId(null); }}
            className={`btn ${collabTab === 'my-posts' ? 'btn-cyan' : 'btn-secondary'}`}
            style={{ borderRadius: '10px', padding: '6px 14px', fontSize: '11px', height: '30px' }}
          >
            Studio Inbox
          </button>
          <button
            onClick={() => { setCollabTab('post'); setActiveChatCollabId(null); }}
            className={`btn ${collabTab === 'post' ? 'btn-cyan' : 'btn-secondary'}`}
            style={{ borderRadius: '10px', padding: '6px 14px', fontSize: '11px', height: '30px' }}
          >
            Post Job
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="container" style={{ display: 'grid', gridTemplateColumns: collabTab === 'board' ? '1fr 300px' : '1fr', gap: '24px', alignItems: 'stretch' }}>
        
        {/* LEFT COLUMN */}
        <div>
          
          {/* BOARD VIEW */}
          {collabTab === 'board' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Board filters */}
              <div className="glass-panel" style={{
                padding: '16px 20px',
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center',
                borderRadius: '16px'
              }}>
                <div style={{ display: 'flex', flex: 1, gap: '8px', background: 'rgba(0, 0, 0, 0.4)', padding: '0 16px', borderRadius: '10px', border: '1.5px solid var(--border-glass)', height: '38px', alignItems: 'center' }}>
                  <Search size={16} style={{ color: 'var(--accent-cyan)' }} />
                  <input 
                    type="text" 
                    placeholder="Search opportunities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '13px', width: '100%' }}
                  />
                </div>

                <select 
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="form-control form-select"
                  style={{ width: '150px', fontSize: '12px', height: '38px', borderRadius: '8px' }}
                >
                  <option value="">All Roles</option>
                  {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>

                <select 
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="form-control form-select"
                  style={{ width: '130px', fontSize: '12px', height: '38px', borderRadius: '8px' }}
                >
                  <option value="">All Genres</option>
                  {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>

                <button onClick={fetchRequests} className="btn btn-primary" style={{ padding: '0 16px', fontSize: '11px', height: '36px', borderRadius: '8px' }}>
                  Filter
                </button>
              </div>

              {/* Collab request cards */}
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                  <Loader2 className="spinning-disc" size={24} color="var(--accent-cyan)" />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {requests.map(req => {
                    const isOwnPost = req.creatorId === currentUser.username;
                    const hasApplied = req.applications.some(app => app.applicantId === currentUser.username);

                    return (
                      <div key={req.id} className="glass-panel glow-purple" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                        
                        {/* Title, Creator metadata */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <img 
                              src={req.creatorAvatar || PRESET_AVATARS[1]} 
                              alt={req.creatorName} 
                              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-glass)' }}
                              onClick={() => onNavigateProfile(req.creatorId)}
                            />
                            <div>
                              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>{req.title}</h4>
                              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                Posted by <span onClick={() => onNavigateProfile(req.creatorId)} style={{ textDecoration: 'underline', cursor: 'pointer', color: '#fff', fontWeight: 600 }}>{req.creatorName}</span>
                              </p>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <span className="badge badge-primary">Needs: {req.requiredRole}</span>
                            <span className="badge badge-dim">{req.genre} • {req.language}</span>
                          </div>
                        </div>

                        {/* Description */}
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                          {req.description}
                        </p>

                        {/* Requirements */}
                        {req.requirements && (
                          <div style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1.5px solid var(--border-glass)' }}>
                            <strong style={{ display: 'block', marginBottom: '4px', fontSize: '10px', color: 'var(--accent-cyan)' }} className="mono">REQUIREMENTS:</strong>
                            <span style={{ color: 'var(--text-main)', fontSize: '12px' }}>{req.requirements}</span>
                          </div>
                        )}

                        {/* Budget & deadline footer */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderTop: '1px solid var(--border-glass)',
                          paddingTop: '16px',
                          flexWrap: 'wrap',
                          gap: '12px'
                        }}>
                          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }} className="mono">
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                              <DollarSign size={14} style={{ color: 'var(--accent-amber)' }} /> Budget: <strong style={{ color: 'var(--accent-cyan)' }}>₹{req.budget}</strong>
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={14} /> Deadline: <strong style={{ color: '#fff' }}>{req.deadline}</strong>
                            </span>
                          </div>

                          {/* Apply triggers */}
                          <div>
                            {isOwnPost ? (
                              <span className="badge badge-dim">Your Post</span>
                            ) : hasApplied ? (
                              <span className="badge badge-secondary">Applied</span>
                            ) : (
                              <button
                                onClick={() => handleApplyClick(req.id)}
                                className="btn btn-cyan"
                                style={{ height: '32px', padding: '0 16px', fontSize: '11px', borderRadius: '8px' }}
                              >
                                Apply / Audition
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}

                  {requests.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No active listings match the filters.
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* MY POSTS / INBOX APPLICATIONS VIEW */}
          {collabTab === 'my-posts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div className="glass-panel" style={{ padding: '28px', textAlign: 'left' }}>
                <h3 className="form-label" style={{ fontSize: '13px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={16} style={{ color: 'var(--accent-cyan)' }} /> Applications & Auditions Received
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {requests
                    .filter(req => req.creatorId === currentUser.username)
                    .map(req => (
                      <div key={req.id} style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px', marginBottom: '12px' }}>
                        <h4 className="mono" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '16px' }}>
                          PROJECT: {req.title.toUpperCase()} ({req.applications.length} applicants)
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '16px' }}>
                          {req.applications.map(app => (
                            <div key={app.id} className="glass-panel" style={{ padding: '16px', background: 'rgba(0,0,0,0.2)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <strong 
                                  onClick={() => onNavigateProfile(app.applicantId)}
                                  style={{ color: 'var(--accent-cyan)', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px' }}
                                >
                                  {app.applicantName} (@{app.applicantId})
                                </strong>
                                <span className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                  {new Date(app.timestamp).toLocaleDateString()}
                                </span>
                              </div>

                              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                                "{app.message}"
                              </p>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                
                                {app.demoAssetId ? (
                                  <button
                                    onClick={async () => {
                                      const asset = await assetsAPI.getAssetById(app.demoAssetId);
                                      if (asset) onPlayAsset(asset);
                                    }}
                                    className="btn btn-secondary"
                                    style={{ height: '28px', padding: '0 10px', fontSize: '10px', borderRadius: '6px' }}
                                  >
                                    ▶ Play Demo
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="mono">No demo attached</span>
                                )}

                                <div style={{ display: 'flex', gap: '8px' }}>
                                  {app.status === 'pending' ? (
                                    <>
                                      <button 
                                        onClick={() => handleManageApplication(req.id, app.id, 'approved')}
                                        className="btn btn-cyan" 
                                        style={{ height: '28px', padding: '0 12px', fontSize: '10px', borderRadius: '6px' }}
                                      >
                                        Approve
                                      </button>
                                      <button 
                                        onClick={() => handleManageApplication(req.id, app.id, 'rejected')}
                                        className="btn btn-burgundy" 
                                        style={{ height: '28px', padding: '0 12px', fontSize: '10px', borderRadius: '6px' }}
                                      >
                                        Decline
                                      </button>
                                    </>
                                  ) : (
                                    <span className="badge badge-dim" style={{ fontSize: '9px' }}>
                                      {app.status.toUpperCase()}
                                    </span>
                                  )}

                                  {app.status === 'approved' && (
                                    <button 
                                      onClick={() => setActiveChatCollabId(app.id)}
                                      className="btn btn-cyan"
                                      style={{ height: '28px', padding: '0 12px', fontSize: '10px', borderRadius: '6px' }}
                                    >
                                      Workspace Chat
                                    </button>
                                  )}
                                </div>

                              </div>

                            </div>
                          ))}

                          {req.applications.length === 0 && (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }} className="mono">No applications received yet.</span>
                          )}
                        </div>
                      </div>
                    ))}

                  {requests.filter(req => req.creatorId === currentUser.username).length === 0 && (
                    <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }} className="mono">
                      You haven't posted any jobs.
                    </div>
                  )}
                </div>
              </div>

              {/* MESSAGING WORKSPACE DISCUSSION */}
              {activeChatCollabId && (
                <div className="glass-panel glow-cyan" style={{ padding: '28px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Workspace Discussion
                    </h3>
                    <button 
                      onClick={() => setActiveChatCollabId(null)}
                      className="btn btn-secondary" 
                      style={{ height: '30px', padding: '0 12px', fontSize: '10px', borderRadius: '6px' }}
                    >
                      Close Chat
                    </button>
                  </div>

                  {/* Chat messages list */}
                  <div style={{
                    height: '240px',
                    overflowY: 'auto',
                    background: 'rgba(0, 0, 0, 0.4)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginBottom: '16px',
                    border: '1.5px solid var(--border-glass)'
                  }}>
                    {getChatMessages(activeChatCollabId).map((msg, i) => (
                      <div 
                        key={i} 
                        style={{
                          alignSelf: msg.sender === 'System' ? 'center' : msg.sender === currentUser.artistName ? 'flex-end' : 'flex-start',
                          background: msg.sender === 'System' ? 'transparent' : msg.sender === currentUser.artistName ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                          border: msg.sender === 'System' ? 'none' : '1px solid var(--border-glass)',
                          color: '#fff',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          maxWidth: '70%'
                        }}
                      >
                        {msg.sender !== 'System' && (
                          <strong style={{ display: 'block', fontSize: '9px', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                            {msg.sender}
                          </strong>
                        )}
                        <span style={{ fontSize: '12.5px' }}>{msg.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="text" 
                      placeholder="Type split guidelines or file parameters..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      className="form-control"
                      style={{ flex: 1, fontSize: '13px', height: '38px', borderRadius: '10px' }}
                      onKeyDown={(e) => { if(e.key === 'Enter') handleSendMessage(activeChatCollabId); }}
                    />
                    <button 
                      onClick={() => handleSendMessage(activeChatCollabId)}
                      className="btn btn-primary"
                      style={{ height: '38px', padding: '0 16px', borderRadius: '10px' }}
                    >
                      <Send size={14} /> Send
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* CREATE POST TAB */}
          {collabTab === 'post' && (
            <div className="glass-panel glow-purple" style={{ padding: '36px', maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
              <h3 className="form-label" style={{ fontSize: '14px', marginBottom: '24px' }}>
                Publish Collaboration Opportunity
              </h3>

              <form onSubmit={handleCreatePost}>
                <div className="form-group">
                  <label className="form-label">Project Title *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Need acoustic guitar stems for Sufi track"
                    className="form-control"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Project Details *</label>
                  <textarea 
                    placeholder="Details about style, split guidelines, and stems required."
                    className="form-control"
                    style={{ height: '100px', resize: 'vertical', paddingTop: '8px' }}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flexWrap: 'wrap' }}>
                  <div className="form-group">
                    <label className="form-label">Role Required</label>
                    <select 
                      className="form-control form-select"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                    >
                      {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Genre</label>
                    <select 
                      className="form-control form-select"
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                    >
                      {genres.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Language</label>
                    <select 
                      className="form-control form-select"
                      value={newLang}
                      onChange={(e) => setNewLang(e.target.value)}
                    >
                      {languages.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Budget (₹ INR)</label>
                    <input 
                      type="number"
                      className="form-control"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Deadline</label>
                  <input 
                    type="date"
                    className="form-control"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Requirements</label>
                  <textarea 
                    placeholder="WAV files access, mics, recording setups..."
                    className="form-control"
                    style={{ height: '70px', resize: 'vertical', paddingTop: '8px' }}
                    value={newReqs}
                    onChange={(e) => setNewReqs(e.target.value)}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', height: '40px', marginTop: '16px', borderRadius: '10px' }}
                  disabled={formLoading}
                >
                  {formLoading ? 'Publishing...' : 'Publish Job Opportunity'}
                </button>
              </form>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Recommendation Sidebar */}
        {collabTab === 'board' && (
          <div>
            <div className="glass-panel glow-cyan" style={{ padding: '20px', textAlign: 'left', borderRadius: '16px' }}>
              <h3 className="mono" style={{
                fontSize: '11px',
                color: 'var(--accent-cyan)',
                marginBottom: '20px',
                fontWeight: 800,
                letterSpacing: '1px'
              }}>
                STUDIO MATCHMAKER
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {recommended.map(rec => (
                  <div 
                    key={rec.username} 
                    style={{
                      borderBottom: '1px solid var(--border-glass)',
                      paddingBottom: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <img 
                        src={rec.profilePhoto} 
                        alt={rec.artistName}
                        style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-glass)' }}
                      />
                      <div>
                        <strong 
                          onClick={() => onNavigateProfile(rec.username)}
                          style={{ color: '#fff', fontSize: '13px', textDecoration: 'underline', cursor: 'pointer', display: 'block', fontWeight: 700 }}
                        >
                          {rec.artistName}
                        </strong>
                        <span className="mono" style={{ fontSize: '9px', color: 'var(--accent-purple)' }}>
                          {rec.roles[0].toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      {rec.bio.substring(0, 50)}...
                    </p>

                    <div className="mono" style={{
                      fontSize: '9.5px',
                      background: 'rgba(0, 240, 255, 0.05)',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid rgba(0, 240, 255, 0.15)',
                      color: 'var(--accent-cyan)'
                    }}>
                      💡 {rec.recommendationReason}
                    </div>

                    <button 
                      onClick={() => onNavigateProfile(rec.username)}
                      className="btn btn-secondary" 
                      style={{ fontSize: '10px', height: '26px', padding: '0 10px', borderRadius: '6px' }}
                    >
                      View Portfolio
                    </button>
                  </div>
                ))}

                {recommended.length === 0 && (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Configure genres and roles in your Profile to load matched creators.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Audition Apply dialog modal popup */}
      {applyingRequestId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(5, 4, 9, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999,
          padding: '20px'
        }}>
          <div className="glass-panel glow-cyan" style={{ width: '100%', maxWidth: '420px', padding: '24px', textAlign: 'left', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>Apply for Collaboration</h3>
              <button onClick={() => setApplyingRequestId(null)} className="modal-close">✕</button>
            </div>

            <form onSubmit={handleApplySubmit}>
              <div className="form-group">
                <label className="form-label">Application details *</label>
                <textarea 
                  placeholder="Introduce yourself, your setup, and BPM suitability..."
                  className="form-control"
                  style={{ height: '80px', resize: 'vertical', paddingTop: '8px', borderRadius: '8px' }}
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  required
                />
              </div>

              {userDemos.length > 0 && (
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Attach Portfolio Track</label>
                  <select 
                    value={selectedDemoId}
                    onChange={(e) => setSelectedDemoId(e.target.value)}
                    className="form-control form-select"
                    style={{ borderRadius: '8px' }}
                  >
                    {userDemos.map(d => (
                      <option key={d.id} value={d.id}>{d.title} ({d.type})</option>
                    ))}
                  </select>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '38px', borderRadius: '10px' }}>
                Submit Audition
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
