import React, { useState, useEffect } from 'react';
import { authAPI, assetsAPI, collabsAPI } from '../api/db';
import { PRESET_AVATARS } from '../utils/presets';
import { 
  User, 
  MapPin, 
  Globe, 
  Link2, 
  FileText, 
  Lock, 
  Unlock, 
  Edit, 
  Sliders, 
  Loader2,
  Award,
  Users
} from 'lucide-react';

export default function Profile({ 
  currentUser, 
  profileUsername, 
  onPlayAsset, 
  playingAsset, 
  isPlaying, 
  onNavigateProfile,
  onPurchaseSuccess,
  onShowCertificate,
  addToast,
  purchaseTrigger
}) {
  const [profileUser, setProfileUser] = useState(null);
  const [userAssets, setUserAssets] = useState([]);
  const [userCollabs, setUserCollabs] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [profileTab, setProfileTab] = useState('featured'); // featured, songs, lyrics, beats, collabs, about
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editGenres, setEditGenres] = useState([]);
  const [editLanguages, setEditLanguages] = useState([]);
  const [editWebsite, setEditWebsite] = useState('');
  const [editYoutube, setEditYoutube] = useState('');
  const [editCollabStatus, setEditCollabStatus] = useState(true);
  const [editLoading, setEditLoading] = useState(false);

  const isOwnProfile = currentUser.username === profileUsername;

  const genresList = ['Pop', 'Hip-Hop', 'Rap', 'R&B', 'Rock', 'Indie', 'Electronic', 'EDM', 'Jazz', 'Sufi', 'Ghazal', 'Folk', 'Bollywood', 'Lo-fi'];
  const languagesList = ['English', 'Hindi', 'Urdu', 'Tamil', 'Punjabi', 'Kannada', 'Marathi'];

  useEffect(() => {
    setIsEditing(false);
    fetchProfileData();
  }, [profileUsername, purchaseTrigger]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const user = await authAPI.getUserByUsername(profileUsername);
      if (!user) {
        addToast('Artist profile not found', 'error');
        return;
      }
      setProfileUser(user);
      setIsFollowing(user.followers.includes(currentUser.username));

      // Fetch assets
      const allAssets = await assetsAPI.getAssets({ allowUnlisted: isOwnProfile });
      const filteredAssets = allAssets.filter(a => a.creatorId === profileUsername);
      setUserAssets(filteredAssets);

      // Fetch Collabs
      const allCollabs = await collabsAPI.getRequests();
      const filteredCollabs = allCollabs.filter(c => c.creatorId === profileUsername);
      setUserCollabs(filteredCollabs);

      // Pre-fill edit forms
      setEditName(user.artistName);
      setEditBio(user.bio);
      setEditLocation(user.location);
      setEditGenres(user.genres || []);
      setEditLanguages(user.languages || []);
      setEditWebsite(user.links.website || '');
      setEditYoutube(user.links.youtube || '');
      setEditCollabStatus(user.isAvailableForCollab);

    } catch (e) {
      addToast('Error loading profile portfolios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      const res = await authAPI.followUser(currentUser.username, profileUsername);
      setIsFollowing(res.isFollowing);
      setProfileUser({
        ...profileUser,
        followers: res.isFollowing 
          ? [...profileUser.followers, currentUser.username]
          : profileUser.followers.filter(u => u !== currentUser.username)
      });
      addToast(res.isFollowing ? `Now following ${profileUser.artistName}` : `Unfollowed`, 'success');
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const updated = await authAPI.updateProfile(currentUser.username, {
        artistName: editName,
        bio: editBio,
        location: editLocation,
        genres: editGenres,
        languages: editLanguages,
        isAvailableForCollab: editCollabStatus,
        links: {
          website: editWebsite,
          youtube: editYoutube
        }
      });
      addToast('Profile updated successfully!', 'success');
      setProfileUser(updated);
      setIsEditing(false);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setEditLoading(false);
    }
  };

  const handleGenreToggle = (genre) => {
    if (editGenres.includes(genre)) {
      setEditGenres(editGenres.filter(g => g !== genre));
    } else {
      setEditGenres([...editGenres, genre]);
    }
  };

  const handleLanguageToggle = (lang) => {
    if (editLanguages.includes(lang)) {
      setEditLanguages(editLanguages.filter(l => l !== lang));
    } else {
      setEditLanguages([...editLanguages, lang]);
    }
  };

  const handleUnlockAsset = async (asset) => {
    if (currentUser.balance < asset.price) {
      addToast(`Recharge wallet. Unlock requires ₹${asset.price}.`, 'error');
      return;
    }
    try {
      const pur = await assetsAPI.purchaseAsset(asset.id, 'personal');
      addToast(`Unlocked "${asset.title}"`, 'success');
      onPurchaseSuccess(asset.id);
      onShowCertificate(pur);
      fetchProfileData(); 
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleVisibilityToggle = async (asset) => {
    const nextVis = asset.visibility === 'Public' ? 'Private' : 'Public';
    try {
      await assetsAPI.updateAsset(asset.id, { visibility: nextVis });
      addToast(`Visibility flipped to ${nextVis}`, 'success');
      fetchProfileData();
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 className="spinning-disc" size={24} color="var(--accent-cyan)" />
      </div>
    );
  }

  if (!profileUser) return null;

  const songs = userAssets.filter(a => a.type === 'Song');
  const lyrics = userAssets.filter(a => a.type === 'Lyrics');
  const beats = userAssets.filter(a => a.type === 'Beats' || a.type === 'Instrumentals');
  const featuredAsset = userAssets.length > 0 ? userAssets[0] : null;

  return (
    <div className="container" style={{ padding: '32px 0 80px 0', zIndex: 1, position: 'relative' }}>
      
      {/* Profile Header panel */}
      <div className="glass-panel glow-purple" style={{
        marginBottom: '32px',
        display: 'flex',
        gap: '30px',
        alignItems: 'center',
        flexWrap: 'wrap',
        textAlign: 'left'
      }}>
        {/* Avatar */}
        <img 
          src={profileUser.profilePhoto} 
          alt={profileUser.artistName} 
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2.5px solid var(--accent-cyan)',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.25)'
          }}
        />

        {/* User Info */}
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{profileUser.artistName}</h2>
            
            {profileUser.isVerified && (
              <span className="badge badge-gold" style={{ fontSize: '10px' }}>
                <Award size={10} /> Verified
              </span>
            )}

            {profileUser.isAvailableForCollab && (
              <span className="badge badge-secondary" style={{ fontSize: '10px' }}>
                Collab Open
              </span>
            )}
          </div>

          {/* Subtitles & Roles */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
            {profileUser.roles.map(role => (
              <span key={role} className="badge badge-primary" style={{ fontSize: '10px' }}>{role}</span>
            ))}
            <span className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', alignSelf: 'center', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
              <MapPin size={12} style={{ color: 'var(--accent-cyan)' }} /> {profileUser.location}
            </span>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '14px', lineHeight: '1.5' }}>
            {profileUser.bio}
          </p>
        </div>

        {/* Action Controls & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '180px', alignItems: 'flex-end' }}>
          
          <div style={{ display: 'flex', gap: '16px', textAlign: 'center', fontSize: '0.85rem' }} className="mono">
            <div>
              <strong style={{ display: 'block', fontSize: '1.2rem', color: '#fff', textShadow: '0 0 10px rgba(0,240,255,0.2)' }}>{profileUser.followers.length}</strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>FOLLOWERS</span>
            </div>
            <div style={{ height: '30px', width: '1.5px', background: 'var(--border-glass)', alignSelf: 'center' }} />
            <div>
              <strong style={{ display: 'block', fontSize: '1.2rem', color: '#fff', textShadow: '0 0 10px rgba(139,92,246,0.2)' }}>{userAssets.length}</strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>RELEASES</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            {isOwnProfile ? (
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="btn btn-cyan" 
                style={{ width: '100%', fontSize: '11px', height: '32px', borderRadius: '8px' }}
              >
                <Edit size={12} /> {isEditing ? 'Close Edit' : 'Edit Profile'}
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                style={{ width: '100%', fontSize: '11px', height: '32px', borderRadius: '8px' }}
              >
                {isFollowing ? 'Following' : 'Follow Creator'}
              </button>
            )}
          </div>

          {/* Social links */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {profileUser.links.website && (
              <a href={`https://${profileUser.links.website}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)' }} title="Website">
                <Globe size={16} />
              </a>
            )}
            {profileUser.links.youtube && (
              <a href={`https://${profileUser.links.youtube}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)' }} title="Store">
                <Link2 size={16} />
              </a>
            )}
          </div>

        </div>
      </div>

      {/* EDIT PROFILE PANEL */}
      {isOwnProfile && isEditing && (
        <div className="glass-panel glow-cyan" style={{ marginBottom: '32px', textAlign: 'left' }}>
          <h3 className="form-label" style={{ fontSize: '13px', marginBottom: '20px' }}>
            Edit Profile Settings
          </h3>

          <form onSubmit={handleProfileSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flexWrap: 'wrap' }}>
              <div className="form-group">
                <label className="form-label">Artist Name *</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Biography Summary</label>
              <textarea 
                className="form-control"
                style={{ height: '80px', resize: 'vertical', paddingTop: '8px' }}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flexWrap: 'wrap' }}>
              <div className="form-group">
                <label className="form-label">Website URL</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="mayakapoor.com"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Store/Music URL</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="youtube.com/channel"
                  value={editYoutube}
                  onChange={(e) => setEditYoutube(e.target.value)}
                />
              </div>
            </div>

            {/* Genres Tag Selector */}
            <div className="form-group" style={{ margin: '14px 0' }}>
              <label className="form-label">Select Genres</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {genresList.map(g => {
                  const active = editGenres.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleGenreToggle(g)}
                      className={`btn ${active ? 'btn-cyan' : 'btn-secondary'}`}
                      style={{ fontSize: '11px', padding: '0 10px', borderRadius: '6px', height: '28px' }}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Languages Tag Selector */}
            <div className="form-group" style={{ margin: '14px 0' }}>
              <label className="form-label">Select Languages</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {languagesList.map(l => {
                  const active = editLanguages.includes(l);
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => handleLanguageToggle(l)}
                      className={`btn ${active ? 'btn-cyan' : 'btn-secondary'}`}
                      style={{ fontSize: '11px', padding: '0 10px', borderRadius: '6px', height: '28px' }}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0' }}>
              <input 
                type="checkbox"
                id="editCollab"
                checked={editCollabStatus}
                onChange={(e) => setEditCollabStatus(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)' }}
              />
              <label htmlFor="editCollab" className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 700 }}>
                OPEN FOR COLLABORATION SPLITS
              </label>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={editLoading}
              style={{ width: '160px', display: 'flex', marginLeft: 'auto', height: '36px', borderRadius: '8px' }}
            >
              {editLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      )}

      {/* Tab selectors */}
      <div style={{
        display: 'flex',
        borderBottom: '1.5px solid var(--border-glass)',
        marginBottom: '32px',
        overflowX: 'auto',
        gap: '24px'
      }}>
        {[
          { id: 'featured', label: 'Featured Work' },
          { id: 'songs', label: `Songs (${songs.length})` },
          { id: 'lyrics', label: `Lyrics (${lyrics.length})` },
          { id: 'beats', label: `Beats (${beats.length})` },
          { id: 'collabs', label: `Collabs (${userCollabs.length})` },
          { id: 'about', label: 'Registry Logs' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setProfileTab(tab.id)}
            style={{
              padding: '12px 4px',
              border: 'none',
              background: 'transparent',
              color: profileTab === tab.id ? 'var(--accent-cyan)' : 'var(--text-muted)',
              borderBottom: profileTab === tab.id ? '2.5px solid var(--accent-cyan)' : '2.5px solid transparent',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.15s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB SUB-VIEWS */}
      <div>
        
        {/* FEATURED WORK */}
        {profileTab === 'featured' && (
          <div style={{ maxWidth: '850px' }}>
            {featuredAsset ? (
              <div className="glass-panel glow-purple" style={{ padding: '32px', textAlign: 'left' }}>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <img 
                    src={featuredAsset.coverArt} 
                    alt={featuredAsset.title}
                    style={{ width: '120px', height: '120px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-glass)' }}
                  />
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <span className="badge badge-gold" style={{ marginBottom: '10px' }}>SPOTLIGHT OPPORTUNITY</span>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>{featuredAsset.title}</h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                      <span className="badge badge-primary">{featuredAsset.type}</span>
                      <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{featuredAsset.genre} • {featuredAsset.language}</span>
                    </div>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '16px', lineHeight: '1.5' }}>
                      {featuredAsset.description}
                    </p>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px', alignItems: 'center' }}>
                      {featuredAsset.audioUrl && (
                        <button
                          type="button"
                          onClick={() => onPlayAsset(featuredAsset)}
                          className="btn btn-cyan"
                          style={{ height: '32px', fontSize: '11px', borderRadius: '8px' }}
                        >
                          {playingAsset && playingAsset.id === featuredAsset.id && isPlaying ? 'Pause Teaser' : 'Play Teaser'}
                        </button>
                      )}

                      {featuredAsset.isLocked ? (
                        <button
                          type="button"
                          onClick={() => handleUnlockAsset(featuredAsset)}
                          className="btn btn-amber mono"
                          style={{ height: '32px', fontSize: '11px', gap: '6px', borderRadius: '8px' }}
                        >
                          Unlock Side B · ₹{featuredAsset.price}
                        </button>
                      ) : (
                        featuredAsset.price > 0 && (
                          <span className="badge badge-primary" style={{ padding: '6px 14px' }}>
                            Licensed Splits Verified ✓
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {featuredAsset.type === 'Lyrics' && (
                  <div style={{ marginTop: '24px', borderTop: '1.5px solid var(--border-glass)', paddingTop: '20px' }}>
                    <h4 className="mono" style={{ fontSize: '10px', color: 'var(--accent-cyan)', marginBottom: '12px' }}>LYRIC PREVIEW:</h4>
                    <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '16px', borderRadius: '12px', border: '1.5px solid var(--border-glass)' }}>
                      <div className="lyrics-preview-container" style={{ fontSize: '13px', padding: 0 }}>
                        {featuredAsset.previewLyrics.split('\n').map((line, idx) => (
                          <span key={idx} className="lyrics-line">{line}</span>
                        ))}
                        {featuredAsset.isLocked && (
                          <span className="lyrics-line locked">🔒 Chorus / Bridge Paywalled</span>
                        )}
                        {!featuredAsset.isLocked && featuredAsset.fullLyrics && (
                          featuredAsset.fullLyrics.split('\n').slice(featuredAsset.previewLyrics.split('\n').length).map((line, idx) => (
                            <span key={idx} className="lyrics-line" style={{ color: '#fff' }}>{line}</span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }} className="mono">No portfolio items highlighted.</p>
            )}
          </div>
        )}

        {/* SONGS TAB */}
        {profileTab === 'songs' && (
          <div className="grid">
            {songs.map((song) => {
              const isPlayingThis = playingAsset && playingAsset.id === song.id && isPlaying;
              return (
                <div key={song.id} className="card">
                  <div className="card-banner">
                    <div className="glow-gradient"></div>
                    <div className="visual-waveform">
                      {[...Array(22)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-bar-micro ${isPlayingThis && (i <= 6 || !song.isLocked) ? 'wave-bar-active' : ''}`}
                          style={{
                            height: `${15 + Math.abs(Math.sin(i * 0.35) * 60) + Math.random() * 10}%`,
                            background: !song.isLocked || i <= 6 ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.08)'
                          }}
                        />
                      ))}
                    </div>
                    {song.isLocked && <span className="badge badge-gold" style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '9px' }}>Paywall</span>}
                  </div>
                  <div className="card-body" style={{ textAlign: 'left' }}>
                    <div>
                      <h4 className="card-title">{song.title}</h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="mono">{song.genre} • {song.language}</p>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
                      <button
                        type="button"
                        onClick={() => onPlayAsset(song)}
                        className="btn btn-secondary mono"
                        style={{ height: '30px', padding: '0 12px', fontSize: '11px', borderRadius: '6px' }}
                      >
                        {isPlayingThis ? 'Pause' : 'Play Teaser'}
                      </button>

                      {isOwnProfile ? (
                        <button
                          type="button"
                          onClick={() => handleVisibilityToggle(song)}
                          className="btn btn-secondary mono"
                          style={{ height: '30px', padding: '0 12px', fontSize: '11px', borderRadius: '6px' }}
                        >
                          {song.visibility === 'Public' ? 'Public' : 'Private'}
                        </button>
                      ) : song.isLocked ? (
                        <button
                          type="button"
                          onClick={() => handleUnlockAsset(song)}
                          className="btn btn-amber mono"
                          style={{ height: '30px', padding: '0 12px', fontSize: '11px', borderRadius: '6px' }}
                        >
                          Unlock ₹{song.price}
                        </button>
                      ) : (
                        song.price > 0 && <span className="mono" style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 700 }}>Unlocked ✓</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {songs.length === 0 && <p style={{ color: 'var(--text-muted)', padding: '16px' }} className="mono">No songs dubbed.</p>}
          </div>
        )}

        {/* LYRICS TAB */}
        {profileTab === 'lyrics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {lyrics.map(lyr => (
              <div key={lyr.id} className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', textAlign: 'left' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flex: 1, minWidth: '280px' }}>
                  <FileText size={26} style={{ color: 'var(--accent-cyan)', marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>{lyr.title}</h4>
                    <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{lyr.genre} • {lyr.language}</span>
                    
                    <div style={{ marginTop: '14px', background: 'rgba(0, 0, 0, 0.4)', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid var(--border-glass)' }}>
                      <div className="lyrics-preview-container" style={{ fontSize: '13px', padding: 0 }}>
                        {lyr.previewLyrics.split('\n').map((line, idx) => (
                          <p key={idx} style={{ margin: '2px 0' }}>{line}</p>
                        ))}
                        {lyr.isLocked && <p className="mono" style={{ color: 'var(--accent-amber)', fontSize: '12px', marginTop: '6px' }}>[🔒 Chorus / Bridge Paywall Locked]</p>}
                        {!lyr.isLocked && lyr.fullLyrics && (
                          <p style={{ color: '#fff', marginTop: '8px', borderTop: '1px dashed var(--border-glass)', paddingTop: '8px' }}>
                            {lyr.fullLyrics}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  {isOwnProfile ? (
                    <button
                      type="button"
                      onClick={() => handleVisibilityToggle(lyr)}
                      className="btn btn-secondary mono"
                      style={{ height: '32px', padding: '0 16px', fontSize: '11px', borderRadius: '8px' }}
                    >
                      {lyr.visibility === 'Public' ? 'Private' : 'Public'}
                    </button>
                  ) : lyr.isLocked ? (
                    <button 
                      type="button"
                      onClick={() => handleUnlockAsset(lyr)}
                      className="btn btn-amber mono" 
                      style={{ height: '32px', padding: '0 16px', fontSize: '11px', borderRadius: '8px' }}
                    >
                      Unlock ₹{lyr.price}
                    </button>
                  ) : (
                    lyr.price > 0 ? (
                      <button
                        type="button"
                        onClick={async () => {
                          const purchases = JSON.parse(localStorage.getItem('stagepass_purchases')) || [];
                          const pur = purchases.find(p => p.buyerId === currentUser.username && p.assetId === lyr.id);
                          if (pur) onShowCertificate(pur);
                        }}
                        className="btn btn-cyan mono"
                        style={{ height: '32px', padding: '0 16px', fontSize: '11px', borderRadius: '8px' }}
                      >
                        J-Card ✓
                      </button>
                    ) : (
                      <span className="badge badge-dim">Free</span>
                    )
                  )}
                </div>
              </div>
            ))}
            {lyrics.length === 0 && <p style={{ color: 'var(--text-muted)', padding: '16px' }} className="mono">No lyric assets registered.</p>}
          </div>
        )}

        {/* BEATS TAB */}
        {profileTab === 'beats' && (
          <div className="grid">
            {beats.map((beat) => {
              const isPlayingThis = playingAsset && playingAsset.id === beat.id && isPlaying;
              return (
                <div key={beat.id} className="card">
                  <div className="card-banner">
                    <div className="glow-gradient"></div>
                    <div className="visual-waveform">
                      {[...Array(22)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-bar-micro ${isPlayingThis && (i <= 6 || !beat.isLocked) ? 'wave-bar-active' : ''}`}
                          style={{
                            height: `${15 + Math.abs(Math.sin(i * 0.35) * 60) + Math.random() * 10}%`,
                            background: !beat.isLocked || i <= 6 ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.08)'
                          }}
                        />
                      ))}
                    </div>
                    {beat.isLocked && <span className="badge badge-gold" style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '9px' }}>Paywall</span>}
                  </div>
                  <div className="card-body" style={{ textAlign: 'left' }}>
                    <div>
                      <h4 className="card-title">{beat.title}</h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="mono">{beat.genre} • {beat.language}</p>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
                      <button
                        type="button"
                        onClick={() => onPlayAsset(beat)}
                        className="btn btn-secondary mono"
                        style={{ height: '28px', padding: '0 10px', fontSize: '11px', borderRadius: '6px' }}
                      >
                        {isPlayingThis ? 'Pause' : 'Play Teaser'}
                      </button>

                      {isOwnProfile ? (
                        <button
                          type="button"
                          onClick={() => handleVisibilityToggle(beat)}
                          className="btn btn-secondary mono"
                          style={{ height: '28px', padding: '0 10px', fontSize: '11px', borderRadius: '6px' }}
                        >
                          {beat.visibility === 'Public' ? 'Public' : 'Private'}
                        </button>
                      ) : beat.isLocked ? (
                        <button
                          type="button"
                          onClick={() => handleUnlockAsset(beat)}
                          className="btn btn-amber mono"
                          style={{ height: '28px', padding: '0 10px', fontSize: '11px', borderRadius: '6px' }}
                        >
                          Unlock ₹{beat.price}
                        </button>
                      ) : (
                        beat.price > 0 && <span className="mono" style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 700 }}>Unlocked ✓</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {beats.length === 0 && <p style={{ color: 'var(--text-muted)', padding: '16px' }} className="mono">No beats/stems dubbed.</p>}
          </div>
        )}

        {/* COLLABORATIONS TAB */}
        {profileTab === 'collabs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {userCollabs.map(req => (
              <div key={req.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>{req.title}</h4>
                  <span className="badge badge-primary">Requires: {req.requiredRole}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{req.description}</p>
                <div className="mono" style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-glass)', paddingTop: '12px', marginTop: '6px' }}>
                  <span>BUDGET: <strong style={{ color: 'var(--accent-cyan)' }}>₹{req.budget}</strong></span>
                  <span>DEADLINE: <strong>{req.deadline}</strong></span>
                  <span>APPLICANTS: <strong>{req.applications.length}</strong></span>
                </div>
              </div>
            ))}
            {userCollabs.length === 0 && <p style={{ color: 'var(--text-muted)', padding: '16px' }} className="mono">No active collaboration offers.</p>}
          </div>
        )}

        {/* ABOUT / REGISTRY LOG */}
        {profileTab === 'about' && (
          <div className="glass-panel glow-purple" style={{ textAlign: 'left', display: 'grid', gridTemplateColumns: '1fr 260px', gap: '36px', flexWrap: 'wrap' }}>
            <div>
              <h3 className="form-label" style={{ fontSize: '11px', marginBottom: '10px' }}>Biography Summary</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {profileUser.bio}
              </p>

              <h3 className="form-label" style={{ fontSize: '11px', marginTop: '28px', marginBottom: '10px' }}>Studio Credentials</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profileUser.roles.map(r => <span key={r} className="badge badge-dim" style={{ fontSize: '10px' }}>{r}</span>)}
                {profileUser.genres.map(g => <span key={g} className="badge badge-dim" style={{ fontSize: '10px' }}>{g} Genre</span>)}
              </div>
            </div>

            <div style={{ borderLeft: '1.5px solid var(--border-glass)', paddingLeft: '24px' }} className="mono">
              <h3 className="form-label" style={{ fontSize: '11px', marginBottom: '16px' }}>Registry Profile Logs</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '4px' }}>REGISTERED ON</span>
                  <strong style={{ color: 'var(--text-main)' }}>{new Date(profileUser.createdTimestamp).toLocaleDateString().toUpperCase()}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '4px' }}>STUDIO LOCATION</span>
                  <strong style={{ color: 'var(--text-main)' }}>{profileUser.location.toUpperCase()}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '4px' }}>VERIFIED WEBSITE</span>
                  {profileUser.links.website ? (
                    <a href={`https://${profileUser.links.website}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)' }}>{profileUser.links.website.toUpperCase()}</a>
                  ) : 'NONE'}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
