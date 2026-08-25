import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react';

export default function AudioPlayer({ asset, isPlaying, onPlayPause, onClose }) {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!asset) return;
    const audio = audioRef.current;
    if (!audio) return;

    setIsLoading(true);
    audio.src = asset.audioUrl || '';
    audio.volume = volume;
    audio.load();

    if (isPlaying) {
      audio.play().catch(() => {});
    }
  }, [asset]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);

    // Auto-stop at previewDuration watermark boundary
    if (asset && asset.isLocked && asset.previewDuration && audio.currentTime >= asset.previewDuration) {
      audio.pause();
      audio.currentTime = 0;
      onPlayPause(false);
    }
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration);
    setIsLoading(false);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = clickX / rect.width;
    const maxTime = asset && asset.isLocked && asset.previewDuration
      ? Math.min(audio.duration, asset.previewDuration)
      : audio.duration;
    audio.currentTime = ratio * maxTime;
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const previewLimit = asset && asset.isLocked && asset.previewDuration ? asset.previewDuration : duration;
  const progressRatio = previewLimit > 0 ? Math.min(currentTime / previewLimit, 1) : 0;
  const previewRatio = duration > 0 && previewLimit > 0 ? previewLimit / duration : 1;

  if (!asset) return null;

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => onPlayPause(false)}
      />

      {/* Floating DAW Console Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 500,
        background: 'rgba(5, 4, 9, 0.92)',
        backdropFilter: 'blur(24px)',
        borderTop: '1.5px solid var(--border-glass)',
        padding: '10px 28px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        boxShadow: '0 -4px 30px rgba(0, 240, 255, 0.08)'
      }}>

        {/* Track Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))',
            display: 'grid',
            placeItems: 'center',
            fontSize: '14px',
            flexShrink: 0
          }}>
            🎵
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#fff',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {asset.title}
            </div>
            <div className="mono" style={{ fontSize: '10px', color: 'var(--accent-cyan)' }}>
              {asset.creatorName}
              {asset.isLocked && <span style={{ color: 'var(--accent-amber)', marginLeft: '6px' }}>🔒 Teaser</span>}
            </div>
          </div>
        </div>

        {/* Transport Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => {
              if (audioRef.current) audioRef.current.currentTime = 0;
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'grid',
              placeItems: 'center',
              borderRadius: '50%'
            }}
          >
            <SkipBack size={16} />
          </button>

          <button
            onClick={() => onPlayPause(!isPlaying)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'var(--accent-cyan)',
              border: 'none',
              color: '#000',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 0 14px rgba(0, 240, 255, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            {isPlaying ? <Pause size={16} fill="#000" /> : <Play size={16} fill="#000" />}
          </button>

          <button
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'grid',
              placeItems: 'center'
            }}
          >
            <SkipForward size={16} />
          </button>
        </div>

        {/* Seek Timeline Bar */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '36px', textAlign: 'right' }}>
            {formatTime(currentTime)}
          </span>

          <div
            onClick={handleSeek}
            style={{
              flex: 1,
              height: '4px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '2px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Greyed out non-preview zone */}
            {asset.isLocked && previewRatio < 1 && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: `${(1 - previewRatio) * 100}%`,
                background: 'rgba(255, 153, 0, 0.08)',
                borderLeft: '1.5px solid rgba(255, 153, 0, 0.3)'
              }} />
            )}
            {/* Playhead progress */}
            <div style={{
              height: '100%',
              width: `${progressRatio * previewRatio * 100}%`,
              background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-cyan))',
              borderRadius: '2px',
              boxShadow: '0 0 6px rgba(0, 240, 255, 0.5)',
              transition: 'width 0.1s linear'
            }} />
          </div>

          <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '36px' }}>
            {asset.isLocked ? `${formatTime(previewLimit)}⁻` : formatTime(duration)}
          </span>
        </div>

        {/* Volume Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '120px' }}>
          <button
            onClick={() => setIsMuted(!isMuted)}
            style={{
              background: 'transparent',
              border: 'none',
              color: isMuted ? 'var(--accent-amber)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center'
            }}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={isMuted ? 0 : volume}
            onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
            style={{
              flex: 1,
              accentColor: 'var(--accent-cyan)',
              cursor: 'pointer',
              height: '4px'
            }}
          />
        </div>

        {/* Close console */}
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px',
            display: 'grid',
            placeItems: 'center',
            borderRadius: '6px',
            transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <X size={16} />
        </button>

      </div>
    </>
  );
}
