import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Role } from '../../chatbotTypes';
import { BotIcon, UserIcon } from './Icons';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
          {isUser ? <UserIcon className="w-5 h-5" /> : <BotIcon className="w-5 h-5" />}
        </div>

        {/* Message Bubble */}
        <div 
          className={`px-5 py-3 rounded-2xl shadow-sm leading-relaxed text-sm md:text-base 
            ${isUser 
              ? 'bg-red-600 text-white rounded-tr-none' 
              : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
            }`}
        >
          {isUser ? (
             <p>{message.text}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-2 prose-li:my-0 text-slate-700">
               <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ChatMessage;