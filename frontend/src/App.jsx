// import React, { useState, useRef, useEffect } from 'react';
// import axios from 'axios';
// import './App.css';

// function EliaApp() {
//   const [isChatVisible, setIsChatVisible] = useState(false);
//   const [input, setInput] = useState('');
//   const [messages, setMessages] = useState([]);
//   const audioInputRef = useRef(null);

//   const handleTextSubmit = async () => {
//     if (!input.trim()) return;
//     const now = new Date();
//     const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
//     try {
//       const response = await axios.post('/text', { text: input });
//       setMessages([...messages, { user: 'You', text: input, time: timestamp }, { user: 'ELIA', text: response.data.response, time: timestamp }]);
//       setInput('');
//     } catch (error) {
//       console.error("Text input error:", error);
//       setMessages([...messages, { user: 'You', text: input, time: timestamp }, { user: 'ELIA', text: `Error: ${error.message}`, time: timestamp }]);
//     }
//   };

//   const handleVoiceInput = async () => {
//     const now = new Date();
//     const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

//     if (!window.navigator.mediaDevices || !window.navigator.mediaDevices.getUserMedia) {
//       console.error("MediaDevices or getUserMedia not supported");
//       setMessages([...messages, { user: 'You', text: 'Voice recorded', time: timestamp }, { user: 'ELIA', text: 'Error: Audio recording not supported in this browser. Use Chrome or Firefox with HTTPS.', time: timestamp }]);
//       return;
//     }

//     try {
//       console.log("Requesting microphone access...");
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       console.log("Microphone access granted");
//       const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
//       const chunks = [];
//       mediaRecorder.ondataavailable = (e) => {
//         console.log("Recording data available");
//         chunks.push(e.data);
//       };
//       mediaRecorder.onstop = async () => {
//         console.log("Recording stopped");
//         stream.getTracks().forEach(track => track.stop());
//         const blob = new Blob(chunks, { type: 'audio/webm' });
//         const formData = new FormData();
//         formData.append('audio', blob, 'recording.webm');
//         try {
//           const response = await axios.post('/text', { text: 'Voice input (mock)' });
//           setMessages([...messages, { user: 'You', text: 'Voice recorded', time: timestamp }, { user: 'ELIA', text: response.data.response, time: timestamp }]);
//         } catch (error) {
//           console.error("Backend request error:", error);
//           setMessages([...messages, { user: 'You', text: 'Voice recorded', time: timestamp }, { user: 'ELIA', text: `Error sending audio to backend: ${error.message}`, time: timestamp }]);
//         }
//       };
//       mediaRecorder.onstart = () => console.log("Recording started");
//       mediaRecorder.onerror = (e) => console.error("MediaRecorder error:", e);
//       mediaRecorder.start();
//       setTimeout(() => {
//         mediaRecorder.stop();
//         console.log("Recording timeout triggered");
//       }, 5000);
//     } catch (error) {
//       console.error("Audio input error:", error);
//       setMessages([...messages, { user: 'You', text: 'Voice recorded', time: timestamp }, { user: 'ELIA', text: `Error recording audio: ${error.message}`, time: timestamp }]);
//     }
//   };

//   const handleImageUpload = async (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const now = new Date();
//       const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
//       const formData = new FormData();
//       formData.append('image', file);
//       try {
//         const response = await axios.post('/text', formData);
//         setMessages([...messages, { user: 'You', text: 'Image uploaded', time: timestamp }, { user: 'ELIA', text: response.data.response, time: timestamp }]);
//       } catch (error) {
//         console.error("Image upload error:", error);
//         setMessages([...messages, { user: 'You', text: 'Image uploaded', time: timestamp }, { user: 'ELIA', text: `Error uploading image: ${error.message}`, time: timestamp }]);
//       }
//     }
//   };

//   useEffect(() => {
//     const now = new Date();
//     const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
//     if (!isChatVisible) {
//       setMessages([]);
//     } else {
//       setMessages([
//         { user: 'ELIA', text: 'Hello, Ryan! I’m ELIA, your professional health companion. Ready to optimize your wellness journey? 🌿', time: timestamp },
//         { user: 'ELIA', text: 'Ask me about exercises, diet, or upload an image for advice. Let’s get started! ⏰', time: timestamp }
//       ]);
//     }
//   }, [isChatVisible]);

//   if (!isChatVisible) {
//     return (
//       <div className="app">
//         <div className="landing-container">
//           <img src="/src/LandingPage.JPG" alt="Landing Page" className="landing-image" />
//           <button className="chat-button" onClick={() => setIsChatVisible(true)}>Let's Chat</button>
//         </div>
//         <div className="nav-bar">
//           <button className="nav-item">🏃 Journey</button>
//           <button className="nav-item">👥 Community</button>
//           <button className="nav-item active">🤖 ELIA</button>
//           <button className="nav-item">🏬 Marketplace</button>
//           <button className="nav-item">🏥 Health</button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="app">
//       <div className="header">
//         <h1>ELIA Health Coach</h1>
//         <span className="close" onClick={() => setIsChatVisible(false)}>✖</span>
//       </div>
//       <div className="chat-container">
//         <div className="messages">
//           {messages.map((msg, index) => (
//             <div key={index} className={`message-container ${msg.user === 'ELIA' ? 'elia-container' : 'user-container'}`}>
//               <div className={`avatar ${msg.user === 'ELIA' ? 'elia-avatar' : 'user-avatar'}`}>
//                 {msg.user.charAt(0)}
//               </div>
//               <div className={`message ${msg.user === 'ELIA' ? 'elia' : 'user'}`}>
//                 <span className="user-label">{msg.user}</span>
//                 <p>{msg.text}</p>
//                 <span className="timestamp">{msg.time}</span>
//                 {msg.user === 'ELIA' && index === 1 && (
//                   <button className="suggest-button" onClick={() => {
//                     const now = new Date();
//                     const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
//                     setMessages([...messages, { user: 'You', text: 'What do you suggest?', time: timestamp }, { user: 'ELIA', text: 'Great choice, Ryan! Try the Full-Body Flex & Flow routine: 45 min, 5000 points. 💪', time: timestamp }]);
//                   }}>
//                     What do you suggest?
//                   </button>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//       <div className="input-area">
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Type your message..."
//         />
//         <label className="image-input">
//           <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
//           <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
//             <circle cx="8.5" cy="8.5" r="1.5"></circle>
//             <path d="M21 15l-5-5L5 21"></path>
//           </svg>
//         </label>
//         <button className="voice-button" onClick={handleVoiceInput}>
//           <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
//             <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
//             <line x1="12" y1="19" x2="12" y2="23"></line>
//             <line x1="8" y1="23" x2="16" y2="23"></line>
//           </svg>
//         </button>
//         <button className="send-button" onClick={handleTextSubmit}>Send</button>
//       </div>
//       <div className="nav-bar">
//         <button className="nav-item">🏃 Journey</button>
//         <button className="nav-item">👥 Community</button>
//         <button className="nav-item active">🤖 ELIA</button>
//         <button className="nav-item">🏬 Marketplace</button>
//         <button className="nav-item">🏥 Health</button>
//       </div>
//     </div>
//   );
// }

// export default EliaApp;


// import React, { useState, useRef, useEffect } from 'react';
// import axios from 'axios';
// import './App.css';

// function EliaApp() {
//   const [isChatVisible, setIsChatVisible] = useState(false);
//   const [input, setInput] = useState('');
//   const [messages, setMessages] = useState([]);
//   const audioInputRef = useRef(null);

//   const handleTextSubmit = async () => {
//     if (!input.trim()) return;
//     const now = new Date();
//     const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
//     try {
//       const response = await axios.post('/text', { text: input });
//       setMessages([...messages, { user: 'You', text: input, time: timestamp }, { user: 'ELIA', text: response.data.response, time: timestamp }]);
//       setInput('');
//     } catch (error) {
//       console.error("Text input error:", error);
//       setMessages([...messages, { user: 'You', text: input, time: timestamp }, { user: 'ELIA', text: `Error: ${error.message}`, time: timestamp }]);
//     }
//   };

//   const handleVoiceInput = async () => {
//     const now = new Date();
//     const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

//     if (!window.navigator.mediaDevices || !window.navigator.mediaDevices.getUserMedia) {
//       setMessages([...messages, { user: 'You', text: 'Voice recorded', time: timestamp }, { user: 'ELIA', text: 'Error: Audio recording not supported in this browser. Use Chrome or Firefox with HTTPS.', time: timestamp }]);
//       return;
//     }

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
//       const chunks = [];
//       mediaRecorder.ondataavailable = (e) => {
//         chunks.push(e.data);
//       };
//       mediaRecorder.onstop = async () => {
//         stream.getTracks().forEach(track => track.stop());
//         const blob = new Blob(chunks, { type: 'audio/webm' });
//         const formData = new FormData();
//         formData.append('audio', blob, 'recording.webm');
//         formData.append('text', ''); // always provide text field

//         try {
//           const response = await axios.post('/text', formData);
//           setMessages([...messages, { user: 'You', text: 'Voice recorded', time: timestamp }, { user: 'ELIA', text: response.data.response, time: timestamp }]);
//         } catch (error) {
//           console.error("Backend request error:", error);
//           setMessages([...messages, { user: 'You', text: 'Voice recorded', time: timestamp }, { user: 'ELIA', text: `Error sending audio to backend: ${error.message}`, time: timestamp }]);
//         }
//       };
//       mediaRecorder.start();
//       setTimeout(() => {
//         mediaRecorder.stop();
//       }, 5000);
//     } catch (error) {
//       console.error("Audio input error:", error);
//       setMessages([...messages, { user: 'You', text: 'Voice recorded', time: timestamp }, { user: 'ELIA', text: `Error recording audio: ${error.message}`, time: timestamp }]);
//     }
//   };

//   const handleImageUpload = async (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const now = new Date();
//       const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
//       const formData = new FormData();
//       formData.append('image', file);
//       formData.append('text', ''); // always provide text field

//       try {
//         const response = await axios.post('/text', formData);
//         setMessages([...messages, { user: 'You', text: 'Image uploaded', time: timestamp }, { user: 'ELIA', text: response.data.response, time: timestamp }]);
//       } catch (error) {
//         console.error("Image upload error:", error);
//         setMessages([...messages, { user: 'You', text: 'Image uploaded', time: timestamp }, { user: 'ELIA', text: `Error uploading image: ${error.message}`, time: timestamp }]);
//       }
//     }
//   };

//   useEffect(() => {
//     const now = new Date();
//     const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
//     if (!isChatVisible) {
//       setMessages([]);
//     } else {
//       setMessages([
//         { user: 'ELIA', text: 'Hello, Ryan! I’m ELIA, your professional health companion. Ready to optimize your wellness journey? 🌿', time: timestamp },
//         { user: 'ELIA', text: 'Ask me about exercises, diet, or upload an image for advice. Let’s get started! ⏰', time: timestamp }
//       ]);
//     }
//   }, [isChatVisible]);

//   if (!isChatVisible) {
//     return (
//       <div className="app">
//         <div className="landing-container">
//           <img src="/src/LandingPage.JPG" alt="Landing Page" className="landing-image" />
//           <button className="chat-button" onClick={() => setIsChatVisible(true)}>Let's Chat</button>
//         </div>
//         <div className="nav-bar">
//           <button className="nav-item">🏃 Journey</button>
//           <button className="nav-item">👥 Community</button>
//           <button className="nav-item active">🤖 ELIA</button>
//           <button className="nav-item">🏬 Marketplace</button>
//           <button className="nav-item">🏥 Health</button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="app">
//       <div className="header">
//         <h1>ELIA Health Coach</h1>
//         <span className="close" onClick={() => setIsChatVisible(false)}>✖</span>
//       </div>
//       <div className="chat-container">
//         <div className="messages">
//           {messages.map((msg, index) => (
//             <div key={index} className={`message-container ${msg.user === 'ELIA' ? 'elia-container' : 'user-container'}`}>
//               <div className={`avatar ${msg.user === 'ELIA' ? 'elia-avatar' : 'user-avatar'}`}>
//                 {msg.user.charAt(0)}
//               </div>
//               <div className={`message ${msg.user === 'ELIA' ? 'elia' : 'user'}`}>
//                 <span className="user-label">{msg.user}</span>
//                 <p>{msg.text}</p>
//                 <span className="timestamp">{msg.time}</span>
//                 {msg.user === 'ELIA' && index === 1 && (
//                   <button className="suggest-button" onClick={() => {
//                     const now = new Date();
//                     const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
//                     setMessages([...messages, { user: 'You', text: 'What do you suggest?', time: timestamp }, { user: 'ELIA', text: 'Great choice, Ryan! Try the Full-Body Flex & Flow routine: 45 min, 5000 points. 💪', time: timestamp }]);
//                   }}>
//                     What do you suggest?
//                   </button>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//       <div className="input-area">
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Type your message..."
//         />
//         <label className="image-input">
//           <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
//           <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
//             <circle cx="8.5" cy="8.5" r="1.5"></circle>
//             <path d="M21 15l-5-5L5 21"></path>
//           </svg>
//         </label>
//         <button className="voice-button" onClick={handleVoiceInput}>
//           <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
//             <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
//             <line x1="12" y1="19" x2="12" y2="23"></line>
//             <line x1="8" y1="23" x2="16" y2="23"></line>
//           </svg>
//         </button>
//         <button className="send-button" onClick={handleTextSubmit}>Send</button>
//       </div>
//       <div className="nav-bar">
//         <button className="nav-item">🏃 Journey</button>
//         <button className="nav-item">👥 Community</button>
//         <button className="nav-item active">🤖 ELIA</button>
//         <button className="nav-item">🏬 Marketplace</button>
//         <button className="nav-item">🏥 Health</button>
//       </div>
//     </div>
//   );
// }

// export default EliaApp;



import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function EliaApp() {
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const audioInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  const handleTextSubmit = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    try {
      const response = await axios.post('/text', { text: input });
      setMessages([...messages, { user: 'You', text: input, time: timestamp }, { user: 'ELIA', text: response.data.response, time: timestamp }]);
      setInput('');
      playAudio(response.data.audio); // Play the audio response
    } catch (error) {
      console.error("Text input error:", error);
      setMessages([...messages, { user: 'You', text: input, time: timestamp }, { user: 'ELIA', text: `Error: ${error.message}`, time: timestamp }]);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (audioData) => {
    if (!audioData) return;
    const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      return;
    }

    // Start recording
    setIsLoading(true);
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    if (!window.navigator.mediaDevices || !window.navigator.mediaDevices.getUserMedia) {
      setMessages([...messages, { user: 'You', text: 'Voice recorded', time: timestamp }, { user: 'ELIA', text: 'Error: Audio recording not supported in this browser. Use Chrome or Firefox with HTTPS.', time: timestamp }]);
      setIsLoading(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        chunks.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');
        formData.append('text', '');

        try {
          const response = await axios.post('/text', formData, { responseType: 'arraybuffer' });
          const audioBlob = new Blob([response.data.audio], { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.play();
          
          setMessages([...messages, 
            { user: 'You', text: 'Voice message', time: timestamp }, 
            { user: 'ELIA', text: response.data.response, time: timestamp }
          ]);
        } catch (error) {
          console.error("Backend request error:", error);
          setMessages([...messages, 
            { user: 'You', text: 'Voice message', time: timestamp }, 
            { user: 'ELIA', text: `Error: ${error.message}`, time: timestamp }
          ]);
        } finally {
          setIsLoading(false);
        }
      };

      setIsRecording(true);
      mediaRecorderRef.current.start();
    } catch (error) {
      console.error("Audio input error:", error);
      setMessages([...messages, 
        { user: 'You', text: 'Voice message', time: timestamp }, 
        { user: 'ELIA', text: `Error: ${error.message}`, time: timestamp }
      ]);
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsLoading(true);
      const now = new Date();
      const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const formData = new FormData();
      formData.append('image', file);
      formData.append('text', '');

      try {
        const response = await axios.post('/text', formData, { responseType: 'arraybuffer' });
        const audioBlob = new Blob([response.data.audio], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
        
        setMessages([...messages, 
          { user: 'You', text: 'Image uploaded', time: timestamp }, 
          { user: 'ELIA', text: response.data.response, time: timestamp }
        ]);
      } catch (error) {
        console.error("Image upload error:", error);
        setMessages([...messages, 
          { user: 'You', text: 'Image uploaded', time: timestamp }, 
          { user: 'ELIA', text: `Error: ${error.message}`, time: timestamp }
        ]);
      } finally {
        setIsLoading(false);
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
        { user: 'ELIA', text: 'Hello, Ryan! I'm ELIA, your professional health companion. Ready to optimize your wellness journey? 🌿', time: timestamp },
        { user: 'ELIA', text: 'Ask me about exercises, diet, or upload an image for advice. Let's get started! ⏰', time: timestamp }
      ]);
    }
  }, [isChatVisible]);

  if (!isChatVisible) {
    return (
      <div className="app">
        <div className="landing-container">
          <img src="/src/LandingPage.JPG" alt="Landing Page" className="landing-image" />
          <div className="input-options">
            <label className="image-option">
              <input type="file" accept="image/*" onChange={(e) => {
                handleImageUpload(e);
                setIsChatVisible(true);
              }} style={{ display: 'none' }} />
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <path d="M21 15l-5-5L5 21"></path>
              </svg>
              <span>Upload Image</span>
            </label>
            
            <button className="voice-option" onClick={() => {
              setIsChatVisible(true);
              // We'll handle recording in the chat interface
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
              <span>Voice Message</span>
            </button>
            
            <div className="text-option" onClick={() => setIsChatVisible(true)}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>Text Message</span>
            </div>
          </div>
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
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-container elia-container">
              <div className="avatar elia-avatar">E</div>
              <div className="message elia">
                <span className="user-label">ELIA</span>
                <div className="loading-spinner"></div>
                <span className="timestamp">Just now</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
        />
        <label className="image-input">
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <path d="M21 15l-5-5L5 21"></path>
          </svg>
        </label>
        <button 
          className={`voice-button ${isRecording ? 'recording' : ''}`} 
          onClick={handleVoiceInput}
        >
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
}

export default EliaApp;
