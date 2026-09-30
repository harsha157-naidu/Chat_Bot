import React, { useState } from 'react';
import { 
  Camera, 
  Mic, 
  Video, 
  FileText, 
  Send, 
  Sparkles, 
  ArrowRight, 
  Image as ImageIcon,
  Cpu,
  Shield,
  Layers,
  CheckCircle2
} from 'lucide-react';

export default function Home({ 
  onStartChatWithPrompt, 
  onOpenCamera, 
  onOpenVoice, 
  onOpenUpload, 
  onOpenAuth,
  user
}) {
  const [prompt, setPrompt] = useState('');

  const handleAsk = (e) => {
    e?.preventDefault();
    if (prompt.trim()) {
      onStartChatWithPrompt(prompt.trim());
    }
  };

  const samplePrompts = [
    { text: "What is wrong with this device?", icon: "🛠️", tag: "Diagnostic" },
    { text: "What ports are visible on this laptop?", icon: "💻", tag: "Vision" },
    { text: "Identify this plant and assess health.", icon: "🌿", tag: "Botany" },
    { text: "Tell me what is visible through my camera.", icon: "📷", tag: "Live Camera" },
    { text: "Summarize this audio recording.", icon: "🎧", tag: "Acoustic" },
    { text: "What is happening in this video?", icon: "🎥", tag: "Temporal" },
    { text: "Read this document and extract key points.", icon: "📄", tag: "Document" },
    { text: "Who created SenseSphere AI?", icon: "👤", tag: "Identity" }
  ];

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '60px 24px 80px 24px', textAlign: 'center' }}>
      {/* Hero Badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '9999px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', marginBottom: '24px' }}>
        <Sparkles size={16} color="#38bdf8" />
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Next-Gen Multimodal Intelligence
        </span>
      </div>

      {/* Hero Title */}
      <h1 style={{
        fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
        fontWeight: 800,
        letterSpacing: '-0.03em',
        lineHeight: 1.1,
        marginBottom: '16px',
        color: '#ffffff'
      }}>
        SenseSphere <span style={{
          background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>AI</span>
      </h1>

      {/* Tagline */}
      <p style={{
        fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
        color: 'var(--text-secondary)',
        maxWidth: '680px',
        margin: '0 auto 36px auto',
        fontWeight: 400,
        lineHeight: 1.5
      }}>
        Ask anything. Show anything. Speak anything.<br />
        <span style={{ color: '#f8fafc', fontWeight: 600 }}>Let SenseSphere understand it.</span>
      </p>

      {/* Main Interactive Query Input Box */}
      <div className="glass-panel" style={{
        maxWidth: '740px',
        margin: '0 auto 32px auto',
        padding: '8px 10px 8px 20px',
        borderRadius: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        border: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-glow)',
        background: 'rgba(16, 20, 30, 0.85)'
      }}>
        <input
          type="text"
          placeholder="Ask SenseSphere anything or describe what you want to analyze..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '1.05rem',
            color: '#ffffff',
            fontFamily: 'inherit'
          }}
        />

        <button
          onClick={handleAsk}
          className="btn-primary"
          style={{
            padding: '12px 24px',
            borderRadius: '9999px',
            background: '#ffffff',
            color: '#090a0f',
            fontWeight: 700
          }}
        >
          <span>Ask</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* 4 Multimodal Quick Action Buttons as specified in the ASCII blueprint */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '48px'
      }}>
        <button
          onClick={onOpenCamera}
          className="btn-secondary"
          style={{
            padding: '12px 22px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.95rem',
            fontWeight: 600
          }}
        >
          <Camera size={20} color="#38bdf8" />
          <span>Camera</span>
        </button>

        <button
          onClick={onOpenVoice}
          className="btn-secondary"
          style={{
            padding: '12px 22px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.95rem',
            fontWeight: 600
          }}
        >
          <Mic size={20} color="#818cf8" />
          <span>Voice</span>
        </button>

        <button
          onClick={() => onOpenUpload('video')}
          className="btn-secondary"
          style={{
            padding: '12px 22px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.95rem',
            fontWeight: 600
          }}
        >
          <Video size={20} color="#c084fc" />
          <span>Video</span>
        </button>

        <button
          onClick={() => onOpenUpload('document')}
          className="btn-secondary"
          style={{
            padding: '12px 22px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.95rem',
            fontWeight: 600
          }}
        >
          <FileText size={20} color="#10b981" />
          <span>Document</span>
        </button>

        <button
          onClick={() => onOpenUpload('image')}
          className="btn-secondary"
          style={{
            padding: '12px 22px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.95rem',
            fontWeight: 600
          }}
        >
          <ImageIcon size={20} color="#f59e0b" />
          <span>Image</span>
        </button>
      </div>

      {/* Suggested Prompt Inspiration Cards */}
      <div style={{ textAlign: 'left', marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '14px', textAlign: 'center' }}>
          Explore What SenseSphere AI Can Do
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '12px'
        }}>
          {samplePrompts.map((item, i) => (
            <div
              key={i}
              onClick={() => onStartChatWithPrompt(item.text)}
              className="glass-panel"
              style={{
                padding: '16px',
                borderRadius: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{item.tag}</span>
              </div>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
                "{item.text}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Promise Banner */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 24px',
        borderRadius: '14px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-subtle)',
        fontSize: '0.85rem',
        color: 'var(--text-muted)'
      }}>
        <Shield size={16} color="#10b981" />
        <span>Privacy-First: Camera and Microphone are requested <strong>only upon explicit click</strong> with visible browser indicators.</span>
      </div>
    </div>
  );
}
