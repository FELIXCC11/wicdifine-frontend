'use client';

import { memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, Edit2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { VisibilityType } from './visibility-selector';
import { useSession, signOut } from 'next-auth/react';

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  applicationId,
}: {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  applicationId?: string;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <header className="sticky top-0 z-20 bg-[#1a1a1a] border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-2 md:py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Empty space (logo moved to sidebar) */}
          <div className="flex items-center gap-2">
          </div>

          {/* Right side - Login/Deploy buttons */}
          <div className="flex items-center gap-2 md:gap-3">
            {status === 'loading' ? (
              <div className="w-16 h-8"></div>
            ) : status === 'authenticated' && session?.user ? (
              <>
                {/* User menu when logged in */}
                <Link href="/settings/security">
                  <button className="px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-300 hover:text-white transition-colors">
                    Settings
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Login button */}
                <Link href="/auth/login">
                  <button className="px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-300 hover:text-white transition-colors">
                    Login
                  </button>
                </Link>
              </>
            )}

            {/* Deploy with WICChain button - Hover golden glow */}
            <div className="relative group">
              {/* Premium CTA Styles */}
              <style jsx>{`
                /* Premium CTA button base */
                .premium-cta {
                  position: relative;
                  background: linear-gradient(180deg, #151827 0%, #101322 100%);
                  box-shadow:
                    0 0 0 1px rgba(255, 255, 255, 0.12),
                    0 10px 35px rgba(0, 0, 0, 0.6);
                  border-radius: 9999px;
                  transition: all 0.3s ease;
                }

                /* Hover golden glow in the middle */
                .premium-cta::before {
                  content: '';
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: 0%;
                  height: 0%;
                  background: radial-gradient(
                    circle,
                    rgba(255, 215, 0, 0.6) 0%,
                    rgba(255, 193, 7, 0.4) 30%,
                    rgba(255, 215, 0, 0) 70%
                  );
                  border-radius: 50%;
                  opacity: 0;
                  transition: all 0.4s ease;
                  pointer-events: none;
                  filter: blur(20px);
                }

                .premium-cta:hover::before {
                  width: 150%;
                  height: 200%;
                  opacity: 1;
                }

                .premium-cta:hover {
                  box-shadow:
                    0 0 0 1px rgba(255, 215, 0, 0.3),
                    0 0 30px rgba(255, 215, 0, 0.3),
                    0 10px 35px rgba(0, 0, 0, 0.6);
                }
              `}</style>

              {/* Main button */}
              <button className="premium-cta flex items-center gap-1 md:gap-2 px-4 md:px-6 py-2.5 md:py-2.5">
                {/* WicChain Icon */}
                <div className="relative z-10">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="white"
                    className="md:w-4 md:h-4"
                  >
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                    <path d="M2 17L12 22L22 17" />
                    <path d="M2 12L12 17L22 12" />
                  </svg>
                </div>

                {/* Button text */}
                <span className="text-xs md:text-sm font-medium text-white relative z-10 whitespace-nowrap hidden sm:inline">Deploy with WICCHAIN</span>
                <span className="text-xs font-medium text-white relative z-10 sm:hidden">Deploy</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId;
});
