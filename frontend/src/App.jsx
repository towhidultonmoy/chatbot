import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Use ngrok URL for phone testing
const BACKEND_URL = 'https://9cab868cca7f.ngrok-free.app'; // Update with your ngrok URL

function EliaApp() {
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const audioInputRef = useRef(null);

  const handleTextSubmit = async () => {
    if (!input.trim()) return;
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    try {
      const response = await axios.post(`${BACKEND_URL}/text`, { text: input });
      setMessages([...messages, { user: 'You', text: input, time: timestamp }, { user: 'ELIA', text: response.data.response, time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) }]);
      setInput('');
    } catch (error) {
      console.error('Error submitting text:', error);
      setMessages([...messages, { user: 'You', text: input, time: timestamp }, { user: 'ELIA', text: 'Oops, something went wrong!', time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) }]);
    }
  };

  const handleVoiceInput = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        console.log('Recorded blob:', blob, blob.type);
        const formData = new FormData();
        formData.append('text', 'Voice input');
        formData.append('audio', blob, 'recording.wav');
        const now = new Date();
        const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        try {
          const response = await axios.post(`${BACKEND_URL}/text`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          setMessages([...messages, { user: 'You', text: 'Voice recorded', time: timestamp }, { user: 'ELIA', text: response.data.response, time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) }]);
        } catch (error) {
          console.error('Error submitting voice:', error.response ? error.response.data : error.message);
          setMessages([...messages, { user: 'You', text: 'Voice recorded', time: timestamp }, { user: 'ELIA', text: 'Error recording audio!', time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) }]);
        }
      };
      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 5000);
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      const now = new Date();
      const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      console.error('Error accessing microphone:', error);
      setMessages([...messages, { user: 'You', text: 'Voice recorded', time: timestamp }, { user: 'ELIA', text: 'Error accessing microphone!', time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) }]);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const now = new Date();
      const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const formData = new FormData();
      formData.append('text', 'Image input');
      formData.append('image', file);
      try {
        const response = await axios.post(`${BACKEND_URL}/text`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setMessages([...messages, { user: 'You', text: 'Image uploaded', time: timestamp }, { user: 'ELIA', text: response.data.response, time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) }]);
      } catch (error) {
        console.error('Error uploading image:', error);
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
        { user: 'ELIA', text: 'Hello, Ryan! I’m ELIA, your professional health companion. Ready to optimize your wellness journey? 🌿', time: '01:37 AM' },
        { user: 'ELIA', text: 'Ask me about exercises, diet, or upload an image for advice. Let’s get started! ⏰', time: '01:37 AM' }
      ]);
    }
  }, [isChatVisible]);

  if (!isChatVisible) {
    return (
      <div className="app">
        <div className="landing-container">
          <img src="src/LandingPage.JPG" alt="Landing Page" className="landing-image" />
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