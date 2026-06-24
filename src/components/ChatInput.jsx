import { useState, useEffect, useRef } from 'react' 
import Groq from 'groq-sdk'
import './ChatInput.css'

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

export function ChatInput({ chatMessages, setChatMessages, isLoading, setIsLoading }) {
  const [inputText, setInputText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recognition, setRecognition] = useState(null)
  
  const textareaRef = useRef(null);

  function saveInputText(event) {
    setInputText(event.target.value);
  }

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset the baseline measurement footprint
      
      const nextHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = `${nextHeight}px`;
    }
  }, [inputText]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => prev + " " + transcript);
        setIsRecording(false);
      };

      rec.onerror = () => setIsRecording(false);
      rec.onend = () => setIsRecording(false);
      setRecognition(rec);
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognition) return alert("Speech recognition is not supported in this browser.");
    if (isRecording) {
      recognition.stop();
    } else {
      setIsRecording(true);
      recognition.start();
    }
  };

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); 
      sendMessage();      
    }
  }

  async function sendMessage() {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      message: inputText,
      sender: "user",
      id: crypto.randomUUID()
    };

    const groqHistory = chatMessages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.message
    }));

    const updatedMessagesWithUser = [...chatMessages, userMessage];
    setChatMessages(updatedMessagesWithUser);
    
    const currentInput = inputText;
    setInputText(''); 
    setIsLoading(true);

    const botMessageId = crypto.randomUUID();
    const placeholderBotMessage = {
      message: '',
      sender: "robot",
      id: botMessageId
    };
    
    setChatMessages([...updatedMessagesWithUser, placeholderBotMessage]);

    try {
      const stream = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are a helpful coding and general knowledge assistant." },
          ...groqHistory,
          { role: "user", content: currentInput }
        ],
        model: "llama-3.1-8b-instant",
        stream: true, 
      });

      let accumulatedText = '';

      for await (const chunk of stream) {
        const textChunk = chunk.choices[0]?.delta?.content || '';
        accumulatedText += textChunk;

        setChatMessages((prevMessages) => 
          prevMessages.map((msg) => 
            msg.id === botMessageId ? { ...msg, message: accumulatedText } : msg
          )
        );
      }

    } catch (error) {
      console.error("Groq Stream Error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          rows="1"
          placeholder={isLoading ? "Thinking..." : "Message ChatGPT..."}
          onChange={saveInputText}
          value={inputText}
          disabled={isLoading}
          className="chat-input"
          onKeyDown={handleKeyDown}
        />
        
        <button onClick={toggleVoiceInput} className={`voice-btn ${isRecording ? 'recording' : ''}`} type="button">
          {isRecording ? '🔴' : '🎙️'}
        </button>
        
        <button 
          onClick={sendMessage} 
          disabled={isLoading || !inputText.trim()} 
          className="send-btn"
          type="button"
        >
          ↑
        </button>
      </div>
    </div>
  );
}
