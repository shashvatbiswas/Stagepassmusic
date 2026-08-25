import React, { useState, useEffect } from 'react';
import { assetsAPI } from '../api/db';
import { PRESET_AVATARS } from '../utils/presets';
import { 
  Search, 
  SlidersHorizontal, 
  Play, 
  Pause, 
  Lock, 
  Unlock, 
  Download, 
  Award, 
  ChevronRight, 
  Loader2,
  Compass,
  Sparkles
} from 'lucide-react';

export default function Discover({ 
  onPlayAsset, 
  playingAsset, 
  isPlaying, 
  onNavigateProfile, 
  onPurchaseSuccess, 
  onShowCertificate,
  addToast,
  currentUser,
  purchaseTrigger
}) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [isNlpActive, setIsNlpActive] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const [activeCategory, setActiveCategory] = useState('All'); 
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedCreatorType, setSelectedCreatorType] = useState('');
  const [selectedPriceType, setSelectedPriceType] = useState('');
  const [selectedSort, setSelectedSort] = useState('Newest');

  // Purchase/Licensing checkout state
  const [purchasingAssetId, setPurchasingAssetId] = useState(null);
  const [selectedLicense, setSelectedLicense] = useState('personal');



  const categories = ['All', 'Song', 'Lyrics', 'Beats', 'Instrumentals', 'Sound Packs'];
  const genres = ['Pop', 'Hip-Hop', 'Rap', 'R&B', 'Rock', 'Indie', 'Electronic', 'EDM', 'Jazz', 'Classical', 'Sufi', 'Ghazal', 'Folk', 'Bollywood', 'Lo-fi'];
  const languages = ['English', 'Hindi', 'Urdu', 'Tamil', 'Punjabi', 'Kannada', 'Marathi'];
  const creatorTypes = ['Singer', 'Lyricist', 'Producer', 'Musician', 'Sound Engineer'];

  useEffect(() => {
    fetchMarketplaceAssets();
  }, [activeCategory, selectedGenre, selectedLanguage, selectedCreatorType, selectedPriceType, selectedSort, purchaseTrigger]);

  const fetchMarketplaceAssets = async (nlpText = null) => {
    setLoading(true);
    try {
      const filters = {
        type: activeCategory,
        genre: selectedGenre,
        language: selectedLanguage,
        creatorType: selectedCreatorType,
        priceRange: selectedPriceType,
        sortBy: selectedSort
      };

      if (nlpText) {
        filters.nlpQuery = nlpText;
      } else if (searchQuery && !isNlpActive) {
        filters.search = searchQuery;
      }

      const data = await assetsAPI.getAssets(filters);
      setAssets(data);
    } catch (e) {
      addToast('Error loading marketplace catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery) {
      setIsNlpActive(false);
      fetchMarketplaceAssets();
      return;
    }

    const nlpKeywords = ['find', 'me', 'acoustic', 'sad', 'happy', 'melancholic', 'vocals', 'with', 'female', 'male', 'hindi', 'song', 'urdu', 'lyrics'];
    const isNlpMatch = nlpKeywords.some(keyword => searchQuery.toLowerCase().includes(keyword));

    if (isNlpMatch) {
      setIsNlpActive(true);
      addToast('Search query interpreted.', 'info');
      fetchMarketplaceAssets(searchQuery);
    } else {
      setIsNlpActive(false);
      fetchMarketplaceAssets();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsNlpActive(false);
    fetchMarketplaceAssets();
  };

  const handleQuickNlpSearch = (phrase) => {
    setSearchQuery(phrase);
    setIsNlpActive(true);
    fetchMarketplaceAssets(phrase);
  };

  const handlePurchase = (assetId) => {
    setPurchasingAssetId(assetId);
    setSelectedLicense('personal'); 
  };

  const handleConfirmPurchase = async (asset) => {
    try {
      const pur = await assetsAPI.purchaseAsset(asset.id, selectedLicense);
      addToast(`Rights unlocked: "${asset.title}" under ${selectedLicense} License!`, 'success');
      setPurchasingAssetId(null);
      onPurchaseSuccess(asset.id);
      onShowCertificate(pur); 
      fetchMarketplaceAssets(isNlpActive ? searchQuery : null);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleRecordMetric = async (assetId, type) => {
    await assetsAPI.recordMetrics(assetId, type);
  };

  return (
    <div style={{ padding: '32px 0 80px 0', zIndex: 1, position: 'relative' }}>
      
      {/* Search Header Banner */}
      <section style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div className="container" style={{ maxWidth: '750px' }}>
          
          <div className="badge badge-primary" style={{ marginBottom: '16px', letterSpacing: '2px' }}>
            <Sparkles size={10} style={{ marginRight: '4px' }} /> StagePass Registry
          </div>

          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '12px' }}>
            Creative Assets & Licensing Registry
          </h2>
          
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '30px', lineHeight: '1.5' }}>
            Inspect waveforms, unlock preview streams, and secure intellectual property rights splits.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="glass-panel glow-purple" style={{
            display: 'flex',
            padding: '6px 8px 6px 16px',
            alignItems: 'center',
            borderRadius: '16px'
          }}>
            <Search size={18} style={{ color: 'var(--accent-purple)', marginRight: '10px' }} />
            
            <input 
              type="text" 
              placeholder="Search by title... or specify: 'melancholic guitar beats'"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '14px',
                padding: '8px 0'
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {searchQuery && (
              <button 
                type="button" 
                onClick={handleClearSearch}
                className="btn btn-secondary" 
                style={{ height: '32px', padding: '0 12px', fontSize: '11px', border: 'none', background: 'transparent' }}
              >
                Clear
              </button>
            )}

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ height: '32px', padding: '0 16px', fontSize: '11px', borderRadius: '10px' }}
            >
              Search
            </button>
          </form>

          {/* NLP queries */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
            <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', alignSelf: 'center', fontWeight: 700 }}>Presets:</span>
            <button 
              type="button"
              onClick={() => handleQuickNlpSearch('melancholic acoustic pop lyrics')}
              className="btn btn-secondary mono" 
              style={{ fontSize: '11px', padding: '4px 10px', height: '28px', borderRadius: '8px' }}
            >
              "acoustic pop lyrics"
            </button>
            <button 
              type="button"
              onClick={() => handleQuickNlpSearch('cyberpunk energy synthwave beats')}
              className="btn btn-secondary mono" 
              style={{ fontSize: '11px', padding: '4px 10px', height: '28px', borderRadius: '8px' }}
            >
              "cyberpunk beats"
            </button>
          </div>

        </div>
      </section>



      {/* Main Catalog Grid */}
      <section className="container">
        
        {/* Category Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-glass)',
          paddingBottom: '16px',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setIsNlpActive(false);
                }}
                className={`btn ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  height: '32px',
                  padding: '0 16px',
                  borderRadius: '10px',
                  fontSize: '12px'
                }}
              >
                {cat === 'All' ? 'All Assets' : cat}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`btn ${showAdvancedFilters ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px', height: '32px', padding: '0 14px', borderRadius: '10px' }}
          >
            <SlidersHorizontal size={14} /> Advanced Filters
          </button>
        </div>

        {/* Expandable Filters */}
        {showAdvancedFilters && (
          <div className="glass-panel" style={{
            padding: '24px',
            borderRadius: '16px',
            marginBottom: '32px',
            background: 'rgba(10, 11, 16, 0.65)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px'
          }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Genre</label>
              <select 
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="form-control form-select"
                style={{ height: '38px', borderRadius: '8px' }}
              >
                <option value="">All Genres</option>
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Language</label>
              <select 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="form-control form-select"
                style={{ height: '38px', borderRadius: '8px' }}
              >
                <option value="">All Languages</option>
                {languages.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Creator Role</label>
              <select 
                value={selectedCreatorType}
                onChange={(e) => setSelectedCreatorType(e.target.value)}
                className="form-control form-select"
                style={{ height: '38px', borderRadius: '8px' }}
              >
                <option value="">All Roles</option>
                {creatorTypes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Pricing</label>
              <select 
                value={selectedPriceType}
                onChange={(e) => setSelectedPriceType(e.target.value)}
                className="form-control form-select"
                style={{ height: '38px', borderRadius: '8px' }}
              >
                <option value="">All Pricing</option>
                <option value="Free">Free Preview</option>
                <option value="Paid">Premium License</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Sort</label>
              <select 
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="form-control form-select"
                style={{ height: '38px', borderRadius: '8px' }}
              >
                <option value="Newest">Newest</option>
                <option value="Popularity">Popularity</option>
              </select>
            </div>
          </div>
        )}

        {/* NLP query details bar */}
        {isNlpActive && (
          <div style={{
            background: 'var(--card-bg)',
            border: '1.5px solid var(--border-glass)',
            padding: '12px 20px',
            borderRadius: '12px',
            marginBottom: '24px',
            fontSize: '12px',
            textAlign: 'left'
          }} className="mono">
            🔍 Matchmaker search: <strong>"{searchQuery}"</strong> ({assets.length} results)
          </div>
        )}

        {/* Grid Cards Container */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px' }}>
            <Loader2 className="spinning-disc" size={28} color="var(--accent-cyan)" />
          </div>
        ) : (
          <div className="grid">
            {assets.map(asset => {
              const isLocked = asset.isLocked;
              const hasAudUrl = !!asset.audioUrl;
              const hasLyrText = asset.type === 'Lyrics';
              const isPlayingThis = playingAsset && playingAsset.id === asset.id && isPlaying;
              
              // Calculate preview duration ratio for mock waveform visualizer
              const totalBars = 22;
              const previewRatio = asset.duration > 0 ? (asset.previewDuration / asset.duration) : 0.25;
              const previewBarLimit = Math.round(totalBars * previewRatio);

              return (
                <div 
                  key={asset.id} 
                  className="card"
                  onClick={() => handleRecordMetric(asset.id, 'view')}
                >
                  {/* Card Banner showing visual waveform preview with ambient glow */}
                  <div className="card-banner">
                    <div className="glow-gradient"></div>
                    <div className="visual-waveform">
                      {[...Array(totalBars)].map((_, i) => {
                        const height = 15 + Math.abs(Math.sin(i * 0.35) * 60) + Math.random() * 10;
                        const inPreviewRange = i <= previewBarLimit;
                        const isBarActive = inPreviewRange || !isLocked;
                        
                        return (
                          <div 
                            key={i}
                            className={`w-bar-micro ${isPlayingThis && isBarActive ? 'wave-bar-active' : ''}`}
                            style={{
                              height: `${Math.min(90, height)}%`,
                              background: isBarActive ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.08)'
                            }}
                          />
                        );
                      })}
                    </div>
                    {isLocked && (
                      <span className="badge badge-gold" style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '9px' }}>
                        <Lock size={8} /> Paywall Active
                      </span>
                    )}
                  </div>

                  {/* Card Details */}
                  <div className="card-body" style={{ textAlign: 'left' }}>
                    <div>
                      <div className="card-title">{asset.title}</div>
                      <div 
                        onClick={(e) => { e.stopPropagation(); onNavigateProfile(asset.creatorId); }}
                        className="card-artist"
                        style={{ cursor: 'pointer', display: 'inline-block' }}
                      >
                        by <span style={{ textDecoration: 'underline', color: '#fff', fontWeight: 600 }}>{asset.creatorName}</span>
                      </div>

                      {/* Excerpt preview */}
                      <div style={{ margin: '14px 0' }}>
                        {hasLyrText ? (
                          <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid var(--border-glass)' }}>
                            <div className="lyrics-preview-container">
                              {asset.previewLyrics.split('\n').slice(0, 2).map((line, idx) => (
                                <span key={idx} className="lyrics-line">{line}</span>
                              ))}
                              {isLocked && <span className="lyrics-line locked">Chorus / Bridge Locked</span>}
                            </div>
                          </div>
                        ) : (
                          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                            {asset.description.substring(0, 80)}
                            {asset.description.length > 80 ? '...' : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '16px', marginTop: '12px' }}>
                      {hasAudUrl ? (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleRecordMetric(asset.id, 'preview'); onPlayAsset(asset); }}
                          className="btn btn-cyan"
                          style={{
                            height: '32px',
                            padding: '0 16px',
                            fontSize: '11px',
                            borderRadius: '8px',
                            background: isPlayingThis ? 'var(--text-main)' : 'rgba(0, 240, 255, 0.1)',
                            color: isPlayingThis ? 'var(--bg-dark)' : 'var(--accent-cyan)'
                          }}
                        >
                          {isPlayingThis ? 'Pause Teaser' : 'Play Teaser'}
                        </button>
                      ) : (
                        !hasLyrText && !isLocked && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); addToast('Downloading stems multi-tracks...', 'info'); }}
                            className="btn btn-cyan"
                            style={{ height: '32px', padding: '0 16px', fontSize: '11px', borderRadius: '8px' }}
                          >
                            Download Stems
                          </button>
                        )
                      )}

                      {/* Buy license control drawer */}
                      <div>
                        {isLocked ? (
                          purchasingAssetId === asset.id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                              <select 
                                value={selectedLicense}
                                onChange={(e) => setSelectedLicense(e.target.value)}
                                className="form-control form-select"
                                style={{ padding: '0 24px 0 8px', fontSize: '10px', height: '26px', width: '100px', borderRadius: '6px' }}
                              >
                                {Object.keys(asset.licensing).map(l => (
                                  <option key={l} value={l}>{l} (₹{asset.licensing[l]})</option>
                                ))}
                              </select>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button 
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setPurchasingAssetId(null); }}
                                  className="btn btn-secondary" 
                                  style={{ height: '22px', padding: '0 8px', fontSize: '9px', borderRadius: '4px' }}
                                >
                                  Cancel
                                </button>
                                <button 
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleConfirmPurchase(asset); }}
                                  className="btn btn-primary" 
                                  style={{ height: '22px', padding: '0 12px', fontSize: '9px', borderRadius: '4px' }}
                                >
                                  Unlock
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handlePurchase(asset.id); }}
                              className="btn btn-amber mono"
                              style={{ height: '32px', padding: '0 16px', fontSize: '11px', fontWeight: 700, borderRadius: '8px' }}
                            >
                              Unlock · ₹{asset.price}
                            </button>
                          )
                        ) : (
                          asset.price > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const purchases = JSON.parse(localStorage.getItem('stagepass_purchases')) || [];
                                const purchase = purchases.find(p => p.buyerId === currentUser.username && p.assetId === asset.id);
                                if (purchase) {
                                  onShowCertificate(purchase);
                                } else {
                                  onShowCertificate({
                                    assetTitle: asset.title,
                                    assetType: asset.type,
                                    creatorName: asset.creatorName,
                                    creatorId: asset.creatorId,
                                    buyerName: currentUser.artistName,
                                    buyerId: currentUser.username,
                                    timestamp: asset.timestamp,
                                    licenseType: 'creator ownership',
                                    licenseCertCode: 'CREATOR-ORIGINAL-REG'
                                  });
                                }
                              }}
                              className="btn btn-cyan mono"
                              style={{ height: '32px', padding: '0 16px', fontSize: '11px', fontWeight: 600, borderRadius: '8px' }}
                            >
                              License Verified ✓
                            </button>
                          )
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}

            {assets.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }} className="mono">
                No active creative assets match these filter selections.
              </div>
            )}
          </div>
        )}

      </section>

    </div>
  );
}
