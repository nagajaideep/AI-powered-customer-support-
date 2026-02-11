'use client';

import { useState, useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';
import UserSwitcher from '@/components/UserSwitcher';
import ConversationHistory from '@/components/ConversationHistory';
import { User, Message } from '@/types/chat';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDefaultUser();
  }, []);

  const fetchDefaultUser = async () => {
    try {
      console.log('Fetching users from backend...');
      const response = await fetch('http://localhost:3001/api/users');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const users = await response.json();
      console.log('Users fetched:', users);

      if (users.length > 0) {
        setCurrentUser(users[0]);
      } else {
        setError('No users found in database. Please run: npx prisma db seed');
      }
    } catch (error) {
      console.error('Failed to fetch default user:', error);
      setError('Failed to connect to backend. Make sure backend is running on port 3001.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (user: User) => {
    setCurrentUser(user);
    setConversationId(undefined);
    setMessages([]);
  };

  const handleSelectConversation = async (convId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/chat/conversations/${convId}`);
      const data = await response.json();
      setConversationId(convId);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const handleNewChat = () => {
    setConversationId(undefined);
    setMessages([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <svg
              className="w-16 h-16 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchDefaultUser();
              }}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">No users available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#f0f4ff] via-[#fafbff] to-[#f5f8ff]">
      {/* Sidebar */}
      <div
        className={`${showSidebar ? 'w-80' : 'w-0'
          } bg-white/80 backdrop-blur-xl border-r border-[#e5eaf3] transition-all duration-300 overflow-hidden shadow-sm`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-[#e5eaf3]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5b74e8] to-[#7b8ef9] flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#5b74e8] to-[#7b8ef9] bg-clip-text text-transparent">AI Support</h1>
            </div>
          </div>
          <ConversationHistory
            userId={currentUser.id}
            onSelectConversation={handleSelectConversation}
            currentConversationId={conversationId}
            onNewChat={handleNewChat}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-xl border-b border-[#e5eaf3] px-6 py-4 flex items-center gap-4 shadow-sm">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2.5 hover:bg-gradient-to-br hover:from-[#f0f4ff] hover:to-[#e8edff] rounded-xl transition-all duration-200 group"
          >
            <svg className="w-5 h-5 text-[#6b7bf2] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <UserSwitcher currentUser={currentUser} onUserChange={handleUserChange} />
        </div>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            userId={currentUser.id}
            conversationId={conversationId}
            initialMessages={messages}
            onConversationCreated={setConversationId}
          />
        </div>
      </div>
    </div>
  );
}
