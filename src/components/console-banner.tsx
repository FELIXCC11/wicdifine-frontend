'use client';

import { useEffect } from 'react';

export function ConsoleBanner() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (process.env.NODE_ENV === 'production') {
        console.clear();
        console.log('WELCOME TO WICDEFIN');
      } else {
        console.log('%cWELCOME TO WICDEFIN', 'font-size: 24px; font-weight: bold; color: #10b981;');
        console.log('%cDevelopment Mode', 'font-size: 12px; color: #6b7280;');
      }
    }
  }, []);

  return null;
}
