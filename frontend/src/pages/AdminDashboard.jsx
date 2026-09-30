import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Database, 
  FileUp, 
  Cpu, 
  ShieldCheck, 
  Edit3, 
  Save, 
  Check, 
  RefreshCw,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import { adminAPI, aboutAPI } from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState({
    name: 'Arigala Sai Harshavardhan',
    role: 'Admin, Founder and Lead Developer',
    education: 'B.Tech CSE student',
    institution: 'PBR VITS',
    project_name: 'SenseSphere AI',
    description: '',
    purpose: '',
    technologies: ''
  });
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'profile' | 'files' | 'chats'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, aboutRes] = await Promise.all([
        adminAPI.getStats().catch(() => ({ stats: {}, mediaBreakdown: [], recentChats: [], recentMedia: [] })),
        aboutAPI.getAbout().catch(() => ({ profile: {} }))
      ]);

      setStats(statsRes);
      if (aboutRes.profile) setProfile(aboutRes.profile);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await aboutAPI.updateAbout(profile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      alert('Failed to update developer profile: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 24px' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-purple">Admin Control Nexus</span>
            <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              MySQL / SQLite Core Active
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '6px' }}>
            SenseSphere System Telemetry & Governance
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Monitor real-time multimodal workloads, database storage, and maintain Developer Identity schemas.
          </p>
        </div>

        <button onClick={loadData} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
          <RefreshCw size={15} /> Refresh Telemetry
        </button>
      </div>

      {/* Admin Nav Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
        {[
          { id: 'overview', label: 'System Overview', icon: LayoutDashboard },
          { id: 'profile', label: 'Developer Profile System', icon: Edit3 },
          { id: 'chats', label: 'Recent Conversations', icon: MessageSquare },
          { id: 'files', label: 'Uploaded Media Repository', icon: FileUp }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #38bdf8' : '2px solid transparent',
                color: isActive ? '#38bdf8' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          {/* Key Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '28px'
          }}>
            {[
              { label: 'Registered Users', val: stats?.stats?.totalUsers || 1, icon: Users, color: '#38bdf8' },
              { label: 'Total Conversations', val: stats?.stats?.totalChats || 0, icon: MessageSquare, color: '#818cf8' },
              { label: 'Processed Messages', val: stats?.stats?.totalMessages || 0, icon: Layers, color: '#c084fc' },
              { label: 'Multimodal Media Files', val: stats?.stats?.totalMedia || 0, icon: FileUp, color: '#10b981' },
              { label: 'Avg Inference Latency', val: `${stats?.stats?.avgProcessingTimeMs || 110}ms`, icon: Clock, color: '#f59e0b' }
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stat.label}</span>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: stat.color
                    }}>
                      <Icon size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                    {stat.val}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Architecture Status Card */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px', marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#10b981" />
              SenseSphere System Architecture & Services
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Primary Database</span>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '4px' }}>MySQL Relational Engine</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Tables: users, chats, messages, media, ai_responses, user_settings, developer_profile.
                </p>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sensory & Vision Layer</span>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '4px' }}>SenseSphere Omni Neural Core</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  WebRTC MediaDevices (Camera), Web Speech API, Audio/Video Frame Extraction.
                </p>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cloud Storage Pipeline</span>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '4px' }}>High-Speed Local / S3 / Cloudinary Bridge</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Automatic MIME validation, isolated user directories, zero persistent background access.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEVELOPER PROFILE (ADMIN EDITABLE) */}
      {activeTab === 'profile' && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '18px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Developer Identity Configuration</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Updates here will directly calibrate the AI's identity responses across all 14 identity queries.
            </p>
          </div>

          <form onSubmit={handleProfileSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Founder & Developer Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#161b26', border: '1px solid var(--border-medium)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Official Role
                </label>
                <input
                  type="text"
                  value={profile.role}
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#161b26', border: '1px solid var(--border-medium)', color: '#fff' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Education / Degree
                </label>
                <input
                  type="text"
                  value={profile.education}
                  onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#161b26', border: '1px solid var(--border-medium)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Institution / University
                </label>
                <input
                  type="text"
                  value={profile.institution}
                  onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#161b26', border: '1px solid var(--border-medium)', color: '#fff' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Project Mission & Purpose
              </label>
              <textarea
                rows={3}
                value={profile.purpose}
                onChange={(e) => setProfile({ ...profile, purpose: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#161b26', border: '1px solid var(--border-medium)', color: '#fff', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Architectural & Technology Stack
              </label>
              <textarea
                rows={2}
                value={profile.technologies}
                onChange={(e) => setProfile({ ...profile, technologies: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#161b26', border: '1px solid var(--border-medium)', color: '#fff', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {saveSuccess && (
                <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                  <Check size={16} /> Developer profile updated successfully in MySQL database!
                </span>
              )}
              <span />
              <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }}>
                <Save size={16} /> Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: RECENT CONVERSATIONS */}
      {activeTab === 'chats' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Conversation Audit Log</h3>
          {stats?.recentChats?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No conversations recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stats?.recentChats?.map((c) => (
                <div key={c.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{c.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Chat #{c.id} • {c.message_count || 0} messages • User: {c.user_name || 'Guest'}
                    </p>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {new Date(c.updated_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: UPLOADED MEDIA FILES */}
      {activeTab === 'files' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Stored Multimodal Media</h3>
          {stats?.recentMedia?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No media uploaded yet.</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '14px'
            }}>
              {stats?.recentMedia?.map((m) => (
                <div key={m.id} style={{
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span className="badge badge-blue">{m.file_type}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.file_name}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Provider: {m.cloud_provider} • Stored at {m.file_url}
                  </p>
                  <a
                    href={m.file_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.78rem', color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}
                  >
                    View File Artifact →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
