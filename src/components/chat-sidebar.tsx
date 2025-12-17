'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { WICFINAvatarLogo, HomeIcon, BoxIcon, VercelIcon, AttachmentIcon, GitIcon } from './icons';

const NAV_ITEMS = [
  { label: 'Home', icon: HomeIcon, href: '/chat' },
  { label: 'Templates', icon: BoxIcon, href: '#' },
  { label: 'Explore', icon: VercelIcon, href: '#' },
  { label: 'History', icon: AttachmentIcon, href: '#' },
  { label: 'Wallet', icon: GitIcon, href: '#' },
];

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 transform border-r border-white/5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-white/5 px-4 py-4">
            <div className="rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 p-2">
              <WICFINAvatarLogo size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">WICFIN</p>
              <p className="text-xs text-gray-400">Secure AI Copilot</p>
            </div>
          </div>

          {/* Search */}
          <div className="border-b border-white/5 px-4 py-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search chats"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-gray-500 focus:border-teal-400/50 focus:outline-none focus:ring-1 focus:ring-teal-400/50"
              />
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                  onClick={onClose}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Chat History Sections - Can be populated dynamically */}
            <div className="mt-6 space-y-4">
              <div>
                <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                  Today
                </p>
                {/* Chat history items will go here */}
              </div>
            </div>
          </nav>

          {/* User Profile Footer */}
          <div className="border-t border-white/5 p-4">
            {session?.user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-blue-500">
                    <WICFINAvatarLogo size={24} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-white">
                      {session.user.email || 'WIC Foundation'}
                    </p>
                    <p className="text-xs text-gray-400">Free plan</p>
                  </div>
                  <button
                    className="rounded-lg border border-teal-400/30 px-3 py-1 text-xs text-teal-400 transition-colors hover:border-teal-400 hover:bg-teal-400/10"
                    type="button"
                  >
                    Upgrade
                  </button>
                </div>
                <button
                  onClick={() => signOut()}
                  className="w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="block w-full rounded-lg bg-gradient-to-r from-teal-500 to-blue-500 px-3 py-2 text-center text-sm font-medium text-white transition-all hover:from-teal-600 hover:to-blue-600"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
