import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Send, AlertCircle, Sparkles } from 'lucide-react';

export default function AudioRecorder({ isOpen, onClose, onSpeechResult }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [speechLang, setSpeechLang] = useState('en-IN');
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    if (!isOpen) {
      stopAll();
      setTranscript('');
      setErrorMessage(null);
      return;
    }

    startListening();

    return () => {
      stopAll();
    };
  }, [isOpen, speechLang]);

  const startListening = () => {
    setErrorMessage(null);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (e) {}
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = speechLang || 'en-IN';

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event) => {
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript;
          }
          if (fullTranscript.trim()) {
            setTranscript(fullTranscript);
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser.');
          } else if (event.error !== 'no-speech') {
            setErrorMessage(`Speech recognition error: ${event.error}`);
          }
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        fallbackAudioRecording();
      }
    } else {
      fallbackAudioRecording();
    }
  };

  const fallbackAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice-recording-${Date.now()}.webm`, { type: 'audio/webm' });
        setTranscript('Audio voice message recorded');
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      setErrorMessage('Could not initialize microphone. Please check your browser permissions.');
    }
  };

  const stopAll = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      } catch (e) {}
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
  };

  const handleSend = () => {
    if (transcript.trim()) {
      onSpeechResult(transcript.trim());
      onClose();
    }
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
        maxWidth: '520px',
        padding: '24px',
        background: '#0d111a',
        border: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
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
              <Mic size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Voice Interaction</h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Speak in natural language</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Language Selector */}
            <select
              value={speechLang}
              onChange={(e) => setSpeechLang(e.target.value)}
              style={{
                fontSize: '0.75rem',
                padding: '4px 8px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#f8fafc',
                border: '1px solid var(--border-medium)',
                cursor: 'pointer'
              }}
              title="Select speech recognition language"
            >
              <option value="en-IN">English (India)</option>
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="te-IN">Telugu (తెలుగు)</option>
              <option value="hi-IN">Hindi (हिंदी)</option>
              <option value="ta-IN">Tamil (தமிழ்)</option>
            </select>

            <button onClick={onClose} className="btn-icon" style={{ width: '28px', height: '28px' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Dynamic Voice Wave Animation Area */}
        <div style={{
          padding: '20px',
          borderRadius: '14px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          {/* Animated Glowing Mic Circle */}
          <div style={{
            position: 'relative',
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: isRecording ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: isRecording ? '2px solid #38bdf8' : '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            boxShadow: isRecording ? '0 0 25px rgba(56, 189, 248, 0.45)' : 'none',
            transition: 'all 0.3s ease'
          }}>
            <Mic size={30} color={isRecording ? '#38bdf8' : 'var(--text-secondary)'} />
          </div>

          {/* Sound Wave Bars */}
          {isRecording ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', height: '24px', marginBottom: '10px' }}>
              {[...Array(12)].map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: '4px',
                    borderRadius: '9999px',
                    background: 'linear-gradient(to top, #38bdf8, #818cf8)',
                    animation: `waveBar 0.8s ease-in-out infinite`,
                    animationDelay: `${i * 0.08}s`
                  }}
                />
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Microphone paused
            </p>
          )}

          <p style={{ fontSize: '0.82rem', color: isRecording ? '#38bdf8' : 'var(--text-secondary)', fontWeight: 600, margin: 0 }}>
            {isRecording ? 'Listening... Speak your question now' : 'Click "Resume Speaking" below to start'}
          </p>
        </div>

        {/* Live Editable Transcription Box */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Recognized Speech (Editable)
            </label>
            {transcript && (
              <button
                type="button"
                onClick={() => setTranscript('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Clear text
              </button>
            )}
          </div>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && transcript.trim()) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isRecording ? 'Listening... Spoken words stream here in real-time. You can edit any word.' : 'Your spoken words will appear here. You can type or correct words before sending.'}
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-medium)',
              color: '#f8fafc',
              fontSize: '0.9rem',
              lineHeight: 1.5,
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
          />

          {errorMessage && (
            <p style={{ color: '#f43f5e', fontSize: '0.8rem', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} /> {errorMessage}
            </p>
          )}
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {isRecording ? (
            <button onClick={stopAll} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
              <MicOff size={16} /> Pause Mic
            </button>
          ) : (
            <button onClick={startListening} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
              <Mic size={16} /> Resume Speaking
            </button>
          )}

          <button 
            onClick={handleSend}
            disabled={!transcript.trim()}
            className="btn-primary"
            style={{
              fontSize: '0.85rem',
              opacity: transcript.trim() ? 1 : 0.45,
              cursor: transcript.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            <Send size={15} /> Send Question
          </button>
        </div>
      </div>
    </div>
  );
}
