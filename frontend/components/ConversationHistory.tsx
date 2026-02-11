'use client';

import { useState, useEffect } from 'react';
import { Conversation } from '@/types/chat';

interface ConversationHistoryProps {
  userId: string;
  onSelectConversation: (conversationId: string) => void;
  currentConversationId?: string;
  onNewChat: () => void;
}

export default function ConversationHistory({
  userId,
  onSelectConversation,
  currentConversationId,
  onNewChat,
}: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/chat/conversations?userId=${userId}`);
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      await fetch(`http://localhost:3001/api/chat/conversations/${conversationId}`, {
        method: 'DELETE',
      });
      setConversations(conversations.filter((c) => c.id !== conversationId));
      if (currentConversationId === conversationId) {
        onNewChat();
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <h3 className="text-xs font-semibold text-[#7b8796] uppercase tracking-wider mb-2">
          Conversations
        </h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-sm text-[#7b8796] text-center py-8">No conversations yet</p>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group relative p-3 rounded-xl cursor-pointer transition-colors ${currentConversationId === conversation.id
                    ? 'bg-[#eef2ff] border border-[#cdd7ff]'
                    : 'hover:bg-white border border-transparent'
                  }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conversation.title || 'New Conversation'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(conversation.createdAt)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conversation.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-gray-400 hover:text-red-600 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}