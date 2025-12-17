'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { ChatHeader } from '@/components/chat-header';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a1a1a]">
        <div className="text-white">Loading...</div>
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
          <div className="max-w-7xl mx-auto p-6">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {session.user.name}!
              </h1>
              <p className="text-gray-400 mb-3">
                Manage your loan applications and get AI-powered assistance
              </p>
              <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-4">
                <p className="text-teal-400 text-sm">
                  <strong>Coming Soon!</strong> These features will be available on WIC DEFINE soon. Try out our chatbot to see what it can do for you.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content - Left 2 columns */}
              <div className="lg:col-span-2 space-y-6">
                {/* Create New Application Card */}
                <div className="bg-gradient-to-br from-teal-600 to-cyan-700 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="11" x2="12" y2="17" />
                        <line x1="9" y1="14" x2="15" y2="14" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Apply for a New Loan
                      </h3>
                      <p className="text-white/90 mb-4">
                        Get AI assistance to help you through the application process.
                        We'll guide you step by step.
                      </p>
                      <button
                        onClick={() => router.push('/application')}
                        className="bg-white text-teal-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                      >
                        Start New Application
                      </button>
                    </div>
                  </div>
                </div>

                {/* Past Applications Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Past Applications</h2>
                    <button className="text-teal-500 hover:text-teal-400 text-sm font-medium">
                      View All →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Application Card 1 */}
                    <div className="bg-[#2a2a2a] border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                            <span className="text-2xl font-bold text-yellow-500">A</span>
                          </div>
                          <div>
                            <h3 className="text-white font-medium">Honda Auto Loan</h3>
                            <p className="text-sm text-gray-400">Submitted 2 weeks ago</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">$355</p>
                          <p className="text-sm text-gray-400">Per month</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-800">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Status</span>
                          <span className="text-yellow-500 font-medium">Under Review</span>
                        </div>
                      </div>
                    </div>

                    {/* Application Card 2 */}
                    <div className="bg-[#2a2a2a] border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <span className="text-2xl font-bold text-blue-500">B</span>
                          </div>
                          <div>
                            <h3 className="text-white font-medium">Escrow Loan</h3>
                            <p className="text-sm text-gray-400">Submitted 1 month ago</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">$1,250</p>
                          <p className="text-sm text-gray-400">Per month</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-800">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Status</span>
                          <span className="text-green-500 font-medium">Approved</span>
                        </div>
                      </div>
                    </div>

                    {/* Application Card 3 */}
                    <div className="bg-[#2a2a2a] border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                            <span className="text-2xl font-bold text-green-500">C</span>
                          </div>
                          <div>
                            <h3 className="text-white font-medium">Business Loan</h3>
                            <p className="text-sm text-gray-400">Submitted 2 months ago</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">$250</p>
                          <p className="text-sm text-gray-400">Per month</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-800">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Status</span>
                          <span className="text-green-500 font-medium">Approved</span>
                        </div>
                      </div>
                    </div>

                    {/* Application Card 4 */}
                    <div className="bg-[#2a2a2a] border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                            <span className="text-2xl font-bold text-red-500">D</span>
                          </div>
                          <div>
                            <h3 className="text-white font-medium">Personal Loan</h3>
                            <p className="text-sm text-gray-400">Submitted 3 months ago</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">$700</p>
                          <p className="text-sm text-gray-400">Per month</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-800">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Status</span>
                          <span className="text-red-500 font-medium">Declined</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar - 1 column */}
              <div className="space-y-6">
                {/* AI Assistant Card */}
                <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600 rounded-2xl p-6 shadow-xl overflow-hidden">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-teal-500/20"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                        <img
                          src="/WicFinWhite.png"
                          alt="WIC DEFINE"
                          className="w-8 h-8 object-contain invert"
                        />
                      </div>
                      <h3 className="text-white font-semibold text-lg">WICDEFIN AI Assistant</h3>
                    </div>
                    <p className="text-white/90 text-sm mb-4">
                      Hello! I'm your AI assistant. I can help guide you through the application
                      process. What type of loan are you looking for today?
                    </p>
                    <button
                      onClick={() => router.push('/chat')}
                      className="w-full bg-white text-purple-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-lg"
                    >
                      Start Conversation →
                    </button>
                  </div>
                </div>

                {/* Qualification Score */}
                <div className="bg-[#2a2a2a] border border-gray-800 rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-4">Credit Qualification</h3>
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#374151"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#10b981"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray="351.86"
                          strokeDashoffset="87.97"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white">780</div>
                          <div className="text-xs text-gray-400">FICO Score</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status</span>
                      <span className="text-green-500 font-medium">Pre-Qualified</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Confidence Score</span>
                      <span className="text-white font-medium">92%</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-[#2a2a2a] border border-gray-800 rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-4">Your Stats</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-400">Active Loans</span>
                        <span className="text-sm text-white font-medium">2</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-teal-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-400">Monthly Payment</span>
                        <span className="text-sm text-white font-medium">$1,605</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-400">Average Rate</span>
                        <span className="text-sm text-white font-medium">5.25%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '52%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
