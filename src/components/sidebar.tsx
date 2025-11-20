'use client';

import { useSession } from 'next-auth/react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import Link from 'next/link';

export function Sidebar() {
  const { data: session } = useSession();
  const router = useRouter();

  // Only render if user is logged in
  if (!session?.user) {
    return null;
  }

  return (
    <aside className="hidden lg:flex w-64 bg-[#1a1a1a] border-r border-gray-800/50 flex-col h-screen">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-800/50">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/WicFinWhite.png"
            alt="WIC DEFINE"
            className="h-8 object-contain cursor-pointer"
          />
          <span className="text-xl font-bold text-white">WICDEFIN</span>
        </Link>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Button
          onClick={() => router.push('/')}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white flex items-center gap-2 justify-center py-2.5 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          New Chat
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <div className="space-y-1">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span className="text-sm font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => router.push('/profile')}
            className="w-full flex items-center justify-between px-3 py-2.5 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors cursor-not-allowed opacity-50"
            disabled
          >
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="text-sm font-medium">Profile</span>
            </div>
            <span className="text-xs bg-gray-800 px-2 py-0.5 rounded">Soon</span>
          </button>

          <button
            onClick={() => router.push('/application')}
            className="w-full flex items-center justify-between px-3 py-2.5 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors cursor-not-allowed opacity-50"
            disabled
          >
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="text-sm font-medium">Application</span>
            </div>
            <span className="text-xs bg-gray-800 px-2 py-0.5 rounded">Soon</span>
          </button>

          <button
            onClick={() => router.push('/history')}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-sm font-medium">History</span>
          </button>

          <button
            onClick={() => router.push('/services')}
            className="w-full flex items-center justify-between px-3 py-2.5 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors cursor-not-allowed opacity-50"
            disabled
          >
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3" />
              </svg>
              <span className="text-sm font-medium">Services</span>
            </div>
            <span className="text-xs bg-gray-800 px-2 py-0.5 rounded">Soon</span>
          </button>

          <button
            onClick={() => router.push('/settings')}
            className="w-full flex items-center justify-between px-3 py-2.5 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors cursor-not-allowed opacity-50"
            disabled
          >
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6M1 12h6m6 0h6" />
                <path d="m4.93 4.93 4.24 4.24m5.66 0 4.24-4.24m0 14.14-4.24-4.24m-5.66 0-4.24 4.24" />
              </svg>
              <span className="text-sm font-medium">Settings</span>
            </div>
            <span className="text-xs bg-gray-800 px-2 py-0.5 rounded">Soon</span>
          </button>
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {session.user.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">
              {session.user.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session.user.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
