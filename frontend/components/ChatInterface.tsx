'use client';

import { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { Message, AgentType } from '@/types/chat';

interface ChatInterfaceProps {
  userId: string;
  conversationId?: string;
  initialMessages?: Message[];
  onConversationCreated?: (conversationId: string) => void;
}

export default function ChatInterface({
  userId,
  conversationId,
  initialMessages = [],
  onConversationCreated,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingAgentType, setTypingAgentType] = useState<AgentType | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [conversationId, initialMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const agentCards = [
    {
      icon: '🎧',
      title: 'Support Agent',
      description: 'General inquiries & troubleshooting'
    },
    {
      icon: '📦',
      title: 'Order Agent',
      description: 'Order status & tracking'
    },
    {
      icon: '💳',
      title: 'Billing Agent',
      description: 'Payments & refunds'
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:3001/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          userId,
          conversationId,
        }),
      });

      const data = await response.json();

      if (data.conversationId && !conversationId && onConversationCreated) {
        onConversationCreated(data.conversationId);
      }

      setTypingAgentType(data.agentType as AgentType);

      // Simulate delay for typing indicator
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsTyping(false);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        agentType: data.agentType as AgentType,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsTyping(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTypingAgentType(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
          <div className="text-center max-w-3xl w-full animate-in fade-in duration-700">
            <div className="mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 bg-gradient-to-br from-[#5b74e8] to-[#7b8ef9] shadow-2xl shadow-[#5b74e8]/30 animate-float">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-[#5b74e8] via-[#6b7bf2] to-[#7b8ef9] bg-clip-text text-transparent mb-4">AI Customer Support</h2>
              <p className="text-lg text-[#8b95a5] font-medium">Multi-agent system ready to help you</p>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              {agentCards.map((agent, index) => (
                <div
                  key={index}
                  className="w-[220px] bg-white/80 backdrop-blur-sm border border-[#e5eaf3] rounded-3xl p-6 text-left hover:shadow-2xl hover:shadow-[#5b74e8]/10 hover:border-[#c5d0ff] hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">{agent.icon}</div>
                  <h3 className="text-base font-bold text-[#2b2f38] mb-2 group-hover:text-[#5b74e8] transition-colors">{agent.title}</h3>
                  <p className="text-sm text-[#8b95a5] leading-relaxed">{agent.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator agentType={typingAgentType} />}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="border-t border-[#e5eaf3] bg-white/90 backdrop-blur-xl px-6 py-6 shadow-lg">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about orders, billing, or support..."
              className="flex-1 px-6 py-5 border-2 border-[#e5eaf3] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8da1ff] focus:border-[#6b7bf2] transition-all text-lg bg-white shadow-sm hover:shadow-md placeholder-[#a0a8b8]"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="text-white font-semibold px-8 py-5 rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 bg-gradient-to-r from-[#5b74e8] to-[#6b7bf2] hover:from-[#4e66df] hover:to-[#5b6fe6] shadow-lg shadow-[#5b74e8]/30 hover:shadow-xl hover:shadow-[#5b74e8]/40 hover:scale-105"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending
                </>
              ) : (
                <>
                  Send
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}