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
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Security Features Badge */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-sm">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-primary font-medium">Enhanced Security</span>
        </div>
      </div>

      {/* Main Login Card */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your healthcare account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Security Indicators */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-3 h-3" />
              <span>CSRF Protected</span>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-3 h-3" />
              <span>Rate Limited</span>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-3 h-3" />
              <span>Encrypted</span>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-3 h-3" />
              <span>Audit Logged</span>
            </div>
          </div>

          <Separator />

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
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
                />
                <Label htmlFor="remember" className="text-sm">
                  Remember me
                </Label>
              </div>
              <Button variant="link" className="px-0 text-sm">
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
              className="w-full" 
              disabled={loading || !csrfToken}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Sign In Securely
                </>
              )}
            </Button>
          </form>

          <Separator />

          {/* Security Status Toggle */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSecurityStatus(!showSecurityStatus)}
              className="text-muted-foreground"
            >
              <Info className="w-4 h-4 mr-1" />
              {showSecurityStatus ? 'Hide' : 'Show'} Security Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Status */}
      {showSecurityStatus && (
        <SecurityStatus
          userId={formData.email}
          onMFASetup={() => {
            // This would open MFA setup modal
            toast.info('MFA setup would be initiated here');
          }}
        />
      )}

      {/* Security Features Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Security Features Active
            </h4>
            <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Multi-Factor Authentication</span>
                <Badge variant={securityFeatures.mfaEnabled ? "default" : "secondary"}>
                  {securityFeatures.mfaEnabled ? 'Enabled' : 'Optional'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Rate Limiting</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>CSRF Protection</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Session Security</span>
                <Badge variant="default">Active</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
