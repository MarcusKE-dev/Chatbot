import { useState, useEffect } from 'react'
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

  // Speech Recognition
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

  async function sendMessage() {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      message: inputText,
      sender: "user",
      id: crypto.randomUUID()
    };

    // CONVERSATIONAL MEMORY
    const groqHistory = chatMessages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.message
    }));

    const updatedMessagesWithUser = [...chatMessages, userMessage];
    setChatMessages(updatedMessagesWithUser);
    
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    // Create a temporary bot message container for streaming text
    const botMessageId = crypto.randomUUID();
    const placeholderBotMessage = {
      message: '',
      sender: "robot",
      id: botMessageId
    };
    
    setChatMessages([...updatedMessagesWithUser, placeholderBotMessage]);

    try {
      // Add stream parameter
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

      // Loop through chunks of text as they arrive in real-time
      for await (const chunk of stream) {
        const textChunk = chunk.choices[0]?.delta?.content || '';
        accumulatedText += textChunk;

        // Update the unique bot message placeholder dynamically
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
      <input
        placeholder={isLoading ? "AI typing..." : isRecording ? "Listening..." : "Enter your message"}
        onChange={(e) => setInputText(e.target.value)}
        value={inputText}
        disabled={isLoading}
        className="chat-input"
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button 
        onClick={toggleVoiceInput} 
        disabled={isLoading} 
        className={`voice-btn ${isRecording ? 'recording' : ''}`}
        title="Voice Input"
      >
        {isRecording ? '🔴' : '🎙️'}
      </button>
      <button onClick={sendMessage} disabled={isLoading || !inputText.trim()} className="send-btn">
        Send
      </button>
    </div>
  )
}
