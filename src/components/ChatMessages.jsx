import { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import RobotAvatar from '../assets/robot.png';
import './ChatMessages.css';

function ChatMessages({ chatMessages, isLoading }) {
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    const containerElm = chatMessagesRef.current;
    if (containerElm) {
      containerElm.scrollTop = containerElm.scrollHeight;
    }
  }, [chatMessages, isLoading]);

  return ( 
    <div className="messages-container" ref={chatMessagesRef}>
      {chatMessages.map((chatMessage) => {
        // CORRECTION: Skip rendering the message if it's the empty streaming placeholder
        if (chatMessage.message === '' && chatMessage.sender === 'robot') {
          return null;
        }

        return (
          <ChatMessage 
            message={chatMessage.message}
            sender={chatMessage.sender}
            key={chatMessage.id}
          />
        );
      })}

      {/* Conditional Loading Element: This handles the dots perfectly now */}
      {isLoading && (
        <div className="robot-message loading-bubble">
          <img src={RobotAvatar} className="avatar" alt="Robot" />
          <div className="message typing-loader">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatMessages;
