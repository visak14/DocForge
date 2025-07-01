'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const token = params.get('token');
  const router = useRouter();

  // Handle case where token is missing
  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Invalid Link</h2>
            <p className="text-red-600 mb-4">This password reset link is invalid or has expired.</p>
            <a href="/signin" className="text-blue-600 font-medium hover:underline">
              Back to Sign In
            </a>
          </div>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validate password length
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Password updated successfully! Redirecting...');
        setTimeout(() => router.push('/signin'), 2000);
      } else {
        setMessage(data.error || 'Invalid or expired token.');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Reset Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 text-sm text-center ${
            message.includes('successfully') ? 'text-green-600' : 'text-red-600'
          }`}>
            {message}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          <a href="/signin" className="text-blue-600 font-medium hover:underline">
            Back to Sign In
          </a>
        </div>
      </div>
    </main>
  );
}