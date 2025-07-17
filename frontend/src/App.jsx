import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function EliaApp() {
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const audioInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const playAudio = (base64Audio) => {
    try {
      console.log('Attempting to play audio');
      const audioBytes = atob(base64Audio);
      const arrayBuffer = new ArrayBuffer(audioBytes.length);
      const bufferView = new Uint8Array(arrayBuffer);
      for (let i = 0; i < audioBytes.length; i++) {
        bufferView[i] = audioBytes.charCodeAt(i);
      }
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.play().catch((error) => {
        console.error("Audio playback error:", error);
      });
    } catch (error) {
      console.error("Error processing audio:", error);
    }
  };

  const fetchInitialMessagesAudio = async (text) => {
    try {
      const response = await axios.post('/text', { text });
      if (response.data.audio) {
        playAudio(response.data.audio);
      }
      return response.data.response;
    } catch (error) {
      console.error("Error fetching initial message audio:", error);
      return `Error: ${error.message}`;
    }
  };

  const handleTextSubmit = async () => {
    if (!input.trim()) return;
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    setIsLoading(true);
    console.log('Submitting text:', input);
    try {
      const response = await axios.post('/text', { text: input });
      console.log('Text response:', response.data);
      setMessages([...messages, { user: 'You', text: input, time: timestamp }, { user: 'ELIA', text: response.data.response, time: timestamp }]);
      if (response.data.audio) {
        playAudio(response.data.audio);
      }
      setInput('');
    } catch (error) {
      console.error("Text input error:", error);
      setMessages([...messages, { user: 'You', text: input, time: timestamp }, { user: 'ELIA', text: `Error: ${error.message}`, time: timestamp }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    if (!window.navigator.mediaDevices || !window.navigator.mediaDevices.getUserMedia) {
      setMessages([...messages, { user: 'You', text: 'Voice recorded', time: timestamp }, { user: 'ELIA', text: 'Error: Audio recording not supported in this browser. Use Chrome or Firefox with HTTPS.', time: timestamp }]);
      setIsChatVisible(true);
      return;
    }

    if (!isRecording) {
      try {
        console.log('Starting voice recording');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        chunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = (e) => {
          chunksRef.current.push(e.data);
        };
        mediaRecorderRef.current.onstop = async () => {
          stream.getTracks().forEach(track => track.stop());
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('audio', blob, 'recording.webm');
          formData.append('text', '');

          setIsLoading(true);
          setIsChatVisible(true);
          try {
            const response = await axios.post('/text', formData);
            console.log('Voice response:', response.data);
            setMessages([...messages, { user: 'You', text: 'Voice recorded', time: timestamp }, { user: 'ELIA', text: response.data.response, time: timestamp }]);
            if (response.data.audio) {
              playAudio(response.data.audio);
            }
          } catch (error) {
            console.error("Backend request error:", error);
            setMessages([...messages, { user: 'You', text: 'Voice recorded', time: timestamp }, { user: 'ELIA', text: `Error sending audio to backend: ${error.message}`, time: timestamp }]);
          } finally {
            setIsLoading(false);
          }
        };
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Audio input error:", error);
        setMessages([...messages, { user: 'You', text: 'Voice recorded', time: timestamp }, { user: 'ELIA', text: `Error recording audio: ${error.message}`, time: timestamp }]);
        setIsChatVisible(true);
        setIsLoading(false);
      }
    } else {
      console.log('Stopping voice recording');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const now = new Date();
      const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const formData = new FormData();
      formData.append('image', file);
      formData.append('text', '');

      setIsLoading(true);
      setIsChatVisible(true);
      console.log('Uploading image');
      try {
        const response = await axios.post('/text', formData);
        console.log('Image response:', response.data);
        setMessages([...messages, { user: 'You', text: 'Image uploaded', time: timestamp }, { user: 'ELIA', text: response.data.response, time: timestamp }]);
        if (response.data.audio) {
          playAudio(response.data.audio);
        }
      } catch (error) {
        console.error("Image upload error:", error);
        setMessages([...messages, { user: 'You', text: 'Image uploaded', time: timestamp }, { user: 'ELIA', text: `Error uploading image: ${error.message}`, time: timestamp }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTextInputClick = () => {
    console.log('Text input clicked, showing chat');
    setIsChatVisible(true);
  };

  useEffect(() => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    if (!isChatVisible) {
      setMessages([]);
    } else {
      const initialMessages = [
        { user: 'ELIA', text: 'Hello, Ryan! I’m ELIA, your professional health companion. Ready to optimize your wellness journey? 🌿', time: timestamp },
        { user: 'ELIA', text: 'Ask me about exercises, diet, or upload an image for advice. Let’s get started! ⏰', time: timestamp }
      ];
      setMessages(initialMessages);
      // Fetch audio for initial messages
      fetchInitialMessagesAudio(initialMessages[0].text).then((responseText) => {
        setMessages((prev) => [
          { ...prev[0], text: responseText },
          prev[1]
        ]);
      });
      fetchInitialMessagesAudio(initialMessages[1].text).then((responseText) => {
        setMessages((prev) => [
          prev[0],
          { ...prev[1], text: responseText }
        ]);
      });
    }
  }, [isChatVisible]);

  return (
    <div className="app">
      {!isChatVisible ? (
        <div className="landing-container">
          <img src="/src/LandingPage.JPG" alt="Landing Page" className="landing-image" />
          <div className="input-buttons">
            <label className="image-input landing-input">
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} ref={imageInputRef} />
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <path d="M21 15l-5-5L5 21"></path>
              </svg>
            </label>
            <button className={`voice-button landing-input ${isRecording ? 'recording' : ''}`} onClick={handleVoiceInput}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </button>
            <button className="text-input landing-input" onClick={handleTextInputClick}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3h18v18H3V3z"></path>
                <path d="M8 7h8m-8 4h8m-8 4h8"></path>
              </svg>
            </button>
          </div>
          <div className="nav-bar">
            <button className="nav-item">🏃 Journey</button>
            <button className="nav-item">👥 Community</button>
            <button className="nav-item active">🤖 ELIA</button>
            <button className="nav-item">🏬 Marketplace</button>
            <button className="nav-item">🏥 Health</button>
          </div>
        </div>
      ) : (
        <div className="chat-container">
          <div className="header">
            <h1>ELIA Health Coach</h1>
            <span className="close" onClick={() => setIsChatVisible(false)}>✖</span>
          </div>
          <div className="messages">
            {isLoading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Analyzing...</p>
              </div>
            ) : (
              messages.map((msg, index) => (
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
                        setMessages([...messages, { user: 'You', text: 'What do you suggest?', time: timestamp }, { user: 'ELIA', text: 'Great choice, Ryan! Try the Full-Body Flex & Flow routine: 45 min, 5000 points. 💪', time: timestamp }]);
                        fetchInitialMessagesAudio('Great choice, Ryan! Try the Full-Body Flex & Flow routine: 45 min, 5000 points. 💪').then((responseText) => {
                          setMessages((prev) => [
                            ...prev.slice(0, -1),
                            { user: 'ELIA', text: responseText, time: timestamp }
                          ]);
                        });
                      }}>
                        What do you suggest?
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
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
      )}
    </div>
  );
}

export default EliaApp;
