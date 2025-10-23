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
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  AlertCircle, 
  Loader2, 
  Shield, 
  CheckCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { MFAVerification } from './mfa-verification';
import { SecurityStatus } from './security-status';
import { AuthErrorDisplay, InlineAuthError } from './auth-error-display';
import { AuthErrorHandler } from '@/lib/auth/auth-error-handler';

interface LoginFormProps {
  readonly onSuccess?: (user: any) => void;
  readonly redirectTo?: string;
}

export function EnhancedLoginForm({ onSuccess, redirectTo }: LoginFormProps) {
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
  const [securityFeatures, setSecurityFeatures] = useState({
    mfaEnabled: false,
    rateLimitActive: true,
    csrfProtection: true,
    sessionSecurity: true
  });

  const router = useRouter();

  // Initialize CSRF token and security features
  useEffect(() => {
    const initSecurity = async () => {
      try {
        // Get CSRF token
        const csrfResponse = await fetch('/api/auth/csrf-token', {
          method: 'GET',
          credentials: 'include'
        });
        if (csrfResponse.ok) {
          const csrfData = await csrfResponse.json();
          setCsrfToken(csrfData.token);
        }

        // Get security status
        const securityResponse = await fetch('/api/auth/security-status', {
          method: 'GET',
          credentials: 'include'
        });
        if (securityResponse.ok) {
          const securityData = await securityResponse.json();
          setSecurityFeatures(securityData);
        }
      } catch (error) {
        console.error('Failed to initialize security features:', error);
      }
    };
    initSecurity();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!csrfToken) {
      setError('Security token not loaded. Please refresh the page.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (result.mfaRequired) {
          setMfaRequired(true);
          setUserId(result.userId);
          setUserEmail(formData.email);
          toast.success('Please complete MFA verification');
        } else {
          toast.success('Login successful!');
          onSuccess?.(result.user);
          
          // Redirect based on user role
          const userRole = result.user?.role?.toLowerCase();
          let redirectPath = '/dashboard';
          
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
      console.error('Login error:', error);
      const authError = AuthErrorHandler.parseError(error);
      setError(authError.userMessage);
      
      // Show appropriate toast based on severity
      const severity = AuthErrorHandler.getSeverity(error);
      if (severity === 'critical' || severity === 'high') {
        toast.error(authError.userMessage, {
          duration: 10000,
          description: authError.action
        });
      } else {
        toast.error(authError.userMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(false);
  };

  const handleMFASuccess = (user: any) => {
    toast.success('MFA verification successful!');
    onSuccess?.(user);
    
    // Redirect based on user role
    const userRole = user?.role?.toLowerCase();
    let redirectPath = '/dashboard';
    
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
  };

  const handleBackToLogin = () => {
    setMfaRequired(false);
    setUserId(null);
    setUserEmail('');
    setError(null);
  };

  // Show MFA verification if required
  if (mfaRequired && userId) {
    return (
      <MFAVerification
        onSuccess={handleMFASuccess}
        onBack={handleBackToLogin}
        userId={userId}
        email={userEmail}
      />
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 text-center border-b border-slate-100">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Welcome Back</h1>
        <p className="text-sm text-slate-500">
          Sign in to your healthcare account
        </p>
      </div>

      {/* Login Form */}
      <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
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
                required
                disabled={loading}
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
                required
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-1/2 -translate-y-1/2 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
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
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, rememberMe: checked as boolean })
                }
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
            >
              Forgot password?
            </Button>
          </div>

          {error && (
            <AuthErrorDisplay
              error={error}
              onRetry={handleRetry}
              onDismiss={() => setError(null)}
              showDetails={true}
            />
          )}

          <Button 
            type="submit" 
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors" 
            disabled={loading || !csrfToken}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
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
