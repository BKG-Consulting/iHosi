'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2, Shield, Smartphone, Key, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/auth-provider';
import { MFAVerification } from './mfa-verification';
import { SecurityStatus } from './security-status';
import { AuthErrorHandler } from '@/lib/auth/auth-error-handler';

interface LoginFormProps {
  onSuccess?: (user: any) => void;
  redirectTo?: string;
}

export function LoginForm({ onSuccess, redirectTo }: LoginFormProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showSecurityStatus, setShowSecurityStatus] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  const { login, verifyMFA } = useAuth();

  // Initialize CSRF token
  useEffect(() => {
    const initCSRF = async () => {
      try {
        const response = await fetch('/api/auth/csrf-token', {
          method: 'GET',
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setCsrfToken(data.token);
        }
      } catch (error) {
        console.error('Failed to initialize CSRF token:', error);
      }
    };
    initCSRF();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      const redirectPath = redirectTo || getRedirectPath(user.role);
      router.replace(redirectPath);
    }
  }, [user, authLoading, router, redirectTo]);

  const getRedirectPath = (role: string): string => {
    switch (role.toLowerCase()) {
      case 'doctor':
        return '/doctor';
      case 'patient':
        return '/patient';
      case 'admin':
        return '/admin';
      case 'nurse':
        return '/nurse';
      case 'staff':
        return '/staff';
      default:
        return '/dashboard';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (loading) return;
    
    setError(null);
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        if (result.mfaRequired) {
          setMfaRequired(true);
          setUserId(result.userId!);
          setUserEmail(formData.email);
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
        const authError = AuthErrorHandler.parseError(result.error || result);
        setError(authError.userMessage);
        
        // Show appropriate toast based on severity
        const severity = AuthErrorHandler.getSeverity(result.error || result);
        if (severity === 'critical' || severity === 'high') {
          toast.error(authError.userMessage, {
            duration: 10000,
            description: authError.action
          });
        } else {
          toast.error(authError.userMessage);
        }
      }
    } catch (error) {
      const authError = AuthErrorHandler.parseError(error);
      setError(authError.userMessage);
      toast.error(authError.userMessage, {
        description: authError.action
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async (code: string) => {
    if (!userId || loading) return;

    setError(null);
    setLoading(true);

    try {
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
        const authError = AuthErrorHandler.parseError(result.error || result);
        setError(authError.userMessage);
        toast.error(authError.userMessage, {
          description: authError.action
        });
      }
    } catch (error) {
      const authError = AuthErrorHandler.parseError(error);
      setError(authError.userMessage);
      toast.error(authError.userMessage, {
        description: authError.action
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-2 text-sm text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  if (mfaRequired) {
    return <MFAForm userId={userId!} onVerify={handleMfaVerify} loading={loading} error={error} />;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 text-center border-b border-slate-100">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Welcome Back</h1>
        <p className="text-sm text-slate-500">
          Sign in to your account
        </p>
      </div>

      {/* Form */}
      <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10 h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10 pr-10 h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                disabled={loading}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-0 top-1/2 -translate-y-1/2 h-full px-3 hover:bg-transparent"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-slate-400" />
                ) : (
                  <Eye className="h-4 w-4 text-slate-400" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: !!checked })}
                disabled={loading}
              />
              <Label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">
                Remember me
              </Label>
            </div>
            <Button
              variant="link"
              className="px-0 text-sm text-blue-600 hover:text-blue-700"
              type="button"
              disabled={loading}
            >
              Forgot password?
            </Button>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Secure connection indicator */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <Shield className="w-3.5 h-3.5 text-green-600" />
            <span>Secure encrypted connection</span>
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
    <div className="w-full">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 text-center border-b border-slate-100">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">MFA Verification</h1>
        <p className="text-sm text-slate-500">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      {/* Form */}
      <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="mfa-code" className="text-sm font-medium text-slate-700">
              Verification Code
            </Label>
            <Input
              id="mfa-code"
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="h-12 text-center text-2xl font-mono tracking-widest border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              disabled={loading}
              maxLength={6}
              required
              autoFocus
            />
            <p className="text-xs text-slate-500 text-center mt-2">
              Open your authenticator app to get the code
            </p>
          </div>

          <Button
            type="submit"
            disabled={code.length !== 6 || loading}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </Button>
        </form>

        {/* Secure connection indicator */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <Shield className="w-3.5 h-3.5 text-green-600" />
            <span>Secure encrypted connection</span>
          </div>
        </div>
      </div>
    </div>
  );
}
