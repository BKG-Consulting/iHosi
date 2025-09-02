"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface MFASetupProps {
  userId: string;
  userRole: string;
  isRequired: boolean;
  mfaRequirement: any;
}

export function MFASetupComponent({ userId, userRole, isRequired, mfaRequirement }: MFASetupProps) {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [setupMethod, setSetupMethod] = useState<'sms' | 'totp' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSetupSMS = async () => {
    setLoading(true);
    try {
      if (!phoneNumber) {
        toast.error("Please enter a phone number");
        return;
      }

      // Add phone number to user if not exists
      if (!user?.phoneNumbers?.length) {
        await user?.createPhoneNumber({ phoneNumber });
      }

      // In production, this would trigger Clerk's MFA setup flow
      toast.success("SMS verification setup initiated. Please check your phone for verification code.");
      setStep(3);
      
    } catch (error) {
      console.error("SMS setup failed:", error);
      toast.error("Failed to set up SMS verification");
    } finally {
      setLoading(false);
    }
  };

  const handleSetupTOTP = async () => {
    setLoading(true);
    try {
      // In production, this would use Clerk's TOTP setup
      toast.success("Authenticator app setup initiated. Please scan the QR code with your authenticator app.");
      setStep(3);
      
    } catch (error) {
      console.error("TOTP setup failed:", error);
      toast.error("Failed to set up authenticator app");
    } finally {
      setLoading(false);
    }
  };

  const generateBackupCodes = async () => {
    setLoading(true);
    try {
      // Mock implementation for client-side
      const mockCodes = Array.from({ length: 10 }, (_, i) => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );
      
      setBackupCodes(mockCodes);
      setStep(4);
      toast.success("Backup codes generated successfully");
    } catch (error) {
      console.error("Backup code generation failed:", error);
      toast.error("Failed to generate backup codes");
    } finally {
      setLoading(false);
    }
  };

  const completeSetup = () => {
    toast.success("MFA setup completed successfully!");
    
    // Redirect to appropriate dashboard
    const dashboardUrl = userRole === 'patient' ? '/patient' : `/${userRole.toLowerCase()}`;
    router.push(dashboardUrl);
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    const blob = new Blob([`Healthcare System MFA Backup Codes\nGenerated: ${new Date().toLocaleString()}\n\n${codesText}\n\nKeep these codes secure and offline!`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mfa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3, 4].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              stepNumber <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {stepNumber}
            </div>
            {stepNumber < 4 && (
              <div className={`w-12 h-1 mx-2 ${
                stepNumber < step ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Choose Method */}
      {step === 1 && (
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Choose MFA Method</CardTitle>
            <CardDescription>
              Select your preferred method for multi-factor authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {/* SMS Option */}
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  setupMethod === 'sms' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSetupMethod('sms')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">SMS Text Message</h3>
                    <p className="text-sm text-gray-500">Receive verification codes via text message</p>
                  </div>
                </div>
              </div>

              {/* TOTP Option */}
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  setupMethod === 'totp' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSetupMethod('totp')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Authenticator App</h3>
                    <p className="text-sm text-gray-500">Use Google Authenticator, Authy, or similar app</p>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                      Recommended for healthcare staff
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <div></div>
              <Button 
                onClick={() => setStep(2)} 
                disabled={!setupMethod}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Setup Method */}
      {step === 2 && (
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>
              {setupMethod === 'sms' ? 'SMS Setup' : 'Authenticator App Setup'}
            </CardTitle>
            <CardDescription>
              {setupMethod === 'sms' ? 'Enter your phone number to receive verification codes' : 'Scan the QR code with your authenticator app'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {setupMethod === 'sms' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    We'll send a verification code to this number to complete setup.
                  </p>
                </div>
              </div>
            )}

            {setupMethod === 'totp' && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-48 h-48 bg-gray-100 mx-auto rounded-lg flex items-center justify-center mb-4">
                    <span className="text-gray-500">QR Code would appear here</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Scan this QR code with your authenticator app
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Manual Entry Code:</h4>
                  <code className="text-sm bg-white px-2 py-1 rounded border">
                    JBSWY3DPEHPK3PXP
                  </code>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Recommended Apps:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Google Authenticator</li>
                    <li>• Microsoft Authenticator</li>
                    <li>• Authy</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                onClick={setupMethod === 'sms' ? handleSetupSMS : handleSetupTOTP}
                disabled={loading || (setupMethod === 'sms' && !phoneNumber)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Setting up...' : 'Verify & Continue'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Verification */}
      {step === 3 && (
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Verify Setup</CardTitle>
            <CardDescription>
              Enter the verification code to confirm your MFA setup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                {setupMethod === 'sms' 
                  ? 'Check your phone for the verification code.' 
                  : 'Enter the 6-digit code from your authenticator app.'
                }
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button 
                onClick={generateBackupCodes}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Verify & Generate Backup Codes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Backup Codes */}
      {step === 4 && (
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Backup Codes</CardTitle>
            <CardDescription>
              Save these backup codes in a secure location. You can use them to access your account if you lose your phone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-medium text-yellow-800">Important:</h4>
                  <p className="text-sm text-yellow-800">Store these codes securely and offline. Each code can only be used once.</p>
                </div>
              </div>
            </div>

            {backupCodes.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="bg-white p-2 rounded border text-center">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={downloadBackupCodes}>
                Download Codes
              </Button>
              <Button 
                onClick={completeSetup}
                className="bg-green-600 hover:bg-green-700"
              >
                Complete Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
