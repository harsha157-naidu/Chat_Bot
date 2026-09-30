import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Zap, Shield, Check, AlertCircle } from 'lucide-react';

export default function CameraCapture({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' or 'environment'
  const [permissionError, setPermissionError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [question, setQuestion] = useState('');

  // Start camera ONLY when modal is opened by user
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setPermissionError(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const startCamera = async () => {
    setIsInitializing(true);
    setPermissionError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera capture via getUserMedia.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false // Strictly video only
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera permission or access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Camera permission was denied. Please allow camera permissions in your browser bar to use this feature.');
      } else {
        setPermissionError(err.message || 'Unable to access your camera.');
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleCaptureFrame = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(blob);
        setCapturedImage({ file, previewUrl });
      }
    }, 'image/jpeg', 0.92);
  };

  const handleFlipCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture({
        file: capturedImage.file,
        previewUrl: capturedImage.previewUrl,
        prompt: question || 'Tell me what is visible through my camera and explain this scene.'
      });
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
        maxWidth: '680px',
        overflow: 'hidden',
        border: '1px solid var(--border-medium)',
        background: '#0d111a',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)'
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
              <Camera size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>SenseSphere Vision Camera</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Camera is strictly active during this session only
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="btn-icon" 
            style={{ width: '32px', height: '32px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewport Area */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          background: '#05070a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {permissionError ? (
            <div style={{ padding: '30px', textAlign: 'center', maxWidth: '420px' }}>
              <AlertCircle size={42} color="#f43f5e" style={{ margin: '0 auto 14px auto' }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '8px', color: '#f8fafc' }}>Camera Permission Needed</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                {permissionError}
              </p>
              <button onClick={startCamera} className="btn-primary" style={{ fontSize: '0.85rem' }}>
                <RefreshCw size={15} /> Try Requesting Permission Again
              </button>
            </div>
          ) : capturedImage ? (
            <img 
              src={capturedImage.previewUrl} 
              alt="Captured Frame" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
                }}
              />
              
              {/* Privacy indicator badge */}
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(0, 0, 0, 0.65)',
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#10b981'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                <span>Live Opt-in Feed</span>
              </div>

              {/* Flip camera button */}
              <button 
                onClick={handleFlipCamera}
                className="btn-icon"
                title="Switch Camera (Front/Rear)"
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(0, 0, 0, 0.65)'
                }}
              >
                <RefreshCw size={16} />
              </button>
            </>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ padding: '18px 20px', background: '#0e121b' }}>
          {capturedImage ? (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Ask a question about this captured image (optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. What ports are visible? / Identify this plant / What is wrong with this device?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-medium)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button onClick={handleRetake} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                  Retake Photo
                </button>
                <button onClick={handleConfirm} className="btn-primary" style={{ fontSize: '0.85rem' }}>
                  <Zap size={16} /> Send to SenseSphere AI
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <Shield size={14} color="#10b981" />
                <span>Camera feed is secure and not shared or recorded secretly</span>
              </div>
              <button 
                onClick={handleCaptureFrame}
                className="btn-primary"
                disabled={isInitializing || permissionError !== null}
                style={{
                  background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
                  color: '#090a0f',
                  fontWeight: 700
                }}
              >
                <Camera size={18} /> Capture Photo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
