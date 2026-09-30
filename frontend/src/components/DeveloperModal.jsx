import React, { useState, useEffect } from 'react';
import { X, UserCheck, Code, Award, GraduationCap, Building2, Send, Sparkles, Database } from 'lucide-react';
import { aboutAPI } from '../services/api';

export default function DeveloperModal({ isOpen, onClose, onAskQuestion }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await aboutAPI.getAbout();
      setProfile(res.profile);
    } catch (err) {
      console.error('Error fetching about details:', err);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "What is your name?",
    "Who created you?",
    "Who is your developer?",
    "Who is the founder?",
    "What can you do?",
    "How were you created?",
    "Are you an AI chatbot?",
    "Who owns this website?",
    "What is your purpose?",
    "Why were you created?",
    "Who made this?",
    "Who developed this?",
    "Who is behind this project?",
    "What technologies are used?"
  ];

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
        maxWidth: '720px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        background: '#0d111a',
        border: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#090a0f',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)'
            }}>
              <UserCheck size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>About SenseSphere AI & Developer</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Official Developer Identity System
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Developer Profile Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="badge badge-blue" style={{ marginBottom: '8px' }}>
                Founder & Lead Developer
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
                {profile?.name || 'Arigala Sai Harshavardhan'}
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <GraduationCap size={16} color="#38bdf8" />
                {profile?.education || 'B.Tech CSE student'} at {profile?.institution || 'PBR VITS'}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Project Domain</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8' }}>SenseSphere AI</div>
            </div>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
            {profile?.purpose || 'My purpose is to provide users with a single AI assistant capable of understanding different types of information and helping them with their questions.'}
          </p>

          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '10px',
            padding: '12px 14px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              🛠️ Architectural Stack:
            </strong>
            {profile?.technologies || 'React, Vite, Node.js, Express, AI Vision & Speech APIs, MySQL, Cloud Storage, JWT Auth.'}
          </div>
        </div>

        {/* 14 Developer Identity Questions (Interactive) */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#38bdf8" />
            Ask SenseSphere AI about its Creator & Purpose
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Click any question to ask the AI in real-time or test the developer identity engine:
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '8px'
          }}>
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onAskQuestion(q);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#38bdf8';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.background = 'rgba(56, 189, 248, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }}
              >
                <span>{q}</span>
                <Send size={13} color="#38bdf8" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
