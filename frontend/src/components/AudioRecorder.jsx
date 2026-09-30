import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Send, AlertCircle, Sparkles } from 'lucide-react';

export default function AudioRecorder({ isOpen, onClose, onSpeechResult }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
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
  }, [isOpen]);

  const startListening = () => {
    setErrorMessage(null);
    setTranscript('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser.');
          } else {
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
          marginBottom: '20px'
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
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Voice Interaction</h3>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Dynamic Voice Wave Animation Area */}
        <div style={{
          padding: '30px 20px',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          {/* Animated Glowing Mic Circle */}
          <div style={{
            position: 'relative',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: isRecording ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: isRecording ? '2px solid #38bdf8' : '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: isRecording ? '0 0 30px rgba(56, 189, 248, 0.4)' : 'none',
            transition: 'all 0.3s ease'
          }}>
            <Mic size={36} color={isRecording ? '#38bdf8' : 'var(--text-secondary)'} />
          </div>

          {/* Sound Wave Bars */}
          {isRecording ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', height: '32px', marginBottom: '14px' }}>
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
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Microphone idle
            </p>
          )}

          <p style={{ fontSize: '0.85rem', color: isRecording ? '#38bdf8' : 'var(--text-secondary)', fontWeight: 600 }}>
            {isRecording ? 'Listening... Speak your question now' : 'Click Speak to resume listening'}
          </p>
        </div>

        {/* Live Transcription Box */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
            Recognized Speech
          </label>
          <div style={{
            minHeight: '70px',
            maxHeight: '120px',
            overflowY: 'auto',
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-medium)',
            color: '#f8fafc',
            fontSize: '0.9rem',
            lineHeight: 1.5
          }}>
            {errorMessage ? (
              <span style={{ color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={15} /> {errorMessage}
              </span>
            ) : transcript ? (
              transcript
            ) : (
              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Your spoken words will appear here in real-time...
              </span>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {isRecording ? (
            <button onClick={stopAll} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
              <MicOff size={16} /> Stop Recording
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
            <Send size={15} /> Send to SenseSphere
          </button>
        </div>
      </div>
    </div>
  );
}
