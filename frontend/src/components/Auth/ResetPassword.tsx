import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth';
import { validateEmail } from '../../utils/validators';
import toast from 'react-hot-toast';

export const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({ email });
      setIsSubmitted(true);
      toast.success('Password reset link sent to your email');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
        <div className="w-full max-w-md card text-center">
          <div className="mb-4 text-4xl">✓</div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Check your email</h2>
          <p className="text-neutral-600 mb-6">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-neutral-500 mb-6">
            Click the link in the email to reset your password. If you don't see it, check your spam folder.
          </p>
          <Link to="/login" className="btn-primary w-full">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
      <div className="w-full max-w-md card">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">Reset Password</h1>
          <p className="text-neutral-600">Enter your email to receive a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-base"
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>

          {error && <p className="text-error text-sm">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-primary-600 hover:text-primary-700 text-sm">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};
