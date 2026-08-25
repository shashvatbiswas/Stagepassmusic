import React, { useState, useEffect } from 'react';
import { assetsAPI } from '../api/db';
import { PRESET_COVERS } from '../utils/presets';
import { 
  BarChart3, 
  UploadCloud, 
  FolderOpen, 
  Lock, 
  Unlock, 
  Eye, 
  DollarSign, 
  TrendingUp, 
  Trash2, 
  Loader2,
  Play,
  Sliders,
  Settings,
  Flame,
  Sparkles
} from 'lucide-react';

export default function CreatorStudio({ currentUser, onPlayAsset, playingAsset, isPlaying, addToast }) {
  const [activeSubTab, setActiveSubTab] = useState('dashboard'); // dashboard | library | designer
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active track being edited in the Paywall Designer
  // If null, it means we are editing a "New Tape" draft
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Designer/Uploader Form State
  const [upTitle, setUpTitle] = useState('');
  const [upType, setUpType] = useState('Song');
  const [upGenre, setUpGenre] = useState('Pop');
  const [upLang, setUpLang] = useState('English');
  const [upDesc, setUpDesc] = useState('');
  const [upPrice, setUpPrice] = useState('199');
  
  // Paywall Selector State
  const [previewStartBar, setPreviewStartBar] = useState(8);
  const [previewEndBar, setPreviewEndBar] = useState(24);
  const [upVisibility, setUpVisibility] = useState('Public'); // Public, Private
  const [upMonetized, setUpMonetized] = useState(true);
  const [upLyrics, setUpLyrics] = useState('');
  
  const [isChorusBlurred, setIsChorusBlurred] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [aiScanning, setAiScanning] = useState(false);

  // Custom File Upload States
  const [customAudioUrl, setCustomAudioUrl] = useState('');
  const [customAudioName, setCustomAudioName] = useState('');
  const [customCoverUrl, setCustomCoverUrl] = useState('');

  const handleAudioFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCustomAudioName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomAudioUrl(event.target.result);
      addToast(`Audio track "${file.name}" loaded!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleCoverFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomCoverUrl(event.target.result);
      addToast('Cover artwork uploaded!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Sidebar Dock Preset state
  const [activePreset, setActivePreset] = useState('Retro');

  const totalBarsCount = 42;

  useEffect(() => {
    fetchLibrary();
  }, [activeSubTab]);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const allAssets = await assetsAPI.getAssets({ allowUnlisted: true });
      const userAssets = allAssets.filter(a => a.creatorId === currentUser.username);
      setLibrary(userAssets);
    } catch (e) {
      addToast('Error loading studio database', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPaywallClick = (asset) => {
    setSelectedAsset(asset);
    setUpTitle(asset.title);
    setUpType(asset.type);
    setUpGenre(asset.genre);
    setUpLang(asset.language || 'English');
    setUpDesc(asset.description);
    setUpPrice(asset.price.toString());
    setUpVisibility(asset.visibility);
    setUpMonetized(asset.price > 0);
    
    // De-serialize preview durations to mock bars (1 bar = ~1.5s preview)
    const mockEnd = Math.min(totalBarsCount - 4, Math.max(10, Math.round((asset.previewDuration || 20) / 1.5)));
    setPreviewStartBar(2);
    setPreviewEndBar(mockEnd);
    
    if (asset.fullLyrics) {
      setUpLyrics(asset.fullLyrics);
    } else if (asset.previewLyrics) {
      setUpLyrics(asset.previewLyrics + "\n\n[Chorus — Locked Paywall]\n...");
    }

    setActiveSubTab('designer');
    addToast(`Loaded "${asset.title}"`, 'info');
  };

  const handleNewDraftClick = () => {
    setSelectedAsset(null);
    setUpTitle('');
    setUpDesc('');
    setUpPrice('199');
    setPreviewStartBar(8);
    setPreviewEndBar(24);
    setUpVisibility('Public');
    setUpMonetized(true);
    setUpLyrics('');
    setCustomAudioUrl('');
    setCustomAudioName('');
    setCustomCoverUrl('');
    setActiveSubTab('designer');
  };

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm('Delete this track from your catalog?')) return;
    try {
      await assetsAPI.deleteAsset(assetId);
      addToast('Track deleted', 'success');
      fetchLibrary();
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  const handleSavePaywall = async (e) => {
    e.preventDefault();
    if (!upTitle) {
      addToast('Title is required', 'error');
      return;
    }
    setFormLoading(true);

    try {
      const calculatedPreviewSec = Math.round((previewEndBar - previewStartBar) * 1.5);
      const parsedPrice = upMonetized ? (parseFloat(upPrice) || 0) : 0;

      const lyricsLines = upLyrics.split('\n');
      const chorusIndex = lyricsLines.findIndex(line => line.toLowerCase().includes('chorus') || line.toLowerCase().includes('locked'));
      const previewLyrics = chorusIndex !== -1 ? lyricsLines.slice(0, chorusIndex).join('\n') : lyricsLines.slice(0, 4).join('\n');

      const dataPayload = {
        title: upTitle,
        description: upDesc,
        type: upType,
        genre: upGenre,
        language: upLang,
        price: parsedPrice,
        visibility: upVisibility,
        duration: 90,
        previewDuration: calculatedPreviewSec,
        watermark: true,
        previewLyrics: previewLyrics,
        fullLyrics: upLyrics,
        audioUrl: customAudioUrl || selectedAsset?.audioUrl || PRESET_AUDIO_TRACKS[0].url,
        coverArt: customCoverUrl || selectedAsset?.coverArt || PRESET_COVERS[Math.floor(Math.random() * PRESET_COVERS.length)],
        licensing: {
          personal: parsedPrice,
          commercial: Math.round(parsedPrice * 3.5),
          extended: Math.round(parsedPrice * 6),
          exclusive: Math.round(parsedPrice * 15)
        }
      };

      if (selectedAsset) {
        await assetsAPI.updateAsset(selectedAsset.id, dataPayload);
        addToast(`Settings updated for "${upTitle}"`, 'success');
      } else {
        await assetsAPI.createAsset(dataPayload);
        addToast(`"${upTitle}" published successfully!`, 'success');
      }

      setActiveSubTab('library');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const triggerAIScan = () => {
    if (!upTitle) {
      addToast('Provide a track title first', 'warning');
      return;
    }
    setAiScanning(true);
    setTimeout(() => {
      setAiScanning(false);
      setUpGenre('Synthwave');
      setUpDesc(`A professional retro arrangement of "${upTitle}". Includes Master WAV + stems.`);
      setUpPrice('399');
      setPreviewStartBar(4);
      setPreviewEndBar(28);
      addToast('AI Assistant: Tags, stems, and pricing optimized.', 'success');
    }, 1200);
  };

  const totalEarnings = library.reduce((acc, a) => acc + ((a.viewsCount || 0) * 12.5), 0);
  const totalViews = library.reduce((acc, a) => acc + (a.viewsCount || 0), 0);
  const activeLicensesCount = library.filter(a => (parseFloat(a.price) || 0) > 0).length;

  return (
    <div style={{ padding: '32px 0 80px 0', zIndex: 1, position: 'relative' }}>
      
      {/* Sub Tabs Navigation */}
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Creator Studio
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Dub tracks, configure interactive audio paywalls, and view streaming metrics.
          </p>
        </div>

        <div className="glass-panel" style={{ display: 'flex', padding: '3px', borderRadius: '12px', border: '1.5px solid var(--border-glass)' }}>
          <button
            onClick={() => setActiveSubTab('dashboard')}
            className={`btn ${activeSubTab === 'dashboard' ? 'btn-cyan' : 'btn-secondary'}`}
            style={{ borderRadius: '10px', padding: '6px 14px', fontSize: '11px', height: '30px' }}
          >
            <BarChart3 size={13} /> Metrics
          </button>
          <button
            onClick={() => setActiveSubTab('library')}
            className={`btn ${activeSubTab === 'library' ? 'btn-cyan' : 'btn-secondary'}`}
            style={{ borderRadius: '10px', padding: '6px 14px', fontSize: '11px', height: '30px' }}
          >
            <FolderOpen size={13} /> Studio Rack
          </button>
          <button
            onClick={handleNewDraftClick}
            className={`btn ${activeSubTab === 'designer' ? 'btn-cyan' : 'btn-secondary'}`}
            style={{ borderRadius: '10px', padding: '6px 14px', fontSize: '11px', height: '30px' }}
          >
            <UploadCloud size={13} /> Paywall Designer
          </button>
        </div>
      </div>

      <div className="container">
        
        {/* SUB TAB: METRICS DASHBOARD */}
        {activeSubTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
              <div className="glass-panel glow-purple" style={{ textAlign: 'left' }}>
                <div className="form-label">Total Earnings</div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, margin: '6px 0', color: '#fff' }}>₹{totalEarnings.toFixed(2)}</h3>
                <span className="badge badge-primary">₹12.50 per stream</span>
              </div>

              <div className="glass-panel glow-cyan" style={{ textAlign: 'left' }}>
                <div className="form-label">Total Streams</div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, margin: '6px 0', color: '#fff' }}>{totalViews}</h3>
                <span className="badge badge-secondary">All Releases</span>
              </div>

              <div className="glass-panel glow-amber" style={{ textAlign: 'left' }}>
                <div className="form-label">Active Licenses</div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, margin: '6px 0', color: '#fff' }}>{activeLicensesCount}</h3>
                <span className="badge badge-gold">Verified splits</span>
              </div>
            </div>

            {/* Glowing SVG Performance Log */}
            <div className="glass-panel" style={{ textAlign: 'left' }}>
              <div className="form-label" style={{ fontSize: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={16} style={{ color: 'var(--accent-cyan)' }} /> Streaming Activity Log (Past 7 Days)
              </div>
              
              <div style={{ height: '220px', background: 'rgba(0,0,0,0.4)', border: '1.5px solid var(--border-glass)', borderRadius: '12px', padding: '16px' }}>
                <svg viewBox="0 0 800 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  <line x1="0" y1="50" x2="800" y2="50" stroke="var(--border-glass)" strokeWidth="1" strokeDasharray="6 6" />
                  <line x1="0" y1="100" x2="800" y2="100" stroke="var(--border-glass)" strokeWidth="1" strokeDasharray="6 6" />
                  <line x1="0" y1="150" x2="800" y2="150" stroke="var(--border-glass)" strokeWidth="1" strokeDasharray="6 6" />

                  {/* Glowing charts path */}
                  <path 
                    d="M 50 160 L 170 120 L 290 140 L 410 70 L 530 90 L 650 40 L 750 30" 
                    fill="none" 
                    stroke="var(--accent-cyan)" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                    filter="url(#glow)"
                  />

                  {[50, 170, 290, 410, 530, 650, 750].map((cx, idx) => (
                    <circle key={cx} cx={cx} cy={[160, 120, 140, 70, 90, 40, 30][idx]} r="4.5" fill="#ffffff" stroke="var(--accent-purple)" strokeWidth="2" />
                  ))}
                </svg>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', fontSize: '11px', color: 'var(--text-muted)' }} className="mono">
                <span>Aug 19</span><span>Aug 20</span><span>Aug 21</span><span>Aug 22</span><span>Aug 23</span><span>Aug 24</span><span>Today</span>
              </div>
            </div>

          </div>
        )}

        {/* SUB TAB: MY STUDIO CATALOG */}
        {activeSubTab === 'library' && (
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'left' }}>
            <h3 className="form-label" style={{ fontSize: '13px', marginBottom: '24px' }}>
              Dubbed Track Catalog
            </h3>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <Loader2 className="spinning-disc" size={24} color="var(--accent-cyan)" />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {library.map(asset => (
                  <div 
                    key={asset.id} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1.5px solid var(--border-glass)',
                      borderRadius: '16px',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <img 
                        src={asset.coverArt} 
                        alt={asset.title} 
                        style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-glass)' }}
                      />
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>{asset.title}</h4>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                          <span className="badge badge-primary" style={{ fontSize: '8px' }}>{asset.type}</span>
                          <span className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Teaser: {asset.previewDuration || 0}s</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span className="mono" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-cyan)' }}>₹{asset.price}</span>

                      <span className={`badge ${asset.visibility === 'Public' ? 'badge-secondary' : 'badge-gold'}`}>
                        {asset.visibility === 'Public' ? 'On Shelf' : 'Private'}
                      </span>

                      <button 
                        onClick={() => handleEditPaywallClick(asset)}
                        className="btn btn-secondary mono" 
                        style={{ height: '32px', padding: '0 16px', fontSize: '11px', borderRadius: '8px' }}
                      >
                        Edit Paywall
                      </button>

                      <button 
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="btn btn-burgundy" 
                        style={{ height: '32px', padding: '0 10px', borderRadius: '8px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {library.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No tracks uploaded to this console yet. Click "Paywall Designer" to publish your first tape.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* SUB TAB: INTERACTIVE PAYWALL DESIGNER */}
        {activeSubTab === 'designer' && (
          <div className="glass-panel" style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr',
            gap: '32px',
            padding: '36px'
          }}>
            
            {/* Sidebar presets dock */}
            <div className="sidebar-dock" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              borderRight: '1.5px solid var(--border-glass)',
              paddingRight: '20px'
            }}>
              <div className="dock-logo" style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 800,
                fontSize: '15px',
                color: '#fff',
                marginBottom: '10px'
              }}>
                SP
              </div>
              
              {['Retro', 'Synth', 'Acoustic', 'Vocalist'].map(preset => {
                const active = activePreset === preset;
                return (
                  <div 
                    key={preset}
                    onClick={() => {
                      setActivePreset(preset);
                      if (preset === 'Retro') { setUpGenre('Lo-fi'); setUpPrice('199'); }
                      else if (preset === 'Synth') { setUpGenre('Synthwave'); setUpPrice('399'); }
                      else if (preset === 'Acoustic') { setUpGenre('Indie'); setUpPrice('249'); }
                      else { setUpGenre('Vocal Pop'); setUpPrice('299'); }
                      addToast(`Preset loaded: ${preset}`, 'info');
                    }}
                    className="dock-btn"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '9px',
                      color: active ? 'var(--accent-cyan)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      width: '38px',
                      height: '38px',
                      background: active ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                      border: active ? '1.5px solid var(--accent-cyan)' : '1.5px solid var(--border-glass)',
                      borderRadius: '10px',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '14px',
                      boxShadow: active ? '0 0 10px rgba(0, 240, 255, 0.15)' : 'none'
                    }}>
                      {preset === 'Retro' && '💿'}
                      {preset === 'Synth' && '🎹'}
                      {preset === 'Acoustic' && '🎸'}
                      {preset === 'Vocalist' && '🎤'}
                    </div>
                    {preset}
                  </div>
                );
              })}
            </div>

            {/* Designer Content area */}
            <div className="designer-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Header Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="form-label" style={{ fontSize: '13px', marginBottom: 0 }}>
                  {selectedAsset ? `Edit Paywall: ${selectedAsset.title}` : 'Configure Audio Paywall Region'}
                </h3>
              </div>

              {/* Title & Metadata form fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Track Title *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Summer Breeze (Acoustic Mix)"
                    className="form-control"
                    value={upTitle}
                    onChange={(e) => setUpTitle(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Asset Type</label>
                  <select 
                    className="form-control form-select"
                    value={upType}
                    onChange={(e) => setUpType(e.target.value)}
                  >
                    <option value="Song">Song</option>
                    <option value="Beats">Beat</option>
                    <option value="Lyrics">Lyrics</option>
                    <option value="Sound Packs">Sound Pack</option>
                  </select>
                </div>
              </div>

              {/* Custom File Upload Box (Audio & Artwork) */}
              <div className="glass-panel" style={{ padding: '20px', background: 'rgba(0,0,0,0.25)', borderRadius: '16px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                
                {/* Audio File Picker */}
                <div style={{ textAlign: 'left' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                    <UploadCloud size={14} style={{ color: 'var(--accent-cyan)' }} /> Upload Audio File (.mp3, .wav)
                  </label>
                  <label style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '16px', borderRadius: '12px', border: '1.5px dashed var(--accent-cyan)',
                    background: 'rgba(0, 240, 255, 0.04)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                  }}>
                    <input type="file" accept="audio/*" onChange={handleAudioFileUpload} style={{ display: 'none' }} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                      {customAudioName ? `🎵 ${customAudioName}` : 'Choose Audio File from Device'}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {customAudioUrl ? '✅ Audio Ready for Paywall Trimming' : 'MP3, WAV, M4A, FLAC supported'}
                    </span>
                  </label>
                </div>

                {/* Cover Image Picker */}
                <div style={{ textAlign: 'left' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                    <UploadCloud size={14} style={{ color: 'var(--accent-purple)' }} /> Cover Artwork Image
                  </label>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '12px', borderRadius: '12px', border: '1.5px dashed var(--accent-purple)',
                    background: 'rgba(168, 85, 247, 0.04)', cursor: 'pointer'
                  }}>
                    <input type="file" accept="image/*" onChange={handleCoverFileUpload} style={{ display: 'none' }} />
                    {customCoverUrl ? (
                      <img src={customCoverUrl} alt="Cover" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', fontSize: '18px' }}>🎨</div>
                    )}
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', display: 'block' }}>
                        {customCoverUrl ? 'Image Selected' : 'Choose Cover Photo'}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PNG, JPG or WEBP</span>
                    </div>
                  </label>
                </div>

              </div>

              {/* Paywall Visualizer Waveform Selector */}
              <div className="waveform-workspace" style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1.5px solid var(--border-glass)',
                borderRadius: '16px',
                padding: '20px 24px',
                textAlign: 'left'
              }}>
                <div className="mono" style={{ fontSize: '11px', color: 'var(--accent-cyan)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={12} /> Paywall trimmer bounds: {Math.round(previewStartBar * 1.5)}s to {Math.round(previewEndBar * 1.5)}s ({Math.round((previewEndBar - previewStartBar) * 1.5)}s teaser)
                </div>

                <div className="waveform-visualizer" style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '70px', margin: '12px 0' }}>
                  {[...Array(totalBarsCount)].map((_, i) => {
                    const height = 20 + Math.abs(Math.sin(i * 0.28) * 55) + Math.random() * 15;
                    const inPreview = i >= previewStartBar && i <= previewEndBar;
                    return (
                      <div 
                        key={i}
                        onClick={() => {
                          if (i < previewStartBar) {
                            setPreviewStartBar(i);
                          } else {
                            setPreviewEndBar(i);
                          }
                        }}
                        className="w-bar"
                        style={{ 
                          flex: 1,
                          height: `${Math.min(95, height)}%`, 
                          cursor: 'pointer',
                          borderRadius: '2.5px',
                          background: inPreview ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.06)',
                          boxShadow: inPreview ? '0 0 10px rgba(0, 240, 255, 0.2)' : 'none'
                        }}
                      />
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>Audible teaser range (Select bounds to trim)</span>
                  <span>🔒 Paid Area Watermarked</span>
                </div>
              </div>

              {/* Bottom Card details grid */}
              <div className="designer-bottom-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', flexWrap: 'wrap' }}>
                
                {/* Lyrics blurs card */}
                <div className="glass-panel" style={{ padding: '20px', background: 'rgba(0, 0, 0, 0.2)', textAlign: 'left', borderRadius: '16px' }}>
                  <div className="form-label" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span>Lyrics sheet visibility preview</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <textarea 
                      className="form-control"
                      style={{ height: '80px', resize: 'vertical', fontSize: '12px', background: 'rgba(0,0,0,0.4)', fontFamily: 'inherit', borderRadius: '8px' }}
                      value={upLyrics}
                      onChange={(e) => setUpLyrics(e.target.value)}
                      placeholder="Input lyric verses. Highlight locked chunks with '[Chorus]' or '[Locked]' titles."
                    />

                    <div style={{ fontSize: '12px', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', border: '1.5px solid var(--border-glass)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span className="mono" style={{ fontSize: '10px', color: 'var(--accent-cyan)' }}>Live Preview:</span>
                        <button 
                          type="button" 
                          onClick={() => setIsChorusBlurred(!isChorusBlurred)} 
                          className="btn btn-secondary"
                          style={{ fontSize: '10px', padding: '0 10px', height: '24px', borderRadius: '6px' }}
                        >
                          {isChorusBlurred ? 'Reveal' : 'Blur Paywall'}
                        </button>
                      </div>
                      {upLyrics.split('\n\n').map((chunk, i) => {
                        const isLockedChunk = chunk.toLowerCase().includes('chorus') || chunk.toLowerCase().includes('locked');
                        return (
                          <div 
                            key={i} 
                            style={{
                              filter: isLockedChunk && isChorusBlurred ? 'blur(4px)' : 'none',
                              opacity: isLockedChunk && isChorusBlurred ? 0.35 : 1,
                              userSelect: isLockedChunk && isChorusBlurred ? 'none' : 'auto',
                              marginBottom: '8px'
                            }}
                          >
                            {chunk.split('\n').map((line, lIdx) => <div key={lIdx}>{line}</div>)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Form parameters card */}
                <div className="glass-panel" style={{ padding: '20px', background: 'rgba(0, 0, 0, 0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'left', borderRadius: '16px' }}>
                  
                  <div>
                    {/* Visibility status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ fontSize: '12px' }}>
                        Public Listing
                        <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)' }}>Display on public shelf catalog</span>
                      </div>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={upVisibility === 'Public'}
                          onChange={(e) => setUpVisibility(e.target.checked ? 'Public' : 'Private')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    {/* Monetization status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ fontSize: '12px' }}>
                        Monetize Snippet
                        <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)' }}>Lock full stems behind paywall</span>
                      </div>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={upMonetized}
                          onChange={(e) => setUpMonetized(e.target.checked)}
                        />
                        <span className="slider amber"></span>
                      </label>
                    </div>

                    {/* Pricing input */}
                    {upMonetized && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ fontSize: '12px' }}>Price (₹ INR)</div>
                        <input 
                          type="number" 
                          className="input-box" 
                          value={upPrice} 
                          onChange={(e) => setUpPrice(e.target.value)}
                          style={{ width: '80px', textAlign: 'right', height: '34px', borderRadius: '6px' }} 
                        />
                      </div>
                    )}

                    <div className="form-group" style={{ marginTop: '16px', marginBottom: 0 }}>
                      <label className="form-label">Stem Assets description</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={upDesc}
                        onChange={(e) => setUpDesc(e.target.value)}
                        placeholder="Master WAV + multi-track stems"
                        style={{ height: '34px', borderRadius: '6px' }}
                      />
                    </div>
                  </div>

                  {/* Submission triggers */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                    <button 
                      type="button" 
                      onClick={triggerAIScan}
                      className="btn btn-secondary mono" 
                      style={{ fontSize: '11px', width: '100%', height: '34px', borderRadius: '8px' }}
                      disabled={aiScanning}
                    >
                      {aiScanning ? 'Scanning audio stems...' : 'Optimize via AI Assistant'}
                    </button>

                    <button 
                      type="button" 
                      onClick={handleSavePaywall}
                      className="btn btn-primary" 
                      style={{ width: '100%', height: '36px', borderRadius: '8px' }}
                      disabled={formLoading}
                    >
                      {formLoading ? 'Publishing...' : selectedAsset ? 'Update Paywall' : 'Dub Tape to StagePass'}
                    </button>
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* Embedded visual blurs styling */}
      <style>{`
        .chorus-locked {
          filter: blur(4.5px);
          user-select: none;
          opacity: 0.35;
        }
        .verse {
          color: var(--text-main);
        }
      `}</style>

    </div>
  );
}
