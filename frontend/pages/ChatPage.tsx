import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from '../components/chatbot/ChatMessage';
import QuickActions from '../components/chatbot/QuickActions';
import { Message, Role } from '../chatbotTypes';
import { geminiService } from '../services/chatbot/geminiService';
import { Send, Bot, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const INITIAL_MESSAGE: Message = {
  id: 'init-1',
  role: Role.MODEL,
  text: "I'm Anomalyse. I'm here to help you secure your account.\n\nWhat would you like to do first? I can help you **freeze your card**, **check recent transactions**, or **contact the bank**."
};

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    geminiService.initChat();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsgId = Date.now().toString();
    const newUserMsg: Message = {
      id: userMsgId,
      role: Role.USER,
      text: text.trim()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsStreaming(true);

    try {
      const aiMsgId = (Date.now() + 1).toString();
      
      setMessages(prev => [
        ...prev, 
        { id: aiMsgId, role: Role.MODEL, text: '', isStreaming: true }
      ]);

      const stream = await geminiService.sendMessageStream(newUserMsg.text);
      
      let fullText = '';
      
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === aiMsgId 
            ? { ...msg, text: fullText } 
            : msg
        ));
      }

      setMessages(prev => prev.map(msg => 
        msg.id === aiMsgId 
          ? { ...msg, isStreaming: false } 
          : msg
      ));

    } catch (error: any) {
      console.error("Error sending message:", error);
      
      let errorMessage = "Connection error. Please call bank support directly.";
      
      // Check for quota/429 error
      if (error?.message?.includes("429") || error?.message?.includes("quota") || error?.message?.includes("limit exceeded")) {
        errorMessage = "Daily chat limit reached (20 requests/day). Please try again later or contact support.";
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: Role.MODEL,
        text: errorMessage
      }]);
    } finally {
      setIsStreaming(false);
      if (window.innerWidth > 768) {
        inputRef.current?.focus();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Chat Header */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between shadow-lg sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center border-2 border-white/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Anomalyse AI</h2>
              <p className="text-xs text-blue-300">Fraud Protection Assistant</p>
            </div>
          </div>
        </div>
        <div className="hidden sm:block">
          <img src="/logo.jpeg" alt="Logo" className="w-8 h-8 rounded-full border border-white/20" />
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 sm:p-6 overflow-hidden">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isStreaming && (
              <div className="flex justify-start">
                 <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <QuickActions 
              onActionClick={handleSendMessage} 
              disabled={isStreaming} 
            />
            <form onSubmit={handleSubmit} className="relative mt-4">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message here..."
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                disabled={isStreaming}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isStreaming}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              Anomalyse AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
