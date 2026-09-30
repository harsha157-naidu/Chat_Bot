import React, { useState, useRef } from 'react';
import { Upload, X, Image, Music, Video, FileText, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { uploadAPI } from '../services/api';

export default function MediaUploadModal({ isOpen, onClose, initialType = 'image', onMediaSubmitted }) {
  const [activeType, setActiveType] = useState(initialType);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [promptText, setPromptText] = useState('');
  const fileInputRef = useRef(null);

  // Sync initial type if modal re-opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveType(initialType);
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadError(null);
      setPromptText('');
    }
  }, [isOpen, initialType]);

  const acceptedMimeTypes = {
    image: 'image/jpeg,image/png,image/webp,image/gif',
    audio: 'audio/mpeg,audio/wav,audio/x-m4a,audio/webm,audio/ogg',
    video: 'video/mp4,video/webm,video/quicktime',
    document: 'application/pdf,text/plain,text/markdown,application/json'
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadError(null);

    if (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/')) {
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // 1. Upload to backend
      const uploadRes = await uploadAPI.uploadFile(selectedFile);
      const uploadedFile = uploadRes.file;

      // 2. Dispatch to chat
      onMediaSubmitted({
        mediaUrl: uploadedFile.fileUrl,
        fileName: uploadedFile.fileName,
        fileType: uploadedFile.fileType || activeType,
        prompt: promptText || getDefaultPrompt(activeType)
      });

      onClose();
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError(err.message || 'Failed to upload media. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getDefaultPrompt = (type) => {
    switch (type) {
      case 'image': return 'Analyze this image and explain what it contains.';
      case 'audio': return 'Summarize this audio and transcribe the key speech.';
      case 'video': return 'What is happening in this video? Summarize the sequence.';
      case 'document': return 'Read this document and provide an executive summary.';
      default: return 'Analyze this content.';
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
        maxWidth: '620px',
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
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Upload Multimodal Asset</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Select images, audio, video, or documents for deep AI perception
            </p>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Media Type Selector Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          marginBottom: '20px'
        }}>
          {[
            { id: 'image', label: 'Image', icon: Image },
            { id: 'audio', label: 'Audio', icon: Music },
            { id: 'video', label: 'Video', icon: Video },
            { id: 'document', label: 'Document', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveType(tab.id);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 8px',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                  color: isSelected ? '#38bdf8' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--border-medium)',
            borderRadius: '14px',
            padding: '30px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            background: 'rgba(255, 255, 255, 0.02)',
            transition: 'border-color 0.2s',
            marginBottom: '16px'
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={acceptedMimeTypes[activeType]}
            style={{ display: 'none' }}
          />

          {selectedFile ? (
            <div>
              {previewUrl && activeType === 'image' && (
                <img 
                  src={previewUrl} 
                  alt="Upload preview" 
                  style={{ maxHeight: '180px', maxWidth: '100%', borderRadius: '8px', marginBottom: '12px' }}
                />
              )}
              {previewUrl && activeType === 'video' && (
                <video 
                  src={previewUrl} 
                  controls 
                  style={{ maxHeight: '180px', maxWidth: '100%', borderRadius: '8px', marginBottom: '12px' }}
                />
              )}
              {previewUrl && activeType === 'audio' && (
                <audio 
                  src={previewUrl} 
                  controls 
                  style={{ width: '100%', maxWidth: '380px', marginBottom: '12px' }}
                />
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#10b981" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selectedFile.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '6px' }}>Click to select a different file</p>
            </div>
          ) : (
            <div>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(56, 189, 248, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
                color: '#38bdf8'
              }}>
                <Upload size={22} />
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '4px' }}>
                Drag & Drop or Click to Upload {activeType.charAt(0).toUpperCase() + activeType.slice(1)}
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Supported formats: {acceptedMimeTypes[activeType].replace(/image\/|audio\/|video\/|application\//g, '').toUpperCase()}
              </p>
            </div>
          )}
        </div>

        {/* Error message */}
        {uploadError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#f43f5e',
            fontSize: '0.85rem',
            marginBottom: '14px',
            padding: '8px 12px',
            background: 'rgba(244, 63, 94, 0.1)',
            borderRadius: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Prompt Input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Accompanying prompt or question:
          </label>
          <input
            type="text"
            placeholder={getDefaultPrompt(activeType)}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
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
            onKeyDown={(e) => e.key === 'Enter' && selectedFile && handleSubmit()}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || isUploading}
            className="btn-primary"
            style={{
              fontSize: '0.85rem',
              opacity: !selectedFile || isUploading ? 0.5 : 1,
              cursor: !selectedFile || isUploading ? 'not-allowed' : 'pointer'
            }}
          >
            {isUploading ? 'Uploading & Processing...' : 'Submit to SenseSphere'}
            {!isUploading && <ArrowRight size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}
