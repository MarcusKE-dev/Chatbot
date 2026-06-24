import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'; 
import RobotAvatar from '../assets/robot.png';
import UserAvatar from '../assets/user.png';
import './ChatMessage.css';

function CodeBlock({ children, language, ...props }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`code-block-wrapper ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="code-block-header">
        <span className="code-lang">{language || 'code'}</span>
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="expand-toggle-btn"
          type="button"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      <div className="code-scroll-pane">
        <SyntaxHighlighter
          style={oneDark}
          language={language}
          PreTag="div"
          {...props}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export default function ChatMessage({ message, sender }) {
  return (
    <div className={sender === 'user' ? 'user-message' : 'robot-message'}>
      <img src={sender === 'user' ? UserAvatar : RobotAvatar} className="avatar" alt="Avatar" />
      
      <div className="message">
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <CodeBlock 
                  language={match[1]} 
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </CodeBlock>
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
    </div>
  );
}
