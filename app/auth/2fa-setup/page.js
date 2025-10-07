'use client';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function TwoFactorSetup() {
  const { data: session } = useSession();
  const [step, setStep] = useState(1); // 1: choose method, 2: setup TOTP, 3: setup magic link
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const handleTOTPSetup = async () => {
    try {
      const response = await fetch('/api/auth/2fa/totp-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep(2);
    } catch (error) {
      // console.error('Error setting up TOTP:', error);
    }
  };

  const handleMagicLinkSetup = async () => {
    try {
      await fetch('/api/auth/2fa/magic-link-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      setStep(3);
    } catch (error) {
      // console.error('Error setting up magic link:', error);
    }
  };

  const verifyTOTPCode = async () => {
    try {
      const response = await fetch('/api/auth/2fa/verify-totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode })
      });
      if (response.ok) {
        setIsVerified(true);
      }
    } catch (error) {
      // console.error('Error verifying TOTP:', error);
    }
  };

  if (step === 1) {
    return (
      <main className='max-w-md mx-auto mt-10 space-y-6'>
        <h1 className='text-2xl font-bold text-center'>
          Two-Factor Authentication Setup
        </h1>
        <div className='space-y-4'>
          <div className='border border-black/10 rounded-lg p-6'>
            <h3 className='font-semibold mb-2'>
              Authenticator App (Recommended)
            </h3>
            <p className='text-sm text-black/60 mb-4'>
              Use Google Authenticator, Authy, or similar app to generate
              6-digit codes
            </p>
            <button
              onClick={handleTOTPSetup}
              className='w-full h-10 px-4 rounded-lg bg-blue-600 text-white'
            >
              Setup with Authenticator App
            </button>
          </div>

          <div className='border border-black/10 rounded-lg p-6'>
            <h3 className='font-semibold mb-2'>Magic Link</h3>
            <p className='text-sm text-black/60 mb-4'>
              Receive secure login links via email
            </p>
            <button
              onClick={handleMagicLinkSetup}
              className='w-full h-10 px-4 rounded-lg bg-green-600 text-white'
            >
              Setup Magic Link
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (step === 2) {
    return (
      <main className='max-w-md mx-auto mt-10 space-y-6'>
        <h1 className='text-2xl font-bold text-center'>
          Setup Authenticator App
        </h1>
        <div className='space-y-4'>
          <div className='text-center'>
            <div className='bg-white p-4 rounded-lg border border-black/10 inline-block'>
              {qrCode && (
                <img src={qrCode} alt='QR Code' className='w-48 h-48' />
              )}
            </div>
            <p className='text-sm text-black/60 mt-2'>
              Scan this QR code with your authenticator app
            </p>
          </div>

          <div className='space-y-2'>
            <label className='block text-sm font-medium'>
              Enter 6-digit code from your app:
            </label>
            <input
              type='text'
              value={verificationCode}
              onChange={e => setVerificationCode(e.target.value)}
              placeholder='123456'
              className='w-full h-10 px-3 rounded-lg border border-black/15 text-center text-lg tracking-widest'
              maxLength={6}
            />
            <button
              onClick={verifyTOTPCode}
              disabled={verificationCode.length !== 6}
              className='w-full h-10 px-4 rounded-lg bg-blue-600 text-white disabled:opacity-50'
            >
              Verify & Enable 2FA
            </button>
          </div>

          {isVerified && (
            <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
              <p className='text-green-800 text-sm'>
                ✅ Two-factor authentication is now enabled!
              </p>
            </div>
          )}
        </div>
      </main>
    );
  }

  if (step === 3) {
    return (
      <main className='max-w-md mx-auto mt-10 space-y-6'>
        <h1 className='text-2xl font-bold text-center'>Magic Link Setup</h1>
        <div className='bg-green-50 border border-green-200 rounded-lg p-6'>
          <h3 className='font-semibold text-green-800 mb-2'>
            ✅ Magic Link Enabled
          </h3>
          <p className='text-green-700 text-sm'>
            You can now sign in using secure links sent to your email address.
            Check your email for a verification link to complete the setup.
          </p>
        </div>
        <a
          href='/dashboard'
          className='block w-full h-10 px-4 rounded-lg bg-black text-white text-center leading-10'
        >
          Continue to Dashboard
        </a>
      </main>
    );
  }
}
