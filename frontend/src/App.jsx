import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function EliaApp() {
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const audioInputRef = useRef(null);

  // Use Vite environment variable or fallback to EC2 public IP
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://3.134.101.21:5000'; // Replace with your EC2 public IP

  const handleTextSubmit = async () => {
    if (!input.trim()) return;
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    try {
      const response = await axios.post(`${backendUrl}/text`, { text: input });
      setMessages([...messages, { user: 'You', text: input, time: timestamp }, { user: 'ELIA', text: response.data.response, time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) }]);
      setInput('');
    } catch (error) {
      setMessages([...messages, { user: 'You', text: input, time: timestamp }, { user: 'ELIA', text: 'Oops, something went wrong!', time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) }]);
    }
  };

  const handleVoiceInput = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone access granted");
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        console.log("Recording data available");
        chunks.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        console.log("Recording stopped");
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio', blob, 'recording.wav');
        const now = new Date();
        const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const response = await axios.post(`${backendUrl}/text`, { text: 'Voice input (mock)' });
        setMessages([...messages, { user: 'You', text: 'Voice recorded', time: timestamp }, { user: 'ELIA', text: response.data.response, time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) }]);
      };
      mediaRecorder.onstart = () => console.log("Recording started");
      mediaRecorder.onerror = (e) => console.error("MediaRecorder error:", e);
      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
        console.log("Recording timeout triggered");
      }, 5000);
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error("Audio input error:", error);
      const now = new Date();
      const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      setMessages([...messages, { user: 'You', text: 'Voice recorded', time: timestamp }, { user: 'ELIA', text: `Error recording audio: ${error.message}`, time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) }]);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const now = new Date();
      const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const formData = new FormData();
      formData.append('image', file);
      try {
        const response = await axios.post(`${backendUrl}/text`, { text: 'Image input (mock)' });
        setMessages([...messages, { user: 'You', text: 'Image uploaded', time: timestamp }, { user: 'ELIA', text: response.data.response, time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) }]);
      } catch (error) {
        setMessages([...messages, { user: 'You', text: 'Image uploaded', time: timestamp }, { user: 'ELIA', text: 'Oops, something went wrong!', time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) }]);
      }
    }
  };

  useEffect(() => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    if (!isChatVisible) {
      setMessages([]);
    } else {
      setMessages([
        { user: 'ELIA', text: 'Hello, Ryan! I’m ELIA, your professional health companion. Ready to optimize your wellness journey? 🌿', time: timestamp },
        { user: 'ELIA', text: 'Ask me about exercises, diet, or upload an image for advice. Let’s get started! ⏰', time: timestamp }
      ]);
    }
  }, [isChatVisible]);

  if (!isChatVisible) {
    return (
      <div className="app">
        <div className="landing-container">
          <img src="/images/your-landing-image.jpg" alt="Landing Page" className="landing-image" />
          <button className="chat-button" onClick={() => setIsChatVisible(true)}>Let's Chat</button>
        </div>
        <div className="nav-bar">
          <button className="nav-item">🏃 Journey</button>
          <button className="nav-item">👥 Community</button>
          <button className="nav-item active">🤖 ELIA</button>
          <button className="nav-item">🏬 Marketplace</button>
          <button className="nav-item">🏥 Health</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <h1>ELIA Health Coach</h1>
        <span className="close" onClick={() => setIsChatVisible(false)}>✖</span>
      </div>
      <div className="chat-container">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message-container ${msg.user === 'ELIA' ? 'elia-container' : 'user-container'}`}>
              <div className={`avatar ${msg.user === 'ELIA' ? 'elia-avatar' : 'user-avatar'}`}>
                {msg.user.charAt(0)}
              </div>
              <div className={`message ${msg.user === 'ELIA' ? 'elia' : 'user'}`}>
                <span className="user-label">{msg.user}</span>
                <p>{msg.text}</p>
                <span className="timestamp">{msg.time}</span>
                {msg.user === 'ELIA' && index === 1 && (
                  <button className="suggest-button" onClick={() => {
                    const now = new Date();
                    const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                    setMessages([...messages, { user: 'You', text: 'What do you suggest?', time: timestamp }, { user: 'ELIA', text: 'Great choice, Ryan! Try the Full-Body Flex & Flow routine: 45 min, 5000 points. 💪', time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) }]);
                  }}>
                    What do you suggest?
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <label className="image-input">
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <path d="M21 15l-5-5L5 21"></path>
          </svg>
        </label>
        <button className="voice-button" onClick={handleVoiceInput}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        </button>
        <button className="send-button" onClick={handleTextSubmit}>Send</button>
      </div>
      <div className="nav-bar">
        <button className="nav-item">🏃 Journey</button>
        <button className="nav-item">👥 Community</button>
        <button className="nav-item active">🤖 ELIA</button>
        <button className="nav-item">🏬 Marketplace</button>
        <button className="nav-item">🏥 Health</button>
      </div>
    </div>
  );
}

export default EliaApp;
