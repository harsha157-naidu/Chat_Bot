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
  ExternalLink,
  Code
} from 'lucide-react';

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      margin: '12px 0',
      borderRadius: '10px',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      background: '#090d16',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.45)'
    }}>
      {/* Code Block Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        background: 'rgba(255, 255, 255, 0.04)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '0.78rem',
        color: '#94a3b8'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: '#38bdf8'
        }}>
          <Code size={14} />
          <span>{language || 'code'}</span>
        </div>
        <button
          onClick={handleCopyCode}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: copied ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.06)',
            color: copied ? '#10b981' : '#cbd5e1',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title="Copy full code snippet"
        >
          {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
          <span>{copied ? 'Copied!' : 'Copy code'}</span>
        </button>
      </div>

      {/* Code Content */}
      <pre style={{
        margin: 0,
        padding: '14px 16px',
        overflowX: 'auto',
        fontSize: '0.85rem',
        lineHeight: 1.6,
        fontFamily: "'Fira Code', 'Consolas', 'Courier New', monospace",
        color: '#e2e8f0',
        whiteSpace: 'pre',
        background: 'transparent'
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Inline bold/code/link parser
const renderInlineStyles = (str) => {
  if (!str || typeof str !== 'string') return null;
  // Match links [text](url), bold **text**, and inline code `code`
  const regex = /(\[.*?\]\(https?:\/\/.*?\)|\*\*.*?\*\*|`.*?`)/g;
  const parts = str.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;
    
    // Markdown links: [Title](https://...)
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const match = part.match(/^\[(.*?)\]\((https?:\/\/.*?)\)$/);
      if (match) {
        return (
          <a
            key={index}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#38bdf8',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              borderBottom: '1px dashed #38bdf8',
              transition: 'color 0.2s'
            }}
          >
            {match[1]}
            <ExternalLink size={12} />
          </a>
        );
      }
    }

    // Bold text: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return <strong key={index} style={{ color: '#ffffff', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    }

    // Inline code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={index} style={{
          background: 'rgba(255, 255, 255, 0.08)',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '0.85em',
          fontFamily: "'Fira Code', 'Consolas', monospace",
          color: '#38bdf8'
        }}>
          {part.slice(1, -1)}
        </code>
      );
    }

    return part;
  });
};

// Helper to format markdown text and interactive code blocks
const formatText = (content) => {
  if (!content || typeof content !== 'string') return null;

  // Split into alternating text and code blocks
  const blocks = [];
  const codeBlockRegex = /```([a-zA-Z0-9_\-\+]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({
        type: 'text',
        content: content.slice(lastIndex, match.index)
      });
    }
    blocks.push({
      type: 'code',
      language: match[1] || 'code',
      code: match[2].trimEnd()
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    blocks.push({
      type: 'text',
      content: content.slice(lastIndex)
    });
  }

  return blocks.map((block, blockIdx) => {
    if (block.type === 'code') {
      return <CodeBlock key={`code-${blockIdx}`} language={block.language} code={block.code} />;
    }

    // Text block paragraphs
    const paragraphs = block.content.split('\n');

    return (
      <div key={`text-${blockIdx}`}>
        {paragraphs.map((para, i) => {
          const trimmed = para.trim();

          // Headers
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={i} style={{ fontSize: '1rem', fontWeight: 700, margin: '14px 0 6px 0', color: '#38bdf8' }}>
                {renderInlineStyles(trimmed.replace('### ', ''))}
              </h4>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h3 key={i} style={{ fontSize: '1.1rem', fontWeight: 700, margin: '16px 0 8px 0', color: '#ffffff' }}>
                {renderInlineStyles(trimmed.replace('## ', ''))}
              </h3>
            );
          }
          if (trimmed.startsWith('# ')) {
            return (
              <h2 key={i} style={{ fontSize: '1.25rem', fontWeight: 800, margin: '18px 0 10px 0', color: '#ffffff' }}>
                {renderInlineStyles(trimmed.replace('# ', ''))}
              </h2>
            );
          }
          // Blockquotes
          if (trimmed.startsWith('> ')) {
            return (
              <blockquote key={i} style={{
                margin: '8px 0 8px 10px',
                paddingLeft: '12px',
                borderLeft: '3px solid #38bdf8',
                color: '#94a3b8',
                fontStyle: 'italic'
              }}>
                {renderInlineStyles(trimmed.replace(/^>\s*/, ''))}
              </blockquote>
            );
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
        })}
      </div>
    );
  });
};

export default function Message({ message, onSpeak, isSpeaking, onStopSpeak }) {
  const [copied, setCopied] = useState(false);

  const isAI = message.sender === 'ai';
  const mediaList = message.media || [];

  const handleCopy = () => {
    navigator.clipboard.writeText(message.message_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
