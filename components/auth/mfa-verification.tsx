'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Smartphone, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface MFAVerificationProps {
  onSuccess: (user: any) => void;
  onBack: () => void;
  userId: string;
  email: string;
}

export function MFAVerification({ onSuccess, onBack, userId, email }: MFAVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [isUsingBackupCode, setIsUsingBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Timer for code expiration
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isUsingBackupCode]);

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify-mfa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          code: verificationCode,
          userId: userId
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('MFA verification successful!');
        onSuccess(data.user);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid verification code');
        setVerificationCode('');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyBackupCode = async () => {
    if (!backupCode || backupCode.length < 8) {
      setError('Please enter a valid backup code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify-mfa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          backupCode: backupCode,
          userId: userId
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Backup code verification successful!');
        onSuccess(data.user);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid backup code');
        setBackupCode('');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError(null);
    setTimeLeft(30);
    setCanResend(false);

    try {
      const response = await fetch('/api/auth/mfa/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        toast.success('New verification code sent!');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to resend code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleVerificationMethod = () => {
    setIsUsingBackupCode(!isUsingBackupCode);
    setVerificationCode('');
    setBackupCode('');
    setError(null);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            {isUsingBackupCode 
              ? 'Enter your backup code to continue'
              : 'Enter the 6-digit code from your authenticator app'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Info */}
          <div className="text-center">
            <Badge variant="outline" className="mb-2">
              {email}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {isUsingBackupCode 
                ? 'Using backup code for verification'
                : 'Using authenticator app for verification'
              }
            </p>
          </div>

          {/* Timer */}
          {!isUsingBackupCode && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Code expires in {timeLeft}s</span>
            </div>
          )}

          {/* Verification Input */}
          <div className="space-y-4">
            {isUsingBackupCode ? (
              <div>
                <Label htmlFor="backup-code">Backup Code</Label>
                <Input
                  ref={inputRef}
                  id="backup-code"
                  type="text"
                  placeholder="Enter backup code"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value)}
                  className="text-center font-mono"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter one of your saved backup codes
                </p>
              </div>
            ) : (
              <div>
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  ref={inputRef}
                  id="verification-code"
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={isUsingBackupCode ? handleVerifyBackupCode : handleVerifyCode}
              disabled={loading || (isUsingBackupCode ? !backupCode : verificationCode.length !== 6)}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify & Continue
                </>
              )}
            </Button>

            {/* Resend Code */}
            {!isUsingBackupCode && (
              <Button
                variant="outline"
                onClick={handleResendCode}
                disabled={!canResend || loading}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {canResend ? 'Resend Code' : `Resend in ${timeLeft}s`}
              </Button>
            )}

            {/* Toggle Method */}
            <Button
              variant="ghost"
              onClick={toggleVerificationMethod}
              className="w-full"
            >
              {isUsingBackupCode ? (
                <>
                  <Smartphone className="w-4 h-4 mr-2" />
                  Use Authenticator App Instead
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Use Backup Code Instead
                </>
              )}
            </Button>

            {/* Back Button */}
            <Button
              variant="outline"
              onClick={onBack}
              className="w-full"
            >
              Back to Login
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Having trouble? Contact support or use a backup code if you have one saved.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




