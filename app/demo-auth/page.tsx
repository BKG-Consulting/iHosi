'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Lock, 
  Smartphone, 
  Key, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Play
} from 'lucide-react';
import { EnhancedLoginForm } from '@/components/auth/enhanced-login-form';
import { EnhancedSignupForm } from '@/components/auth/enhanced-signup-form';
import { MFAVerification } from '@/components/auth/mfa-verification';
import { SecurityStatus } from '@/components/auth/security-status';
import { MFASetup } from '@/components/auth/mfa-setup';
import Link from 'next/link';

export default function DemoAuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [showSecurityDemo, setShowSecurityDemo] = useState(false);
  const [demoUser, setDemoUser] = useState<any>(null);

  const securityFeatures = [
    {
      icon: Shield,
      title: 'Multi-Factor Authentication',
      description: 'TOTP-based 2FA with backup codes',
      status: 'Active',
      color: 'text-green-600'
    },
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'AES-256-GCM for all sensitive data',
      status: 'Active',
      color: 'text-green-600'
    },
    {
      icon: Smartphone,
      title: 'Session Security',
      description: 'JWT with rotation and binding',
      status: 'Active',
      color: 'text-green-600'
    },
    {
      icon: Key,
      title: 'CSRF Protection',
      description: 'Double-submit cookie pattern',
      status: 'Active',
      color: 'text-green-600'
    },
    {
      icon: Eye,
      title: 'Audit Logging',
      description: 'Comprehensive activity tracking',
      status: 'Active',
      color: 'text-green-600'
    },
    {
      icon: AlertTriangle,
      title: 'Rate Limiting',
      description: 'Redis-based protection',
      status: 'Active',
      color: 'text-green-600'
    }
  ];

  const handleLoginSuccess = (user: any) => {
    setDemoUser(user);
    setShowSecurityDemo(true);
  };

  const handleSignupSuccess = (user: any) => {
    setDemoUser(user);
    setShowSecurityDemo(true);
  };

  const handleMFASetupComplete = (backupCodes: string[]) => {
    setShowMfaSetup(false);
    setShowSecurityDemo(true);
    console.log('MFA setup completed with backup codes:', backupCodes);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Shield className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-3xl font-bold">Enhanced Authentication Demo</h1>
                  <p className="text-muted-foreground">
                    Experience our comprehensive security features
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Live Demo
              </Badge>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Authentication Forms */}
            <div className="lg:col-span-2">
              {showMfaSetup ? (
                <MFASetup
                  onComplete={handleMFASetupComplete}
                  onCancel={() => setShowMfaSetup(false)}
                />
              ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="mt-6">
                    <EnhancedLoginForm 
                      onSuccess={handleLoginSuccess}
                    />
                  </TabsContent>
                  
                  <TabsContent value="signup" className="mt-6">
                    <EnhancedSignupForm 
                      onSuccess={handleSignupSuccess}
                    />
                  </TabsContent>
                </Tabs>
              )}
            </div>

            {/* Security Features Panel */}
            <div className="space-y-6">
              {/* Security Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Security Features
                  </CardTitle>
                  <CardDescription>
                    All security measures are active and protecting your data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {securityFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <feature.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{feature.title}</h4>
                            <Badge variant="default" className="text-xs">
                              {feature.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Demo Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Demo Actions</CardTitle>
                  <CardDescription>
                    Try out our security features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => setShowMfaSetup(true)}
                    >
                      <span>Setup MFA</span>
                      <Play className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => setShowSecurityDemo(!showSecurityDemo)}
                    >
                      <span>Security Status</span>
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Security Status Demo */}
              {showSecurityDemo && (
                <SecurityStatus
                  userId={demoUser?.id || 'demo-user'}
                  onMFASetup={() => setShowMfaSetup(true)}
                />
              )}

              {/* Test Credentials */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Test Credentials</CardTitle>
                  <CardDescription>
                    Use these credentials to test the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="font-medium">Doctor Account</div>
                      <div className="text-muted-foreground">doctor@test.com</div>
                      <div className="text-muted-foreground">Doctor123!</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="font-medium">Admin Account</div>
                      <div className="text-muted-foreground">admin@test.com</div>
                      <div className="text-muted-foreground">Admin123!</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="font-medium">Patient Account</div>
                      <div className="text-muted-foreground">patient@test.com</div>
                      <div className="text-muted-foreground">Patient123!</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>
              This is a demonstration of our enhanced authentication system with enterprise-grade security features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}




