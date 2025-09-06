'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');

      if (!token || !type) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, type }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage(data.message);
          setEmail(data.email);
          toast.success('Email verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed');
          toast.error(data.error || 'Verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification');
        toast.error('An error occurred during verification');
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleResendEmail = async () => {
    if (!email) return;

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          type: 'REGISTRATION' 
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Verification email sent!');
      } else {
        toast.error(data.error || 'Failed to send verification email');
      }
    } catch (error) {
      console.error('Resend email error:', error);
      toast.error('Failed to send verification email');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#5AC5C8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#046658] to-[#2EB6B0] rounded-2xl mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#046658] mb-2">Ihosi</h1>
          <p className="text-[#3E4C4B] text-sm">Healthcare Management System</p>
        </div>

        <Card className="shadow-2xl bg-white/90 backdrop-blur-sm border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white p-8">
            <CardTitle className="text-2xl font-bold text-center">Email Verification</CardTitle>
            <CardDescription className="text-white/90 text-center">
              {status === 'loading' && 'Verifying your email address...'}
              {status === 'success' && 'Email verification complete'}
              {status === 'error' && 'Verification failed'}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            {status === 'loading' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-[#D1F1F2] rounded-full flex items-center justify-center mx-auto">
                  <Loader2 className="w-8 h-8 text-[#2EB6B0] animate-spin" />
                </div>
                <p className="text-[#3E4C4B]">Please wait while we verify your email address...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#046658] mb-2">Email Verified!</h3>
                  <p className="text-[#3E4C4B] mb-4">{message}</p>
                  {email && (
                    <p className="text-sm text-[#3E4C4B]">
                      Verified email: <span className="font-medium">{email}</span>
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => router.push('/sign-in')}
                  className="w-full bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#034a4a] hover:to-[#259a9a]"
                >
                  Continue to Sign In
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#046658] mb-2">Verification Failed</h3>
                  <p className="text-[#3E4C4B] mb-4">{message}</p>
                </div>
                
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertDescription className="text-orange-800">
                    <strong>Common issues:</strong>
                    <ul className="mt-2 text-sm space-y-1">
                      <li>• Verification link has expired</li>
                      <li>• Link has already been used</li>
                      <li>• Invalid or corrupted link</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  {email && (
                    <Button
                      onClick={handleResendEmail}
                      variant="outline"
                      className="w-full border-2 border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2]"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Resend Verification Email
                    </Button>
                  )}
                  <Button
                    onClick={() => router.push('/sign-in')}
                    variant="outline"
                    className="w-full border-2 border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2]"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-[#D1F1F2]">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-[#2EB6B0] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#046658] mb-1">Email Verification</p>
              <p className="text-xs text-[#3E4C4B]">
                Email verification ensures the security of your account and helps us maintain HIPAA compliance standards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
