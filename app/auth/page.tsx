'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Lock, 
  Smartphone, 
  Key, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowRight
} from 'lucide-react';
import { EnhancedLoginForm } from '@/components/auth/enhanced-login-form';
import { EnhancedSignupForm } from '@/components/auth/enhanced-signup-form';
import { MFAVerification } from '@/components/auth/mfa-verification';
import { SecurityStatus } from '@/components/auth/security-status';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [showSecurityDemo, setShowSecurityDemo] = useState(false);

  const securityFeatures = [
    {
      icon: Shield,
      title: 'Multi-Factor Authentication',
      description: 'TOTP-based 2FA with backup codes',
      status: 'Active'
    },
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'AES-256-GCM for all sensitive data',
      status: 'Active'
    },
    {
      icon: Smartphone,
      title: 'Session Security',
      description: 'JWT with rotation and binding',
      status: 'Active'
    },
    {
      icon: Key,
      title: 'CSRF Protection',
      description: 'Double-submit cookie pattern',
      status: 'Active'
    },
    {
      icon: Eye,
      title: 'Audit Logging',
      description: 'Comprehensive activity tracking',
      status: 'Active'
    },
    {
      icon: AlertTriangle,
      title: 'Rate Limiting',
      description: 'Redis-based protection',
      status: 'Active'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Healthcare Security Portal</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Secure authentication with enterprise-grade security features
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge variant="outline" className="text-green-600 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                HIPAA Compliant
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                SOC 2 Ready
              </Badge>
              <Badge variant="outline" className="text-purple-600 border-purple-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Enterprise Grade
              </Badge>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Authentication Forms */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="mt-6">
                  <EnhancedLoginForm 
                    onSuccess={(user) => {
                      console.log('Login successful:', user);
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="signup" className="mt-6">
                  <EnhancedSignupForm 
                    onSuccess={(user) => {
                      console.log('Signup successful:', user);
                    }}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Security Features Panel */}
            <div className="space-y-6">
              {/* Security Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Security Overview
                  </CardTitle>
                  <CardDescription>
                    Your data is protected with industry-leading security measures
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

              {/* Security Demo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Security Demo
                  </CardTitle>
                  <CardDescription>
                    See our security features in action
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => setShowSecurityDemo(!showSecurityDemo)}
                    >
                      <span>View Security Status</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    
                    {showSecurityDemo && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium text-sm mb-2">Live Security Status</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span>CSRF Protection</span>
                            <Badge variant="default" className="text-xs">Active</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Rate Limiting</span>
                            <Badge variant="default" className="text-xs">Active</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Session Security</span>
                            <Badge variant="default" className="text-xs">Active</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Audit Logging</span>
                            <Badge variant="default" className="text-xs">Active</Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Security Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Security Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Use a strong, unique password</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Enable two-factor authentication</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Keep your backup codes safe</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Log out from shared devices</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Report suspicious activity</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>
              Protected by enterprise-grade security • HIPAA Compliant • 
              <a href="#" className="text-primary hover:underline ml-1">Privacy Policy</a> • 
              <a href="#" className="text-primary hover:underline ml-1">Terms of Service</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}




