import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth/auth';
import speakeasy from 'speakeasy';
import { db } from '@/libs/db/queries';
import { users } from '@/libs/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// Generate backup codes
function generateBackupCodes(count = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
  }
  return codes;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    // Get user's secret
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA not setup' },
        { status: 400 }
      );
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2, // Allow 2 time steps before/after
    });

    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes();

    // Enable 2FA
    await db
      .update(users)
      .set({
        twoFactorEnabled: true,
        backupCodes: backupCodes,
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      success: true,
      backupCodes: backupCodes,
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify 2FA' },
      { status: 500 }
    );
  }
}
