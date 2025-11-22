import { redirect } from 'next/navigation';
import { auth } from '@/app/auth/auth';

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect('/chat');
  }

  redirect('/chat');
}