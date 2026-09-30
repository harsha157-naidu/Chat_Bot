import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Chat from './pages/Chat';
import AdminDashboard from './pages/AdminDashboard';
import CameraCapture from './components/CameraCapture';
import AudioRecorder from './components/AudioRecorder';
import MediaUploadModal from './components/MediaUploadModal';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import DeveloperModal from './components/DeveloperModal';
import { chatAPI, authAPI, uploadAPI } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'chat' | 'admin'
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingType, setProcessingType] = useState('text');

  // Modals state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [uploadModal, setUploadModal] = useState({ isOpen: false, type: 'image' });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // User preferences
  const [userSettings, setUserSettings] = useState({
    voice_enabled: 0,
    theme: 'dark',
    speech_rate: 1.0,
    speech_pitch: 1.0,
    selected_voice: ''
  });

  // On mount: check auth & load initial chats
  useEffect(() => {
    checkCurrentUser();
    loadChats();
  }, []);

  const checkCurrentUser = async () => {
    const token = localStorage.getItem('sensesphere_token');
    if (token) {
      try {
        const res = await authAPI.getMe();
        setUser(res.user);
        if (res.user.settings) {
          setUserSettings(prev => ({ ...prev, ...res.user.settings }));
        }
      } catch (err) {
        localStorage.removeItem('sensesphere_token');
      }
    }
  };

  const loadChats = async () => {
    try {
      const res = await chatAPI.getChats();
      setChats(res.chats || []);
      if (res.chats?.length > 0 && !activeChatId) {
        selectChat(res.chats[0].id);
      }
    } catch (err) {
      console.error('Failed to load chats:', err);
    }
  };

  const selectChat = async (id) => {
    setActiveChatId(id);
    try {
      const res = await chatAPI.getChatById(id);
      setMessages(res.messages || []);
    } catch (err) {
      console.error('Failed to load chat details:', err);
    }
  };

  const handleCreateChat = async () => {
    try {
      const res = await chatAPI.createChat('New Conversation');
      setChats(prev => [res.chat, ...prev]);
      setActiveChatId(res.chat.id);
      setMessages([]);
      setActiveTab('chat');
    } catch (err) {
      console.error('Failed to create new conversation:', err);
    }
  };

  const handleDeleteChat = async (id) => {
    try {
      await chatAPI.deleteChat(id);
      const remaining = chats.filter(c => c.id !== id);
      setChats(remaining);
      if (activeChatId === id) {
        if (remaining.length > 0) {
          selectChat(remaining[0].id);
        } else {
          setActiveChatId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const handleSendMessage = async ({ chatId, text, messageType = 'text', mediaUrl, fileName, fileType }) => {
    setActiveTab('chat');
    setIsProcessing(true);
    setProcessingType(messageType);

    // Optimistic temporary message to show immediate responsiveness
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      message_text: text || `[Uploaded ${messageType}]`,
      message_type: messageType,
      created_at: new Date().toISOString(),
      media: mediaUrl ? [{ file_url: mediaUrl, file_name: fileName || messageType, file_type: fileType || messageType }] : []
    };

    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await chatAPI.sendMessage({
        chatId: chatId || activeChatId,
        text,
        messageType,
        mediaUrl,
        fileName,
        fileType
      });

      // Update current active chat if newly spawned
      if (res.chatId && res.chatId !== activeChatId) {
        setActiveChatId(res.chatId);
        loadChats();
      }

      // Replace temp with real response
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempUserMsg.id),
        res.userMessage,
        res.aiMessage
      ]);
    } catch (err) {
      console.error('Message failed:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          message_text: `⚠️ Error communicating with SenseSphere: ${err.message}`,
          message_type: 'text',
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Camera capture submission
  const handleCameraCapture = async ({ file, prompt }) => {
    try {
      setIsProcessing(true);
      setProcessingType('camera');
      setActiveTab('chat');

      // Upload frame to server
      const uploadRes = await uploadAPI.uploadFile(file);
      const uploadedFile = uploadRes.file;

      await handleSendMessage({
        chatId: activeChatId,
        text: prompt,
        messageType: 'camera',
        mediaUrl: uploadedFile.fileUrl,
        fileName: uploadedFile.fileName,
        fileType: 'image'
      });
    } catch (err) {
      console.error('Camera processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Voice speech submission
  const handleSpeechResult = (spokenText) => {
    handleSendMessage({
      chatId: activeChatId,
      text: spokenText,
      messageType: 'voice'
    });
  };

  // Upload modal submission
  const handleMediaSubmitted = ({ mediaUrl, fileName, fileType, prompt }) => {
    handleSendMessage({
      chatId: activeChatId,
      text: prompt,
      messageType: fileType,
      mediaUrl,
      fileName,
      fileType
    });
  };

  const handleStartChatWithPrompt = (promptText) => {
    handleSendMessage({
      chatId: activeChatId,
      text: promptText,
      messageType: 'text'
    });
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Pages */}
      <div style={{ flex: 1 }}>
        {activeTab === 'home' && (
          <Home
            onStartChatWithPrompt={handleStartChatWithPrompt}
            onOpenCamera={() => setIsCameraOpen(true)}
            onOpenVoice={() => setIsVoiceOpen(true)}
            onOpenUpload={(type) => setUploadModal({ isOpen: true, type })}
            onOpenAuth={() => setIsAuthOpen(true)}
            user={user}
          />
        )}

        {activeTab === 'chat' && (
          <Chat
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={selectChat}
            onCreateChat={handleCreateChat}
            onDeleteChat={handleDeleteChat}
            messages={messages}
            isProcessing={isProcessing}
            processingType={processingType}
            onSendMessage={handleSendMessage}
            onOpenCamera={() => setIsCameraOpen(true)}
            onOpenVoice={() => setIsVoiceOpen(true)}
            onOpenUpload={(type) => setUploadModal({ isOpen: true, type })}
            onOpenSettings={() => setIsSettingsOpen(true)}
            userSettings={userSettings}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard />
        )}
      </div>

      {/* Multimodal Modals */}
      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      <AudioRecorder
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSpeechResult={handleSpeechResult}
      />

      <MediaUploadModal
        isOpen={uploadModal.isOpen}
        initialType={uploadModal.type}
        onClose={() => setUploadModal({ isOpen: false, type: 'image' })}
        onMediaSubmitted={handleMediaSubmitted}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={userSettings}
        onSaveSettings={(newSettings) => setUserSettings(newSettings)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(userData) => setUser(userData)}
      />

      <DeveloperModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onAskQuestion={(q) => handleStartChatWithPrompt(q)}
      />
    </div>
  );
}
