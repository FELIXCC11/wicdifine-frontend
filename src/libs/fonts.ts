// src/libs/fonts.ts
import localFont from 'next/font/local';

// Use local font files instead of Google Fonts
export const inter = localFont({
  src: [
    {
      path: '../../public/fonts/Inter-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Inter-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Inter-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Inter-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Inter-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/fonts/Inter-MediumItalic.woff2',
      weight: '500',
      style: 'italic',
    }
  ],
  variable: '--font-inter',
  display: 'swap',
});

export const jetbrainsMono = localFont({
  src: [
    {
      path: '../../public/fonts/JetBrainsMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/JetBrainsMono-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/JetBrainsMono-Bold.woff2',
      weight: '700',
      style: 'normal',
    }
  ],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});