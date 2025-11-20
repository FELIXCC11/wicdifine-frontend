'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/toast';

export default function SecurityPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push('/auth/login');
    }
  }, [session, router]);

  const handleSetup2FA = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setQrCode(data.qrCode);
        setSecret(data.secret);
      } else {
        toast({
          type: 'error',
          description: data.error || 'Failed to setup 2FA',
        });
      }
    } catch (error) {
      toast({
        type: 'error',
        description: 'Failed to setup 2FA',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setBackupCodes(data.backupCodes);
        setShowBackupCodes(true);
        setIs2FAEnabled(true);
        setQrCode('');
        toast({
          type: 'success',
          description: '2FA enabled successfully!',
        });
      } else {
        toast({
          type: 'error',
          description: data.error || 'Invalid verification code',
        });
      }
    } catch (error) {
      toast({
        type: 'error',
        description: 'Failed to verify 2FA',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable 2FA?')) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
      });

      if (response.ok) {
        setIs2FAEnabled(false);
        toast({
          type: 'success',
          description: '2FA disabled successfully',
        });
      } else {
        toast({
          type: 'error',
          description: 'Failed to disable 2FA',
        });
      }
    } catch (error) {
      toast({
        type: 'error',
        description: 'Failed to disable 2FA',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Security Settings</h1>

        <div className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Two-Factor Authentication</h2>
          <p className="text-gray-400 mb-6">
            Add an extra layer of security to your account using an authenticator app.
          </p>

          {!is2FAEnabled && !qrCode && (
            <button
              onClick={handleSetup2FA}
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Setting up...' : 'Enable 2FA'}
            </button>
          )}

          {qrCode && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg inline-block">
                <img src={qrCode} alt="2FA QR Code" className="w-64 h-64" />
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">
                  Or enter this code manually in your authenticator app:
                </p>
                <code className="bg-gray-900 px-4 py-2 rounded text-green-400 block break-all">
                  {secret}
                </code>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-500"
                  maxLength={6}
                />
              </div>

              <button
                onClick={handleVerify2FA}
                disabled={isLoading || verificationCode.length !== 6}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify and Enable'}
              </button>
            </div>
          )}

          {showBackupCodes && (
            <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-yellow-400">
                Save Your Backup Codes
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                Store these codes safely. Each code can only be used once to access your account if you lose your authenticator device.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {backupCodes.map((code, index) => (
                  <code key={index} className="bg-gray-900 px-3 py-2 rounded text-green-400 text-sm">
                    {code}
                  </code>
                ))}
              </div>
              <button
                onClick={() => setShowBackupCodes(false)}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm"
              >
                I've saved my codes
              </button>
            </div>
          )}

          {is2FAEnabled && !showBackupCodes && (
            <div className="flex items-center justify-between bg-green-900/20 border border-green-700/50 rounded-lg p-4">
              <div>
                <p className="font-medium text-green-400">2FA is enabled</p>
                <p className="text-sm text-gray-400">Your account is protected</p>
              </div>
              <button
                onClick={handleDisable2FA}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm disabled:opacity-50"
              >
                Disable 2FA
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
