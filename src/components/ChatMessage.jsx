import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'; 
import RobotAvatar from '../assets/robot.png';
import UserAvatar from '../assets/user.png';
import './ChatMessage.css';

export default function ChatMessage({ message, sender }) {
  return (
    <div className={sender === 'user' ? 'user-message' : 'robot-message'}>
      {sender === 'robot' && <img src={RobotAvatar} className="avatar" alt="AI" />}
      
      <div className="message">
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
          }}
        >
          {message}
        </ReactMarkdown>
      </div>
      
      {sender === 'user' && <img src={UserAvatar} className="avatar" alt="User" />}
    </div>
  );
}
