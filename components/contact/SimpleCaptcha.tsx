'use client';

import { useState, useEffect } from 'react';

interface SimpleCaptchaProps {
  onVerify: (verified: boolean) => void;
  resetTrigger?: boolean;
}

export default function SimpleCaptcha({ onVerify, resetTrigger }: SimpleCaptchaProps) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(false);

  // Generate new captcha numbers
  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    setNum1(n1);
    setNum2(n2);
    setUserAnswer('');
    setIsVerified(false);
    setError(false);
    onVerify(false);
  };

  // Initialize captcha on mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  // Reset captcha when resetTrigger changes
  useEffect(() => {
    if (resetTrigger) {
      generateCaptcha();
    }
  }, [resetTrigger]);

  const handleVerify = () => {
    const correctAnswer = num1 + num2;
    const answer = parseInt(userAnswer);

    if (answer === correctAnswer) {
      setIsVerified(true);
      setError(false);
      onVerify(true);
    } else {
      setError(true);
      setIsVerified(false);
      onVerify(false);
      // Generate new captcha on wrong answer
      setTimeout(() => {
        generateCaptcha();
      }, 1500);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserAnswer(e.target.value);
    setError(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && userAnswer) {
      e.preventDefault();
      handleVerify();
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-cyber-primary">
        Verification *
      </label>

      <div className={`p-4 border rounded-lg transition-colors ${
        isVerified
          ? 'bg-cyber-accent/10 border-cyber-accent'
          : error
          ? 'bg-red-500/10 border-red-500'
          : 'bg-cyber-darker border-gray-700'
      }`}>
        <div className="flex items-center gap-4 flex-wrap">
          {/* Captcha Challenge */}
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold neon-text select-none">
              {num1} + {num2} =
            </div>

            <input
              type="number"
              value={userAnswer}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isVerified}
              className="w-20 px-3 py-2 bg-cyber-darker border border-gray-600 rounded text-center font-bold text-lg focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="?"
            />
          </div>

          {/* Verify Button */}
          {!isVerified && (
            <button
              type="button"
              onClick={handleVerify}
              disabled={!userAnswer}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                userAnswer
                  ? 'bg-cyber-primary/20 text-cyber-primary hover:bg-cyber-primary/30 border border-cyber-primary'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
              }`}
            >
              Verify
            </button>
          )}

          {/* Status Icons */}
          {isVerified && (
            <div className="flex items-center gap-2 text-cyber-accent">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Verified!</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-400">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Incorrect, try again</span>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        {!isVerified && (
          <button
            type="button"
            onClick={generateCaptcha}
            className="mt-3 text-sm text-gray-400 hover:text-cyber-primary transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Generate new question
          </button>
        )}
      </div>
    </div>
  );
}
