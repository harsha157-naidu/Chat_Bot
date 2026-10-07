import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Camera, 
  Mic, 
  Video, 
  FileText, 
  Image as ImageIcon, 
  Send, 
  Sparkles, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Search,
  MessageSquare,
  Bot
} from 'lucide-react';
import Message from '../components/Message';
import LoadingAnimation from '../components/LoadingAnimation';
import { chatAPI } from '../services/api';

export default function Chat({
  chats = [],
  activeChatId,
  onSelectChat,
  onCreateChat,
  onDeleteChat,
  messages = [],
  isProcessing = false,
  processingType = 'text',
  onSendMessage,
  onOpenCamera,
  onOpenVoice,
  onOpenUpload,
  onOpenSettings,
  userSettings
}) {
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const safeChats = Array.isArray(chats) ? chats : [];
  const safeMessages = Array.isArray(messages) ? messages : [];

  // Reliable scroll strictly to bottom of chat messages
  const scrollToBottom = (behavior = 'smooth') => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior
      });
    }
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  // Auto-scroll on new messages or thinking status
  useEffect(() => {
    scrollToBottom('smooth');
    const timer = setTimeout(() => scrollToBottom('smooth'), 120);
    return () => clearTimeout(timer);
  }, [safeMessages, isProcessing, activeChatId]);

  // Handle Text-to-Speech
  const handleSpeak = (text) => {
    if (!text || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    if (userSettings?.speech_rate) utterance.rate = userSettings.speech_rate;
    if (userSettings?.speech_pitch) utterance.pitch = userSettings.speech_pitch;

    if (userSettings?.selected_voice) {
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find(v => v.name === userSettings.selected_voice);
      if (match) utterance.voice = match;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Auto-speak new AI response if voice_enabled setting is active
  useEffect(() => {
    if (userSettings?.voice_enabled && safeMessages.length > 0) {
      const lastMsg = safeMessages[safeMessages.length - 1];
      if (lastMsg && lastMsg.sender === 'ai' && lastMsg.message_text) {
        handleSpeak(lastMsg.message_text);
      }
    }
  }, [safeMessages, userSettings?.voice_enabled]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    setInputText('');
    onSendMessage({
      chatId: activeChatId,
      text: textToSend,
      messageType: 'text'
    });
  };

  const filteredChats = safeChats.filter(c => 
    (c && c.title ? c.title : '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '280px 1fr',
      height: '100%',
      minHeight: 0,
      background: 'var(--bg-primary)',
      overflow: 'hidden'
    }}>
      {/* LEFT SIDEBAR: History & Chats */}
      <aside style={{
        borderRight: '1px solid var(--border-subtle)',
        background: 'rgba(12, 14, 21, 0.8)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden'
      }}>
        {/* New Chat Button */}
        <button
          onClick={onCreateChat}
          className="btn-primary"
          style={{
            width: '100%',
            justifyContent: 'center',
            marginBottom: '14px',
            padding: '11px',
            fontSize: '0.875rem'
          }}
        >
          <Plus size={16} /> New Chat
        </button>

        {/* Search input */}
        <div style={{
          position: 'relative',
          marginBottom: '14px'
        }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px 8px 32px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              fontSize: '0.8rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Chats List */}
        <div style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 6px' }}>
            Chat History
          </span>

          {filteredChats.length === 0 ? (
            <div style={{ padding: '20px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No conversations yet. Start a new session above!
            </div>
          ) : (
            filteredChats.map(c => {
              const isActive = c.id === activeChatId;
              return (
                <div
                  key={c.id}
                  onClick={() => onSelectChat(c.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                    color: isActive ? '#38bdf8' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <MessageSquare size={14} style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.title || 'Conversation'}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(c.id);
                    }}
                    className="btn-icon"
                    style={{
                      width: '24px',
                      height: '24px',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-muted)'
                    }}
                    title="Delete Chat"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
        <div style={{
          paddingTop: '14px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={onOpenSettings}
            className="btn-secondary"
            style={{ width: '100%', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <Sliders size={14} /> Voice & Preferences
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN AREA: Conversation Stream + Multimodal Bar */}
      <main style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Chat Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(9, 10, 15, 0.5)',
          backdropFilter: 'blur(12px)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
              {safeChats.find(c => c && c.id === activeChatId)?.title || 'SenseSphere Interactive Session'}
            </span>
            <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>
              Omni-Multimodal
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isSpeaking && (
              <button
                onClick={handleStopSpeak}
                className="badge badge-purple"
                style={{ cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <VolumeX size={12} /> Stop Voice
              </button>
            )}
          </div>
        </div>

        {/* Messages Stream */}
        <div 
          ref={chatContainerRef}
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '24px 32px'
          }}
        >
          {safeMessages.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                boxShadow: '0 0 30px rgba(56, 189, 248, 0.4)'
              }}>
                <Sparkles size={32} color="#090a0f" />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                How can SenseSphere assist you today?
              </h2>
              <p style={{ fontSize: '0.9rem', maxWidth: '480px', lineHeight: 1.5, marginBottom: '24px' }}>
                You can ask questions, open your camera, speak with your microphone, or upload images, audio, video, and documents below.
              </p>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button onClick={onOpenCamera} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                  <Camera size={15} color="#38bdf8" /> Open Camera
                </button>
                <button onClick={onOpenVoice} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                  <Mic size={15} color="#818cf8" /> Speak via Mic
                </button>
                <button onClick={() => onOpenUpload('image')} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                  <ImageIcon size={15} color="#f59e0b" /> Upload Image
                </button>
                <button onClick={() => onOpenUpload('video')} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                  <Video size={15} color="#c084fc" /> Upload Video
                </button>
              </div>
            </div>
          ) : (
            <div>
              {safeMessages.map((msg, idx) => (
                <Message
                  key={msg.id || idx}
                  message={msg}
                  onSpeak={handleSpeak}
                  isSpeaking={isSpeaking}
                  onStopSpeak={handleStopSpeak}
                />
              ))}

              {/* Progressive Thinking & Analysis Animation */}
              {isProcessing && (
                <LoadingAnimation mediaType={processingType} />
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Multimodal Input Bar (Camera, Voice, Video, Document, Image, Text) */}
        <div style={{
          padding: '16px 24px',
          background: 'rgba(9, 10, 15, 0.85)',
          borderTop: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(20px)',
          flexShrink: 0
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(22, 27, 38, 0.85)',
            border: '1px solid var(--border-medium)',
            borderRadius: '20px',
            padding: '8px 14px',
            boxShadow: 'var(--shadow-md)'
          }}>
            {/* Multimodal Sensory Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={onOpenCamera}
                className="btn-icon"
                title="Open Camera (Opt-in live snapshot)"
                style={{ width: '36px', height: '36px', color: '#38bdf8' }}
              >
                <Camera size={18} />
              </button>

              <button
                onClick={onOpenVoice}
                className="btn-icon"
                title="Speak using Microphone"
                style={{ width: '36px', height: '36px', color: '#818cf8' }}
              >
                <Mic size={18} />
              </button>

              <button
                onClick={() => onOpenUpload('image')}
                className="btn-icon"
                title="Upload Photo / Diagram"
                style={{ width: '36px', height: '36px', color: '#f59e0b' }}
              >
                <ImageIcon size={18} />
              </button>

              <button
                onClick={() => onOpenUpload('video')}
                className="btn-icon"
                title="Upload Video Stream"
                style={{ width: '36px', height: '36px', color: '#c084fc' }}
              >
                <Video size={18} />
              </button>

              <button
                onClick={() => onOpenUpload('document')}
                className="btn-icon"
                title="Upload PDF / Document"
                style={{ width: '36px', height: '36px', color: '#10b981' }}
              >
                <FileText size={18} />
              </button>
            </div>

            <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)', margin: '0 4px' }} />

            {/* Query Input */}
            <input
              type="text"
              placeholder="Ask SenseSphere anything, or use the camera / mic buttons..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                padding: '6px 4px'
              }}
            />

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="btn-primary"
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                opacity: inputText.trim() ? 1 : 0.4,
                cursor: inputText.trim() ? 'pointer' : 'default'
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
