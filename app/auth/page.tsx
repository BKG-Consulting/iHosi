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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">iHosi</h1>
          <p className="text-slate-600">Healthcare Management System</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Navigation */}
            <div className="border-b border-slate-100 bg-slate-50/50">
              <TabsList className="w-full grid grid-cols-2 h-12 bg-transparent p-0">
                <TabsTrigger 
                  value="login" 
                  className="rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Tab Content */}
            <TabsContent value="login" className="m-0">
              <EnhancedLoginForm 
                onSuccess={(user) => {
                  console.log('Login successful:', user);
                }}
              />
            </TabsContent>
            
            <TabsContent value="signup" className="m-0">
              <EnhancedSignupForm 
                onSuccess={(user) => {
                  console.log('Signup successful:', user);
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-4 text-xs text-slate-500 mb-4">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Encrypted</span>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            <a href="#" className="text-blue-600 hover:text-blue-700 underline-offset-2 hover:underline">
              Privacy Policy
            </a>
            {' • '}
            <a href="#" className="text-blue-600 hover:text-blue-700 underline-offset-2 hover:underline">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}




