import React, { useState, useEffect } from 'react';
import { Brain, Eye, Cpu, Sparkles } from 'lucide-react';

export default function LoadingAnimation({ mediaType = 'text' }) {
  const [currentStep, setCurrentStep] = useState(0);

  const getMediaLabel = () => {
    switch (mediaType) {
      case 'image':
      case 'camera': return 'Analyzing image & visual features';
      case 'audio':
      case 'voice': return 'Transcribing audio & acoustic signals';
      case 'video': return 'Parsing video frames & temporal stream';
      case 'document': return 'Indexing document tokens & layout';
      default: return 'Evaluating context & semantics';
    }
  };

  const steps = [
    { title: 'Thinking', desc: 'Parsing intent & sensory input', icon: Brain },
    { title: 'Deep Analysis', desc: getMediaLabel(), icon: Eye },
    { title: 'Generating Response', desc: 'Synthesizing multimodal insights', icon: Cpu }
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 700);
    const timer2 = setTimeout(() => setCurrentStep(2), 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [mediaType]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '14px',
      margin: '16px 0',
      animation: 'fadeIn 0.3s ease'
    }}>
      {/* SenseSphere Bot Avatar with pulsing glow */}
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 0 16px rgba(56, 189, 248, 0.5)',
        animation: 'pulseGlow 2s infinite'
      }}>
        <Sparkles size={18} color="#090a0f" />
      </div>

      {/* Progressive Step Pipeline Card */}
      <div style={{
        background: 'rgba(22, 27, 38, 0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '16px 20px',
        maxWidth: '460px',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#38bdf8' }}>
            SenseSphere Perception Pipeline
          </span>
          <span style={{ display: 'flex', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8', animation: 'pulseGlow 1s infinite' }} />
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#818cf8', animation: 'pulseGlow 1s infinite', animationDelay: '0.2s' }} />
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c084fc', animation: 'pulseGlow 1s infinite', animationDelay: '0.4s' }} />
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = currentStep > idx;
            const isActive = currentStep === idx;
            
            return (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  opacity: isActive || isCompleted ? 1 : 0.35,
                  transition: 'opacity 0.3s ease'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: isActive ? 'rgba(56, 189, 248, 0.2)' : isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: isActive ? '1px solid #38bdf8' : isCompleted ? '1px solid #10b981' : '1px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isActive ? '#38bdf8' : isCompleted ? '#10b981' : 'var(--text-muted)'
                }}>
                  <Icon size={14} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.825rem', fontWeight: 600, color: isActive ? '#ffffff' : 'var(--text-secondary)' }}>
                      {step.title}
                    </span>
                    {isActive && (
                      <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>processing...</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
