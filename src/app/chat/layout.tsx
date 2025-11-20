import { cookies } from 'next/headers';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '../auth/auth';
import type { Metadata } from 'next';

const BUILD_TIMESTAMP = Date.now(); // Use a dynamic timestamp or a build hash

export const metadata: Metadata = {
  openGraph: {
    images: [
      {
        url: `/chat/opengraph-image.png?v=${BUILD_TIMESTAMP}`, // Cache-busting for OpenGraph image
        width: 1200,
        height: 630,
        alt: 'WICFIN Chat Interface',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: `/chat/twitter-image.png?v=${BUILD_TIMESTAMP}`, // Cache-busting for Twitter image
        width: 1200,
        height: 675,
        alt: 'WICFIN Chat Preview',
      },
    ],
  },
};

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';

  return (
    <SidebarProvider defaultOpen={!isCollapsed}>
      <AppSidebar user={session?.user} />
      <SidebarInset className="relative h-screen overflow-hidden">
        <div className="flex flex-col h-full">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}