'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, Mail, ArrowLeft, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PasswordResetFormProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

export function PasswordResetForm({ onBack, onSuccess }: PasswordResetFormProps) {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [formData, setFormData] = useState({
    email: '',
    token: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        toast.success('Password reset email sent!');
      } else {
        setError(data.error || 'Failed to send reset email');
        toast.error(data.error || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      setError('An error occurred while sending reset email');
      toast.error('An error occurred while sending reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 12) {
      setError('Password must be at least 12 characters long');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: formData.token,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        toast.success('Password reset successfully!');
        onSuccess?.();
      } else {
        setError(data.error || 'Failed to reset password');
        toast.error(data.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('An error occurred while resetting password');
      toast.error('An error occurred while resetting password');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    return strength;
  };

  const strength = passwordStrength(formData.password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  if (success && step === 'request') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#5AC5C8] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl bg-white/90 backdrop-blur-sm border-0 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white p-8">
              <CardTitle className="text-2xl font-bold text-center">Check Your Email</CardTitle>
              <CardDescription className="text-white/90 text-center">
                We've sent you a password reset link
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-[#3E4C4B] mb-6">
                We've sent a password reset link to <strong>{formData.email}</strong>. 
                Please check your email and click the link to reset your password.
              </p>
              <Button
                onClick={() => {
                  setStep('request');
                  setSuccess(false);
                  setFormData({ ...formData, email: '' });
                }}
                variant="outline"
                className="w-full h-12 border-2 border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2] rounded-xl"
              >
                Send Another Email
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#5AC5C8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#046658] to-[#2EB6B0] rounded-2xl mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#046658] mb-2">Ihosi</h1>
          <p className="text-[#3E4C4B] text-sm">Healthcare Management System</p>
        </div>

        <Card className="shadow-2xl bg-white/90 backdrop-blur-sm border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white p-8">
            <CardTitle className="text-2xl font-bold text-center">
              {step === 'request' ? 'Reset Password' : 'Set New Password'}
            </CardTitle>
            <CardDescription className="text-white/90 text-center">
              {step === 'request' 
                ? 'Enter your email to receive a reset link'
                : 'Enter your new password'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            {step === 'request' ? (
              <form onSubmit={handleRequestReset} className="space-y-6">
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-[#3E4C4B]">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5AC5C8] w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 h-12 border-2 border-[#D1F1F2] rounded-xl focus:border-[#2EB6B0] focus:ring-2 focus:ring-[#2EB6B0]/20 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#034a4a] hover:to-[#259a9a] text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Reset Link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>

                {onBack && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="w-full h-12 border-2 border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2] rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Button>
                )}
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="token" className="text-sm font-semibold text-[#3E4C4B]">
                    Reset Token
                  </Label>
                  <Input
                    id="token"
                    type="text"
                    placeholder="Enter the token from your email"
                    value={formData.token}
                    onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                    className="h-12 border-2 border-[#D1F1F2] rounded-xl focus:border-[#2EB6B0] focus:ring-2 focus:ring-[#2EB6B0]/20 transition-all duration-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-[#3E4C4B]">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5AC5C8] w-5 h-5" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your new password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10 h-12 border-2 border-[#D1F1F2] rounded-xl focus:border-[#2EB6B0] focus:ring-2 focus:ring-[#2EB6B0]/20 transition-all duration-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#5AC5C8] hover:text-[#2EB6B0] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 flex-1 rounded-full ${
                              i < strength ? strengthColors[strength - 1] : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-[#3E4C4B]">
                        Password strength: {strengthLabels[strength - 1] || 'Very Weak'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-[#3E4C4B]">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5AC5C8] w-5 h-5" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your new password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-10 pr-10 h-12 border-2 border-[#D1F1F2] rounded-xl focus:border-[#2EB6B0] focus:ring-2 focus:ring-[#2EB6B0]/20 transition-all duration-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#5AC5C8] hover:text-[#2EB6B0] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Passwords match</span>
                    </div>
                  )}
                </div>

                {/* Password Requirements */}
                <div className="p-4 bg-[#D1F1F2] rounded-xl">
                  <h4 className="text-sm font-semibold text-[#046658] mb-2">Password Requirements:</h4>
                  <ul className="text-xs text-[#3E4C4B] space-y-1">
                    <li>• At least 12 characters long</li>
                    <li>• Contains uppercase and lowercase letters</li>
                    <li>• Contains numbers and special characters</li>
                    <li>• Not easily guessable</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  disabled={loading || strength < 4 || formData.password !== formData.confirmPassword}
                  className="w-full h-12 bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#034a4a] hover:to-[#259a9a] text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-[#D1F1F2]">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-[#2EB6B0] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lock className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#046658] mb-1">Secure Password Reset</p>
              <p className="text-xs text-[#3E4C4B]">
                Your password reset is protected by enterprise-grade security measures. The reset link will expire in 1 hour for your security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
