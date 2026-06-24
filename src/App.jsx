import { useState } from 'react';
import { ChatInput } from './components/ChatInput';
import ChatMessages from './components/ChatMessages';
import './App.css';

function App() {
  const [chatMessages, setChatMessages] = useState([
    { message: "Hello! How can I help you?", sender: "robot", id: 'id2' }
  ]);
  
  // 1. Add isLoading state here
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="app-container">
      {/* 2. Pass isLoading to ChatMessages */}
      <ChatMessages chatMessages={chatMessages} isLoading={isLoading} />
      
      {/* 3. Pass both state setters to ChatInput */}
      <ChatInput 
        chatMessages={chatMessages} 
        setChatMessages={setChatMessages} 
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    </div>
  );
}

export default App;
