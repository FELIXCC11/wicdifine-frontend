'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { ChatHeader } from '@/components/chat-header';
import { MessageSquare, Clock, ChevronRight } from 'lucide-react';

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  visibility: string;
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchChatHistory();
    }
  }, [session]);

  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/history?limit=50');

      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }

      const data = await response.json();

      // Handle both formats - direct array or chats property
      if (data.chats && Array.isArray(data.chats)) {
        setChats(data.chats);
      } else if (Array.isArray(data)) {
        setChats(data);
      } else {
        setChats([]);
      }
    } catch (err) {
      setError('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a1a1a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <div className="text-white">Loading your chat history...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#1a1a1a] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader
          chatId=""
          selectedModelId=""
          selectedVisibilityType="private"
          isReadonly={false}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-8 h-8 text-teal-500" />
                <h1 className="text-3xl font-bold text-white">Chat History</h1>
              </div>
              <p className="text-gray-400">
                View and manage all your previous conversations
              </p>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && chats.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                  <MessageSquare className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No conversations yet</h3>
                <p className="text-gray-400 mb-6 text-center max-w-md">
                  Start a new conversation with our AI assistant to see it appear here
                </p>
                <button
                  onClick={() => router.push('/chat')}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Start New Chat
                </button>
              </div>
            )}

            {/* Chat List */}
            {chats.length > 0 && (
              <div className="space-y-3">
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => handleChatClick(chat.id)}
                    className="w-full bg-[#2a2a2a] border border-gray-800 rounded-xl p-5 hover:border-gray-700 hover:bg-[#2f2f2f] transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-6 h-6 text-teal-500" />
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="text-white font-medium text-lg mb-1 line-clamp-1">
                            {chat.title || 'Untitled Conversation'}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDate(chat.createdAt)}
                            </span>
                            {chat.updatedAt && chat.updatedAt !== chat.createdAt && (
                              <span>
                                Updated {formatDate(chat.updatedAt)}
                              </span>
                            )}
                            <span className="capitalize px-2 py-0.5 bg-gray-800 rounded text-xs">
                              {chat.visibility || 'private'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Stats Summary */}
            {chats.length > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#2a2a2a] border border-gray-800 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Total Conversations</div>
                  <div className="text-2xl font-bold text-white">{chats.length}</div>
                </div>
                <div className="bg-[#2a2a2a] border border-gray-800 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">This Week</div>
                  <div className="text-2xl font-bold text-white">
                    {chats.filter(chat => {
                      const diffInDays = (new Date().getTime() - new Date(chat.createdAt).getTime()) / (1000 * 60 * 60 * 24);
                      return diffInDays <= 7;
                    }).length}
                  </div>
                </div>
                <div className="bg-[#2a2a2a] border border-gray-800 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">This Month</div>
                  <div className="text-2xl font-bold text-white">
                    {chats.filter(chat => {
                      const diffInDays = (new Date().getTime() - new Date(chat.createdAt).getTime()) / (1000 * 60 * 60 * 24);
                      return diffInDays <= 30;
                    }).length}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
