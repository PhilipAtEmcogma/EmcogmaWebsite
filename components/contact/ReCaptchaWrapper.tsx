'use client';

import ReCAPTCHA from 'react-google-recaptcha';
import { useRef, useEffect } from 'react';

interface ReCaptchaWrapperProps {
  onVerify: (token: string | null) => void;
  resetTrigger?: boolean;
}

export default function ReCaptchaWrapper({ onVerify, resetTrigger }: ReCaptchaWrapperProps) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // Reset reCAPTCHA when resetTrigger changes
  useEffect(() => {
    if (resetTrigger && recaptchaRef.current) {
      recaptchaRef.current.reset();
      onVerify(null);
    }
  }, [resetTrigger, onVerify]);

  const handleChange = (token: string | null) => {
    onVerify(token);
  };

  const handleExpired = () => {
    onVerify(null);
  };

  const handleError = () => {
    onVerify(null);
  };

  if (!siteKey) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg">
        <p className="text-red-400 text-sm">
          ⚠️ reCAPTCHA is not configured. Please add NEXT_PUBLIC_RECAPTCHA_SITE_KEY to your environment variables.
        </p>
        <p className="text-gray-400 text-xs mt-2">
          Get your keys from: <a href="https://www.google.com/recaptcha/admin" target="_blank" rel="noopener noreferrer" className="text-cyber-primary hover:underline">Google reCAPTCHA Admin</a>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-cyber-primary">
        Verification *
      </label>

      <div className="inline-block">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={siteKey}
          onChange={handleChange}
          onExpired={handleExpired}
          onErrored={handleError}
          theme="dark"
        />
      </div>

      <p className="text-xs text-gray-500">
        This site is protected by reCAPTCHA and the Google{' '}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyber-primary hover:underline"
        >
          Privacy Policy
        </a>{' '}
        and{' '}
        <a
          href="https://policies.google.com/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyber-primary hover:underline"
        >
          Terms of Service
        </a>{' '}
        apply.
      </p>
    </div>
  );
}
