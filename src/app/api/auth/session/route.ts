import { auth } from '@/app/auth/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; 
export async function GET() {
  try {
    const session = await auth();
    return NextResponse.json(session || {});
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({}, { status: 500 });
  }
}