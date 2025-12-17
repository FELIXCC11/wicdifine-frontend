import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth/auth';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { db } from '@/libs/db/queries';
import { users } from '@/libs/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `WICFIN (${session.user.email})`,
      issuer: 'WICFIN',
      length: 32,
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Store the secret temporarily (not enabled yet)
    await db
      .update(users)
      .set({ twoFactorSecret: secret.base32 })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup 2FA' },
      { status: 500 }
    );
  }
}
