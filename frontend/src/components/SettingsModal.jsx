import React, { useState, useEffect } from 'react';
import { X, Volume2, Sliders, Moon, Sun, Key, Save, Check } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, settings, onSaveSettings }) {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [theme, setTheme] = useState('dark');
  const [voices, setVoices] = useState([]);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
        if (!selectedVoice && available.length > 0) {
          const defaultV = available.find(v => v.lang.startsWith('en')) || available[0];
          setSelectedVoice(defaultV?.name || '');
        }
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    if (settings) {
      setVoiceEnabled(Boolean(settings.voice_enabled));
      if (settings.speech_rate) setSpeechRate(settings.speech_rate);
      if (settings.speech_pitch) setSpeechPitch(settings.speech_pitch);
      if (settings.theme) setTheme(settings.theme);
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    onSaveSettings({
      voice_enabled: voiceEnabled ? 1 : 0,
      speech_rate: parseFloat(speechRate),
      speech_pitch: parseFloat(speechPitch),
      theme: theme,
      selected_voice: selectedVoice
    });

    document.documentElement.setAttribute('data-theme', theme);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 7, 10, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '540px',
        padding: '24px',
        background: '#0d111a',
        border: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8'
            }}>
              <Sliders size={18} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Settings & Preferences</h3>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Voice Output Configuration */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Voice & Speech Synthesis
          </h4>

          {/* Toggle Auto Speak */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '10px',
            marginBottom: '12px'
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Auto-speak AI responses</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Automatically reads replies using text-to-speech</div>
            </div>
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={(e) => setVoiceEnabled(e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#38bdf8' }}
            />
          </div>

          {/* Voice Selector */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Synthesizer Voice
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                background: '#161b26',
                border: '1px solid var(--border-medium)',
                color: '#f8fafc',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            >
              {voices.map((v, i) => (
                <option key={i} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Speech Rate Slider */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Speech Speed</span>
                <span>{speechRate}x</span>
              </label>
              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(e.target.value)}
                style={{ width: '100%', marginTop: '6px', accentColor: '#38bdf8' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Speech Pitch</span>
                <span>{speechPitch}x</span>
              </label>
              <input
                type="range"
                min="0.8"
                max="1.3"
                step="0.1"
                value={speechPitch}
                onChange={(e) => setSpeechPitch(e.target.value)}
                style={{ width: '100%', marginTop: '6px', accentColor: '#38bdf8' }}
              />
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Interface Theme
          </h4>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setTheme('dark')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '8px',
                background: theme === 'dark' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: theme === 'dark' ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                color: theme === 'dark' ? '#38bdf8' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              <Moon size={15} /> Dark Mode
            </button>

            <button
              onClick={() => setTheme('light')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '8px',
                background: theme === 'light' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: theme === 'light' ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                color: theme === 'light' ? '#38bdf8' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              <Sun size={15} /> Light Mode
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          {savedNotice ? (
            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <Check size={16} /> Preferences Saved!
            </span>
          ) : <span />}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary" style={{ fontSize: '0.85rem' }}>
              <Save size={15} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
