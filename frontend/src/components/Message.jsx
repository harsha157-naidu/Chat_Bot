import React, { useState } from 'react';
import { 
  Sparkles, 
  User, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  FileText, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Music as AudioIcon,
  Camera,
  ExternalLink
} from 'lucide-react';

export default function Message({ message, onSpeak, isSpeaking, onStopSpeak }) {
  const [copied, setCopied] = useState(false);

  const isAI = message.sender === 'ai';
  const mediaList = message.media || [];

  const handleCopy = () => {
    navigator.clipboard.writeText(message.message_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to format basic markdown-style text safely
  // Helper to format basic markdown-style text safely
  const formatText = (content) => {
    if (!content || typeof content !== 'string') return null;

    // Split paragraphs
    const paragraphs = content.split('\n');

    return paragraphs.map((para, i) => {
      const trimmed = para.trim();

      // Headers
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={i} style={{ fontSize: '1rem', fontWeight: 700, margin: '14px 0 6px 0', color: '#38bdf8' }}>
            {trimmed.replace('### ', '')}
          </h4>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={i} style={{ fontSize: '1.1rem', fontWeight: 700, margin: '16px 0 8px 0', color: '#ffffff' }}>
            {trimmed.replace('## ', '')}
          </h3>
        );
      }
      // Code blocks (simple detection)
      if (trimmed.startsWith('```')) {
        return null;
      }
      // Bullet items
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <div key={i} style={{ display: 'flex', gap: '8px', marginLeft: '12px', marginBottom: '4px' }}>
            <span style={{ color: '#38bdf8' }}>•</span>
            <span>{renderInlineStyles(trimmed.replace(/^[-*]\s+/, ''))}</span>
          </div>
        );
      }
      // Numbered items
      if (/^\d+\.\s/.test(trimmed)) {
        const numMatch = trimmed.match(/^\d+\./);
        const prefix = numMatch ? numMatch[0] : `${i + 1}.`;
        return (
          <div key={i} style={{ display: 'flex', gap: '8px', marginLeft: '12px', marginBottom: '4px' }}>
            <span style={{ color: '#818cf8', fontWeight: 600 }}>{prefix}</span>
            <span>{renderInlineStyles(trimmed.replace(/^\d+\.\s+/, ''))}</span>
          </div>
        );
      }
      if (trimmed === '') {
        return <div key={i} style={{ height: '8px' }} />;
      }
      return (
        <p key={i} style={{ marginBottom: '6px', lineHeight: 1.6 }}>
          {renderInlineStyles(para)}
        </p>
      );
    });
  };

  // Inline bold/code parser
  const renderInlineStyles = (str) => {
    if (!str || typeof str !== 'string') return null;
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (!part) return null;
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return <strong key={index} style={{ color: '#ffffff', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code key={index} style={{
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.85em',
            fontFamily: 'var(--font-mono)',
            color: '#38bdf8'
          }}>
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div style={{
      display: 'flex',
      gap: '14px',
      margin: '18px 0',
      alignItems: 'flex-start',
      flexDirection: isAI ? 'row' : 'row-reverse'
    }}>
      {/* Avatar */}
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: isAI ? 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)' : 'rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: isAI ? '0 0 16px rgba(56, 189, 248, 0.35)' : 'none',
        color: isAI ? '#090a0f' : '#ffffff'
      }}>
        {isAI ? <Sparkles size={18} strokeWidth={2.5} /> : <User size={18} />}
      </div>

      {/* Bubble Container */}
      <div style={{
        maxWidth: '82%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isAI ? 'flex-start' : 'flex-end'
      }}>
        {/* Media Preview Attachment Card */}
        {mediaList.length > 0 && (
          <div style={{ marginBottom: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {mediaList.map((m, idx) => {
              const url = m.file_url?.startsWith('http') || m.file_url?.startsWith('blob') ? m.file_url : m.file_url;
              const isImg = m.file_type === 'image' || m.file_name?.match(/\.(jpe?g|png|webp|gif)$/i);
              const isVid = m.file_type === 'video' || m.file_name?.match(/\.(mp4|webm|mov)$/i);
              const isAud = m.file_type === 'audio' || m.file_name?.match(/\.(mp3|wav|m4a|ogg)$/i);

              if (isImg) {
                return (
                  <div key={idx} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-medium)', maxWidth: '320px', background: '#000' }}>
                    <img src={url} alt={m.file_name} style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', display: 'block' }} />
                  </div>
                );
              }
              if (isVid) {
                return (
                  <div key={idx} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-medium)', maxWidth: '360px', background: '#000' }}>
                    <video src={url} controls style={{ width: '100%', maxHeight: '220px', display: 'block' }} />
                  </div>
                );
              }
              if (isAud) {
                return (
                  <div key={idx} style={{ borderRadius: '12px', padding: '8px', border: '1px solid var(--border-medium)', background: 'rgba(255, 255, 255, 0.05)' }}>
                    <audio src={url} controls style={{ maxWidth: '300px' }} />
                  </div>
                );
              }
              return (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <FileText size={16} color="#38bdf8" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{m.file_name}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Message Content Bubble */}
        <div style={{
          padding: '14px 18px',
          borderRadius: isAI ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
          background: isAI ? 'rgba(22, 27, 38, 0.85)' : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-subtle)',
          boxShadow: isAI ? 'var(--shadow-md)' : 'none',
          color: 'var(--text-primary)',
          fontSize: '0.925rem'
        }}>
          {formatText(message.message_text)}
        </div>

        {/* AI Action Toolbar & Telemetry */}
        {isAI && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '8px',
            fontSize: '0.72rem',
            color: 'var(--text-muted)'
          }}>
            {/* TTS Voice Speak Button */}
            <button
              onClick={() => {
                if (isSpeaking) onStopSpeak();
                else onSpeak(message.message_text);
              }}
              className="btn-icon"
              style={{ width: '28px', height: '28px', borderRadius: '50%' }}
              title={isSpeaking ? 'Stop speaking' : 'Read aloud with AI voice'}
            >
              {isSpeaking ? <VolumeX size={14} color="#f43f5e" /> : <Volume2 size={14} />}
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="btn-icon"
              style={{ width: '28px', height: '28px', borderRadius: '50%' }}
              title="Copy message text"
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            </button>

            {/* Model Tag */}
            <span style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '2px 8px', borderRadius: '4px' }}>
              {message.aiResponse?.model_name || 'SenseSphere-Omni'}
            </span>

            {/* Processing Time */}
            {message.aiResponse?.processing_time && (
              <span>
                {message.aiResponse.processing_time}ms
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
