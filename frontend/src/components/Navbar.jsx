import React from 'react';
import { Sparkles, Camera, Mic, ShieldCheck, User, Settings, LayoutDashboard, Info, LogOut } from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  user, 
  onOpenSettings, 
  onOpenAuth, 
  onOpenAbout,
  onLogout 
}) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 28px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(9, 10, 15, 0.75)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Brand */}
      <div 
        onClick={() => setActiveTab('home')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer'
        }}
      >
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(56, 189, 248, 0.45)',
          position: 'relative'
        }}>
          <Sparkles size={20} color="#090a0f" strokeWidth={2.5} />
          <span style={{
            position: 'absolute',
            bottom: '-1px',
            right: '-1px',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#10b981',
            border: '2px solid #090a0f'
          }} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              SenseSphere <span style={{ color: '#38bdf8' }}>AI</span>
            </span>
            <span className="badge badge-blue" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
              Multimodal
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Ask anything. Show anything. Understand anything.
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => setActiveTab('home')}
          className={`btn-secondary ${activeTab === 'home' ? 'active-nav' : ''}`}
          style={{
            background: activeTab === 'home' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            borderColor: activeTab === 'home' ? '#38bdf8' : 'transparent',
            color: activeTab === 'home' ? '#38bdf8' : 'var(--text-secondary)'
          }}
        >
          Explore
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`btn-secondary ${activeTab === 'chat' ? 'active-nav' : ''}`}
          style={{
            background: activeTab === 'chat' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            borderColor: activeTab === 'chat' ? '#38bdf8' : 'transparent',
            color: activeTab === 'chat' ? '#38bdf8' : 'var(--text-secondary)'
          }}
        >
          AI Chat
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`btn-secondary ${activeTab === 'admin' ? 'active-nav' : ''}`}
          style={{
            background: activeTab === 'admin' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            borderColor: activeTab === 'admin' ? '#38bdf8' : 'transparent',
            color: activeTab === 'admin' ? '#38bdf8' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <LayoutDashboard size={15} />
          Admin
        </button>

        <button
          onClick={onOpenAbout}
          className="btn-secondary"
          style={{
            background: 'transparent',
            borderColor: 'transparent',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          title="About SenseSphere AI & Developer Arigala Sai Harshavardhan"
        >
          <Info size={15} />
          About Developer
        </button>
      </nav>

      {/* User Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button 
          onClick={onOpenSettings}
          className="btn-icon" 
          title="Settings & Audio preferences"
          style={{ borderRadius: '50%' }}
        >
          <Settings size={18} />
        </button>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: '#38bdf8',
                color: '#090a0f',
                fontWeight: 700,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</span>
            </div>
            <button 
              onClick={onLogout} 
              className="btn-icon" 
              title="Sign Out"
              style={{ borderRadius: '50%' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button 
            onClick={onOpenAuth}
            className="btn-primary"
            style={{ fontSize: '0.85rem', padding: '8px 18px' }}
          >
            <User size={15} />
            Sign In / Register
          </button>
        )}
      </div>
    </header>
  );
}
