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
        setError(result.error || 'Login failed');
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
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
        setError(result.error || 'MFA verification failed');
        toast.error(result.error || 'MFA verification failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
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
    <div className="space-y-8 relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
          <div className="flex items-center space-x-2 text-blue-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">Signing in...</span>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</h1>
        <p className="text-slate-600">Sign in to your account</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10 h-12 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10 pr-10 h-12 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={loading}
              className="border-slate-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Label htmlFor="remember" className="text-sm text-slate-600">
              Remember me
            </Label>
          </div>
          <button
            type="button"
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
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

      <div className="text-center">
        <p className="text-sm text-slate-600">
          Don't have an account?{' '}
          <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
            Contact administrator
          </button>
        </p>
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
    <div className="space-y-8 relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
          <div className="flex items-center space-x-2 text-blue-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">Verifying...</span>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">MFA Verification</h1>
        <p className="text-slate-600">Enter the 6-digit code from your authenticator app</p>
      </div>

      {/* Form */}
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
          <Label htmlFor="mfa-code" className="text-sm font-medium text-slate-700">
            Verification Code
          </Label>
          <Input
            id="mfa-code"
            type="text"
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="h-12 text-center text-2xl font-mono border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
            maxLength={6}
            required
          />
          <p className="text-xs text-slate-500 text-center">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <Button
          type="submit"
          disabled={code.length !== 6 || loading}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 shadow-lg"
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
    </div>
  );
}
