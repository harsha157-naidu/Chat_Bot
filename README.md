# SenseSphere AI 🌐
> **"Ask anything. Show anything. Speak anything. Let SenseSphere understand it."**

SenseSphere AI is a multimodal AI assistant platform designed to understand and process **text**, **camera input**, **images**, **audio**, **video**, **documents**, and **voice interactions**, complete with user authentication, persistent chat history, admin telemetry, and a dedicated **Developer Identity System**.

---

## 👤 Developer & Project Information

- **Project Name**: SenseSphere AI
- **Founder & Lead Developer**: **Arigala Sai Harshavardhan**
- **Role**: Admin, Founder and Lead Developer of SenseSphere AI
- **Education & Institution**: **B.Tech CSE student at PBR VITS**
- **Website Owner**: Created and managed by **Arigala Sai Harshavardhan**
- **Purpose**: To provide users with a single AI assistant capable of understanding different types of information and helping them with their questions by combining multiple forms of human-computer interaction into one simple AI assistant.

---

## 🚀 Key Features

### 1. Multimodal Input Matrix
- 💬 **Text Questions**: Natural conversation with markdown formatting, code syntax, and contextual history.
- 📷 **Camera Module**: Real-time camera preview, front/rear camera flip, privacy-guaranteed on-demand stream with snapshot visual Q&A.
- 🖼️ **Image Understanding**: Drag & drop support for JPG, PNG, WebP. Hardware diagnostic, laptop port detection, plant identification, and comparative analysis.
- 🎤 **Voice Interaction**: Interactive speech recognition with live audio visualizer waves, instant transcription, and automatic audio playback.
- 🎧 **Audio Upload**: Processing for MP3, WAV, M4A, WebM. Audio speech transcription, summarization, and key takeaway extraction.
- 🎥 **Video Understanding**: Video sequence decomposition, chronological frame analysis, scene timeline, and action detection.
- 📄 **Document / PDF Parsing**: Structured document reading, executive summaries, and targeted question-answering.
- 🔊 **Voice Responses (Text-to-Speech)**: Integrated Web Speech synthesis with customizable rate, pitch, and voice selection.

### 2. Developer Identity Architecture
SenseSphere AI features a dedicated, dynamic Developer Identity System answering all 14 official creator queries:
1. *What is your name?*
2. *Who created you?*
3. *Who is your developer?*
4. *Who is the founder?*
5. *What can you do?*
6. *How were you created?*
7. *Are you an AI chatbot?*
8. *Who owns this website?*
9. *What is your purpose?*
10. *Why were you created?*
11. *Who made this?*
12. *Who developed this?*
13. *Who is behind this project?*
14. *What technologies are used?*

### 3. Database Architecture (MySQL / SQLite Compatible)
Includes `database/schema.sql` with full DDL matching:
- `users`: User profiles, bcrypt password hashes, roles.
- `chats`: Conversation threads.
- `messages`: Message payloads (`text`, `image`, `audio`, `video`, `document`, `voice`, `camera`).
- `media`: File metadata, cloud URLs, and storage providers.
- `ai_responses`: Model telemetry, response texts, processing latency.
- `user_settings`: Audio synthesis toggles, rate, pitch, themes.
- `developer_profile`: Dynamic profile information for Arigala Sai Harshavardhan.

### 4. Admin Governance Dashboard
- Real-time telemetry: Total users, chats, messages, media files, and average latency.
- Dynamic Developer Profile Editor: update name, role, institution, purpose, and tech stack in real-time.
- Conversation audit logs and uploaded media repository.

---

## 🛠️ Project Structure

```
SenseSphere-AI/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Message.jsx
│   │   │   ├── CameraCapture.jsx
│   │   │   ├── AudioRecorder.jsx
│   │   │   ├── MediaUploadModal.jsx
│   │   │   ├── LoadingAnimation.jsx
│   │   │   ├── DeveloperModal.jsx
│   │   │   ├── SettingsModal.jsx
│   │   │   └── AuthModal.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Chat.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── main.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── chatController.js
│   │   │   ├── mediaController.js
│   │   │   ├── aboutController.js
│   │   │   └── adminController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── upload.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── chatRoutes.js
│   │   │   ├── uploadRoutes.js
│   │   │   ├── aboutRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── services/
│   │   │   └── aiService.js
│   │   └── server.js
│   ├── uploads/
│   ├── .env
│   └── package.json
│
├── database/
│   ├── schema.sql
│   └── sensesphere.sqlite
│
└── README.md
```

---

## ⚡ Quick Start

### 1. Start the Backend API
```bash
cd backend
npm start
```
*Backend runs on `http://localhost:5000`*

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:3000`*

---

## 🔒 Security & Privacy Notice
Camera and Microphone access are **strictly on-demand** and requested only when the user explicitly clicks the Camera or Microphone button. Streams are automatically shut down upon closing.
