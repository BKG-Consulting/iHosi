'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/auth-provider';

interface LoginFormProps {
  onSuccess?: (user: any) => void;
  redirectTo?: string;
}

export function LoginForm({ onSuccess, redirectTo }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const router = useRouter();
  const { login, verifyMFA } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      if (result.mfaRequired) {
        setMfaRequired(true);
        setUserId(result.userId!);
        toast.success('Please complete MFA verification');
      } else {
        toast.success('Login successful!');
        onSuccess?.(result.user);
        
        // Redirect based on user role
        const userRole = result.user?.role?.toLowerCase();
        let redirectPath = '/dashboard'; // Default fallback
        
        switch (userRole) {
          case 'admin':
            redirectPath = '/admin';
            break;
          case 'doctor':
            redirectPath = '/doctor';
            break;
          case 'nurse':
          case 'lab_technician':
          case 'cashier':
          case 'admin_assistant':
            redirectPath = '/staff';
            break;
          case 'patient':
            redirectPath = '/patient';
            break;
          default:
            redirectPath = redirectTo || '/dashboard';
        }
        
        router.push(redirectPath);
      }
    } else {
      setError(result.error || 'Login failed');
      toast.error(result.error || 'Login failed');
    }
  };

  const handleMfaVerify = async (code: string) => {
    if (!userId) return;

    setError(null);

    const result = await verifyMFA(userId, code);

    if (result.success) {
      toast.success('MFA verification successful!');
      onSuccess?.(result.user);
      
      // Redirect based on user role
      const userRole = result.user?.role?.toLowerCase();
      let redirectPath = '/dashboard'; // Default fallback
      
      switch (userRole) {
        case 'admin':
          redirectPath = '/admin';
          break;
        case 'doctor':
          redirectPath = '/doctor';
          break;
        case 'nurse':
        case 'lab_technician':
        case 'cashier':
        case 'admin_assistant':
          redirectPath = '/staff';
          break;
        case 'patient':
          redirectPath = '/patient';
          break;
        default:
          redirectPath = redirectTo || '/dashboard';
      }
      
      router.push(redirectPath);
    } else {
      setError(result.error || 'MFA verification failed');
      toast.error(result.error || 'MFA verification failed');
    }
  };

  if (mfaRequired) {
    return <MFAForm userId={userId!} onVerify={handleMfaVerify} loading={false} error={error} />;
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
            <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-white/90 text-center">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-[#3E4C4B]">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5AC5C8] w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 h-12 border-2 border-[#D1F1F2] rounded-xl focus:border-[#2EB6B0] focus:ring-2 focus:ring-[#2EB6B0]/20 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-[#3E4C4B]">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5AC5C8] w-5 h-5" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
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
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: !!checked })}
                    className="border-[#D1F1F2] data-[state=checked]:bg-[#2EB6B0] data-[state=checked]:border-[#2EB6B0]"
                  />
                  <Label htmlFor="remember" className="text-sm text-[#3E4C4B]">
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  className="text-sm text-[#2EB6B0] hover:text-[#046658] font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#034a4a] hover:to-[#259a9a] text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#3E4C4B]">
                Don't have an account?{' '}
                <button className="text-[#2EB6B0] hover:text-[#046658] font-medium transition-colors">
                  Contact administrator
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-[#D1F1F2]">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-[#2EB6B0] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lock className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#046658] mb-1">Secure Authentication</p>
              <p className="text-xs text-[#3E4C4B]">
                Your login is protected by enterprise-grade security measures including multi-factor authentication and encrypted data transmission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// MFA Form Component
interface MFAFormProps {
  userId: string;
  onVerify: (code: string) => void;
  loading: boolean;
  error: string | null;
}

function MFAForm({ userId, onVerify, loading, error }: MFAFormProps) {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      onVerify(code);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#5AC5C8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl bg-white/90 backdrop-blur-sm border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white p-8">
            <CardTitle className="text-2xl font-bold text-center">MFA Verification</CardTitle>
            <CardDescription className="text-white/90 text-center">
              Enter the 6-digit code from your authenticator app
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <Label htmlFor="mfa-code" className="text-sm font-semibold text-[#3E4C4B]">
                  Verification Code
                </Label>
                <Input
                  id="mfa-code"
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="h-12 text-center text-2xl font-mono border-2 border-[#D1F1F2] rounded-xl focus:border-[#2EB6B0] focus:ring-2 focus:ring-[#2EB6B0]/20 transition-all duration-200"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-[#3E4C4B] text-center">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <Button
                type="submit"
                disabled={code.length !== 6}
                className="w-full h-12 bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#034a4a] hover:to-[#259a9a] text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Verify Code
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
