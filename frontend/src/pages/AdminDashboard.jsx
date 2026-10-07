import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert,
  Users, 
  MessageSquare, 
  Database, 
  Cpu, 
  RefreshCw,
  Clock,
  AlertTriangle,
  Bug,
  UserX,
  UserCheck,
  Send,
  Radio,
  Lock,
  LogOut,
  ArrowRight,
  Server,
  Layers,
  Sparkles,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { adminAPI } from '../services/api';

export default function AdminDashboard({ onExit }) {
  // Auth state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loginForm, setLoginForm] = useState({
    email: 'naiduharsha2006@gmail.com',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Data state
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [unresolvedQueries, setUnresolvedQueries] = useState([]);
  const [systemErrors, setSystemErrors] = useState([]);
  const [selectedChatForIntervention, setSelectedChatForIntervention] = useState(null);
  const [adminMessageText, setAdminMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('architecture'); // 'architecture' | 'interdiction' | 'users' | 'bugs'
  const [actionSuccess, setActionSuccess] = useState('');

  // Check existing admin token on mount
  useEffect(() => {
    const token = adminAPI.getToken();
    if (token) {
      verifyAndLoad(token);
    }
  }, []);

  const verifyAndLoad = async () => {
    try {
      setLoading(true);
      const statsRes = await adminAPI.getStats();
      setIsAdminAuthenticated(true);
      setAdminUser({ name: 'Harsha Naidu', email: 'naiduharsha2006@gmail.com' });
      setStats(statsRes);
      loadAllSections();
    } catch (err) {
      console.warn('Admin token invalid or expired:', err.message);
      adminAPI.logout();
      setIsAdminAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = await adminAPI.login(loginForm.email, loginForm.password);
      setIsAdminAuthenticated(true);
      setAdminUser(res.user);
      loadAllSections();
    } catch (err) {
      setLoginError(err.message || 'Authentication failed. Access denied.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = () => {
    adminAPI.logout();
    setIsAdminAuthenticated(false);
    setAdminUser(null);
    if (onExit) onExit();
  };

  const loadAllSections = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, chatsRes, unresolvedRes, errorsRes] = await Promise.all([
        adminAPI.getStats().catch(() => ({ stats: {} })),
        adminAPI.getUsers().catch(() => ({ users: [] })),
        adminAPI.getAllChats().catch(() => ({ chats: [] })),
        adminAPI.getUnresolvedQueries().catch(() => ({ unresolvedQueries: [] })),
        adminAPI.getSystemErrors().catch(() => ({ errors: [] }))
      ]);

      setStats(statsRes);
      setUsers(usersRes.users || []);
      setChats(chatsRes.chats || []);
      setUnresolvedQueries(unresolvedRes.unresolvedQueries || []);
      setSystemErrors(errorsRes.errors || []);
    } catch (err) {
      console.error('Failed to load admin sections:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  // Step 4: User Overrides (Block/Activate)
  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      await adminAPI.updateUserStatus(userId, nextStatus);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u));
      showNotification(`User status updated to ${nextStatus.toUpperCase()}`);
    } catch (err) {
      alert('Failed to update user status: ' + err.message);
    }
  };

  // Step 4: Human Interdiction (Toggle is_bot_disabled)
  const handleToggleBot = async (chatId, currentDisabled) => {
    const nextDisabled = !currentDisabled;
    try {
      await adminAPI.toggleBotForChat(chatId, nextDisabled);
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, is_bot_disabled: nextDisabled ? 1 : 0 } : c));
      showNotification(nextDisabled ? 'Human Interdiction ACTIVE: Bot disabled for this chat' : 'Bot Automation Restored');
    } catch (err) {
      alert('Failed to toggle bot status: ' + err.message);
    }
  };

  // Step 4: Send direct Admin Message during Interdiction
  const handleSendAdminMessage = async (chatId) => {
    if (!adminMessageText.trim()) return;
    try {
      await adminAPI.sendAdminMessage(chatId, adminMessageText.trim());
      setAdminMessageText('');
      showNotification('Administrative Override message broadcasted to user session');
    } catch (err) {
      alert('Failed to send admin message: ' + err.message);
    }
  };

  // Step 3: Bug Rectification (Clear Unresolved Query)
  const handleClearUnresolved = async (id) => {
    try {
      await adminAPI.deleteUnresolvedQuery(id);
      setUnresolvedQueries(prev => prev.filter(q => q.id !== id));
      showNotification('Unresolved query cleared from database');
    } catch (err) {
      alert('Failed to delete query: ' + err.message);
    }
  };

  // Step 3: Clear System Error
  const handleClearSystemError = async (id) => {
    try {
      await adminAPI.deleteSystemError(id);
      setSystemErrors(prev => prev.filter(e => e.id !== id));
      showNotification('System error entry purged');
    } catch (err) {
      alert('Failed to delete system error: ' + err.message);
    }
  };

  const handleClearAllErrors = async () => {
    if (!window.confirm('Are you sure you want to purge all system error logs?')) return;
    try {
      await adminAPI.clearAllSystemErrors();
      setSystemErrors([]);
      showNotification('All system error logs successfully cleared');
    } catch (err) {
      alert('Failed to clear system errors: ' + err.message);
    }
  };

  // ==========================================
  // VIEW 1: ADMIN LOGIN GATEWAY (STEP 1: IDENTITY ISOLATION)
  // ==========================================
  if (!isAdminAuthenticated) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '460px',
          padding: '36px',
          borderRadius: '20px',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(129, 140, 248, 0.2))',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#38bdf8'
            }}>
              <Lock size={28} />
            </div>

            <span className="badge badge-purple" style={{ marginBottom: '8px' }}>
              Step 1: Identity Isolation Protocol
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '8px', color: '#ffffff' }}>
              Admin Portal Gateway
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Authorized Personnel Only. Stealth back-end verification against central MySQL identity records.
            </p>
          </div>

          {loginError && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              borderRadius: '10px',
              color: '#f87171',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '18px'
            }}>
              <ShieldAlert size={16} />
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Admin Email Identifier
              </label>
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                placeholder="naiduharsha2006@gmail.com"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: '#161b26',
                  border: '1px solid var(--border-medium)',
                  color: '#ffffff',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Password (bcrypt protected)
              </label>
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: '#161b26',
                  border: '1px solid var(--border-medium)',
                  color: '#ffffff',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw size={16} className="spinner" /> Authenticating Token...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} /> Authenticate & Access
                </>
              )}
            </button>
          </form>

          {onExit && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={onExit}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                ← Return to SenseSphere AI
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: AUTHENTICATED ADMIN PORTAL DASHBOARD
  // ==========================================
  return (
    <div style={{ maxWidth: '1260px', margin: '0 auto', padding: '28px 24px 60px 24px' }}>
      {/* Action Notification Toast */}
      {actionSuccess && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          zIndex: 100,
          background: '#10b981',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} />
          {actionSuccess}
        </div>
      )}

      {/* Top Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '26px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ShieldCheck size={13} /> Admin Portal Architecture
            </span>
            <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              MySQL Central Engine Active
            </span>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
              Identity: Harsha Naidu (naiduharsha2006@gmail.com)
            </span>
          </div>

          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: '#ffffff' }}>
            🏛️ SenseSphere Admin Control Nexus
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Stealth Routing Layer • Real-Time User Overrides • Human Interdiction • Bug Rectification
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={loadAllSections} className="btn-secondary" style={{ fontSize: '0.82rem' }}>
            <RefreshCw size={14} className={loading ? 'spinner' : ''} /> Refresh Telemetry
          </button>
          <button 
            onClick={handleAdminLogout} 
            className="btn-secondary" 
            style={{ fontSize: '0.82rem', borderColor: '#ef4444', color: '#f87171' }}
          >
            <LogOut size={14} /> Exit Portal
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '6px', 
        borderBottom: '1px solid var(--border-subtle)', 
        marginBottom: '24px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'architecture', label: 'Architecture & Engine', icon: Server, badge: 'Step 1 & 2' },
          { id: 'interdiction', label: 'Live Sessions & Interdiction', icon: Radio, badge: `${chats.length} Sessions` },
          { id: 'users', label: 'User Overrides', icon: Users, badge: `${users.length} Users` },
          { id: 'bugs', label: 'Bug Tracking & Fallbacks', icon: Bug, badge: `${unresolvedQueries.length + systemErrors.length} Issues` }
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
                padding: '12px 18px',
                background: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #38bdf8' : '2px solid transparent',
                color: isActive ? '#38bdf8' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                borderRadius: '8px 8px 0 0',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={16} />
              {t.label}
              <span style={{
                fontSize: '0.7rem',
                padding: '2px 6px',
                borderRadius: '10px',
                background: isActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)',
                color: isActive ? '#090a0f' : 'var(--text-muted)',
                fontWeight: 700
              }}>
                {t.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          TAB 1: ARCHITECTURE & CENTRAL ENGINE (STEP 1 & 2)
         ======================================================== */}
      {activeTab === 'architecture' && (
        <div>
          {/* Key Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '16px',
            marginBottom: '26px'
          }}>
            {[
              { label: 'Registered Users', val: stats?.stats?.totalUsers || users.length, icon: Users, color: '#38bdf8' },
              { label: 'Conversations Recorded', val: stats?.stats?.totalChats || chats.length, icon: MessageSquare, color: '#818cf8' },
              { label: 'Unresolved Queries', val: unresolvedQueries.length, icon: AlertTriangle, color: '#f59e0b' },
              { label: 'System Errors Logged', val: systemErrors.length, icon: Bug, color: '#ef4444' },
              { label: 'Database Engine', val: 'MySQL 8.0', icon: Database, color: '#10b981' }
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{stat.label}</span>
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

          {/* Complete Admin Portal Architecture Flowchart Display */}
          <div className="glass-panel" style={{ padding: '26px', borderRadius: '18px', marginBottom: '26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Server size={18} color="#38bdf8" />
                The Complete Admin Portal Architecture Flow
              </h3>
              <span className="badge badge-blue">Stealth Routing Active</span>
            </div>

            <div style={{
              background: '#0d1117',
              border: '1px solid var(--border-medium)',
              borderRadius: '12px',
              padding: '24px',
              overflowX: 'auto',
              fontFamily: 'monospace'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '20px', minWidth: '750px', marginBottom: '24px' }}>
                {/* Standard User Node */}
                <div style={{
                  padding: '16px 20px',
                  background: 'rgba(56, 189, 248, 0.06)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '12px',
                  textAlign: 'center',
                  width: '240px'
                }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8' }}>Standard User</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Chat Widget / Public Prompts)</div>
                  <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '6px' }}>● 0 Admin UI Triggers</div>
                </div>

                {/* Arrow */}
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
                  Public HTTP(S)<br />───►
                </div>

                {/* Admin Browser Node */}
                <div style={{
                  padding: '16px 20px',
                  background: 'rgba(168, 85, 247, 0.1)',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  borderRadius: '12px',
                  textAlign: 'center',
                  width: '240px'
                }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#c084fc' }}>Admin Browser</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Harsha Naidu via /admin-login)</div>
                  <div style={{ fontSize: '0.7rem', color: '#c084fc', marginTop: '6px' }}>● Privileged API Calls</div>
                </div>
              </div>

              {/* Back-End Routing Layer Box */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-medium)',
                borderRadius: '12px',
                padding: '16px 20px',
                textAlign: 'center',
                margin: '0 auto 24px auto'
              }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                  BACK-END ROUTING LAYER & MIDDLEWARE
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Authenticates requireAdmin JWT tokens • Blocks unauthorized traffic with 403 Forbidden • Filters blocked users
                </div>
              </div>

              {/* Central Engine & Database Box */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.06)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                padding: '16px 20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#10b981' }}>
                  CENTRAL ENGINE & MYSQL DATABASE
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  • Validates bcrypt hashed password for 'naiduharsha2006@gmail.com'<br />
                  • Fetches Chat Logs, System Bugs (system_errors), & User Overrides (active/blocked)<br />
                  • Stores Fallback Telemetry (unresolved_queries)
                </div>
              </div>
            </div>
          </div>

          {/* 4-Step Technical Roadmap Status Tracker */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-green">Step 1: Active</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Identity Isolation</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Dedicated <code>/api/admin/login</code> route. Validates bcrypt hashed password against <code>naiduharsha2006@gmail.com</code> and issues 24h JWT.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-green">Step 2: Active</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Stealth Routing</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Zero admin buttons or triggers in standard chat widget. Hidden path access guarded by <code>requireAdmin</code> middleware.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-green">Step 3: Active</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Bug Rectification Layer</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Captures fallback hooks to <code>unresolved_queries</code> and catch-block stack traces to <code>system_errors</code> table.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-green">Step 4: Active</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Live Session Overrides</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Instant mutation of user status (active/blocked) and real-time human interdiction (<code>is_bot_disabled</code>) with admin direct message send.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: LIVE SESSIONS & HUMAN INTERDICTION (STEP 4)
         ======================================================== */}
      {activeTab === 'interdiction' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Live Session Monitor & Human Interdiction</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Step 4 Architecture: If you need to stop the AI bot and step in, toggle <code>is_bot_disabled: true</code>.
              The chatbot engine will skip natural language processing and route messages directly to your screen.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: selectedChatForIntervention ? '1.2fr 1fr' : '1fr', gap: '20px' }}>
            {/* Sessions Table */}
            <div className="glass-panel" style={{ padding: '22px', borderRadius: '16px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px' }}>
                Active Chat Sessions ({chats.length})
              </h4>

              {chats.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No conversations found in MySQL database.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {chats.map(chat => {
                    const isBotDisabled = Boolean(chat.is_bot_disabled);
                    const isSelected = selectedChatForIntervention?.id === chat.id;

                    return (
                      <div
                        key={chat.id}
                        style={{
                          padding: '14px 16px',
                          background: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                          border: isSelected ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '12px'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
                              {chat.title || 'Untitled Conversation'}
                            </span>
                            {isBotDisabled ? (
                              <span style={{
                                fontSize: '0.7rem',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                background: 'rgba(239, 68, 68, 0.2)',
                                color: '#f87171',
                                border: '1px solid #ef4444',
                                fontWeight: 700
                              }}>
                                🛑 BOT DISABLED / HUMAN INTERDICTION
                              </span>
                            ) : (
                              <span style={{
                                fontSize: '0.7rem',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#34d399',
                                border: '1px solid #10b981',
                                fontWeight: 600
                              }}>
                                🟢 AI Bot Active
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Chat #{chat.id} • User: {chat.user_name || 'Guest'} ({chat.user_email || 'N/A'}) • {chat.message_count || 0} messages
                          </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {/* Toggle Bot Interdiction */}
                          <button
                            onClick={() => handleToggleBot(chat.id, isBotDisabled)}
                            className="btn-secondary"
                            style={{
                              fontSize: '0.78rem',
                              padding: '6px 12px',
                              borderColor: isBotDisabled ? '#10b981' : '#ef4444',
                              color: isBotDisabled ? '#34d399' : '#f87171'
                            }}
                          >
                            {isBotDisabled ? 'Restore AI Automation' : 'Disable Bot & Intervene'}
                          </button>

                          {/* Select for Admin Intervention */}
                          <button
                            onClick={() => setSelectedChatForIntervention(chat)}
                            className="btn-secondary"
                            style={{
                              fontSize: '0.78rem',
                              padding: '6px 12px',
                              background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                              borderColor: isSelected ? '#38bdf8' : 'var(--border-medium)',
                              color: isSelected ? '#38bdf8' : 'var(--text-secondary)'
                            }}
                          >
                            Open Console →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Admin Intervention Message Console */}
            {selectedChatForIntervention && (
              <div className="glass-panel" style={{ padding: '22px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Radio size={16} /> Interdiction Broadcast Console
                  </h4>
                  <button
                    onClick={() => setSelectedChatForIntervention(null)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    Close
                  </button>
                </div>

                <div style={{
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '16px'
                }}>
                  <div><strong>Target:</strong> {selectedChatForIntervention.title}</div>
                  <div><strong>Chat ID:</strong> #{selectedChatForIntervention.id}</div>
                  <div><strong>User:</strong> {selectedChatForIntervention.user_name || 'Guest'}</div>
                  <div>
                    <strong>Status:</strong> {selectedChatForIntervention.is_bot_disabled ? (
                      <span style={{ color: '#f87171' }}>AI Bypassed (Human Mode)</span>
                    ) : (
                      <span style={{ color: '#34d399' }}>AI Bot Active</span>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Send Administrative Override Message
                  </label>
                  <textarea
                    rows={4}
                    value={adminMessageText}
                    onChange={e => setAdminMessageText(e.target.value)}
                    placeholder="Type administrative reply directly to this user's chat screen..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: '#161b26',
                      border: '1px solid var(--border-medium)',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <button
                  onClick={() => handleSendAdminMessage(selectedChatForIntervention.id)}
                  disabled={!adminMessageText.trim()}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Send size={15} /> Broadcast Message to Chat
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: USER OVERRIDES & STATUS MUTATION (STEP 4)
         ======================================================== */}
      {activeTab === 'users' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>User Overrides & Identity Governance</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Step 4 Architecture: Mutate user status flags (Active vs Blocked). Blocked accounts are immediately rejected with HTTP 403 Forbidden at the routing layer.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 14px' }}>User ID</th>
                  <th style={{ padding: '12px 14px' }}>Name</th>
                  <th style={{ padding: '12px 14px' }}>Email</th>
                  <th style={{ padding: '12px 14px' }}>Role</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px' }}>Actions (Override)</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const isBlocked = u.status === 'blocked';
                  const isSuperAdmin = u.email === 'naiduharsha2006@gmail.com';

                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px', fontFamily: 'monospace' }}>#{u.id}</td>
                      <td style={{ padding: '14px', fontWeight: 600, color: '#ffffff' }}>{u.name}</td>
                      <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ padding: '14px' }}>
                        <span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px' }}>
                        {isBlocked ? (
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#f87171',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            BLOCKED
                          </span>
                        ) : (
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#34d399',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px' }}>
                        {isSuperAdmin ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Protected SuperAdmin</span>
                        ) : (
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.status || 'active')}
                            className="btn-secondary"
                            style={{
                              fontSize: '0.75rem',
                              padding: '5px 12px',
                              borderColor: isBlocked ? '#10b981' : '#ef4444',
                              color: isBlocked ? '#34d399' : '#f87171',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            {isBlocked ? (
                              <>
                                <UserCheck size={14} /> Unblock User
                              </>
                            ) : (
                              <>
                                <UserX size={14} /> Block User
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: BUG TRACKING & RECTIFICATION (STEP 3)
         ======================================================== */}
      {activeTab === 'bugs' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Bug Tracking & Log Rectification Layer</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Step 3 Architecture: Fallbacks log failed user queries to <code>unresolved_queries</code>, and catch-blocks record stack traces to <code>system_errors</code>.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '22px' }}>
            {/* Panel 1: Unresolved Queries (Fallback Hook) */}
            <div className="glass-panel" style={{ padding: '22px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b' }}>
                  <AlertTriangle size={18} /> Fallback Queries ({unresolvedQueries.length})
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Collection: unresolved_queries</span>
              </div>

              {unresolvedQueries.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No unresolved queries logged. AI fallback rate is 0%.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {unresolvedQueries.map(q => (
                    <div
                      key={q.id}
                      style={{
                        padding: '12px 14px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '10px',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ffffff' }}>
                          "{q.query_phrase}"
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Session #{q.session_id || 'N/A'} • {new Date(q.created_at).toLocaleString()}
                        </div>
                      </div>

                      <button
                        onClick={() => handleClearUnresolved(q.id)}
                        className="btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '4px 10px', borderColor: '#10b981', color: '#34d399' }}
                      >
                        Rectify / Clear
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Panel 2: System Errors & Stack Traces */}
            <div className="glass-panel" style={{ padding: '22px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444' }}>
                  <Bug size={18} /> System Errors ({systemErrors.length})
                </h4>
                {systemErrors.length > 0 && (
                  <button
                    onClick={handleClearAllErrors}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#f87171',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Trash2 size={13} /> Purge All
                  </button>
                )}
              </div>

              {systemErrors.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Zero system errors detected. Health score 100%.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
                  {systemErrors.map(err => (
                    <div
                      key={err.id}
                      style={{
                        padding: '12px 14px',
                        background: 'rgba(239, 68, 68, 0.05)',
                        borderRadius: '10px',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f87171' }}>
                          {err.error_message}
                        </span>
                        <button
                          onClick={() => handleClearSystemError(err.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                          title="Clear error"
                        >
                          ✕
                        </button>
                      </div>

                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        Endpoint: <code>{err.endpoint || 'Internal Engine'}</code> • {new Date(err.created_at).toLocaleString()}
                      </div>

                      {err.stack_trace && (
                        <details style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          <summary style={{ cursor: 'pointer', color: '#38bdf8' }}>View Stack Trace</summary>
                          <pre style={{
                            marginTop: '6px',
                            padding: '8px',
                            background: '#090a0f',
                            borderRadius: '6px',
                            overflowX: 'auto',
                            fontFamily: 'monospace',
                            fontSize: '0.68rem',
                            color: '#e2e8f0'
                          }}>
                            {err.stack_trace}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
