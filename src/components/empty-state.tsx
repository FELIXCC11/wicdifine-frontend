'use client';

import { useSession } from 'next-auth/react';

export function EmptyState() {
  const { data: session } = useSession();
  const name = session?.user?.name || 'there';

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-6 md:py-8">
      {/* WICFIN Logo */}
      <div className="mb-6 md:mb-8">
        <img
          src="/WICFINLOGO.svg"
          alt="WICFIN"
          className="w-24 h-24 md:w-32 md:h-32 object-contain"
        />
      </div>

      {/* Greeting */}
      <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2 md:mb-3 text-center">
        {getGreeting()}, {name}.
      </h1>
      <p className="text-base md:text-lg text-gray-400 mb-8 md:mb-12 text-center">
        Can I help you with anything?
      </p>
    </div>
  );
}
